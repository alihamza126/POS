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
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { customerSchema, CustomerFormValues } from '../schemas/customer-schema';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customer?: any;
}

export default function AddCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
  customer,
}: AddCustomerDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      name: '',
      phone: '',
      email: '',
      address: '',
      companyName: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (customer) {
      reset(customer);
    } else {
      reset({
        name: '',
        phone: '',
        email: '',
        address: '',
        companyName: '',
        notes: '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (customer) {
        // @ts-ignore
        await window.api.customers.update(
          customer.id,
          { ...data, branchId: 'BR-01' },
          user?.id,
        );
        toast({
          title: 'Customer Updated',
          description: `${data.name} details have been successfully updated.`,
          variant: 'success',
        });
      } else {
        // @ts-ignore
        await window.api.customers.create(
          { ...data, branchId: 'BR-01' },
          user?.id,
        );
        toast({
          title: 'Customer Created',
          description: `${data.name} has been added successfully.`,
          variant: 'success',
        });
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to save customer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-8 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <User size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {customer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                {customer
                  ? 'Update the details of your existing customer.'
                  : 'Enter the details for your new customer.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <User size={14} className="text-primary" />
                Full Name
              </Label>
              <Input
                id="name"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                placeholder="e.g. John Doe"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="03001234567"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.phone.message}
                  </p>
                )}
              </div>

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
                  placeholder="john@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="text-sm font-bold text-navy flex items-center gap-2"
              >
                <Building size={14} className="text-primary" />
                Company Name (Optional)
              </Label>
              <Input
                id="companyName"
                className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                placeholder="e.g. ABC Corp"
                {...register('companyName')}
              />
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
                placeholder="e.g. 123 Main St, City"
                {...register('address')}
              />
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
                placeholder="Any special instructions or notes..."
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
                : customer
                  ? 'Update Customer'
                  : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
