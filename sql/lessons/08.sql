-- T-SQL Practice Lab | Lesson 08: Keep missing matches
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT c.CustomerID, c.CustomerName, COUNT(o.OrderID) AS OrderCount
FROM lab.Customers AS c
LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
GROUP BY c.CustomerID, c.CustomerName
ORDER BY c.CustomerID;
