import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music, Volume1, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OurMelody } from '../../lib/types';
import { fetchOurMelody } from '../../lib/contentService';

interface AudioPlayerProps {
  refreshTrigger?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ refreshTrigger = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [melody, setMelody] = useState<OurMelody | null>(null);
  const [volume, setVolume] = useState(0.35);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadMelody = async () => {
      const data = await fetchOurMelody();
      setMelody(data);
      if (data.volume !== undefined) {
        setVolume(data.volume);
      }
    };
    loadMelody();
  }, [refreshTrigger]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Audio play blocked by browser policy:", e);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  if (!melody) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <audio ref={audioRef} src={melody.audioUrl} loop preload="auto" />
      
      {/* Volume Popover */}
      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            className="p-3 bg-warm-ivory/95 backdrop-blur-md rounded-2xl border border-dusty-rose/40 shadow-xl flex items-center gap-2.5"
          >
            <span className="text-[10px] font-sans font-semibold text-deep-espresso/60 uppercase">
              {Math.round(volume * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 accent-muted-burgundy cursor-pointer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Music Pill */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-warm-ivory/90 border border-dusty-rose/40 shadow-lg backdrop-blur-md text-deep-espresso hover:border-muted-burgundy/60 transition-all group"
      >
        <button
          onClick={togglePlay}
          className="flex items-center gap-2.5 cursor-pointer"
          title={isPlaying ? "Pause ambient melody" : "Play ambient melody for Vijeta"}
        >
          <span className="relative flex h-2.5 w-2.5">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-burgundy opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-muted-burgundy' : 'bg-dusty-rose'}`} />
          </span>

          <Music className={`w-4 h-4 ${isPlaying ? 'text-muted-burgundy animate-pulse' : 'text-deep-espresso/60'}`} />
          
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-sans tracking-wide text-deep-espresso font-medium line-clamp-1 max-w-[130px]">
              {melody.title}
            </span>
            <span className="text-[9px] font-sans text-deep-espresso/50 uppercase tracking-widest">
              {isPlaying ? 'Playing Now' : 'Tap to Play'}
            </span>
          </div>
        </button>

        {/* Volume Button Toggle */}
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="p-1 text-deep-espresso/50 hover:text-muted-burgundy transition-colors ml-1 cursor-pointer"
          title="Adjust Volume"
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4 text-deep-espresso/40" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-burgundy" />
          )}
        </button>
      </motion.div>
    </div>
  );
};
