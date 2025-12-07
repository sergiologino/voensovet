import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { QuickActions } from '../components/home/QuickActions';
import { ContractServiceBanner } from '../components/home/ContractServiceBanner';
import { TrustSection } from '../components/home/TrustSection';
export function HomePage() {
  return <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <QuickActions />
        <ContractServiceBanner />
        <TrustSection />
      </main>
      <Footer />
    </div>;
}