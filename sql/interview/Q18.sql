-- Survival sheet Q18: Second-highest order value per customer
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 13, 15, 16
-- Interpret “second highest” as second distinct value. First aggregate each order; then rank within each customer. DENSE_RANK preserves ties. For exactly one second order instead, use ROW_NUMBER with a deterministic OrderID tie-breaker and state the changed requirement.
-- Expected: Customer 1: order 101, value 130. Customer 2: order 103, value 55. Customers without a second distinct value have no result.

;WITH Totals AS (
 SELECT o.CustomerID,o.OrderID,SUM(i.Quantity * i.UnitPrice) AS OrderValue
 FROM lab.Orders AS o JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
 GROUP BY o.CustomerID,o.OrderID
), Ranked AS (
 SELECT CustomerID,OrderID,OrderValue,
 DENSE_RANK() OVER(PARTITION BY CustomerID ORDER BY OrderValue DESC) AS ValueRank
 FROM Totals
)
SELECT CustomerID,OrderID,OrderValue FROM Ranked WHERE ValueRank = 2
ORDER BY CustomerID,OrderID;
