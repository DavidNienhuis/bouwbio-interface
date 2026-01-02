import { supabase } from '@/integrations/supabase/client';
import type {
  ValidationQueueItem,
  ValidationError,
  AddToQueueInput,
  LogErrorInput,
  QueueStatistics,
  ErrorStatistics,
  ProcessQueueResult,
  ProcessQueueOptions,
  QueueStatus,
} from './queueTypes';
import { runValidation } from './validationService';
import type { Json } from '@/integrations/supabase/types';

/**
 * Add a validation request to the queue for async processing
 */
export async function addToQueue(input: AddToQueueInput): Promise<string> {
  const { userId, productId, inputData, fileRefs, maxAttempts = 3 } = input;

  const { data, error } = await supabase
    .from('validation_queue')
    .insert({
      user_id: userId,
      product_id: productId,
      status: 'pending',
      attempts: 0,
      max_attempts: maxAttempts,
      input_data: inputData as unknown as Json,
      file_refs: fileRefs as unknown as Json,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to add validation to queue: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to add validation to queue: No data returned');
  }

  return data.id;
}

/**
 * Get the status of a validation in the queue
 */
export async function getQueueStatus(queueId: string): Promise<ValidationQueueItem | null> {
  const { data, error } = await supabase
    .from('validation_queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (error) {
    console.error('Error fetching queue status:', error);
    return null;
  }

  return data as unknown as ValidationQueueItem;
}

/**
 * Get all queue items for a user
 */
export async function getUserQueueItems(userId: string): Promise<ValidationQueueItem[]> {
  const { data, error } = await supabase
    .from('validation_queue')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user queue items:', error);
    return [];
  }

  return (data as unknown as ValidationQueueItem[]) || [];
}

/**
 * Update queue item status
 */
async function updateQueueStatus(
  queueId: string,
  status: QueueStatus,
  updates: Partial<{
    attempts: number;
    last_attempt_at: string;
    next_retry_at: string | null;
    error_log: string | null;
    error_details: Json | null;
    completed_at: string | null;
    validation_id: string | null;
  }> = {}
): Promise<void> {
  const { error } = await supabase
    .from('validation_queue')
    .update({
      status,
      ...updates,
    })
    .eq('id', queueId);

  if (error) {
    throw new Error(`Failed to update queue status: ${error.message}`);
  }
}

/**
 * Calculate next retry time using database function
 */
async function calculateNextRetry(attemptCount: number): Promise<string | null> {
  const { data, error } = await supabase.rpc('calculate_next_retry', {
    attempt_count: attemptCount,
    base_delay_seconds: 2,
  });

  if (error) {
    console.error('Error calculating next retry:', error);
    return null;
  }

  return data as string;
}

/**
 * Log a validation error
 */
export async function logValidationError(input: LogErrorInput): Promise<void> {
  const {
    validationId,
    queueId,
    userId,
    errorStep,
    errorMessage,
    errorStack,
    errorMetadata,
    httpStatusCode,
    retryCount = 0,
    isRecoverable = true,
  } = input;

  const { error } = await supabase.from('validation_errors').insert({
    validation_id: validationId || null,
    queue_id: queueId || null,
    user_id: userId,
    error_step: errorStep,
    error_message: errorMessage,
    error_stack: errorStack || null,
    error_metadata: (errorMetadata as Json) || null,
    http_status_code: httpStatusCode || null,
    retry_count: retryCount,
    is_recoverable: isRecoverable,
  });

  if (error) {
    console.error('Failed to log validation error:', error);
  }
}

/**
 * Process a single queue item
 */
async function processQueueItem(
  item: ValidationQueueItem,
  options: ProcessQueueOptions = {}
): Promise<ProcessQueueResult> {
  const { timeoutMs = 300000 } = options; // 5 minute default timeout

  try {
    // Mark as processing
    await updateQueueStatus(item.id, 'processing', {
      attempts: item.attempts + 1,
      last_attempt_at: new Date().toISOString(),
    });

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), timeoutMs);
    });

    // Run validation with timeout
    const result = await Promise.race([
      runValidation(item.input_data),
      timeoutPromise,
    ]);

    // Success - mark as completed
    await updateQueueStatus(item.id, 'completed', {
      completed_at: new Date().toISOString(),
      validation_id: result.validationId || null,
      error_log: null,
      error_details: null,
    });

    return {
      success: true,
      queueId: item.id,
      validationId: result.validationId,
      shouldRetry: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Determine error step
    const errorStep = errorMessage.includes('timeout')
      ? 'webhook_timeout'
      : errorMessage.includes('webhook')
      ? 'webhook_call'
      : errorMessage.includes('storage')
      ? 'upload_storage'
      : 'unknown';

    // Log the error
    await logValidationError({
      queueId: item.id,
      userId: item.user_id,
      errorStep,
      errorMessage,
      errorStack,
      retryCount: item.attempts + 1,
      isRecoverable: item.attempts + 1 < item.max_attempts,
    });

    // Determine if we should retry
    const shouldRetry = item.attempts + 1 < item.max_attempts;

    if (shouldRetry) {
      // Calculate next retry time
      const nextRetryAt = await calculateNextRetry(item.attempts + 1);

      // Mark as pending for retry
      await updateQueueStatus(item.id, 'pending', {
        next_retry_at: nextRetryAt,
        error_log: errorMessage,
        error_details: {
          message: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
        } as unknown as Json,
      });

      return {
        success: false,
        queueId: item.id,
        error: errorMessage,
        shouldRetry: true,
        nextRetryAt: nextRetryAt || undefined,
      };
    } else {
      // Max retries reached - mark as failed
      await updateQueueStatus(item.id, 'failed', {
        error_log: errorMessage,
        error_details: {
          message: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
        } as unknown as Json,
      });

      return {
        success: false,
        queueId: item.id,
        error: errorMessage,
        shouldRetry: false,
      };
    }
  }
}

/**
 * Process pending validations in the queue
 * This should be called by a background worker or cron job
 */
export async function processQueue(options: ProcessQueueOptions = {}): Promise<ProcessQueueResult[]> {
  const { maxConcurrent = 3 } = options;

  // Get pending items that are ready to process
  const { data: pendingItems, error } = await supabase
    .from('validation_queue')
    .select('*')
    .eq('status', 'pending')
    .or(`next_retry_at.is.null,next_retry_at.lte.${new Date().toISOString()}`)
    .order('created_at', { ascending: true })
    .limit(maxConcurrent);

  if (error) {
    console.error('Error fetching pending queue items:', error);
    return [];
  }

  if (!pendingItems || pendingItems.length === 0) {
    return [];
  }

  // Process items concurrently (up to maxConcurrent)
  const results = await Promise.allSettled(
    pendingItems.map((item) =>
      processQueueItem(item as unknown as ValidationQueueItem, options)
    )
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ProcessQueueResult> => r.status === 'fulfilled')
    .map((r) => r.value);
}

/**
 * Manually retry a failed validation
 */
export async function retryFailedValidation(queueId: string): Promise<ProcessQueueResult> {
  const item = await getQueueStatus(queueId);

  if (!item) {
    throw new Error('Queue item not found');
  }

  if (item.status !== 'failed' && item.status !== 'cancelled') {
    throw new Error(`Cannot retry validation with status: ${item.status}`);
  }

  // Reset attempts and mark as pending
  await updateQueueStatus(queueId, 'pending', {
    attempts: 0,
    next_retry_at: null,
    error_log: null,
    error_details: null,
  });

  // Process immediately
  return processQueueItem(item);
}

/**
 * Cancel a pending or processing validation
 */
export async function cancelValidation(queueId: string): Promise<void> {
  await updateQueueStatus(queueId, 'cancelled');
}

/**
 * Get queue statistics for monitoring
 */
export async function getQueueStatistics(): Promise<QueueStatistics | null> {
  const { data, error } = await supabase.rpc('get_queue_statistics');

  if (error) {
    console.error('Error fetching queue statistics:', error);
    return null;
  }

  return data ? (data as unknown as QueueStatistics[])[0] : null;
}

/**
 * Get error statistics for monitoring
 */
export async function getErrorStatistics(daysBack: number = 7): Promise<ErrorStatistics | null> {
  const { data, error } = await supabase.rpc('get_error_statistics', { days_back: daysBack });

  if (error) {
    console.error('Error fetching error statistics:', error);
    return null;
  }

  return data ? (data as unknown as ErrorStatistics[])[0] : null;
}

/**
 * Get recent errors for a user
 */
export async function getUserErrors(userId: string, limit: number = 10): Promise<ValidationError[]> {
  const { data, error } = await supabase
    .from('validation_errors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user errors:', error);
    return [];
  }

  return (data as unknown as ValidationError[]) || [];
}
