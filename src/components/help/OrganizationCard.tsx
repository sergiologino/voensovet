import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PhoneIcon, GlobeIcon, ClockIcon } from 'lucide-react';
export interface OrganizationCardProps {
  name: string;
  description: string;
  phone: string;
  website?: string;
  hours: string;
  isAvailableNow?: boolean;
}
export function OrganizationCard({
  name,
  description,
  phone,
  website,
  hours,
  isAvailableNow = false
}: OrganizationCardProps) {
  return <Card variant="elevated">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-[#262626]">{name}</h3>
            {isAvailableNow && <span className="px-3 py-1 bg-[#f0fdf4] text-[#16a34a] text-xs font-medium rounded-lg">
                Доступно сейчас
              </span>}
          </div>
          <p className="text-sm text-[#737373] leading-relaxed mb-4">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#525252]">
          <ClockIcon size={16} className="text-[#737373]" />
          <span>{hours}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" onClick={() => window.location.href = `tel:${phone}`}>
            <PhoneIcon size={16} className="mr-2" />
            {phone}
          </Button>

          {website && <Button variant="ghost" size="sm" onClick={() => window.open(website, '_blank')}>
              <GlobeIcon size={16} className="mr-2" />
              Открыть сайт
            </Button>}
        </div>
      </div>
    </Card>;
}