import { useState, useEffect, useCallback } from 'react';
import { Region, getRegionById } from '../constants/regions';

const COOKIE_NAME = 'user_region';
const COOKIE_EXPIRY_DAYS = 365;

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const saved = getRegionById(getCookie(COOKIE_NAME) || '');
    if (saved) {
      setRegionState(saved);
    } else {
      setShowSelector(true);
    }
    setIsLoading(false);
  }, []);

  const setRegion = useCallback((newRegion: Region) => {
    setRegionState(newRegion);
    setCookie(COOKIE_NAME, newRegion.id, COOKIE_EXPIRY_DAYS);
  }, []);

  const openSelector = useCallback(() => setShowSelector(true), []);
  const closeSelector = useCallback(() => setShowSelector(false), []);
  const confirmRegion = useCallback((selectedRegion: Region) => {
    setRegion(selectedRegion);
    setShowSelector(false);
  }, [setRegion]);

  return { region, detectedRegion: null, isLoading, showSelector, setRegion, openSelector, closeSelector, confirmRegion };
}
