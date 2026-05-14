import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  ShoppingBag,
} from 'lucide-react';
import SearchableSelect, {
  SearchableSelectOption,
} from '../../../components/ui/searchable-select';
import { usePOSStore, PaymentMethod } from '../../../stores/pos-store';
import PaymentDialog from './PaymentDialog';

interface CartPanelProps {
  onSaleComplete: () => void;
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'cash', label: 'Cash', icon: <Banknote size={14} /> },
  { value: 'card', label: 'Card', icon: <CreditCard size={14} /> },
  { value: 'transfer', label: 'Transfer', icon: <Building2 size={14} /> },
  { value: 'credit', label: 'Credit', icon: <Wallet size={14} /> },
];

export default function CartPanel({ onSaleComplete }: CartPanelProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    paymentMethod,
    setPaymentMethod,
    customerId,
    setCustomer,
    invoiceDiscount,
    setInvoiceDiscount,
    getSubtotal,
    getTotalDiscount,
    getTaxAmount,
    getGrandTotal,
    clearCart,
  } = usePOSStore();

  const [showPayment, setShowPayment] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<
    SearchableSelectOption[]
  >([]);

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const taxAmount = getTaxAmount();
  const grandTotal = getGrandTotal();

  // Pre-load all customers and map to SearchableSelectOption format
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        // @ts-ignore
        const result = await window.api.customers.list({
          branchId: 'main-branch',
          limit: 500,
        });
        const fetchedItems = result.items || [];
        setCustomerOptions(
          fetchedItems.map((c: any) => ({
            id: c.id,
            label: c.name,
            subtitle: c.phone || '',
          })),
        );
      } catch {
        setCustomerOptions([]);
      }
    };
    loadCustomers();
  }, []);

  const handleSelectCustomer = (option: SearchableSelectOption) => {
    setCustomer(option.id, option.label);
  };

  const handleClearCustomer = () => {
    setCustomer(null, null);
    if (paymentMethod === 'credit') {
      setPaymentMethod('cash');
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-navy/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#02025C] flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#24D4FE]" />
              Current Sale
            </h2>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mb-3">
                <ShoppingBag size={28} className="text-navy/15" />
              </div>
              <p className="text-sm font-bold text-navy/30">Cart is empty</p>
              <p className="text-xs font-medium text-navy/20 mt-1">
                Click products to add them
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const lineTotal =
                  item.unitPrice * item.quantity - item.discount;
                return (
                  <div
                    key={item.productId}
                    className="bg-[#F1EFF9]/50 rounded-xl p-3 border border-navy/5 group hover:border-navy/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-[#02025C] leading-tight truncate">
                          {item.productName}
                        </h4>
                        <p className="text-xs font-medium text-navy/40 mt-0.5">
                          Rs. {item.unitPrice.toLocaleString()} ×{' '}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#02025C]">
                          Rs. {lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-7 h-7 bg-white rounded-lg border border-navy/10 flex items-center justify-center hover:bg-navy/5 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-black text-[#02025C]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              Math.min(item.quantity + 1, item.availableStock),
                            )
                          }
                          disabled={item.quantity >= item.availableStock}
                          className="w-7 h-7 bg-white rounded-lg border border-navy/10 flex items-center justify-center hover:bg-navy/5 transition-colors disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Section (always visible) */}
        <div className="border-t border-navy/10 bg-white px-5 py-4 space-y-3 shrink-0">
          {/* Customer Picker */}
          <SearchableSelect
            options={customerOptions}
            value={customerId}
            onSelect={handleSelectCustomer}
            onClear={handleClearCustomer}
            placeholder="Select Customer (optional)"
            searchPlaceholder="Search by name or phone..."
            icon={<User size={14} />}
            dropUp
            emptyMessage="No customers found"
          />

          {/* Invoice Discount */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy/40 shrink-0">
              Discount:
            </span>
            <input
              type="number"
              min={0}
              value={invoiceDiscount || ''}
              onChange={(e) =>
                setInvoiceDiscount(parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="flex-1 bg-[#F1EFF9] border border-navy/5 rounded-lg px-3 py-1.5 text-sm font-bold text-[#02025C] focus:outline-none focus:ring-1 focus:ring-[#24D4FE] text-right"
            />
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-4 gap-1.5">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-bold transition-all
                  ${
                    paymentMethod === method.value
                      ? 'bg-[#02025C] text-white shadow-lg'
                      : 'bg-[#F1EFF9] text-navy/50 hover:bg-navy/10'
                  }
                `}
              >
                {method.icon}
                {method.label}
              </button>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 pt-2 border-t border-navy/5">
            <div className="flex justify-between text-xs font-medium text-navy/40">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-xs font-medium text-red-400">
                <span>Discount</span>
                <span>-Rs. {totalDiscount.toLocaleString()}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-xs font-medium text-navy/40">
                <span>Tax</span>
                <span>Rs. {taxAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-navy/10">
              <span className="text-lg font-black text-[#02025C]">Total</span>
              <span className="text-lg font-black text-[#02025C]">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Complete Sale */}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => setShowPayment(true)}
            className="w-full bg-[#24D4FE] hover:bg-[#1bc0e8] text-[#02025C] font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#24D4FE]/30 text-base uppercase tracking-wider"
          >
            Complete Sale — Rs. {grandTotal.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Payment Dialog */}
      {showPayment && (
        <PaymentDialog
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onSaleComplete();
          }}
        />
      )}
    </>
  );
}
