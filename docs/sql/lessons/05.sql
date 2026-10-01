-- T-SQL Practice Lab | Lesson 05: TOP and stable pagination
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT TOP (2) OrderID, OrderDate FROM lab.Orders
ORDER BY OrderDate DESC, OrderID DESC;
SELECT OrderID, OrderDate FROM lab.Orders
ORDER BY OrderDate DESC, OrderID DESC
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;
