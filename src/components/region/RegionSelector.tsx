import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, SearchIcon, XIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Region, REGIONS, FEDERAL_DISTRICTS, getRegionsByDistrict, searchRegions } from '../../constants/regions';

interface RegionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (region: Region) => void;
  detectedRegion: Region | null;
  currentRegion: Region | null;
}

export function RegionSelector({
  isOpen,
  onClose,
  onConfirm,
  detectedRegion,
  currentRegion,
}: RegionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(
    currentRegion || detectedRegion
  );
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Фокус на поле поиска при открытии
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Предотвращение прокрутки body при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Установка выбранного региона при изменении detectedRegion или currentRegion
  useEffect(() => {
    if (isOpen && !selectedRegion) {
      setSelectedRegion(currentRegion || detectedRegion);
    }
  }, [isOpen, detectedRegion, currentRegion, selectedRegion]);

  const handleConfirm = () => {
    if (selectedRegion) {
      onConfirm(selectedRegion);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      // Не закрываем при клике вне - требуем выбор региона
    }
  };

  const filteredRegions = searchQuery ? searchRegions(searchQuery) : [];
  const showSearchResults = searchQuery.length > 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#f0f4f8] rounded-xl flex items-center justify-center">
                <MapPinIcon className="text-[#2c5f8d]" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#262626]">
                  Выберите ваш регион
                </h2>
                <p className="text-sm text-[#737373]">
                  Это поможет подобрать актуальную информацию
                </p>
              </div>
            </div>
            {currentRegion && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-[#737373]" />
              </button>
            )}
          </div>

          {/* Detected region banner */}
          {detectedRegion && !currentRegion && (
            <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl p-4 mb-4">
              <p className="text-sm text-[#166534]">
                <strong>Определён регион:</strong> {detectedRegion.name}
              </p>
              <p className="text-xs text-[#166534]/70 mt-1">
                Подтвердите или выберите другой регион из списка
              </p>
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <SearchIcon 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#737373]" 
              size={20} 
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Поиск региона..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#d4d4d4] rounded-xl text-base text-[#262626] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#2c5f8d]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#f5f5f5] rounded"
              >
                <XIcon size={16} className="text-[#737373]" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showSearchResults ? (
            // Search results
            <div className="space-y-2">
              {filteredRegions.length === 0 ? (
                <p className="text-center text-[#737373] py-8">
                  Регион не найден. Попробуйте изменить запрос.
                </p>
              ) : (
                filteredRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => {
                      setSelectedRegion(region);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors text-left ${
                      selectedRegion?.id === region.id
                        ? 'border-[#2c5f8d] bg-[#f0f4f8]'
                        : 'border-[#e5e5e5] hover:border-[#d4d4d4] hover:bg-[#fafafa]'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-[#262626]">{region.name}</p>
                      <p className="text-xs text-[#737373]">{region.federalDistrict} ФО</p>
                    </div>
                    {selectedRegion?.id === region.id && (
                      <CheckIcon size={20} className="text-[#2c5f8d]" />
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            // Districts accordion
            <div className="space-y-3">
              {FEDERAL_DISTRICTS.map((district) => {
                const regions = getRegionsByDistrict(district);
                const isExpanded = expandedDistrict === district;
                const hasSelected = regions.some((r) => r.id === selectedRegion?.id);

                return (
                  <div key={district} className="border-2 border-[#e5e5e5] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDistrict(isExpanded ? null : district)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        hasSelected ? 'bg-[#f0f4f8]' : 'hover:bg-[#fafafa]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[#262626]">
                          {district} федеральный округ
                        </span>
                        <span className="text-xs text-[#737373] bg-[#f5f5f5] px-2 py-1 rounded">
                          {regions.length}
                        </span>
                      </div>
                      <ChevronDownIcon 
                        size={20} 
                        className={`text-[#737373] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-[#e5e5e5] p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {regions.map((region) => (
                          <button
                            key={region.id}
                            onClick={() => setSelectedRegion(region)}
                            className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                              selectedRegion?.id === region.id
                                ? 'bg-[#2c5f8d] text-white'
                                : 'hover:bg-[#f5f5f5] text-[#525252]'
                            }`}
                          >
                            <span className="text-sm">{region.name}</span>
                            {selectedRegion?.id === region.id && (
                              <CheckIcon size={16} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e5e5e5] bg-[#fafafa]">
          <div className="flex items-center justify-between">
            <div>
              {selectedRegion && (
                <p className="text-sm text-[#525252]">
                  Выбрано: <strong className="text-[#262626]">{selectedRegion.name}</strong>
                </p>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedRegion}
              className={`px-8 py-3 rounded-xl font-medium transition-colors ${
                selectedRegion
                  ? 'bg-[#2c5f8d] text-white hover:bg-[#1e4976]'
                  : 'bg-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed'
              }`}
            >
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
