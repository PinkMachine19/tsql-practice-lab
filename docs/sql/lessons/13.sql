-- T-SQL Practice Lab | Lesson 13: CTEs as named steps
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

;WITH Totals AS (
 SELECT OrderID, SUM(Quantity * UnitPrice) AS Total
 FROM lab.OrderItems GROUP BY OrderID
)
SELECT OrderID, Total FROM Totals WHERE Total >= 100 ORDER BY OrderID;
