import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Banknote,
  Download,
} from 'lucide-react';
import { usePOSStore } from '../../../stores/pos-store';
import { useAuthStore } from '../../../stores/auth-store';
import { generateInvoicePDF } from '../../../shared/utils/pdf-generator';
import { useSettingsStore } from '../../../stores/settings-store';
import { audioService } from '../../../shared/utils/audio';
import { APP_CONFIG } from '../../../shared/constants/config';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentDialog({
  open,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  const { user } = useAuthStore();
  const { company } = useSettingsStore();
  const {
    items,
    customerId,
    customerName,
    paymentMethod,
    taxRate,
    amountTendered,
    setAmountTendered,
    getGrandTotal,
    getChangeAmount,
    getSubtotal,
    getTotalDiscount,
    getItemDiscountTotal,
    getTaxAmount,
    bankName,
    clearCart,
  } = usePOSStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const grandTotal = getGrandTotal();
  const changeAmount = getChangeAmount();
  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const taxAmount = getTaxAmount();

  const isCreditSale = paymentMethod === 'credit';
  const canFinalize = isCreditSale
    ? !!customerId
    : amountTendered >= grandTotal;

  const handleFinalize = async () => {
    try {
      setLoading(true);
      setError(null);

      // @ts-ignore
      const result = await window.api.sales.create({
        items,
        customerId: customerId || undefined,
        invoiceDiscount: getTotalDiscount() - getItemDiscountTotal(),
        taxRate,
        paymentType: paymentMethod,
        bankName: paymentMethod === 'transfer' ? bankName : undefined,
        paidAmount: isCreditSale ? 0 : amountTendered,
        userId: user?.id || 'system',
        branchId: APP_CONFIG.branch.defaultId,
        deviceId: APP_CONFIG.branch.defaultDeviceId,
      });

      audioService.playSuccess();
      setSuccess(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    clearCart();
    onSuccess();
  };

  if (!open) return null;

  // Success State
  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-[32px] w-full max-w-md p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-[#02025C] mb-2">
            Sale Complete!
          </h2>
          <p className="text-sm font-bold text-navy/40 mb-6">
            Invoice #{success.invoice?.invoiceNumber}
          </p>

          <div className="bg-[#F1EFF9] rounded-2xl p-6 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-navy/50">Total Amount</span>
              <span className="font-black text-[#02025C]">
                Rs. {success.invoice?.payableAmount?.toLocaleString()}
              </span>
            </div>
            {!isCreditSale && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-navy/50">Paid</span>
                  <span className="font-black text-[#02025C]">
                    Rs. {success.invoice?.paidAmount?.toLocaleString()}
                  </span>
                </div>
                {success.invoice?.changeAmount > 0 && (
                  <div className="flex justify-between text-sm border-t border-navy/10 pt-2">
                    <span className="font-black text-emerald-600">Change</span>
                    <span className="font-black text-emerald-600 text-lg">
                      Rs. {success.invoice?.changeAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
            {isCreditSale && customerName && (
              <div className="flex justify-between text-sm">
                <span className="font-bold text-navy/50">Customer</span>
                <span className="font-black text-[#02025C]">
                  {customerName}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                generateInvoicePDF(
                  {
                    invoiceNumber: success.invoice.invoiceNumber,
                    date: new Date().toLocaleDateString(),
                    customerName: customerName || undefined,
                    items: success.items.map((item: any) => ({
                      productName: item.productName || 'Unknown Product',
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      discount: item.discount,
                      total: item.totalPrice || item.total,
                    })),
                    subtotal: success.invoice.totalAmount,
                    discount: success.invoice.discountAmount,
                    tax: success.invoice.taxAmount,
                    grandTotal: success.invoice.payableAmount,
                    paidAmount: success.invoice.paidAmount,
                    changeAmount: success.invoice.changeAmount,
                    paymentType: success.invoice.paymentType,
                  },
                  company
                );
              }}
              className="flex-1 bg-white text-[#02025C] border border-[#02025C]/10 font-bold py-4 rounded-2xl hover:bg-[#F1EFF9] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handleNewSale}
              className="flex-1 bg-[#24D4FE] text-[#02025C] font-black py-4 rounded-2xl hover:bg-[#1bc0e8] transition-all active:scale-[0.98] shadow-lg shadow-[#24D4FE]/30"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#02025C]">
            Finalize Payment
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-xl bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors"
          >
            <XCircle size={16} className="text-navy/40" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-8 space-y-2">
          <div className="bg-[#F1EFF9] rounded-2xl p-5 space-y-2">
            <div className="flex justify-between text-xs font-medium text-navy/40">
              <span>Subtotal ({items.length} items)</span>
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
              <span className="text-lg font-black text-[#02025C]">
                Grand Total
              </span>
              <span className="text-lg font-black text-[#02025C]">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="flex items-center gap-2 px-1 py-2">
            <span className="text-xs font-bold text-navy/40 uppercase tracking-wider">
              Payment:
            </span>
            <span className="text-xs font-black text-[#02025C] uppercase bg-navy/5 px-3 py-1 rounded-lg">
              {paymentMethod}
            </span>
            {paymentMethod === 'transfer' && bankName && (
              <>
                <span className="text-xs text-navy/20">•</span>
                <span className="text-xs font-bold text-primary">
                  {bankName}
                </span>
              </>
            )}
            {customerName && (
              <>
                <span className="text-xs text-navy/20">•</span>
                <span className="text-xs font-bold text-navy/50">
                  {customerName}
                </span>
              </>
            )}
          </div>

          {/* Cash Input */}
          {!isCreditSale && (
            <div className="space-y-3">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="text-xs font-black text-navy/40 uppercase tracking-wider block mb-2">
                  Amount Tendered
                  <div className="relative mt-2">
                    <Banknote
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30"
                    />
                    <input
                      type="number"
                      min={0}
                      value={amountTendered || ''}
                      onChange={(e) =>
                        setAmountTendered(parseFloat(e.target.value) || 0)
                      }
                      placeholder={grandTotal.toString()}
                      className="w-full bg-[#F1EFF9] border-2 border-navy/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-black text-[#02025C] focus:outline-none focus:ring-2 focus:ring-[#24D4FE] focus:border-[#24D4FE] text-right"
                    />
                  </div>
                </label>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  grandTotal,
                  Math.ceil(grandTotal / 100) * 100,
                  Math.ceil(grandTotal / 500) * 500,
                  Math.ceil(grandTotal / 1000) * 1000,
                ]
                  .filter(
                    (val, idx, arr) => arr.indexOf(val) === idx && val > 0,
                  )
                  .map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setAmountTendered(amount)}
                      className={`py-2 rounded-xl text-xs font-black transition-all
                        ${
                          amountTendered === amount
                            ? 'bg-[#02025C] text-white'
                            : 'bg-[#F1EFF9] text-navy/50 hover:bg-navy/10'
                        }
                      `}
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
              </div>

              {/* Change */}
              {amountTendered >= grandTotal && amountTendered > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">
                    Change Due
                  </span>
                  <span className="text-2xl font-black text-emerald-600">
                    Rs. {changeAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Credit sale info */}
          {isCreditSale && !customerId && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm font-bold text-amber-700">
              Credit sales require a customer. Please select one from the cart
              panel.
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="p-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-[#F1EFF9] text-navy/50 font-bold py-4 rounded-2xl hover:bg-navy/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFinalize}
            disabled={!canFinalize || loading}
            className="flex-1 bg-[#02025C] text-white font-black py-4 rounded-2xl hover:bg-[#030380] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              'Confirm Sale'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
