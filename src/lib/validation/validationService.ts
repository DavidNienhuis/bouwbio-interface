import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendValidationRequest } from "@/lib/webhookClient";
import {
  uploadPDFsToStorage,
  uploadPDFsToKnowledgeBank,
  StoredFile,
} from "@/lib/storageClient";
import {
  updateKnowledgeBank,
  checkKnowledgeBankExists,
} from "@/hooks/useKnowledgeBank";
import {
  RunValidationInput,
  RunValidationResult,
  ValidationError,
} from "./types";

/**
 * Orchestrates the complete validation flow:
 * 1. Upload PDFs to Supabase storage
 * 2. Check and upload to knowledge bank (if first validation for EAN)
 * 3. Call AI validation webhook
 * 4. Deduct credit from user account
 * 5. Save validation record to database
 * 6. Update knowledge bank with results
 *
 * @param input - Validation input parameters
 * @returns Validation result with parsed data and stored files
 * @throws ValidationError if validation fails
 */
export async function runValidation(
  input: RunValidationInput
): Promise<RunValidationResult> {
  const {
    userId,
    sessionId,
    productId,
    productName,
    eanCode,
    selectedCertification,
    selectedProductType,
    uploadedFiles,
    deductCredit,
  } = input;

  let savedStoredFiles: StoredFile[] = [];
  let kbSourceFiles: StoredFile[] | null = null;

  try {
    // Step 1: Upload PDFs to storage
    toast.info("PDF bestanden opslaan...");
    savedStoredFiles = await uploadPDFsToStorage(
      uploadedFiles,
      userId,
      sessionId
    );
    console.log("✅ PDFs opgeslagen:", savedStoredFiles);

    // Step 2: Check knowledge bank for first validation
    if (eanCode && selectedCertification) {
      const kbExists = await checkKnowledgeBankExists(
        eanCode,
        selectedCertification
      );

      if (!kbExists) {
        toast.info(
          "Eerste validatie voor dit product - opslaan in kennisbank..."
        );
        kbSourceFiles = await uploadPDFsToKnowledgeBank(
          uploadedFiles,
          eanCode,
          selectedCertification
        );
        console.log("✅ PDFs opgeslagen in Knowledge Bank:", kbSourceFiles);
      }
    }

    // Step 3: Execute AI validation via webhook
    toast.info("Validatie uitvoeren...");
    const validationData = await sendValidationRequest(
      sessionId,
      selectedCertification,
      selectedProductType,
      uploadedFiles,
      eanCode || null,
      productName
    );
    toast.success("Validatie ontvangen!");

    // Step 4: Deduct credit from user
    await deductCredit();

    // Step 5: Save validation record to database
    const { data: savedValidation, error: insertError } = await supabase
      .from("validations")
      .insert({
        user_id: userId,
        session_id: sessionId,
        certification: selectedCertification,
        product_type: selectedProductType as any,
        file_names: uploadedFiles.map((f) => f.name),
        source_files: savedStoredFiles as any,
        result: validationData as any,
        status: "completed",
        product_id: productId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save validation:", insertError);
      // Don't throw - validation succeeded even if DB save failed
    }

    // Step 6: Update knowledge bank with results
    if (eanCode && selectedCertification) {
      const resultData =
        "data" in validationData ? validationData.data : validationData;
      await updateKnowledgeBank(
        eanCode,
        productName,
        selectedCertification,
        selectedProductType,
        resultData,
        kbSourceFiles
      );
    }

    return {
      validationData,
      storedFiles: savedStoredFiles,
      validationId: savedValidation?.id,
    };
  } catch (error) {
    console.error("❌ [ValidationService] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Onbekende fout";
    const validationError: ValidationError = {
      message: errorMessage,
      rawResponse: (error as any).rawResponse,
    };
    throw validationError;
  }
}
