import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  Phone,
  MapPin,
  Printer,
  Bell,
  Save,
  Loader2,
  Stethoscope,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';

const clinicSchema = z.object({
  clinicName: z.string().min(1, 'Clinic name is required'),
  doctorName: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  receiptFooter: z.string().optional().nullable(),
  expiryAlertDays: z.coerce.number().min(1).max(365).default(90),
  paperSize: z.enum(['58mm', '80mm', 'A4']).default('80mm'),
  currency: z.string().default('Rs.'),
  showBatchOnReceipt: z.boolean().default(true),
  showExpiryOnReceipt: z.boolean().default(true),
  showCompositionOnReceipt: z.boolean().default(true),
});

type ClinicFormValues = z.infer<typeof clinicSchema>;

export default function ClinicSettings() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinicName: 'Homio Medical Clinic',
      expiryAlertDays: 90,
      paperSize: '80mm',
      currency: 'Rs.',
      showBatchOnReceipt: true,
      showExpiryOnReceipt: true,
      showCompositionOnReceipt: true,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const settings = await window.api.medical.getClinicSettings();
        if (settings) {
          reset({
            ...settings,
            showBatchOnReceipt: !!settings.showBatchOnReceipt,
            showExpiryOnReceipt: !!settings.showExpiryOnReceipt,
            showCompositionOnReceipt: !!settings.showCompositionOnReceipt,
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load clinic settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: ClinicFormValues) => {
    try {
      // Convert to string record for storage
      const settingsRecord: Record<string, string> = {
        clinicName: data.clinicName,
        doctorName: data.doctorName ?? '',
        licenseNumber: data.licenseNumber ?? '',
        address: data.address ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        receiptFooter: data.receiptFooter ?? 'Thank you for visiting us. Get well soon!',
        expiryAlertDays: String(data.expiryAlertDays),
        paperSize: data.paperSize,
        currency: data.currency,
        showBatchOnReceipt: String(data.showBatchOnReceipt),
        showExpiryOnReceipt: String(data.showExpiryOnReceipt),
        showCompositionOnReceipt: String(data.showCompositionOnReceipt),
      };

      // @ts-ignore
      await window.api.medical.saveClinicSettings(
        settingsRecord,
        user?.id,
        APP_CONFIG.branch.defaultId,
      );

      toast({
        title: 'Clinic Settings Saved',
        description: 'Your clinic settings have been updated successfully.',
        variant: 'success' as any,
      });
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: 'Could not save clinic settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Identity */}
      <Card className="p-6 border-navy/5 shadow-soft space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <Building2 size={16} className="text-primary" />
          <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
            Clinic Identity
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="clinicName" className="text-sm font-bold text-navy flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              Clinic Name *
            </Label>
            <Input
              id="clinicName"
              placeholder="Homio Medical Clinic"
              className="text-lg font-bold"
              {...register('clinicName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorName" className="text-sm font-bold text-navy flex items-center gap-2">
              <Stethoscope size={14} className="text-primary" />
              Doctor / Physician Name
            </Label>
            <Input
              id="doctorName"
              placeholder="Dr. Muhammad Ali"
              {...register('doctorName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber" className="text-sm font-bold text-navy flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              License / Registration No.
            </Label>
            <Input
              id="licenseNumber"
              placeholder="PMC-XXXXX"
              {...register('licenseNumber')}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="address" className="text-sm font-bold text-navy flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              Address
            </Label>
            <textarea
              id="address"
              rows={2}
              placeholder="Shop 12, Medical Market, Lahore"
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('address')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-bold text-navy flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="+92 300 000 0000"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-navy">
              Email (optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="clinic@email.com"
              {...register('email')}
            />
          </div>
        </div>
      </Card>

      {/* Receipt Settings */}
      <Card className="p-6 border-navy/5 shadow-soft space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <Printer size={16} className="text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
            Receipt & Printing
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="paperSize" className="text-sm font-bold text-navy flex items-center gap-2">
              <Printer size={14} className="text-amber-500" />
              Paper Size
            </Label>
            <select
              id="paperSize"
              className="w-full h-10 rounded-xl border border-navy/20 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('paperSize')}
            >
              <option value="58mm">58mm Thermal</option>
              <option value="80mm">80mm Thermal</option>
              <option value="A4">A4 Paper</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-bold text-navy">
              Currency Symbol
            </Label>
            <Input
              id="currency"
              placeholder="Rs."
              {...register('currency')}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="receiptFooter" className="text-sm font-bold text-navy">
              Receipt Footer Message
            </Label>
            <textarea
              id="receiptFooter"
              rows={2}
              placeholder="Thank you for visiting us. Get well soon!"
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('receiptFooter')}
            />
          </div>

          {/* Receipt Display Options */}
          <div className="col-span-2 space-y-3">
            <p className="text-sm font-bold text-navy">Show on Receipt</p>
            <div className="space-y-2">
              {[
                { id: 'showBatchOnReceipt', label: 'Batch Number', field: 'showBatchOnReceipt' as const },
                { id: 'showExpiryOnReceipt', label: 'Expiry Date', field: 'showExpiryOnReceipt' as const },
                { id: 'showCompositionOnReceipt', label: 'Composition / Salt Name', field: 'showCompositionOnReceipt' as const },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary"
                    {...register(opt.field)}
                  />
                  <span className="text-sm font-medium text-navy">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Expiry Alert Settings */}
      <Card className="p-6 border-navy/5 shadow-soft space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <Bell size={16} className="text-red-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
            Expiry Alert Settings
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryAlertDays" className="text-sm font-bold text-navy flex items-center gap-2">
            <Clock size={14} className="text-red-500" />
            Alert when expiry is within how many days?
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="expiryAlertDays"
              type="number"
              min="1"
              max="365"
              className="w-32"
              {...register('expiryAlertDays', { valueAsNumber: true })}
            />
            <span className="text-sm text-navy/60 font-medium">days before expiry</span>
          </div>
          <p className="text-xs text-gray-400">
            Critical alert: &lt;7 days · Warning: 7-30 days · Info: 30 to this value
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-[#02025C] hover:bg-[#02025C]/90"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSubmitting ? 'Saving...' : 'Save Clinic Settings'}
        </Button>
      </div>
    </form>
  );
}
