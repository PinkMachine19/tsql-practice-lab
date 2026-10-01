-- Survival sheet Q11: Orders with customer name and total value
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 07, 11, 13
-- Group at order grain, not just customer grain. A window SUM is another way to retain detail rows, so “SUM always requires GROUP BY” would be too broad a rule.
-- Expected: Six order rows, with totals 130,200,55,80,410,20; customer names remain attached to each order.

SELECT o.OrderID,c.CustomerID,c.CustomerName,SUM(i.Quantity * i.UnitPrice) AS OrderValue
FROM lab.Orders AS o JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY o.OrderID,c.CustomerID,c.CustomerName ORDER BY o.OrderID;
