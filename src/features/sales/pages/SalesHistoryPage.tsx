import React, { useEffect, useState, useCallback } from 'react';
import { Search, FileText, XCircle, Eye, Ban } from 'lucide-react';
import { APP_CONFIG } from '../../../shared/constants/config';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';

export default function SalesHistoryPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const pageSize = 15;

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const result = await window.api.sales.list({
        branchId: APP_CONFIG.branch.defaultId,
        query: searchQuery || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });
      setInvoices(result.items || []);
      setTotal(result.total || 0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, paymentStatusFilter, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(fetchInvoices, 250);
    return () => clearTimeout(debounce);
  }, [fetchInvoices]);

  const viewInvoice = async (id: string) => {
    try {
      // @ts-ignore
      const invoice = await window.api.sales.get(id);
      setSelectedInvoice(invoice);
    } catch {
      // Handle silently
    }
  };

  const cancelInvoice = async (id: string) => {
    try {
      // @ts-ignore
      await window.api.sales.cancel(
        id,
        user?.id || 'system',
        APP_CONFIG.branch.defaultId,
        APP_CONFIG.branch.defaultDeviceId,
      );
      fetchInvoices();
      setSelectedInvoice(null);
      toast({ title: 'Sale Cancelled', description: 'The invoice has been cancelled and stock restored.' });
    } catch (error: any) {
      toast({
        title: 'Cancel Failed',
        description: error?.message || 'Could not cancel this sale.',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      returned: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span
        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[status] || ''}`}
      >
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      partial: 'bg-amber-50 text-amber-700 border-amber-200',
      unpaid: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span
        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[status] || ''}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#02025C] tracking-tight">
            Sales History
          </h1>
          <p className="text-sm font-medium text-navy/40 mt-1">
            {total} total invoices
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-navy/5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30"
          />
          <input
            type="text"
            placeholder="Search by invoice number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#F1EFF9] border border-navy/5 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-[#02025C] placeholder:text-navy/25 focus:outline-none focus:ring-2 focus:ring-[#24D4FE]"
          />
        </div>

        <select
          value={statusFilter}
          aria-label="Filter by status"
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F1EFF9] border border-navy/5 rounded-xl px-4 py-2.5 text-sm font-bold text-[#02025C] focus:outline-none focus:ring-2 focus:ring-[#24D4FE]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>

        <select
          value={paymentStatusFilter}
          aria-label="Filter by payment status"
          onChange={(e) => {
            setPaymentStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F1EFF9] border border-navy/5 rounded-xl px-4 py-2.5 text-sm font-bold text-[#02025C] focus:outline-none focus:ring-2 focus:ring-[#24D4FE]"
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-navy/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/5">
                <th className="text-left px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="text-left px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Pay Status
                </th>
                <th className="text-right px-5 py-4 text-xs font-black text-navy/30 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skel-${String(i)}`}
                      className="border-b border-navy/5"
                    >
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td
                          key={`cell-${String(j)}`}
                          className="px-5 py-4"
                          aria-label="Loading"
                        >
                          <div className="h-4 bg-navy/5 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-navy/5 hover:bg-[#F1EFF9]/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-black text-[#02025C]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-navy/50">
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-[#02025C]">
                        Rs. {inv.payableAmount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-navy/50 uppercase">
                        {inv.paymentType}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-5 py-4">
                        {getPaymentBadge(inv.paymentStatus)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => viewInvoice(inv.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/30 hover:bg-navy/5 hover:text-navy transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          {inv.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => cancelInvoice(inv.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Cancel Invoice"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && invoices.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={48} className="text-navy/15 mb-3" />
            <h3 className="text-lg font-black text-navy">No invoices found</h3>
            <p className="text-sm font-medium text-navy/40 mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Sales will appear here after your first transaction'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-navy/5">
            <span className="text-xs font-bold text-navy/40">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1EFF9] text-navy/50 hover:bg-navy/10 disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1EFF9] text-navy/50 hover:bg-navy/10 disabled:opacity-30 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[80vh] overflow-y-auto">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-navy/5">
              <div>
                <h2 className="text-xl font-black text-[#02025C]">
                  Invoice #{selectedInvoice.invoiceNumber}
                </h2>
                <p className="text-xs font-bold text-navy/30 mt-1">
                  {selectedInvoice.createdAt
                    ? new Date(selectedInvoice.createdAt).toLocaleString()
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-xl bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors"
              >
                <XCircle size={16} className="text-navy/40" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {selectedInvoice.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b border-navy/5"
                  >
                    <div>
                      <span className="text-sm font-bold text-[#02025C]">
                        {item.productName || 'Product'}
                      </span>
                      <span className="text-xs font-medium text-navy/40 ml-2">
                        × {item.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#02025C]">
                      Rs. {item.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-[#F1EFF9] rounded-2xl p-5 space-y-2">
                <div className="flex justify-between text-sm font-medium text-navy/40">
                  <span>Subtotal</span>
                  <span>
                    Rs. {selectedInvoice.totalAmount?.toLocaleString()}
                  </span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-red-400">
                    <span>Discount</span>
                    <span>
                      -Rs. {selectedInvoice.discountAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedInvoice.taxAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-navy/40">
                    <span>Tax</span>
                    <span>
                      Rs. {selectedInvoice.taxAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-navy/10 text-lg font-black text-[#02025C]">
                  <span>Total</span>
                  <span>
                    Rs. {selectedInvoice.payableAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedInvoice.status)}
                {getPaymentBadge(selectedInvoice.paymentStatus)}
                <span className="text-xs font-bold text-navy/30 uppercase">
                  {selectedInvoice.paymentType}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
