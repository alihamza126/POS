import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        name: 'FIVE STAR INDUSTRY',
        address: '123 Business Road, Tech City',
        phone: '+1 234 567 8900',
      },
      setCompanyDetails: (details) => set({ company: details }),
    }),
    {
      name: 'pos-settings',
    }
  )
);
