-- Survival sheet Q16: Label customers High Value or Normal
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 11, 12, 13
-- The requested threshold of 10,000 is preserved, so everyone is Normal here. Set it to 300 for both labels. Unlike the sheet’s inner joins, these left joins fulfill “each customer” by including Emi with zero; CASE labels rather than filters.
-- Expected: At 10,000: all five Normal; totals 330,465,80,20,0. At 300: Ada and Ben High Value; the other three Normal.

DECLARE @HighValue decimal(12,2) = 10000;
SELECT c.CustomerID,c.CustomerName,COALESCE(SUM(i.Quantity * i.UnitPrice),0) AS TotalValue,
 CASE WHEN COALESCE(SUM(i.Quantity * i.UnitPrice),0) > @HighValue
 THEN N'High Value' ELSE N'Normal' END AS CustomerTier
FROM lab.Customers AS c LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
LEFT JOIN lab.OrderItems AS i ON i.OrderID = o.OrderID
GROUP BY c.CustomerID,c.CustomerName ORDER BY c.CustomerID;
