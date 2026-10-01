// Public crosswalk derived from question topics in the supplied survival sheet.
// The private source URL and personal annotations are intentionally not included.
const counts=`SELECT c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY c.CustomerID;`;
const missing=`SELECT c.CustomerID,c.CustomerName
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
WHERE o.OrderID IS NULL
ORDER BY c.CustomerID;`;
const itemTotals=`SELECT o.OrderID,SUM(i.Quantity * i.UnitPrice) AS OrderValue
FROM lab.Orders AS o
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY o.OrderID
ORDER BY o.OrderID;`;
const drill=(number,title,lessons,pattern,note,sql,expected)=>({number,id:`q${number}`,title,lessons:lessons.map(n=>String(n).padStart(2,'0')),pattern,note,sql,expected});
export const interview = [
 drill(1,'Count orders for every customer',[8,11],'LEFT JOIN · COUNT · GROUP BY',
  'Direct match to lesson 08. Keep zero-order customers and count the nullable child key, not COUNT(*). Q7 repeats this pattern.',counts,
  'Ada 2, Ben 2, Cora 1, Dev 1, Emi 0.'),
 drill(2,'Orders with customer name and order date',[7],'INNER JOIN',
  'Lesson 07 teaches the join; this drill adds the requested OrderDate projection. One output row represents one order.',
  `SELECT o.OrderID,o.OrderDate,c.CustomerName
FROM lab.Orders AS o JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
ORDER BY o.OrderID;`,
  'Six rows, order IDs 101–106. Ada has 101/102; Ben has 103/105; Cora has 104; Dev has 106.'),
 drill(3,'Order lines with product, quantity, and unit price',[2,4,7],'Detail-table join',
  'OrderItems is the lab equivalent of OrderLines; Products corresponds to StockItems. Use the historical line UnitPrice, not the current catalogue price.',
  `SELECT i.OrderID,p.ProductName,i.Quantity,i.UnitPrice
FROM lab.OrderItems AS i JOIN lab.Products AS p ON p.ProductID = i.ProductID
ORDER BY i.OrderID,i.ProductID;`,
  'Nine rows. Order 101 contains Keyboard × 1 at 80 and Mouse × 2 at 25.'),
 drill(4,'Customers who have never ordered',[8,9],'LEFT JOIN … IS NULL',
  'Lesson 09 uses NOT EXISTS for the same requirement. This drill practices the sheet’s left-join anti-match. Q12 repeats it.',missing,
  'Only customer 5, Emi.'),
 drill(5,'Preserve orders when customer data is missing',[8,23],'Preserved left side · foreign keys',
  'The trusted foreign key prevents orphan orders in the seeded tables. The first query therefore has six matches. A separate VALUES-based staging example demonstrates missing customer data without weakening the foreign key.',
  `SELECT o.OrderID,o.OrderDate,c.CustomerName
FROM lab.Orders AS o LEFT JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
ORDER BY o.OrderID;
-- Simulate imported rows without altering the constrained tables.
SELECT incoming.OrderID,c.CustomerName
FROM (VALUES (901,1),(902,999)) AS incoming(OrderID,CustomerID)
LEFT JOIN lab.Customers AS c ON c.CustomerID = incoming.CustomerID
ORDER BY incoming.OrderID;`,
  'First result: six real orders. Second result: 901 / Ada and 902 / NULL. Both staging rows survive.'),
 drill(6,'Total value per order',[11,13],'Order-grain SUM',
  'Aggregate Quantity × UnitPrice once per OrderID. A header-to-lines join alone does not inflate line totals; fan-out from an additional many-side relation can.',itemTotals,
  '101: 130; 102: 200; 103: 55; 104: 80; 105: 410; 106: 20.'),
 drill(7,'Count orders per customer again',[8,11],'Repeat of Q1',
  'Same core query as Q1. Use this repetition to explain why COUNT(OrderID) returns zero for Emi.',counts,
  'Five customer rows with counts 2,2,1,1,0.'),
 drill(8,'Top five customers by order count',[5,8,11],'Aggregate → sort → TOP',
  'The sheet uses an INNER JOIN, so zero-order customers are excluded. Only four customers qualify in this small dataset. CustomerID breaks count ties deterministically.',
  `SELECT TOP (5) c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY OrderCount DESC,c.CustomerID;`,
  'Ada 2, Ben 2, Cora 1, Dev 1. TOP (5) does not invent a fifth row.'),
 drill(9,'Customers with more than five orders',[11],'HAVING COUNT',
  'The original threshold is preserved. The tiny dataset has no qualifying customer; change @MinimumOrders from 5 to 1 for a second run that returns Ada and Ben.',
  `DECLARE @MinimumOrders int = 5;
SELECT c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
HAVING COUNT(o.OrderID) > @MinimumOrders
ORDER BY c.CustomerID;`,
  'At 5: zero rows, correctly. At 1: Ada and Ben, each with 2 orders.'),
 drill(10,'Latest order date for each customer',[11,14],'MAX versus latest whole row',
  'MAX gives a date; it does not return the rest of that order row. This drill follows the sheet’s INNER JOIN and excludes Emi. Lesson 14 shows how OUTER APPLY keeps Emi while selecting a whole latest order.',
  `SELECT c.CustomerID,c.CustomerName,MAX(o.OrderDate) AS LatestOrderDate
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName ORDER BY c.CustomerID;`,
  'Ada 2026-02-01; Ben 2026-03-01; Cora 2026-02-20; Dev 2026-03-05.'),
 drill(11,'Orders with customer name and total value',[7,11,13],'Three-table join · order grain',
  'Group at order grain, not just customer grain. A window SUM is another way to retain detail rows, so “SUM always requires GROUP BY” would be too broad a rule.',
  `SELECT o.OrderID,c.CustomerID,c.CustomerName,SUM(i.Quantity * i.UnitPrice) AS OrderValue
FROM lab.Orders AS o JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY o.OrderID,c.CustomerID,c.CustomerName ORDER BY o.OrderID;`,
  'Six order rows, with totals 130,200,55,80,410,20; customer names remain attached to each order.'),
 drill(12,'Customers who have never ordered again',[8,9],'Repeat of Q4',
  'No GROUP BY is needed for this anti-match. Compare its result to NOT EXISTS in lesson 09.',missing,
  'Only Emi, customer 5.'),
 drill(13,'Top three customers by total order value',[5,7,11],'Customer-grain SUM · TOP',
  'This reproduces the sheet’s gross-value rule: cancelled orders are included. The capstone deliberately uses a different rule and excludes them. State the business rule before comparing totals.',
  `SELECT TOP (3) c.CustomerID,c.CustomerName,SUM(i.Quantity * i.UnitPrice) AS TotalValue
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY TotalValue DESC,c.CustomerID;`,
  'Ben 465, Ada 330, Cora 80, in that order.'),
 drill(14,'Orders placed in the last 30 days',[6,30],'DATEADD · bounded time window',
  'A fixed @AsOf makes practice repeatable on the historical seed. The interval here is [@AsOf minus 30 days, @AsOf), excluding future rows. For a live UTC timestamp window, use SYSUTCDATETIME(); clarify calendar-day versus elapsed-time semantics.',
  `DECLARE @AsOf datetime2(0) = '20260310';
SELECT OrderID,OrderDate,CustomerID FROM lab.Orders
WHERE OrderDate >= DATEADD(day,-30,@AsOf) AND OrderDate < @AsOf
ORDER BY OrderID;`,
  'Window 2026-02-08 through before 2026-03-10: orders 103,104,105,106.'),
 drill(15,'Average number of orders across customers',[3,8,13],'Count first → average second',
  'Include zero-order customers: 6 orders / 5 customers = 1.2. Excluding Emi would yield 1.5. Convert before AVG to avoid integer truncation. This focused drill supplies the multi-stage averaging example.',
  `;WITH Counts AS (
 SELECT c.CustomerID,COUNT(o.OrderID) AS OrderCount
 FROM lab.Customers AS c LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
 GROUP BY c.CustomerID
)
SELECT AVG(CAST(OrderCount AS decimal(10,2))) AS AvgOrdersPerCustomer FROM Counts;`,
  'AvgOrdersPerCustomer = 1.2, including Emi’s zero.'),
 drill(16,'Label customers High Value or Normal',[11,12,13],'CASE on an aggregate',
  'The requested threshold of 10,000 is preserved, so everyone is Normal here. Set it to 300 for both labels. Unlike the sheet’s inner joins, these left joins fulfill “each customer” by including Emi with zero; CASE labels rather than filters.',
  `DECLARE @HighValue decimal(12,2) = 10000;
SELECT c.CustomerID,c.CustomerName,COALESCE(SUM(i.Quantity * i.UnitPrice),0) AS TotalValue,
 CASE WHEN COALESCE(SUM(i.Quantity * i.UnitPrice),0) > @HighValue
 THEN N'High Value' ELSE N'Normal' END AS CustomerTier
FROM lab.Customers AS c LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
LEFT JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY c.CustomerID,c.CustomerName ORDER BY c.CustomerID;`,
  'At 10,000: all five Normal; totals 330,465,80,20,0. At 300: Ada and Ben High Value; the other three Normal.'),
 drill(17,'Find customers sharing an email address',[11,15],'GROUP BY · HAVING COUNT > 1',
  'The lab has no People/email table. A self-contained VALUES fixture gives a repeatable duplicate example without changing setup. Ignore NULL here. Shared email or shared primary contact is evidence to investigate, not proof that two customer records are the same entity.',
  `;WITH Contacts AS (
 SELECT * FROM (VALUES
  (1,N'ada@example.test'),(2,N'shared@example.test'),(3,N'shared@example.test'),
  (4,CAST(NULL AS nvarchar(80))),(5,N'emi@example.test')
 ) AS v(CustomerID,EmailAddress)
)
SELECT EmailAddress,COUNT(*) AS CustomerRows FROM Contacts
WHERE EmailAddress IS NOT NULL GROUP BY EmailAddress
HAVING COUNT(*) > 1 ORDER BY EmailAddress;`,
  'shared@example.test with CustomerRows = 2. The missing email is excluded.'),
 drill(18,'Second-highest order value per customer',[13,15,16],'Aggregate → partition → DENSE_RANK',
  'Interpret “second highest” as second distinct value. First aggregate each order; then rank within each customer. DENSE_RANK preserves ties. For exactly one second order instead, use ROW_NUMBER with a deterministic OrderID tie-breaker and state the changed requirement.',
  `;WITH Totals AS (
 SELECT o.CustomerID,o.OrderID,SUM(i.Quantity * i.UnitPrice) AS OrderValue
 FROM lab.Orders AS o JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
 GROUP BY o.CustomerID,o.OrderID
), Ranked AS (
 SELECT CustomerID,OrderID,OrderValue,
 DENSE_RANK() OVER(PARTITION BY CustomerID ORDER BY OrderValue DESC) AS ValueRank
 FROM Totals
)
SELECT CustomerID,OrderID,OrderValue FROM Ranked WHERE ValueRank = 2
ORDER BY CustomerID,OrderID;`,
  'Customer 1: order 101, value 130. Customer 2: order 103, value 55. Customers without a second distinct value have no result.'),
 drill(19,'Customers without an order in the last 30 days',[6,9],'NOT EXISTS over a date range',
  'Use the same fixed clock as Q14. Customers with no orders qualify too. MAX can also solve this if NULL is handled correctly, but a plain MAX(date) < boundary predicate misses never-ordering customers.',
  `DECLARE @AsOf datetime2(0) = '20260310';
SELECT c.CustomerID,c.CustomerName FROM lab.Customers AS c
WHERE NOT EXISTS (
 SELECT 1 FROM lab.Orders AS o WHERE o.CustomerID = c.CustomerID
 AND o.OrderDate >= DATEADD(day,-30,@AsOf) AND o.OrderDate < @AsOf
)
ORDER BY c.CustomerID;`,
  'Ada (last order February 1) and Emi (no orders).'),
 drill(20,'Diagnose and repair inflated totals',[2,10,13,32],'Reproduce fan-out → preaggregate',
  'Run the broken query first and inspect its four joined rows mentally: two lines × two payments. The corrected query produces one row per order on each side. SUM(DISTINCT amount) would wrongly merge separate equal-valued transactions.',
  `-- Deliberately WRONG: each order line matches each payment.
SELECT i.OrderID,COUNT(*) AS JoinedRows,
 SUM(i.Quantity * i.UnitPrice) AS InflatedTotal,SUM(p.Amount) AS InflatedPaid
FROM lab.OrderItems AS i JOIN lab.Payments AS p ON p.OrderID = i.OrderID
WHERE i.OrderID = 103 GROUP BY i.OrderID;
-- Correct: independently reduce both relations to order grain.
;WITH Totals AS (
 SELECT OrderID,SUM(Quantity * UnitPrice) AS Total FROM lab.OrderItems GROUP BY OrderID
), Paid AS (
 SELECT OrderID,SUM(Amount) AS Paid FROM lab.Payments GROUP BY OrderID
)
SELECT t.OrderID,t.Total,COALESCE(p.Paid,0) AS Paid FROM Totals AS t
LEFT JOIN Paid AS p ON p.OrderID = t.OrderID WHERE t.OrderID = 103;`,
  'Broken: OrderID 103, JoinedRows 4, InflatedTotal 110, InflatedPaid 110. Correct: Total 55, Paid 55.'),
 drill(21,'Explain WHERE versus HAVING',[4,11],'Row filter → grouping → group filter',
  'This combined example makes the stages visible: remove orders before February, group the remaining rows per customer, then keep customers with more than one remaining order. Logical clause processing explains alias scope; it is not a promise about physical operator execution order.',
  `SELECT CustomerID,COUNT(*) AS OrderCount FROM lab.Orders
WHERE OrderDate >= '20260201'
GROUP BY CustomerID
HAVING COUNT(*) > 1
ORDER BY CustomerID;`,
  'Only customer 2 (Ben), with 2 orders. Ada has only one after the WHERE filter.')
];
