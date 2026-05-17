import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_CONFIG } from '../shared/constants/config';

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
}

interface SettingsState {
  company: CompanySettings;
  setCompanyDetails: (details: CompanySettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      company: {
        name: APP_CONFIG.defaults.companyName,
        address: APP_CONFIG.defaults.companyAddress,
        phone: APP_CONFIG.defaults.companyPhone,
      },
      setCompanyDetails: (details) => set({ company: details }),
    }),
    {
      name: 'pos-settings',
    }
  )
);
