import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { MemoriesSection } from './components/sections/MemoriesSection';
import { FavouriteMemoriesSection } from './components/sections/FavouriteMemoriesSection';
import { LetterSection } from './components/sections/LetterSection';
import { QuestionsSection } from './components/sections/QuestionsSection';
import { DiarySection } from './components/sections/DiarySection';
import { SurpriseSection } from './components/sections/SurpriseSection';
import { Footer } from './components/common/Footer';
import { AudioPlayer } from './components/common/AudioPlayer';
import { FloatingElements } from './components/common/FloatingElements';
import { DiaryAuthModal } from './components/auth/DiaryAuthModal';
import { AdminDashboardModal } from './components/dashboard/AdminDashboardModal';

export const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check initial authentication state from session / local storage
    const authState = localStorage.getItem('md_diary_auth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    const diaryEl = document.getElementById('diary');
    if (diaryEl) {
      diaryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLockDiary = () => {
    localStorage.removeItem('md_diary_auth');
    setIsAuthenticated(false);
  };

  const handleOpenDashboard = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsDashboardOpen(true);
    }
  };

  const handleDataRefreshed = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-warm-ivory text-deep-espresso flex flex-col font-sans selection:bg-dusty-rose/30">
      {/* Ambient background particles & glows */}
      <FloatingElements />

      {/* Persistent floating audio toggle */}
      <AudioPlayer />

      {/* Global Navigation */}
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenDashboard={handleOpenDashboard}
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
        <LetterSection />

        {/* 5. Questions for MD / Interactive Questions */}
        <QuestionsSection />

        {/* 6. MD's Little Diary / Daily Thoughts Journal */}
        <DiarySection
          isAuthenticated={isAuthenticated}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLockDiary={handleLockDiary}
        />

        {/* 7. A Final Birthday Surprise */}
        <SurpriseSection />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Privacy Authentication Modal */}
      <DiaryAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
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
