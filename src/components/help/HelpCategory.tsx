import React from 'react';
import { Card } from '../ui/Card';
import { BoxIcon } from 'lucide-react';
export interface HelpCategoryProps {
  icon: BoxIcon;
  title: string;
  description: string;
  onClick: () => void;
}
export function HelpCategory({
  icon: Icon,
  title,
  description,
  onClick
}: HelpCategoryProps) {
  return <Card variant="elevated" hoverable onClick={onClick} className="h-full">
      <div className="flex flex-col h-full">
        <div className="w-16 h-16 bg-[#f0f4f8] rounded-xl flex items-center justify-center mb-4">
          <Icon className="text-[#2c5f8d]" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-[#262626] mb-3">{title}</h3>
        <p className="text-sm text-[#737373] leading-relaxed flex-grow">
          {description}
        </p>
        <div className="mt-4 text-sm text-[#2c5f8d] font-medium">
          Посмотреть контакты →
        </div>
      </div>
    </Card>;
}