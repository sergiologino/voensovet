import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRegion, UseRegionReturn } from '../hooks/useRegion';
import { RegionSelector } from '../components/region/RegionSelector';
import { useAuth } from './AuthContext';
import { getRegionById, Region } from '../constants/regions';
import { api } from '../api/client';
import { PILOT_REGIONS } from '../data/navigator';

const RegionContext = createContext<UseRegionReturn | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const regionState = useRegion();
  const { user, loading, refreshUser } = useAuth();
  const [saveError, setSaveError] = useState('');
  const [enabledRegionIds, setEnabledRegionIds] = useState<string[]>([...PILOT_REGIONS]);

  useEffect(() => {
    api.getEnabledRegions().then(({ regionIds }) => {
      setEnabledRegionIds(regionIds);
      if (!user && regionState.region && !regionIds.includes(regionState.region.id)) regionState.openSelector();
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    const savedRegion = user.regionId ? getRegionById(user.regionId) : null;
    if (savedRegion) {
      regionState.setRegion(savedRegion);
      regionState.closeSelector();
    } else {
      regionState.openSelector();
    }
  }, [user?.id, user?.regionId, loading]);

  const confirmRegion = async (selectedRegion: Region) => {
    setSaveError('');
    if (user) {
      try {
        await api.updateProfile({ regionId: selectedRegion.id });
        await refreshUser();
      } catch {
        setSaveError('Не удалось сохранить регион. Попробуйте ещё раз.');
        return;
      }
    }
    regionState.confirmRegion(selectedRegion);
  };

  return (
    <RegionContext.Provider value={regionState}>
      {children}
      {saveError && <div role="alert" className="fixed bottom-4 left-4 z-[110] rounded-xl bg-red-50 p-4 text-red-700 shadow-lg">{saveError}</div>}
      <RegionSelector
        isOpen={regionState.showSelector}
        onClose={regionState.closeSelector}
        onConfirm={confirmRegion}
        detectedRegion={regionState.detectedRegion}
        currentRegion={regionState.region}
        enabledRegionIds={enabledRegionIds}
      />
    </RegionContext.Provider>
  );
}

export function useRegionContext(): UseRegionReturn {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegionContext must be used within a RegionProvider');
  }
  return context;
}

