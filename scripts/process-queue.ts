#!/usr/bin/env tsx
/**
 * Standalone Queue Processor Script
 *
 * This script processes the validation queue and can be run:
 * - Manually: tsx scripts/process-queue.ts
 * - Via cron: */30 * * * * cd /path/to/project && tsx scripts/process-queue.ts
 * - As a service: systemd or pm2
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY (or better: SUPABASE_SERVICE_ROLE_KEY)
 */

import { createClient } from '@supabase/supabase-js';
import { processQueue } from '../src/lib/validation/queueService';

// Load environment from .env file if available
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment');
  console.error('Required: VITE_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

async function main() {
  console.log('🚀 Starting queue processor...');
  console.log(`📅 ${new Date().toISOString()}`);

  try {
    // Process the queue with configurable options
    const results = await processQueue({
      maxConcurrent: 3,      // Process up to 3 validations in parallel
      retryDelayBase: 2,     // Base delay in seconds for exponential backoff
      timeoutMs: 300000,     // 5 minute timeout per validation
    });

    if (results.length === 0) {
      console.log('ℹ️  No pending items in queue');
      return;
    }

    // Report results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const willRetry = results.filter(r => !r.success && r.shouldRetry).length;

    console.log(`\n📊 Processing complete:`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   🔄 Will retry: ${willRetry}`);

    // Log individual results
    results.forEach((result, idx) => {
      const icon = result.success ? '✅' : (result.shouldRetry ? '🔄' : '❌');
      const status = result.success ? 'SUCCESS' : (result.shouldRetry ? 'RETRY' : 'FAILED');
      console.log(`   ${icon} [${idx + 1}] ${result.queueId}: ${status}`);

      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }

      if (result.nextRetryAt) {
        console.log(`      Next retry: ${result.nextRetryAt}`);
      }
    });

  } catch (error) {
    console.error('❌ Queue processing error:', error);
    process.exit(1);
  }
}

// Run and handle exit
main()
  .then(() => {
    console.log('\n✅ Queue processor finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
