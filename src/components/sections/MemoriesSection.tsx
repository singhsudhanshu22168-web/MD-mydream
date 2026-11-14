import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_MEMORIES } from '../../data/memoriesData';
import { MemoryItem, MediaItem } from '../../lib/types';
import { fetchAllMedia } from '../../lib/mediaService';
import { MapPin, Calendar, Heart, X, ZoomIn, Video } from 'lucide-react';

interface MemoriesSectionProps {
  refreshTrigger?: number;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({ refreshTrigger = 0 }) => {
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [dynamicMedia, setDynamicMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const loadUploadedMedia = async () => {
      const items = await fetchAllMedia();
      setDynamicMedia(items);
    };
    loadUploadedMedia();
  }, [refreshTrigger]);

  // Combine initial curated memories with user-uploaded dynamic media
  const dynamicMapped: MemoryItem[] = dynamicMedia.map((m, idx) => ({
    id: m.id,
    title: m.title,
    date: m.eventDate || 'A Special Day',
    location: m.category ? `Collection: ${m.category}` : undefined,
    caption: m.caption,
    note: m.description,
    image: m.fileUrl,
    rotation: ((idx % 5) - 2) * 0.9, // natural tilt between -1.8 and 1.8 deg
  }));

  const allMemories = [...dynamicMapped, ...INITIAL_MEMORIES];

  return (
    <section id="memories" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
            Chapter I
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-4">
            Our Sweetest Memories
          </h2>
          <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
          <p className="text-sm sm:text-base font-sans text-deep-espresso/70 leading-relaxed font-light">
            Every snapshot here holds a heartbeat. Click on any polaroid to unfold the little story 
            we lived that day.
          </p>
        </div>

        {/* Polaroid Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {allMemories.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index % 6) * 0.08 }}
              style={{ rotate: `${item.rotation || 0}deg` }}
              onClick={() => setSelectedMemory(item)}
              className="polaroid-card p-4 sm:p-5 pb-6 rounded-sm cursor-pointer group relative flex flex-col justify-between"
            >
              {/* Photo Frame */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-champagne-beige/30 rounded-xs mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Subtle hover icon */}
                <div className="absolute inset-0 bg-deep-espresso/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-warm-ivory/90 text-muted-burgundy flex items-center justify-center shadow-md">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>

                {/* Date Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-xs text-[11px] font-sans font-medium text-deep-espresso/80 flex items-center gap-1 shadow-2xs">
                  <Calendar className="w-3 h-3 text-muted-burgundy" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Polaroid Footer */}
              <div>
                <h3 className="font-serif text-xl text-deep-espresso group-hover:text-muted-burgundy transition-colors font-medium">
                  {item.title}
                </h3>
                
                {item.location && (
                  <p className="flex items-center gap-1 text-[11px] font-sans text-deep-espresso/50 mt-1">
                    <MapPin className="w-3 h-3 text-dusty-rose" />
                    <span>{item.location}</span>
                  </p>
                )}

                <p className="font-handwriting text-xl text-muted-burgundy/90 mt-3 line-clamp-2">
                  "{item.caption}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Memory Detail Modal */}
        <AnimatePresence>
          {selectedMemory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-espresso/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-warm-ivory max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden border border-dusty-rose/30 relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-warm-ivory/80 text-deep-espresso flex items-center justify-center hover:bg-white hover:text-muted-burgundy transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="max-h-[85vh] overflow-y-auto">
                  <div className="relative aspect-16/10 w-full bg-champagne-beige/40">
                    <img
                      src={selectedMemory.image}
                      alt={selectedMemory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-sans text-muted-burgundy mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{selectedMemory.date}</span>
                      {selectedMemory.location && (
                        <>
                          <span className="text-dusty-rose">•</span>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{selectedMemory.location}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-serif font-medium text-deep-espresso mb-3">
                      {selectedMemory.title}
                    </h3>

                    <p className="font-handwriting text-2xl text-muted-burgundy mb-6 leading-relaxed">
                      "{selectedMemory.caption}"
                    </p>

                    {selectedMemory.note && (
                      <div className="p-4 rounded-md bg-champagne-beige/30 border border-dusty-rose/20 text-sm font-sans text-deep-espresso/80 leading-relaxed">
                        <span className="font-semibold text-deep-espresso block mb-1">
                          The Whisper Behind This:
                        </span>
                        {selectedMemory.note}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
