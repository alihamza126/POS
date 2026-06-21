/**
 * MedicalReceiptPrinter — generates HTML for the Black Copper BC-96AC thermal printer.
 *
 * Paper width : 79.5 mm (±0.5 mm)
 * Printable   : ~72–73 mm  (3–3.5 mm side margins)
 * @page size  : 79.5mm × auto  (continuous/auto-cut roll)
 *
 * Layout: 4-column items table
 *   Medicine (54%) | Qty (9%) | Rate (18%) | Amt (19%)
 */
import React from 'react';
import { Printer, Check, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

// ── Types ──────────────────────────────────────────────────────────────────
interface ReceiptItem {
  name: string;
  composition?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

interface ClinicInfo {
  clinicName: string;
  doctorName?: string;
  address?: string;
  phone?: string;
  licenseNumber?: string;
  receiptFooter?: string;
  currency?: string;
  showBatchOnReceipt?: boolean;
  showExpiryOnReceipt?: boolean;
  showCompositionOnReceipt?: boolean;
}

interface ReceiptData {
  invoiceNumber: string;
  date: string;
  cashierName: string;
  patientName?: string;
  patientPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentType: string;
  clinicInfo: ClinicInfo;
}

interface MedicalReceiptTemplateProps {
  receipt: ReceiptData;
  onPrint?: () => void;
  onClose?: () => void;
}

// ── HTML Generator ─────────────────────────────────────────────────────────
function generateReceiptHtml(receipt: ReceiptData): string {
  const {
    invoiceNumber, date, cashierName, patientName, patientPhone,
    items, subtotal, discountAmount, taxAmount,
    totalAmount, paidAmount, changeAmount, paymentType, clinicInfo,
  } = receipt;

  const currency = clinicInfo.currency ?? 'Rs.';
  const trunc = (s: string, w: number) => s.length > w ? s.slice(0, w - 1) + '\u2026' : s;

  // ── Items rows ────────────────────────────────────────────────────────────
  const itemsHtml = items.map((item) => {
    const showBatch       = clinicInfo.showBatchOnReceipt       && item.batchNumber;
    const showExpiry      = clinicInfo.showExpiryOnReceipt      && item.expiryDate;
    const showComposition = clinicInfo.showCompositionOnReceipt && item.composition;
    const disc            = (item.discount && item.discount > 0) ? item.discount : 0;

    return `
    <tr>
      <td class="td-name">
        <div class="item-name">${trunc(item.name, 28)}</div>
        ${showComposition ? `<div class="item-sub">${trunc(item.composition!, 32)}</div>` : ''}
        ${showBatch       ? `<div class="item-sub">Batch: ${item.batchNumber}</div>`      : ''}
        ${showExpiry      ? `<div class="item-sub">Exp: ${item.expiryDate}</div>`         : ''}
        ${disc > 0        ? `<div class="item-disc">Disc: -${currency}${disc.toFixed(0)}</div>` : ''}
      </td>
      <td class="td-qty">${item.quantity}</td>
      <td class="td-rate">${item.unitPrice.toFixed(0)}</td>
      <td class="td-amt">${item.totalPrice.toFixed(0)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Slip-${invoiceNumber}</title>
<style>
/* ── Reset ─────────────────────────────────── */
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

/* ── Page — BC-96AC (79.5 mm roll) ─────────── */
@page {
  size: 79.5mm auto;   /* roll width × continuous height */
  margin: 0mm 3.5mm;   /* 3.5 mm gutters → ~72.5 mm print area */
}

/* ── Body ───────────────────────────────────── */
body {
  font-family: 'Courier New', Courier, 'Lucida Console', monospace;
  font-size: 11px;
  line-height: 1.38;
  color: #000;
  background: #fff;
  width: 72.5mm;
  padding: 2mm 0 8mm;
}

/* ── Separators ─────────────────────────────── */
.sep-eq   { border-top: 2px solid #000; margin: 3px 0; }
.sep-s    { border-top: 1px solid #000; margin: 3px 0; }
.sep-d    { border-top: 1px dashed #666; margin: 3px 0; }

/* ── Header ─────────────────────────────────── */
.hdr-name {
  font-size: 15px; font-weight: 700; text-align: center;
  text-transform: uppercase; letter-spacing: 0.6px;
}
.hdr-sub {
  font-size: 9px; text-align: center; color: #333;
  margin-top: 1px; line-height: 1.45;
}

/* ── Meta rows ───────────────────────────────── */
.m { display:flex; justify-content:space-between; font-size:10px; padding:1px 0; }
.ml { color:#555; }
.mv { font-weight:700; }

/* ── Items table ─────────────────────────────── */
table { width:100%; border-collapse:collapse; }
thead th {
  font-size: 8.5px; font-weight:700; text-transform:uppercase;
  letter-spacing:0.3px; padding:2px 1px 3px;
  border-bottom: 1px solid #000;
}
.th-name  { text-align:left;   width:54%; }
.th-qty   { text-align:center; width:9%;  }
.th-rate  { text-align:right;  width:18%; }
.th-amt   { text-align:right;  width:19%; }

tbody td { padding:3px 1px 4px; border-bottom:1px dashed #bbb; vertical-align:top; }
.td-name  { text-align:left; }
.td-qty   { text-align:center; white-space:nowrap; }
.td-rate  { text-align:right;  white-space:nowrap; }
.td-amt   { text-align:right;  white-space:nowrap; font-weight:700; }

.item-name { font-size:11px; font-weight:700; line-height:1.3; }
.item-sub  { font-size:8.5px; color:#555; line-height:1.3; }
.item-disc { font-size:8.5px; color:#b00; }

/* ── Totals ──────────────────────────────────── */
.tr  { display:flex; justify-content:space-between; font-size:10px; padding:1.5px 0; }
.tr-grand {
  display:flex; justify-content:space-between;
  font-size:14px; font-weight:700; padding:3px 0 2px;
}
.tr-chg {
  display:flex; justify-content:space-between;
  font-size:12px; font-weight:700; padding:2px 0;
}
.lm { color:#555; }

/* ── Footer ──────────────────────────────────── */
.ftr { text-align:center; font-size:9px; color:#444; margin-top:5px; line-height:1.6; }
.ftr-msg { font-size:10.5px; font-weight:700; color:#000; }
</style>
</head>
<body>

<!-- ══ CLINIC HEADER ═══════════════════════════════ -->
<div class="hdr-name">${clinicInfo.clinicName || 'HOMIO CLINIC'}</div>
${clinicInfo.doctorName    ? `<div class="hdr-sub">Dr. ${clinicInfo.doctorName}</div>`    : ''}
${clinicInfo.address       ? `<div class="hdr-sub">${clinicInfo.address}</div>`            : ''}
${clinicInfo.phone         ? `<div class="hdr-sub">Tel: ${clinicInfo.phone}</div>`         : ''}
${clinicInfo.licenseNumber ? `<div class="hdr-sub">Lic: ${clinicInfo.licenseNumber}</div>`: ''}

<div class="sep-eq"></div>

<!-- ══ INVOICE META ════════════════════════════════ -->
<div class="m"><span class="ml">Invoice</span><span class="mv">${invoiceNumber}</span></div>
<div class="m"><span class="ml">Date</span><span>${date}</span></div>
<div class="m"><span class="ml">Cashier</span><span>${cashierName}</span></div>
${patientName  ? `<div class="m"><span class="ml">Patient</span><span class="mv">${patientName}</span></div>` : ''}
${patientPhone ? `<div class="m"><span class="ml">Phone</span><span>${patientPhone}</span></div>`             : ''}

<div class="sep-d"></div>

<!-- ══ ITEMS ══════════════════════════════════════ -->
<table>
  <thead>
    <tr>
      <th class="th-name">Medicine</th>
      <th class="th-qty">Qty</th>
      <th class="th-rate">Rate</th>
      <th class="th-amt">Amt</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHtml}
  </tbody>
</table>

<!-- ══ TOTALS ════════════════════════════════════ -->
<div class="sep-s"></div>
<div class="tr"><span class="lm">Subtotal</span><span>${currency} ${subtotal.toFixed(0)}</span></div>
${discountAmount > 0 ? `<div class="tr"><span class="lm">Discount</span><span>- ${currency} ${discountAmount.toFixed(0)}</span></div>` : ''}
${taxAmount > 0      ? `<div class="tr"><span class="lm">Tax</span><span>${currency} ${taxAmount.toFixed(0)}</span></div>`             : ''}

<div class="sep-eq"></div>
<div class="tr-grand"><span>TOTAL</span><span>${currency} ${totalAmount.toFixed(0)}</span></div>
<div class="sep-d"></div>

<div class="tr"><span class="lm">Paid (${paymentType.toUpperCase()})</span><span>${currency} ${paidAmount.toFixed(0)}</span></div>
${changeAmount > 0 ? `<div class="tr-chg"><span>Change</span><span>${currency} ${changeAmount.toFixed(0)}</span></div>` : ''}

<div class="sep-eq"></div>

<!-- ══ FOOTER ════════════════════════════════════ -->
<div class="ftr">
  <div class="ftr-msg">${clinicInfo.receiptFooter ?? 'Thank you for your visit!'}</div>
  <div>Ref: ${invoiceNumber}</div>
  <div style="font-size:8px;margin-top:2px;">Homio Medical POS &bull; BC-96AC</div>
</div>

</body>
</html>`;
}

// ── UI Component ───────────────────────────────────────────────────────────
export default function MedicalReceiptPrinter({
  receipt,
  onPrint,
  onClose,
}: MedicalReceiptTemplateProps) {
  const [printing, setPrinting] = React.useState(false);
  const [printed, setPrinted] = React.useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const html = generateReceiptHtml(receipt);
      // @ts-ignore — window.api injected by preload
      const result = await window.api.print.printReceipt(html, false);
      if (result?.success) {
        setPrinted(true);
        setTimeout(() => onPrint?.(), 1500);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Print failed:', err);
    } finally {
      setPrinting(false);
    }
  };

  const handleSilentPrint = async () => {
    setPrinting(true);
    try {
      const html = generateReceiptHtml(receipt);
      // @ts-ignore
      await window.api.print.printReceipt(html, true);
      setPrinted(true);
      setTimeout(() => onPrint?.(), 800);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Silent print failed:', err);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
          <Check size={20} className="text-white" />
        </div>
        <div>
          <div className="font-black text-emerald-800 text-sm">Sale Completed!</div>
          <div className="text-emerald-600 text-xs font-medium">
            Invoice #{receipt.invoiceNumber}
          </div>
        </div>
      </div>

      {/* Receipt summary */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Patient</span>
          <span className="font-bold text-[#02025C]">{receipt.patientName || 'Walk-in'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Items</span>
          <span className="font-bold text-[#02025C]">{receipt.items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total</span>
          <span className="font-black text-emerald-600 text-base">
            {receipt.clinicInfo.currency ?? 'Rs.'} {receipt.totalAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Payment</span>
          <span className="font-bold capitalize text-[#02025C]">{receipt.paymentType}</span>
        </div>
      </div>

      {/* Paper size badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
        <Printer size={14} className="text-blue-500 shrink-0" />
        <span className="text-xs font-bold text-blue-700">
          BC-96AC &bull; 79.5 mm roll &bull; 80 mm thermal
        </span>
      </div>

      {/* Print buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handlePrint}
          disabled={printing || printed}
          className="flex-1 gap-2 bg-[#02025C] hover:bg-[#02025C]/90 text-white rounded-xl font-bold"
        >
          {printing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Printer size={16} />
          )}
          {printing ? 'Printing…' : printed ? '✓ Printed' : 'Print Slip'}
        </Button>
        <Button
          onClick={handleSilentPrint}
          disabled={printing || printed}
          variant="outline"
          className="px-4 rounded-xl font-bold border-[#02025C]/20 text-[#02025C]"
          title="Send directly to default printer (no dialog)"
        >
          Auto
        </Button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1 transition-colors"
      >
        Skip printing &amp; continue
      </button>
    </div>
  );
}

export { generateReceiptHtml };
export type { ReceiptData, ReceiptItem, ClinicInfo };
