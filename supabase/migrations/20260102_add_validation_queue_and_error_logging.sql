-- Migration: Add Validation Queue and Error Logging for Resilience
-- Purpose: Enable retry logic, async processing, and error monitoring

-- ============================================================================
-- 1. VALIDATION QUEUE TABLE
-- ============================================================================
-- Stores validation requests for async processing with retry capability
CREATE TABLE IF NOT EXISTS validation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  validation_id UUID REFERENCES validations(id) ON DELETE SET NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Waiting to be processed
    'processing',   -- Currently being processed
    'completed',    -- Successfully completed
    'failed',       -- Failed after all retries
    'cancelled'     -- Manually cancelled
  )),

  -- Retry mechanism
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,

  -- Input data (serialized for retry)
  input_data JSONB NOT NULL,  -- RunValidationInput serialized

  -- File storage (URLs or blob references for retry)
  file_refs JSONB,  -- Array of file metadata for re-upload if needed

  -- Error tracking
  error_log TEXT,  -- Last error message
  error_details JSONB,  -- Structured error data

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_validation_queue_status ON validation_queue(status);
CREATE INDEX IF NOT EXISTS idx_validation_queue_user_id ON validation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_queue_next_retry ON validation_queue(next_retry_at)
  WHERE status = 'pending' AND next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_validation_queue_created_at ON validation_queue(created_at DESC);

-- RLS Policies
ALTER TABLE validation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue items"
  ON validation_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue items"
  ON validation_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue items"
  ON validation_queue FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================================
-- 2. VALIDATION ERROR LOG TABLE
-- ============================================================================
-- Detailed error logging for monitoring and debugging
CREATE TABLE IF NOT EXISTS validation_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  validation_id UUID REFERENCES validations(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES validation_queue(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Error details
  error_step TEXT NOT NULL CHECK (error_step IN (
    'upload_storage',     -- Failed during PDF upload to storage
    'knowledge_bank',     -- Failed during knowledge bank check/upload
    'webhook_call',       -- Failed during n8n webhook call
    'webhook_timeout',    -- Webhook timed out
    'webhook_parse',      -- Failed to parse webhook response
    'database_save',      -- Failed to save validation to DB
    'knowledge_bank_update', -- Failed to update knowledge bank
    'credit_deduction',   -- Failed to deduct credit
    'unknown'             -- Unknown error
  )),

  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_metadata JSONB,  -- Additional structured error data

  -- Context
  http_status_code INTEGER,  -- For webhook errors
  retry_count INTEGER DEFAULT 0,
  is_recoverable BOOLEAN DEFAULT TRUE,  -- Can this error be retried?

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_validation_errors_validation_id ON validation_errors(validation_id);
CREATE INDEX IF NOT EXISTS idx_validation_errors_queue_id ON validation_errors(queue_id);
CREATE INDEX IF NOT EXISTS idx_validation_errors_user_id ON validation_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_errors_step ON validation_errors(error_step);
CREATE INDEX IF NOT EXISTS idx_validation_errors_created_at ON validation_errors(created_at DESC);

-- RLS Policies
ALTER TABLE validation_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own errors"
  ON validation_errors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert errors"
  ON validation_errors FOR INSERT
  WITH CHECK (true);  -- Allow service to log errors


-- ============================================================================
-- 3. UPDATE VALIDATIONS TABLE
-- ============================================================================
-- Add retry tracking and error reference to existing validations table
ALTER TABLE validations
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS queue_id UUID REFERENCES validation_queue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_validations_queue_id ON validations(queue_id);


-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to update queue updated_at timestamp
CREATE OR REPLACE FUNCTION update_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validation_queue_updated_at
  BEFORE UPDATE ON validation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_updated_at();


-- Function to calculate next retry time with exponential backoff
CREATE OR REPLACE FUNCTION calculate_next_retry(
  attempt_count INTEGER,
  base_delay_seconds INTEGER DEFAULT 2
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  -- Exponential backoff: 2s, 4s, 8s, 16s, etc.
  RETURN NOW() + (base_delay_seconds * POWER(2, attempt_count)) * INTERVAL '1 second';
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Function to get queue statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_queue_statistics()
RETURNS TABLE (
  pending_count BIGINT,
  processing_count BIGINT,
  completed_count BIGINT,
  failed_count BIGINT,
  avg_retry_count NUMERIC,
  oldest_pending TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'processing') AS processing_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
    AVG(attempts) FILTER (WHERE status = 'completed' OR status = 'failed') AS avg_retry_count,
    MIN(created_at) FILTER (WHERE status = 'pending') AS oldest_pending
  FROM validation_queue
  WHERE created_at > NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;


-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  total_errors BIGINT,
  errors_by_step JSONB,
  error_rate NUMERIC,
  most_common_errors JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_errors,
    jsonb_object_agg(error_step, step_count) AS errors_by_step,
    (COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM validations WHERE created_at > NOW() - (days_back || ' days')::INTERVAL), 0) * 100) AS error_rate,
    (
      SELECT jsonb_agg(row_to_json(t))
      FROM (
        SELECT error_message, COUNT(*) as count
        FROM validation_errors
        WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
        GROUP BY error_message
        ORDER BY count DESC
        LIMIT 5
      ) t
    ) AS most_common_errors
  FROM (
    SELECT error_step, COUNT(*) as step_count
    FROM validation_errors
    WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
    GROUP BY error_step
  ) step_counts;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE validation_queue IS 'Queue for async validation processing with retry capability';
COMMENT ON TABLE validation_errors IS 'Detailed error logging for validation failures';
COMMENT ON COLUMN validation_queue.status IS 'Current status: pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN validation_queue.attempts IS 'Number of processing attempts made';
COMMENT ON COLUMN validation_queue.input_data IS 'Serialized RunValidationInput for retry';
COMMENT ON COLUMN validation_queue.file_refs IS 'File references for re-upload on retry';
COMMENT ON COLUMN validation_errors.error_step IS 'Which step in validation pipeline failed';
COMMENT ON COLUMN validation_errors.is_recoverable IS 'Whether this error can be resolved by retry';
