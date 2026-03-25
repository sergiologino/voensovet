import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { QuickActions } from '../components/home/QuickActions';
import { ContractServiceBanner } from '../components/home/ContractServiceBanner';
import { TrustSection } from '../components/home/TrustSection';
import { AiAssistant } from '../components/ai/AiAssistant';

export function HomePage() {
  return <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <QuickActions />
        <AiAssistant />
        <ContractServiceBanner />
        <TrustSection />
      </main>
      <Footer />
    </div>;
}