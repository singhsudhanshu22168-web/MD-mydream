import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Heart } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center z-10 flex flex-col items-center">
        {/* Subtle romantic pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-champagne-beige/50 border border-dusty-rose/30 text-xs font-sans tracking-widest text-muted-burgundy uppercase mb-8 shadow-xs"
        >
          <Heart className="w-3.5 h-3.5 fill-muted-burgundy/40 text-muted-burgundy" />
          <span>Exclusive Digital Sanctuary</span>
          <span className="w-1 h-1 rounded-full bg-muted-burgundy" />
          <span>MD</span>
        </motion.div>

        {/* Monogram emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-gradient-to-b from-champagne-beige/40 to-warm-ivory border border-dusty-rose/40 flex items-center justify-center shadow-md mb-6"
        >
          <span className="font-serif text-3xl font-light text-muted-burgundy tracking-widest">
            MD
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-deep-espresso tracking-tight leading-[1.15] mb-6"
        >
          Happy Birthday, <br className="hidden sm:inline" />
          <span className="italic font-normal text-muted-burgundy relative inline-block">
            Vijeta
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 1.2, ease: 'easeInOut' }}
              className="absolute -bottom-1 left-0 h-[2px] bg-dusty-rose/60"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-xl font-sans text-deep-espresso/75 max-w-2xl font-light leading-relaxed mb-10"
        >
          A private, digital world created only for you — preserving our moments, quiet laughs, 
          unspoken thoughts, and a diary where only your heart belongs.
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#memories"
            className="px-8 py-3.5 rounded-full bg-muted-burgundy text-warm-ivory font-sans text-sm tracking-wide shadow-md hover:bg-burgundy-dark transition-all duration-300 flex items-center gap-2 group"
          >
            <span>Step Into Our Story</span>
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </a>

          <a
            href="#letter"
            className="px-7 py-3.5 rounded-full bg-white/70 border border-dusty-rose/40 text-deep-espresso font-sans text-sm hover:border-muted-burgundy hover:bg-white transition-all duration-300"
          >
            Read Your Birthday Letter
          </a>
        </motion.div>

        {/* Handwritten whisper note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="font-handwriting text-2xl text-muted-burgundy/80 mt-12 transform -rotate-1"
        >
          "You are My Dream come true..."
        </motion.p>

        {/* Bottom scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-16 text-deep-espresso/40 flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => {
            document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-[11px] uppercase tracking-widest font-sans font-medium">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  );
};
