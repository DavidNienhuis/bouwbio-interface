import { toast } from "sonner";
import type { RunValidationInput, RunValidationResult } from "./types";
import { runValidation } from "./validationService";

/**
 * Validation mode configuration
 */
export type ValidationMode = 'direct' | 'queue';

/**
 * Configuration for validation orchestration
 */
export interface ValidationConfig {
  mode: ValidationMode;
  maxRetries?: number;
  enableToasts?: boolean;
}

/**
 * Result from starting a validation (queue or direct)
 */
export interface StartValidationResult {
  mode: ValidationMode;
  queueId?: string;
  result?: RunValidationResult;
}

/**
 * Default configuration - use queue mode for resilience
 */
const DEFAULT_CONFIG: ValidationConfig = {
  mode: 'direct',  // Changed from 'queue' - queue tables don't exist in database
  maxRetries: 3,
  enableToasts: true,
};

/**
 * Main entry point for validation - decides whether to use queue or direct mode
 *
 * Queue mode (recommended):
 * - Adds validation to background queue
 * - Returns immediately with queue ID
 * - Automatic retry on failure
 * - Error logging and monitoring
 * - User can check status later
 *
 * Direct mode (legacy):
 * - Runs validation immediately
 * - Blocks until completion
 * - No automatic retry
 * - Returns result directly
 *
 * @param input - Validation input parameters
 * @param config - Validation configuration
 * @returns Queue ID (queue mode) or validation result (direct mode)
 */
export async function startValidation(
  input: RunValidationInput,
  config: Partial<ValidationConfig> = {}
): Promise<StartValidationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (finalConfig.mode === 'queue') {
    return startQueueValidation(input, finalConfig);
  } else {
    return startDirectValidation(input, finalConfig);
  }
}

/**
 * Start validation in queue mode (async with retry)
 * NOTE: Queue mode is disabled - database tables don't exist
 */
async function startQueueValidation(
  input: RunValidationInput,
  config: ValidationConfig
): Promise<StartValidationResult> {
  // Queue mode is not available - fall back to direct mode
  console.warn('Queue mode requested but not available. Using direct mode.');
  return startDirectValidation(input, config);
}

/**
 * Start validation in direct mode (synchronous)
 */
async function startDirectValidation(
  input: RunValidationInput,
  config: ValidationConfig
): Promise<StartValidationResult> {
  const { enableToasts } = config;

  try {
    if (enableToasts) {
      toast.info("PDF bestanden opslaan...");
    }

    const result = await runValidation(input);

    if (enableToasts) {
      toast.success("Validatie succesvol afgerond!");
    }

    return {
      mode: 'direct',
      result,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

    if (enableToasts) {
      toast.error(`Validatie mislukt: ${errorMessage}`);
    }

    throw error;
  }
}

/**
 * Check validation status (for queue mode)
 * NOTE: Queue mode is disabled - always returns not_found
 */
export async function checkValidationStatus(_queueId: string): Promise<{
  status: string;
  message?: string;
  attempts?: number;
  maxAttempts?: number;
  validationId?: string | null;
  errorLog?: string | null;
}> {
  return {
    status: 'not_found',
    message: 'Queue system not implemented',
    attempts: 0,
    maxAttempts: 0,
    validationId: null,
    errorLog: null,
  };
}

/**
 * Helper to determine if queue mode should be used
 * Can be extended with feature flags or user preferences
 */
export function shouldUseQueueMode(): boolean {
  // For now, always prefer queue mode for resilience
  // In future, this could check:
  // - Feature flags
  // - User preferences
  // - System load
  // - Time of day
  return true;
}

/**
 * Convenience function that automatically chooses the best mode
 */
export async function startValidationAuto(
  input: RunValidationInput,
  config: Partial<ValidationConfig> = {}
): Promise<StartValidationResult> {
  const mode = shouldUseQueueMode() ? 'queue' : 'direct';
  return startValidation(input, { ...config, mode });
}
