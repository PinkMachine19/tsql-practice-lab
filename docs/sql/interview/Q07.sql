-- Survival sheet Q7: Count orders per customer again
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 08, 11
-- Same core query as Q1. Use this repetition to explain why COUNT(OrderID) returns zero for Emi.
-- Expected: Five customer rows with counts 2,2,1,1,0.

SELECT c.CustomerID,c.CustomerName,COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY c.CustomerID;
