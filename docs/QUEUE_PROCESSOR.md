# Validation Queue Processor

The validation queue processor handles background processing of validation requests with automatic retry logic and error handling.

## Overview

The resilience system consists of:

1. **Queue Database Tables** (`validation_queue`, `validation_errors`)
2. **Queue Service** (`src/lib/validation/queueService.ts`)
3. **Background Processor** (Edge Function or standalone script)
4. **UI Integration** (Validatie.tsx with polling)

## Architecture

```
User submits validation
        ↓
Added to validation_queue (status: pending)
        ↓
Background processor picks up pending items
        ↓
Process validation (with retry on failure)
        ↓
Update status (completed/failed)
        ↓
UI polls status and displays results
```

## Setup Options

### Option 1: Supabase Edge Function (Recommended)

**Advantages:**
- Runs on Supabase infrastructure
- No separate server needed
- Built-in monitoring
- Easy to schedule via cron

**Setup:**

1. Deploy the edge function:
```bash
cd supabase/functions
supabase functions deploy process-validation-queue
```

2. Set up a cron trigger to run every 30 seconds:
```bash
# Using Supabase Dashboard: Database → Cron Jobs
# Or using pg_cron extension:
SELECT cron.schedule(
  'process-validation-queue',
  '*/30 * * * * *',  -- Every 30 seconds
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-validation-queue',
    headers := jsonb_build_object('Authorization', 'Bearer ' || 'YOUR_ANON_KEY')
  );
  $$
);
```

3. Monitor function logs:
```bash
supabase functions logs process-validation-queue
```

### Option 2: Standalone Script

**Advantages:**
- Full control over execution environment
- Easier to debug locally
- Can run on any server

**Setup:**

1. Install dependencies:
```bash
npm install dotenv tsx
```

2. Create `.env` file with credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Run manually:
```bash
npx tsx scripts/process-queue.ts
```

4. Set up cron job (Linux/Mac):
```bash
# Edit crontab
crontab -e

# Add line to run every 30 seconds (requires running every minute with sleep)
* * * * * cd /path/to/bouwbio-interface && npx tsx scripts/process-queue.ts
* * * * * sleep 30 && cd /path/to/bouwbio-interface && npx tsx scripts/process-queue.ts
```

5. Or use PM2 for continuous processing:
```bash
npm install -g pm2

# Create pm2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'validation-queue-processor',
    script: 'scripts/process-queue.ts',
    interpreter: 'npx',
    interpreter_args: 'tsx',
    cron_restart: '*/1 * * * *',  // Restart every minute
    autorestart: false,
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

## Configuration

The queue processor can be configured via environment variables or code:

```typescript
await processQueue({
  maxConcurrent: 3,      // Process up to 3 validations in parallel
  retryDelayBase: 2,     // Base delay in seconds (exponential: 2s, 4s, 8s, 16s)
  timeoutMs: 300000,     // Timeout per validation (5 minutes)
});
```

## Retry Logic

The system uses exponential backoff for retries:

| Attempt | Delay   |
|---------|---------|
| 1       | 0s      |
| 2       | 2s      |
| 3       | 4s      |
| 4       | 8s      |

Default: 3 max attempts (configurable)

## Error Tracking

All errors are logged to the `validation_errors` table with:
- Error step (upload_storage, webhook_call, etc.)
- Error message and stack trace
- HTTP status code (for webhook errors)
- Retry count
- Recoverability flag

## Monitoring

### Queue Statistics

```typescript
import { getQueueStatistics } from '@/lib/validation/queueService';

const stats = await getQueueStatistics();
// {
//   pending_count: 5,
//   processing_count: 2,
//   completed_count: 150,
//   failed_count: 3,
//   avg_retry_count: 1.2,
//   oldest_pending: '2024-01-02T10:00:00Z'
// }
```

### Error Statistics

```typescript
import { getErrorStatistics } from '@/lib/validation/queueService';

const stats = await getErrorStatistics(7); // Last 7 days
// {
//   total_errors: 15,
//   errors_by_step: {
//     webhook_call: 10,
//     webhook_timeout: 3,
//     upload_storage: 2
//   },
//   error_rate: 5.5,  // Percentage
//   most_common_errors: [...]
// }
```

### Manual Retry

```typescript
import { retryFailedValidation } from '@/lib/validation/queueService';

// Retry a failed validation
await retryFailedValidation(queueId);
```

## Troubleshooting

### Queue items stuck in "processing"

This can happen if the processor crashes mid-processing. To fix:

```sql
-- Reset stuck items (processing for > 10 minutes)
UPDATE validation_queue
SET status = 'pending',
    next_retry_at = NOW()
WHERE status = 'processing'
  AND last_attempt_at < NOW() - INTERVAL '10 minutes';
```

### High error rate

Check error statistics to identify the most common failure point:

```sql
SELECT error_step, COUNT(*) as count
FROM validation_errors
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY error_step
ORDER BY count DESC;
```

### Webhook timeouts

If you see many `webhook_timeout` errors, consider:
- Increasing the timeout in `processQueue()` options
- Optimizing the n8n webhook workflow
- Adding more retries

## Database Maintenance

Periodically clean up old completed queue items:

```sql
-- Archive items older than 30 days
DELETE FROM validation_queue
WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '30 days';

-- Archive old error logs
DELETE FROM validation_errors
WHERE created_at < NOW() - INTERVAL '90 days';
```

## Performance Tips

1. **Adjust concurrency** based on your infrastructure:
   - Start with `maxConcurrent: 3`
   - Increase if you have spare capacity
   - Decrease if experiencing resource issues

2. **Monitor queue depth** - if queue is growing, consider:
   - Increasing concurrency
   - Running processor more frequently
   - Adding more processor instances

3. **Optimize retry logic** - adjust based on error patterns:
   - Transient errors → more retries
   - Permanent errors → fewer retries

## Security

- Use `SUPABASE_SERVICE_ROLE_KEY` for the processor (not anon key)
- Keep service role key secure (never commit to git)
- Consider running processor in isolated environment
- Monitor for suspicious activity in error logs
