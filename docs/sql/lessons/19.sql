-- T-SQL Practice Lab | Lesson 19: Temp tables and table variables
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

DROP TABLE IF EXISTS #OrderTotals;
SELECT OrderID, SUM(Quantity * UnitPrice) AS Total INTO #OrderTotals
FROM lab.OrderItems GROUP BY OrderID;
CREATE UNIQUE CLUSTERED INDEX IX_TempTotals ON #OrderTotals(OrderID);
SELECT * FROM #OrderTotals WHERE Total > 100 ORDER BY OrderID;
DECLARE @Ids TABLE (ID int PRIMARY KEY);
INSERT @Ids VALUES (101),(102);
SELECT ID FROM @Ids ORDER BY ID;
DROP TABLE #OrderTotals;
