import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 border-t border-dusty-rose/20 bg-warm-ivory relative z-10 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Monogram */}
        <div className="w-10 h-10 rounded-full bg-champagne-beige/50 border border-muted-burgundy/30 flex items-center justify-center mb-4">
          <span className="font-serif font-bold text-sm text-muted-burgundy">MD</span>
        </div>

        <p className="font-serif text-lg text-deep-espresso font-medium">
          MYDREAM (MD) — Crafted with love for Vijeta
        </p>

        <p className="text-xs font-sans text-deep-espresso/50 mt-1 flex items-center gap-1">
          <span>Made for the most special birthday</span>
          <Heart className="w-3 h-3 fill-muted-burgundy text-muted-burgundy" />
          <span>Infinite Moments Ahead</span>
        </p>

        <div className="mt-6 text-[11px] font-sans text-deep-espresso/40">
          © {new Date().getFullYear()} MD Sanctuary. All memories reserved.
        </div>
      </div>
    </footer>
  );
};
