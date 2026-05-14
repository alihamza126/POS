import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  DollarSign,
  CreditCard,
  Building,
  FileText,
  AlertTriangle,
  History,
} from 'lucide-react';
import { paymentSchema, PaymentFormValues } from '../schemas/payment-schema';

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customerId: string;
  customerName: string;
  currentBalance?: number;
}

export default function AddPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  customerId,
  customerName,
  currentBalance = 0,
}: AddPaymentDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerId,
      amount: 0,
      paymentMethod: 'cash',
      bankName: '',
      referenceNo: '',
      note: '',
    },
  });

  const paymentMethod = watch('paymentMethod');

  React.useEffect(() => {
    if (open) {
      reset({
        customerId,
        amount: 0,
        paymentMethod: 'cash',
        bankName: '',
        referenceNo: '',
        note: '',
      });
    }
  }, [open, customerId, reset]);

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      // @ts-ignore
      await window.api.customers.recordPayment(
        { ...data, branchId: 'main-branch' },
        user?.id,
      );

      toast({
        title: 'Payment Recorded',
        description: `Payment of ${data.amount} for ${customerName} has been recorded.`,
        variant: 'success',
      });

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-8 bg-emerald-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <DollarSign size={24} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Record Payment
              </DialogTitle>
              <DialogDescription className="text-white/80 font-medium">
                Record a payment for {customerName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
          <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
            Current Balance:
          </span>
          <span className="text-xl font-black text-emerald-900">
            Rs. {currentBalance.toLocaleString()}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <DollarSign size={14} className="text-primary" />
                Payment Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="h-14 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-2xl font-black px-4 text-emerald-700"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                onFocus={(e) => e.target.select()}
              />
              {errors.amount && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="paymentMethod"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <CreditCard size={14} className="text-primary" />
                Payment Method
              </Label>
              <select
                id="paymentMethod"
                className="w-full h-12 rounded-xl bg-background/50 border border-navy/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base px-4 outline-none"
                {...register('paymentMethod')}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            {(paymentMethod === 'bank_transfer' ||
              paymentMethod === 'cheque') && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="bankName"
                    className="text-sm font-bold text-navy flex items-center gap-2"
                  >
                    <Building size={14} className="text-primary" />
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    className="h-12 rounded-xl bg-background/50 border-navy/20"
                    placeholder="e.g. HBL"
                    {...register('bankName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="referenceNo"
                    className="text-sm font-bold text-navy flex items-center gap-2"
                  >
                    <History size={14} className="text-primary" />
                    Ref / Cheque #
                  </Label>
                  <Input
                    id="referenceNo"
                    className="h-12 rounded-xl bg-background/50 border-navy/20"
                    placeholder="Ref #"
                    {...register('referenceNo')}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="note"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <FileText size={14} className="text-primary" />
                Note (Optional)
              </Label>
              <Input
                id="note"
                className="h-12 rounded-xl bg-background/50 border-navy/20"
                placeholder="e.g. For Invoice #BR01-..."
                {...register('note')}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-xl px-6 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl px-8 font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
