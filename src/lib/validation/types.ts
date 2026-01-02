import { ValidationResponse } from "@/lib/webhookClient";
import { StoredFile } from "@/lib/storageClient";

/**
 * Product type definition for validation
 */
export interface ProductType {
  id: string;
  name: string;
  description: string;
}

/**
 * Input parameters for running a validation
 */
export interface RunValidationInput {
  userId: string;
  sessionId: string;
  productId: string;
  productName: string;
  eanCode: string | null;
  selectedCertification: string;
  selectedProductType: ProductType;
  uploadedFiles: File[];
  deductCredit: () => Promise<void>;
}

/**
 * Result returned from running a validation
 */
export interface RunValidationResult {
  validationData: ValidationResponse;
  storedFiles: StoredFile[];
  validationId?: string;
}

/**
 * Error information when validation fails
 */
export interface ValidationError {
  message: string;
  rawResponse?: unknown;
}
