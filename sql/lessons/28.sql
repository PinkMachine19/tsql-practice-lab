-- T-SQL Practice Lab | Lesson 28: Indexes and filtered indexes
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'lab.Orders') AND name = N'IX_Orders_Pending')
 CREATE INDEX IX_Orders_Pending ON lab.Orders(CustomerID,OrderDate)
 INCLUDE (Status) WHERE Status = 'Pending';
SELECT name, filter_definition FROM sys.indexes
WHERE object_id = OBJECT_ID(N'lab.Orders') AND name = N'IX_Orders_Pending';
SELECT OrderID,OrderDate,Status FROM lab.Orders WHERE CustomerID = 2 AND Status = 'Pending';
