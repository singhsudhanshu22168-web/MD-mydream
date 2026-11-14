import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { INITIAL_QUESTIONS } from '../../data/questionsData';
import { QuestionItem } from '../../lib/types';
import { CheckCircle2, Heart, Sparkles, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const QuestionsSection: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('md_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Fetch questions and answers from Supabase
  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: qData, error: qError } = await supabase
            .from('questions')
            .select('*')
            .order('order_index', { ascending: true });

          if (!qError && qData && qData.length > 0) {
            setQuestions(
              qData.map((q) => ({
                id: q.id,
                type: q.type,
                prompt: q.prompt,
                subtitle: q.subtitle,
                options: q.options,
                placeholder: q.placeholder,
              }))
            );
          }

          const { data: aData, error: aError } = await supabase
            .from('answers')
            .select('*');

          if (!aError && aData && aData.length > 0) {
            const cloudAnswers: Record<string, string> = {};
            aData.forEach((a) => {
              cloudAnswers[a.question_id] = a.answer_text;
            });
            setAnswers((prev) => ({ ...prev, ...cloudAnswers }));
          }
        } catch (e) {
          console.warn('Could not sync questions with Supabase:', e);
        }
      }
    };

    fetchQuestionsAndAnswers();
  }, []);

  const saveAnswerToBackend = async (id: string, text: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('answers')
          .upsert({
            question_id: id,
            answer_text: text,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'question_id' });
      } catch (e) {
        console.warn('Supabase answer upsert error:', e);
      }
    }
  };

  const handleTextChange = (id: string, value: string) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    localStorage.setItem('md_answers', JSON.stringify(updated));
  };

  const handleSelectChoice = (id: string, choice: string) => {
    const updated = { ...answers, [id]: choice };
    setAnswers(updated);
    localStorage.setItem('md_answers', JSON.stringify(updated));
    triggerSavedFeedback(id);
    saveAnswerToBackend(id, choice);
  };

  const triggerSavedFeedback = (id: string) => {
    setSavedNotification(id);
    saveAnswerToBackend(id, answers[id] || '');
    setTimeout(() => {
      setSavedNotification((current) => (current === id ? null : current));
    }, 2500);
  };

  return (
    <section id="questions" className="py-24 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-burgundy">
            Chapter III
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-deep-espresso mt-2 mb-4">
            Questions for MD
          </h2>
          <div className="w-12 h-[1.5px] bg-dusty-rose mx-auto mb-4" />
          <p className="text-sm sm:text-base font-sans text-deep-espresso/70 leading-relaxed font-light">
            A little corner just between us. Tap an option or type what comes naturally to your mind; 
            every answer is saved right here forever.
          </p>
        </div>

        {/* Questions Cards */}
        <div className="space-y-8">
          {questions.map((q, index) => {
            const currentAnswer = answers[q.id] || '';
            const isSaved = savedNotification === q.id;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="paper-card p-6 sm:p-8 rounded-lg relative overflow-hidden"
              >
                {/* Number & Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-2xl font-light text-muted-burgundy/60">
                    0{index + 1}
                  </span>
                  
                  {isSaved && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-burgundy bg-rose-light/50 px-2.5 py-1 rounded-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved with love</span>
                    </motion.div>
                  )}
                </div>

                {/* Prompt */}
                <h3 className="font-serif text-xl sm:text-2xl text-deep-espresso font-normal mb-1">
                  {q.prompt}
                </h3>
                {q.subtitle && (
                  <p className="text-xs sm:text-sm font-sans text-deep-espresso/60 mb-6 font-light">
                    {q.subtitle}
                  </p>
                )}

                {/* Input Modes */}
                {q.type === 'choice' && q.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt) => {
                      const isSelected = currentAnswer === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectChoice(q.id, opt)}
                          className={`text-left p-4 rounded-md text-sm font-sans transition-all duration-200 border ${
                            isSelected
                              ? 'bg-muted-burgundy text-warm-ivory border-muted-burgundy shadow-sm'
                              : 'bg-white/60 hover:bg-white text-deep-espresso border-dusty-rose/30 hover:border-muted-burgundy/60'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-warm-ivory bg-warm-ivory'
                                  : 'border-deep-espresso/30'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-burgundy" />
                              )}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 relative">
                    <textarea
                      rows={3}
                      value={currentAnswer}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      onBlur={() => triggerSavedFeedback(q.id)}
                      placeholder={q.placeholder}
                      className="w-full bg-white/70 border border-dusty-rose/40 rounded-md p-4 text-sm font-sans text-deep-espresso placeholder:text-deep-espresso/40 focus:outline-none focus:border-muted-burgundy focus:ring-1 focus:ring-muted-burgundy/30 transition-all resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] font-sans text-deep-espresso/40">
                        Autosaves to sanctuary
                      </span>
                      <button
                        onClick={() => triggerSavedFeedback(q.id)}
                        className="text-xs font-sans text-muted-burgundy hover:underline flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 fill-muted-burgundy/30" />
                        <span>Save Answer</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
