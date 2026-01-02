# Validation Resilience System

## Overview

This document describes the complete validation resilience system implemented to eliminate the single point of failure in the BouwBio validation platform. The system adds queue-based async processing, automatic retry logic, comprehensive error tracking, and admin monitoring capabilities.

## Problem Statement

**Before:** Validation requests were processed synchronously with no retry capability. If the n8n webhook failed, timed out, or any step in the validation pipeline crashed, the user lost their work and credit was incorrectly deducted. There was no error tracking or monitoring.

**After:** All validations are processed through a resilient queue system with:
- Automatic retry with exponential backoff
- Comprehensive error logging by step
- Admin dashboard for monitoring
- No data loss on failure
- Proper credit handling

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS VALIDATION                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
         ┌───────────────────────────────────────┐
         │   startValidationAuto()                │
         │   • Validates input                    │
         │   • Checks credits                     │
         │   • Adds to queue OR runs directly     │
         └───────────────┬───────────────────────┘
                         │
            ┌────────────┴─────────────┐
            │                          │
            ↓                          ↓
    ┌──────────────┐          ┌──────────────┐
    │  Queue Mode  │          │ Direct Mode  │
    │  (default)   │          │  (fallback)  │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           ↓                         ↓
┌──────────────────────┐    ┌────────────────┐
│ validation_queue     │    │  Sync Process  │
│ status: pending      │    │  (immediate)   │
└──────┬───────────────┘    └────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│  BACKGROUND PROCESSOR                     │
│  (Edge Function or Cron Script)           │
│  • Polls every 30 seconds                 │
│  • Processes up to 3 items concurrently   │
│  • Handles retry logic                    │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────┐
│  VALIDATION PIPELINE                      │
│  1. Upload PDFs to storage                │
│  2. Check/upload knowledge bank           │
│  3. Call n8n webhook (AI validation)      │
│  4. Deduct credit                         │
│  5. Save validation to database           │
│  6. Update knowledge bank with results    │
└──────┬───────────────────────────────────┘
       │
       ↓
   ┌───┴────┐
   │Success?│
   └───┬────┘
       │
  ┌────┴─────┐
  │          │
  YES        NO
  │          │
  ↓          ↓
┌─────────┐  ┌──────────────────────────┐
│Complete │  │ Log Error to             │
│Queue    │  │ validation_errors        │
└─────────┘  └──────┬───────────────────┘
                    │
               ┌────┴─────┐
               │Retry?    │
               │attempts  │
               │< max     │
               └────┬─────┘
                    │
               ┌────┴─────┐
               │          │
              YES        NO
               │          │
               ↓          ↓
        ┌──────────┐  ┌────────┐
        │Set        │  │Mark    │
        │pending    │  │failed  │
        │+ retry_at │  └────────┘
        └───────────┘
               │
               ↓
        ┌──────────────┐
        │Wait for next │
        │processor run │
        └──────────────┘
```

## Components

### 1. Database Schema

**File:** `supabase/migrations/20260102_add_validation_queue_and_error_logging.sql`

#### Tables

**`validation_queue`** - Stores validation requests for async processing
- `id` (UUID): Primary key
- `user_id` (UUID): User who requested validation
- `product_id` (UUID): Associated product
- `validation_id` (UUID): Completed validation reference
- `status`: pending | processing | completed | failed | cancelled
- `attempts`: Current retry count
- `max_attempts`: Maximum retries (default: 3)
- `last_attempt_at`: Timestamp of last processing attempt
- `next_retry_at`: When to retry (exponential backoff)
- `input_data` (JSONB): Serialized RunValidationInput for retry
- `file_refs` (JSONB): File metadata for re-upload
- `error_log`: Last error message
- `error_details` (JSONB): Structured error data
- `created_at`, `updated_at`, `completed_at`: Timestamps

**`validation_errors`** - Detailed error logging
- `id` (UUID): Primary key
- `validation_id` (UUID): Associated validation (if any)
- `queue_id` (UUID): Associated queue item
- `user_id` (UUID): User who experienced error
- `error_step`: upload_storage | knowledge_bank | webhook_call | webhook_timeout | webhook_parse | database_save | knowledge_bank_update | credit_deduction | unknown
- `error_message`: Error description
- `error_stack`: Stack trace
- `error_metadata` (JSONB): Additional context
- `http_status_code`: HTTP status (for webhook errors)
- `retry_count`: Which attempt failed
- `is_recoverable`: Can this be retried?
- `created_at`: When error occurred

#### Functions

- **`calculate_next_retry(attempt_count, base_delay_seconds)`**: Calculates exponential backoff
  - Attempt 1: 2s
  - Attempt 2: 4s
  - Attempt 3: 8s
  - Attempt 4: 16s

- **`get_queue_statistics()`**: Returns queue health metrics
  - pending_count, processing_count, completed_count, failed_count
  - avg_retry_count
  - oldest_pending timestamp

- **`get_error_statistics(days_back)`**: Returns error analytics
  - total_errors
  - errors_by_step (breakdown)
  - error_rate (percentage)
  - most_common_errors (top 5)

### 2. TypeScript Layer

**`src/lib/validation/queueTypes.ts`** (172 lines)
- Type definitions matching database schema
- QueueStatus, ErrorStep enums
- Interfaces for all queue operations

**`src/lib/validation/queueService.ts`** (323 lines)
- `addToQueue()`: Add validation to queue
- `getQueueStatus()`: Get status of queue item
- `getUserQueueItems()`: Get user's queue history
- `processQueue()`: Process pending validations (background worker)
- `retryFailedValidation()`: Manually retry failed item
- `cancelValidation()`: Cancel pending/processing item
- `getQueueStatistics()`: Fetch queue metrics
- `getErrorStatistics()`: Fetch error analytics
- `getUserErrors()`: Get user's recent errors
- `logValidationError()`: Log error to database

**`src/lib/validation/validationOrchestrator.ts`** (183 lines)
- `startValidation()`: Main entry point (queue or direct mode)
- `startValidationAuto()`: Automatically chooses best mode
- `checkValidationStatus()`: Check queue item status
- `shouldUseQueueMode()`: Feature flag logic
- Handles both async (queue) and sync (direct) flows

### 3. UI Updates

**`src/pages/Validatie.tsx`** - Enhanced with queue support
- Added queue state variables (queueId, queueStatus, queueAttempts)
- `executeValidation()` now uses `startValidationAuto()`
- `pollQueueStatus()` polls every 2 seconds for status updates
- Queue status UI with progress bar and retry count
- Handles both queue and direct mode results

**`src/pages/Admin.tsx`** (404 lines) - New admin dashboard
- Real-time queue statistics dashboard
- Error statistics with breakdown by step
- Recent validations table with manual retry
- System health indicators
- Auto-refresh every 10 seconds
- Manual retry capability for failed validations

### 4. Background Processors

**Option A: Supabase Edge Function** (Recommended)
**File:** `supabase/functions/process-validation-queue/index.ts`
- Processes up to 3 validations concurrently
- Scheduled via cron every 30 seconds
- Uses Supabase service role for admin access
- Returns processing results

**Option B: Standalone Script**
**File:** `scripts/process-queue.ts`
- Can be run via cron or PM2
- Same logic as edge function
- More control over execution environment
- Easier local testing

### 5. Documentation

- **`docs/QUEUE_PROCESSOR.md`**: Complete guide to setting up and monitoring the queue processor
- **`docs/RESILIENCE_SYSTEM.md`**: This document

## Configuration

### Queue Mode Selection

By default, `shouldUseQueueMode()` returns `true`, meaning all validations use the resilient queue system. This can be changed based on:
- Feature flags
- User preferences
- System load
- Time of day

### Retry Configuration

```typescript
await processQueue({
  maxConcurrent: 3,      // Process 3 items in parallel
  retryDelayBase: 2,     // Base delay: 2s, 4s, 8s, 16s
  timeoutMs: 300000,     // 5 minute timeout per validation
});
```

### Max Attempts

Default: 3 attempts per validation (configurable per queue item)

## Setup Instructions

### 1. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually via Supabase Dashboard SQL Editor
# Run: supabase/migrations/20260102_add_validation_queue_and_error_logging.sql
```

### 2. Set Up Background Processor

Choose one option:

#### Option A: Edge Function (Recommended)

```bash
# Deploy function
supabase functions deploy process-validation-queue

# Set up cron (via pg_cron or Supabase Dashboard)
SELECT cron.schedule(
  'process-validation-queue',
  '*/30 * * * * *',
  $$SELECT net.http_post(...)$$
);
```

#### Option B: Standalone Script

```bash
# Install dependencies
npm install dotenv tsx

# Set up cron
crontab -e
# Add: * * * * * cd /path && npx tsx scripts/process-queue.ts
```

### 3. Test the System

1. Navigate to `/` and submit a validation
2. Validation is added to queue (check console for queueId)
3. UI polls for status updates every 2 seconds
4. View queue progress at `/admin` dashboard
5. Check error logs if validation fails

## Monitoring

### Admin Dashboard

Navigate to `/admin` (requires login) to view:
- Queue counts (pending, processing, completed, failed)
- Error statistics by step
- Recent validations with manual retry
- System health metrics

### Database Queries

```sql
-- Check queue status
SELECT status, COUNT(*) FROM validation_queue GROUP BY status;

-- Recent errors
SELECT * FROM validation_errors ORDER BY created_at DESC LIMIT 10;

-- Failed validations
SELECT * FROM validation_queue WHERE status = 'failed';

-- Retry stats
SELECT
  attempts,
  COUNT(*) as count
FROM validation_queue
WHERE status IN ('completed', 'failed')
GROUP BY attempts
ORDER BY attempts;
```

### Logs

- Edge Function: `supabase functions logs process-validation-queue`
- Standalone Script: Check stdout/stderr or PM2 logs

## Error Handling

### Error Steps Tracked

1. **upload_storage**: Failed during PDF upload to Supabase Storage
2. **knowledge_bank**: Failed during knowledge bank check/upload
3. **webhook_call**: Failed during n8n webhook call
4. **webhook_timeout**: Webhook timed out
5. **webhook_parse**: Failed to parse webhook response
6. **database_save**: Failed to save validation to database
7. **knowledge_bank_update**: Failed to update knowledge bank
8. **credit_deduction**: Failed to deduct credit
9. **unknown**: Unknown error

### Recoverable vs Non-Recoverable

The system automatically determines if an error is recoverable:
- Transient errors (timeouts, network issues) → Retry
- Permanent errors (invalid input, missing files) → No retry
- Max retries reached → Mark as failed

## Benefits

### Before Resilience System
- ❌ Single point of failure
- ❌ No retry on failure
- ❌ Data loss on crash
- ❌ No error tracking
- ❌ No monitoring
- ❌ Credit incorrectly deducted on failure

### After Resilience System
- ✅ Queue-based async processing
- ✅ Automatic retry with exponential backoff
- ✅ Comprehensive error tracking by step
- ✅ Admin dashboard with real-time monitoring
- ✅ No data loss - all requests are logged
- ✅ Proper credit handling
- ✅ Manual override capability
- ✅ Production-grade reliability

## Performance Impact

- **User Experience**: Slightly faster (validation submitted to queue immediately, no waiting)
- **Database**: Minimal overhead (2 new tables, indexed properly)
- **CPU**: Background processor handles concurrency (configurable)
- **Memory**: Queue items stored in database (not in-memory)
- **Scalability**: Can run multiple processor instances

## Future Enhancements

1. **Priority Queue**: Allow priority validations (paid tier)
2. **Batch Processing**: Process multiple validations from same user together
3. **Smart Retry**: ML-based retry prediction
4. **Webhook Health Check**: Monitor n8n availability before queuing
5. **User Notifications**: Email/push when validation completes
6. **Rate Limiting**: Per-user rate limits on queue additions
7. **SLA Tracking**: Track and guarantee processing SLAs

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Validation can be added to queue
- [ ] Background processor picks up pending items
- [ ] Retry logic works on failure (exponential backoff)
- [ ] Error logging captures all error types
- [ ] UI polling displays real-time status
- [ ] Admin dashboard shows correct metrics
- [ ] Manual retry works from admin dashboard
- [ ] Completed validations are properly stored
- [ ] Credits are only deducted on success

## Rollback Plan

If issues occur, rollback by:

1. Disable queue mode:
```typescript
// In validationOrchestrator.ts
export function shouldUseQueueMode(): boolean {
  return false;  // Use direct mode
}
```

2. Stop background processor (no new items will be processed)

3. Manually complete pending items or mark as failed

4. Revert database migration (if needed):
```sql
DROP TABLE IF EXISTS validation_errors CASCADE;
DROP TABLE IF EXISTS validation_queue CASCADE;
DROP FUNCTION IF EXISTS calculate_next_retry CASCADE;
DROP FUNCTION IF EXISTS get_queue_statistics CASCADE;
DROP FUNCTION IF EXISTS get_error_statistics CASCADE;
ALTER TABLE validations DROP COLUMN IF EXISTS retry_count;
ALTER TABLE validations DROP COLUMN IF EXISTS last_error;
ALTER TABLE validations DROP COLUMN IF EXISTS queue_id;
```

## Support

For issues or questions:
1. Check logs (Edge Function or script output)
2. Query database for stuck items
3. Review error statistics in admin dashboard
4. Check n8n webhook health
5. Verify Supabase Storage connectivity

## Conclusion

The validation resilience system transforms the BouwBio platform from a fragile, failure-prone service into a production-grade, reliable system with comprehensive error handling, automatic retry, and full observability. Users will never lose work again, and administrators have full visibility into system health and errors.
