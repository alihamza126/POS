import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
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
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { useProducts } from '../hooks/use-products';
import { useAuthStore } from '../../../stores/auth-store';
import AddProductDialog from '../components/AddProductDialog';
import ProductFiltersDialog from '../components/ProductFiltersDialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { cn } from '../../../shared/utils';

export default function ProductListPage() {
  const { products, loading, filters, updateFilters, total, setPage, refresh } =
    useProducts();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { toast } = useToast();

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsAddDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsAddDialogOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchQuery });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // @ts-ignore
        await window.api.products.delete(id, user?.id);
        toast({
          title: 'Product Deleted',
          description: 'The product has been removed from inventory.',
          variant: 'default',
        });
        refresh();
      } catch (error: any) {
        console.error('Delete failed:', error);
        toast({
          title: 'Delete Failed',
          description: 'There was an error deleting the product.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock <= 0)
      return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock <= reorderLevel)
      return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'success' as const };
  };

  // TanStack Table Setup
  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Product',
        cell: (info) => (
          <span className="font-bold text-navy">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('sku', {
        header: 'SKU',
        cell: (info) => (
          <span className="text-text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('barcode', {
        header: 'Barcode',
        cell: (info) => (
          <span className="text-text-secondary font-mono text-xs">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('unit', {
        header: 'Unit',
        cell: (info) => (
          <span className="text-text-secondary">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('sellingPrice', {
        header: 'Price',
        cell: (info) => (
          <span className="font-bold text-navy">
            ${info.getValue().toFixed(2)}
          </span>
        ),
      }),
      columnHelper.accessor('currentStock', {
        header: 'Stock',
        cell: (info) => (
          <span className="font-black text-navy">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const product = info.getValue();
          const status = getStockStatus(
            product.currentStock,
            product.reorderLevel,
          );
          return (
            <Badge
              className={cn(
                'font-bold px-3 py-1 rounded-full',
                status.variant === 'success' &&
                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                status.variant === 'warning' &&
                  'bg-amber-500/10 text-amber-600 border-amber-500/20',
                status.variant === 'destructive' &&
                  'bg-red-500/10 text-red-600 border-red-500/20',
              )}
              variant="outline"
            >
              {status.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor((row) => row, {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const product = info.getValue();
          return (
            <div
              className="flex justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-secondary hover:text-primary hover:bg-primary/10"
                onClick={() => handleEdit(product)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-secondary hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: products,
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

  function SortIcon({ columnId }: { columnId: string }) {
    if (filters.sortBy !== columnId)
      return <ArrowUpDown size={14} className="ml-2 opacity-30" />;
    return filters.sortOrder === 'asc' ? (
      <ChevronUp size={14} className="ml-2 text-primary" />
    ) : (
      <ChevronDown size={14} className="ml-2 text-primary" />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">
            Product Inventory
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your products and track stock levels
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus size={20} />
          Add Product
        </Button>
      </div>

      <Card className="p-6 border-none shadow-soft bg-surface border border-navy/5">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50 group-focus-within:text-primary transition-colors"
              size={18}
            />
            <Input
              placeholder="Search products by name, SKU or barcode..."
              className="pl-10 shadow-sm focus:shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex gap-2">
            <Button
              variant="navy"
              onClick={() => setIsFilterDialogOpen(true)}
              className="gap-2"
            >
              <Filter size={18} />
              Advanced Filters
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-navy/20 overflow-hidden bg-surface shadow-sm">
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
                      className={cn(
                        'font-bold text-navy py-4',
                        header.column.getCanSort() &&
                          'cursor-pointer hover:text-primary transition-colors',
                        header.id === 'sellingPrice' || header.id === 'actions'
                          ? 'text-right'
                          : '',
                        header.id === 'currentStock' || header.id === 'status'
                          ? 'text-center'
                          : '',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={cn(
                          'flex items-center',
                          header.id === 'sellingPrice' ||
                            header.id === 'actions'
                            ? 'justify-end'
                            : '',
                          header.id === 'currentStock' || header.id === 'status'
                            ? 'justify-center'
                            : '',
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <SortIcon columnId={header.id} />
                        )}
                      </div>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-text-secondary">
                      <Package size={48} className="mb-4 opacity-20" />
                      <p className="font-medium">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'border-navy/10 transition-colors cursor-pointer group',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-background/20',
                      'hover:bg-primary/5',
                    )}
                    onClick={() => navigate(`/inventory/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-4',
                          cell.column.id === 'sellingPrice' ||
                            cell.column.id === 'actions'
                            ? 'text-right'
                            : '',
                          cell.column.id === 'currentStock' ||
                            cell.column.id === 'status'
                            ? 'text-center'
                            : '',
                        )}
                      >
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

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing{' '}
            <span className="font-bold text-navy">{products.length}</span> of{' '}
            <span className="font-bold text-navy">{total}</span> products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
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

      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refresh}
        product={selectedProduct}
      />

      <ProductFiltersDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        onApply={(newFilters) => updateFilters(newFilters)}
      />
    </div>
  );
}
