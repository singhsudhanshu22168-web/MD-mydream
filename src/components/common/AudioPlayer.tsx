import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Soft ambient piano / lofi audio url (royalty-free calm music stream)
  const audioSource = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3";

  const togglePlay = () => {
    if (!audioRef.current) return;
    setHasInteracted(true);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Audio autoplay blocked by browser policy:", e);
      });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35; // gentle ambient background volume
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} src={audioSource} loop preload="auto" />
      
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-warm-ivory/90 border border-dusty-rose/40 shadow-lg backdrop-blur-md text-deep-espresso hover:border-muted-burgundy/60 transition-all group"
        title={isPlaying ? "Mute ambient melody" : "Play ambient melody for Vijeta"}
      >
        <span className="relative flex h-2.5 w-2.5">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-burgundy opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-muted-burgundy' : 'bg-dusty-rose'}`}></span>
        </span>

        <Music className={`w-4 h-4 ${isPlaying ? 'text-muted-burgundy animate-pulse' : 'text-deep-espresso/60'}`} />
        
        <span className="text-xs font-sans tracking-wide uppercase text-deep-espresso/80 font-medium hidden sm:inline">
          {isPlaying ? "Our Melody" : "Play Music"}
        </span>

        {isPlaying ? (
          <Volume2 className="w-4 h-4 text-muted-burgundy" />
        ) : (
          <VolumeX className="w-4 h-4 text-deep-espresso/50" />
        )}
      </motion.button>
    </div>
  );
};
