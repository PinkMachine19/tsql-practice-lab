-- T-SQL Practice Lab | Lesson 02: Read the sample schema
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT t.name AS TableName, c.name AS ColumnName, ty.name AS DataType
FROM sys.tables AS t
JOIN sys.columns AS c ON c.object_id = t.object_id
JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
WHERE t.schema_id = SCHEMA_ID(N'lab')
ORDER BY t.name, c.column_id;
SELECT COUNT(*) AS ItemRows FROM lab.OrderItems;
