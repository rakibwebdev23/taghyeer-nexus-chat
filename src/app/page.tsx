'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PurposeSection } from '@/components/landing/PurposeSection';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { ArchitectureExplorer } from '@/components/landing/ArchitectureExplorer';
import { CtaBanner } from '@/components/landing/CtaBanner';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = document.querySelectorAll('.reveal-hidden');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleScrollTo = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      const navHeight = 80;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 selection:bg-[#FFB03A] selection:text-[#0F172A] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] bg-[#0284C7]/20 blur-[150px] rounded-full pointer-events-none animate-float" />
      <div className="absolute top-[25%] right-[-10%] w-[700px] h-[700px] bg-[#FFB03A]/15 blur-[170px] rounded-full pointer-events-none animate-float-reverse" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#38BDF8]/15 blur-[160px] rounded-full pointer-events-none animate-glow-pulse" />

      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" 
      />
      <Navbar onScrollTo={handleScrollTo} />
      <Hero onScrollTo={handleScrollTo} />
      <PurposeSection />
      <FeatureShowcase />
      <ArchitectureExplorer />
      <CtaBanner />
      <Footer />
    </div>
  );
}
