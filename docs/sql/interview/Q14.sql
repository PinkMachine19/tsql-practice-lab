-- Survival sheet Q14: Orders placed in the last 30 days
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 06, 30
-- A fixed @AsOf makes practice repeatable on the historical seed. The interval here is [@AsOf minus 30 days, @AsOf), excluding future rows. For a live UTC timestamp window, use SYSUTCDATETIME(); clarify calendar-day versus elapsed-time semantics.
-- Expected: Window 2026-02-08 through before 2026-03-10: orders 103,104,105,106.

DECLARE @AsOf datetime2(0) = '20260310';
SELECT OrderID,OrderDate,CustomerID FROM lab.Orders
WHERE OrderDate >= DATEADD(day,-30,@AsOf) AND OrderDate < @AsOf
ORDER BY OrderID;
