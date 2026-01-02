import type { RunValidationInput } from './types';

/**
 * Queue status values matching database CHECK constraint
 */
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Error step values matching database CHECK constraint
 * Tracks which step in the validation pipeline failed
 */
export type ErrorStep =
  | 'upload_storage'           // Failed during PDF upload to storage
  | 'knowledge_bank'           // Failed during knowledge bank check/upload
  | 'webhook_call'             // Failed during n8n webhook call
  | 'webhook_timeout'          // Webhook timed out
  | 'webhook_parse'            // Failed to parse webhook response
  | 'database_save'            // Failed to save validation to DB
  | 'knowledge_bank_update'    // Failed to update knowledge bank
  | 'credit_deduction'         // Failed to deduct credit
  | 'unknown';                 // Unknown error

/**
 * Validation queue item - matches validation_queue table schema
 */
export interface ValidationQueueItem {
  id: string;
  user_id: string;
  product_id: string | null;
  validation_id: string | null;
  status: QueueStatus;
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  input_data: RunValidationInput;
  file_refs: FileReference[] | null;
  error_log: string | null;
  error_details: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * File reference for queue retry
 * Stores file metadata so we can re-upload on retry
 */
export interface FileReference {
  name: string;
  size: number;
  type: string;
  storage_path?: string;
  url?: string;
}

/**
 * Validation error log entry - matches validation_errors table schema
 */
export interface ValidationError {
  id: string;
  validation_id: string | null;
  queue_id: string | null;
  user_id: string;
  error_step: ErrorStep;
  error_message: string;
  error_stack: string | null;
  error_metadata: Record<string, unknown> | null;
  http_status_code: number | null;
  retry_count: number;
  is_recoverable: boolean;
  created_at: string;
}

/**
 * Input for adding item to validation queue
 */
export interface AddToQueueInput {
  userId: string;
  productId: string | null;
  inputData: RunValidationInput;
  fileRefs: FileReference[];
  maxAttempts?: number;
}

/**
 * Input for logging validation errors
 */
export interface LogErrorInput {
  validationId?: string;
  queueId?: string;
  userId: string;
  errorStep: ErrorStep;
  errorMessage: string;
  errorStack?: string;
  errorMetadata?: Record<string, unknown>;
  httpStatusCode?: number;
  retryCount?: number;
  isRecoverable?: boolean;
}

/**
 * Queue statistics - matches get_queue_statistics() function output
 */
export interface QueueStatistics {
  pending_count: number;
  processing_count: number;
  completed_count: number;
  failed_count: number;
  avg_retry_count: number | null;
  oldest_pending: string | null;
}

/**
 * Error statistics - matches get_error_statistics() function output
 */
export interface ErrorStatistics {
  total_errors: number;
  errors_by_step: Record<ErrorStep, number>;
  error_rate: number | null;
  most_common_errors: Array<{
    error_message: string;
    count: number;
  }>;
}

/**
 * Result from processing a queue item
 */
export interface ProcessQueueResult {
  success: boolean;
  queueId: string;
  validationId?: string;
  error?: string;
  shouldRetry: boolean;
  nextRetryAt?: string;
}

/**
 * Options for queue processing
 */
export interface ProcessQueueOptions {
  maxConcurrent?: number;
  retryDelayBase?: number;  // Base delay in seconds for exponential backoff
  timeoutMs?: number;       // Timeout for each validation
}
