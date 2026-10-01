-- Survival sheet Q4: Customers who have never ordered
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 08, 09
-- Lesson 09 uses NOT EXISTS for the same requirement. This drill practices the sheet’s left-join anti-match. Q12 repeats it.
-- Expected: Only customer 5, Emi.

SELECT c.CustomerID,c.CustomerName
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
WHERE o.OrderID IS NULL
ORDER BY c.CustomerID;
