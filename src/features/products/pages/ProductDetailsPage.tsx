import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  History,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Barcode as BarcodeIcon,
  Package,
  Printer,
  PlusCircle,
  Tag,
  Scale,
  Calendar,
  Info,
  List,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
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

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // @ts-ignore
        const result = await window.api.products.get(id);
        setProduct(result);
      } catch (error) {
        console.error('Failed to fetch product details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading)
    return <div className="p-8 text-center">Loading product details...</div>;
  if (!product)
    return (
      <div className="p-8 text-center text-destructive">Product not found</div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        onClick={() => navigate('/inventory')}
        className="group gap-2 text-navy/60 hover:text-navy transition-all font-bold px-0 hover:bg-transparent"
      >
        <ArrowLeft
          size={18}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Inventory
      </Button>

      <div className="relative overflow-hidden rounded-3xl bg-navy text-white p-8 shadow-2xl shadow-navy/20 border border-navy/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <Package size={160} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shadow-inner">
              <Package size={40} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-black tracking-tight">
                  {product.name}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-primary/20 text-primary border-primary/30 font-bold px-3 py-1"
                >
                  {product.sku}
                </Badge>
              </div>
              <p className="text-white/60 mt-2 font-medium max-w-2xl text-lg">
                {product.description ||
                  'No description provided for this product.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2 h-12 px-6 rounded-xl transition-all font-bold"
            >
              <Printer size={18} />
              Label
            </Button>
            <Button
              onClick={() => navigate(`/inventory/edit/${id}`)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8 rounded-xl font-black shadow-xl shadow-primary/30 border border-primary/20 transition-all active:scale-95"
            >
              <Edit size={18} />
              Edit Product
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 bg-white border border-navy/20 shadow-xl shadow-navy/5 flex flex-col items-center text-center rounded-3xl relative group transition-all hover:border-primary/50">
          <div className="absolute top-4 right-4 w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600 group-hover:bg-primary group-hover:text-white transition-colors">
            <TrendingUp size={16} />
          </div>
          <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-4">
            Available Stock
          </p>
          <p className="text-5xl font-black text-navy leading-none">
            {product.currentStock}
          </p>
          <p className="text-sm font-bold text-navy/60 mt-3 bg-navy/5 px-3 py-1 rounded-full">
            {product.unit}
          </p>
        </Card>

        <Card className="p-8 bg-white border border-navy/20 shadow-xl shadow-navy/5 flex flex-col items-center text-center rounded-3xl relative group transition-all hover:border-emerald-500/50">
          <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <DollarSign size={16} />
          </div>
          <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-4">
            Selling Price
          </p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-emerald-500">$</span>
            <p className="text-5xl font-black text-navy leading-none">
              {product.sellingPrice.toFixed(2)}
            </p>
          </div>
          <p className="text-sm font-bold text-navy/60 mt-3">
            Per {product.unit}
          </p>
        </Card>

        <Card className="p-8 bg-white border border-navy/20 shadow-xl shadow-navy/5 flex flex-col items-center text-center rounded-3xl relative group transition-all hover:border-navy/50">
          <div className="absolute top-4 right-4 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-navy group-hover:text-white transition-colors">
            <Tag size={16} />
          </div>
          <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-4">
            Purchase Cost
          </p>
          <p className="text-5xl font-black text-navy leading-none">
            ${product.purchasePrice.toFixed(2)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
              {(
                ((product.sellingPrice - product.purchasePrice) /
                  product.sellingPrice) *
                100
              ).toFixed(1)}
              % Profit
            </Badge>
          </div>
        </Card>

        <Card className="p-8 bg-white border border-navy/20 shadow-xl shadow-navy/5 flex flex-col items-center text-center rounded-3xl relative group transition-all hover:border-amber-500/50">
          <div className="absolute top-4 right-4 w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <AlertCircle size={16} />
          </div>
          <p className="text-xs font-black text-navy/40 uppercase tracking-widest mb-4">
            Reorder Level
          </p>
          <p className="text-5xl font-black text-navy leading-none">
            {product.reorderLevel}
          </p>
          {product.currentStock <= product.reorderLevel ? (
            <Badge
              className="mt-4 bg-red-500/10 text-red-600 border-red-500/20 font-bold animate-pulse"
              variant="outline"
            >
              Low Stock Alert
            </Badge>
          ) : (
            <Badge className="mt-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
              Stock Healthy
            </Badge>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-8 bg-white border border-navy/20 shadow-xl shadow-navy/5 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-navy/10">
            <div className="w-8 h-8 bg-navy/5 rounded-lg flex items-center justify-center text-navy">
              <Info size={18} />
            </div>
            <h2 className="text-xl font-black text-navy">Specifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <BarcodeIcon
                  size={18}
                  className="text-navy/40 group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-bold text-navy/60">Barcode</span>
              </div>
              <span className="text-sm font-black text-navy font-mono bg-navy/5 px-2 py-1 rounded-md">
                {product.barcode || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <Tag
                  size={18}
                  className="text-navy/40 group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-bold text-navy/60">SKU</span>
              </div>
              <span className="text-sm font-black text-navy">
                {product.sku}
              </span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <List
                  size={18}
                  className="text-navy/40 group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-bold text-navy/60">Category</span>
              </div>
              <span className="text-sm font-black text-navy">
                {product.categoryId || 'General'}
              </span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <Scale
                  size={18}
                  className="text-navy/40 group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-bold text-navy/60">Unit</span>
              </div>
              <span className="text-sm font-black text-navy uppercase">
                {product.unit}
              </span>
            </div>
            <div className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <Calendar
                  size={18}
                  className="text-navy/40 group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-bold text-navy/60">
                  Created At
                </span>
              </div>
              <span className="text-sm font-black text-navy">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-6">
            <Button className="w-full bg-navy hover:bg-navy/90 text-white gap-2 h-12 rounded-xl font-bold shadow-lg shadow-navy/20">
              <PlusCircle size={18} />
              Adjust Stock
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-0 bg-white border border-navy/20 shadow-xl shadow-navy/5 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-navy/10 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <History size={18} />
              </div>
              <h2 className="text-xl font-black text-navy">Stock Movement</h2>
            </div>
            <Badge
              variant="outline"
              className="border-navy/20 text-navy/60 font-bold"
            >
              Last 30 Days
            </Badge>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-navy/5 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-navy/10">
                  <TableHead className="font-black text-navy uppercase text-xs tracking-widest py-4 pl-8">
                    Date
                  </TableHead>
                  <TableHead className="font-black text-navy uppercase text-xs tracking-widest py-4">
                    Type
                  </TableHead>
                  <TableHead className="text-right font-black text-navy uppercase text-xs tracking-widest py-4">
                    Quantity
                  </TableHead>
                  <TableHead className="font-black text-navy uppercase text-xs tracking-widest py-4">
                    Reason
                  </TableHead>
                  <TableHead className="font-black text-navy uppercase text-xs tracking-widest py-4 pr-8">
                    User
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-navy/5 hover:bg-navy/[0.02] transition-colors">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                      <History size={48} />
                      <p className="text-lg font-bold">
                        No movement history yet
                      </p>
                      <p className="text-sm font-medium">
                        All stock adjustments and sales will appear here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
