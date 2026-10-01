-- Survival sheet Q10: Latest order date for each customer
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 11, 14
-- MAX gives a date; it does not return the rest of that order row. This drill follows the sheet’s INNER JOIN and excludes Emi. Lesson 14 shows how OUTER APPLY keeps Emi while selecting a whole latest order.
-- Expected: Ada 2026-02-01; Ben 2026-03-01; Cora 2026-02-20; Dev 2026-03-05.

SELECT c.CustomerID,c.CustomerName,MAX(o.OrderDate) AS LatestOrderDate
FROM lab.Customers AS c JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID,c.CustomerName ORDER BY c.CustomerID;
