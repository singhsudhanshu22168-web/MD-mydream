export type MediaType = 'image' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  caption: string;
  mediaType: 'image' | 'video';
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
  rotation?: number;
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

export interface HeroContent {
  badgeText: string;
  headingPrefix: string;
  headingName: string;
  subtitle: string;
  whisperQuote: string;
  ctaStoryText: string;
  ctaLetterText: string;
  backgroundImageUrl?: string;
}

export interface BirthdayLetter {
  id?: string;
  salutation: string;
  subtitle: string;
  paragraphs: string[];
  signOffTitle: string;
  signOffName: string;
  photoUrl?: string;
  updatedAt?: string;
}

export interface OurMelody {
  title: string;
  artist: string;
  audioUrl: string;
  volume: number;
}

export interface OpenWhenLetter {
  id: string;
  title: string;
  subtitle: string;
  envelopeLabel: string;
  content: string;
  photoUrl?: string;
  orderIndex: number;
}

export interface FinalSurpriseContent {
  title: string;
  message: string;
  signOff: string;
  photoUrl?: string;
}
