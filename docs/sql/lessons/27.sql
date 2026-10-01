-- T-SQL Practice Lab | Lesson 27: Write a multi-row trigger
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

CREATE OR ALTER TRIGGER lab.trOrdersAudit ON lab.Orders AFTER UPDATE
AS
BEGIN
 SET NOCOUNT ON;
 INSERT lab.OrderAudit(OrderID,OldStatus,NewStatus)
 SELECT i.OrderID,d.Status,i.Status FROM inserted AS i
 JOIN deleted AS d ON d.OrderID = i.OrderID
 WHERE i.Status <> d.Status;
END;
GO
BEGIN TRANSACTION;
UPDATE lab.Orders SET Status = 'Shipped' WHERE OrderID IN (102,105);
SELECT OrderID,OldStatus,NewStatus FROM lab.OrderAudit WHERE OrderID IN (102,105) ORDER BY OrderID;
ROLLBACK TRANSACTION;
