import { supabase, isSupabaseConfigured } from './supabase';
import { MediaItem, FavouriteMemory } from './types';
import { deleteMediaFile, StorageBucketTarget } from './storageService';

const LOCAL_MEDIA_KEY = 'md_dynamic_media';
const LOCAL_FAVOURITES_KEY = 'md_favourite_memories';

// ----------------------------------------------------------------------
// 1. DYNAMIC MEDIA (GALLERY PHOTOS & VIDEOS)
// ----------------------------------------------------------------------

export async function fetchAllMedia(): Promise<MediaItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          caption: item.caption || '',
          mediaType: item.media_type,
          fileUrl: item.file_url,
          storagePath: item.storage_path,
          category: item.category || 'gallery',
          albumId: item.album_id,
          eventDate: item.event_date,
          rotation: item.rotation || 0,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchAllMedia failed, checking local storage:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveMediaItem(
  item: Omit<MediaItem, 'id' | 'createdAt'> & { bucketId?: string }
): Promise<MediaItem> {
  const newItem: MediaItem = {
    ...item,
    id: `media-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('media')
        .insert({
          title: item.title,
          description: item.description,
          caption: item.caption,
          media_type: item.mediaType,
          file_url: item.fileUrl,
          storage_path: item.storagePath || '',
          bucket_id: item.bucketId || (item.mediaType === 'video' ? 'md-videos' : 'md-gallery'),
          category: item.category,
          album_id: item.albumId,
          event_date: item.eventDate,
          rotation: item.rotation || 0,
        })
        .select()
        .single();

      if (!error && data) {
        newItem.id = data.id;
        newItem.createdAt = data.created_at;
      }
    } catch (err) {
      console.warn('Supabase saveMediaItem error:', err);
    }
  }

  // Always keep local mirror updated
  const existing = await fetchAllMedia();
  const updated = [newItem, ...existing.filter((m) => m.id !== newItem.id)];
  localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(updated));

  return newItem;
}

export async function updateMediaItem(
  id: string,
  updates: Partial<Pick<MediaItem, 'title' | 'caption' | 'description' | 'category' | 'eventDate'>>
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('media')
        .update({
          title: updates.title,
          caption: updates.caption,
          description: updates.description,
          category: updates.category,
          event_date: updates.eventDate,
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase updateMediaItem error:', err);
    }
  }

  const existing = await fetchAllMedia();
  const index = existing.findIndex((m) => m.id === id);
  if (index !== -1) {
    existing[index] = { ...existing[index], ...updates };
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(existing));
    return true;
  }
  return false;
}

export async function deleteMediaItem(
  id: string,
  storagePath?: string,
  bucketId: StorageBucketTarget = 'md-gallery'
): Promise<boolean> {
  if (storagePath) {
    await deleteMediaFile(storagePath, bucketId);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('media').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteMediaItem error:', err);
    }
  }

  const existing = await fetchAllMedia();
  const updated = existing.filter((m) => m.id !== id);
  localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(updated));
  return true;
}

// ----------------------------------------------------------------------
// 2. MD'S FAVOURITE MEMORIES
// ----------------------------------------------------------------------

const INITIAL_FAVOURITES: FavouriteMemory[] = [
  {
    id: 'fav-1',
    title: 'The Evening We Decided Forever',
    description: 'Looking at each other under twilight and realizing there is nowhere else in the universe either of us would rather be. The kind of memory that lives in your chest.',
    memoryDate: 'A Night to Remember',
    mediaUrls: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    ],
    isFavourite: true,
    tags: ['Forever', 'Twilight', 'Our Beginning'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fav-2',
    title: 'Dancing In The Living Room',
    description: 'No music needed except the sound of your laugh. You twirled in that oversized sweater, completely unfiltered and radiant.',
    memoryDate: 'Soft Sunday',
    mediaUrls: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    ],
    isFavourite: true,
    tags: ['Unfiltered Joy', 'Silly Smiles'],
    createdAt: new Date().toISOString(),
  },
];

export async function fetchFavouriteMemories(): Promise<FavouriteMemory[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('favourite_memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          memoryDate: item.memory_date,
          mediaUrls: item.media_urls || [],
          videoUrl: item.video_url,
          isFavourite: item.is_favourite ?? true,
          tags: item.tags || [],
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetchFavouriteMemories failed, using local mirror:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_FAVOURITES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(INITIAL_FAVOURITES));
  return INITIAL_FAVOURITES;
}

export async function saveFavouriteMemory(
  memory: Omit<FavouriteMemory, 'id' | 'createdAt'>
): Promise<FavouriteMemory> {
  const newMemory: FavouriteMemory = {
    ...memory,
    id: `fav-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('favourite_memories')
        .insert({
          title: memory.title,
          description: memory.description,
          memory_date: memory.memoryDate,
          media_urls: memory.mediaUrls,
          video_url: memory.videoUrl,
          is_favourite: memory.isFavourite,
          tags: memory.tags,
        })
        .select()
        .single();

      if (!error && data) {
        newMemory.id = data.id;
        newMemory.createdAt = data.created_at;
      }
    } catch (err) {
      console.warn('Supabase saveFavouriteMemory error:', err);
    }
  }

  const existing = await fetchFavouriteMemories();
  const updated = [newMemory, ...existing.filter((m) => m.id !== newMemory.id)];
  localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(updated));
  return newMemory;
}

export async function updateFavouriteMemory(
  id: string,
  updates: Partial<Omit<FavouriteMemory, 'id' | 'createdAt'>>
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('favourite_memories')
        .update({
          title: updates.title,
          description: updates.description,
          memory_date: updates.memoryDate,
          media_urls: updates.mediaUrls,
          video_url: updates.videoUrl,
          is_favourite: updates.isFavourite,
          tags: updates.tags,
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase updateFavouriteMemory error:', err);
    }
  }

  const existing = await fetchFavouriteMemories();
  const index = existing.findIndex((m) => m.id === id);
  if (index !== -1) {
    existing[index] = { ...existing[index], ...updates };
    localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(existing));
    return true;
  }
  return false;
}

export async function deleteFavouriteMemory(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('favourite_memories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteFavouriteMemory error:', err);
    }
  }

  const existing = await fetchFavouriteMemories();
  const updated = existing.filter((m) => m.id !== id);
  localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(updated));
  return true;
}
