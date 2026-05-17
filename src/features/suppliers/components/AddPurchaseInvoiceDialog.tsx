import React, { useState, useEffect } from 'react';
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
import {
  Building,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  ClipboardList,
  Search,
} from 'lucide-react';

interface AddPurchaseInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  supplierId?: string; // Pre-filled if opened from supplier details
  suppliersList?: any[];
}

export default function AddPurchaseInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
  supplierId,
  suppliersList = [],
}: AddPurchaseInvoiceDialogProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [productSearchQueries, setProductSearchQueries] = useState<{ [key: number]: string }>({});
  const [showSuggestions, setShowSuggestions] = useState<{ [key: number]: boolean }>({});

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      supplierId: supplierId || '',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      memo: '',
      paymentType: 'credit',
      discountAmount: 0,
      taxAmount: 0,
      paidAmount: 0,
      items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedDiscount = watch('discountAmount') || 0;
  const watchedTax = watch('taxAmount') || 0;
  const watchedPaidAmount = watch('paidAmount') || 0;
  const watchedSupplierId = watch('supplierId');

  // Load products list for dropdown auto-suggests
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // @ts-ignore
        const result = await window.api.products.list({ limit: 100 });
        setDbProducts(result.items || []);
      } catch (err) {
        console.error('Failed to load products for suggestion:', err);
      }
    };
    if (open) {
      loadProducts();
    }
  }, [open]);

  // Recalculate total price for individual items when quantity or unit price changes
  const calculateItemTotal = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const total = (item.quantity || 0) * (item.unitPrice || 0);
      setValue(`items.${index}.totalPrice`, total);
    }
  };

  const itemsTotalSum = watchedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const payableAmount = itemsTotalSum - Number(watchedDiscount) + Number(watchedTax);

  const onSubmit = async (data: any) => {
    if (!data.supplierId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a supplier',
        variant: 'destructive',
      });
      return;
    }
    if (data.items.length === 0 || data.items.some((item: any) => !item.productName)) {
      toast({
        title: 'Validation Error',
        description: 'Please ensure all items have a product name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const invoiceData = {
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber || `PUR-${Date.now().toString().substring(6)}`,
        purchaseDate: data.purchaseDate,
        memo: data.memo,
        paymentType: data.paymentType,
        discountAmount: Number(data.discountAmount) || 0,
        taxAmount: Number(data.taxAmount) || 0,
        paidAmount: Number(data.paidAmount) || 0,
      };

      const finalItems = data.items.map((item: any) => ({
        productId: item.productId || null,
        productName: item.productName,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
        discount: 0,
      }));

      // @ts-ignore
      await window.api.suppliers.createPurchaseInvoice(
        invoiceData,
        finalItems,
        user?.id,
        user?.branchId || APP_CONFIG.branch.defaultId,
        APP_CONFIG.branch.defaultDeviceId,
      );

      toast({
        title: 'Purchase Invoice Recorded',
        description: `Successfully added purchase invoice #${invoiceData.invoiceNumber}.`,
        variant: 'success',
      });

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      console.error('Failed to create purchase invoice:', err);
      toast({
        title: 'Error',
        description: 'Failed to record purchase invoice. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProductSelect = (index: number, product: any) => {
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.productName`, product.name);
    setValue(`items.${index}.unitPrice`, product.purchasePrice || product.price || 0);
    // Recalculate item total
    const quantity = watchedItems[index]?.quantity || 1;
    const price = product.purchasePrice || product.price || 0;
    setValue(`items.${index}.totalPrice`, quantity * price);

    // Hide suggestions
    setShowSuggestions((prev) => ({ ...prev, [index]: false }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] rounded-2xl p-0 overflow-y-auto border-none shadow-xl">
        <DialogHeader className="p-8 bg-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <ClipboardList size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <ClipboardList size={24} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Record Purchase Invoice
              </DialogTitle>
              <DialogDescription className="text-white/60 font-medium">
                Record purchase transactions and spare parts inventory addition from a supplier.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Top Form Section */}
          <div className="grid grid-cols-3 gap-4 bg-background/30 p-4 rounded-xl border border-navy/5">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-navy">Supplier / Company</Label>
              {supplierId ? (
                <div className="h-12 bg-background border border-navy/10 rounded-xl flex items-center px-4 font-bold text-navy">
                  {suppliersList.find((s) => s.id === supplierId)?.companyName || 'Selected Supplier'}
                </div>
              ) : (
                <select
                  className="w-full h-12 rounded-xl bg-background border border-navy/20 focus:border-primary px-4 outline-none font-bold text-navy"
                  {...register('supplierId')}
                >
                  <option value="">Select Supplier</option>
                  {suppliersList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} ({s.name})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-navy">Invoice Number</Label>
              <Input
                className="h-12 rounded-xl bg-background border-navy/20 focus:border-primary text-base font-bold px-4"
                placeholder="e.g. 112, 218, K-829"
                {...register('invoiceNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-navy">Purchase Date</Label>
              <Input
                type="date"
                className="h-12 rounded-xl bg-background border-navy/20 focus:border-primary text-base px-4"
                {...register('purchaseDate')}
              />
            </div>
          </div>

          {/* Dynamic Items List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-navy/10 pb-2">
              <h3 className="font-black text-navy text-lg flex items-center gap-2">
                <ClipboardList size={18} className="text-primary" />
                Purchase Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ productId: '', productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 })
                }
                className="h-10 rounded-xl px-4 border-dashed border-primary hover:bg-primary/5 hover:text-navy text-primary flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </Button>
            </div>

            <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
              {fields.map((field, index) => {
                const query = productSearchQueries[index] || '';
                const filteredProducts = dbProducts.filter((p) =>
                  p.name.toLowerCase().includes(query.toLowerCase())
                );

                return (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-background/50 p-3 rounded-xl border border-navy/5 relative">
                    {/* Product Selection / Input */}
                    <div className="col-span-5 space-y-1 relative">
                      <Label className="text-xs font-bold text-navy/70">Product Name</Label>
                      <div className="relative">
                        <Input
                          className="h-10 rounded-lg bg-background border-navy/10 focus:border-primary text-sm px-3"
                          placeholder="Type product name or select..."
                          value={watchedItems[index]?.productName || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValue(`items.${index}.productName`, val);
                            // Clear productId when typing custom product
                            setValue(`items.${index}.productId`, '');
                            setProductSearchQueries({ ...productSearchQueries, [index]: val });
                            setShowSuggestions({ ...showSuggestions, [index]: true });
                          }}
                          onFocus={() => setShowSuggestions({ ...showSuggestions, [index]: true })}
                        />
                        {showSuggestions[index] && filteredProducts.length > 0 && (
                          <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-navy/10 rounded-xl shadow-lg z-50 p-1">
                            {filteredProducts.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-primary/10 text-navy font-bold flex justify-between"
                                onClick={() => handleProductSelect(index, p)}
                              >
                                <span>{p.name}</span>
                                <span className="text-navy/50">Stock: {p.stock || 0}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {showSuggestions[index] && (
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowSuggestions((prev) => ({ ...prev, [index]: false }))}
                          />
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs font-bold text-navy/70">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        className="h-10 rounded-lg bg-background border-navy/10 focus:border-primary text-sm px-3"
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                          onChange: () => calculateItemTotal(index),
                        })}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs font-bold text-navy/70">Unit Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-10 rounded-lg bg-background border-navy/10 focus:border-primary text-sm px-3"
                        {...register(`items.${index}.unitPrice` as const, {
                          valueAsNumber: true,
                          onChange: () => calculateItemTotal(index),
                        })}
                      />
                    </div>

                    {/* Total Price */}
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs font-bold text-navy/70">Total</Label>
                      <div className="h-10 bg-navy/5 border border-navy/5 rounded-lg flex items-center px-3 text-sm font-bold text-navy">
                        {(watchedItems[index]?.totalPrice || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="col-span-1 flex justify-center pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary Row */}
          <div className="grid grid-cols-4 gap-4 bg-navy/5 p-4 rounded-xl border border-navy/5">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-navy/70">Payment Mode</Label>
              <select
                className="w-full h-10 rounded-lg bg-background border border-navy/20 focus:border-primary px-3 text-sm font-bold text-navy outline-none"
                {...register('paymentType')}
              >
                <option value="credit">Credit (On Account)</option>
                <option value="cash">Cash Payment</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card Payment</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-navy/70">Discount / Tax (Rs)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Disc"
                  className="h-10 rounded-lg bg-background border-navy/10 focus:border-primary text-sm px-2"
                  {...register('discountAmount', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  placeholder="Tax"
                  className="h-10 rounded-lg bg-background border-navy/10 focus:border-primary text-sm px-2"
                  {...register('taxAmount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-navy/70">Paid Amount (Rs)</Label>
              <Input
                type="number"
                className="h-10 rounded-lg bg-background border-navy/10 focus:border-primary text-sm px-3 font-bold"
                {...register('paidAmount', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end items-end text-right">
              <span className="text-xs font-bold text-navy/60">Payable Total</span>
              <span className="text-2xl font-black text-navy">
                Rs. {payableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-navy">Remarks / Memo</Label>
            <Input
              className="h-12 rounded-xl bg-background border-navy/20 focus:border-primary text-base px-4"
              placeholder="e.g. Spare parts shipment from Karachi, invoice pending verification"
              {...register('memo')}
            />
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
              {isSubmitting ? 'Recording...' : 'Record Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
