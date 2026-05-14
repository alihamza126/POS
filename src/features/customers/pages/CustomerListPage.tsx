import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  User,
  Phone,
  Building,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Card } from '../../../components/ui/card';
import { useCustomers } from '../hooks/use-customers';
import { useAuthStore } from '../../../stores/auth-store';
import AddCustomerDialog from '../components/AddCustomerDialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { cn } from '../../../shared/utils';

export default function CustomerListPage() {
  const {
    customers,
    loading,
    filters,
    updateFilters,
    total,
    setPage,
    refresh,
  } = useCustomers();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { toast } = useToast();

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsAddDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setIsAddDialogOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchQuery });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        // @ts-ignore
        await window.api.customers.delete(id, user?.id);
        toast({
          title: 'Customer Deleted',
          description: 'The customer has been removed successfully.',
          variant: 'default',
        });
        refresh();
      } catch (error: any) {
        console.error('Delete failed:', error);
        toast({
          title: 'Delete Failed',
          description: 'There was an error deleting the customer.',
          variant: 'destructive',
        });
      }
    }
  };

  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Customer Name',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center text-navy font-black border border-navy/10">
              {info.getValue().charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-navy">{info.getValue()}</div>
              <div className="text-xs font-bold text-text-secondary uppercase">
                {info.row.original.companyName || 'Personal Account'}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('phone', {
        header: 'Phone Number',
        cell: (info) => (
          <div className="flex items-center gap-2 text-text-secondary font-bold">
            <Phone size={14} className="text-primary" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email Address',
        cell: (info) => (
          <span className="text-text-secondary font-medium">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('address', {
        header: 'Location',
        cell: (info) => (
          <span className="text-text-secondary font-medium truncate max-w-[150px] inline-block">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const customer = info.getValue();
          return (
            <div
              className="flex justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl"
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <ExternalLink size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-text-secondary hover:text-navy hover:bg-navy/5 rounded-xl"
                onClick={() => handleEdit(customer)}
              >
                <Edit size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => handleDelete(customer.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting: [
        {
          id: filters.sortBy || 'createdAt',
          desc: filters.sortOrder === 'desc',
        },
      ],
    },
    onSortingChange: (updater: any) => {
      const newSorting =
        typeof updater === 'function'
          ? updater([
              { id: filters.sortBy, desc: filters.sortOrder === 'desc' },
            ])
          : updater;
      const sort = newSorting[0];
      if (sort) {
        updateFilters({
          sortBy: sort.id,
          sortOrder: sort.desc ? 'desc' : 'asc',
        });
      }
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight">
            Customers
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Manage your client relationships and account statements.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="h-12 px-6 rounded-xl font-black bg-primary text-navy hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 gap-2"
        >
          <Plus size={20} />
          Add New Customer
        </Button>
      </div>

      <Card className="p-8 border-none shadow-soft bg-white rounded-[32px] border border-navy/5">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              placeholder="Search customers by name, phone or company..."
              className="pl-12 h-14 rounded-2xl bg-background/50 border-navy/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="rounded-[24px] border border-navy/10 overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-navy/[0.02]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-navy/5 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'font-black text-navy py-5 uppercase text-xs tracking-widest px-6',
                        header.column.getCanSort() &&
                          'cursor-pointer hover:text-primary transition-colors',
                        header.id === 'actions' ? 'text-right' : '',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={cn(
                          'flex items-center',
                          header.id === 'actions' ? 'justify-end' : '',
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <SortIcon
                            columnId={header.id}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                          />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading &&
                // eslint-disable-next-line react/no-array-index-key
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`} className="animate-pulse">
                    {columns.map((__, j) => (
                      <TableCell
                        // eslint-disable-next-line react/no-array-index-key
                        key={`skeleton-cell-${i}-${j}`}
                        className="py-6 px-6"
                      >
                        <div className="h-4 bg-background rounded w-full opacity-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loading && customers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-text-secondary">
                      <User size={64} className="mb-4 opacity-10" />
                      <p className="font-black text-xl text-navy/30">
                        No customers found
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Try a different search or add a new customer.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                customers.length > 0 &&
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-navy/5 transition-all cursor-pointer hover:bg-primary/[0.03] group"
                    onClick={() => navigate(`/customers/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-5 px-6',
                          cell.column.id === 'actions' ? 'text-right' : '',
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm font-bold text-text-secondary">
            Showing <span className="text-navy">{customers.length}</span> of{' '}
            <span className="text-navy">{total}</span> customers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-4 font-bold h-10"
              disabled={filters.offset === 0}
              onClick={() =>
                setPage(Math.floor(filters.offset / filters.limit))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-4 font-bold h-10"
              disabled={filters.offset + filters.limit >= total}
              onClick={() =>
                setPage(Math.floor(filters.offset / filters.limit) + 2)
              }
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <AddCustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refresh}
        customer={selectedCustomer}
      />
    </div>
  );
}

function SortIcon({
  columnId,
  sortBy,
  sortOrder,
}: {
  columnId: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  if (sortBy !== columnId)
    return <ArrowUpDown size={14} className="ml-2 opacity-30" />;
  return sortOrder === 'asc' ? (
    <ChevronUp size={14} className="ml-2 text-primary" />
  ) : (
    <ChevronDown size={14} className="ml-2 text-primary" />
  );
}

SortIcon.defaultProps = {
  sortBy: undefined,
  sortOrder: 'asc',
};
