# Validation record

Validated on 2026-10-01.

## Static site

- Build generated 32 lesson pages, 64 explained quiz questions, and 21 interview-question drill sections.
- Every local page, script, stylesheet, and SQL-download link resolved.
- Each of the 21 survival-sheet question numbers maps to existing lessons, with reverse links from the relevant lessons.
- Publishable pages contain no inherited visit notification code or placeholder lessons.
- Three content tests passed.

## Browser behavior

Seven Playwright tests passed in Microsoft Edge:

1. Required answers, correct and incorrect grading, best-score retention, saved notes, and completion persistence.
2. Topic selection, practice rounds, explanations, and retry.
3. All 21 mapped questions, SQL downloads, Q18 search, and reverse navigation.
4. Lesson search, valid navigation, and no-result state.
5. Cancelled and confirmed progress resets without deleting unrelated browser data.
6. Mobile viewport fit and absence of JavaScript errors on the principal pages.
7. Usable lessons when browser storage is unavailable.

## Live Azure SQL

The existing database was checked for `useFreeLimit=true` and `freeLimitExhaustionBehavior=AutoPause`. The first connection encountered normal serverless unavailability while the paused database resumed; the retry succeeded.

The validator used a new, randomly named schema, leaving the normal `lab` schema untouched. All 32 lesson solutions and all 21 interview drill scripts executed successfully. Assertions checked output row counts and selected expected values, including:

- Base counts and gross total 895; payments 205.
- TOP/pagination order, missing customers, February and rolling 30-day windows.
- RANK and DENSE_RANK ties; cumulative payments 205.
- Scalar/table-valued functions, procedures, and views.
- Expected CHECK error 547 with unchanged price, rollback, and stale rowversion update rejection.
- Two audit rows from one two-row update, with no audit rows retained after rollback.
- Customer average 1.2, threshold variants, duplicate email detection, and second-highest order values.
- Q20: four multiplied join rows, inflated total 110, corrected total 55 and paid amount 55.
- Capstone outstanding balance 610 and no leaked transaction.

The final seed verification passed. All test objects and the temporary validation schema were removed.

## Scope

This validates the supplied tiny dataset and adapted InterviewLab queries. It is not a full Wide World Importers installation or a performance benchmark. UI checks do not cover every browser or assistive technology. Running the sample queries uses the database's compute allowance.
