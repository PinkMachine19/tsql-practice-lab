-- Survival sheet Q21: Explain WHERE versus HAVING
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 04, 11
-- This combined example makes the stages visible: remove orders before February, group the remaining rows per customer, then keep customers with more than one remaining order. Logical clause processing explains alias scope; it is not a promise about physical operator execution order.
-- Expected: Only customer 2 (Ben), with 2 orders. Ada has only one after the WHERE filter.

SELECT CustomerID,COUNT(*) AS OrderCount FROM lab.Orders
WHERE OrderDate >= '20260201'
GROUP BY CustomerID
HAVING COUNT(*) > 1
ORDER BY CustomerID;
