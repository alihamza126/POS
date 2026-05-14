import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { format } from 'date-fns';
import {
  Printer,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface LedgerEntry {
  id: string;
  type: 'invoice' | 'payment';
  date: string;
  number: string;
  memo: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CustomerLedgerTabProps {
  ledger: LedgerEntry[];
  onPrint?: () => void;
  onExport?: () => void;
}

export default function CustomerLedgerTab({
  ledger,
  onPrint,
  onExport,
}: CustomerLedgerTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-navy">Account Ledger</h3>
          <p className="text-sm font-medium text-text-secondary">
            Historical transaction records and running balance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="rounded-xl font-bold flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="rounded-xl font-bold flex items-center gap-2"
          >
            <Printer size={16} />
            Print Statement
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 overflow-hidden bg-white shadow-soft">
        <Table>
          <TableHeader className="bg-navy/5">
            <TableRow>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider">
                Date
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider">
                Type
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider">
                Reference
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider">
                Description
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider text-right">
                Debit (+)
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider text-right">
                Credit (-)
              </TableHead>
              <TableHead className="font-black text-navy uppercase text-xs tracking-wider text-right">
                Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-text-secondary font-medium"
                >
                  No transactions found for this period.
                </TableCell>
              </TableRow>
            ) : (
              ledger.map((entry) => (
                <TableRow
                  key={`${entry.type}-${entry.id}`}
                  className="hover:bg-navy/[0.02] transition-colors"
                >
                  <TableCell className="font-bold text-navy py-4">
                    {format(new Date(entry.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    {entry.type === 'invoice' ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 rounded-lg flex items-center gap-1 w-fit">
                        <FileText size={12} />
                        Invoice
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 rounded-lg flex items-center gap-1 w-fit">
                        <ArrowDownLeft size={12} />
                        Payment
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-black text-navy/70 uppercase">
                    {entry.number}
                  </TableCell>
                  <TableCell className="font-medium text-navy/80 max-w-[200px] truncate">
                    {entry.memo}
                  </TableCell>
                  <TableCell className="text-right font-black text-blue-600">
                    {entry.debit > 0
                      ? `Rs. ${entry.debit.toLocaleString()}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-black text-emerald-600">
                    {entry.credit > 0
                      ? `Rs. ${entry.credit.toLocaleString()}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-black text-navy text-lg">
                    Rs. {entry.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end pt-4">
        <div className="bg-navy p-6 rounded-2xl text-white shadow-lg min-w-[300px]">
          <div className="flex justify-between items-center opacity-70 mb-2">
            <span className="text-sm font-bold uppercase tracking-wider">
              Closing Balance
            </span>
            <History size={16} />
          </div>
          <div className="text-3xl font-black">
            Rs. {(ledger.length > 0 ? ledger[0].balance : 0).toLocaleString()}
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
