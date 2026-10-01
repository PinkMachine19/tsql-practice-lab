-- Survival sheet Q17: Find customers sharing an email address
-- Adapted for InterviewLab, not the full Wide World Importers schema.
-- Run 00-setup.sql once first. Read-only practice.
-- Lessons: 11, 15
-- The lab has no People/email table. A self-contained VALUES fixture gives a repeatable duplicate example without changing setup. Ignore NULL here. Shared email or shared primary contact is evidence to investigate, not proof that two customer records are the same entity.
-- Expected: shared@example.test with CustomerRows = 2. The missing email is excluded.

;WITH Contacts AS (
 SELECT * FROM (VALUES
  (1,N'ada@example.test'),(2,N'shared@example.test'),(3,N'shared@example.test'),
  (4,CAST(NULL AS nvarchar(80))),(5,N'emi@example.test')
 ) AS v(CustomerID,EmailAddress)
)
SELECT EmailAddress,COUNT(*) AS CustomerRows FROM Contacts
WHERE EmailAddress IS NOT NULL GROUP BY EmailAddress
HAVING COUNT(*) > 1 ORDER BY EmailAddress;
