'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onScrollTo: (e: React.MouseEvent, sectionId: string) => void;
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (e: React.MouseEvent, sectionId: string) => {
    setMobileMenuOpen(false);
    onScrollTo(e, sectionId);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur-xl border-b border-[#334155]/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FFB03A] to-[#FF9800] flex items-center justify-center shadow-xl shadow-[#FFB03A]/25 border border-[#FFB03A]/30 text-[#0F172A] group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F172A]" />
          </div>
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-slate-100 via-[#38BDF8] to-slate-200 bg-clip-text text-transparent">
            Nexus Chat
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
          <a
            href="#purpose"
            onClick={(e) => onScrollTo(e, 'purpose')}
            className="hover:text-[#FFB03A] transition-colors cursor-pointer"
          >
            Purpose & Why Us
          </a>
          <a
            href="#features"
            onClick={(e) => onScrollTo(e, 'features')}
            className="hover:text-[#FFB03A] transition-colors cursor-pointer"
          >
            Key Features
          </a>
          <a
            href="#architecture"
            onClick={(e) => onScrollTo(e, 'architecture')}
            className="hover:text-[#FFB03A] transition-colors cursor-pointer"
          >
            Architecture
          </a>
          <a
            href="#demo"
            onClick={(e) => onScrollTo(e, 'demo')}
            className="hover:text-[#FFB03A] transition-colors cursor-pointer"
          >
            Live Sandbox
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#FFB03A] to-[#FF9800] hover:from-[#FFC670] hover:to-[#FFA726] text-[#0F172A] font-extrabold text-xs sm:text-sm shadow-xl shadow-[#FFB03A]/25 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:scale-105"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F172A]" />
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#1E293B] border border-[#334155] cursor-pointer"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-[#334155] px-6 py-4 space-y-3 animate-fade-in text-sm font-bold text-slate-200">
          <a
            href="#purpose"
            onClick={(e) => handleMobileNav(e, 'purpose')}
            className="block py-2 hover:text-[#FFB03A] transition-colors"
          >
            Purpose & Why Us
          </a>
          <a
            href="#features"
            onClick={(e) => handleMobileNav(e, 'features')}
            className="block py-2 hover:text-[#FFB03A] transition-colors"
          >
            Key Features
          </a>
          <a
            href="#architecture"
            onClick={(e) => handleMobileNav(e, 'architecture')}
            className="block py-2 hover:text-[#FFB03A] transition-colors"
          >
            Architecture
          </a>
          <a
            href="#demo"
            onClick={(e) => handleMobileNav(e, 'demo')}
            className="block py-2 hover:text-[#FFB03A] transition-colors"
          >
            Live Sandbox
          </a>
        </div>
      )}
    </nav>
  );
}
