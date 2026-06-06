import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { APP_CONFIG } from '../../../shared/constants/config';
import { useToast } from '../../../hooks/use-toast';
import {
  AlertTriangle,
  Loader2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Building2,
  Scroll,
  Hash,
  FileText,
} from 'lucide-react';

const quickPurchaseSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  purchaseDate: z.string().min(1, 'Please select a date'),
  invoiceNumber: z.string().optional(),
  paymentType: z.enum(['credit', 'cash', 'bank', 'cheque']),
  memo: z.string().optional(),
});

type QuickPurchaseFormValues = z.infer<typeof quickPurchaseSchema>;

interface QuickPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
  supplierName?: string;
  onSuccess: () => void;
}

export default function QuickPurchaseDialog({
  open,
  onOpenChange,
  supplierId,
  supplierName,
  onSuccess,
}: QuickPurchaseDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuickPurchaseFormValues>({
    resolver: zodResolver(quickPurchaseSchema),
    defaultValues: {
      amount: '' as unknown as number,
      purchaseDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      paymentType: 'credit' as const,
      memo: '',
    },
  });

  const paymentType = watch('paymentType');

  // Strip leading zeros when user types
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove leading zeros (e.g. 01500 → 1500), but allow "0" and "0.xx"
    if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
      value = value.replace(/^0+/, '') || '0';
    }
    setValue('amount', value as unknown as number, { shouldValidate: true });
  };

  const onSubmit = async (values: QuickPurchaseFormValues) => {
    try {
      // @ts-ignore
      await window.api.suppliers.createSimplePurchase(
        {
          supplierId,
          amount: values.amount,
          purchaseDate: values.purchaseDate,
          invoiceNumber: values.invoiceNumber || undefined,
          paymentType: values.paymentType,
          memo: values.memo || undefined,
          branchId: user?.branchId || APP_CONFIG.branch.defaultId,
          deviceId: APP_CONFIG.branch.defaultDeviceId,
        },
        user?.id || 'system',
      );

      toast({
        title: 'Purchase Recorded',
        description: `Rs. ${values.amount.toLocaleString()} purchase from ${supplierName || 'supplier'} added to ledger.`,
        variant: 'success',
      } as any);

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to record purchase. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-[32px] p-0 overflow-hidden border-none shadow-2xl shadow-navy/10">
        {/* Header */}
        <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 pointer-events-none">
            <ShoppingCart size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Add Purchase
              </DialogTitle>
              <DialogDescription className="text-white/70 font-medium mt-0.5">
                Record a purchase from{' '}
                <span className="font-black text-white">{supplierName || 'this supplier'}</span>
              </DialogDescription>
            </div>
          </div>

          {/* Debit Badge */}
          <div className="relative z-10 mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-white/80">
              This will increase the outstanding balance (Debit)
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          {/* Amount */}
          <div className="space-y-2">
            <Label className="font-black text-navy text-sm">
              Purchase Amount (Rs.) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 font-black text-sm">
                Rs.
              </span>
              <Input
                type="number"
                placeholder="0"
                step="0.01"
                min="0.01"
                className="h-14 pl-12 rounded-2xl bg-navy/5 border-transparent focus:bg-white focus:border-primary text-2xl font-black text-navy transition-all"
                {...register('amount')}
                onChange={handleAmountChange}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive font-bold flex items-center gap-1">
                <AlertTriangle size={12} />
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Date & Invoice Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-black text-navy text-sm">Purchase Date</Label>
              <Input
                type="date"
                className="h-12 rounded-2xl bg-navy/5 border-transparent focus:bg-white focus:border-primary transition-all font-bold"
                {...register('purchaseDate')}
              />
              {errors.purchaseDate && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.purchaseDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-black text-navy text-sm flex items-center gap-1.5">
                <Hash size={13} className="text-primary" />
                Invoice / Ref No.
              </Label>
              <Input
                placeholder="e.g. 112, K-829"
                className="h-12 rounded-2xl bg-navy/5 border-transparent focus:bg-white focus:border-primary transition-all font-bold"
                {...register('invoiceNumber')}
              />
            </div>
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label className="font-black text-navy text-sm">Payment Type</Label>
            <Controller
              name="paymentType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-12 rounded-2xl bg-navy/5 border-transparent focus:bg-white font-bold text-navy">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-navy/10">
                    <SelectItem value="credit" className="rounded-xl focus:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-500" />
                        <span>Credit (On Account)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cash" className="rounded-xl focus:bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-emerald-500" />
                        <span>Cash Payment</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank" className="rounded-xl focus:bg-primary/10">
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
            <p className="text-xs text-text-secondary font-medium px-1">
              {paymentType === 'credit'
                ? '📋 Credit: Amount added to outstanding balance — pay later'
                : paymentType === 'cash'
                ? '💵 Cash: Paid on the spot — no balance added'
                : paymentType === 'bank'
                ? '🏦 Bank Transfer: Paid via bank — no balance added'
                : '📄 Cheque: Paid by cheque — no balance added'}
            </p>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label className="font-black text-navy text-sm flex items-center gap-1.5">
              <FileText size={13} className="text-primary" />
              Memo / Description (Optional)
            </Label>
            <textarea
              placeholder="e.g. Spare parts, engine oil batch, monthly supply..."
              className="w-full min-h-[80px] p-4 text-sm resize-none rounded-2xl bg-navy/5 border border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
              {...register('memo')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="h-12 px-6 rounded-xl font-bold text-navy hover:bg-navy/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Record Purchase
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
