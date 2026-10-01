-- Survival sheet Q15: Average number of orders across customers
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 03, 08, 13
-- Include zero-order customers: 6 orders / 5 customers = 1.2. Excluding Emi would yield 1.5. Convert before AVG to avoid integer truncation. This focused drill supplies the multi-stage averaging example.
-- Expected: AvgOrdersPerCustomer = 1.2, including Emi’s zero.

;WITH Counts AS (
 SELECT c.CustomerID,COUNT(o.OrderID) AS OrderCount
 FROM lab.Customers AS c LEFT JOIN lab.Orders AS o ON o.CustomerID = c.CustomerID
 GROUP BY c.CustomerID
)
SELECT AVG(CAST(OrderCount AS decimal(10,2))) AS AvgOrdersPerCustomer FROM Counts;
