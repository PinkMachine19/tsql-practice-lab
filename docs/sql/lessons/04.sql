-- T-SQL Practice Lab | Lesson 04: Filter and project
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT CustomerID, CustomerName
FROM lab.Customers
WHERE City = N'Boston'
ORDER BY CustomerID;
