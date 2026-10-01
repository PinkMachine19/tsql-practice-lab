-- T-SQL Practice Lab | Lesson 06: Date ranges without surprises
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

DECLARE @Start date = '20260201';
SELECT OrderID, OrderDate FROM lab.Orders
WHERE OrderDate >= @Start AND OrderDate < DATEADD(month, 1, @Start)
ORDER BY OrderID;
