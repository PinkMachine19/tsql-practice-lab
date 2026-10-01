param(
    [Parameter(Mandatory=$true)][string]$Server,
    [Parameter(Mandatory=$true)][string]$Subscription
)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$validationSchema = 'tsqlcheck_' + [guid]::NewGuid().ToString('N').Substring(0,12)
$connection = [System.Data.SqlClient.SqlConnection]::new("Server=tcp:$Server,1433;Database=InterviewLab;Encrypt=True;TrustServerCertificate=False;Connection Timeout=120;")
$labToken = az account get-access-token --subscription $Subscription --resource https://database.windows.net/ --query accessToken --output tsv
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($labToken)) { throw 'Could not obtain an Azure SQL access token.' }
$connection.AccessToken = $labToken.Trim()
$labToken = $null
function Convert-LabSchema([string]$sql) {
    $sql.Replace('lab.', "$validationSchema.").Replace("N'lab'", "N'$validationSchema'").Replace('CREATE SCHEMA lab ', "CREATE SCHEMA $validationSchema ")
}
function Invoke-LabSql([string]$sql) {
    $tables = [System.Collections.Generic.List[System.Data.DataTable]]::new()
    foreach ($batch in [regex]::Split($sql, '(?im)^[ \t]*GO[ \t]*\r?$')) {
        if ([string]::IsNullOrWhiteSpace($batch)) { continue }
        $command = $connection.CreateCommand()
        $command.CommandTimeout = 120
        $command.CommandText = $batch
        $adapter = [System.Data.SqlClient.SqlDataAdapter]::new($command)
        $data = [System.Data.DataSet]::new()
        try { [void]$adapter.Fill($data); foreach ($table in $data.Tables) { $tables.Add($table) } }
        finally { $adapter.Dispose(); $command.Dispose() }
    }
    return ,$tables
}
function Assert-Equal($actual, $expected, [string]$label) {
    if ($actual -ne $expected) { throw "$label expected [$expected], received [$actual]." }
}
function Assert-Column($table, [string]$column, [string]$expected, [string]$label) {
    $actual = ($table.Rows | ForEach-Object { [string]$_[$column] }) -join ','
    Assert-Equal $actual $expected $label
}
$opened = $false
try {
    $connection.Open(); $opened = $true
    $null = Invoke-LabSql 'SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; SET ANSI_PADDING ON; SET ANSI_WARNINGS ON; SET CONCAT_NULL_YIELDS_NULL ON; SET ARITHABORT ON; SET NUMERIC_ROUNDABORT OFF;'
    $null = Invoke-LabSql (Convert-LabSchema (Get-Content (Join-Path $repoRoot 'sql/00-setup.sql') -Raw))
    $null = Invoke-LabSql (Convert-LabSchema (Get-Content (Join-Path $repoRoot 'sql/01-verify.sql') -Raw))
    Write-Output 'Isolated seed and baseline verification passed.'
    $expectedLessonRows = @(1,6,1,2,2,3,6,5,1,1,2,1,3,5,6,3,4,1,3,3,2,2,2,1,1,1,2,1,2,3,1,5)
    for ($n=1; $n -le 32; $n++) {
        $id = '{0:D2}' -f $n
        $sql = Convert-LabSchema (Get-Content (Join-Path $repoRoot "sql/lessons/$id.sql") -Raw)
        $result = Invoke-LabSql $sql
        if ($n -ne 2) { Assert-Equal $result[0].Rows.Count $expectedLessonRows[$n-1] "Lesson $id first result row count" }
        switch ($n) {
            1 { Assert-Equal $result[0].Rows[0]['DatabaseName'] 'InterviewLab' 'Connection database'; Assert-Equal $result[1].Rows[0]['EngineEdition'] 5 'Azure SQL engine' }
            2 { Assert-Equal $result[1].Rows[0]['ItemRows'] 9 'Item rows' }
            3 { Assert-Equal $result[1].Rows[0]['IntegerResult'] 2 'Integer division'; Assert-Equal $result[1].Rows[0]['DecimalResult'] 2.5 'Decimal division' }
            5 { Assert-Column $result[0] 'OrderID' '106,105' 'TOP order'; Assert-Column $result[1] 'OrderID' '104,103' 'Pagination' }
            6 { Assert-Column $result[0] 'OrderID' '102,103,104' 'February range' }
            8 { Assert-Column $result[0] 'OrderCount' '2,2,1,1,0' 'Zero-order customer' }
            10 { Assert-Equal $result[0].Rows[0]['Total'] 55 'Uninflated total'; Assert-Equal $result[0].Rows[0]['Paid'] 55 'Uninflated paid' }
            12 { Assert-Equal $result[0].Rows[0]['Pending'] 2 'Pending count'; Assert-Equal $result[0].Rows[0]['Shipped'] 3 'Shipped count' }
            16 { Assert-Column $result[0] 'RankWithGaps' '1,1,3' 'RANK ties'; Assert-Column $result[0] 'DensePosition' '1,1,2' 'Dense ties' }
            17 { Assert-Equal $result[0].Rows[3]['RunningPaid'] 205 'Cumulative payments' }
            18 { Assert-Equal $result[1].Rows.Count 1 'UNION deduplication'; Assert-Equal $result[2].Rows.Count 2 'UNION ALL' }
            22 { Assert-Equal $result[1].Rows[0]['Total'] 30 'Scalar function' }
            24 { Assert-Equal $result[2].Rows[0]['Remaining'] 0 'DML rollback' }
            25 { Assert-Equal $result[0].Rows[0]['ErrorNumber'] 547 'Expected check-constraint error'; Assert-Equal $result[1].Rows[0]['UnitPrice'] 80 'Price rollback' }
            26 { Assert-Equal $result[0].Rows[0]['FirstUpdate'] 1 'Initial optimistic update'; Assert-Equal $result[1].Rows[0]['StaleUpdate'] 0 'Stale optimistic update' }
            27 { Assert-Column $result[0] 'OrderID' '102,105' 'Multi-row trigger' }
            28 { Assert-Equal $result[1].Rows[0]['OrderID'] 105 'Filtered index query' }
            31 { Assert-Equal $result[1].Rows[0]['OpenTransactions'] 0 'No leaked transactions' }
            32 { Assert-Equal (($result[0].Rows | Measure-Object -Property Outstanding -Sum).Sum) 610 'Capstone balance' }
        }
        Write-Output "PASS lesson $id"
    }
    $expectedInterviewRows = @(5,6,9,1,6,6,5,4,0,4,6,1,3,4,1,5,1,2,2,1,1)
    for ($n=1; $n -le 21; $n++) {
        $id = 'Q{0:D2}' -f $n
        $sql = Convert-LabSchema (Get-Content (Join-Path $repoRoot "sql/interview/$id.sql") -Raw)
        $result = Invoke-LabSql $sql
        Assert-Equal $result[0].Rows.Count $expectedInterviewRows[$n-1] "$id row count"
        switch ($n) {
            1 { Assert-Column $result[0] 'OrderCount' '2,2,1,1,0' 'Interview counts' }
            5 { Assert-Equal $result[1].Rows.Count 2 'Staging rows'; Assert-Equal ($result[1].Rows[1]['CustomerName'] -is [DBNull]) $true 'Preserved orphan' }
            8 { Assert-Column $result[0] 'CustomerID' '1,2,3,4' 'Top customer ordering' }
            9 { $variant=Invoke-LabSql ($sql.Replace('@MinimumOrders int = 5','@MinimumOrders int = 1')); Assert-Column $variant[0] 'CustomerID' '1,2' 'Lower threshold' }
            13 { Assert-Column $result[0] 'CustomerID' '2,1,3' 'Highest total customers' }
            14 { Assert-Column $result[0] 'OrderID' '103,104,105,106' 'Rolling window' }
            15 { Assert-Equal $result[0].Rows[0]['AvgOrdersPerCustomer'] 1.2 'Two-stage average' }
            16 { $variant=Invoke-LabSql ($sql.Replace('@HighValue decimal(12,2) = 10000','@HighValue decimal(12,2) = 300')); Assert-Column $variant[0] 'CustomerTier' 'High Value,High Value,Normal,Normal,Normal' 'Mixed CASE labels' }
            17 { Assert-Equal $result[0].Rows[0]['CustomerRows'] 2 'Duplicate email'; Assert-Equal $result[0].Rows[0]['EmailAddress'] 'shared@example.test' 'Duplicate address' }
            18 { Assert-Column $result[0] 'OrderID' '101,103' 'Second-highest orders'; Assert-Equal $result[0].Rows[0]['OrderValue'] 130 'Second-highest value' }
            19 { Assert-Column $result[0] 'CustomerID' '1,5' 'No recent orders' }
            20 { Assert-Equal $result[0].Rows[0]['JoinedRows'] 4 'Fan-out rows'; Assert-Equal $result[0].Rows[0]['InflatedTotal'] 110 'Deliberate bug'; Assert-Equal $result[1].Rows[0]['Total'] 55 'Fixed query total'; Assert-Equal $result[1].Rows[0]['Paid'] 55 'Fixed payments' }
            21 { Assert-Equal $result[0].Rows[0]['CustomerID'] 2 'WHERE and HAVING result' }
        }
        Write-Output "PASS interview $id"
    }
    $null = Invoke-LabSql (Convert-LabSchema (Get-Content (Join-Path $repoRoot 'sql/01-verify.sql') -Raw))
    $audit = Invoke-LabSql "SELECT COUNT(*) AS RowsLeft FROM $validationSchema.OrderAudit;"
    Assert-Equal $audit[0].Rows[0]['RowsLeft'] 0 'Trigger rollback left no audit rows'
    Write-Output 'PASS: all 32 lessons and 21 interview drills; original seed totals intact.'
}
finally {
    if ($opened) {
        try {
            $null = Invoke-LabSql "IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;"
            # Exact known objects under a randomly generated validation-only schema.
            # No user-supplied schema name, object discovery, or external objects are deleted.
            $cleanup = @"
DROP TRIGGER IF EXISTS $validationSchema.trOrdersAudit;
DROP PROCEDURE IF EXISTS $validationSchema.GetCustomerOrders;
DROP VIEW IF EXISTS $validationSchema.vOrderTotals;
DROP FUNCTION IF EXISTS $validationSchema.CustomerOrders;
DROP FUNCTION IF EXISTS $validationSchema.LineTotal;
DROP TABLE IF EXISTS $validationSchema.ConstraintDemo;
DROP TABLE IF EXISTS $validationSchema.OrderItems;
DROP TABLE IF EXISTS $validationSchema.Payments;
DROP TABLE IF EXISTS $validationSchema.OrderAudit;
DROP TABLE IF EXISTS $validationSchema.Orders;
DROP TABLE IF EXISTS $validationSchema.Products;
DROP TABLE IF EXISTS $validationSchema.Customers;
IF SCHEMA_ID(N'$validationSchema') IS NOT NULL EXEC(N'DROP SCHEMA $validationSchema');
"@
            $null = Invoke-LabSql $cleanup
            Write-Output 'Temporary validation schema removed.'
        }
        finally { $connection.Close() }
    }
    $connection.Dispose()
}
