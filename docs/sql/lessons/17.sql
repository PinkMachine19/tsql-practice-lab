-- T-SQL Practice Lab | Lesson 17: Running totals and LAG
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT PaymentID, Amount,
 LAG(Amount) OVER (ORDER BY PaidAt, PaymentID) AS PreviousAmount,
 SUM(Amount) OVER (ORDER BY PaidAt, PaymentID ROWS UNBOUNDED PRECEDING) AS RunningPaid
FROM lab.Payments ORDER BY PaidAt, PaymentID;
