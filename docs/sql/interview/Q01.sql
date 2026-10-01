-- Survival sheet Q1: Count orders for every customer
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 08, 11
-- Direct match to lesson 08. Keep zero-order customers and count the nullable child key, not COUNT(*). Q7 repeats this pattern.
-- Expected: Ada 2, Ben 2, Cora 1, Dev 1, Emi 0.

SELECT c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY c.CustomerID;
