import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem, FavouriteMemory } from '../../lib/types';
import {
  fetchAllMedia,
  saveMediaItem,
  updateMediaItem,
  deleteMediaItem,
  fetchFavouriteMemories,
} from '../../lib/mediaService';
import { uploadMediaFile } from '../../lib/storageService';
import { isSupabaseConfigured } from '../../lib/supabase';
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
  const [activeTab, setActiveTab] = useState<'upload' | 'media' | 'favourites' | 'answers' | 'overview'>('upload');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [favouritesList, setFavouritesList] = useState<FavouriteMemory[]>([]);
  const [answersList, setAnswersList] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Upload Form State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; type: 'image' | 'video'; name: string }[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('gallery');
  const [uploadDate, setUploadDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Caption Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const loadData = async () => {
    setLoading(true);
    const m = await fetchAllMedia();
    const f = await fetchFavouriteMemories();
    setMediaList(m);
    setFavouritesList(f);

    try {
      const savedAnswers = localStorage.getItem('md_answers');
      if (savedAnswers) setAnswersList(JSON.parse(savedAnswers));
    } catch {}

    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? ('video' as const) : ('image' as const),
      name: file.name,
    }));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]?.url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one photograph or video.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setStatusMessage(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const res = await uploadMediaFile(file, file.type.startsWith('video/') ? 'md-videos' : 'md-gallery', (p) => {
          setUploadProgress(Math.round(((i + p / 100) / selectedFiles.length) * 100));
        });

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

      setStatusMessage({ type: 'success', text: `Successfully uploaded ${selectedFiles.length} media file(s)!` });
      setSelectedFiles([]);
      setFilePreviews([]);
      setUploadTitle('');
      setUploadCaption('');
      setUploadDate('');
      await loadData();
      onRefreshData?.();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Upload failed. Check file formats.' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMedia = async (id: string, storagePath?: string) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      await deleteMediaItem(id, storagePath);
      await loadData();
      onRefreshData?.();
    }
  };

  const handleSaveCaptionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await updateMediaItem(editingItem.id, { caption: editCaption.trim() });
    setEditingItem(null);
    await loadData();
    onRefreshData?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-deep-espresso/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-warm-ivory max-w-5xl w-full h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-dusty-rose/40 flex flex-col relative"
      >
        {/* Top Dashboard Bar */}
        <div className="px-6 py-4 bg-champagne-beige/40 border-b border-dusty-rose/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted-burgundy text-warm-ivory flex items-center justify-center font-serif font-bold text-sm">
              MD
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-deep-espresso font-medium">
                Content Management Dashboard
              </h2>
              <p className="text-[11px] font-sans text-deep-espresso/60">
                Personal Control Center • {isSupabaseConfigured ? 'Supabase Connected ☁️' : 'Local Sandbox Mode ⚡'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/70 text-deep-espresso flex items-center justify-center hover:bg-white hover:text-muted-burgundy transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 pt-3 border-b border-dusty-rose/20 bg-warm-ivory overflow-x-auto">
          {[
            { id: 'upload', label: 'Upload Media', icon: UploadCloud },
            { id: 'media', label: `Gallery (${mediaList.length})`, icon: ImageIcon },
            { id: 'favourites', label: `Favourites (${favouritesList.length})`, icon: Heart },
            { id: 'answers', label: 'Saved Answers', icon: HelpCircle },
            { id: 'overview', label: 'System Overview', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-sans rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
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

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-warm-ivory">
          {/* 1. UPLOAD MEDIA TAB */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl text-deep-espresso">Upload Photographs & Videos</h3>
                <p className="text-xs font-sans text-deep-espresso/60 mt-1">
                  New uploads automatically appear inside the gallery and memories sections without touching code.
                </p>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-md text-xs font-sans flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4 paper-card p-6 rounded-xl">
                {/* Drag / File Select Box */}
                <div className="border-2 border-dashed border-dusty-rose/50 rounded-xl p-8 text-center bg-white/60 hover:bg-white transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    onChange={handleFileSelect}
                    id="dash-file-input"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="dash-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-champagne-beige/60 text-muted-burgundy flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-lg text-deep-espresso">Choose Photos or Videos</span>
                    <span className="text-xs font-sans text-deep-espresso/50">
                      Supports JPG, JPEG, PNG, WebP, MP4, WebM • Multiple files allowed
                    </span>
                  </label>
                </div>

                {/* Previews */}
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
                            onClick={() => removeSelectedFile(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">
                      Title or Theme
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Under the amber streetlights"
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/70 mb-1">
                      Date (optional)
                    </label>
                    <input
                      type="text"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      placeholder="e.g. October 14 / Sunset"
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-deep-espresso/70 mb-1">
                    Caption or Backstory
                  </label>
                  <textarea
                    rows={2}
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Write a sweet handwritten-style caption for this..."
                    className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-2.5 text-xs font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploading || selectedFiles.length === 0}
                    className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isUploading ? `Uploading (${uploadProgress}%)` : 'Upload To Sanctuary'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. GALLERY MANAGEMENT TAB */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-deep-espresso/60">
                  Total Uploaded Items: {mediaList.length}
                </span>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="text-xs font-sans text-muted-burgundy underline hover:text-deep-espresso"
                >
                  + Upload More Media
                </button>
              </div>

              {mediaList.length === 0 ? (
                <div className="paper-card p-12 text-center rounded-xl">
                  <ImageIcon className="w-8 h-8 text-dusty-rose mx-auto mb-2" />
                  <p className="text-sm font-sans text-deep-espresso/70">No uploaded media found yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      className="paper-card rounded-lg overflow-hidden border border-dusty-rose/30 flex flex-col justify-between group"
                    >
                      <div className="relative aspect-4/3 w-full bg-champagne-beige/30 overflow-hidden">
                        {item.mediaType === 'image' ? (
                          <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-deep-espresso flex items-center justify-center">
                            <video src={item.fileUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="w-8 h-8 text-dusty-rose" />
                            </div>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/80 text-[10px] font-sans uppercase text-deep-espresso">
                          {item.mediaType}
                        </span>
                      </div>

                      <div className="p-3">
                        <h4 className="font-serif text-base text-deep-espresso font-medium line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="font-handwriting text-sm text-muted-burgundy line-clamp-2 mt-0.5">
                          "{item.caption}"
                        </p>

                        <div className="mt-3 pt-2 border-t border-dusty-rose/20 flex items-center justify-between text-xs">
                          <span className="text-[10px] font-sans text-deep-espresso/40">
                            {item.eventDate || 'Memory'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setEditCaption(item.caption);
                              }}
                              className="p-1 text-deep-espresso/50 hover:text-muted-burgundy"
                              title="Edit Caption"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedia(item.id, item.storagePath)}
                              className="p-1 text-deep-espresso/50 hover:text-red-500"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. FAVOURITES MANAGEMENT TAB */}
          {activeTab === 'favourites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-deep-espresso/60">
                  Treasured Memories: {favouritesList.length}
                </span>
              </div>

              <div className="space-y-3">
                {favouritesList.map((fav) => (
                  <div
                    key={fav.id}
                    className="paper-card p-4 rounded-lg flex items-center justify-between gap-4 border border-dusty-rose/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-champagne-beige/60 overflow-hidden shrink-0 flex items-center justify-center">
                        {fav.mediaUrls && fav.mediaUrls[0] ? (
                          <img src={fav.mediaUrls[0]} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <Heart className="w-5 h-5 text-muted-burgundy" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-deep-espresso font-medium">{fav.title}</h4>
                        <p className="text-xs font-sans text-deep-espresso/60 line-clamp-1">{fav.description}</p>
                      </div>
                    </div>

                    <span className="text-xs font-sans text-deep-espresso/40 shrink-0">
                      {fav.memoryDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SAVED ANSWERS TAB */}
          {activeTab === 'answers' && (
            <div className="max-w-xl mx-auto space-y-4">
              <h3 className="font-serif text-2xl text-deep-espresso text-center">
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

          {/* 5. SYSTEM OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="max-w-xl mx-auto space-y-6">
              <h3 className="font-serif text-2xl text-deep-espresso text-center">System & Storage Status</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Dynamic Media</span>
                  <p className="font-serif text-3xl text-muted-burgundy mt-1">{mediaList.length}</p>
                </div>
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Favourite Memories</span>
                  <p className="font-serif text-3xl text-muted-burgundy mt-1">{favouritesList.length}</p>
                </div>
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Saved Answers</span>
                  <p className="font-serif text-3xl text-muted-burgundy mt-1">{Object.keys(answersList).length}</p>
                </div>
                <div className="paper-card p-5 rounded-lg text-center">
                  <span className="text-xs font-sans text-deep-espresso/60">Supabase Cloud Sync</span>
                  <p className="font-sans text-sm font-semibold text-emerald-700 mt-2">
                    {isSupabaseConfigured ? 'Active' : 'Ready to Connect'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Caption Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-warm-ivory p-6 rounded-lg max-w-sm w-full border border-dusty-rose/40 shadow-xl">
              <h4 className="font-serif text-lg font-medium text-deep-espresso mb-3">Edit Caption</h4>
              <textarea
                rows={3}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full bg-white border border-dusty-rose/40 rounded p-2 text-xs font-sans"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-xs font-sans border rounded text-deep-espresso/70"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCaptionEdit}
                  className="px-4 py-1.5 text-xs font-sans bg-muted-burgundy text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
