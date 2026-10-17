import { create } from 'zustand';
import { Region } from '@/types';
import { api, MOCK_REGIONS } from '@/services/api';

interface RegionStore {
  selectedRegion: Region;
  regions: Region[];
  isLoading: boolean;
  setRegion: (region: Region) => void;
  fetchRegions: () => Promise<void>;
}

export const useRegionStore = create<RegionStore>((set) => ({
  selectedRegion: MOCK_REGIONS[2], // Default to Panaji Urban Sector
  regions: MOCK_REGIONS,
  isLoading: false,

  setRegion: (region: Region) => {
    set({ selectedRegion: region });
  },

  fetchRegions: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getRegions();
      set({ regions: data, selectedRegion: data[0] || MOCK_REGIONS[0], isLoading: false });
    } catch {
      set({ regions: MOCK_REGIONS, isLoading: false });
    }
  },
}));
