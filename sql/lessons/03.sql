-- T-SQL Practice Lab | Lesson 03: Types, conversions, and NULL
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT CustomerID, CustomerName FROM lab.Customers WHERE City IS NULL;
SELECT 5 / 2 AS IntegerResult, CAST(5 AS decimal(10,2)) / 2 AS DecimalResult;
