-- T-SQL Practice Lab | Lesson 09: Find absence with NOT EXISTS
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT c.CustomerID, c.CustomerName FROM lab.Customers AS c
WHERE NOT EXISTS (SELECT 1 FROM lab.Orders AS o WHERE o.CustomerID = c.CustomerID)
ORDER BY c.CustomerID;
