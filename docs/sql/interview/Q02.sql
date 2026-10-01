-- Survival sheet Q2: Orders with customer name and order date
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 07
-- Lesson 07 teaches the join; this drill adds the requested OrderDate projection. One output row represents one order.
-- Expected: Six rows, order IDs 101–106. Ada has 101/102; Ben has 103/105; Cora has 104; Dev has 106.

SELECT o.OrderID,o.OrderDate,c.CustomerName
FROM lab.Orders AS o JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
ORDER BY o.OrderID;
