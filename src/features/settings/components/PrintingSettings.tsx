import React, { useCallback, useEffect, useState } from 'react';
import {
  Printer,
  RefreshCw,
  Loader2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { useAuthStore } from '../../../stores/auth-store';
import { APP_CONFIG } from '../../../shared/constants/config';
import { generateReceiptHtml } from '../../sales/components/MedicalReceiptPrinter';

interface PrinterInfo {
  name: string;
  displayName: string;
  isDefault: boolean;
  status: number;
}

function buildTestReceiptHtml(clinicInfo: any, printerName?: string) {
  return generateReceiptHtml({
    invoiceNumber: 'TEST-0001',
    date: new Date().toLocaleString(),
    cashierName: 'Test Print',
    patientName: 'Sample Patient',
    patientPhone: undefined,
    items: [
      {
        name: 'Sample Medicine 30ml',
        composition: 'Test Composition',
        batchNumber: 'BATCH-01',
        expiryDate: '2027-01-01',
        quantity: 2,
        unitPrice: 150,
        totalPrice: 300,
        discount: 0,
      },
    ],
    subtotal: 300,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 300,
    paidAmount: 300,
    changeAmount: 0,
    paymentType: 'cash',
    clinicInfo: {
      clinicName: clinicInfo?.clinicName || 'Homio Medical Clinic',
      doctorName: clinicInfo?.doctorName,
      address: clinicInfo?.address,
      phone: clinicInfo?.phone,
      licenseNumber: clinicInfo?.licenseNumber,
      receiptFooter: 'This is a TEST print — no sale was recorded.',
      currency: clinicInfo?.currency || 'Rs.',
      showBatchOnReceipt: true,
      showExpiryOnReceipt: true,
      showCompositionOnReceipt: true,
      printerName,
    },
  });
}

export default function PrintingSettings() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [clinicInfo, setClinicInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const loadPrinters = useCallback(async () => {
    setRefreshing(true);
    try {
      // @ts-ignore
      const list = await window.api.print.getPrinters();
      setPrinters(list || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load printers:', err);
      toast({
        title: 'Could not list printers',
        description: 'Make sure at least one printer driver is installed on this PC.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const settings = await window.api.medical.getClinicSettings();
        setClinicInfo(settings || {});
        setSelectedPrinter(settings?.printerName || '');
        await loadPrinters();
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // @ts-ignore
      await window.api.medical.saveClinicSettings(
        { printerName: selectedPrinter },
        user?.id,
        APP_CONFIG.branch.defaultId,
      );
      setClinicInfo((prev: any) => ({ ...prev, printerName: selectedPrinter }));
      toast({
        title: 'Printer Saved',
        description: selectedPrinter
          ? `Receipts will now print to "${selectedPrinter}".`
          : 'Receipts will use the OS default printer.',
      });
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: 'Could not save the printer selection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrint = async () => {
    setTesting(true);
    try {
      const html = buildTestReceiptHtml(clinicInfo, selectedPrinter || undefined);
      // @ts-ignore
      const result = await window.api.print.printReceipt(html, true, selectedPrinter || undefined);
      if (result?.success) {
        toast({
          title: 'Test Print Sent',
          description: 'If nothing came out, check the printer is powered on, has paper, and is the right one selected below.',
        });
      } else {
        toast({
          title: 'Test Print Failed',
          description: result?.reason || 'The printer did not accept the job.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Test Print Failed',
        description: err?.message || 'Unexpected error while printing.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const hasPrinters = printers.length > 0;
  const selectedIsKnown = !selectedPrinter || printers.some((p) => p.name === selectedPrinter);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-navy/5 shadow-soft space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
              Receipt Printer
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loadPrinters}
            disabled={refreshing}
            className="gap-2 h-8 px-3 text-xs"
          >
            {refreshing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            Refresh
          </Button>
        </div>

        {!hasPrinters && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 font-medium">
              No printers were found on this PC. Install/connect your thermal
              printer (e.g. Black Copper BC-96AC) and its Windows driver, then
              click Refresh. Until a printer is selected, slips will try to
              print to whatever the OS considers the default printer — which
              is the most common reason a slip appears to &quot;not print&quot;.
            </div>
          </div>
        )}

        {hasPrinters && !selectedIsKnown && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 font-medium">
              The previously saved printer (&quot;{selectedPrinter}&quot;) is not in the
              current printer list — it may have been disconnected or renamed.
              Pick it again below.
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="printerName" className="text-sm font-bold text-navy">
            Selected Printer
          </Label>
          <select
            id="printerName"
            value={selectedPrinter}
            onChange={(e) => setSelectedPrinter(e.target.value)}
            className="w-full h-11 rounded-xl border border-navy/20 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">OS Default Printer</option>
            {printers.map((p) => (
              <option key={p.name} value={p.name}>
                {p.displayName}
                {p.isDefault ? ' (OS Default)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">
            Choose your thermal receipt printer explicitly rather than relying
            on the OS default — this is what &quot;Auto&quot; print uses on the POS
            screen with no dialog.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-[#02025C] hover:bg-[#02025C]/90"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Printer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestPrint}
            disabled={testing}
            className="gap-2 border-[#02025C]/20 text-[#02025C]"
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {testing ? 'Sending…' : 'Send Test Print'}
          </Button>
          {clinicInfo?.printerName === selectedPrinter && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={14} />
              Currently active
            </span>
          )}
        </div>
      </Card>

      <Card className="p-6 border-navy/5 shadow-soft space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-navy/60">
          Troubleshooting a slip that won&apos;t print
        </h3>
        <ul className="text-sm text-navy/60 space-y-2 list-disc pl-5">
          <li>
            Click <strong>Send Test Print</strong> above first — the error
            message (if any) tells you exactly what failed.
          </li>
          <li>
            Confirm the printer shows up after clicking <strong>Refresh</strong>.
            If it never appears, the Windows driver isn&apos;t installed
            correctly — reinstall it outside this app first.
          </li>
          <li>
            &quot;Auto&quot; (silent) print always uses the printer selected
            here. If none is selected, it uses whatever Windows calls the
            default printer — which may not be your receipt printer.
          </li>
          <li>
            &quot;Print Slip&quot; opens the OS print dialog — if it doesn&apos;t
            appear, make sure the app window isn&apos;t stuck behind another
            fullscreen window (alt-tab to check).
          </li>
          <li>
            Paper jams, an empty roll, or the printer being offline/asleep
            will make the job disappear silently at the OS level — check the
            physical printer.
          </li>
        </ul>
      </Card>
    </div>
  );
}
