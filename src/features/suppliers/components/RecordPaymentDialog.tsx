import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PAKISTANI_BANKS } from '../../../shared/constants/banks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import SearchableSelect from '../../../components/ui/searchable-select';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';
import { Loader2, Banknote, AlertTriangle, CreditCard, Building2, Scroll } from 'lucide-react';
import { audioService } from '../../../shared/utils/audio';

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'cheque']),
  bankName: z.string().optional(),
  referenceNo: z.string().optional(),
  note: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'transfer' && !data.bankName) {
    return false;
  }
  return true;
}, {
  message: "Bank name is required for bank transfers",
  path: ["bankName"],
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  onSuccess: () => void;
}

export default function RecordPaymentDialog({
  open,
  onOpenChange,
  supplierId,
  onSuccess,
}: RecordPaymentDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'cash',
      bankName: '',
      referenceNo: '',
      note: '',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
      value = value.replace(/^0+/, '') || '0';
    }

    setValue('amount', value as any, { shouldValidate: true });
  };

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      setLoading(true);
      setError(null);

      if (!supplierId) {
        setError('No supplier selected.');
        return;
      }

      console.log('Submitting payment for supplier:', supplierId);

      // @ts-ignore
      await window.api.suppliers.recordPayment(
        {
          supplierId,
          amount: values.amount,
          paymentMethod:
            values.paymentMethod === 'transfer'
              ? 'bank_transfer'
              : values.paymentMethod,
          bankName: values.paymentMethod === 'transfer' ? values.bankName : undefined,
          referenceNo: values.referenceNo,
          note: values.note,
          branchId: APP_CONFIG.branch.defaultId,
          deviceId: APP_CONFIG.branch.defaultDeviceId,
        },
        user?.id || 'system',
      );

      // Play premium sound effect
      audioService.playSuccess();
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-[32px] p-8">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <Banknote size={24} className="text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black text-navy">
            Record Outgoing Payment
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-bold p-4 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-bold text-navy">Amount (Rs.)</Label>
            <Input
              type="number"
              placeholder="0.00"
              className="h-12 rounded-2xl pt-2 bg-navy/5 border-transparent focus:bg-white text-xl font-black focus:ring-primary focus:border-primary transition-all"
              {...register('amount')}
              onChange={handleAmountChange}
            />
            {errors.amount && (
              <p className="text-xs text-destructive font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-navy">Payment Method</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-14 rounded-2xl bg-navy/5 border-transparent focus:bg-white font-bold text-navy">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-navy/10">
                    <SelectItem value="cash" className="rounded-xl focus:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-emerald-500" />
                        <span>Cash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card" className="rounded-xl focus:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-500" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer" className="rounded-xl focus:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-amber-500" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cheque" className="rounded-xl focus:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Scroll size={16} className="text-slate-500" />
                        <span>Cheque</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-xs text-destructive font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {paymentMethod === 'transfer' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label className="font-bold text-navy">Select Bank / Wallet</Label>
              <Controller
                name="bankName"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={PAKISTANI_BANKS.map((bank) => ({ id: bank, label: bank }))}
                    value={field.value || ''}
                    onSelect={(option) => field.onChange(option.id)}
                    onClear={() => field.onChange('')}
                    placeholder="Search bank or wallet..."
                    searchPlaceholder="Type to search..."
                    className="h-auto"
                    clearable
                    icon={<Building2 size={16} className="text-primary" />}
                  />
                )}
              />
              {errors.bankName && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.bankName.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-bold text-navy">Reference No. (Optional)</Label>
            <Input
              placeholder="e.g. TRX-12345"
              className="h-14 rounded-2xl bg-navy/5 border-transparent focus:bg-white"
              {...register('referenceNo')}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-navy">Notes (Optional)</Label>
            <textarea
              placeholder="Any additional details..."
              className="w-full min-h-[80px] p-4 text-sm resize-none rounded-2xl bg-navy/5 border border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              {...register('note')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 rounded-xl font-bold text-navy hover:bg-navy/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-navy font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
