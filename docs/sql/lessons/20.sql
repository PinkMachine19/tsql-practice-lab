-- T-SQL Practice Lab | Lesson 20: Views
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

CREATE OR ALTER VIEW lab.vOrderTotals AS
SELECT OrderID, SUM(Quantity * UnitPrice) AS Total
FROM lab.OrderItems GROUP BY OrderID;
GO
SELECT OrderID, Total FROM lab.vOrderTotals WHERE Total >= 100 ORDER BY OrderID;
