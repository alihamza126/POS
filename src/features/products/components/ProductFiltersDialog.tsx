import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';

interface ProductFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: any;
  onApply: (filters: any) => void;
}

export default function ProductFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
}: ProductFiltersDialogProps) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = { ...filters, categoryId: null, stockStatus: 'all' };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-surface rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy">
            Advanced Filters
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Refine your product search with specific criteria.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-navy font-bold">
              Category
            </Label>
            <Select
              value={localFilters.categoryId || 'all'}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  categoryId: value === 'all' ? null : value,
                })
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stockStatus" className="text-navy font-bold">
              Stock Status
            </Label>
            <Select
              value={localFilters.stockStatus || 'all'}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  stockStatus: value,
                })
              }
            >
              <SelectTrigger id="stockStatus">
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minPrice" className="text-navy font-bold">
                Min Price
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0.00"
                value={localFilters.minPrice || ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    minPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPrice" className="text-navy font-bold">
                Max Price
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="999.99"
                value={localFilters.maxPrice || ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    maxPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
