-- T-SQL Practice Lab | Lesson 11: Group and filter totals
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT c.CustomerID, c.CustomerName, SUM(i.Quantity * i.UnitPrice) AS GrossTotal
FROM lab.Customers AS c
JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY c.CustomerID, c.CustomerName
HAVING SUM(i.Quantity * i.UnitPrice) > 300
ORDER BY c.CustomerID;
