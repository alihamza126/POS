import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Heart,
  AlertTriangle,
  Stethoscope,
  Save,
  Phone,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';

const patientSchema = z.object({
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bloodGroup: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
  currentMedications: z.string().optional().nullable(),
  doctorName: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientProfileTabProps {
  customerId: string;
}

export default function PatientProfileTab({ customerId }: PatientProfileTabProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasRecord, setHasRecord] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const record = await window.api.medical.getPatientRecord(customerId);
        if (record) {
          setHasRecord(true);
          reset(record);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch patient record:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [customerId, reset]);

  const onSubmit = async (data: PatientFormValues) => {
    try {
      // @ts-ignore
      await window.api.medical.savePatientRecord(
        customerId,
        data,
        user?.id,
        APP_CONFIG.branch.defaultId,
      );
      setHasRecord(true);
      toast({
        title: 'Patient Record Saved',
        description: 'Medical information has been updated successfully.',
        variant: 'success' as any,
      });
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: 'Could not save patient record. Please try again.',
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
      {/* Status Banner */}
      {!hasRecord && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium flex items-center gap-3">
          <User size={16} className="shrink-0" />
          No medical profile yet. Fill in the details below to create one.
        </div>
      )}

      {/* Basic Medical Info */}
      <div className="bg-white rounded-2xl border border-navy/5 shadow-soft p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <User size={16} className="text-primary" />
          <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-xs font-bold text-navy flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" />
              Date of Birth
            </Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-xs font-bold text-navy">
              Gender
            </Label>
            <select
              id="gender"
              className="w-full h-10 rounded-xl border border-navy/20 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup" className="text-xs font-bold text-navy flex items-center gap-1.5">
              <Heart size={12} className="text-red-500" />
              Blood Group
            </Label>
            <select
              id="bloodGroup"
              className="w-full h-10 rounded-xl border border-navy/20 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('bloodGroup')}
            >
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doctorName" className="text-xs font-bold text-navy flex items-center gap-1.5">
              <Stethoscope size={12} className="text-primary" />
              Primary Doctor / Physician
            </Label>
            <Input
              id="doctorName"
              placeholder="Dr. Name"
              {...register('doctorName')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="text-xs font-bold text-navy">
              Emergency Contact Name
            </Label>
            <Input
              id="emergencyContact"
              placeholder="Contact name"
              {...register('emergencyContact')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone" className="text-xs font-bold text-navy flex items-center gap-1.5">
              <Phone size={12} className="text-primary" />
              Emergency Phone
            </Label>
            <Input
              id="emergencyPhone"
              placeholder="+92 300 000 0000"
              {...register('emergencyPhone')}
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-2xl border border-navy/5 shadow-soft p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
            Medical History
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-xs font-bold text-navy flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-red-500" />
              Known Allergies
            </Label>
            <textarea
              id="allergies"
              rows={2}
              placeholder="e.g. Penicillin, Sulfa drugs, Aspirin..."
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('allergies')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronicConditions" className="text-xs font-bold text-navy">
              Chronic Conditions
            </Label>
            <textarea
              id="chronicConditions"
              rows={2}
              placeholder="e.g. Diabetes Type 2, Hypertension, Asthma..."
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('chronicConditions')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications" className="text-xs font-bold text-navy">
              Current Medications
            </Label>
            <textarea
              id="currentMedications"
              rows={2}
              placeholder="List current medications and dosages..."
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('currentMedications')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs font-bold text-navy">
              Additional Notes
            </Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Any other important medical notes..."
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('notes')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="gap-2 bg-[#02025C] hover:bg-[#02025C]/90"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSubmitting ? 'Saving...' : 'Save Medical Profile'}
        </Button>
      </div>
    </form>
  );
}
