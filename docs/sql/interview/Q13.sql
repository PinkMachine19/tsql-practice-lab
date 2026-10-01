-- Survival sheet Q13: Top three customers by total order value
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 05, 07, 11
-- This reproduces the sheet’s gross-value rule: cancelled orders are included. The capstone deliberately uses a different rule and excludes them. State the business rule before comparing totals.
-- Expected: Ben 465, Ada 330, Cora 80, in that order.

SELECT TOP (3) c.CustomerID,c.CustomerName,SUM(i.Quantity * i.UnitPrice) AS TotalValue
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY c.CustomerID,c.CustomerName
ORDER BY TotalValue DESC,c.CustomerID;
