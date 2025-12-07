import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRightIcon, ShieldIcon } from 'lucide-react';
export function ContractServiceBanner() {
  return <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-[#2c5f8d] to-[#1e4976] rounded-3xl overflow-hidden shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)'
          }} />
          </div>

          {/* Content */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-6 w-fit">
                <ShieldIcon size={20} className="text-white" />
                <span className="text-sm font-medium text-white">
                  Новые возможности
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Служба в ВС РФ по контракту
              </h2>

              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Стабильная работа, достойная зарплата, социальные гарантии и
                возможности для профессионального роста. Узнайте о доступных
                вакансиях и условиях службы.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="lg" onClick={() => window.location.href = '#contract-service'}>
                  Посмотреть предложения
                  <ArrowRightIcon size={20} className="ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-2">100+</div>
                  <div className="text-sm text-white/80">
                    Военных специальностей
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm text-white/80">Консультации</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-2">50+</div>
                  <div className="text-sm text-white/80">Регионов</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-2">100%</div>
                  <div className="text-sm text-white/80">
                    Социальных гарантий
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}