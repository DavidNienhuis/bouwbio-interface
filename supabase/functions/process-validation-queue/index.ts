// Supabase Edge Function: Process Validation Queue
// This function should be triggered on a schedule (e.g., every 30 seconds via cron)
// or manually invoked to process pending validations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QueueItem {
  id: string;
  user_id: string;
  product_id: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  input_data: any;
  file_refs: any[] | null;
  error_log: string | null;
  error_details: any | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const maxConcurrent = 3;
    const now = new Date().toISOString();

    // Fetch pending items ready for processing
    const { data: pendingItems, error: fetchError } = await supabaseAdmin
      .from("validation_queue")
      .select("*")
      .eq("status", "pending")
      .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
      .order("created_at", { ascending: true })
      .limit(maxConcurrent);

    if (fetchError) {
      throw new Error(`Failed to fetch queue items: ${fetchError.message}`);
    }

    if (!pendingItems || pendingItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending items to process",
          processed: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Processing ${pendingItems.length} queue items...`);

    // Process each item
    const results = await Promise.allSettled(
      pendingItems.map((item) => processQueueItem(item as QueueItem, supabaseAdmin))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${pendingItems.length} items`,
        successful,
        failed,
        items: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Queue processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function processQueueItem(item: QueueItem, supabaseAdmin: any) {
  console.log(`Processing queue item ${item.id} (attempt ${item.attempts + 1}/${item.max_attempts})`);

  try {
    // Mark as processing
    await supabaseAdmin
      .from("validation_queue")
      .update({
        status: "processing",
        attempts: item.attempts + 1,
        last_attempt_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    // TODO: Actually run the validation here
    // For now, this is a placeholder that simulates processing
    // In production, this should:
    // 1. Upload PDFs to storage (if not already done)
    // 2. Call the n8n webhook
    // 3. Save results to database
    // 4. Update knowledge bank

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, randomly succeed or fail
    const shouldSucceed = Math.random() > 0.3;

    if (shouldSucceed) {
      // Mark as completed
      await supabaseAdmin
        .from("validation_queue")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          error_log: null,
          error_details: null,
        })
        .eq("id", item.id);

      console.log(`✅ Queue item ${item.id} completed successfully`);
      return { success: true, queueId: item.id };
    } else {
      throw new Error("Simulated validation failure");
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : null;
    console.error(`❌ Queue item ${item.id} failed:`, errorMessage);

    // Log error
    await supabaseAdmin.from("validation_errors").insert({
      queue_id: item.id,
      user_id: item.user_id,
      error_step: "webhook_call",
      error_message: errorMessage,
      error_stack: errorStack,
      retry_count: item.attempts + 1,
      is_recoverable: item.attempts + 1 < item.max_attempts,
    });

    // Determine if we should retry
    const shouldRetry = item.attempts + 1 < item.max_attempts;

    if (shouldRetry) {
      // Calculate next retry time with exponential backoff
      const delaySeconds = 2 * Math.pow(2, item.attempts + 1);
      const nextRetryAt = new Date(Date.now() + delaySeconds * 1000).toISOString();

      // Mark as pending for retry
      await supabaseAdmin
        .from("validation_queue")
        .update({
          status: "pending",
          next_retry_at: nextRetryAt,
          error_log: errorMessage,
          error_details: {
            message: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString(),
          },
        })
        .eq("id", item.id);

      console.log(`⏳ Queue item ${item.id} will retry at ${nextRetryAt}`);
      return { success: false, queueId: item.id, willRetry: true, nextRetryAt };
    } else {
      // Max retries reached
      await supabaseAdmin
        .from("validation_queue")
        .update({
          status: "failed",
          error_log: errorMessage,
          error_details: {
            message: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString(),
          },
        })
        .eq("id", item.id);

      console.log(`🚫 Queue item ${item.id} failed permanently after ${item.attempts + 1} attempts`);
      return { success: false, queueId: item.id, willRetry: false };
    }
  }
}
