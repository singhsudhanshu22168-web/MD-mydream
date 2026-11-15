import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenWhenLetter } from '../../lib/types';
import { fetchOpenWhenLetters } from '../../lib/contentService';
import { Mail, Sparkles, X, Heart, Feather } from 'lucide-react';

interface OpenWhenSectionProps {
  refreshTrigger?: number;
}

export const OpenWhenSection: React.FC<OpenWhenSectionProps> = ({ refreshTrigger = 0 }) => {
  const [letters, setLetters] = useState<OpenWhenLetter[]>([]);
  const [activeLetter, setActiveLetter] = useState<OpenWhenLetter | null>(null);

  useEffect(() => {
    const loadLetters = async () => {
      const data = await fetchOpenWhenLetters();
      setLetters(data);
    };
    loadLetters();
  }, [refreshTrigger]);

  return (
    <section id="open-when" className="py-24 px-6 relative z-10 bg-warm-ivory">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
            Treasured Whispers
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-3">
            Open When...
          </h2>
          <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
          <p className="font-handwriting text-2xl text-muted-burgundy italic mb-2">
            "Envelopes waiting for the exact moment you need them."
          </p>
          <p className="text-sm sm:text-base font-sans text-deep-espresso/70 leading-relaxed font-light">
            Whenever your heart feels a certain way, tap the corresponding envelope. There is a handwritten note inside waiting for you.
          </p>
        </div>

        {/* 6 Envelopes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {letters.map((letter, index) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => setActiveLetter(letter)}
              className="paper-card p-6 rounded-xl cursor-pointer group flex flex-col justify-between border border-dusty-rose/30 shadow-sm hover:shadow-xl hover:border-muted-burgundy/40 transition-all duration-300 relative overflow-hidden"
            >
              {/* Envelope flap aesthetic styling */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-champagne-beige/40 to-transparent pointer-events-none" />

              <div>
                {/* Envelope Seal Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-champagne-beige/60 border border-dusty-rose/40 flex items-center justify-center text-muted-burgundy shadow-2xs group-hover:bg-muted-burgundy group-hover:text-warm-ivory transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-sm font-light text-muted-burgundy/60">
                    № 0{index + 1}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-deep-espresso font-medium group-hover:text-muted-burgundy transition-colors leading-snug">
                  {letter.envelopeLabel}
                </h3>

                <p className="text-xs font-sans text-deep-espresso/60 mt-2 font-light">
                  {letter.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-dusty-rose/20 flex items-center justify-between">
                <span className="text-[11px] font-sans text-muted-burgundy flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Tap to unfold</span>
                </span>
                <Heart className="w-3.5 h-3.5 text-dusty-rose/60 group-hover:fill-muted-burgundy group-hover:text-muted-burgundy transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Unfolded Letter Modal */}
        <AnimatePresence>
          {activeLetter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-deep-espresso/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-warm-ivory max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden border border-dusty-rose/40 relative paper-card max-h-[88vh] flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveLetter(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/70 text-deep-espresso flex items-center justify-center hover:bg-white hover:text-muted-burgundy transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto p-8 sm:p-12 space-y-6">
                  {/* Letter Header */}
                  <div className="border-b border-dusty-rose/25 pb-4">
                    <span className="text-[11px] uppercase tracking-widest font-sans font-semibold text-muted-burgundy block mb-1">
                      {activeLetter.envelopeLabel}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-deep-espresso font-medium">
                      {activeLetter.title}
                    </h3>
                  </div>

                  {/* Optional Letter Photo */}
                  {activeLetter.photoUrl && (
                    <div className="rounded-xl overflow-hidden max-h-64 bg-champagne-beige/40">
                      <img
                        src={activeLetter.photoUrl}
                        alt="Memory moment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Letter Content */}
                  <div className="text-deep-espresso/85 font-serif text-lg sm:text-xl leading-relaxed font-light whitespace-pre-line">
                    {activeLetter.content}
                  </div>

                  {/* Letter Footer */}
                  <div className="pt-6 border-t border-dusty-rose/25 flex items-center justify-between">
                    <div>
                      <p className="font-handwriting text-2xl text-muted-burgundy">
                        Always right here with you ♡
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveLetter(null)}
                      className="text-xs font-sans text-deep-espresso/50 hover:text-muted-burgundy underline underline-offset-4"
                    >
                      Fold letter back
                    </button>
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
