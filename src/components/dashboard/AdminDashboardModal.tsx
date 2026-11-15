import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MediaItem,
  FavouriteMemory,
  BirthdayLetter,
  OurMelody,
  OpenWhenLetter,
  FinalSurpriseContent,
  HeroContent,
  QuestionItem,
  DiaryEntry,
} from '../../lib/types';
import {
  fetchAllMedia,
  saveMediaItem,
  updateMediaItem,
  deleteMediaItem,
  fetchFavouriteMemories,
  saveFavouriteMemory,
  updateFavouriteMemory,
  deleteFavouriteMemory,
} from '../../lib/mediaService';
import { uploadMediaFile, replaceMediaFile, StorageBucketTarget } from '../../lib/storageService';
import {
  fetchHeroContent,
  saveHeroContent,
  fetchBirthdayLetter,
  saveBirthdayLetter,
  fetchOurMelody,
  saveOurMelody,
  fetchOpenWhenLetters,
  saveOpenWhenLetters,
  fetchFinalSurprise,
  saveFinalSurprise,
} from '../../lib/contentService';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { verifyDashboardPassword } from '../../lib/dashboardAuthService';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Video,
  Heart,
  BookOpen,
  HelpCircle,
  HardDrive,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Music,
  Mail,
  Gift,
  FileText,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Home,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'explorer' | 'upload' | 'hero' | 'letter' | 'openwhen' | 'melody' | 'surprise' | 'questions' | 'overview'
  >('explorer');

  // Core Data Collections
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [favouritesList, setFavouritesList] = useState<FavouriteMemory[]>([]);
  const [answersList, setAnswersList] = useState<Record<string, string>>({});
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [letter, setLetter] = useState<BirthdayLetter | null>(null);
  const [melody, setMelody] = useState<OurMelody | null>(null);
  const [openWhenLetters, setOpenWhenLetters] = useState<OpenWhenLetter[]>([]);
  const [selectedOpenWhenId, setSelectedOpenWhenId] = useState<string>('ow-miss-me');
  const [surpriseContent, setSurpriseContent] = useState<FinalSurpriseContent | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'gallery' | 'favourites' | 'letter' | 'openwhen'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');

  // Multi-Selection State for Media Deletion
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Replacement Modal State (Safe Replacement)
  const [replacingItem, setReplacingItem] = useState<{
    id: string;
    title: string;
    currentUrl: string;
    storagePath?: string;
    bucketId: StorageBucketTarget;
    type: 'gallery' | 'favourites' | 'letter' | 'surprise' | 'openwhen';
  } | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Delete Confirmation Modal State (Safe Deletion)
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    title: string;
    type: 'gallery' | 'favourites' | 'batch-gallery';
    storagePath?: string;
  } | null>(null);

  // Upload Form State
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; type: 'image' | 'video' | 'audio'; name: string }[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const [uploadDate, setUploadDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Global Status Banner
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Caption/Title Modal State
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDate, setEditDate] = useState('');

  // Dashboard Security State (Protected Access Gate)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  // Handle unlocking dashboard via backend password verification
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessPassword.trim()) {
      setAuthError('Please enter your dashboard access password.');
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const result = await verifyDashboardPassword(accessPassword);
      if (result.success) {
        setIsUnlocked(true);
        setAccessPassword('');
        setAuthError('');
        // Trigger data loading now that authentication is verified
        await loadData();
      } else {
        setAuthError(result.error || 'Incorrect dashboard password. Please try again.');
      }
    } catch {
      setAuthError('Security verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Lock dashboard and reset authorization state
  const handleLockDashboard = () => {
    setIsUnlocked(false);
    setAccessPassword('');
    setAuthError('');
    setActiveTab('explorer');
  };

  // Close dashboard and lock it
  const handleCloseDashboard = () => {
    setIsUnlocked(false);
    setAccessPassword('');
    setAuthError('');
    onClose();
  };

  const loadData = async () => {
    const m = await fetchAllMedia();
    const f = await fetchFavouriteMemories();
    const h = await fetchHeroContent();
    const l = await fetchBirthdayLetter();
    const mel = await fetchOurMelody();
    const ow = await fetchOpenWhenLetters();
    const sur = await fetchFinalSurprise();

    setMediaList(m);
    setFavouritesList(f);
    setHeroContent(h);
    setLetter(l);
    setMelody(mel);
    setOpenWhenLetters(ow);
    setSurpriseContent(sur);

    try {
      const savedAnswers = localStorage.getItem('md_answers');
      if (savedAnswers) setAnswersList(JSON.parse(savedAnswers));
    } catch {}
  };

  useEffect(() => {
    if (isOpen && isUnlocked) {
      loadData();
    }
  }, [isOpen, isUnlocked]);

  // Filtered Media in Explorer
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.eventDate && item.eventDate.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'all' || item.mediaType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [mediaList, searchQuery, typeFilter]);

  // -------------------------------------------------------------------------
  // 1. REPLACEMENT WORKFLOW (SAFE & ATOMIC)
  // -------------------------------------------------------------------------
  const handleSelectReplacementFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacementFile(file);
    setReplacementPreview(URL.createObjectURL(file));
  };

  const handleConfirmReplacement = async () => {
    if (!replacingItem || !replacementFile) return;

    setIsReplacing(true);
    setStatusMessage(null);

    try {
      // 1. Upload new file first; if it succeeds, clean up old file
      const res = await replaceMediaFile(
        replacingItem.storagePath,
        replacingItem.bucketId,
        replacementFile
      );

      // 2. Update specific content record
      if (replacingItem.type === 'gallery') {
        const existing = await fetchAllMedia();
        const index = existing.findIndex((m) => m.id === replacingItem.id);
        if (index !== -1) {
          existing[index].fileUrl = res.fileUrl;
          existing[index].storagePath = res.storagePath;
          localStorage.setItem('md_dynamic_media', JSON.stringify(existing));

          if (isSupabaseConfigured && supabase) {
            await supabase
              .from('media')
              .update({ file_url: res.fileUrl, storage_path: res.storagePath })
              .eq('id', replacingItem.id);
          }
        }
      } else if (replacingItem.type === 'letter' && letter) {
        const updated = { ...letter, photoUrl: res.fileUrl };
        setLetter(updated);
        await saveBirthdayLetter(updated);
      } else if (replacingItem.type === 'surprise' && surpriseContent) {
        const updated = { ...surpriseContent, photoUrl: res.fileUrl };
        setSurpriseContent(updated);
        await saveFinalSurprise(updated);
      } else if (replacingItem.type === 'openwhen' && activeOpenWhen) {
        const updated = openWhenLetters.map((l) =>
          l.id === activeOpenWhen.id ? { ...l, photoUrl: res.fileUrl } : l
        );
        setOpenWhenLetters(updated);
        await saveOpenWhenLetters(updated);
      }

      setStatusMessage({ type: 'success', text: `Successfully replaced content for "${replacingItem.title}"!` });
      setReplacingItem(null);
      setReplacementFile(null);
      setReplacementPreview(null);
      await loadData();
      onRefreshData?.();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Replacement failed: ${err.message || 'Check connection.'}` });
    } finally {
      setIsReplacing(false);
    }
  };

  // -------------------------------------------------------------------------
  // 2. SAFE DELETION WORKFLOW
  // -------------------------------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      if (deletingItem.type === 'gallery') {
        await deleteMediaItem(deletingItem.id, deletingItem.storagePath);
      } else if (deletingItem.type === 'favourites') {
        await deleteFavouriteMemory(deletingItem.id);
      } else if (deletingItem.type === 'batch-gallery') {
        for (const id of selectedMediaIds) {
          const item = mediaList.find((m) => m.id === id);
          if (item) await deleteMediaItem(id, item.storagePath);
        }
        setSelectedMediaIds([]);
        setIsMultiSelectMode(false);
      }

      setStatusMessage({ type: 'success', text: `Permanently removed "${deletingItem.title}".` });
      setDeletingItem(null);
      await loadData();
      onRefreshData?.();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Deletion failed: ${err.message}` });
    }
  };

  // -------------------------------------------------------------------------
  // 3. MEDIA UPLOAD WORKFLOW
  // -------------------------------------------------------------------------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedUploadFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? ('video' as const) : file.type.startsWith('audio/') ? ('audio' as const) : ('image' as const),
      name: file.name,
    }));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeUploadFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]?.url);
    setSelectedUploadFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUploadFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one photograph or video.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setStatusMessage(null);

    try {
      for (let i = 0; i < selectedUploadFiles.length; i++) {
        const file = selectedUploadFiles[i];
        const res = await uploadMediaFile(
          file,
          file.type.startsWith('video/') ? 'md-videos' : 'md-gallery',
          (p) => setUploadProgress(Math.round(((i + p / 100) / selectedUploadFiles.length) * 100))
        );

        if (res.mediaType === 'image' || res.mediaType === 'video') {
          await saveMediaItem({
            title: uploadTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
            caption: uploadCaption.trim() || 'A beautiful memory with Vijeta',
            mediaType: res.mediaType,
            fileUrl: res.fileUrl,
            storagePath: res.storagePath,
            category: uploadCategory,
            eventDate: uploadDate.trim() || 'A Sweet Day',
          });
        }
      }

      setStatusMessage({ type: 'success', text: `Uploaded ${selectedUploadFiles.length} media file(s) successfully!` });
      setSelectedUploadFiles([]);
      setFilePreviews([]);
      setUploadTitle('');
      setUploadCaption('');
      setUploadDate('');
      await loadData();
      onRefreshData?.();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // -------------------------------------------------------------------------
  // 4. HERO SECTION SAVE
  // -------------------------------------------------------------------------
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroContent) return;
    await saveHeroContent(heroContent);
    setStatusMessage({ type: 'success', text: 'Birthday Homepage text updated!' });
    onRefreshData?.();
  };

  // -------------------------------------------------------------------------
  // 5. BIRTHDAY LETTER SAVE
  // -------------------------------------------------------------------------
  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter) return;
    await saveBirthdayLetter(letter);
    setStatusMessage({ type: 'success', text: 'Birthday letter saved successfully!' });
    onRefreshData?.();
  };

  // -------------------------------------------------------------------------
  // 6. OPEN WHEN SAVE
  // -------------------------------------------------------------------------
  const activeOpenWhen = openWhenLetters.find((l) => l.id === selectedOpenWhenId) || openWhenLetters[0];

  const updateActiveOpenWhen = (field: keyof OpenWhenLetter, val: any) => {
    setOpenWhenLetters((prev) =>
      prev.map((l) => (l.id === activeOpenWhen?.id ? { ...l, [field]: val } : l))
    );
  };

  const handleSaveOpenWhen = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveOpenWhenLetters(openWhenLetters);
    setStatusMessage({ type: 'success', text: 'Open When letter updated!' });
    onRefreshData?.();
  };

  // -------------------------------------------------------------------------
  // 7. OUR MELODY (AUDIO) SAVE
  // -------------------------------------------------------------------------
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !melody) return;

    try {
      setIsUploading(true);
      const res = await uploadMediaFile(file, 'md-gallery', setUploadProgress);
      setMelody({ ...melody, audioUrl: res.fileUrl, title: file.name.replace(/\.[^/.]+$/, '') });
      setStatusMessage({ type: 'success', text: 'Song uploaded & ready to play!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Audio upload failed' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveMelody = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!melody) return;
    await saveOurMelody(melody);
    setStatusMessage({ type: 'success', text: 'Melody settings saved!' });
    onRefreshData?.();
  };

  // -------------------------------------------------------------------------
  // 8. FINAL SURPRISE SAVE
  // -------------------------------------------------------------------------
  const handleSaveSurprise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surpriseContent) return;
    await saveFinalSurprise(surpriseContent);
    setStatusMessage({ type: 'success', text: 'Final surprise wish saved!' });
    onRefreshData?.();
  };

  if (!isOpen) return null;

  // Render romantic password protection screen when locked
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-espresso/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="bg-warm-ivory max-w-md w-full rounded-2xl shadow-2xl border border-dusty-rose/40 p-8 sm:p-10 relative overflow-hidden text-center"
        >
          {/* Subtle ambient romantic glows */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-dusty-rose/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-champagne-beige/40 rounded-full blur-2xl pointer-events-none" />

          {/* Close / Cancel Button */}
          <button
            onClick={handleCloseDashboard}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 text-deep-espresso/60 hover:text-deep-espresso hover:bg-white transition-all flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* MD Crest Emblem */}
          <div className="w-16 h-16 rounded-full bg-champagne-beige/60 border border-muted-burgundy/30 flex items-center justify-center mx-auto mb-4 text-muted-burgundy shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-deep-espresso mb-1.5">
            Manage Sanctuary
          </h3>

          <p className="font-sans text-xs text-deep-espresso/70 font-light max-w-xs mx-auto mb-6">
            Enter the authorized password to access the Content Management Dashboard for Vijeta.
          </p>

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={accessPassword}
                onChange={(e) => {
                  setAccessPassword(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter dashboard password..."
                autoFocus
                disabled={isVerifying}
                className="w-full bg-white/85 border border-dusty-rose/40 rounded-xl py-3 pl-10 pr-11 text-sm font-sans text-deep-espresso placeholder:text-deep-espresso/40 focus:outline-none focus:border-muted-burgundy focus:ring-1 focus:ring-muted-burgundy/30 transition-all text-center"
              />
              <KeyRound className="w-4 h-4 text-dusty-rose absolute left-3.5 top-3.5 pointer-events-none" />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-deep-espresso/45 hover:text-muted-burgundy transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-sans text-red-700 bg-red-50/90 py-2.5 px-3 rounded-lg border border-red-200/70 text-center"
              >
                {authError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !accessPassword.trim()}
              className="w-full py-3 rounded-xl bg-muted-burgundy text-warm-ivory text-sm font-sans tracking-wide hover:bg-burgundy-dark transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying with Sanctuary...' : 'Unlock Dashboard'}</span>
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-sans text-deep-espresso/50">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-burgundy" />
            <span>Protected Sanctuary • Backend Verified</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-deep-espresso/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-warm-ivory max-w-6xl w-full h-[94vh] rounded-2xl shadow-2xl overflow-hidden border border-dusty-rose/40 flex flex-col relative"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-champagne-beige/40 border-b border-dusty-rose/25 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted-burgundy text-warm-ivory flex items-center justify-center font-serif font-bold text-base shadow-xs">
              MD
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-deep-espresso font-medium flex items-center gap-2">
                <span>Global Content Manager</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-champagne-beige/60 text-muted-burgundy font-normal">
                  Full Control
                </span>
              </h2>
              <p className="text-[11px] font-sans text-deep-espresso/60">
                Edit, Replace, or Delete any photo, video, music, or letter • Live Instant Updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Lock / Logout Dashboard Button */}
            <button
              onClick={handleLockDashboard}
              className="flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-full bg-champagne-beige/60 hover:bg-champagne-beige text-muted-burgundy transition-all border border-dusty-rose/30 shadow-xs cursor-pointer"
              title="Lock Dashboard and require password again"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Dashboard</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleCloseDashboard}
              className="w-9 h-9 rounded-full bg-white/70 text-deep-espresso flex items-center justify-center hover:bg-white hover:text-muted-burgundy transition-all cursor-pointer"
              title="Close Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 pt-3 border-b border-dusty-rose/20 bg-warm-ivory overflow-x-auto shrink-0">
          {[
            { id: 'explorer', label: `All Content Explorer (${mediaList.length})`, icon: Layers },
            { id: 'upload', label: 'Upload New Media', icon: UploadCloud },
            { id: 'hero', label: 'Birthday Homepage', icon: Home },
            { id: 'letter', label: 'Birthday Letter', icon: FileText },
            { id: 'openwhen', label: `Open When (${openWhenLetters.length})`, icon: Mail },
            { id: 'melody', label: 'Our Melody', icon: Music },
            { id: 'surprise', label: 'Final Surprise', icon: Gift },
            { id: 'questions', label: 'Questions & Answers', icon: HelpCircle },
            { id: 'overview', label: 'System Overview', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setStatusMessage(null);
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-sans rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-muted-burgundy text-muted-burgundy font-medium bg-champagne-beige/30'
                    : 'border-transparent text-deep-espresso/60 hover:text-deep-espresso hover:bg-white/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Alert Notification */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-sans flex items-center justify-between shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <X className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-deep-espresso/40 hover:text-deep-espresso cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Main Dashboard Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-warm-ivory">
          {/* =========================================================================
              TAB 1: ALL CONTENT EXPLORER (Search, Filter, Edit, Replace, Delete)
             ========================================================================= */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/70 p-4 rounded-xl border border-dusty-rose/30">
                {/* Search Field */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-dusty-rose absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search photos, videos, captions, or dates..."
                    className="w-full bg-white border border-dusty-rose/40 rounded-lg pl-10 pr-4 py-2 text-xs font-sans text-deep-espresso placeholder:text-deep-espresso/40 focus:outline-none focus:border-muted-burgundy"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-espresso/40 hover:text-deep-espresso text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="bg-white border border-dusty-rose/40 rounded-lg px-3 py-2 text-xs font-sans text-deep-espresso focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Photographs Only</option>
                    <option value="video">Videos Only</option>
                  </select>

                  <button
                    onClick={() => {
                      setIsMultiSelectMode(!isMultiSelectMode);
                      setSelectedMediaIds([]);
                    }}
                    className={`px-3 py-2 text-xs font-sans rounded-lg border transition-all cursor-pointer ${
                      isMultiSelectMode
                        ? 'bg-muted-burgundy text-warm-ivory border-muted-burgundy'
                        : 'bg-white text-deep-espresso/70 border-dusty-rose/40 hover:bg-champagne-beige/40'
                    }`}
                  >
                    {isMultiSelectMode ? 'Cancel Multi-Select' : 'Select Multiple'}
                  </button>

                  {isMultiSelectMode && selectedMediaIds.length > 0 && (
                    <button
                      onClick={() =>
                        setDeletingItem({
                          id: 'batch',
                          title: `${selectedMediaIds.length} selected items`,
                          type: 'batch-gallery',
                        })
                      }
                      className="px-3 py-2 text-xs font-sans bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete ({selectedMediaIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Items Grid with EDIT | REPLACE | DELETE */}
              {filteredMedia.length === 0 ? (
                <div className="paper-card p-14 text-center rounded-xl">
                  <ImageIcon className="w-10 h-10 text-dusty-rose mx-auto mb-3" />
                  <p className="font-serif text-xl text-deep-espresso">No items found matching your filter</p>
                  <p className="text-xs font-sans text-deep-espresso/50 mt-1">
                    Try another search term or click "Upload New Media" to add your memories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredMedia.map((item) => {
                    const isSelected = selectedMediaIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`paper-card rounded-xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group relative ${
                          isSelected
                            ? 'border-muted-burgundy ring-2 ring-muted-burgundy/30 shadow-lg'
                            : 'border-dusty-rose/30 hover:border-muted-burgundy/50 hover:shadow-md'
                        }`}
                      >
                        {/* Multi-Select Checkbox */}
                        {isMultiSelectMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMediaIds((prev) =>
                                isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded bg-white shadow-md flex items-center justify-center text-muted-burgundy cursor-pointer"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-deep-espresso/30" />}
                          </button>
                        )}

                        {/* Media Visual Preview */}
                        <div className="relative aspect-4/3 w-full bg-champagne-beige/30 overflow-hidden">
                          {item.mediaType === 'image' ? (
                            <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-deep-espresso flex items-center justify-center relative">
                              <video src={item.fileUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Video className="w-8 h-8 text-dusty-rose" />
                              </div>
                            </div>
                          )}

                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-deep-espresso/60 backdrop-blur-xs text-[10px] font-sans uppercase text-warm-ivory">
                            {item.mediaType}
                          </span>
                        </div>

                        {/* Content Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-sans text-deep-espresso/50 mb-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-dusty-rose" />
                                <span>{item.eventDate || 'Memory'}</span>
                              </span>
                              <span className="capitalize">{item.category}</span>
                            </div>

                            <h4 className="font-serif text-lg text-deep-espresso font-medium line-clamp-1">
                              {item.title}
                            </h4>

                            <p className="font-handwriting text-base text-muted-burgundy line-clamp-2 mt-1">
                              "{item.caption}"
                            </p>
                          </div>

                          {/* ACTION BUTTONS: EDIT | REPLACE | DELETE */}
                          <div className="mt-4 pt-3 border-t border-dusty-rose/20 grid grid-cols-3 gap-1 text-center">
                            {/* 1. EDIT BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMedia(item);
                                setEditTitle(item.title);
                                setEditCaption(item.caption);
                                setEditDate(item.eventDate || '');
                              }}
                              className="px-2 py-1.5 rounded-md text-[11px] font-sans text-deep-espresso/70 hover:text-deep-espresso hover:bg-champagne-beige/50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Edit title & caption"
                            >
                              <Edit2 className="w-3 h-3 text-muted-burgundy" />
                              <span>EDIT</span>
                            </button>

                            {/* 2. REPLACE BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                setReplacingItem({
                                  id: item.id,
                                  title: item.title,
                                  currentUrl: item.fileUrl,
                                  storagePath: item.storagePath,
                                  bucketId: item.mediaType === 'video' ? 'md-videos' : 'md-gallery',
                                  type: 'gallery',
                                });
                                setReplacementFile(null);
                                setReplacementPreview(null);
                              }}
                              className="px-2 py-1.5 rounded-md text-[11px] font-sans text-deep-espresso/70 hover:text-muted-burgundy hover:bg-champagne-beige/50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Replace with new photo or video"
                            >
                              <RefreshCw className="w-3 h-3 text-dusty-rose" />
                              <span>REPLACE</span>
                            </button>

                            {/* 3. DELETE BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingItem({
                                  id: item.id,
                                  title: item.title,
                                  type: 'gallery',
                                  storagePath: item.storagePath,
                                });
                              }}
                              className="px-2 py-1.5 rounded-md text-[11px] font-sans text-deep-espresso/70 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Permanently delete item"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: UPLOAD NEW MEDIA
             ========================================================================= */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-serif text-3xl text-deep-espresso">Upload Photographs & Videos</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  Upload multiple files at once. Everything appears in the live gallery automatically.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 paper-card p-6 rounded-xl">
                <div className="border-2 border-dashed border-dusty-rose/50 rounded-xl p-8 text-center bg-white/60 hover:bg-white transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    onChange={handleFileSelect}
                    id="dash-upload-input"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="dash-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-champagne-beige/60 text-muted-burgundy flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-lg text-deep-espresso">Select Photos or Videos</span>
                    <span className="text-xs font-sans text-deep-espresso/50">
                      Supports JPG, JPEG, PNG, WebP, MP4, WebM • Batch selection allowed
                    </span>
                  </label>
                </div>

                {filePreviews.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-sans font-medium text-deep-espresso">
                      Selected Files ({filePreviews.length}):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {filePreviews.map((p, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-dusty-rose/40 group">
                          {p.type === 'image' ? (
                            <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-deep-espresso/80 flex items-center justify-center text-warm-ivory">
                              <Video className="w-6 h-6 text-dusty-rose" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeUploadFile(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Title</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Under the amber streetlights"
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Date</label>
                    <input
                      type="text"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      placeholder="e.g. October 14 / Sunset"
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Caption</label>
                  <textarea
                    rows={2}
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Write a sweet handwritten caption..."
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading || selectedUploadFiles.length === 0}
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isUploading ? `Uploading (${uploadProgress}%)` : 'Upload To Gallery'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 3: BIRTHDAY HOMEPAGE / HERO
             ========================================================================= */}
          {activeTab === 'hero' && heroContent && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-serif text-3xl text-deep-espresso">Customize Birthday Homepage</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  Control the hero welcoming headline, subtitle, and handwritten whisper quote.
                </p>
              </div>

              <form onSubmit={handleSaveHero} className="paper-card p-6 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Top Badge Pill</label>
                  <input
                    type="text"
                    value={heroContent.badgeText}
                    onChange={(e) => setHeroContent({ ...heroContent, badgeText: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Heading Prefix</label>
                    <input
                      type="text"
                      value={heroContent.headingPrefix}
                      onChange={(e) => setHeroContent({ ...heroContent, headingPrefix: e.target.value })}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Her Name</label>
                    <input
                      type="text"
                      value={heroContent.headingName}
                      onChange={(e) => setHeroContent({ ...heroContent, headingName: e.target.value })}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Welcome Subtitle</label>
                  <textarea
                    rows={3}
                    value={heroContent.subtitle}
                    onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Handwritten Whisper Quote</label>
                  <input
                    type="text"
                    value={heroContent.whisperQuote}
                    onChange={(e) => setHeroContent({ ...heroContent, whisperQuote: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all cursor-pointer shadow-xs"
                  >
                    Save Homepage Text
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 4: BIRTHDAY LETTER (Edit, Replace Photo, Delete Photo)
             ========================================================================= */}
          {activeTab === 'letter' && letter && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-serif text-3xl text-deep-espresso">Personalize Birthday Letter</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  Customize the letter inside the wax-sealed envelope.
                </p>
              </div>

              <form onSubmit={handleSaveLetter} className="paper-card p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Salutation</label>
                    <input
                      type="text"
                      value={letter.salutation}
                      onChange={(e) => setLetter({ ...letter, salutation: e.target.value })}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={letter.subtitle}
                      onChange={(e) => setLetter({ ...letter, subtitle: e.target.value })}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Letter Paragraphs</label>
                  {letter.paragraphs.map((p, idx) => (
                    <textarea
                      key={idx}
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const newP = [...letter.paragraphs];
                        newP[idx] = e.target.value;
                        setLetter({ ...letter, paragraphs: newP });
                      }}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans mb-2 resize-none"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setLetter({ ...letter, paragraphs: [...letter.paragraphs, ''] })}
                    className="text-xs font-sans text-muted-burgundy hover:underline cursor-pointer"
                  >
                    + Add Another Paragraph
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Sign-Off Heading</label>
                    <input
                      type="text"
                      value={letter.signOffTitle}
                      onChange={(e) => setLetter({ ...letter, signOffTitle: e.target.value })}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Handwritten Signature</label>
                    <input
                      type="text"
                      value={letter.signOffName}
                      onChange={(e) => setLetter({ ...letter, signOffName: e.target.value })}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* Attached Letter Photo Actions: REPLACE | DELETE */}
                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Attached Letter Photo</label>
                  {letter.photoUrl ? (
                    <div className="flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-dusty-rose/30">
                      <div className="w-16 h-16 rounded overflow-hidden shrink-0 border">
                        <img src={letter.photoUrl} alt="Letter attachment" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-xs font-sans">
                        <span className="text-deep-espresso/80 font-medium block">Current Letter Photo</span>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplacingItem({
                                id: 'letter-photo',
                                title: 'Birthday Letter Photo',
                                currentUrl: letter.photoUrl || '',
                                bucketId: 'md-gallery',
                                type: 'letter',
                              });
                            }}
                            className="text-muted-burgundy hover:underline flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>REPLACE PHOTO</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setLetter({ ...letter, photoUrl: undefined })}
                            className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>DELETE PHOTO</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await uploadMediaFile(file, 'md-gallery');
                        setLetter({ ...letter, photoUrl: res.fileUrl });
                      }}
                      className="text-xs font-sans"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all cursor-pointer shadow-xs"
                  >
                    Save Birthday Letter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 5: OPEN WHEN LETTERS (Edit, Replace, Delete)
             ========================================================================= */}
          {activeTab === 'openwhen' && activeOpenWhen && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-serif text-3xl text-deep-espresso">Manage "Open When..." Letters</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  Select an envelope below to customize the letter inside.
                </p>
              </div>

              {/* Selector Pills */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {openWhenLetters.map((ow) => (
                  <button
                    key={ow.id}
                    type="button"
                    onClick={() => setSelectedOpenWhenId(ow.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer border ${
                      ow.id === selectedOpenWhenId
                        ? 'bg-muted-burgundy text-warm-ivory border-muted-burgundy font-medium shadow-xs'
                        : 'bg-white/70 text-deep-espresso/70 border-dusty-rose/30 hover:bg-white'
                    }`}
                  >
                    {ow.envelopeLabel}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveOpenWhen} className="paper-card p-6 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Envelope Label</label>
                  <input
                    type="text"
                    value={activeOpenWhen.envelopeLabel}
                    onChange={(e) => updateActiveOpenWhen('envelopeLabel', e.target.value)}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Letter Title</label>
                    <input
                      type="text"
                      value={activeOpenWhen.title}
                      onChange={(e) => updateActiveOpenWhen('title', e.target.value)}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Subtitle Whisper</label>
                    <input
                      type="text"
                      value={activeOpenWhen.subtitle}
                      onChange={(e) => updateActiveOpenWhen('subtitle', e.target.value)}
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Letter Content</label>
                  <textarea
                    rows={6}
                    value={activeOpenWhen.content}
                    onChange={(e) => updateActiveOpenWhen('content', e.target.value)}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans leading-relaxed resize-none"
                  />
                </div>

                {/* Open When Photo */}
                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Optional Photo</label>
                  {activeOpenWhen.photoUrl ? (
                    <div className="flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-dusty-rose/30">
                      <div className="w-16 h-16 rounded overflow-hidden shrink-0 border">
                        <img src={activeOpenWhen.photoUrl} alt="Attached" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-xs font-sans">
                        <span className="text-deep-espresso/80 font-medium block">Current Photo</span>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplacingItem({
                                id: activeOpenWhen.id,
                                title: activeOpenWhen.envelopeLabel,
                                currentUrl: activeOpenWhen.photoUrl || '',
                                bucketId: 'md-gallery',
                                type: 'openwhen',
                              });
                            }}
                            className="text-muted-burgundy hover:underline flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>REPLACE PHOTO</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateActiveOpenWhen('photoUrl', undefined)}
                            className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>DELETE PHOTO</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await uploadMediaFile(file, 'md-gallery');
                        updateActiveOpenWhen('photoUrl', res.fileUrl);
                      }}
                      className="text-xs font-sans"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all cursor-pointer shadow-xs"
                  >
                    Save All "Open When" Letters
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 6: OUR MELODY (Upload, Replace Audio, Delete, Volume)
             ========================================================================= */}
          {activeTab === 'melody' && melody && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-serif text-3xl text-deep-espresso">Background Music & Melody</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  Upload, replace, or customize the romantic background audio.
                </p>
              </div>

              <form onSubmit={handleSaveMelody} className="paper-card p-6 rounded-xl space-y-4">
                <div className="border-2 border-dashed border-dusty-rose/50 rounded-xl p-6 text-center bg-white/60">
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/mpeg,audio/x-m4a,audio/*"
                    onChange={handleAudioUpload}
                    id="audio-upload-input"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="audio-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Music className="w-8 h-8 text-muted-burgundy" />
                    <span className="font-serif text-lg text-deep-espresso">
                      {isUploading ? `Uploading Song... (${uploadProgress}%)` : 'Upload or Replace Song File'}
                    </span>
                    <span className="text-xs font-sans text-deep-espresso/50">
                      Supports MP3, WAV, M4A audio files
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Song Title</label>
                  <input
                    type="text"
                    value={melody.title}
                    onChange={(e) => setMelody({ ...melody, title: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Default Volume ({Math.round(melody.volume * 100)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={melody.volume}
                    onChange={(e) => setMelody({ ...melody, volume: parseFloat(e.target.value) })}
                    className="w-full accent-muted-burgundy cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all cursor-pointer shadow-xs"
                  >
                    Save Melody Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 7: FINAL SURPRISE (Edit, Replace Photo, Delete Photo)
             ========================================================================= */}
          {activeTab === 'surprise' && surpriseContent && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-serif text-3xl text-deep-espresso">Personalize Final Surprise</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  Customize the message that appears after the confetti burst.
                </p>
              </div>

              <form onSubmit={handleSaveSurprise} className="paper-card p-6 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Surprise Card Heading</label>
                  <input
                    type="text"
                    value={surpriseContent.title}
                    onChange={(e) => setSurpriseContent({ ...surpriseContent, title: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Birthday Wish Message</label>
                  <textarea
                    rows={5}
                    value={surpriseContent.message}
                    onChange={(e) => setSurpriseContent({ ...surpriseContent, message: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans leading-relaxed resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Handwritten Love Sign-Off</label>
                  <input
                    type="text"
                    value={surpriseContent.signOff}
                    onChange={(e) => setSurpriseContent({ ...surpriseContent, signOff: e.target.value })}
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                {/* Surprise Photo Actions: REPLACE | DELETE */}
                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Celebratory Photo</label>
                  {surpriseContent.photoUrl ? (
                    <div className="flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-dusty-rose/30">
                      <div className="w-16 h-16 rounded overflow-hidden shrink-0 border">
                        <img src={surpriseContent.photoUrl} alt="Surprise moment" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-xs font-sans">
                        <span className="text-deep-espresso/80 font-medium block">Current Surprise Photo</span>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplacingItem({
                                id: 'surprise-photo',
                                title: 'Final Surprise Photo',
                                currentUrl: surpriseContent.photoUrl || '',
                                bucketId: 'md-gallery',
                                type: 'surprise',
                              });
                            }}
                            className="text-muted-burgundy hover:underline flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>REPLACE PHOTO</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSurpriseContent({ ...surpriseContent, photoUrl: undefined })}
                            className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>DELETE PHOTO</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const res = await uploadMediaFile(file, 'md-gallery');
                        setSurpriseContent({ ...surpriseContent, photoUrl: res.fileUrl });
                      }}
                      className="text-xs font-sans"
                    />
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all cursor-pointer shadow-xs"
                  >
                    Save Final Surprise Wish
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB 8: QUESTIONS & ANSWERS
             ========================================================================= */}
          {activeTab === 'questions' && (
            <div className="max-w-xl mx-auto space-y-4">
              <h3 className="font-serif text-3xl text-deep-espresso text-center">
                Vijeta's Saved Answers
              </h3>

              {Object.keys(answersList).length === 0 ? (
                <p className="text-xs font-sans text-center text-deep-espresso/60 paper-card p-8 rounded-lg">
                  No answers submitted yet. They will appear here in real time as she responds.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(answersList).map(([qId, ans]) => (
                    <div key={qId} className="paper-card p-4 rounded-lg">
                      <span className="text-[10px] uppercase font-sans text-muted-burgundy font-semibold">
                        Prompt ({qId})
                      </span>
                      <p className="font-sans text-sm text-deep-espresso mt-1 font-medium">
                        "{ans}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 9: SYSTEM OVERVIEW
             ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="max-w-xl mx-auto space-y-6">
              <h3 className="font-serif text-3xl text-deep-espresso text-center">System & Storage Status</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Dynamic Media Items</span>
                  <p className="font-serif text-3xl text-muted-burgundy mt-1">{mediaList.length}</p>
                </div>
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Favourite Memories</span>
                  <p className="font-serif text-3xl text-muted-burgundy mt-1">{favouritesList.length}</p>
                </div>
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Open When Envelopes</span>
                  <p className="font-serif text-3xl text-muted-burgundy mt-1">{openWhenLetters.length}</p>
                </div>
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Supabase Cloud Sync</span>
                  <p className="font-sans text-sm font-semibold text-emerald-700 mt-2">
                    {isSupabaseConfigured ? 'Active ☁️' : 'Local Sandbox ⚡'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SAFE REPLACEMENT MODAL (Old Preview -> New Preview -> Confirm)
           ========================================================================= */}
        <AnimatePresence>
          {replacingItem && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="bg-warm-ivory p-6 sm:p-8 rounded-2xl max-w-lg w-full border border-dusty-rose/40 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-dusty-rose/25 pb-3">
                  <h4 className="font-serif text-2xl font-medium text-deep-espresso flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-muted-burgundy" />
                    <span>Replace Content</span>
                  </h4>
                  <button
                    onClick={() => {
                      setReplacingItem(null);
                      setReplacementFile(null);
                      setReplacementPreview(null);
                    }}
                    className="text-deep-espresso/40 hover:text-deep-espresso cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs font-sans text-deep-espresso/70">
                  Replacing <strong className="text-deep-espresso font-semibold">"{replacingItem.title}"</strong>.
                  The original file will remain safe until the new upload completes successfully.
                </p>

                {/* Old vs New Visual Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-sans text-deep-espresso/50 uppercase block mb-1">Current Item</span>
                    <div className="aspect-square rounded-lg overflow-hidden border border-dusty-rose/30 bg-black/10">
                      <img src={replacingItem.currentUrl} alt="Old" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-muted-burgundy uppercase block mb-1 font-semibold">New Replacement</span>
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-muted-burgundy/40 bg-white/60 flex items-center justify-center relative">
                      {replacementPreview ? (
                        <img src={replacementPreview} alt="New Preview" className="w-full h-full object-cover" />
                      ) : (
                        <label className="cursor-pointer text-center p-2">
                          <UploadCloud className="w-6 h-6 text-muted-burgundy mx-auto mb-1" />
                          <span className="text-[11px] font-sans text-deep-espresso block font-medium">Select New File</span>
                          <input type="file" onChange={handleSelectReplacementFile} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {replacementFile && (
                  <p className="text-[11px] font-sans text-emerald-800 bg-emerald-50 p-2 rounded flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Selected: {replacementFile.name} ({(replacementFile.size / 1024).toFixed(0)} KB)</span>
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2 border-t border-dusty-rose/20">
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingItem(null);
                      setReplacementFile(null);
                      setReplacementPreview(null);
                    }}
                    className="px-4 py-2 text-xs font-sans rounded-md border border-dusty-rose/40 text-deep-espresso/70 hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!replacementFile || isReplacing}
                    onClick={handleConfirmReplacement}
                    className="px-6 py-2 text-xs font-sans rounded-md bg-muted-burgundy text-warm-ivory font-medium hover:bg-burgundy-dark disabled:opacity-50 transition-all cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
                    <span>{isReplacing ? 'Uploading & Replacing...' : 'Confirm Replacement'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            SAFE DELETION CONFIRMATION MODAL
           ========================================================================= */}
        <AnimatePresence>
          {deletingItem && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="bg-warm-ivory p-6 sm:p-8 rounded-2xl max-w-md w-full border border-red-200 shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="text-center">
                  <h4 className="font-serif text-2xl font-medium text-deep-espresso">
                    Confirm Permanent Deletion
                  </h4>
                  <p className="text-xs font-sans text-deep-espresso/70 mt-2 leading-relaxed">
                    Are you sure you want to permanently delete:
                    <span className="block font-semibold text-deep-espresso mt-1 text-sm">
                      "{deletingItem.title}"
                    </span>
                    This action will delete the record from the database and storage.
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDeletingItem(null)}
                    className="px-5 py-2.5 text-xs font-sans rounded-lg border border-dusty-rose/40 text-deep-espresso/70 hover:bg-white cursor-pointer"
                  >
                    Cancel, Keep It
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-6 py-2.5 text-xs font-sans rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Permanently Delete</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            EDIT METADATA MODAL (Title, Caption, Date)
           ========================================================================= */}
        <AnimatePresence>
          {editingMedia && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-warm-ivory p-6 sm:p-7 rounded-2xl max-w-md w-full border border-dusty-rose/40 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-dusty-rose/25 pb-3">
                  <h4 className="font-serif text-xl font-medium text-deep-espresso flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-muted-burgundy" />
                    <span>Edit Media Details</span>
                  </h4>
                  <button onClick={() => setEditingMedia(null)} className="text-deep-espresso/40 hover:text-deep-espresso cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Date Stamp</label>
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-white border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">Caption / Backstory</label>
                  <textarea
                    rows={3}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full bg-white border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-dusty-rose/20">
                  <button
                    type="button"
                    onClick={() => setEditingMedia(null)}
                    className="px-4 py-2 text-xs font-sans border rounded-md text-deep-espresso/70 cursor-pointer hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateMediaItem(editingMedia.id, {
                        title: editTitle.trim(),
                        caption: editCaption.trim(),
                        eventDate: editDate.trim(),
                      });
                      setEditingMedia(null);
                      await loadData();
                      onRefreshData?.();
                      setStatusMessage({ type: 'success', text: 'Media details updated!' });
                    }}
                    className="px-5 py-2 text-xs font-sans bg-muted-burgundy text-white rounded-md hover:bg-burgundy-dark cursor-pointer font-medium shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
