-- T-SQL Practice Lab | Lesson 15: Window aggregates
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT OrderID, CustomerID,
 COUNT(*) OVER (PARTITION BY CustomerID) AS CustomerOrderCount
FROM lab.Orders ORDER BY OrderID;
