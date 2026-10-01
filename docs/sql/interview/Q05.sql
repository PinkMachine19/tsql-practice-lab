-- Survival sheet Q5: Preserve orders when customer data is missing
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 08, 23
-- The trusted foreign key prevents orphan orders in the seeded tables. The first query therefore has six matches. A separate VALUES-based staging example demonstrates missing customer data without weakening the foreign key.
-- Expected: First result: six real orders. Second result: 901 / Ada and 902 / NULL. Both staging rows survive.

SELECT o.OrderID,o.OrderDate,c.CustomerName
FROM lab.Orders AS o LEFT JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
ORDER BY o.OrderID;
-- Simulate imported rows without altering the constrained tables.
SELECT incoming.OrderID,c.CustomerName
FROM (VALUES (901,1),(902,999)) AS incoming(OrderID,CustomerID)
LEFT JOIN lab.Customers AS c ON c.CustomerID = incoming.CustomerID
ORDER BY incoming.OrderID;
