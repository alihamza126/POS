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
        name: 'A POS',
        address: 'Faqirwali Main Road, Haroonabad',
        phone: '+92 300 1234567',
      },
      setCompanyDetails: (details) => set({ company: details }),
    }),
    {
      name: 'pos-settings',
    }
  )
);
