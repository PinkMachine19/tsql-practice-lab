-- T-SQL Practice Lab | Lesson 14: Correlated queries and APPLY
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT c.CustomerID, c.CustomerName, recent.OrderID
FROM lab.Customers AS c
OUTER APPLY (
 SELECT TOP (1) o.OrderID FROM lab.Orders AS o
 WHERE o.CustomerID = c.CustomerID ORDER BY o.OrderDate DESC, o.OrderID DESC
) AS recent
ORDER BY c.CustomerID;
