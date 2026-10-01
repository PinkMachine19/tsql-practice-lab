-- T-SQL Practice Lab | Lesson 30: Sargable predicates
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT OrderID FROM lab.Orders WHERE YEAR(OrderDate) = 2026 AND MONTH(OrderDate) = 2 ORDER BY OrderID;
SELECT OrderID FROM lab.Orders WHERE OrderDate >= '20260201' AND OrderDate < '20260301' ORDER BY OrderID;
