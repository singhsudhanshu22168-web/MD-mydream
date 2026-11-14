import { supabase, isSupabaseConfigured } from './supabase';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mediaType: 'image' | 'video';
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export type StorageBucketTarget = 'md-gallery' | 'md-videos' | 'md-favourite-memories';

export function validateMediaFile(file: File): FileValidationResult {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || 'unknown'}). Please choose JPG, PNG, WebP, MP4, or WebM.`,
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

  return {
    valid: true,
    mediaType: isVideo ? 'video' : 'image',
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
): Promise<{ fileUrl: string; storagePath: string; bucketId: string; mediaType: 'image' | 'video' }> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Automatic target bucket selection if video is passed to gallery
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
