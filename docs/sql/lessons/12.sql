-- T-SQL Practice Lab | Lesson 12: Conditional aggregation
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS Pending,
 SUM(CASE WHEN Status = 'Shipped' THEN 1 ELSE 0 END) AS Shipped,
 SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled
FROM lab.Orders;
