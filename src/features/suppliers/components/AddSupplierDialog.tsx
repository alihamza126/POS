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
import { APP_CONFIG } from '../../../shared/constants/config';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { supplierSchema, SupplierFormValues } from '../schemas/supplier-schema';

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplier?: any;
}

export default function AddSupplierDialog({
  open,
  onOpenChange,
  onSuccess,
  supplier,
}: AddSupplierDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier || {
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      ntn: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (supplier) {
      reset(supplier);
    } else {
      reset({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        ntn: '',
        notes: '',
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      const payload = {
        ...data,
        name: data.companyName, // Derive name from companyName to satisfy SQLite database NOT NULL constraint
        branchId: APP_CONFIG.branch.defaultId,
      };

      if (supplier) {
        // @ts-ignore
        await window.api.suppliers.update(
          supplier.id,
          payload,
          user?.id,
        );
        toast({
          title: 'Supplier Updated',
          description: `${data.companyName} details have been successfully updated.`,
        });
      } else {
        // @ts-ignore
        await window.api.suppliers.create(
          payload,
          user?.id,
        );
        toast({
          title: 'Supplier Created',
          description: `${data.companyName} has been added successfully.`,
        });
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to save supplier. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-8 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Building size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Building size={24} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {supplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                {supplier
                  ? 'Update the details of your existing supplier.'
                  : 'Enter the details for your new supplier.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <Building size={14} className="text-primary" />
                Company / Supplier Name
              </Label>
              <Input
                id="companyName"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                placeholder="e.g. Kcar Spareparts"
                {...register('companyName')}
              />
              {errors.companyName && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="contactPerson"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <User size={14} className="text-primary" />
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                  placeholder="e.g. Mr. Hamza"
                  {...register('contactPerson')}
                />
                {errors.contactPerson && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.contactPerson.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <Phone size={14} className="text-primary" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                  placeholder="e.g. 03001234567"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <Mail size={14} className="text-primary" />
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                  placeholder="sales@kcar.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="ntn"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <Receipt size={14} className="text-primary" />
                  NTN / Tax No (Optional)
                </Label>
                <Input
                  id="ntn"
                  className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                  placeholder="e.g. 1234567-8"
                  {...register('ntn')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <MapPin size={14} className="text-primary" />
                Address
              </Label>
              <Input
                id="address"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                placeholder="e.g. Workshop Area, Lahore"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <FileText size={14} className="text-primary" />
                Internal Notes
              </Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] rounded-xl bg-background/50 border border-navy/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base px-4 py-3 outline-none"
                placeholder="Any special instructions, terms, or bank accounts..."
                {...register('notes')}
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
              {isSubmitting
                ? 'Saving...'
                : supplier
                  ? 'Update Supplier'
                  : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
