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
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import CustomerLedgerTab from './CustomerLedgerTab';
import PatientProfileTab from './PatientProfileTab';
import PrescriptionsTab from './PrescriptionsTab';
import { generateCustomerStatementPDF } from '../../../shared/utils/pdf-generator';
import { exportToCSV } from '../../../shared/utils/csv-exporter';
import { useSettingsStore } from '../../../stores/settings-store';

interface CustomerDetailsTabsProps {
  customerId: string;
  customer?: any;
}

const DEFAULT_SUMMARY = {
  currentBalance: 0,
  totalInvoices: 0,
  totalPayments: 0,
  transactionCount: 0,
  lastTransaction: null,
};

export default function CustomerDetailsTabs({
  customerId,
  customer,
}: CustomerDetailsTabsProps) {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { company } = useSettingsStore();

  const companyDetails = {
    name: company.name,
    address: company.address,
    phone: company.phone,
    email: (company as any).email || '',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const [summaryResult, ledgerResult] = await Promise.all([
          // @ts-ignore
          window.api.customers.getSummary(customerId),
          // @ts-ignore
          window.api.customers.getLedger(customerId),
        ]);

        setSummary(summaryResult || DEFAULT_SUMMARY);
        setLedger(ledgerResult || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch customer tab data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleRefresh = () => fetchData();
    window.addEventListener('customer-payment-received', handleRefresh);
    return () => window.removeEventListener('customer-payment-received', handleRefresh);
  }, [customerId]);

  const handlePrintLedger = () => {
    generateCustomerStatementPDF({
      customerName: customer?.name || 'Customer',
      phone: customer?.phone || 'N/A',
      address: customer?.address || 'N/A',
      date: new Date().toLocaleDateString(),
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
      `Statement_${customer?.name || 'Customer'}_${new Date().getTime()}.csv`,
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
            Loading financial data...
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
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <CreditCard size={16} />
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <StickyNote size={16} />
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="medical"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <Stethoscope size={16} />
            Medical
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <ClipboardList size={16} />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-xl px-6 py-2.5 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold flex items-center gap-2"
          >
            <Activity size={16} />
            Activity
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
            title="Current Balance"
            value={`Rs. ${(summary.currentBalance ?? 0).toLocaleString()}`}
            label="Outstanding amount"
            variant="navy"
          />
          <SummaryCard
            title="Total Purchases"
            value={`Rs. ${(summary.totalInvoices ?? 0).toLocaleString()}`}
            label={`${summary.transactionCount ?? 0} total invoices`}
            variant="blue"
          />
          <SummaryCard
            title="Total Paid"
            value={`Rs. ${(summary.totalPayments ?? 0).toLocaleString()}`}
            label="Lifetime collection"
            variant="emerald"
          />
          <SummaryCard
            title="Last Transaction"
            value={
              summary.lastTransaction
                ? new Date(summary.lastTransaction).toLocaleDateString()
                : 'N/A'
            }
            label="Transaction date"
            variant="amber"
          />
        </div>

        {/* Quick Stats & Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[24px] shadow-soft border border-navy/5">
            <h4 className="text-lg font-black text-navy mb-4">Quick Stats</h4>
            <div className="space-y-4">
              <StatRow label="Credit Limit" value="Rs. 500,000" />
              <StatRow label="Average Payment Time" value="14 Days" />
              <StatRow
                label="Last 30 Days Sales"
                value={`Rs. ${(summary.totalInvoices ?? 0).toLocaleString()}`}
              />
              <StatRow label="Customer Since" value="January 2024" />
            </div>
          </div>
          <div className="bg-white p-8 rounded-[24px] shadow-soft border border-navy/5">
            <h4 className="text-lg font-black text-navy mb-4">Risk Profile</h4>
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black">
                A+
              </div>
              <div>
                <div className="text-sm font-black text-emerald-900">
                  Low Risk Customer
                </div>
                <div className="text-xs font-bold text-emerald-700 opacity-70">
                  Excellent payment history and reliability.
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="ledger"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <CustomerLedgerTab
          ledger={ledger}
          onPrint={handlePrintLedger}
          onExport={handleExportLedger}
        />
      </TabsContent>

      <TabsContent
        value="invoices"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-12 rounded-[32px] text-center border-2 border-dashed border-navy/10">
          <FileText size={48} className="mx-auto text-navy/20 mb-4" />
          <h3 className="text-xl font-black text-navy">Invoice History</h3>
          <p className="text-text-secondary font-medium mt-2">
            Full list of invoices generated for this customer.
          </p>
        </div>
      </TabsContent>

      <TabsContent
        value="payments"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-12 rounded-[32px] text-center border-2 border-dashed border-navy/10">
          <CreditCard size={48} className="mx-auto text-navy/20 mb-4" />
          <h3 className="text-xl font-black text-navy">Payment Records</h3>
          <p className="text-text-secondary font-medium mt-2">
            Detailed breakdown of all payments received.
          </p>
        </div>
      </TabsContent>

      <TabsContent
        value="notes"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-8 rounded-[24px] shadow-soft border border-navy/5 min-h-[300px]">
          <h4 className="text-lg font-black text-navy mb-6">Customer Notes</h4>
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-amber-900 font-medium">
            No internal notes available for this customer.
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="medical"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <PatientProfileTab customerId={customerId} />
      </TabsContent>

      <TabsContent
        value="prescriptions"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <PrescriptionsTab customerId={customerId} />
      </TabsContent>

      <TabsContent
        value="activity"
        className="animate-in fade-in slide-in-from-bottom-4"
      >
        <div className="bg-white p-8 rounded-[24px] shadow-soft border border-navy/5">
          <h4 className="text-lg font-black text-navy mb-6">Recent Activity</h4>
          <div className="space-y-6">
            {['log-1', 'log-2', 'log-3'].map((key) => (
              <div key={key} className="flex gap-4">
                <div className="w-1 h-12 bg-navy/10 rounded-full" />
                <div>
                  <div className="text-sm font-black text-navy">
                    Audit Log Generated
                  </div>
                  <div className="text-xs font-bold text-text-secondary">
                    Customer details were updated by Admin at 10:30 AM
                  </div>
                </div>
              </div>
            ))}
          </div>
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
