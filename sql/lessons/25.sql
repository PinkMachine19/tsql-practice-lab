-- T-SQL Practice Lab | Lesson 25: Transactions and error handling
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 UPDATE lab.Products SET UnitPrice = -1 WHERE ProductID = 1;
 COMMIT TRANSACTION;
END TRY
BEGIN CATCH
 IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
 SELECT ERROR_NUMBER() AS ErrorNumber, ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
SELECT UnitPrice FROM lab.Products WHERE ProductID = 1;
