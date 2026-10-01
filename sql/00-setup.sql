-- T-SQL Practice Lab | Run in an empty InterviewLab database using SSMS.
-- Creates only the lab schema. Stops if that schema already exists.
-- Connect to InterviewLab in the connection dialog; Azure SQL does not switch databases with USE.
SET NOCOUNT ON;
SET XACT_ABORT ON;
IF DB_NAME() <> N'InterviewLab'
    THROW 51000, 'Connect to InterviewLab before running this script.', 1;
IF SCHEMA_ID(N'lab') IS NOT NULL
    THROW 51001, 'The lab schema already exists. Keep your work; use the verification script.', 1;
BEGIN TRY
    BEGIN TRANSACTION;
    EXEC(N'CREATE SCHEMA lab AUTHORIZATION dbo;');
    CREATE TABLE lab.Customers (
        CustomerID int NOT NULL CONSTRAINT PK_Customers PRIMARY KEY,
        CustomerName nvarchar(80) NOT NULL,
        City nvarchar(60) NULL
    );
    CREATE TABLE lab.Products (
        ProductID int NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
        ProductName nvarchar(80) NOT NULL,
        UnitPrice decimal(10,2) NOT NULL CONSTRAINT CK_Products_Price CHECK (UnitPrice >= 0)
    );
    CREATE TABLE lab.Orders (
        OrderID int NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
        CustomerID int NOT NULL CONSTRAINT FK_Orders_Customers REFERENCES lab.Customers(CustomerID),
        OrderDate datetime2(0) NOT NULL,
        Status varchar(12) NOT NULL CONSTRAINT CK_Orders_Status CHECK (Status IN ('Pending','Shipped','Cancelled')),
        Version rowversion NOT NULL
    );
    CREATE TABLE lab.OrderItems (
        OrderID int NOT NULL CONSTRAINT FK_Items_Orders REFERENCES lab.Orders(OrderID),
        ProductID int NOT NULL CONSTRAINT FK_Items_Products REFERENCES lab.Products(ProductID),
        Quantity int NOT NULL CONSTRAINT CK_Items_Quantity CHECK (Quantity > 0),
        UnitPrice decimal(10,2) NOT NULL CONSTRAINT CK_Items_Price CHECK (UnitPrice >= 0),
        CONSTRAINT PK_OrderItems PRIMARY KEY (OrderID, ProductID)
    );
    CREATE TABLE lab.Payments (
        PaymentID int NOT NULL CONSTRAINT PK_Payments PRIMARY KEY,
        OrderID int NOT NULL CONSTRAINT FK_Payments_Orders REFERENCES lab.Orders(OrderID),
        Amount decimal(10,2) NOT NULL CONSTRAINT CK_Payments_Amount CHECK (Amount > 0),
        PaidAt datetime2(0) NOT NULL
    );
    CREATE TABLE lab.OrderAudit (
        AuditID int IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderAudit PRIMARY KEY,
        OrderID int NOT NULL,
        OldStatus varchar(12) NOT NULL,
        NewStatus varchar(12) NOT NULL,
        ChangedAt datetime2(0) NOT NULL CONSTRAINT DF_OrderAudit_ChangedAt DEFAULT SYSUTCDATETIME()
    );
    INSERT lab.Customers VALUES (1,N'Ada',N'Boston'),(2,N'Ben',N'Austin'),(3,N'Cora',NULL),(4,N'Dev',N'Boston'),(5,N'Emi',N'Seattle');
    INSERT lab.Products VALUES (1,N'Keyboard',80),(2,N'Mouse',25),(3,N'Monitor',200),(4,N'Cable',10);
    INSERT lab.Orders (OrderID,CustomerID,OrderDate,Status) VALUES
        (101,1,'20260105','Shipped'),(102,1,'20260201','Pending'),(103,2,'20260210','Shipped'),
        (104,3,'20260220','Cancelled'),(105,2,'20260301','Pending'),(106,4,'20260305','Shipped');
    INSERT lab.OrderItems VALUES (101,1,1,80),(101,2,2,25),(102,3,1,200),(103,2,1,25),(103,4,3,10),
        (104,1,1,80),(105,3,2,200),(105,4,1,10),(106,4,2,10);
    INSERT lab.Payments VALUES (1,101,130,'20260106'),(2,103,30,'20260211'),(3,103,25,'20260212'),(4,106,20,'20260306');
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
SELECT N'Lab created. Run 01-verify.sql next.' AS Result;
