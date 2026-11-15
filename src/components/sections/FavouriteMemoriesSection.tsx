import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FavouriteMemory } from '../../lib/types';
import {
  fetchFavouriteMemories,
  saveFavouriteMemory,
  updateFavouriteMemory,
  deleteFavouriteMemory,
} from '../../lib/mediaService';
import { uploadMediaFile } from '../../lib/storageService';
import {
  Heart,
  Plus,
  Calendar,
  Image as ImageIcon,
  Video,
  X,
  Edit2,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Check,
} from 'lucide-react';

interface FavouriteMemoriesSectionProps {
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
}

export const FavouriteMemoriesSection: React.FC<FavouriteMemoriesSectionProps> = ({
  isAuthenticated,
  onOpenAuthModal,
}) => {
  const [memories, setMemories] = useState<FavouriteMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<FavouriteMemory | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isFavourite, setIsFavourite] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Active view modal for reading/viewing carousel
  const [activeMemory, setActiveMemory] = useState<FavouriteMemory | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const loadMemories = async () => {
    setLoading(true);
    const data = await fetchFavouriteMemories();
    setMemories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const openAddModal = () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    setEditingMemory(null);
    setTitle('');
    setDescription('');
    setMemoryDate('');
    setMediaUrls([]);
    setVideoUrl('');
    setIsFavourite(true);
    setTagsInput('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (mem: FavouriteMemory) => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    setEditingMemory(mem);
    setTitle(mem.title);
    setDescription(mem.description);
    setMemoryDate(mem.memoryDate);
    setMediaUrls(mem.mediaUrls || []);
    setVideoUrl(mem.videoUrl || '');
    setIsFavourite(mem.isFavourite);
    setTagsInput(mem.tags ? mem.tags.join(', ') : '');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMessage('');
    setUploadProgress(10);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadMediaFile(file, 'md-favourite-memories', (prog) => {
          setUploadProgress(Math.round(((i + prog / 100) / files.length) * 100));
        });

        if (res.mediaType === 'video') {
          setVideoUrl(res.fileUrl);
        } else {
          newUrls.push(res.fileUrl);
        }
      }
      setMediaUrls((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a title and memory description.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingMemory) {
        await updateFavouriteMemory(editingMemory.id, {
          title: title.trim(),
          description: description.trim(),
          memoryDate: memoryDate.trim() || 'A Sweet Moment',
          mediaUrls,
          videoUrl: videoUrl || undefined,
          isFavourite,
          tags,
        });
      } else {
        await saveFavouriteMemory({
          title: title.trim(),
          description: description.trim(),
          memoryDate: memoryDate.trim() || 'A Sweet Moment',
          mediaUrls,
          videoUrl: videoUrl || undefined,
          isFavourite,
          tags,
        });
      }

      setIsModalOpen(false);
      await loadMemories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not save memory.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    if (confirm('Are you sure you want to let go of this treasured memory?')) {
      await deleteFavouriteMemory(id);
      await loadMemories();
      if (activeMemory?.id === id) setActiveMemory(null);
    }
  };

  return (
    <section id="favourite-memories" className="py-24 px-6 relative z-10 bg-champagne-beige/15 border-t border-dusty-rose/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
            Treasured Collection
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-3">
            MD's Favourite Memories
          </h2>
          <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
          <p className="font-handwriting text-2xl text-muted-burgundy italic mb-3">
            "Some moments deserve to stay forever."
          </p>
          <p className="text-sm sm:text-base font-sans text-deep-espresso/70 leading-relaxed font-light">
            A handpicked chronicle of the times that touched our hearts the deepest. Curated by Vijeta.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={openAddModal}
              className="px-6 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory text-xs font-sans tracking-wide hover:bg-burgundy-dark transition-all duration-300 shadow-xs flex items-center gap-2 group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>Add A Treasured Memory</span>
            </button>
          </div>
        </div>

        {/* Memory Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-muted-burgundy border-t-transparent animate-spin" />
          </div>
        ) : memories.length === 0 ? (
          <div className="paper-card p-12 text-center max-w-md mx-auto rounded-lg">
            <Heart className="w-8 h-8 text-dusty-rose mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-deep-espresso">No Memories Saved Yet</h3>
            <p className="text-xs font-sans text-deep-espresso/60 mt-1 mb-6">
              Be the first to pen down a memory that belongs in your permanent treasure box.
            </p>
            <button
              onClick={openAddModal}
              className="text-xs font-sans text-muted-burgundy underline hover:text-deep-espresso"
            >
              Add First Memory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((mem, index) => {
              const hasCover = mem.mediaUrls && mem.mediaUrls.length > 0;
              const coverImage = hasCover ? mem.mediaUrls[0] : null;

              return (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => {
                    setActiveMemory(mem);
                    setCarouselIndex(0);
                  }}
                  className="paper-card rounded-lg overflow-hidden cursor-pointer group flex flex-col justify-between hover:shadow-xl hover:border-dusty-rose/60 transition-all duration-300 relative"
                >
                  {/* Media Preview Header */}
                  {coverImage ? (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-champagne-beige/40">
                      <img
                        src={coverImage}
                        alt={mem.title}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      {mem.mediaUrls.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-deep-espresso/60 text-warm-ivory text-[10px] font-sans backdrop-blur-xs flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>+{mem.mediaUrls.length - 1} photos</span>
                        </div>
                      )}
                      {mem.videoUrl && (
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-deep-espresso/60 text-warm-ivory text-[10px] font-sans backdrop-blur-xs">
                          <Video className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ) : mem.videoUrl ? (
                    <div className="relative aspect-16/10 w-full overflow-hidden bg-deep-espresso/90 flex items-center justify-center text-warm-ivory">
                      <Video className="w-8 h-8 text-dusty-rose animate-pulse" />
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-r from-dusty-rose/20 to-champagne-beige/40 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-muted-burgundy/40" />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-sans text-deep-espresso/50 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-burgundy" />
                          <span>{mem.memoryDate}</span>
                        </span>
                        {mem.isFavourite && (
                          <span className="flex items-center gap-0.5 text-muted-burgundy">
                            <Heart className="w-3.5 h-3.5 fill-muted-burgundy" />
                            <span className="text-[10px] uppercase font-semibold">Favourite</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl text-deep-espresso group-hover:text-muted-burgundy transition-colors font-medium mb-2">
                        {mem.title}
                      </h3>

                      <p className="font-sans text-xs sm:text-sm text-deep-espresso/75 leading-relaxed line-clamp-3 font-light">
                        {mem.description}
                      </p>
                    </div>

                    {/* Tags and Admin Controls */}
                    <div className="mt-6 pt-4 border-t border-dusty-rose/20 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {mem.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-champagne-beige/60 text-deep-espresso/70"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {isAuthenticated && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(mem);
                            }}
                            className="p-1.5 text-deep-espresso/50 hover:text-muted-burgundy transition-colors rounded hover:bg-white/60"
                            title="Edit Memory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(mem.id, e)}
                            className="p-1.5 text-deep-espresso/50 hover:text-red-500 transition-colors rounded hover:bg-white/60"
                            title="Delete Memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detailed Memory Viewer Dialog */}
        <AnimatePresence>
          {activeMemory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-espresso/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-warm-ivory max-w-3xl w-full rounded-lg shadow-2xl overflow-hidden border border-dusty-rose/40 relative max-h-[90vh] flex flex-col"
              >
                <button
                  onClick={() => setActiveMemory(null)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-warm-ivory/80 text-deep-espresso flex items-center justify-center hover:bg-white hover:text-muted-burgundy transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="overflow-y-auto p-6 sm:p-8">
                  {/* Photo Carousel or Video */}
                  {activeMemory.mediaUrls && activeMemory.mediaUrls.length > 0 && (
                    <div className="relative w-full max-h-[60vh] rounded-lg overflow-hidden bg-deep-espresso/5 mb-6 flex items-center justify-center">
                      <img
                        src={activeMemory.mediaUrls[carouselIndex]}
                        alt="Memory preview"
                        className="w-full max-h-[60vh] object-contain"
                      />

                      {activeMemory.mediaUrls.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCarouselIndex(
                                (carouselIndex - 1 + activeMemory.mediaUrls.length) %
                                  activeMemory.mediaUrls.length
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-warm-ivory/80 backdrop-blur-xs flex items-center justify-center text-deep-espresso shadow-md hover:bg-white"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setCarouselIndex(
                                (carouselIndex + 1) % activeMemory.mediaUrls.length
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-warm-ivory/80 backdrop-blur-xs flex items-center justify-center text-deep-espresso shadow-md hover:bg-white"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Attached Video */}
                  {activeMemory.videoUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden bg-black aspect-16/9">
                      <video
                        src={activeMemory.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex items-center gap-2 text-xs font-sans text-muted-burgundy mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{activeMemory.memoryDate}</span>
                    {activeMemory.isFavourite && (
                      <>
                        <span className="text-dusty-rose">•</span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Heart className="w-3 h-3 fill-muted-burgundy" />
                          Favourite
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-serif text-3xl text-deep-espresso font-medium mb-4">
                    {activeMemory.title}
                  </h3>

                  <p className="font-sans text-base text-deep-espresso/80 leading-relaxed font-light whitespace-pre-line mb-6">
                    {activeMemory.description}
                  </p>

                  {activeMemory.tags && activeMemory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-dusty-rose/20">
                      {activeMemory.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-sans px-3 py-1 rounded-full bg-champagne-beige/50 text-deep-espresso/80"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-espresso/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-warm-ivory max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden border border-dusty-rose/40 relative max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-dusty-rose/20 flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-deep-espresso font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-burgundy" />
                    <span>{editingMemory ? 'Edit Favourite Memory' : 'Save A Treasured Memory'}</span>
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-deep-espresso/50 hover:text-deep-espresso"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5 flex-1">
                  {errorMessage && (
                    <p className="text-xs font-sans text-red-600 bg-red-50 p-2.5 rounded border border-red-100">
                      {errorMessage}
                    </p>
                  )}

                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/80 font-medium mb-1">
                      Memory Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Walking under the starlit sky..."
                      required
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-3 text-sm font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans text-deep-espresso/80 font-medium mb-1">
                        When did this happen?
                      </label>
                      <input
                        type="text"
                        value={memoryDate}
                        onChange={(e) => setMemoryDate(e.target.value)}
                        placeholder="e.g. That Rainy Tuesday / Nov 15"
                        className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-3 text-sm font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-deep-espresso/80 font-medium mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="e.g. Sunset, Laughs, Forever"
                        className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-3 text-sm font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/80 font-medium mb-1">
                      The Story & Whispers *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what made this moment unforgettable..."
                      required
                      className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-3 text-sm font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy resize-none"
                    />
                  </div>

                  {/* Attach Media */}
                  <div>
                    <label className="block text-xs font-sans text-deep-espresso/80 font-medium mb-1">
                      Attach Photographs / Video
                    </label>

                    <div className="border-2 border-dashed border-dusty-rose/40 rounded-lg p-5 text-center bg-white/50 hover:bg-white/80 transition-all">
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="memory-files-input"
                      />
                      <label
                        htmlFor="memory-files-input"
                        className="cursor-pointer flex flex-col items-center gap-1.5"
                      >
                        <UploadCloud className="w-6 h-6 text-muted-burgundy" />
                        <span className="text-xs font-sans font-medium text-deep-espresso">
                          {uploading ? `Uploading... (${uploadProgress}%)` : 'Click to select photos or video'}
                        </span>
                        <span className="text-[11px] font-sans text-deep-espresso/50">
                          Supports JPG, PNG, WebP, MP4, WebM (Multiple files allowed)
                        </span>
                      </label>
                    </div>

                    {/* Previews */}
                    {mediaUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-dusty-rose/40">
                            <img src={url} alt="Attached" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {videoUrl && (
                      <div className="mt-2 text-xs font-sans text-emerald-800 bg-emerald-50 p-2 rounded flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" />
                          <span>Video attached</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mark as favourite toggle */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="fav-check"
                      checked={isFavourite}
                      onChange={(e) => setIsFavourite(e.target.checked)}
                      className="w-4 h-4 text-muted-burgundy rounded border-dusty-rose/60 focus:ring-muted-burgundy"
                    />
                    <label htmlFor="fav-check" className="text-xs font-sans text-deep-espresso flex items-center gap-1 cursor-pointer">
                      <Heart className="w-3.5 h-3.5 fill-muted-burgundy text-muted-burgundy" />
                      <span>Pin as one of my all-time favourites</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-dusty-rose/20 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-md border border-dusty-rose/40 text-xs font-sans text-deep-espresso/70 hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 rounded-md bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all disabled:opacity-50"
                    >
                      {editingMemory ? 'Update Memory' : 'Save To Treasury'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
