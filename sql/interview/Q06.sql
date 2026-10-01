-- Survival sheet Q6: Total value per order
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 11, 13
-- Aggregate Quantity × UnitPrice once per OrderID. A header-to-lines join alone does not inflate line totals; fan-out from an additional many-side relation can.
-- Expected: 101: 130; 102: 200; 103: 55; 104: 80; 105: 410; 106: 20.

SELECT o.OrderID,SUM(i.Quantity * i.UnitPrice) AS OrderValue
FROM lab.Orders AS o
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY o.OrderID
ORDER BY o.OrderID;
