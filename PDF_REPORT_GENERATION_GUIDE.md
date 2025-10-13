# PDF Report Generation Guide

This guide explains how to use the automated PDF report generation feature in the Xyne Test Automation Framework.

## Overview

The PDF report generation feature automatically creates professional PDF reports after test execution, providing a summary of test results in a format suitable for sharing and archiving. The reports are generated from data stored in your PostgreSQL database and include module-wise test statistics.

## Features

- **Automatic Generation**: PDF reports are generated automatically after test batch completion
- **Database-Driven**: Reports pull data from PostgreSQL using CRON_RUN_ID for batch identification
- **Professional Format**: Clean, professional layout with color-coded results
- **Module Breakdown**: Shows test results grouped by module
- **Summary Statistics**: Includes overall pass rates and execution summaries
- **Slack Integration Ready**: Designed to work with future Slack file upload features

## Setup

### 1. Install Python Dependencies

Run the setup script to install required Python packages:

```bash
./setup-pdf-dependencies.sh
```

This will install:
- `reportlab` - For PDF generation
- `requests` - For API calls

Note: No direct PostgreSQL connection is needed as the system uses your existing database API.

### 2. Environment Variables

Ensure the following environment variables are set:

```bash
# Required for database authentication
export JUSPAY_USERNAME="your-username"
export JUSPAY_PASSWORD="your-password"

# Optional - defaults to sandbox endpoint
export DB_API_ENDPOINT="https://sandbox.portal.juspay.in/dashboard-test-automation/dbQuery"

# Set by run-staggered-tests-server.sh automatically
export CRON_RUN_ID="20251009123456"
export IS_CRON_RUN="true"
```

## Usage

### Automatic Generation

PDF reports are generated automatically when you run tests using the batch script:

```bash
./run-staggered-tests-server.sh
```

The script will:
1. Generate a unique CRON_RUN_ID
2. Run all functional tests
3. Store results in the database
4. Automatically generate a PDF report
5. Save the PDF to the `reports/` directory

### Manual Generation

You can also generate PDF reports manually for any existing CRON_RUN_ID:

```bash
# Using Python directly
python3 src/framework/utils/pdf-report-generator.py "20251009123456"

# Using the TypeScript service
node -e "
const { pdfReportService } = require('./src/framework/utils/pdf-report-service.ts');
pdfReportService.generatePdfReport('20251009123456').then(console.log);
"
```

## Report Format

### Header Section
- **Title**: "Test Execution Report"
- **Version**: CRON_RUN_ID for batch identification
- **Date**: Execution date
- **Environment**: Test environment (Sandbox/Production/Local)

### Summary Section
- **Total Modules**: Number of test modules executed
- **Total Tests**: Total test cases run
- **Passed/Failed/Skipped**: Breakdown of test results
- **Pass Rate**: Overall success percentage

### Module Details Table
- **Module**: Test module name (formatted for readability)
- **Total Run**: Number of tests executed in the module
- **Passed**: Number of successful tests (green background)
- **Failed**: Number of failed tests (red background)
- **Skipped**: Number of skipped tests (yellow background)
- **Slack Report Link**: Link to detailed Slack report (if available)

### Footer
- Generation timestamp
- Framework identification
- CRON_RUN_ID for reference

## File Naming

PDF reports are saved with the following naming convention:

```
reports/test-execution-report-{CRON_RUN_ID}-{TIMESTAMP}.pdf
```

Example:
```
reports/test-execution-report-20251009123456-2025-10-09_17-30-45.pdf
```

## Integration with Existing Framework

### Enhanced Reporter Integration

The PDF generation is integrated into the Enhanced Reporter (`src/framework/core/enhanced-reporter.ts`):

1. **Database Storage**: Test results are stored in PostgreSQL
2. **PDF Generation**: Triggered automatically after database storage
3. **Error Handling**: Graceful failure - PDF generation errors won't break test execution
4. **Logging**: Comprehensive logging for debugging

### Database Schema

The PDF generator reads from the `test_run_summary` table with the following key columns:

```sql
SELECT 
    module_name, test_cases_run, test_cases_passed, test_cases_skipped,
    test_cases_failed, run_datetime, slack_report_link, username, 
    runenv, cron_run_id
FROM test_run_summary 
WHERE cron_run_id = 'your-cron-run-id'
ORDER BY module_name
```

## Troubleshooting

### Common Issues

#### 1. Python Dependencies Missing
```
Error: ModuleNotFoundError: No module named 'reportlab'
```
**Solution**: Run `./setup-pdf-dependencies.sh`

#### 2. Authentication Failed
```
Error: Authentication failed: 401 Unauthorized
```
**Solution**: Check `JUSPAY_USERNAME` and `JUSPAY_PASSWORD` environment variables

#### 3. No Data Found
```
Warning: No data found for the specified CRON_RUN_ID
```
**Solution**: Ensure tests were run with database storage enabled and CRON_RUN_ID is correct

#### 4. Permission Denied
```
Error: Permission denied: reports/
```
**Solution**: Ensure the `reports/` directory exists and is writable

### Debug Mode

Enable verbose logging by setting:

```bash
export DEBUG=true
```

### Manual Testing

Test the PDF generator independently:

```bash
# Test Python dependencies
python3 -c "import reportlab, requests, psycopg2; print('All dependencies OK')"

# Test database connection
python3 src/framework/utils/pdf-report-generator.py "test-cron-id"
```

## Architecture

### Components

1. **Python PDF Generator** (`src/framework/utils/pdf-report-generator.py`)
   - Core PDF generation logic using ReportLab
   - Database querying and authentication
   - Professional report formatting

2. **TypeScript Service** (`src/framework/utils/pdf-report-service.ts`)
   - Node.js wrapper for Python script
   - Process management and error handling
   - Integration with existing TypeScript codebase

3. **Enhanced Reporter Integration**
   - Automatic triggering after test completion
   - Integration with existing reporting pipeline
   - Error handling and logging

### Data Flow

```
Test Execution → Database Storage → PDF Generation → File Output
     ↓                ↓                    ↓            ↓
Enhanced Reporter → PostgreSQL → Python Script → reports/
```

## Future Enhancements

### Planned Features

1. **Slack Integration**: Automatic upload of PDF reports to Slack channels
2. **Email Distribution**: Send PDF reports via email
3. **Historical Trends**: Include trend analysis in reports
4. **Custom Templates**: Support for different report templates
5. **Filtering Options**: Generate reports for specific modules or date ranges

### Configuration Options

Future versions will support:
- Custom report templates
- Configurable color schemes
- Additional data sources
- Report scheduling

## Best Practices

1. **Regular Cleanup**: Periodically clean old PDF reports from the `reports/` directory
2. **Environment Variables**: Use secure methods to manage authentication credentials
3. **Monitoring**: Monitor PDF generation logs for failures
4. **Backup**: Include PDF reports in your backup strategy if needed for compliance

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the logs in the console output
3. Verify environment variables are set correctly
4. Test Python dependencies manually

## Examples

### Sample PDF Report Structure

```
Test Execution Report
Cronserver | Version: 20251009123456 | Date: 2025-10-09
Environment: Sandbox

📊 Execution Summary
Modules: 5    Total Tests: 45    Passed: 38    Failed: 5    Skipped: 2    Pass Rate: 84%

📋 Module Details
┌─────────────────────┬───────────┬────────┬────────┬─────────┬──────────────────┐
│ Module              │ Total Run │ Passed │ Failed │ Skipped │ Slack Report Link│
├─────────────────────┼───────────┼────────┼────────┼─────────┼──────────────────┤
│ Agent Module        │    12     │   10   │   2    │    0    │      Link        │
│ Chat Module         │    15     │   13   │   1    │    1    │      Link        │
│ Collection Module   │     8     │    7   │   1    │    0    │      Link        │
│ History Module      │     6     │    5   │   0    │    1    │      Link        │
│ Workflow Module     │     4     │    3   │   1    │    0    │      Link        │
└─────────────────────┴───────────┴────────┴────────┴─────────┴──────────────────┘

Generated by Xyne Test Automation Framework | CRON Run ID: 20251009123456
Report generated on 2025-10-09 17:30:45
```

This completes the PDF report generation setup for your test automation framework!
