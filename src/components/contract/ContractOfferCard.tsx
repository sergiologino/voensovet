import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPinIcon, BriefcaseIcon, WalletIcon, ArrowRightIcon } from 'lucide-react';
export interface ContractOfferCardProps {
  title: string;
  description: string;
  location: string;
  specialty: string;
  salary: string;
  benefits: string[];
  imageUrl?: string;
  onLearnMore: () => void;
}
export function ContractOfferCard({
  title,
  description,
  location,
  specialty,
  salary,
  benefits,
  imageUrl,
  onLearnMore
}: ContractOfferCardProps) {
  return <Card variant="elevated" padding="lg" className="hover:shadow-xl transition-shadow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Side - Image/Visual */}
        <div className="lg:col-span-4">
          <div className="w-full h-48 lg:h-full min-h-[200px] rounded-xl bg-gradient-to-br from-[#2c5f8d] to-[#1e4976] flex items-center justify-center" style={imageUrl ? {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}>
            {!imageUrl && <div className="text-center text-white p-6">
                <BriefcaseIcon size={48} className="mx-auto mb-3 opacity-80" />
                <p className="text-sm font-medium">{specialty}</p>
              </div>}
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-[#262626] mb-3">{title}</h3>

            <p className="text-base text-[#525252] leading-relaxed mb-6">
              {description}
            </p>

            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPinIcon size={20} className="text-[#2c5f8d] flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs text-[#737373] mb-1">Регион</div>
                  <div className="text-sm font-medium text-[#262626]">
                    {location}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BriefcaseIcon size={20} className="text-[#2c5f8d] flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs text-[#737373] mb-1">
                    Специальность
                  </div>
                  <div className="text-sm font-medium text-[#262626]">
                    {specialty}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <WalletIcon size={20} className="text-[#2c5f8d] flex-shrink-0 mt-1" />
                <div>
                  <div className="text-xs text-[#737373] mb-1">Оплата</div>
                  <div className="text-sm font-medium text-[#262626]">
                    {salary}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-[#262626] mb-3">
                Что вы получите:
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {benefits.map((benefit, index) => <li key={index} className="flex items-start gap-2 text-sm text-[#525252]">
                    <span className="text-[#2c5f8d] mt-1">•</span>
                    <span>{benefit}</span>
                  </li>)}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3">
            <Button variant="primary" onClick={onLearnMore}>
              Узнать подробнее
              <ArrowRightIcon size={18} className="ml-2" />
            </Button>
            <Button variant="ghost">Задать вопрос</Button>
          </div>
        </div>
      </div>
    </Card>;
}