import React from 'react';
import { 
  Settings as SettingsIcon, 
  Cloud, 
  Shield, 
  Printer, 
  Building
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import SyncSettings from '../components/SyncSettings';
import CompanySettings from '../components/CompanySettings';
import UserManagement from '../components/UserManagement';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-white shadow-xl shadow-navy/20">
            <SettingsIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-navy tracking-tight">Terminal Settings</h1>
            <p className="text-navy/50 font-medium">Configure your POS system and cloud synchronization</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sync" className="space-y-8">
        <TabsList className="bg-surface p-1 rounded-2xl border border-navy/10 h-auto gap-1">
          <TabsTrigger 
            value="sync" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 flex items-center gap-2"
          >
            <Cloud size={18} />
            Cloud Sync
          </TabsTrigger>
          <TabsTrigger 
            value="company" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 flex items-center gap-2"
          >
            <Building size={18} />
            Company Info
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 flex items-center gap-2"
          >
            <Shield size={18} />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="printing" 
            className="rounded-xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 flex items-center gap-2"
          >
            <Printer size={18} />
            Printing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="mt-0 ring-offset-background focus-visible:outline-none">
          <SyncSettings />
        </TabsContent>

        <TabsContent value="company" className="mt-0">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <UserManagement />
        </TabsContent>

        <TabsContent value="printing" className="mt-0">
          <div className="bg-surface p-12 rounded-[40px] border border-navy/10 shadow-soft text-center space-y-4">
            <div className="w-20 h-20 bg-navy/5 rounded-3xl flex items-center justify-center text-navy/20 mx-auto">
              <Printer size={40} />
            </div>
            <h2 className="text-2xl font-bold text-navy">Print Configuration</h2>
            <p className="text-navy/50 max-w-md mx-auto">
              Setup thermal printers, A4 invoice templates, and automatic printing options.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Button({ children, variant, className, ...props }: any) {
  const base = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50";
  const variants: any = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-navy/10 bg-surface text-navy hover:bg-navy/5"
  };
  return (
    <button className={`${base} ${variants[variant || 'primary']} ${className}`} {...props}>
      {children}
    </button>
  );
}
