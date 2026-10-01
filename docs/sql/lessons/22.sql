-- T-SQL Practice Lab | Lesson 22: Functions: scalar and table-valued
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

CREATE OR ALTER FUNCTION lab.CustomerOrders(@CustomerID int)
RETURNS TABLE AS RETURN
 SELECT OrderID, OrderDate, Status FROM lab.Orders WHERE CustomerID = @CustomerID;
GO
CREATE OR ALTER FUNCTION lab.LineTotal(@Qty int, @Price decimal(10,2))
RETURNS decimal(19,2) AS
BEGIN
 RETURN @Qty * @Price;
END;
GO
SELECT OrderID FROM lab.CustomerOrders(1) ORDER BY OrderID;
SELECT lab.LineTotal(3, 10.00) AS Total;
