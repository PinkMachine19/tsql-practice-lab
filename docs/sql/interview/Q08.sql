-- Survival sheet Q8: Top five customers by order count
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 05, 08, 11
-- The sheet uses an INNER JOIN, so zero-order customers are excluded. Only four customers qualify in this small dataset. CustomerID breaks count ties deterministically.
-- Expected: Ada 2, Ben 2, Cora 1, Dev 1. TOP (5) does not invent a fifth row.

SELECT TOP (5) c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY OrderCount DESC,c.CustomerID;
