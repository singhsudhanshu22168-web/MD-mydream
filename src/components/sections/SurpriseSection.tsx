import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Heart, Star, Cake } from 'lucide-react';
import { FinalSurpriseContent } from '../../lib/types';
import { fetchFinalSurprise } from '../../lib/contentService';

interface SurpriseSectionProps {
  refreshTrigger?: number;
}

export const SurpriseSection: React.FC<SurpriseSectionProps> = ({ refreshTrigger = 0 }) => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [surpriseContent, setSurpriseContent] = useState<FinalSurpriseContent | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      const data = await fetchFinalSurprise();
      setSurpriseContent(data);
    };
    loadContent();
  }, [refreshTrigger]);

  const triggerCelebration = () => {
    setIsUnwrapped(true);

    const colors = ['#D9A6A7', '#9D626B', '#E9D7C5', '#F8F1EB', '#FFD700'];

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: colors,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });
      }, 300);
    } catch (e) {
      console.warn("Confetti error", e);
    }
  };

  if (!surpriseContent) return null;

  return (
    <section id="surprise" className="py-28 px-6 relative z-10 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
          The Grand Finale
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-4">
          A Birthday Surprise
        </h2>
        <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
        <p className="text-sm sm:text-base font-sans text-deep-espresso/70 max-w-lg mx-auto leading-relaxed font-light mb-12">
          One final token of my love, wrapped with endless care. Tap the gift box when you are ready.
        </p>

        {/* Gift Box Container */}
        <div className="flex flex-col items-center justify-center">
          {!isUnwrapped ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerCelebration}
              className="relative cursor-pointer group flex flex-col items-center"
            >
              {/* Floating Gift Box */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-champagne-beige via-dusty-rose/40 to-muted-burgundy/30 border border-dusty-rose/50 shadow-xl flex items-center justify-center relative overflow-hidden"
              >
                {/* Golden Ribbon cross */}
                <div className="absolute inset-y-0 w-8 bg-champagne-beige/80 border-x border-dusty-rose/40 shadow-xs" />
                <div className="absolute inset-x-0 h-8 bg-champagne-beige/80 border-y border-dusty-rose/40 shadow-xs" />

                {/* Bow Icon */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-warm-ivory shadow-md flex items-center justify-center text-muted-burgundy border border-dusty-rose/40">
                  <Gift className="w-8 h-8" />
                </div>
              </motion.div>

              <div className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/70 border border-dusty-rose/30 text-xs font-sans text-deep-espresso/80 group-hover:border-muted-burgundy group-hover:text-muted-burgundy transition-all shadow-xs">
                <Sparkles className="w-4 h-4 text-muted-burgundy" />
                <span>Tap to unwrap your surprise</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="paper-card p-8 sm:p-14 rounded-2xl max-w-2xl w-full border border-dusty-rose/40 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Floating stars */}
              <div className="flex items-center justify-center gap-3 text-muted-burgundy mb-6">
                <Star className="w-5 h-5 fill-muted-burgundy/40" />
                <Cake className="w-8 h-8" />
                <Star className="w-5 h-5 fill-muted-burgundy/40" />
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl text-deep-espresso font-normal mb-3">
                {surpriseContent.title}
              </h3>

              <div className="w-16 h-[1.5px] bg-dusty-rose mx-auto mb-6" />

              {/* Optional Photo */}
              {surpriseContent.photoUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden max-h-[420px] bg-champagne-beige/25 shadow-md border border-dusty-rose/30 flex items-center justify-center">
                  <img src={surpriseContent.photoUrl} alt="Birthday moment" className="w-full max-h-[420px] object-cover object-center" />
                </div>
              )}

              <p className="font-serif text-lg sm:text-xl text-deep-espresso/80 leading-relaxed font-light mb-6 whitespace-pre-line">
                {surpriseContent.message}
              </p>

              <p className="font-handwriting text-3xl text-muted-burgundy mb-8">
                {surpriseContent.signOff}
              </p>

              <button
                onClick={triggerCelebration}
                className="px-6 py-2.5 rounded-full bg-champagne-beige/60 border border-dusty-rose/40 text-xs font-sans text-deep-espresso/80 hover:bg-champagne-beige hover:text-deep-espresso transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-muted-burgundy/40 text-muted-burgundy" />
                <span>Shower with Confetti Again</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
