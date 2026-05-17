import React from 'react';
import { useForm } from 'react-hook-form';
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
import { CreditCard, DollarSign, Calendar, ClipboardList } from 'lucide-react';

interface AddSupplierPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplierId: string;
  supplierName: string;
  currentBalance?: number;
}

export default function AddSupplierPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
  supplierName,
  currentBalance = 0,
}: AddSupplierPaymentDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      amount: 0,
      paymentMethod: 'cash',
      referenceNo: '',
      paymentDate: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  const onSubmit = async (data: any) => {
    if (data.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Payment amount must be greater than zero',
        variant: 'destructive',
      });
      return;
    }

    try {
      const paymentData = {
        supplierId,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        referenceNo: data.referenceNo || null,
        paymentDate: data.paymentDate,
        note: data.note || null,
        branchId: user?.branchId || APP_CONFIG.branch.defaultId,
      };

      // @ts-ignore
      await window.api.suppliers.recordPayment(paymentData, user?.id);

      toast({
        title: 'Payment Recorded',
        description: `Successfully paid Rs. ${paymentData.amount.toLocaleString()} to ${supplierName}.`,
        variant: 'success',
      });

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-8 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <DollarSign size={24} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Record Supplier Payment
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                Record cash or bank payments made to {supplierName}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {currentBalance > 0 && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex justify-between items-center">
              <span className="text-sm font-bold text-navy/70">Current Balance Owed:</span>
              <span className="text-lg font-black text-navy">Rs. {currentBalance.toLocaleString()}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-bold text-navy flex items-center gap-2">
                <DollarSign size={14} className="text-primary" />
                Payment Amount (Rs)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4 font-black"
                placeholder="0.00"
                {...register('amount', { required: true, valueAsNumber: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm font-bold text-navy flex items-center gap-2">
                  <CreditCard size={14} className="text-primary" />
                  Payment Method
                </Label>
                <select
                  id="paymentMethod"
                  className="w-full h-12 rounded-xl bg-background/50 border border-navy/20 focus:border-primary px-4 outline-none font-bold text-navy"
                  {...register('paymentMethod')}
                >
                  <option value="cash">Cash Payment</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card Payment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="text-sm font-bold text-navy flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  Payment Date
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                  {...register('paymentDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNo" className="text-sm font-bold text-navy flex items-center gap-2">
                <ClipboardList size={14} className="text-primary" />
                Ref No. / Bank Txn ID (Optional)
              </Label>
              <Input
                id="referenceNo"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                placeholder="e.g. Bank Ref, Cheque #, etc"
                {...register('referenceNo')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-bold text-navy flex items-center gap-2">
                <ClipboardList size={14} className="text-primary" />
                Note / Remarks (Optional)
              </Label>
              <Input
                id="note"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                placeholder="e.g. Paid in full, advance payment"
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
              className="h-12 rounded-xl px-8 font-black bg-primary text-navy hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
