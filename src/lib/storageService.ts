import { supabase, isSupabaseConfigured } from './supabase';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mediaType: 'image' | 'video' | 'audio';
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/aac'];

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AUDIO_SIZE = 30 * 1024 * 1024; // 30MB

export type StorageBucketTarget = 'md-gallery' | 'md-videos' | 'md-favourite-memories';

export function validateMediaFile(file: File): FileValidationResult {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type) || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a');

  if (!isImage && !isVideo && !isAudio) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please choose JPG, PNG, WebP, MP4, WebM, MP3, or WAV.`,
      mediaType: 'image',
    };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image exceeds maximum size limit (15MB). Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      mediaType: 'image',
    };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video exceeds maximum size limit (100MB). Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      mediaType: 'video',
    };
  }

  if (isAudio && file.size > MAX_AUDIO_SIZE) {
    return {
      valid: false,
      error: `Audio file exceeds maximum size limit (30MB). Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      mediaType: 'audio',
    };
  }

  let mediaType: 'image' | 'video' | 'audio' = 'image';
  if (isVideo) mediaType = 'video';
  if (isAudio) mediaType = 'audio';

  return {
    valid: true,
    mediaType,
  };
}

/**
 * Uploads media to the appropriate Supabase Storage bucket.
 * Buckets: 'md-gallery', 'md-videos', or 'md-favourite-memories'.
 */
export async function uploadMediaFile(
  file: File,
  bucketTarget: StorageBucketTarget = 'md-gallery',
  onProgress?: (progress: number) => void
): Promise<{ fileUrl: string; storagePath: string; bucketId: string; mediaType: 'image' | 'video' | 'audio' }> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Automatic target bucket selection
  let targetBucket = bucketTarget;
  if (validation.mediaType === 'video' && targetBucket === 'md-gallery') {
    targetBucket = 'md-videos';
  }

  onProgress?.(25);

  if (isSupabaseConfigured && supabase) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${fileName}`;

    onProgress?.(55);

    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`Supabase storage upload error in ${targetBucket}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    onProgress?.(85);

    const { data: publicUrlData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(data.path);

    onProgress?.(100);

    return {
      fileUrl: publicUrlData.publicUrl,
      storagePath: data.path,
      bucketId: targetBucket,
      mediaType: validation.mediaType,
    };
  }

  // Fallback: Local Base64 / Blob storage for instant local preview/offline test
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      onProgress?.(100);
      resolve({
        fileUrl: reader.result as string,
        storagePath: `local-${file.name}`,
        bucketId: targetBucket,
        mediaType: validation.mediaType,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file locally.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Safely replaces a file:
 * 1. Uploads the new file first.
 * 2. If the upload succeeds, removes the old file from storage.
 * 3. If the upload fails, the old file remains preserved.
 */
export async function replaceMediaFile(
  oldStoragePath: string | undefined,
  oldBucketId: StorageBucketTarget = 'md-gallery',
  newFile: File,
  onProgress?: (progress: number) => void
): Promise<{ fileUrl: string; storagePath: string; bucketId: string; mediaType: 'image' | 'video' | 'audio' }> {
  // Step 1: Upload new file first
  const newUpload = await uploadMediaFile(newFile, oldBucketId, onProgress);

  // Step 2: Delete old file if present
  if (oldStoragePath && oldStoragePath !== newUpload.storagePath) {
    try {
      await deleteMediaFile(oldStoragePath, oldBucketId);
    } catch (e) {
      console.warn('Could not clean up replaced file:', e);
    }
  }

  return newUpload;
}

/**
 * Deletes a file from Supabase storage bucket
 */
export async function deleteMediaFile(storagePath: string, bucketId: StorageBucketTarget = 'md-gallery'): Promise<boolean> {
  if (isSupabaseConfigured && supabase && !storagePath.startsWith('local-')) {
    const { error } = await supabase.storage.from(bucketId).remove([storagePath]);
    if (error) {
      console.warn(`Failed to delete file from storage bucket ${bucketId}:`, error.message);
      return false;
    }
  }
  return true;
}
