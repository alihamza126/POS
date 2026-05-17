import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { format } from 'date-fns';
import {
  Printer,
  Download,
  FileText,
  ArrowDownLeft,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface SupplierLedgerTabProps {
  ledger: any[];
  onPrint: () => void;
  onExport: () => void;
}

export default function SupplierLedgerTab({
  ledger,
  onPrint,
  onExport,
}: SupplierLedgerTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-soft border border-navy/5">
        <div>
          <h3 className="text-2xl font-black text-navy tracking-tight">Supplier Ledger Statement</h3>
          <p className="text-sm font-bold text-text-secondary mt-1">
            Historical purchase invoice records and payments with real-time outstanding balance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onExport}
            className="rounded-xl font-black flex items-center gap-2 border-navy/10 hover:bg-navy hover:text-white transition-all h-11 px-6"
          >
            <Download size={18} />
            Export CSV
          </Button>
          <Button
            onClick={onPrint}
            className="rounded-xl font-black flex items-center gap-2 bg-cyan text-navy hover:bg-navy hover:text-white transition-all h-11 px-6 shadow-lg shadow-cyan/20"
          >
            <Printer size={18} />
            Print Ledger
          </Button>
        </div>
      </div>

      <div className="rounded-[28px] border border-navy/5 overflow-hidden bg-white shadow-soft">
        <Table>
          <TableHeader className="bg-navy/5">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14 pl-8">
                Date
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14">
                Type
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14">
                Reference No
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14">
                Description / Remarks
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14 text-right">
                Debit (Purchases)
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14 text-right">
                Credit (Payments)
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-[10px] tracking-widest h-14 text-right pr-8">
                Running Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-text-secondary font-bold text-lg opacity-40"
                >
                  <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
                  No supplier transaction history found.
                </TableCell>
              </TableRow>
            ) : (
              ledger.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className={`hover:bg-navy/[0.03] transition-all border-navy/[0.03] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-navy/[0.01]'
                  }`}
                >
                  <TableCell className="font-bold text-navy py-5 pl-8 text-sm">
                    {format(new Date(entry.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    {entry.type === 'invoice' ? (
                      <div className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-2 w-fit font-black text-[10px] uppercase tracking-wider">
                        <FileText size={12} />
                        Purchase
                      </div>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-2 w-fit font-black text-[10px] uppercase tracking-wider">
                        <ArrowDownLeft size={12} />
                        Paid
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] font-black text-navy/50 uppercase tracking-tighter bg-navy/[0.03] px-3 py-1 rounded-lg w-fit">
                    {entry.number}
                  </TableCell>
                  <TableCell className="font-bold text-navy/70 max-w-[220px] truncate text-xs">
                    {entry.memo}
                  </TableCell>
                  <TableCell className="text-right font-black text-blue-600 text-sm">
                    {entry.debit > 0
                      ? `Rs. ${entry.debit.toLocaleString()}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-black text-emerald-600 text-sm">
                    {entry.credit > 0
                      ? `Rs. ${entry.credit.toLocaleString()}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-black text-navy text-base pr-8">
                    Rs. {entry.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end pt-4">
        <div className="bg-navy p-8 rounded-[32px] text-white shadow-2xl shadow-navy/20 min-w-[340px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          <div className="flex justify-between items-center opacity-60 mb-3">
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              Net Outstanding Due
            </span>
            <History size={18} className="text-cyan" />
          </div>
          <div className="text-4xl font-black tracking-tighter flex items-baseline gap-2">
            <span className="text-lg opacity-50 font-bold">Rs.</span>
            {(ledger.length > 0 ? ledger[0].balance : 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function History(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
