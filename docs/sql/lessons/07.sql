-- T-SQL Practice Lab | Lesson 07: Join related rows
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT o.OrderID, c.CustomerName
FROM lab.Orders AS o
JOIN lab.Customers AS c ON c.CustomerID = o.CustomerID
ORDER BY o.OrderID;
