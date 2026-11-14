import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiaryEntry } from '../../lib/types';
import { Lock, Unlock, Plus, Calendar, Smile, Heart, Feather, Trash2, BookOpen, CloudCheck } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface DiarySectionProps {
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onLockDiary: () => void;
}

const DEFAULT_ENTRY: DiaryEntry = {
  id: 'default-1',
  title: 'A Little Thought For Today',
  date: new Date().toISOString(),
  content: 'Welcome to your private diary, Vijeta. Here, you can write anything you wish—your triumphs, silly moments, quiet dreams, or little notes to yourself. It will stay safe and protected here forever.',
  mood: 'loved',
};

export const DiarySection: React.FC<DiarySectionProps> = ({
  isAuthenticated,
  onOpenAuthModal,
  onLockDiary,
}) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('md_diary_entries');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [DEFAULT_ENTRY];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'happy' | 'loved' | 'peaceful' | 'reflective' | 'dreamy'>('loved');
  const [loading, setLoading] = useState(false);

  const loadCloudEntries = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('diary_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: DiaryEntry[] = data.map((d) => ({
            id: d.id,
            title: d.title,
            content: d.content,
            mood: d.mood,
            date: d.entry_date || d.created_at,
          }));
          setEntries(mapped);
          localStorage.setItem('md_diary_entries', JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        console.warn('Could not fetch cloud diary entries:', err);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCloudEntries();
    }
  }, [isAuthenticated]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString(),
      mood,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('diary_entries')
          .insert({
            title: newEntry.title,
            content: newEntry.content,
            mood: newEntry.mood,
            entry_date: newEntry.date,
          })
          .select()
          .single();

        if (!error && data) {
          newEntry.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase diary entry insert error:', err);
      }
    }

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('md_diary_entries', JSON.stringify(updated));
    setTitle('');
    setContent('');
    setIsCreating(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to remove this memory note?")) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('diary_entries').delete().eq('id', id);
        } catch (err) {
          console.warn('Supabase diary entry delete error:', err);
        }
      }

      const updated = entries.filter((entry) => entry.id !== id);
      setEntries(updated);
      localStorage.setItem('md_diary_entries', JSON.stringify(updated));
    }
  };

  const moodBadges = {
    happy: { label: 'Joyful', color: 'bg-amber-100 text-amber-800' },
    loved: { label: 'Cherished', color: 'bg-rose-100 text-rose-800' },
    peaceful: { label: 'Serene', color: 'bg-emerald-100 text-emerald-800' },
    reflective: { label: 'Reflective', color: 'bg-indigo-100 text-indigo-800' },
    dreamy: { label: 'Dreamy', color: 'bg-purple-100 text-purple-800' },
  };

  return (
    <section id="diary" className="py-24 px-6 relative z-10 bg-champagne-beige/10 border-t border-dusty-rose/15">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
            Chapter IV
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-4">
            MD's Little Diary
          </h2>
          <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
          <p className="text-sm sm:text-base font-sans text-deep-espresso/70 leading-relaxed font-light">
            A private space for Vijeta's thoughts, whispers, and daily reflections. Protected with love.
          </p>
        </div>

        {!isAuthenticated ? (
          /* Locked State Gate */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="paper-card p-10 sm:p-14 rounded-xl text-center max-w-xl mx-auto flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-champagne-beige/60 border border-dusty-rose/40 flex items-center justify-center text-muted-burgundy mb-6 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-deep-espresso mb-3">
              Protected Sanctuary
            </h3>

            <p className="text-sm font-sans text-deep-espresso/70 max-w-sm mb-8 leading-relaxed font-light">
              This diary contains personal memories and private thoughts reserved solely for Vijeta. 
              Unlock it using your private key.
            </p>

            <button
              onClick={onOpenAuthModal}
              className="px-8 py-3 rounded-full bg-muted-burgundy text-warm-ivory text-sm font-sans tracking-wide hover:bg-burgundy-dark transition-all duration-300 shadow-md flex items-center gap-2 group"
            >
              <Unlock className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span>Unlock My Diary</span>
            </button>
          </motion.div>
        ) : (
          /* Authenticated Diary Area */
          <div className="space-y-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 p-4 rounded-lg border border-dusty-rose/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-muted-burgundy" />
                <span className="font-serif text-lg text-deep-espresso font-medium">
                  Vijeta's Journal Entries
                </span>
                <span className="text-xs font-sans text-deep-espresso/50">
                  ({entries.length} memories)
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-md bg-muted-burgundy text-warm-ivory text-xs font-sans tracking-wide hover:bg-burgundy-dark transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'Cancel Note' : 'Write New Entry'}</span>
                </button>

                <button
                  onClick={onLockDiary}
                  className="px-3 py-2 rounded-md border border-dusty-rose/40 text-xs font-sans text-deep-espresso/70 hover:text-muted-burgundy transition-colors"
                >
                  Lock Diary
                </button>
              </div>
            </div>

            {/* Create Entry Form */}
            <AnimatePresence>
              {isCreating && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateEntry}
                  className="paper-card p-6 sm:p-8 rounded-lg overflow-hidden border border-dusty-rose/40"
                >
                  <h4 className="font-serif text-xl text-deep-espresso font-medium mb-4 flex items-center gap-2">
                    <Feather className="w-4 h-4 text-muted-burgundy" />
                    <span>Pen Down A Memory</span>
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans text-deep-espresso/70 mb-1">
                        Entry Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="A title for this moment..."
                        className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-3 text-sm font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-deep-espresso/70 mb-1">
                        How is your heart feeling today?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['happy', 'loved', 'peaceful', 'reflective', 'dreamy'] as const).map(
                          (m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMood(m)}
                              className={`text-xs font-sans px-3 py-1.5 rounded-full capitalize border transition-all ${
                                mood === m
                                  ? 'bg-muted-burgundy text-warm-ivory border-muted-burgundy'
                                  : 'bg-white/70 text-deep-espresso/70 border-dusty-rose/30 hover:border-muted-burgundy'
                              }`}
                            >
                              {m}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-sans text-deep-espresso/70 mb-1">
                        Your Thoughts
                      </label>
                      <textarea
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Dear Diary, today was special because..."
                        className="w-full bg-white/80 border border-dusty-rose/40 rounded-md p-3 text-sm font-sans text-deep-espresso focus:outline-none focus:border-muted-burgundy resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-md bg-muted-burgundy text-warm-ivory text-xs font-sans font-medium hover:bg-burgundy-dark transition-all shadow-xs"
                      >
                        Keep in My Sanctuary
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Entries Display */}
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="paper-card p-6 sm:p-8 rounded-lg relative group transition-all hover:border-dusty-rose/60"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-sans text-deep-espresso/50 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-dusty-rose" />
                          <span>{formatDate(entry.date)}</span>
                        </span>
                        {entry.mood && (
                          <span
                            className={`text-[10px] font-sans px-2 py-0.5 rounded-full capitalize ${
                              moodBadges[entry.mood]?.color || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {entry.mood}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-2xl text-deep-espresso font-medium">
                        {entry.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-deep-espresso/40 hover:text-red-500 transition-all p-1"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="font-sans text-sm sm:text-base text-deep-espresso/80 leading-relaxed font-light whitespace-pre-line">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
