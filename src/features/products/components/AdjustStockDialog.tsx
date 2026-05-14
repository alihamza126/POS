import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scale, Package, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import SearchableSelect from '../../../components/ui/searchable-select';
import { useProducts } from '../hooks/use-products';

const schema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity must be greater than 0'),
  type: z.enum(['purchase', 'adjustment', 'damage']),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  isAddition: z.boolean(),
});

type AdjustStockFormData = z.infer<typeof schema>;

interface AdjustStockDialogProps {
  product?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AdjustStockDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: AdjustStockDialogProps) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { products } = useProducts({ limit: 1000 });

  React.useEffect(() => {
    if (open) {
      if (product) {
        setSelectedProductId(product.id);
      } else {
        setSelectedProductId(null);
      }
    }
  }, [product, open]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AdjustStockFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      type: 'adjustment',
      reason: '',
      isAddition: true,
    },
  });

  const isAddition = watch('isAddition');

  const onSubmit = async (data: AdjustStockFormData) => {
    if (!selectedProductId) {
      toast({
        title: 'Product Required',
        description: 'Please select a product to adjust.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const actualQuantity = data.isAddition ? data.quantity : -data.quantity;
      const targetProduct = product || products.find((p) => p.id === selectedProductId);

      // @ts-ignore
      await window.api.products.adjustStock({
        productId: selectedProductId,
        quantity: actualQuantity,
        type: data.type,
        reason: data.reason,
        userId: user?.id || 'system',
        branchId: 'main-branch',
      });

      toast({
        title: 'Stock Adjusted',
        description: `Successfully adjusted stock for ${targetProduct?.name || 'product'}.`,
        variant: 'success',
      });

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Adjustment Failed',
        description:
          error.message || 'Failed to adjust stock. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-8 bg-amber-500 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Scale size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Package size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Adjust Stock
              </DialogTitle>
              {product ? (
                <DialogDescription className="text-white/80 font-medium">
                  {product.name}
                </DialogDescription>
              ) : (
                <DialogDescription className="text-white/80 font-medium">
                  Select a product to continue
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {!product && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-navy">Select Product</Label>
              <SearchableSelect
                options={products.map((p) => ({
                  id: p.id,
                  label: p.name,
                  subtitle: `Stock: ${p.currentStock} | Price: Rs. ${p.price}`,
                }))}
                value={selectedProductId}
                onSelect={(opt) => setSelectedProductId(opt.id)}
                onClear={() => setSelectedProductId(null)}
                placeholder="Search products..."
                className="w-full"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 bg-[#F1EFF9] p-2 rounded-xl">
            <button
              type="button"
              onClick={() => setValue('isAddition', true)}
              className={`py-2 rounded-lg font-bold transition-all text-sm ${
                isAddition
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-navy/50 hover:bg-white/50'
              }`}
            >
              Add Stock (+)
            </button>
            <button
              type="button"
              onClick={() => setValue('isAddition', false)}
              className={`py-2 rounded-lg font-bold transition-all text-sm ${
                !isAddition
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-navy/50 hover:bg-white/50'
              }`}
            >
              Remove Stock (-)
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-bold text-navy">
                Quantity to Adjust
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                className="h-12 font-black text-lg bg-background/50 border-navy/20 focus:border-amber-500"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...register('quantity', { valueAsNumber: true })}
                onFocus={(e) => e.target.select()}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-bold text-navy">
                Movement Type
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full h-12 bg-background/50 border-navy/20 focus:border-amber-500 focus:ring-amber-500 font-medium">
                      <SelectValue placeholder="Select movement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adjustment">
                        Manual Adjustment
                      </SelectItem>
                      <SelectItem value="purchase">
                        New Purchase / Delivery
                      </SelectItem>
                      <SelectItem value="damage">Damaged / Expired</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-bold text-navy">
                Reason / Note
              </Label>
              <Input
                id="reason"
                className="h-12 bg-background/50 border-navy/20 focus:border-amber-500"
                placeholder="e.g. Received new shipment"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-xs text-destructive font-bold flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.reason.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-navy/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black"
            >
              {loading ? 'Saving...' : 'Confirm Adjustment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
