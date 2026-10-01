-- Survival sheet Q20: Diagnose and repair inflated totals
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 02, 10, 13, 32
-- Run the broken query first and inspect its four joined rows mentally: two lines × two payments. The corrected query produces one row per order on each side. SUM(DISTINCT amount) would wrongly merge separate equal-valued transactions.
-- Expected: Broken: OrderID 103, JoinedRows 4, InflatedTotal 110, InflatedPaid 110. Correct: Total 55, Paid 55.

-- Deliberately WRONG: each order line matches each payment.
SELECT i.OrderID,COUNT(*) AS JoinedRows,
 SUM(i.Quantity * i.UnitPrice) AS InflatedTotal,SUM(p.Amount) AS InflatedPaid
FROM lab.OrderItems AS i JOIN lab.Payments AS p ON p.OrderID = i.OrderID
WHERE i.OrderID = 103 GROUP BY i.OrderID;
-- Correct: independently reduce both relations to order grain.
;WITH Totals AS (
 SELECT OrderID,SUM(Quantity * UnitPrice) AS Total FROM lab.OrderItems GROUP BY OrderID
), Paid AS (
 SELECT OrderID,SUM(Amount) AS Paid FROM lab.Payments GROUP BY OrderID
)
SELECT t.OrderID,t.Total,COALESCE(p.Paid,0) AS Paid FROM Totals AS t
LEFT JOIN Paid AS p ON p.OrderID = t.OrderID WHERE t.OrderID = 103;
