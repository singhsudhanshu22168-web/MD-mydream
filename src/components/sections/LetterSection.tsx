import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Mail, Lock } from 'lucide-react';
import { BirthdayLetter } from '../../lib/types';
import { fetchBirthdayLetter } from '../../lib/contentService';

interface LetterSectionProps {
  refreshTrigger?: number;
}

export const LetterSection: React.FC<LetterSectionProps> = ({ refreshTrigger = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [letter, setLetter] = useState<BirthdayLetter | null>(null);

  useEffect(() => {
    const loadLetter = async () => {
      const data = await fetchBirthdayLetter();
      setLetter(data);
    };
    loadLetter();
  }, [refreshTrigger]);

  if (!letter) return null;

  return (
    <section id="letter" className="py-24 px-6 relative z-10 bg-champagne-beige/15 border-y border-dusty-rose/15">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
            A Token of My Love
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-4">
            A Letter For You
          </h2>
          <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
          <p className="text-sm sm:text-base font-sans text-deep-espresso/70 leading-relaxed font-light">
            Some thoughts are too pure to be spoken quickly in passing. I wrote this down for you, 
            word by word, from the quietest corner of my heart.
          </p>
        </div>

        {/* Envelope / Letter Interactive Container */}
        <div className="flex flex-col items-center">
          {!isOpen ? (
            /* Sealed Envelope */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="relative w-full max-w-md bg-warm-ivory rounded-lg border border-dusty-rose/40 shadow-xl p-8 sm:p-12 text-center cursor-pointer transition-all group overflow-hidden"
              onClick={() => setIsOpen(true)}
            >
              {/* Envelope flap aesthetic styling */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-champagne-beige/30 border-b border-dusty-rose/20 transform origin-top" />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Wax Seal Button */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-16 h-16 rounded-full wax-seal flex items-center justify-center text-warm-ivory font-serif font-semibold text-lg tracking-widest cursor-pointer shadow-lg my-4"
                >
                  MD
                </motion.div>

                <p className="font-serif text-2xl text-deep-espresso mt-4 font-medium">
                  To My Beloved Vijeta
                </p>
                <p className="text-xs font-sans tracking-widest uppercase text-muted-burgundy/80 mt-1">
                  Private & Confidential
                </p>

                <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-dusty-rose/30 text-xs font-sans text-deep-espresso/70 group-hover:border-muted-burgundy group-hover:text-muted-burgundy transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tap the wax seal to open</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Unfolded Letter */
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-warm-ivory rounded-lg border border-dusty-rose/30 shadow-2xl p-8 sm:p-14 relative paper-card"
            >
              {/* Decorative top ribbon */}
              <div className="flex items-center justify-between border-b border-dusty-rose/25 pb-6 mb-8">
                <div>
                  <span className="font-handwriting text-3xl text-muted-burgundy">{letter.salutation}</span>
                  <p className="text-[11px] uppercase tracking-widest font-sans text-deep-espresso/50 mt-1">
                    {letter.subtitle}
                  </p>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-champagne-beige/50 border border-dusty-rose/30 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-muted-burgundy text-muted-burgundy" />
                </div>
              </div>

              {/* Optional Letter Photo */}
              {letter.photoUrl && (
                <div className="mb-8 rounded-xl overflow-hidden max-h-[460px] bg-champagne-beige/25 shadow-md border border-dusty-rose/30 flex items-center justify-center">
                  <img src={letter.photoUrl} alt="Portrait of Vijeta" className="w-full max-h-[460px] object-cover object-top" />
                </div>
              )}

              {/* Letter Prose */}
              <div className="space-y-6 text-deep-espresso/85 font-serif text-lg sm:text-xl leading-relaxed tracking-wide font-light">
                {letter.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Sign-off */}
              <div className="mt-12 pt-6 border-t border-dusty-rose/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-deep-espresso/50">
                    {letter.signOffTitle}
                  </p>
                  <p className="font-handwriting text-3xl sm:text-4xl text-muted-burgundy mt-1">
                    {letter.signOffName}
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-sans text-deep-espresso/50 hover:text-muted-burgundy transition-colors underline underline-offset-4 self-end sm:self-auto cursor-pointer"
                >
                  Fold letter back
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
