-- T-SQL Practice Lab | Lesson 21: Stored procedures and parameters
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

CREATE OR ALTER PROCEDURE lab.GetCustomerOrders @CustomerID int
AS
BEGIN
 SET NOCOUNT ON;
 SELECT OrderID, OrderDate, Status FROM lab.Orders
 WHERE CustomerID = @CustomerID ORDER BY OrderID;
END;
GO
EXEC lab.GetCustomerOrders @CustomerID = 2;
