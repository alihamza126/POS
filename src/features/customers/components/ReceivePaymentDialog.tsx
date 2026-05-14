import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAuthStore } from '../../../stores/auth-store';
import { Loader2, Banknote, AlertTriangle } from 'lucide-react';

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'cheque']),
  referenceNo: z.string().optional(),
  note: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface ReceivePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSuccess: () => void;
}

export default function ReceivePaymentDialog({
  open,
  onOpenChange,
  customerId,
  onSuccess,
}: ReceivePaymentDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'cash',
      referenceNo: '',
      note: '',
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      setLoading(true);
      setError(null);

      // @ts-ignore
      await window.api.customers.recordPayment({
        data: {
          customerId,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          referenceNo: values.referenceNo,
          note: values.note,
          branchId: 'main-branch',
          deviceId: 'local',
        },
        userId: user?.id || 'system',
      });

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
      <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8">
        <DialogHeader>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
            <Banknote size={24} className="text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-navy">
            Receive Payment
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
              className="h-14 rounded-2xl bg-navy/5 border-transparent focus:bg-white text-xl font-black"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('amount')}
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
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
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

          <div className="space-y-2">
            <Label className="font-bold text-navy">Reference No. (Optional)</Label>
            <Input
              placeholder="e.g. TRX-12345"
              className="h-14 rounded-2xl bg-navy/5 border-transparent focus:bg-white"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('referenceNo')}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-navy">Notes (Optional)</Label>
            <textarea
              placeholder="Any additional details..."
              className="w-full min-h-[80px] p-4 text-sm resize-none rounded-2xl bg-navy/5 border border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('note')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black"
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
