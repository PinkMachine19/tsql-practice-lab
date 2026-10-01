-- T-SQL Practice Lab | Lesson 31: Isolation and blocking
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT name,is_read_committed_snapshot_on,snapshot_isolation_state_desc
FROM sys.databases WHERE database_id = DB_ID();
SELECT @@TRANCOUNT AS OpenTransactions;
