import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, Heart, KeyRound, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: (userEmail?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Authorized user email configured in environment, defaults to the dedicated sanctuary account
  const authEmail = import.meta.env.VITE_AUTH_EMAIL || 'vijeta@mydream.world';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter your secret password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isSupabaseConfigured && supabase) {
        // Authenticate via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: password.trim(),
        });

        if (error) {
          // If email is unconfirmed, provide a helpful notice
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMessage('Account created, but email confirmation is pending in Supabase. Please confirm in your Supabase Auth dashboard.');
          } else {
            setErrorMessage('Incorrect password. Please try again, Vijeta ♡');
          }
          setIsLoading(false);
          return;
        }

        if (data.session) {
          onLoginSuccess(data.user?.email);
          return;
        }
      } else {
        // Fallback for offline mode if Supabase is disconnected
        const localPass = import.meta.env.VITE_DIARY_PASSCODE;
        if (localPass && password.trim() === localPass) {
          sessionStorage.setItem('md_session_auth', 'true');
          onLoginSuccess(authEmail);
          return;
        } else {
          setErrorMessage('Incorrect password. Please try again, Vijeta ♡');
          setIsLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col justify-between items-center p-6 relative overflow-hidden select-none">
      {/* Ambient background particles & glowing auras */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-champagne-beige/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-dusty-rose/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-muted-burgundy/5 blur-3xl pointer-events-none" />

      {/* Floating Header Monogram */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-8 flex flex-col items-center z-10"
      >
        <div className="w-12 h-12 rounded-full bg-champagne-beige/60 border border-muted-burgundy/30 flex items-center justify-center shadow-xs">
          <span className="font-serif font-bold text-lg text-muted-burgundy tracking-wider">MD</span>
        </div>
        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-burgundy font-semibold mt-2">
          MYDREAM
        </span>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md bg-warm-ivory/90 backdrop-blur-md border border-dusty-rose/30 shadow-2xl rounded-2xl p-8 sm:p-10 relative z-10 text-center"
      >
        {/* Lock Emblem */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-champagne-beige/50 to-warm-ivory border border-dusty-rose/40 mx-auto flex items-center justify-center text-muted-burgundy shadow-sm mb-6">
          <Lock className="w-7 h-7" />
        </div>

        {/* Headings */}
        <h1 className="font-serif text-3xl sm:text-4xl text-deep-espresso font-normal tracking-tight mb-2">
          Welcome to Your Little World, MD ♡
        </h1>
        
        <p className="font-handwriting text-2xl text-muted-burgundy mt-1 mb-8">
          "A little world made just for you, Vijeta."
        </p>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 rounded-lg bg-red-50/90 border border-red-200/80 text-xs font-sans text-red-800 flex items-center justify-center gap-2 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-sans tracking-wide uppercase text-deep-espresso/70 mb-2 font-medium">
              Enter Secret Sanctuary Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••••••••"
                autoFocus
                disabled={isLoading}
                className="w-full bg-white/80 border border-dusty-rose/50 rounded-xl py-3.5 pl-11 pr-12 text-sm font-sans text-deep-espresso placeholder:text-deep-espresso/30 focus:outline-none focus:border-muted-burgundy focus:ring-2 focus:ring-muted-burgundy/20 transition-all shadow-inner"
              />
              <KeyRound className="w-4 h-4 text-dusty-rose absolute left-4 top-1/2 -translate-y-1/2" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-deep-espresso/40 hover:text-deep-espresso transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-muted-burgundy text-warm-ivory font-sans text-sm tracking-wider font-medium hover:bg-burgundy-dark transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-warm-ivory border-t-transparent animate-spin" />
                <span>Opening Sanctuary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enter MD Sanctuary</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-dusty-rose/20 text-center">
          <p className="text-[11px] font-sans text-deep-espresso/50 flex items-center justify-center gap-1.5">
            <span>Dedicated exclusively to Vijeta</span>
            <Heart className="w-3 h-3 fill-muted-burgundy/50 text-muted-burgundy" />
            <span>Private & Encrypted</span>
          </p>
        </div>
      </motion.div>

      {/* Footer Signature */}
      <div className="pb-6 text-center z-10 text-[11px] font-sans text-deep-espresso/40">
        © {new Date().getFullYear()} MYDREAM • All Rights Reserved
      </div>
    </div>
  );
};
