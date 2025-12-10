import { supabase } from "@/integrations/supabase/client";

export interface StoredFile {
  original_name: string;
  storage_path: string;
  storage_url: string;
  size_bytes: number;
  uploaded_at: string;
}

/**
 * Upload PDF bestanden naar Supabase Storage
 * @param files - Array van File objects om te uploaden
 * @param userId - ID van de gebruiker
 * @param validationId - ID van de validatie
 * @returns Array van StoredFile objecten met metadata
 */
export const uploadPDFsToStorage = async (
  files: File[],
  userId: string,
  validationId: string
): Promise<StoredFile[]> => {
  const storedFiles: StoredFile[] = [];
  
  for (const file of files) {
    // Maak een unieke filename met timestamp om conflicten te voorkomen
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userId}/${validationId}/${timestamp}_${sanitizedName}`;
    
    console.log(`📤 Uploading ${file.name} to ${storagePath}...`);
    
    const { data, error } = await supabase.storage
      .from('Bronnen')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
      throw new Error(`Upload mislukt voor ${file.name}: ${error.message}`);
    }
    
    // Verkrijg de public URL voor de file
    const { data: urlData } = supabase.storage
      .from('Bronnen')
      .getPublicUrl(storagePath);
    
    storedFiles.push({
      original_name: file.name,
      storage_path: storagePath,
      storage_url: urlData.publicUrl,
      size_bytes: file.size,
      uploaded_at: new Date().toISOString()
    });
    
    console.log(`✅ Uploaded ${file.name}`);
  }
  
  return storedFiles;
};

/**
 * Verkrijg een signed URL voor een private file
 * @param storagePath - Het pad in de storage bucket
 * @param expiresIn - Seconden tot de URL verloopt (default: 1 uur)
 * @returns Signed URL string
 */
export const getSignedUrl = async (
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('Bronnen')
    .createSignedUrl(storagePath, expiresIn);
  
  if (error) {
    console.error('Error creating signed URL:', error);
    throw new Error(`Kon URL niet genereren: ${error.message}`);
  }
  
  return data.signedUrl;
};

/**
 * Zoek een opgeslagen bestand op basis van de originele bestandsnaam
 * @param sourceFiles - Array van StoredFile objecten
 * @param filename - De originele bestandsnaam om te zoeken
 * @returns StoredFile of undefined als niet gevonden
 */
export const findStoredFileByName = (
  sourceFiles: StoredFile[],
  filename: string
): StoredFile | undefined => {
  // Normaliseer de filename (verwijder pad-info en extra tekst)
  const normalizedSearch = filename.toLowerCase().trim();
  
  return sourceFiles.find(file => {
    const normalizedName = file.original_name.toLowerCase().trim();
    // Exact match of partial match
    return normalizedName === normalizedSearch || 
           normalizedName.includes(normalizedSearch) ||
           normalizedSearch.includes(normalizedName);
  });
};

/**
 * Verwijder bestanden uit storage
 * @param storagePaths - Array van storage paden om te verwijderen
 */
export const deleteFilesFromStorage = async (
  storagePaths: string[]
): Promise<void> => {
  const { error } = await supabase.storage
    .from('Bronnen')
    .remove(storagePaths);
  
  if (error) {
    console.error('Error deleting files:', error);
    throw new Error(`Kon bestanden niet verwijderen: ${error.message}`);
  }
};
