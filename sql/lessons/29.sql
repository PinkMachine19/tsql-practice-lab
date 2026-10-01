-- T-SQL Practice Lab | Lesson 29: Execution plans and logical reads
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SET STATISTICS IO ON;
SET STATISTICS TIME ON;
SELECT o.OrderID,SUM(i.Quantity * i.UnitPrice) AS Total
FROM lab.Orders AS o JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
WHERE o.CustomerID = 2 GROUP BY o.OrderID ORDER BY o.OrderID;
SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;
