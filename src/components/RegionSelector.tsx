import React, { useState, useEffect, useRef } from 'react';
import { Region, regions, searchRegions, getRegionsByDistrict } from '../data/regions';
import { MapPinIcon, SearchIcon, XIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';

interface RegionSelectorProps {
  isOpen: boolean;
  detectedRegion: Region | null;
  onConfirm: (region: Region) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export function RegionSelector({
  isOpen,
  detectedRegion,
  onConfirm,
  onClose,
  canClose = false,
}: RegionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(detectedRegion);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredRegions = searchRegions(searchQuery);
  const regionsByDistrict = getRegionsByDistrict();

  // Обновить выбранный регион при изменении detected
  useEffect(() => {
    if (detectedRegion && !selectedRegion) {
      setSelectedRegion(detectedRegion);
    }
  }, [detectedRegion, selectedRegion]);

  // Закрыть dropdown при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredRegions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredRegions[highlightedIndex]) {
          handleSelectRegion(filteredRegions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        break;
    }
  };

  const handleSelectRegion = (region: Region) => {
    setSelectedRegion(region);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (selectedRegion) {
      onConfirm(selectedRegion);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={canClose ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#2c5f8d] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPinIcon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ваш регион</h2>
                <p className="text-sm text-white/80">
                  Укажите регион для подбора помощи
                </p>
              </div>
            </div>
            {canClose && onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Detected region hint */}
          {detectedRegion && !selectedRegion && (
            <div className="mb-4 p-4 bg-[#f0fdf4] border border-[#86efac] rounded-xl">
              <p className="text-sm text-[#166534]">
                <strong>Определён регион:</strong> {detectedRegion.name}
              </p>
            </div>
          )}

          {/* Selected region display */}
          {selectedRegion && (
            <div className="mb-4 p-4 bg-[#f0f4f8] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-[#737373]">Выбранный регион:</p>
                <p className="text-lg font-semibold text-[#262626]">
                  {selectedRegion.name}
                </p>
                <p className="text-xs text-[#a3a3a3]">
                  {selectedRegion.federalDistrict} федеральный округ
                </p>
              </div>
              <CheckIcon size={24} className="text-[#2c5f8d]" />
            </div>
          )}

          {/* Search input with dropdown */}
          <div ref={dropdownRef} className="relative mb-6">
            <label className="block text-sm font-medium text-[#262626] mb-2">
              {selectedRegion ? 'Изменить регион:' : 'Выберите регион:'}
            </label>
            <div className="relative">
              <SearchIcon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373]"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  setHighlightedIndex(0);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Начните вводить название..."
                className="w-full pl-11 pr-10 py-3 border-2 border-[#d4d4d4] rounded-xl text-base focus:outline-none focus:border-[#2c5f8d]"
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f5f5f5] rounded"
              >
                <ChevronDownIcon
                  size={18}
                  className={`text-[#737373] transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#e5e5e5] rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {searchQuery ? (
                  // Search results
                  filteredRegions.length > 0 ? (
                    <div className="py-1">
                      {filteredRegions.map((region, index) => (
                        <button
                          key={region.id}
                          onClick={() => handleSelectRegion(region)}
                          className={`w-full px-4 py-2 text-left hover:bg-[#f0f4f8] flex items-center justify-between ${
                            index === highlightedIndex ? 'bg-[#f0f4f8]' : ''
                          } ${
                            selectedRegion?.id === region.id ? 'text-[#2c5f8d]' : 'text-[#262626]'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">{region.name}</p>
                            <p className="text-xs text-[#a3a3a3]">
                              {region.federalDistrict} ФО
                            </p>
                          </div>
                          {selectedRegion?.id === region.id && (
                            <CheckIcon size={16} className="text-[#2c5f8d]" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-[#737373] text-center">
                      Ничего не найдено
                    </div>
                  )
                ) : (
                  // Grouped by district
                  <div className="py-1">
                    {Object.entries(regionsByDistrict).map(([district, districtRegions]) => (
                      <div key={district}>
                        <div className="px-4 py-2 text-xs font-semibold text-[#737373] bg-[#fafafa] sticky top-0">
                          {district} ФО
                        </div>
                        {districtRegions.map((region) => (
                          <button
                            key={region.id}
                            onClick={() => handleSelectRegion(region)}
                            className={`w-full px-4 py-2 text-left hover:bg-[#f0f4f8] flex items-center justify-between ${
                              selectedRegion?.id === region.id ? 'text-[#2c5f8d] bg-[#f0f4f8]' : 'text-[#262626]'
                            }`}
                          >
                            <span className="text-sm">{region.name}</span>
                            {selectedRegion?.id === region.id && (
                              <CheckIcon size={16} className="text-[#2c5f8d]" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <button
            onClick={handleConfirm}
            disabled={!selectedRegion}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              selectedRegion
                ? 'bg-[#2c5f8d] text-white hover:bg-[#1e4976]'
                : 'bg-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed'
            }`}
          >
            Подтвердить
          </button>

          <p className="mt-4 text-xs text-[#a3a3a3] text-center">
            Регион нужен для подбора актуальных организаций и способов помощи в вашем регионе
          </p>
        </div>
      </div>
    </div>
  );
}
