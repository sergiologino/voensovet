import React, { createContext, useContext, ReactNode } from 'react';
import { useRegion, UseRegionReturn } from '../hooks/useRegion';
import { RegionSelector } from '../components/region/RegionSelector';

const RegionContext = createContext<UseRegionReturn | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const regionState = useRegion();

  return (
    <RegionContext.Provider value={regionState}>
      {children}
      <RegionSelector
        isOpen={regionState.showSelector}
        onClose={regionState.closeSelector}
        onConfirm={regionState.confirmRegion}
        detectedRegion={regionState.detectedRegion}
        currentRegion={regionState.region}
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

