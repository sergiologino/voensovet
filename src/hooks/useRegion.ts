import { useState, useEffect, useCallback } from 'react';
import { Region, REGIONS, getRegionById, getRegionByName } from '../constants/regions';

const COOKIE_NAME = 'user_region';
const COOKIE_EXPIRY_DAYS = 365;

// Утилиты для работы с cookies
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Определение региона по IP через бесплатный API
const detectRegionByIP = async (): Promise<string | null> => {
  try {
    // Используем несколько API для надёжности
    const apis = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/?lang=ru',
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api, { 
          signal: AbortSignal.timeout(5000) // 5 секунд таймаут
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // ipapi.co формат
        if (data.region) {
          return data.region;
        }
        
        // ip-api.com формат
        if (data.regionName) {
          return data.regionName;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

// Маппинг названий регионов из API к нашим данным
const mapAPIRegionToLocal = (apiRegion: string): Region | null => {
  if (!apiRegion) return null;
  
  const normalizedName = apiRegion.toLowerCase().trim();
  
  // Прямое совпадение
  const directMatch = REGIONS.find(r => 
    r.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(r.name.toLowerCase().replace(' область', '').replace(' край', '').replace('республика ', ''))
  );
  
  if (directMatch) return directMatch;
  
  // Маппинг частых вариантов из API
  const mappings: Record<string, string> = {
    'moscow': 'moscow',
    'москва': 'moscow',
    'moscow oblast': 'moscow_oblast',
    'московская': 'moscow_oblast',
    'saint petersburg': 'spb',
    'санкт-петербург': 'spb',
    'st petersburg': 'spb',
    'leningrad oblast': 'leningrad',
    'ленинградская': 'leningrad',
    'krasnodar krai': 'krasnodar',
    'краснодарский': 'krasnodar',
    'sverdlovsk oblast': 'sverdlovsk',
    'свердловская': 'sverdlovsk',
    'rostov oblast': 'rostov',
    'ростовская': 'rostov',
    'tatarstan': 'tatarstan',
    'татарстан': 'tatarstan',
    'bashkortostan': 'bashkortostan',
    'башкортостан': 'bashkortostan',
    'novosibirsk oblast': 'novosibirsk',
    'новосибирская': 'novosibirsk',
    'chelyabinsk oblast': 'chelyabinsk',
    'челябинская': 'chelyabinsk',
    'nizhny novgorod oblast': 'nizhny_novgorod',
    'нижегородская': 'nizhny_novgorod',
    'samara oblast': 'samara',
    'самарская': 'samara',
    'crimea': 'crimea',
    'крым': 'crimea',
    'sevastopol': 'sevastopol',
    'севастополь': 'sevastopol',
  };
  
  for (const [key, value] of Object.entries(mappings)) {
    if (normalizedName.includes(key)) {
      return getRegionById(value) || null;
    }
  }
  
  return null;
};

export interface UseRegionReturn {
  region: Region | null;
  detectedRegion: Region | null;
  isLoading: boolean;
  showSelector: boolean;
  setRegion: (region: Region) => void;
  openSelector: () => void;
  closeSelector: () => void;
  confirmRegion: (region: Region) => void;
}

export function useRegion(): UseRegionReturn {
  const [region, setRegionState] = useState<Region | null>(null);
  const [detectedRegion, setDetectedRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  // Инициализация: проверяем cookies, затем определяем по IP
  useEffect(() => {
    const initRegion = async () => {
      setIsLoading(true);
      
      // 1. Проверяем cookies
      const savedRegionId = getCookie(COOKIE_NAME);
      if (savedRegionId) {
        const savedRegion = getRegionById(savedRegionId);
        if (savedRegion) {
          setRegionState(savedRegion);
          setIsLoading(false);
          return;
        }
      }
      
      // 2. Определяем по IP
      const apiRegionName = await detectRegionByIP();
      if (apiRegionName) {
        const mappedRegion = mapAPIRegionToLocal(apiRegionName);
        if (mappedRegion) {
          setDetectedRegion(mappedRegion);
        }
      }
      
      // 3. Показываем селектор для подтверждения/выбора
      setShowSelector(true);
      setIsLoading(false);
    };
    
    initRegion();
  }, []);

  const setRegion = useCallback((newRegion: Region) => {
    setRegionState(newRegion);
    setCookie(COOKIE_NAME, newRegion.id, COOKIE_EXPIRY_DAYS);
  }, []);

  const openSelector = useCallback(() => {
    setShowSelector(true);
  }, []);

  const closeSelector = useCallback(() => {
    setShowSelector(false);
  }, []);

  const confirmRegion = useCallback((selectedRegion: Region) => {
    setRegion(selectedRegion);
    setShowSelector(false);
  }, [setRegion]);

  return {
    region,
    detectedRegion,
    isLoading,
    showSelector,
    setRegion,
    openSelector,
    closeSelector,
    confirmRegion,
  };
}
