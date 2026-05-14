import React, { useMemo, useState, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { cn } from '../../../shared/utils';
import { format } from 'date-fns';

const columnHelper = createColumnHelper<any>();

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    action: 'all',
    startDate: '',
    endDate: '',
    limit: 20,
    offset: 0,
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.api.audit.getLogs({
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      // @ts-ignore
      const result = await window.api.audit.getActions();
      setActions(result);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.action, filters.startDate, filters.endDate, filters.offset]);

  useEffect(() => {
    fetchActions();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        header: 'Timestamp',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-bold text-navy">
              {format(new Date(info.getValue()), 'MMM d, yyyy')}
            </span>
            <span className="text-xs text-text-secondary">
              {format(new Date(info.getValue()), 'HH:mm:ss')}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: (info) => {
          const action = info.getValue();
          return (
            <Badge
              variant="outline"
              className={cn(
                'font-bold px-3 py-1 rounded-full uppercase text-[10px] tracking-wider',
                action.includes('CREATE') &&
                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                action.includes('UPDATE') &&
                  'bg-amber-500/10 text-amber-600 border-amber-500/20',
                action.includes('DELETE') &&
                  'bg-red-500/10 text-red-600 border-red-500/20',
                action.includes('AUTH') &&
                  'bg-primary/10 text-primary border-primary/20',
              )}
            >
              {action.replace(/_/g, ' ')}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('entity', {
        header: 'Entity',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-text-secondary" />
            <span className="font-medium text-navy capitalize">
              {info.getValue() || 'System'}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('userId', {
        header: 'User',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <User size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {info.getValue() || 'System'}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('metadata', {
        header: 'Details',
        cell: (info) => {
          const metadata = info.getValue();
          if (!metadata)
            return <span className="text-text-secondary italic">-</span>;
          try {
            const data = JSON.parse(metadata);
            return (
              <span className="text-xs text-text-secondary line-clamp-1 max-w-[200px]">
                {Object.entries(data)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')}
              </span>
            );
          } catch {
            return (
              <span className="text-xs text-text-secondary">{metadata}</span>
            );
          }
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (newOffset: number) => {
    setFilters({ ...filters, offset: newOffset });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">
            Audit History
          </h1>
          <p className="text-text-secondary mt-1">
            Track all business activities and changes
          </p>
        </div>
      </div>

      <Card className="p-6 border-none shadow-soft bg-surface border border-navy/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-navy/50 flex items-center gap-1">
              <Activity size={12} /> Action Type
            </label>
            <Select
              value={filters.action}
              onValueChange={(val) =>
                setFilters({ ...filters, action: val, offset: 0 })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-navy/50 flex items-center gap-1">
              <Calendar size={12} /> Start Date
            </label>
            <Input
              type="date"
              className="h-11"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value, offset: 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-navy/50 flex items-center gap-1">
              <Calendar size={12} /> End Date
            </label>
            <Input
              type="date"
              className="h-11"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value, offset: 0 })
              }
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full h-11 font-bold text-navy"
              onClick={() =>
                setFilters({
                  action: 'all',
                  startDate: '',
                  endDate: '',
                  limit: 20,
                  offset: 0,
                })
              }
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-navy/10 overflow-hidden bg-surface shadow-sm">
          <Table>
            <TableHeader className="bg-background/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-navy/10 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-bold text-navy py-4"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="animate-pulse">
                    {columns.map((_, j) => (
                      <TableCell key={`cell-${i}-${j}`}>
                        <div className="h-4 bg-background rounded w-full opacity-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-text-secondary">
                      <History size={48} className="mb-4 opacity-20" />
                      <p className="font-medium">No audit logs found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'border-navy/10 transition-colors',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-background/10',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary font-medium">
            Showing <span className="text-navy font-bold">{logs.length}</span>{' '}
            of <span className="text-navy font-bold">{total}</span> events
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.offset === 0}
              className="font-bold text-navy h-9 px-4"
              onClick={() =>
                handlePageChange(Math.max(0, filters.offset - filters.limit))
              }
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.offset + filters.limit >= total}
              className="font-bold text-navy h-9 px-4"
              onClick={() => handlePageChange(filters.offset + filters.limit)}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
