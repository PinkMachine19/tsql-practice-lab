export const groups = ['Get connected', 'Read and combine rows', 'Reason across sets', 'Build database objects', 'Change data safely', 'Measure and apply'];
const q = (prompt, options, answer, explanation) => ({prompt, options, answer, explanation});
const s = (group, title, concept, task, prediction, sql, expected, questions) => ({group,title,concept,task,prediction,sql,expected,questions});
export const lessons = [
 s(0,'Connect with SSMS',
  'SSMS is a client; Azure SQL Database runs the queries. A logical server supplies the endpoint and authentication boundary. Connect directly to InterviewLab with Microsoft Entra MFA. GO separates batches in SSMS; it is not a T-SQL statement.',
  'Connect to your database, confirm its name, then run the setup and verification downloads. Never run practice scripts in master.',
  'Which database name should the query return?',
  `SELECT DB_NAME() AS DatabaseName, SUSER_SNAME() AS SignedInAs;
SELECT SERVERPROPERTY('EngineEdition') AS EngineEdition;`,
  'DatabaseName is InterviewLab. Azure SQL Database returns EngineEdition 5. Your signed-in identity varies.',
  [q('Where does a SELECT execute?',['Inside SSMS','On the database service','In GitHub Pages'],1,'SSMS sends the batch to the database engine.'),q('What does GO do?',['Commits a transaction','Changes databases','Separates client-side batches'],2,'SSMS recognizes GO; the engine does not execute it as T-SQL.')]),
 s(0,'Read the sample schema',
  'One customer has many orders. An order has many items and payments. OrderItems connects orders to products. State the grain before joining: one OrderItems row is one product on one order, not one complete order.',
  'Inspect the columns and identify the foreign-key paths from Customers to Products and Payments.',
  'How many OrderItems rows are present?',
  `SELECT t.name AS TableName, c.name AS ColumnName, ty.name AS DataType
FROM sys.tables AS t
JOIN sys.columns AS c ON c.object_id = t.object_id
JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
WHERE t.schema_id = SCHEMA_ID(N'lab')
ORDER BY t.name, c.column_id;
SELECT COUNT(*) AS ItemRows FROM lab.OrderItems;`,
  'ItemRows = 9. There are six base tables including the initially empty OrderAudit.',
  [q('What identifies an order line?',['CustomerID','OrderID and ProductID','ProductName'],1,'The composite primary key prevents the same product appearing twice on one order.'),q('How do products relate to orders?',['Many-to-many through OrderItems','Every product has one order','They have no relationship'],0,'OrderItems stores each order/product association and its quantity.')]),
 s(0,'Types, conversions, and NULL',
  'Use decimal for exact money arithmetic, nvarchar for Unicode, and datetime2 for dates with time. NULL means missing or unknown. Compare it with IS NULL. Integer division truncates; convert before dividing. rowversion is a changing binary token, not a date.',
  'Find the customer with no city and compare integer division with decimal division.',
  'Will 5 / 2 return 2 or 2.5?',
  `SELECT CustomerID, CustomerName FROM lab.Customers WHERE City IS NULL;
SELECT 5 / 2 AS IntegerResult, CAST(5 AS decimal(10,2)) / 2 AS DecimalResult;`,
  'Cora (3) has no city. IntegerResult = 2; DecimalResult = 2.5.',
  [q('Which predicate finds missing cities?',['City = NULL','City IS NULL','City = N\'NULL\''],1,'Equality with NULL evaluates to unknown, not true.'),q('Which type stores an exact unit price?',['float','rowversion','decimal(10,2)'],2,'decimal stores fixed precision and scale without floating-point approximation.')]),
 s(1,'Filter and project',
  'SELECT chooses columns; WHERE chooses rows. Use parentheses when combining AND and OR. String comparison case sensitivity depends on the column or database collation.',
  'Return the IDs and names of Boston customers in ascending ID order.',
  'How many rows survive the city filter?',
  `SELECT CustomerID, CustomerName
FROM lab.Customers
WHERE City = N'Boston'
ORDER BY CustomerID;`,
  'Two rows: 1 Ada and 4 Dev.',
  [q('Which clause filters individual rows?',['WHERE','HAVING','ORDER BY'],0,'WHERE filters rows before aggregation.'),q('Does SELECT guarantee insertion order?',['Yes','Only with a primary key','No; use ORDER BY'],2,'A result has no guaranteed order without ORDER BY.')]),
 s(1,'TOP and stable pagination',
  'T-SQL uses TOP for a first set of rows and ORDER BY with OFFSET/FETCH for pages. Include a unique tie-breaker so equally dated rows have stable positions. Concurrent changes can still shift pages; keyset pagination is useful for changing data.',
  'Return the two newest orders, then the next two.',
  'Which order IDs belong to the first page?',
  `SELECT TOP (2) OrderID, OrderDate FROM lab.Orders
ORDER BY OrderDate DESC, OrderID DESC;
SELECT OrderID, OrderDate FROM lab.Orders
ORDER BY OrderDate DESC, OrderID DESC
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;`,
  'First page: 106, 105. Second page: 104, 103.',
  [q('What makes TOP deterministic?',['A useful index alone','ORDER BY with a unique tie-breaker','A small table'],1,'Ordering resolves both the sorting rule and tied positions.'),q('Which syntax pages T-SQL rows?',['LIMIT 2 OFFSET 2','FETCH 2 without ordering','ORDER BY … OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY'],2,'OFFSET/FETCH is part of ORDER BY in T-SQL.')]),
 s(1,'Date ranges without surprises',
  'Use half-open time ranges: include the start and exclude the next boundary. This works regardless of fractional-second precision. DATEADD computes a boundary without wrapping the stored column in a function.',
  'Find all February 2026 orders using a start date and an exclusive end date.',
  'Does March 1 belong in the result?',
  `DECLARE @Start date = '20260201';
SELECT OrderID, OrderDate FROM lab.Orders
WHERE OrderDate >= @Start AND OrderDate < DATEADD(month, 1, @Start)
ORDER BY OrderID;`,
  'Orders 102, 103, 104. March 1 is excluded.',
  [q('Why avoid an end timestamp of 23:59:59?',['It is always invalid','Later fractional seconds may be excluded','It selects next month'],1,'A next-day exclusive boundary includes all supported time precision.'),q('Which predicate keeps the column unwrapped?',['MONTH(OrderDate) = 2','YEAR(OrderDate) = 2026','OrderDate >= @Start'],2,'An unwrapped range predicate can support an index seek.')]),
 s(1,'Join related rows',
  'INNER JOIN returns matching combinations. Join on keys that express the relationship, not on names that merely look alike. One customer can repeat because the result grain is one order.',
  'List every order with its customer name.',
  'Will Ada appear once or twice?',
  `SELECT o.OrderID, c.CustomerName
FROM lab.Orders AS o
JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
ORDER BY o.OrderID;`,
  'Six rows. Ada appears for 101 and 102; Ben for 103 and 105; Cora for 104; Dev for 106.',
  [q('What is the result grain here?',['One customer','One order','One payment'],1,'Each order joins to its single customer.'),q('Why can Ada appear twice?',['A corrupt primary key','An accidental cross join','She owns two orders'],2,'Repeating parent attributes is expected at child grain.')]),
 s(1,'Keep missing matches',
  'LEFT JOIN preserves the left relation. COUNT(*) counts a preserved row even when no child exists; COUNT(child key) counts only matched children. A right-side filter in WHERE can remove unmatched rows.',
  'Count orders for every customer, including customers with zero orders.',
  'What count should Emi receive?',
  `SELECT c.CustomerID, c.CustomerName, COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.CustomerName
ORDER BY c.CustomerID;`,
  'Counts by customer ID: 2, 2, 1, 1, 0.',
  [q('Which count returns zero for an unmatched customer?',['COUNT(*)','COUNT(o.OrderID)','COUNT(c.CustomerID)'],1,'The unmatched right-side key is NULL and COUNT(column) skips it.'),q('Where can a child filter preserve all customers?',['In the ON condition','Only in WHERE','Only in ORDER BY'],0,'A filter in ON limits matches while retaining unmatched left rows.')]),
 s(1,'Find absence with NOT EXISTS',
  'NOT EXISTS asks whether no related row satisfies a condition. It avoids multiplying the outer rows. NOT IN is harder to reason about when its subquery can return NULL.',
  'Find customers with no orders of any status.',
  'Does a cancelled order count as an existing order?',
  `SELECT c.CustomerID, c.CustomerName FROM lab.Customers AS c
WHERE NOT EXISTS (SELECT 1 FROM lab.Orders AS o WHERE o.CustomerID = c.CustomerID)
ORDER BY c.CustomerID;`,
  'Only 5 Emi. Cora has a cancelled order, so she is not absent.',
  [q('Which customer has no orders?',['Cora','Emi','Dev'],1,'Cora has order 104; Emi has no related row.'),q('Does SELECT 1 mean EXISTS counts one row?',['Yes','It limits the query to one row','No; it tests whether any row exists'],2,'EXISTS tests existence, not the projected value.')]),
 s(2,'Prevent join multiplication',
  'Joining two one-to-many children through their parent creates every matching child combination. Aggregate each child to one row per parent before joining. DISTINCT is not a general repair for inflated totals.',
  'Calculate order 103’s line total and payments without duplicating either measure.',
  'What happens if its two lines join directly to its two payments?',
  `;WITH ItemTotals AS (
 SELECT OrderID, SUM(Quantity * UnitPrice) AS Total FROM lab.OrderItems GROUP BY OrderID
), Paid AS (
 SELECT OrderID, SUM(Amount) AS Paid FROM lab.Payments GROUP BY OrderID
)
SELECT i.OrderID, i.Total, COALESCE(p.Paid, 0) AS Paid
FROM ItemTotals AS i LEFT JOIN Paid AS p ON p.OrderID = i.OrderID
WHERE i.OrderID = 103;`,
  'Order 103: Total = 55.00, Paid = 55.00. A direct child-to-child join yields four rows.',
  [q('Two lines joined to two payments produce how many rows?',['2','3','4'],2,'Each line matches both payments: 2 × 2.'),q('What fixes the grain?',['SUM(DISTINCT Amount) in every case','Aggregate each child per order first','Remove the join condition'],1,'Preaggregation produces one row per order on both sides.')]),
 s(2,'Group and filter totals',
  'GROUP BY changes result grain. WHERE filters source rows; HAVING filters groups. Group on the actual customer key as well as its display name so namesakes remain distinct.',
  'Find customers whose gross order-line total is greater than 300, including all order statuses.',
  'Do Ada and Ben qualify?',
  `SELECT c.CustomerID, c.CustomerName, SUM(i.Quantity * i.UnitPrice) AS GrossTotal
FROM lab.Customers AS c
JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY c.CustomerID, c.CustomerName
HAVING SUM(i.Quantity * i.UnitPrice) > 300
ORDER BY c.CustomerID;`,
  'Ada = 330.00; Ben = 465.00.',
  [q('Which clause filters a SUM result?',['WHERE','HAVING','ON'],1,'HAVING is evaluated for grouped results.'),q('Why group by CustomerID too?',['Names may not be unique','It always makes SQL faster','Names cannot be grouped'],0,'CustomerID defines the customer even when names repeat.')]),
 s(2,'Conditional aggregation',
  'CASE selects a value per row. Aggregating that value creates several measures from one input. ELSE 0 makes nonmatching rows contribute zero; without it, CASE returns NULL for those rows.',
  'Count pending, shipped, and cancelled orders in one result row.',
  'Should the three counts sum to six?',
  `SELECT SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS Pending,
 SUM(CASE WHEN Status = 'Shipped' THEN 1 ELSE 0 END) AS Shipped,
 SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled
FROM lab.Orders;`,
  'Pending = 2; Shipped = 3; Cancelled = 1.',
  [q('What does CASE return when no WHEN matches and no ELSE exists?',['0','NULL','An error'],1,'The implicit ELSE value is NULL.'),q('What grain does this aggregate return?',['One order','One status','One summary row'],2,'There is no GROUP BY, so the full input is one group.')]),
 s(2,'CTEs as named steps',
  'A common table expression names a query for the next statement. It improves decomposition but does not promise materialization, caching, or a particular execution plan. A leading semicolon terminates any preceding statement.',
  'Compute each order total, then keep totals of at least 100.',
  'Can you reference the CTE in a later unrelated statement?',
  `;WITH Totals AS (
 SELECT OrderID, SUM(Quantity * UnitPrice) AS Total
 FROM lab.OrderItems GROUP BY OrderID
)
SELECT OrderID, Total FROM Totals WHERE Total >= 100 ORDER BY OrderID;`,
  '101 = 130.00; 102 = 200.00; 105 = 410.00.',
  [q('How long is a CTE name in scope?',['For the connection','For the immediately following statement','Until DROP'],1,'A CTE is scoped to one statement.'),q('Does a CTE guarantee a stored intermediate result?',['Yes','Only with ORDER BY','No'],2,'The optimizer can expand the expression into the surrounding plan.')]),
 s(2,'Correlated queries and APPLY',
  'APPLY evaluates a table expression correlated to each left row. OUTER APPLY preserves a left row when the expression returns none; CROSS APPLY does not. TOP with an ordered tie-breaker selects one related row.',
  'Return each customer and their latest order, preserving Emi.',
  'What will Emi’s OrderID be?',
  `SELECT c.CustomerID, c.CustomerName, recent.OrderID
FROM lab.Customers AS c
OUTER APPLY (
 SELECT TOP (1) o.OrderID FROM lab.Orders AS o
 WHERE o.CustomerID = c.CustomerID ORDER BY o.OrderDate DESC, o.OrderID DESC
) AS recent
ORDER BY c.CustomerID;`,
  'Latest IDs by customer: 102, 105, 104, 106, NULL.',
  [q('Which APPLY preserves customers without orders?',['CROSS APPLY','OUTER APPLY','Both always do'],1,'OUTER APPLY adds a NULL-extended result when there is no match.'),q('Why order the TOP subquery?',['To define which order is latest','To create an index','To avoid NULL customers'],0,'TOP alone cannot identify a deterministic latest order.')]),
 s(2,'Window aggregates',
  'Window functions compute across related rows without collapsing them. PARTITION BY creates independent groups for the calculation. An aggregate without window ORDER BY uses the whole partition.',
  'Show each order alongside the number of orders owned by its customer.',
  'Will the result contain four customer rows or six order rows?',
  `SELECT OrderID, CustomerID,
 COUNT(*) OVER (PARTITION BY CustomerID) AS CustomerOrderCount
FROM lab.Orders ORDER BY OrderID;`,
  'Six rows. Orders 101,102,103,105 show 2; orders 104,106 show 1.',
  [q('Does a window COUNT collapse rows?',['Yes','No','Only for COUNT(*)'],1,'A window expression adds a value to each input row.'),q('What does PARTITION BY CustomerID define?',['The final display order','A filter','Independent calculation groups'],2,'Each customer gets a separate window partition.')]),
 s(2,'Ranking and ties',
  'ROW_NUMBER assigns unique positions. RANK gives ties the same rank and leaves gaps. DENSE_RANK gives tied values the same rank without gaps. Add a unique key to ROW_NUMBER ordering, but not to a value-based DENSE_RANK when you want ties.',
  'Compare all three ranking functions on deliberately tied scores.',
  'What ranks follow two scores of 100?',
  `SELECT PersonID, Score,
 ROW_NUMBER() OVER (ORDER BY Score DESC, PersonID) AS Position,
 RANK() OVER (ORDER BY Score DESC) AS RankWithGaps,
 DENSE_RANK() OVER (ORDER BY Score DESC) AS DensePosition
FROM (VALUES (1,100),(2,100),(3,80)) AS scores(PersonID,Score)
ORDER BY PersonID;`,
  'ROW_NUMBER: 1,2,3. RANK: 1,1,3. DENSE_RANK: 1,1,2.',
  [q('Which function finds a second distinct score?',['ROW_NUMBER','DENSE_RANK','COUNT'],1,'DENSE_RANK = 2 represents the second distinct ordered value.'),q('What rank follows a two-way tie for first with RANK?',['2','1','3'],2,'RANK leaves a gap for the other row occupying the tied position.')]),
 s(2,'Running totals and LAG',
  'An ordered window can calculate a running total or inspect a preceding row. Use an explicit ROWS frame for a row-by-row cumulative sum, and a unique tie-breaker for predictable ordering.',
  'Calculate cumulative payments and the preceding payment amount.',
  'Does the first payment have a preceding value?',
  `SELECT PaymentID, Amount,
 LAG(Amount) OVER (ORDER BY PaidAt, PaymentID) AS PreviousAmount,
 SUM(Amount) OVER (ORDER BY PaidAt, PaymentID ROWS UNBOUNDED PRECEDING) AS RunningPaid
FROM lab.Payments ORDER BY PaidAt, PaymentID;`,
  'RunningPaid: 130,160,185,205. PreviousAmount: NULL,130,30,25.',
  [q('What is LAG’s default for a missing preceding row?',['0','NULL','The current value'],1,'Without a supplied default, LAG returns NULL outside the partition.'),q('Which frame expresses cumulative rows?',['ROWS UNBOUNDED PRECEDING','ROWS CURRENT ROW only','An unordered partition only'],0,'It starts at the first row and ends at the current row.')]),
 s(2,'Set operations',
  'UNION removes duplicate rows; UNION ALL keeps them. EXCEPT returns distinct rows in the first query missing from the second. Inputs must have compatible columns in the same positions.',
  'Use EXCEPT to find customer IDs without orders, then compare UNION with UNION ALL.',
  'How many copies of 1 does UNION ALL keep?',
  `SELECT CustomerID FROM lab.Customers
EXCEPT SELECT CustomerID FROM lab.Orders;
SELECT 1 AS Value UNION SELECT 1;
SELECT 1 AS Value UNION ALL SELECT 1;`,
  'EXCEPT returns 5. UNION returns one row; UNION ALL returns two.',
  [q('Which operator retains duplicates?',['UNION','UNION ALL','EXCEPT'],1,'UNION ALL concatenates results without duplicate elimination.'),q('What does EXCEPT return?',['Distinct rows only in the left input','Every row from both inputs','Only matching rows'],0,'EXCEPT is a distinct set difference.')]),
 s(3,'Temp tables and table variables',
  'A local #temp table is scoped to the session, with additional procedure-scope rules. It can have indexes and statistics. A table variable has batch or procedure scope. Neither means all data stays in memory; both can use tempdb.',
  'Materialize order totals into a temp table, index it, and inspect it. Compare a small table variable.',
  'Can another SSMS connection read this local #temp table?',
  `DROP TABLE IF EXISTS #OrderTotals;
SELECT OrderID, SUM(Quantity * UnitPrice) AS Total INTO #OrderTotals
FROM lab.OrderItems GROUP BY OrderID;
CREATE UNIQUE CLUSTERED INDEX IX_TempTotals ON #OrderTotals(OrderID);
SELECT * FROM #OrderTotals WHERE Total > 100 ORDER BY OrderID;
DECLARE @Ids TABLE (ID int PRIMARY KEY);
INSERT @Ids VALUES (101),(102);
SELECT ID FROM @Ids ORDER BY ID;
DROP TABLE #OrderTotals;`,
  'Temp result: 101,102,105 with totals 130,200,410. Table variable: 101,102. Another session cannot access this #OrderTotals.',
  [q('Where can a local temp table be accessed?',['Any connection','Its owning session, subject to scope','Only GitHub'],1,'Local temporary tables are isolated between sessions.'),q('Are table variables guaranteed to stay entirely in memory?',['Yes','Only below 100 rows','No'],2,'They may use tempdb; choose based on measured workload behavior.')]),
 s(3,'Views',
  'A regular view stores a query definition, not a snapshot of results. Order the SELECT that reads the view. CREATE OR ALTER VIEW must begin its batch, so SSMS scripts use GO boundaries.',
  'Create an order-total view and query it for totals of at least 100.',
  'Would changed line items appear on the next read?',
  `CREATE OR ALTER VIEW lab.vOrderTotals AS
SELECT OrderID, SUM(Quantity * UnitPrice) AS Total
FROM lab.OrderItems GROUP BY OrderID;
GO
SELECT OrderID, Total FROM lab.vOrderTotals WHERE Total >= 100 ORDER BY OrderID;`,
  '101 = 130; 102 = 200; 105 = 410. The view reads current base data.',
  [q('What does an ordinary view store?',['A query definition','A frozen copy of the rows','A guaranteed row order'],0,'The engine executes the stored definition when the view is queried.'),q('Where should result ordering be specified?',['Only at view creation','In the SELECT reading the view','In the view name'],1,'The consuming query needs ORDER BY for a guaranteed order.')]),
 s(3,'Stored procedures and parameters',
  'A procedure packages statements behind named parameters. SET NOCOUNT ON suppresses row-count messages, not result sets. Parameters represent values; do not concatenate user input into SQL text.',
  'Create a procedure that returns orders for a supplied customer, then execute it for Ben.',
  'Does filtering for customer 2 return Cora’s cancelled order?',
  `CREATE OR ALTER PROCEDURE lab.GetCustomerOrders @CustomerID int
AS
BEGIN
 SET NOCOUNT ON;
 SELECT OrderID, OrderDate, Status FROM lab.Orders
 WHERE CustomerID = @CustomerID ORDER BY OrderID;
END;
GO
EXEC lab.GetCustomerOrders @CustomerID = 2;`,
  'Orders 103 and 105 only.',
  [q('What is @CustomerID?',['A parameter value','A table name','A string concatenation instruction'],0,'T-SQL procedure parameters carry typed input values.'),q('Does NOCOUNT ON suppress SELECT results?',['Yes','No','Only in Azure'],1,'It suppresses row-count messages while retaining selected result sets.')]),
 s(3,'Functions: scalar and table-valued',
  'A scalar function returns one value. An inline table-valued function returns a query result usable in FROM or APPLY. Functions have restrictions on side effects; use a procedure for a workflow that changes persistent data.',
  'Create a customer-order inline function and a scalar line-total function.',
  'Can the table-valued result be joined like a table expression?',
  `CREATE OR ALTER FUNCTION lab.CustomerOrders(@CustomerID int)
RETURNS TABLE AS RETURN
 SELECT OrderID, OrderDate, Status FROM lab.Orders WHERE CustomerID = @CustomerID;
GO
CREATE OR ALTER FUNCTION lab.LineTotal(@Qty int, @Price decimal(10,2))
RETURNS decimal(19,2) AS
BEGIN
 RETURN @Qty * @Price;
END;
GO
SELECT OrderID FROM lab.CustomerOrders(1) ORDER BY OrderID;
SELECT lab.LineTotal(3, 10.00) AS Total;`,
  'Order IDs 101 and 102; scalar Total = 30.00.',
  [q('What does an inline table-valued function return?',['One integer only','A query result relation','A stored procedure'],1,'It exposes a parameterized relational expression.'),q('Which object fits a data-changing workflow?',['A scalar function','An inline TVF','A stored procedure'],2,'T-SQL UDFs cannot modify persistent database state.')]),
 s(3,'Keys, IDENTITY, and constraints',
  'IDENTITY generates values but does not enforce uniqueness by itself; a key does that. CHECK enforces a predicate and NOT NULL rejects missing required values. Foreign keys enforce relationships. Identity sequences can contain gaps after rollback.',
  'Create a constrained demo table with an identity key and observe generated IDs. The final ROLLBACK removes the demo table.',
  'Does IDENTITY promise consecutive IDs without gaps?',
  `BEGIN TRANSACTION;
CREATE TABLE lab.ConstraintDemo (
 ID int IDENTITY(1,1) PRIMARY KEY,
 Code nvarchar(20) NOT NULL UNIQUE,
 Quantity int NOT NULL CHECK (Quantity > 0)
);
INSERT lab.ConstraintDemo(Code,Quantity) OUTPUT inserted.ID, inserted.Code
VALUES (N'A',1),(N'B',2);
ROLLBACK TRANSACTION;`,
  'Generated IDs 1 and 2 (output order is not guaranteed). ConstraintDemo is absent afterward.',
  [q('Does IDENTITY alone enforce uniqueness?',['Yes','No','Only in Azure'],1,'A PRIMARY KEY or UNIQUE constraint enforces uniqueness.'),q('Does CHECK (Quantity > 0) alone reject NULL?',['Yes','No; add NOT NULL','Only for negative values'],1,'CHECK rejects false; unknown passes. NOT NULL handles missing values.')]),
 s(4,'INSERT, UPDATE, DELETE, and OUTPUT',
  'Write explicit column lists. Filter updates and deletes deliberately. OUTPUT exposes affected rows through inserted and deleted. A transaction lets you inspect a practice change before rolling it back.',
  'Insert a practice customer, update its city, inspect both versions, and remove it inside a transaction.',
  'Will the practice customer remain after rollback?',
  `BEGIN TRANSACTION;
INSERT lab.Customers(CustomerID,CustomerName,City) VALUES (900,N'Practice',N'Boston');
UPDATE lab.Customers SET City = N'Austin'
OUTPUT deleted.City AS OldCity, inserted.City AS NewCity
WHERE CustomerID = 900;
DELETE FROM lab.Customers OUTPUT deleted.CustomerID WHERE CustomerID = 900;
ROLLBACK TRANSACTION;
SELECT COUNT(*) AS Remaining FROM lab.Customers WHERE CustomerID = 900;`,
  'OldCity Boston, NewCity Austin; deleted ID 900; Remaining = 0.',
  [q('Which OUTPUT image holds the previous value?',['inserted','deleted','previous'],1,'deleted contains the prior image for UPDATE or DELETE.'),q('What does a missing UPDATE WHERE do?',['Updates all qualifying table rows','Updates just the first row','Always produces a syntax error'],0,'Without a filter every row is targeted, subject to constraints and triggers.')]),
 s(4,'Transactions and error handling',
  'A transaction groups work atomically. TRY/CATCH handles execution errors; XACT_STATE reports whether a transaction exists and whether it can commit. With XACT_ABORT ON, some runtime errors make the transaction uncommittable. Roll back before continuing.',
  'Deliberately violate the product price constraint and verify the price remains unchanged.',
  'Will a price of -1 be stored?',
  `SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 UPDATE lab.Products SET UnitPrice = -1 WHERE ProductID = 1;
 COMMIT TRANSACTION;
END TRY
BEGIN CATCH
 IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
 SELECT ERROR_NUMBER() AS ErrorNumber, ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
SELECT UnitPrice FROM lab.Products WHERE ProductID = 1;`,
  'The expected constraint error is 547. UnitPrice remains 80.00. In application code, normally rethrow after cleanup instead of silently swallowing an error.',
  [q('What does XACT_STATE() = -1 mean?',['No transaction','An uncommittable transaction','A successful commit'],1,'The transaction can only be fully rolled back.'),q('Should an application silently swallow every database error?',['Yes','Only with XACT_ABORT','No; clean up and report or rethrow'],2,'Callers need to know the operation failed.')]),
 s(4,'Optimistic concurrency with rowversion',
  'Read a rowversion token with a row, then require the same token in UPDATE. A second update with a stale token affects zero rows. Check @@ROWCOUNT immediately, before another statement overwrites it.',
  'Update order 102 twice using the same original token, then roll back.',
  'How many rows should the second UPDATE affect?',
  `DECLARE @Original binary(8) = (SELECT Version FROM lab.Orders WHERE OrderID = 102);
BEGIN TRANSACTION;
UPDATE lab.Orders SET Status = 'Shipped' WHERE OrderID = 102 AND Version = @Original;
SELECT @@ROWCOUNT AS FirstUpdate;
UPDATE lab.Orders SET Status = 'Cancelled' WHERE OrderID = 102 AND Version = @Original;
SELECT @@ROWCOUNT AS StaleUpdate;
ROLLBACK TRANSACTION;`,
  'FirstUpdate = 1; StaleUpdate = 0. Status remains Pending after rollback. A token is not a timestamp.',
  [q('What does rowversion represent?',['A date and time','A changing binary version token','A customer ID'],1,'It changes when the row is updated; it does not encode wall-clock time.'),q('What should a zero-row optimistic update trigger in the application?',['Assume success','Retry blindly forever','Handle a conflict or missing row'],2,'The row may have changed or disappeared since it was read.')]),
 s(4,'Write a multi-row trigger',
  'A DML trigger runs once per statement, not once per row. inserted and deleted may contain many rows. Join them by the primary key and write a set-based audit. Trigger work participates in the caller’s transaction.',
  'Create an audit trigger, update two pending orders, inspect the two audit entries, and roll back.',
  'How many audit rows should one two-row UPDATE create?',
  `CREATE OR ALTER TRIGGER lab.trOrdersAudit ON lab.Orders AFTER UPDATE
AS
BEGIN
 SET NOCOUNT ON;
 INSERT lab.OrderAudit(OrderID,OldStatus,NewStatus)
 SELECT i.OrderID,d.Status,i.Status FROM inserted AS i
 JOIN deleted AS d ON d.OrderID = i.OrderID
 WHERE i.Status <> d.Status;
END;
GO
BEGIN TRANSACTION;
UPDATE lab.Orders SET Status = 'Shipped' WHERE OrderID IN (102,105);
SELECT OrderID,OldStatus,NewStatus FROM lab.OrderAudit WHERE OrderID IN (102,105) ORDER BY OrderID;
ROLLBACK TRANSACTION;`,
  'Two audit rows: 102 and 105, Pending → Shipped. The changes and audit inserts roll back; the trigger definition remains.',
  [q('A statement updates 20 rows. How often does its DML trigger execute?',['20 times','Once','Never'],1,'The trigger executes once with all affected rows in its transition tables.'),q('Does rollback also undo the trigger’s audit inserts?',['Yes','No','Only with a second transaction'],0,'Trigger writes are part of the triggering transaction.')]),
 s(5,'Indexes and filtered indexes',
  'Indexes trade write cost and storage for access paths. Put useful seek columns in the key and consider INCLUDE for output columns. A filtered index covers a subset of rows. An index is a candidate, not a command to the optimizer.',
  'Create an index for pending orders by customer and inspect its metadata.',
  'Does creating an index guarantee a seek on this six-row table?',
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'lab.Orders') AND name = N'IX_Orders_Pending')
 CREATE INDEX IX_Orders_Pending ON lab.Orders(CustomerID,OrderDate)
 INCLUDE (Status) WHERE Status = 'Pending';
SELECT name, filter_definition FROM sys.indexes
WHERE object_id = OBJECT_ID(N'lab.Orders') AND name = N'IX_Orders_Pending';
SELECT OrderID,OrderDate,Status FROM lab.Orders WHERE CustomerID = 2 AND Status = 'Pending';`,
  'The index has a Pending filter. The query returns order 105. The optimizer may reasonably scan this tiny table.',
  [q('Does every new index improve every workload?',['Yes','No; writes and storage also cost work','Only if filtered'],1,'Index usefulness depends on reads, writes, selectivity, and the execution plan.'),q('What is a filtered index?',['An index on a subset selected by a predicate','An encrypted index','An index that forces all queries to filter'],0,'Its predicate limits which base rows have index entries.')]),
 s(5,'Execution plans and logical reads',
  'In SSMS, Ctrl+M includes the actual execution plan; Ctrl+L requests an estimated plan without running the query. STATISTICS IO reports reads and STATISTICS TIME reports timing in Messages. Actual plans require query execution and SHOWPLAN permission.',
  'Enable the actual plan, run the query, then inspect row estimates, actual rows, and logical reads. Record observations rather than assuming one operator is always best.',
  'Will a tiny table always benefit from an index seek?',
  `SET STATISTICS IO ON;
SET STATISTICS TIME ON;
SELECT o.OrderID,SUM(i.Quantity * i.UnitPrice) AS Total
FROM lab.Orders AS o JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
WHERE o.CustomerID = 2 GROUP BY o.OrderID ORDER BY o.OrderID;
SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;`,
  '103 = 55 and 105 = 410. Read counts, timing, and operators vary. This small data set teaches inspection, not credible production benchmarks.',
  [q('Does an actual execution plan require executing the query?',['Yes','No','Only for SELECT TOP'],0,'Actual runtime information is collected during execution.'),q('What does STATISTICS IO expose?',['Only internet bandwidth','Logical and physical read information','Only storage prices'],1,'Its Messages output helps compare database I/O work.')]),
 s(5,'Sargable predicates',
  'A predicate that can map to an index search range is often called sargable. Avoid applying unnecessary functions to indexed columns. Compare equivalent results first, then measure plans and reads on representative data.',
  'Compare a YEAR/MONTH filter with an equivalent half-open date range.',
  'Should both queries return the same order IDs?',
  `SELECT OrderID FROM lab.Orders WHERE YEAR(OrderDate) = 2026 AND MONTH(OrderDate) = 2 ORDER BY OrderID;
SELECT OrderID FROM lab.Orders WHERE OrderDate >= '20260201' AND OrderDate < '20260301' ORDER BY OrderID;`,
  'Both return 102,103,104. The range leaves the column unwrapped; an actual seek still depends on indexes and optimizer choices.',
  [q('Which is generally friendlier to a date index?',['YEAR(OrderDate) = 2026','An equivalent unwrapped date range','CAST(OrderDate AS varchar)'],1,'The range exposes usable start/end values for an index search.'),q('What should be checked before declaring a rewrite faster?',['Just character count','Just the query name','Equivalent results and measured work'],2,'A fast wrong query is not a successful optimization.')]),
 s(5,'Isolation and blocking',
  'Isolation controls which concurrent changes a statement can observe. READ_COMMITTED_SNAPSHOT uses row versions for read committed statements; it does not remove writer/writer blocking. NOLOCK permits dirty and inconsistent reads. Keep transactions short.',
  'Inspect the database isolation options and the current session’s open-transaction count. Do not change the database settings for this exercise.',
  'Should an idle practice session have an open transaction?',
  `SELECT name,is_read_committed_snapshot_on,snapshot_isolation_state_desc
FROM sys.databases WHERE database_id = DB_ID();
SELECT @@TRANCOUNT AS OpenTransactions;`,
  'One database row. Azure SQL commonly enables read committed snapshot; inspect the actual value. OpenTransactions should be 0 after the earlier labs finish.',
  [q('Does row-versioned read committed prevent all writer blocking?',['Yes','No','Only for indexes'],1,'Writers can still contend on the same rows.'),q('Why is NOLOCK unsuitable as a general correctness fix?',['It guarantees a deadlock','It can read uncommitted or inconsistent data','It disables SELECT'],1,'Fewer read locks do not imply correct or consistent answers.')]),
 s(5,'Capstone: outstanding balances',
  'Combine grain control, aggregation, optional relationships, and business rules. For this report, cancelled orders contribute neither sales nor paid amounts. Preserve every customer, including those with no eligible orders. Outstanding equals sales minus payments; refunds and overpayments would need explicit rules in a larger system.',
  'Produce one row per customer showing non-cancelled sales, payments, and outstanding balance. Verify the overall totals independently.',
  'What balance should Emi have? What happens to Cora’s cancelled order?',
  `;WITH ItemTotals AS (
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
GROUP BY c.CustomerID,c.CustomerName ORDER BY c.CustomerID;`,
  'Ada: 330 / 130 / 200. Ben: 465 / 55 / 410. Cora: 0 / 0 / 0. Dev: 20 / 20 / 0. Emi: 0 / 0 / 0. Overall: Sales 815, Paid 205, Outstanding 610.',
  [q('What is the correct overall outstanding balance?',['690','610','815'],1,'815 non-cancelled sales minus 205 payments equals 610.'),q('Where should cancelled orders be excluded to preserve all customers?',['In the per-order relation before the LEFT JOIN','By deleting them from Orders','With a final WHERE o.Status condition on unmatched rows'],0,'Filtering the child relation preserves customers with no eligible orders.')])
].map((lesson,index) => ({...lesson,id:String(index+1).padStart(2,'0'),number:index+1}));
