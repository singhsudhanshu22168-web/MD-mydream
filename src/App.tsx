import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { MemoriesSection } from './components/sections/MemoriesSection';
import { FavouriteMemoriesSection } from './components/sections/FavouriteMemoriesSection';
import { LetterSection } from './components/sections/LetterSection';
import { OpenWhenSection } from './components/sections/OpenWhenSection';
import { QuestionsSection } from './components/sections/QuestionsSection';
import { DiarySection } from './components/sections/DiarySection';
import { SurpriseSection } from './components/sections/SurpriseSection';
import { Footer } from './components/common/Footer';
import { AudioPlayer } from './components/common/AudioPlayer';
import { FloatingElements } from './components/common/FloatingElements';
import { DiaryAuthModal } from './components/auth/DiaryAuthModal';
import { AdminDashboardModal } from './components/dashboard/AdminDashboardModal';
import { LoginPage } from './components/auth/LoginPage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check initial authentication and listen to Supabase Auth state changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsAuthenticated(true);
            setUserEmail(data.session.user.email);
          } else {
            const localSession = sessionStorage.getItem('md_session_auth');
            if (localSession === 'true') {
              setIsAuthenticated(true);
            }
          }
        } else {
          const localSession = sessionStorage.getItem('md_session_auth');
          if (localSession === 'true') {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.warn('Session check error:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSession();

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email);
        } else {
          setIsAuthenticated(false);
          setUserEmail(undefined);
          sessionStorage.removeItem('md_session_auth');
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleLoginSuccess = (email?: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setShowWelcomeToast(true);
    setTimeout(() => {
      setShowWelcomeToast(false);
    }, 4500);
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    sessionStorage.removeItem('md_session_auth');
    localStorage.removeItem('md_diary_auth');
    setIsAuthenticated(false);
    setUserEmail(undefined);
    setIsDashboardOpen(false);
  };

  const handleDataRefreshed = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 1. Initial Loading Screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-champagne-beige/60 border border-muted-burgundy/30 flex items-center justify-center animate-pulse mb-4">
          <span className="font-serif font-bold text-xl text-muted-burgundy">MD</span>
        </div>
        <p className="font-serif text-lg text-deep-espresso/70">Opening Sanctuary...</p>
      </div>
    );
  }

  // 2. Protected Gateway: If not authenticated, render ONLY the Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated: Render Full Website
  return (
    <div className="relative min-h-screen bg-warm-ivory text-deep-espresso flex flex-col font-sans selection:bg-dusty-rose/30">
      {/* Ambient background particles & glows */}
      <FloatingElements />

      {/* Persistent floating audio toggle */}
      <AudioPlayer refreshTrigger={refreshTrigger} />

      {/* Welcome Toast Animation */}
      <AnimatePresence>
        {showWelcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-full bg-warm-ivory/95 border border-dusty-rose/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-deep-espresso"
          >
            <Sparkles className="w-4 h-4 text-muted-burgundy" />
            <span className="font-serif text-lg text-deep-espresso font-medium">
              Welcome back, MD ♡
            </span>
            <Heart className="w-3.5 h-3.5 fill-muted-burgundy text-muted-burgundy" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation */}
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Flow: All Website Sections */}
      <main className="flex-1">
        {/* 1. Birthday Welcome / Hero Section */}
        <HeroSection />

        {/* 2. Our Memories / Dynamic Photo & Video Gallery */}
        <MemoriesSection refreshTrigger={refreshTrigger} />

        {/* 3. Dedicated Section: MD's Favourite Memories */}
        <FavouriteMemoriesSection
          isAuthenticated={isAuthenticated}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 4. A Special Birthday Letter */}
        <LetterSection refreshTrigger={refreshTrigger} />

        {/* 5. Open When... Interactive Envelopes */}
        <OpenWhenSection refreshTrigger={refreshTrigger} />

        {/* 6. Questions for MD / Interactive Questions */}
        <QuestionsSection />

        {/* 7. MD's Little Diary / Daily Thoughts Journal */}
        <DiarySection
          isAuthenticated={isAuthenticated}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLockDiary={handleLogout}
        />

        {/* 8. A Final Birthday Surprise */}
        <SurpriseSection refreshTrigger={refreshTrigger} />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Privacy Authentication Modal */}
      <DiaryAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsDashboardOpen(true)}
      />

      {/* Personal Content Management Dashboard */}
      <AdminDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onRefreshData={handleDataRefreshed}
      />
    </div>
  );
};

export default App;
