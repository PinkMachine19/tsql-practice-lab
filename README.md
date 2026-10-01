# T-SQL Practice Lab

Hands-on SQL Server and Azure SQL Database practice in SSMS: **32 complete lessons, 64 explained quiz questions, and a reproducible sample database**.

**[Open the lab](https://pinkmachine19.github.io/tsql-practice-lab/)** · **[Quiz bank](https://pinkmachine19.github.io/tsql-practice-lab/quizzes/index.html)**

**[Interview question map](https://pinkmachine19.github.io/tsql-practice-lab/interview-map/index.html)** maps all 21 questions from the Worldwide Importers SQL Interview Survival Sheet to the corresponding lessons. Each question includes a runnable `InterviewLab` adaptation, expected results, dataset differences, and a SQL download. Lessons link back to their matching sheet questions. The full Wide World Importers database is not required.

## Start here

1. Connect to an existing database named `InterviewLab` in SSMS. For Azure SQL, use your logical server endpoint and Microsoft Entra MFA.
2. Run [`sql/00-setup.sql`](sql/00-setup.sql) once. It creates only the `lab` schema and refuses to overwrite an existing schema.
3. Run [`sql/01-verify.sql`](sql/01-verify.sql). Expect 5 customers, 4 products, 6 orders, 9 items, and 4 payments; gross order total 895 and payments 205.
4. Follow the lessons in order. Predict the result, write a query, reveal the solution, and answer the review questions.

## Coverage

- SSMS, schemas, types, NULL, filtering, TOP, pagination, date ranges
- Joins, missing relationships, aggregation, CTEs, APPLY, window functions, ranking, set operations
- Temp tables, table variables, views, stored procedures, scalar and inline table-valued functions
- Keys, IDENTITY, constraints, data changes, transactions, TRY/CATCH, rowversion, multi-row triggers
- Filtered indexes, execution plans, logical reads, sargability, isolation, and a reporting capstone

The lessons use native T-SQL. A dialect reference explains differences from PostgreSQL. Azure SQL is a database service; instance-level SQL Server features are not assumed.

## Free Azure SQL usage

The site creates no cloud resources and never connects to a database. Run SQL yourself in SSMS. Use an existing free-offer database with `useFreeLimit=true` and `freeLimitExhaustionBehavior=AutoPause`, local backups, and a maximum data size of 32 GB. Keep paid add-ons disabled. Disconnect SSMS and Object Explorer when finished so idle auto-pause can conserve the monthly allowance. Running SQL consumes the allowance.

See [Microsoft’s free-offer documentation](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer?view=azuresql).

## Data changes

Setup runs transactionally and refuses to overwrite an existing `lab` schema. Data-changing demonstrations roll back their sample changes. Lessons 20–22, 27, and 28 keep their view, procedure, functions, trigger, or index. Run whole examples so cleanup statements execute. If you interrupt a transaction, inspect `@@TRANCOUNT` and roll it back before continuing.

The sample is deliberately small; performance exercises teach how to inspect evidence, not how to extrapolate production timing from six orders. No automatic destructive reset script is included.

## Development

Requires Node.js 22 or newer.

```sh
npm ci
npm run build
npm test
npm run preview
```

Open `http://127.0.0.1:4173`. Serve the site over HTTP rather than opening HTML files directly, so the quiz bank can load its JSON file.

- `scripts/course.mjs`: authored lessons, solutions, expected results, and questions
- `scripts/interview.mjs`: the 21-question crosswalk and focused practice drills
- `scripts/build.mjs`: static-page and SQL-download generator
- `docs/app.js`, `docs/styles.css`: shared browser behavior and presentation
- `sql/`: setup, verification, and generated lesson solutions
- `docs/`: GitHub Pages artifact; all links work under a project subpath

The build checks local links and stale content. Browser progress, notes, and quiz results use a dedicated localStorage key; they are not uploaded. No analytics, visit notifications, external fonts, or application backend are used.

## Validation

All 32 lesson solutions and all 21 interview drills were executed successfully against Azure SQL Database on 2026-10-01. Checks included expected row counts, ranking ties, the 1.2 average, optimistic concurrency, a two-row audit trigger, transaction rollback, and Q20’s inflated 110 versus corrected 55 totals. The isolated validation schema was removed afterward. See [validation details](VALIDATION.md).

`npm run test:browser` tests the UI with Playwright (installed Microsoft Edge locally; Chromium in CI). To repeat the optional live SQL checks from PowerShell with an Azure CLI account that can administer a practice database:

```powershell
.\scripts\validate-sql.ps1 -Server '<your-server>.database.windows.net' -Subscription '<your-subscription-id>'
```

This consumes database compute allowance. It creates a uniquely named validation schema in `InterviewLab`, runs the scripts against that schema, and removes only those test objects in a `finally` block. It does not create Azure resources. The Azure SQL access token stays in process memory. Confirm your database is using the free offer with AutoPause before running live checks. A paused database may require a connection retry.
