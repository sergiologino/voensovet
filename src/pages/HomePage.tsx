import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { QuickActions } from '../components/home/QuickActions';
import { ContractServiceBanner } from '../components/home/ContractServiceBanner';
import { TrustSection } from '../components/home/TrustSection';
import { AiAssistant } from '../components/ai/AiAssistant';
import { SEO } from '../components/seo/SEO';

export function HomePage() {
  return (
    <>
      <SEO
        title="Главная"
        description="Портал поддержки военнослужащих - помощь, права, льготы, консультации. Получите поддержку и узнайте о своих правах. Конфиденциально и бесплатно."
        keywords="помощь военнослужащим, права военнослужащих, льготы военнослужащим, поддержка военных, консультации для военных, помощь ветеранам"
        canonical="https://sergiologino-voensovet-1e9f.twc1.net"
      />
      <div className="min-h-screen bg-white relative">
        {/* Logo in top-left corner - поверх всех элементов */}
        <div className="fixed top-4 left-4 z-[9999] pointer-events-none">
          <div className="pointer-events-auto">
            <img 
              src="/logo-placeholder.png" 
              alt="Логотип Портал Поддержки" 
              className="w-[150px] h-[150px] object-contain drop-shadow-lg"
              onError={(e) => {
                // Если изображение не найдено, создаем заглушку
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (!target.nextElementSibling) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-[150px] h-[150px] bg-[#2c5f8d] rounded-xl flex items-center justify-center drop-shadow-lg';
                  placeholder.innerHTML = '<span class="text-white text-2xl font-bold">ПП</span>';
                  target.parentElement?.appendChild(placeholder);
                }
              }}
            />
          </div>
        </div>

      <Header />
      <main>
        <HeroSection />
        <QuickActions />
        
        {/* AI Assistant Section */}
        <section className="py-12 lg:py-16 bg-[#fafafa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AiAssistant />
          </div>
        </section>

        <ContractServiceBanner />
        <TrustSection />
      </main>
      <Footer />
      </div>
    </>
  );
}