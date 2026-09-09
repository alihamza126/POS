import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import SearchableSelect, {
  SearchableSelectOption,
} from '../../../components/ui/searchable-select';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';
import { Plus, Trash2, FlaskConical, Stethoscope } from 'lucide-react';

interface MedicineFormValue {
  name: string;
  potency: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface PrescriptionFormValues {
  diagnosis: string;
  prescriptionDate: string;
  doctorName: string;
  doctorLicense: string;
  clinicName: string;
  notes: string;
  medicines: MedicineFormValue[];
}

const EMPTY_MEDICINE: MedicineFormValue = {
  name: '',
  potency: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
};

interface NewPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customerId: string;
}

export default function NewPrescriptionDialog({
  open,
  onOpenChange,
  onSuccess,
  customerId,
}: NewPrescriptionDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [formulaOptions, setFormulaOptions] = useState<SearchableSelectOption[]>([]);
  const [formulasById, setFormulasById] = useState<Record<string, any>>({});
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<PrescriptionFormValues>({
    defaultValues: {
      diagnosis: '',
      prescriptionDate: new Date().toISOString().split('T')[0],
      doctorName: '',
      doctorLicense: '',
      clinicName: '',
      notes: '',
      medicines: [{ ...EMPTY_MEDICINE }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'medicines',
  });

  // Load clinic defaults + the disease formula library when the dialog opens
  useEffect(() => {
    if (!open) return undefined;

    const load = async () => {
      try {
        // @ts-ignore
        const clinic = await window.api.medical.getClinicSettings();
        // @ts-ignore
        const formulas = await window.api.medical.listDiseaseFormulas(
          APP_CONFIG.branch.defaultId,
        );
        const byId: Record<string, any> = {};
        const options: SearchableSelectOption[] = (formulas || []).map((f: any) => {
          byId[f.id] = f;
          return {
            id: f.id,
            label: f.diseaseName,
            subtitle: f.category || `${f.remedies.length} remedies`,
          };
        });
        setFormulasById(byId);
        setFormulaOptions(options);

        reset({
          diagnosis: '',
          prescriptionDate: new Date().toISOString().split('T')[0],
          doctorName: clinic?.doctorName || '',
          doctorLicense: clinic?.licenseNumber || '',
          clinicName: clinic?.clinicName || '',
          notes: '',
          medicines: [{ ...EMPTY_MEDICINE }],
        });
        setSelectedFormulaId(null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load prescription defaults:', err);
      }
    };
    load();
    return undefined;
  }, [open, reset]);

  const handleFormulaSelect = (option: SearchableSelectOption) => {
    setSelectedFormulaId(option.id);
    const formula = formulasById[option.id];
    if (!formula) return;

    // Auto-fill remedies from the formula, replacing the current (usually
    // still-empty) medicines list — this is the whole point of the library.
    replace(
      formula.remedies.map((r: any) => ({
        name: r.name || '',
        potency: r.potency || '',
        dosage: r.dosage || '',
        frequency: r.frequency || '',
        duration: r.duration || '',
        notes: r.notes || '',
      })),
    );
  };

  const onSubmit = async (data: PrescriptionFormValues) => {
    const cleanMedicines = data.medicines
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        potency: m.potency?.trim() || undefined,
        dosage: m.dosage?.trim() || undefined,
        frequency: m.frequency?.trim() || undefined,
        duration: m.duration?.trim() || undefined,
        notes: m.notes?.trim() || undefined,
      }));

    if (!data.doctorName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Doctor name is required.',
        variant: 'destructive',
      });
      return;
    }
    if (cleanMedicines.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Add at least one medicine/remedy to the prescription.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // @ts-ignore
      await window.api.medical.createPrescription({
        customerId,
        doctorName: data.doctorName.trim(),
        doctorLicense: data.doctorLicense?.trim() || undefined,
        clinicName: data.clinicName?.trim() || undefined,
        prescriptionDate: data.prescriptionDate,
        diagnosis: data.diagnosis?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        medicines: JSON.stringify(cleanMedicines),
        branchId: APP_CONFIG.branch.defaultId,
        userId: user?.id,
      });
      toast({
        title: 'Prescription Saved',
        description: 'The prescription has been recorded for this patient.',
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: 'Could not save the prescription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope size={18} className="text-primary" />
            New Prescription
          </DialogTitle>
          <DialogDescription>
            Pick a disease to auto-fill its formula, or add remedies manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Disease / Complaint (optional — auto-fills remedies)</Label>
            <SearchableSelect
              options={formulaOptions}
              value={selectedFormulaId}
              onSelect={handleFormulaSelect}
              onClear={() => setSelectedFormulaId(null)}
              placeholder="Search disease formulas..."
              searchPlaceholder="Search disease..."
              icon={<FlaskConical size={14} className="text-primary" />}
              emptyMessage="No formulas found — add one under Formulas first"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input id="diagnosis" placeholder="e.g. Viral Fever" {...register('diagnosis')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescriptionDate">Date *</Label>
              <Input
                id="prescriptionDate"
                type="date"
                {...register('prescriptionDate', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name *</Label>
              <Input id="doctorName" {...register('doctorName', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorLicense">License No.</Label>
              <Input id="doctorLicense" {...register('doctorLicense')} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medicines / Remedies *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 h-8"
                onClick={() => append({ ...EMPTY_MEDICINE })}
              >
                <Plus size={14} />
                Add Remedy
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <Input
                        placeholder="Remedy name *"
                        {...register(`medicines.${index}.name` as const)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Potency"
                        {...register(`medicines.${index}.potency` as const)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Dosage"
                        {...register(`medicines.${index}.dosage` as const)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Frequency"
                        {...register(`medicines.${index}.frequency` as const)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        placeholder="Days"
                        {...register(`medicines.${index}.duration` as const)}
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Patient</Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Any additional instructions for the patient..."
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Prescription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
