-- Survival sheet Q9: Customers with more than five orders
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 11
-- The original threshold is preserved. The tiny dataset has no qualifying customer; change @MinimumOrders from 5 to 1 for a second run that returns Ada and Ben.
-- Expected: At 5: zero rows, correctly. At 1: Ada and Ben, each with 2 orders.

DECLARE @MinimumOrders int = 5;
SELECT c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
HAVING COUNT(o.OrderID) > @MinimumOrders
ORDER BY c.CustomerID;
