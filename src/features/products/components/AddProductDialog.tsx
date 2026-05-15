import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import SearchableSelect from '../../../components/ui/searchable-select';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Package,
  Tag,
  DollarSign,
  List,
  Barcode,
  Scale,
  AlertTriangle,
  Info,
} from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  unit: z.string().min(1, 'Unit is required').default('pcs'),
  purchasePrice: z.coerce.number().min(0, 'Purchase price must be positive'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be positive'),
  reorderLevel: z.coerce
    .number()
    .min(0, 'Reorder level must be positive')
    .default(10),
  initialStock: z.coerce.number().min(0).optional().default(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  product?: any; // If provided, it's an edit
}

export default function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
  product,
}: AddProductDialogProps) {
  const { user } = useAuthStore();
  const [categoryList, setCategoryList] = React.useState<any[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      unit: 'pcs',
      purchasePrice: 0,
      sellingPrice: 0,
      reorderLevel: 10,
      initialStock: 0,
    },
  });

  // Load categories
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        // @ts-ignore
        const cats = await window.api.categories.list('BR-01');
        setCategoryList(cats || []);
      } catch {
        // Categories are optional — fail silently
      }
    };
    if (open) loadCategories();
  }, [open]);

  // Map categories to SearchableSelect options
  const categoryOptions = React.useMemo(
    () =>
      categoryList.map((cat: any) => ({
        id: cat.id,
        label: cat.name,
        subtitle: cat.description || undefined,
      })),
    [categoryList],
  );

  const watchedCategoryId = watch('categoryId');

  React.useEffect(() => {
    if (product) {
      reset(product);
    } else {
      reset({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        unit: 'pcs',
        purchasePrice: 0,
        sellingPrice: 0,
        reorderLevel: 10,
        initialStock: 0,
      });
    }
  }, [product, reset]);

  const getButtonLabel = () => {
    if (isSubmitting) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </div>
      );
    }
    return product ? 'Update Product' : 'Save Product';
  };

  const { toast } = useToast();

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (product) {
        // @ts-ignore
        await window.api.products.update(
          product.id,
          { ...data, branchId: 'BR-01' },
          user?.id,
        );
        toast({
          title: 'Product Updated',
          description: `${data.name} has been successfully updated.`,
          variant: 'success',
        });
      } else {
        // @ts-ignore
        await window.api.products.create(
          { ...data, branchId: 'BR-01' },
          user?.id,
        );
        toast({
          title: 'Product Created',
          description: `${data.name} has been added to your inventory.`,
          variant: 'success',
        });
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Submission failed:', error);

      let errorMessage = 'Failed to save product. Please try again.';
      let errorTitle = 'System Error';

      if (error.message?.includes('UNIQUE constraint failed')) {
        errorTitle = 'Duplicate Record';
        if (error.message.includes('products.barcode')) {
          errorMessage = 'A product with this barcode already exists.';
        } else if (error.message.includes('products.sku')) {
          errorMessage = 'A product with this SKU already exists.';
        } else {
          errorMessage = 'A product with these details already exists.';
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[45%] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="p-8 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Package size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {product ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                {product
                  ? 'Update the details of your existing product.'
                  : 'Create a new product in your inventory.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-navy/10">
              <Info size={16} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-navy/70">
                Basic Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <Tag size={14} className="text-primary" />
                  Product Name
                </Label>
                <Input
                  id="name"
                  className="h-12 rounded-xl bg-background/50 border-navy/20 focus:border-primary transition-all text-base px-4"
                  placeholder="e.g. Wireless Mouse"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <List size={14} className="text-primary" />
                  Description
                </Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-xl bg-background/50 border border-navy/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base px-4 py-3 outline-none"
                  placeholder="Enter product description..."
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sku"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <List size={14} className="text-primary" />
                  SKU
                </Label>
                <Input
                  id="sku"
                  placeholder="PROD-001"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('sku')}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.sku.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="barcode"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <Barcode size={14} className="text-primary" />
                  Barcode
                </Label>
                <Input
                  id="barcode"
                  className="font-mono"
                  placeholder="1234567890"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('barcode')}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-sm font-bold text-navy flex items-center gap-2"
                >
                  <List size={14} className="text-primary" />
                  Category
                </Label>
                <SearchableSelect
                  options={categoryOptions}
                  value={watchedCategoryId || null}
                  onSelect={(opt) => setValue('categoryId', opt.id)}
                  onClear={() => setValue('categoryId', '')}
                  placeholder="Select a category (optional)"
                  searchPlaceholder="Search categories..."
                  icon={<List size={14} className="text-primary" />}
                  emptyMessage="No categories found"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-navy/10">
              <DollarSign size={16} className="text-emerald-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-navy/70">
                Pricing & Costs
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="purchasePrice"
                  className="text-sm font-bold text-navy"
                >
                  Purchase Price
                </Label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                    size={16}
                  />
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    placeholder="0.00"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register('purchasePrice', { valueAsNumber: true })}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                {errors.purchasePrice && (
                  <p className="text-xs text-destructive font-bold">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sellingPrice"
                  className="text-sm font-bold text-navy"
                >
                  Selling Price
                </Label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                    size={16}
                  />
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    className="pl-9 font-bold"
                    placeholder="0.00"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register('sellingPrice', { valueAsNumber: true })}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                {errors.sellingPrice && (
                  <p className="text-xs text-destructive font-bold">
                    {errors.sellingPrice.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-navy/10">
              <Scale size={16} className="text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-navy/70">
                Inventory Settings
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-bold text-navy">
                  Unit of Measure
                </Label>
                <select
                  id="unit"
                  className="w-full h-12 rounded-xl bg-background/50 border border-navy/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base px-4 outline-none"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('unit')}
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="box">Box</option>
                  <option value="ltr">Liters (ltr)</option>
                  <option value="pkt">Packet (pkt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory & Stock Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-navy/10">
              <Package size={16} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-navy/70">
                Inventory & Stock
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {!product && (
                <div className="space-y-2">
                  <Label
                    htmlFor="initialStock"
                    className="text-sm font-bold text-navy"
                  >
                    Initial Stock
                  </Label>
                  <Input
                    id="initialStock"
                    type="number"
                    placeholder="0"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register('initialStock', { valueAsNumber: true })}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label
                  htmlFor="reorderLevel"
                  className="text-sm font-bold text-navy"
                >
                  Reorder Level
                </Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  placeholder="5"
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register('reorderLevel', { valueAsNumber: true })}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-background/50 border-t border-navy/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {getButtonLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
