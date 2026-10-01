-- T-SQL Practice Lab | Lesson 23: Keys, IDENTITY, and constraints
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

BEGIN TRANSACTION;
CREATE TABLE lab.ConstraintDemo (
 ID int IDENTITY(1,1) PRIMARY KEY,
 Code nvarchar(20) NOT NULL UNIQUE,
 Quantity int NOT NULL CHECK (Quantity > 0)
);
INSERT lab.ConstraintDemo(Code,Quantity) OUTPUT inserted.ID, inserted.Code
VALUES (N'A',1),(N'B',2);
ROLLBACK TRANSACTION;
