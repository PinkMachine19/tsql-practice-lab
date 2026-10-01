-- Survival sheet Q3: Order lines with product, quantity, and unit price
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 02, 04, 07
-- OrderItems is the lab equivalent of OrderLines; Products corresponds to StockItems. Use the historical line UnitPrice, not the current catalogue price.
-- Expected: Nine rows. Order 101 contains Keyboard × 1 at 80 and Mouse × 2 at 25.

SELECT i.OrderID,p.ProductName,i.Quantity,i.UnitPrice
FROM lab.OrderItems AS i JOIN lab.Products AS p ON p.ProductID = i.ProductID
ORDER BY i.OrderID,i.ProductID;
