/**
 * Queue Service - Placeholder
 * 
 * NOTE: The queue system requires database tables that don't exist yet.
 * This file exports stub types and functions to prevent build errors.
 * The actual validation uses direct mode (see validationOrchestrator.ts).
 * 
 * To enable the queue system:
 * 1. Create the validation_queue table
 * 2. Create the validation_errors table  
 * 3. Create the required database functions
 * 4. Implement the actual queue logic
 */

import type {
  ValidationQueueItem,
  ValidationError,
  QueueStatistics,
  ErrorStatistics,
  ProcessQueueResult,
} from './queueTypes';

// Re-export types for backwards compatibility
export type {
  ValidationQueueItem,
  ValidationError,
  QueueStatistics,
  ErrorStatistics,
  ProcessQueueResult,
};

/**
 * Placeholder: Add to queue (not implemented)
 */
export async function addToQueue(): Promise<string> {
  throw new Error('Queue system not implemented. Use direct validation mode.');
}

/**
 * Placeholder: Get queue status (not implemented)
 */
export async function getQueueStatus(): Promise<ValidationQueueItem | null> {
  console.warn('Queue system not implemented');
  return null;
}

/**
 * Placeholder: Get user queue items (not implemented)
 */
export async function getUserQueueItems(_userId?: string): Promise<ValidationQueueItem[]> {
  console.warn('Queue system not implemented');
  return [];
}

/**
 * Placeholder: Process queue (not implemented)
 */
export async function processQueue(): Promise<ProcessQueueResult[]> {
  console.warn('Queue system not implemented');
  return [];
}

/**
 * Placeholder: Retry failed validation (not implemented)
 */
export async function retryFailedValidation(_queueId?: string): Promise<ProcessQueueResult> {
  throw new Error('Queue system not implemented');
}

/**
 * Placeholder: Cancel validation (not implemented)
 */
export async function cancelValidation(): Promise<void> {
  throw new Error('Queue system not implemented');
}

/**
 * Placeholder: Get queue statistics (not implemented)
 */
export async function getQueueStatistics(_userId?: string): Promise<QueueStatistics | null> {
  console.warn('Queue system not implemented');
  return null;
}

/**
 * Placeholder: Get error statistics (not implemented)
 */
export async function getErrorStatistics(_daysBack?: number): Promise<ErrorStatistics | null> {
  console.warn('Queue system not implemented');
  return null;
}

/**
 * Placeholder: Log validation error (not implemented)
 */
export async function logValidationError(): Promise<void> {
  console.warn('Queue system not implemented - error not logged');
}

/**
 * Placeholder: Get user errors (not implemented)
 */
export async function getUserErrors(): Promise<ValidationError[]> {
  console.warn('Queue system not implemented');
  return [];
}
