import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Sparkles, BookOpen, MessageSquare, Image as ImageIcon, Gift, Star, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal?: () => void;
  onOpenDashboard?: () => void;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onOpenDashboard, isAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Memories', href: '#memories', icon: ImageIcon },
    { name: 'Favourites', href: '#favourite-memories', icon: Star },
    { name: 'The Letter', href: '#letter', icon: Heart },
    { name: 'Questions', href: '#questions', icon: MessageSquare },
    { name: "Vijeta's Diary", href: '#diary', icon: BookOpen },
    { name: 'Surprise', href: '#surprise', icon: Gift },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-warm-ivory/85 backdrop-blur-md shadow-sm border-b border-dusty-rose/20 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Emblem */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-champagne-beige/60 border border-muted-burgundy/30 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <span className="font-serif font-bold text-base text-muted-burgundy tracking-wider">MD</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-medium tracking-wide text-deep-espresso">
              MYDREAM
            </span>
            <span className="text-[10px] uppercase font-sans tracking-widest text-muted-burgundy font-semibold">
              For Vijeta
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-sans text-deep-espresso/80 hover:text-muted-burgundy transition-colors tracking-wide relative group py-1"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-muted-burgundy transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          {/* Dashboard Button */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 text-xs font-sans px-3.5 py-1.5 rounded-full bg-muted-burgundy text-warm-ivory hover:bg-burgundy-dark transition-all shadow-2xs"
            title="Open Content Management Dashboard"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Content</span>
          </button>

          {/* Diary Status Indicator */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 text-xs font-sans px-3 py-1.5 rounded-full border border-dusty-rose/40 bg-white/50 text-muted-burgundy hover:bg-white hover:border-muted-burgundy transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-muted-burgundy" />
            <span>{isAuthenticated ? 'Unlocked' : 'Private Diary'}</span>
          </button>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={onOpenDashboard}
            className="p-2 text-xs font-sans rounded-full bg-champagne-beige/60 text-muted-burgundy flex items-center gap-1"
            title="Manage Content"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-deep-espresso hover:text-muted-burgundy transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-warm-ivory border-b border-dusty-rose/20 px-6 py-6 shadow-lg overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-serif text-deep-espresso hover:text-muted-burgundy transition-colors py-1.5 border-b border-dusty-rose/10"
                  >
                    <Icon className="w-4 h-4 text-muted-burgundy/70" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
              
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard?.();
                  }}
                  className="flex items-center justify-center gap-2 text-xs font-sans px-4 py-2.5 rounded-full bg-muted-burgundy text-warm-ivory"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Manage Website Content</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal?.();
                  }}
                  className="flex items-center justify-center gap-2 text-xs font-sans px-4 py-2.5 rounded-full border border-dusty-rose/40 bg-white/60 text-muted-burgundy"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAuthenticated ? "Diary Unlocked" : 'Unlock Private Diary'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
