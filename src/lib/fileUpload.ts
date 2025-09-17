import { supabase } from '@/integrations/supabase/client';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  error?: string;
  fileSize?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// File type configurations
export const FILE_CONFIGS = {
  bloodTests: {
    bucket: 'blood-tests',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/heic',
      'image/webp'
    ],
    description: 'Blood test images (JPEG, PNG, GIF, BMP, TIFF, HEIC, WEBP)'
  },
  medicalRecords: {
    bucket: 'medical-records',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/heic',
      'image/webp',
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/avi',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-matroska',
      'video/webm'
    ],
    description: 'Documents, images, and videos (PDF, DOC, DOCX, TXT, RTF, ODT, JPEG, PNG, MP4, MOV, AVI, etc.)'
  }
};

/**
 * Validates a file against the specified configuration
 */
export function validateFile(file: File, config: typeof FILE_CONFIGS.bloodTests | typeof FILE_CONFIGS.medicalRecords): FileValidationResult {
  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB`
    };
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Allowed types: ${config.description}`
    };
  }

  return { isValid: true };
}

/**
 * Generates a unique file path for storage
 */
function generateFilePath(userId: string, fileName: string, caseId?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

  if (caseId) {
    return `${userId}/${caseId}/${timestamp}_${randomString}_${cleanFileName}`;
  }

  return `${userId}/${timestamp}_${randomString}_${cleanFileName}`;
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  userId: string,
  caseId?: string
): Promise<FileUploadResult> {
  try {
    // Validate inputs
    if (!userId || !file.name || !bucket) {
      return {
        success: false,
        error: `Invalid parameters: userId=${userId}, fileName=${file.name}, bucket=${bucket}`
      };
    }

    // Generate unique file path
    const filePath = generateFilePath(userId, file.name, caseId);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Uploads multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  userId: string,
  caseId?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<FileUploadResult[]> {
  const results: FileUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], bucket, userId, caseId);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: `Delete failed: ${error.message}`
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets file extension from file name
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Checks if file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Creates a preview URL for images
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}