-- T-SQL Practice Lab | Lesson 26: Optimistic concurrency with rowversion
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

DECLARE @Original binary(8) = (SELECT Version FROM lab.Orders WHERE OrderID = 102);
BEGIN TRANSACTION;
UPDATE lab.Orders SET Status = 'Shipped' WHERE OrderID = 102 AND Version = @Original;
SELECT @@ROWCOUNT AS FirstUpdate;
UPDATE lab.Orders SET Status = 'Cancelled' WHERE OrderID = 102 AND Version = @Original;
SELECT @@ROWCOUNT AS StaleUpdate;
ROLLBACK TRANSACTION;
