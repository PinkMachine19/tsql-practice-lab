-- Survival sheet Q12: Customers who have never ordered again
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 08, 09
-- No GROUP BY is needed for this anti-match. Compare its result to NOT EXISTS in lesson 09.
-- Expected: Only Emi, customer 5.

SELECT c.CustomerID,c.CustomerName
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
WHERE o.OrderID IS NULL
ORDER BY c.CustomerID;
