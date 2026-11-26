import { useEffect, useState } from 'react';
import { MapPinIcon, XIcon, CheckIcon } from 'lucide-react';
import { Region, REGIONS } from '../../constants/regions';

interface RegionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (region: Region) => void;
  detectedRegion: Region | null;
  currentRegion: Region | null;
  enabledRegionIds: string[];
}

export function RegionSelector({ isOpen, onClose, onConfirm, currentRegion, enabledRegionIds }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(currentRegion && enabledRegionIds.includes(currentRegion.id) ? currentRegion : null);
  const regions = REGIONS.filter((item) => enabledRegionIds.includes(item.id));

  useEffect(() => {
    if (isOpen) setSelectedRegion(currentRegion && enabledRegionIds.includes(currentRegion.id) ? currentRegion : null);
  }, [isOpen, currentRegion, enabledRegionIds]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && currentRegion) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, currentRegion, onClose]);

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="region-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3"><MapPinIcon className="text-[#2c5f8d]" size={26} /><h2 id="region-title" className="text-xl font-bold">Выберите регион проживания</h2></div>
        {currentRegion && <button type="button" onClick={onClose} aria-label="Закрыть" className="rounded-lg p-1 hover:bg-[#f5f5f5]"><XIcon size={22} /></button>}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#525252]">Выберите регион, по которому нужна поддержка. Местонахождение по IP не используется.</p>
      <div className="mt-6 space-y-3">
        {regions.map((item) => <button type="button" key={item.id} onClick={() => setSelectedRegion(item)} aria-pressed={selectedRegion?.id === item.id} className={`flex min-h-16 w-full items-center justify-between rounded-xl border-2 p-4 text-left font-semibold focus:outline focus:outline-2 focus:outline-[#2c5f8d] ${selectedRegion?.id === item.id ? 'border-[#2c5f8d] bg-[#f0f4f8] text-[#1e4976]' : 'border-[#d4d4d4] hover:border-[#2c5f8d]'}`}><span>{item.name}</span>{selectedRegion?.id === item.id && <CheckIcon size={20} />}</button>)}
      </div>
      <button type="button" disabled={!selectedRegion} onClick={() => selectedRegion && onConfirm(selectedRegion)} className="mt-6 min-h-12 w-full rounded-xl bg-[#2c5f8d] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d4d4d4]">Подтвердить</button>
    </div>
  </div>;
}
