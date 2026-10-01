-- Survival sheet Q19: Customers without an order in the last 30 days
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 06, 09
-- Use the same fixed clock as Q14. Customers with no orders qualify too. MAX can also solve this if NULL is handled correctly, but a plain MAX(date) < boundary predicate misses never-ordering customers.
-- Expected: Ada (last order February 1) and Emi (no orders).

DECLARE @AsOf datetime2(0) = '20260310';
SELECT c.CustomerID,c.CustomerName FROM lab.Customers AS c
WHERE NOT EXISTS (
 SELECT 1 FROM lab.Orders AS o WHERE o.CustomerID = c.CustomerID
 AND o.OrderDate >= DATEADD(day,-30,@AsOf) AND o.OrderDate < @AsOf
)
ORDER BY c.CustomerID;
