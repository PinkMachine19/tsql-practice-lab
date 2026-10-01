-- T-SQL Practice Lab | Lesson 32: Capstone: outstanding balances
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

;WITH ItemTotals AS (
 SELECT OrderID,SUM(Quantity * UnitPrice) AS Total FROM lab.OrderItems GROUP BY OrderID
), Paid AS (
 SELECT OrderID,SUM(Amount) AS Paid FROM lab.Payments GROUP BY OrderID
), PerOrder AS (
 SELECT o.CustomerID,i.Total,COALESCE(p.Paid,0) AS Paid
 FROM lab.Orders AS o JOIN ItemTotals AS i ON i.OrderID = o.OrderID
 LEFT JOIN Paid AS p ON p.OrderID = o.OrderID WHERE o.Status <> 'Cancelled'
)
SELECT c.CustomerID,c.CustomerName,COALESCE(SUM(o.Total),0) AS Sales,
 COALESCE(SUM(o.Paid),0) AS Paid,
 COALESCE(SUM(o.Total-o.Paid),0) AS Outstanding
FROM lab.Customers AS c LEFT JOIN PerOrder AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName ORDER BY c.CustomerID;
