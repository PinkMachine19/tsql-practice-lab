-- T-SQL Practice Lab | Lesson 24: INSERT, UPDATE, DELETE, and OUTPUT
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

BEGIN TRANSACTION;
INSERT lab.Customers(CustomerID,CustomerName,City) VALUES (900,N'Practice',N'Boston');
UPDATE lab.Customers SET City = N'Austin'
OUTPUT deleted.City AS OldCity, inserted.City AS NewCity
WHERE CustomerID = 900;
DELETE FROM lab.Customers OUTPUT deleted.CustomerID WHERE CustomerID = 900;
ROLLBACK TRANSACTION;
SELECT COUNT(*) AS Remaining FROM lab.Customers WHERE CustomerID = 900;
