import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BookOpen,
  StickyNote,
  Activity,
  ShoppingCart,
  Banknote,
  Package,
} from 'lucide-react';
import SupplierLedgerTab from './SupplierLedgerTab';
import AddPurchaseInvoiceDialog from './AddPurchaseInvoiceDialog';
import RecordPaymentDialog from './RecordPaymentDialog';
import { Button } from '../../../components/ui/button';
import { exportToCSV } from '../../../shared/utils/csv-exporter';
import { generateSupplierStatementPDF } from '../../../shared/utils/pdf-generator';
import { useSettingsStore } from '../../../stores/settings-store';

interface SupplierDetailsTabsProps {
  supplierId: string;
  supplier?: any;
}

const DEFAULT_SUMMARY = {
  currentBalance: 0,
  totalPurchases: 0,
  totalPayments: 0,
  transactionCount: 0,
  lastTransaction: null,
};

export default function SupplierDetailsTabs({
  supplierId,
  supplier,
}: SupplierDetailsTabsProps) {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [ledger, setLedger] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { company } = useSettingsStore();

  const companyDetails = {
    name: company.name,
    address: company.address,
    phone: company.phone,
    email: (company as any).email || '',
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // @ts-ignore
      const [summaryResult, ledgerResult, invoicesResult, paymentsResult, purchasedProductsResult] = await Promise.all([
        // @ts-ignore
        window.api.suppliers.getSummary(supplierId),
        // @ts-ignore
        window.api.suppliers.getLedger(supplierId),
        // @ts-ignore
        window.api.suppliers.getPurchaseInvoices(supplierId),
        // @ts-ignore
        window.api.suppliers.getPayments(supplierId),
        // @ts-ignore
        window.api.suppliers.getPurchasedProducts(supplierId),
      ]);

      setSummary(summaryResult || DEFAULT_SUMMARY);
      setLedger(ledgerResult || []);
      setInvoices(invoicesResult || []);
      setPayments(paymentsResult || []);
      setPurchasedProducts(purchasedProductsResult || []);
    } catch (error) {
      console.error('Failed to fetch supplier tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to updates for rendering real-time
    const handleRefresh = () => fetchData();
    window.addEventListener('supplier-payment-recorded', handleRefresh);
    window.addEventListener('purchase-invoice-recorded', handleRefresh);
    return () => {
      window.removeEventListener('supplier-payment-recorded', handleRefresh);
      window.removeEventListener('purchase-invoice-recorded', handleRefresh);
    };
  }, [supplierId]);

  const handlePrintLedger = () => {
    generateSupplierStatementPDF({
      companyName: supplier?.companyName || 'Supplier',
      contactPerson: supplier?.contactPerson || 'N/A',
      phone: supplier?.phone || 'N/A',
      address: supplier?.address || 'N/A',
      ledger: ledger,
      summary: summary,
      companyDetails,
    });
  };

  const handleExportLedger = () => {
    const headers = ['Date', 'Type', 'Reference', 'Memo', 'Debit', 'Credit', 'Balance'];
    const data = ledger.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.type.toUpperCase(),
      entry.number || '',
      entry.memo || '',
      entry.debit || 0,
      entry.credit || 0,
      entry.balance || 0,
    ]);

    exportToCSV(
      `Statement_${supplier?.companyName || 'Supplier'}_${new Date().getTime()}.csv`,
      headers,
      data
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-bold text-navy/50 animate-pulse text-sm">
            Loading supplier ledger data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-8">
      <div className="bg-white p-2 rounded-2xl shadow-soft border border-navy/5 inline-block">
        <TabsList className="bg-transparent border-none gap-2">
          <TabsTrigger
            value="overview"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <LayoutDashboard size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <BookOpen size={16} />
            Ledger
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <FileText size={16} />
            Purchases List
          </TabsTrigger>
          <TabsTrigger
            value="purchased-products"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <Package size={16} />
            Purchased Products
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <CreditCard size={16} />
            Payment History
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="overview"
        className="space-y-8 animate-in fade-in slide-in-from-bottom-4"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Outstanding Due"
            value={`Rs. ${(summary.currentBalance ?? 0).toLocaleString()}`}
            label="What we owe them"
            variant="navy"
          />
          <SummaryCard
            title="Total Purchases"
            value={`Rs. ${(summary.totalPurchases ?? 0).toLocaleString()}`}
            label="Lifetime purchases"
            variant="blue"
          />
          <SummaryCard
            title="Total Paid"
            value={`Rs. ${(summary.totalPayments ?? 0).toLocaleString()}`}
            label="Lifetime paid"
            variant="emerald"
          />
          <SummaryCard
            title="Last Activity"
            value={
              summary.lastTransaction
                ? new Date(summary.lastTransaction).toLocaleDateString()
                : 'N/A'
            }
            label="Transaction date"
            variant="amber"
          />
        </div>

        {/* Quick Stats & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[24px] shadow-soft border border-navy/5">
            <h4 className="text-lg font-black text-navy mb-4">Supplier Information</h4>
            <div className="space-y-4">
              <StatRow label="Company Name" value={supplier?.companyName || 'N/A'} />
              <StatRow label="Contact Person" value={supplier?.contactPerson || 'N/A'} />
              <StatRow label="Tax / NTN Number" value={supplier?.ntn || 'N/A'} />
              <StatRow label="Address" value={supplier?.address || 'N/A'} />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[24px] shadow-soft border border-navy/5">
            <h4 className="text-lg font-black text-navy mb-4">Purchase Summary</h4>
            <div className="space-y-4">
              <StatRow label="Total Purchases Count" value={`${invoices.length} invoices`} />
              <StatRow label="Total Payments Count" value={`${payments.length} receipts`} />
              <StatRow label="Current Status" value={summary.currentBalance > 0 ? 'Balance Outstanding' : 'Settled'} />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="ledger"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        {/* Ledger Actions Bar */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={() => setIsPurchaseDialogOpen(true)}
            className="gap-2 h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <ShoppingCart size={16} />
            Add Purchase
          </Button>
          <Button
            onClick={() => setIsPaymentDialogOpen(true)}
            className="gap-2 h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Banknote size={16} />
            Record Payment
          </Button>
        </div>

        <SupplierLedgerTab
          ledger={ledger}
          onPrint={handlePrintLedger}
          onExport={handleExportLedger}
        />

        <AddPurchaseInvoiceDialog
          open={isPurchaseDialogOpen}
          onOpenChange={setIsPurchaseDialogOpen}
          supplierId={supplierId}
          suppliersList={supplier ? [supplier] : []}
          onSuccess={fetchData}
        />

        <RecordPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          supplierId={supplierId}
          onSuccess={() => {
            fetchData();
            window.dispatchEvent(new Event('supplier-payment-recorded'));
          }}
        />
      </TabsContent>

      <TabsContent
        value="invoices"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-6 rounded-[24px] shadow-soft border border-navy/5">
          <h3 className="text-xl font-black text-navy mb-4">Invoice List</h3>
          {invoices.length === 0 ? (
            <div className="bg-white p-12 text-center border-2 border-dashed border-navy/10 rounded-2xl">
              <FileText size={48} className="mx-auto text-navy/20 mb-4" />
              <h3 className="text-lg font-black text-navy">No Purchase Invoices</h3>
              <p className="text-text-secondary font-medium mt-1">
                Record a purchase invoice to start tracking purchases.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-navy/5 bg-navy/5">
                    <th className="p-3 font-bold text-navy text-xs uppercase">Date</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Invoice #</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Payment Status</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Total Amount</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Payable</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-navy/5 hover:bg-navy/[0.02]">
                      <td className="p-3 text-sm font-bold text-navy">
                        {new Date(inv.purchaseDate || inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm font-mono font-bold text-navy/50">{inv.invoiceNumber}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          inv.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.paymentStatus === 'partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right font-bold text-navy/60">Rs. {inv.totalAmount.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right font-black text-navy">Rs. {inv.payableAmount.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right font-bold text-emerald-600">Rs. {inv.paidAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent
        value="purchased-products"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-6 rounded-[24px] shadow-soft border border-navy/5">
          <h3 className="text-xl font-black text-navy mb-4">Purchased Products History</h3>
          {purchasedProducts.length === 0 ? (
            <div className="bg-white p-12 text-center border-2 border-dashed border-navy/10 rounded-2xl">
              <Package size={48} className="mx-auto text-navy/20 mb-4" />
              <h3 className="text-lg font-black text-navy">No Purchased Products</h3>
              <p className="text-text-secondary font-medium mt-1">
                Record a purchase invoice to start tracking product purchases.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-navy/5 bg-navy/5">
                    <th className="p-3 font-bold text-navy text-xs uppercase">Date</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Invoice #</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Product Name</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Quantity</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Unit Price</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasedProducts.map((item) => (
                    <tr key={item.id} className="border-b border-navy/5 hover:bg-navy/[0.02]">
                      <td className="p-3 text-sm font-bold text-navy">
                        {new Date(item.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm font-mono font-bold text-navy/50">{item.invoiceNumber}</td>
                      <td className="p-3 text-sm font-bold text-navy/80">{item.productName}</td>
                      <td className="p-3 text-sm text-right font-black text-navy">{item.quantity}</td>
                      <td className="p-3 text-sm text-right font-bold text-navy/60">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right font-bold text-emerald-600">Rs. {item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent
        value="payments"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-6 rounded-[24px] shadow-soft border border-navy/5">
          <h3 className="text-xl font-black text-navy mb-4">Payment Receipts</h3>
          {payments.length === 0 ? (
            <div className="bg-white p-12 text-center border-2 border-dashed border-navy/10 rounded-2xl">
              <CreditCard size={48} className="mx-auto text-navy/20 mb-4" />
              <h3 className="text-lg font-black text-navy">No Payments</h3>
              <p className="text-text-secondary font-medium mt-1">
                Record a payment to deduct the outstanding balance of this supplier.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-navy/5 bg-navy/5">
                    <th className="p-3 font-bold text-navy text-xs uppercase">Date</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Reference No</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Payment Mode</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase">Remarks</th>
                    <th className="p-3 font-bold text-navy text-xs uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay.id} className="border-b border-navy/5 hover:bg-navy/[0.02]">
                      <td className="p-3 text-sm font-bold text-navy">
                        {new Date(pay.paymentDate || pay.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm font-mono font-bold text-navy/50">{pay.referenceNo || 'N/A'}</td>
                      <td className="p-3 text-sm font-bold text-navy/70 uppercase">{pay.paymentMethod}</td>
                      <td className="p-3 text-sm text-navy/60">{pay.note || '-'}</td>
                      <td className="p-3 text-sm text-right font-black text-emerald-600">Rs. {pay.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SummaryCard({ title, value, label, variant }: any) {
  const variants: any = {
    navy: 'bg-navy text-white shadow-navy/20',
    blue: 'bg-blue-600 text-white shadow-blue-200',
    emerald: 'bg-emerald-600 text-white shadow-emerald-200',
    amber: 'bg-amber-500 text-white shadow-amber-200',
  };

  return (
    <div
      className={`${variants[variant]} p-6 rounded-[24px] shadow-xl transition-transform hover:scale-[1.02] cursor-default`}
    >
      <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">
        {title}
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-xs font-bold opacity-80">{label}</div>
    </div>
  );
}

function StatRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-navy/5 last:border-none">
      <span className="text-sm font-bold text-text-secondary">{label}</span>
      <span className="text-sm font-black text-navy">{value}</span>
    </div>
  );
}
