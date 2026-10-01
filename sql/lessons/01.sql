-- T-SQL Practice Lab | Lesson 01: Connect with SSMS
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT DB_NAME() AS DatabaseName, SUSER_SNAME() AS SignedInAs;
SELECT SERVERPROPERTY('EngineEdition') AS EngineEdition;
