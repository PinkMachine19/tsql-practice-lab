-- T-SQL Practice Lab | Lesson 10: Prevent join multiplication
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

;WITH ItemTotals AS (
 SELECT OrderID, SUM(Quantity * UnitPrice) AS Total FROM lab.OrderItems GROUP BY OrderID
), Paid AS (
 SELECT OrderID, SUM(Amount) AS Paid FROM lab.Payments GROUP BY OrderID
)
SELECT i.OrderID, i.Total, COALESCE(p.Paid, 0) AS Paid
FROM ItemTotals AS i LEFT JOIN Paid AS p ON p.OrderID = i.OrderID
WHERE i.OrderID = 103;
