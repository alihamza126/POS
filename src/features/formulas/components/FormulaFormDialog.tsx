import React, { useEffect } from 'react';
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
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';
import { Plus, Trash2, FlaskConical } from 'lucide-react';

export interface RemedyFormValue {
  name: string;
  potency: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface FormulaFormValues {
  diseaseName: string;
  category: string;
  notes: string;
  remedies: RemedyFormValue[];
}

const EMPTY_REMEDY: RemedyFormValue = {
  name: '',
  potency: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: '',
};

interface FormulaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Pass an existing formula to edit; omit to create a new one */
  formula?: any;
}

export default function FormulaFormDialog({
  open,
  onOpenChange,
  onSuccess,
  formula,
}: FormulaFormDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isEdit = !!formula;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormulaFormValues>({
    defaultValues: {
      diseaseName: '',
      category: '',
      notes: '',
      remedies: [{ ...EMPTY_REMEDY }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'remedies' });

  useEffect(() => {
    if (open) {
      if (formula) {
        reset({
          diseaseName: formula.diseaseName || '',
          category: formula.category || '',
          notes: formula.notes || '',
          remedies:
            formula.remedies?.length > 0
              ? formula.remedies.map((r: any) => ({ ...EMPTY_REMEDY, ...r }))
              : [{ ...EMPTY_REMEDY }],
        });
      } else {
        reset({
          diseaseName: '',
          category: '',
          notes: '',
          remedies: [{ ...EMPTY_REMEDY }],
        });
      }
    }
  }, [open, formula, reset]);

  const onSubmit = async (data: FormulaFormValues) => {
    const cleanRemedies = data.remedies
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        potency: r.potency?.trim() || undefined,
        dosage: r.dosage?.trim() || undefined,
        frequency: r.frequency?.trim() || undefined,
        duration: r.duration?.trim() || undefined,
        notes: r.notes?.trim() || undefined,
      }));

    if (!data.diseaseName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Disease / complaint name is required.',
        variant: 'destructive',
      });
      return;
    }
    if (cleanRemedies.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Add at least one remedy to the formula.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEdit) {
        // @ts-ignore
        await window.api.medical.updateDiseaseFormula(
          formula.id,
          {
            diseaseName: data.diseaseName.trim(),
            category: data.category?.trim() || undefined,
            notes: data.notes?.trim() || undefined,
            remedies: cleanRemedies,
          },
          user?.id,
          APP_CONFIG.branch.defaultId,
        );
        toast({ title: 'Formula Updated', description: `"${data.diseaseName}" formula has been updated.` });
      } else {
        // @ts-ignore
        await window.api.medical.createDiseaseFormula(
          {
            diseaseName: data.diseaseName.trim(),
            category: data.category?.trim() || undefined,
            notes: data.notes?.trim() || undefined,
            remedies: cleanRemedies,
            branchId: APP_CONFIG.branch.defaultId,
          },
          user?.id,
        );
        toast({ title: 'Formula Added', description: `"${data.diseaseName}" formula has been saved.` });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: 'Could not save the formula. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical size={18} className="text-primary" />
            {isEdit ? 'Edit Disease Formula' : 'New Disease Formula'}
          </DialogTitle>
          <DialogDescription>
            Save a reusable Disease → Remedy formula. When writing a
            prescription, picking this disease will auto-fill these remedies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diseaseName">Disease / Complaint *</Label>
              <Input
                id="diseaseName"
                placeholder="e.g. Fever, Common Cold, Acidity"
                {...register('diseaseName', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                placeholder="e.g. Respiratory, Digestive"
                {...register('category')}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Remedies *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 h-8"
                onClick={() => append({ ...EMPTY_REMEDY })}
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
                        {...register(`remedies.${index}.name` as const)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Potency"
                        {...register(`remedies.${index}.potency` as const)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Dosage"
                        {...register(`remedies.${index}.dosage` as const)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="Frequency"
                        {...register(`remedies.${index}.frequency` as const)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        placeholder="Days"
                        {...register(`remedies.${index}.duration` as const)}
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
                  <Input
                    placeholder="Notes for this remedy (optional)"
                    className="text-xs"
                    {...register(`remedies.${index}.notes` as const)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Potency examples: 30C, 200C, 1M, 10M. Dosage examples: 5 drops,
              4 pills. Frequency examples: 3x/day, twice daily.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">General Instructions (optional)</Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="e.g. Take on empty stomach, avoid coffee/mint while on treatment..."
              className="w-full rounded-xl border border-navy/20 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Formula'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
