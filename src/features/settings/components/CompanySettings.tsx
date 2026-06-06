import React, { useState } from 'react';
import { 
  Building, 
  Phone, 
  MapPin, 
  Check, 
  ShieldAlert,
  Save
} from 'lucide-react';
import { useSettingsStore } from '../../../stores/settings-store';

export default function CompanySettings() {
  const { company, setCompanyDetails } = useSettingsStore();
  const [name, setName] = useState(company.name);
  const [address, setAddress] = useState(company.address);
  const [phone, setPhone] = useState(company.phone);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Company Name is required');
      return;
    }
    setCompanyDetails({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim()
    });
    setSuccess('Company profile settings saved successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="bg-surface rounded-[32px] border border-navy/10 shadow-soft p-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center text-navy">
          <Building size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-navy">Company Profile Settings</h3>
          <p className="text-navy/50 text-xs font-semibold">Customize business details for invoices, printed reports, and ledgers</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-in fade-in duration-300">
          <Check size={20} className="shrink-0 animate-bounce" />
          <p className="font-semibold text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-navy/60 uppercase tracking-wider flex items-center gap-1.5">
            <Building size={14} className="text-navy/40" />
            Company Name
          </label>
          <input 
            type="text"
            value={name}
            readOnly
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Al Madina Autos"
            className="w-full px-4 py-3.5 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold placeholder:text-navy/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-navy/60 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={14} className="text-navy/40" />
            Phone Number
          </label>
          <input 
            type="text"
            value={phone}
            readOnly
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +92 301 7890207"
            className="w-full px-4 py-3.5 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold placeholder:text-navy/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-navy/60 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-navy/40" />
            Business Address
          </label>
          <textarea 
            value={address}
            readOnly
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Quaid Azam road Faqirwali"
            rows={3}
            className="w-full px-4 py-3.5 bg-navy/5 rounded-xl border border-navy/10 focus:outline-none focus:border-primary text-navy font-bold placeholder:text-navy/20 resize-none"
          />
        </div>

        <button 
          type="submit"
          className="px-6 py-3.5 bg-primary text-white font-black rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 mt-6 active:scale-95"
        >
          <Save size={18} />
          Save Settings
        </button>
      </form>
    </div>
  );
}
