export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  caption: string;
  mediaType: MediaType;
  fileUrl: string;
  storagePath?: string;
  category: string;
  albumId?: string;
  eventDate?: string;
  rotation?: number;
  createdAt: string;
}

export interface MemoryAlbum {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdAt: string;
}

export interface FavouriteMemory {
  id: string;
  title: string;
  description: string;
  memoryDate: string;
  mediaUrls: string[];
  videoUrl?: string;
  isFavourite: boolean;
  tags?: string[];
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  caption: string;
  note?: string;
  image: string;
  rotation?: number; // visual tilt for polaroid styling (-3 to 3 deg)
}

export interface QuestionItem {
  id: string;
  type: 'text' | 'choice' | 'reflection';
  prompt: string;
  subtitle?: string;
  options?: string[];
  placeholder?: string;
  defaultAnswer?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: 'happy' | 'loved' | 'peaceful' | 'reflective' | 'dreamy';
  created_at?: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  userEmail?: string;
  role?: string;
}
