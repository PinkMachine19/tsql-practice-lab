-- T-SQL Practice Lab | Lesson 16: Ranking and ties
-- Connect to InterviewLab in SSMS. Run 00-setup.sql once first.
-- Read the lesson's expected results before executing.

SELECT PersonID, Score,
 ROW_NUMBER() OVER (ORDER BY Score DESC, PersonID) AS Position,
 RANK() OVER (ORDER BY Score DESC) AS RankWithGaps,
 DENSE_RANK() OVER (ORDER BY Score DESC) AS DensePosition
FROM (VALUES (1,100),(2,100),(3,80)) AS scores(PersonID,Score)
ORDER BY PersonID;
