-- T-SQL Practice Lab | Lesson 18: Set operations
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT CustomerID FROM lab.Customers
EXCEPT SELECT CustomerID FROM lab.Orders;
SELECT 1 AS Value UNION SELECT 1;
SELECT 1 AS Value UNION ALL SELECT 1;
