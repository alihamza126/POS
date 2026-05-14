import React from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { usePOSStore } from '../../../stores/pos-store';

interface ProductGridProps {
  products: any[];
  loading: boolean;
  searchQuery: string;
}

export default function ProductGrid({
  products,
  loading,
  searchQuery,
}: ProductGridProps) {
  const { addItem, items } = usePOSStore();

  const getCartQuantity = (productId: string) => {
    const cartItem = items.find((item) => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`skeleton-${String(i)}`}
            className="bg-white rounded-2xl h-36 animate-pulse border border-navy/5"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="w-20 h-20 bg-navy/5 rounded-3xl flex items-center justify-center mb-4">
          <Package size={40} className="text-navy/20" />
        </div>
        <h3 className="text-lg font-black text-navy mb-1">
          {searchQuery ? 'No products found' : 'No products available'}
        </h3>
        <p className="text-sm font-medium text-navy/40 max-w-xs">
          {searchQuery
            ? `No results for "${searchQuery}". Try a different search.`
            : 'Add products from the inventory module first.'}
        </p>
      </div>
    );
  }

  const getStockBadge = (product: any) => {
    const outOfStock = (product.currentStock ?? 0) <= 0;
    const lowStock =
      product.currentStock > 0 && product.currentStock <= product.reorderLevel;

    if (outOfStock) {
      return (
        <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
          OUT
        </span>
      );
    }
    if (lowStock) {
      return (
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {product.currentStock} left
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        {product.currentStock} in stock
      </span>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map((product) => {
        const cartQty = getCartQuantity(product.id);
        const isOutOfStock = (product.currentStock ?? 0) <= 0;

        return (
          <button
            key={product.id}
            type="button"
            disabled={isOutOfStock}
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                sellingPrice: product.sellingPrice,
                currentStock: product.currentStock,
              })
            }
            className={`relative bg-white rounded-2xl p-4 text-left border transition-all duration-200 group
              ${
                isOutOfStock
                  ? 'opacity-40 cursor-not-allowed border-navy/5'
                  : 'border-navy/5 hover:border-[#24D4FE] hover:shadow-lg hover:shadow-[#24D4FE]/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              }
              ${cartQty > 0 ? 'ring-2 ring-[#24D4FE] border-[#24D4FE]' : ''}
            `}
          >
            {/* Cart badge */}
            {cartQty > 0 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#24D4FE] text-[#02025C] rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-[#24D4FE]/40 animate-in zoom-in duration-200">
                {cartQty}
              </div>
            )}

            {/* Product icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#24D4FE]/10 to-[#02025C]/5 rounded-xl flex items-center justify-center mb-3">
              <ShoppingCart size={18} className="text-[#02025C]/40" />
            </div>

            {/* Name */}
            <h4 className="text-sm font-black text-[#02025C] leading-tight mb-1 line-clamp-2">
              {product.name}
            </h4>

            {/* SKU */}
            <p className="text-[10px] font-bold text-navy/30 uppercase tracking-wider mb-2">
              {product.sku}
            </p>

            {/* Price & Stock */}
            <div className="flex items-end justify-between">
              <span className="text-base font-black text-[#02025C]">
                Rs. {product.sellingPrice.toLocaleString()}
              </span>
              {getStockBadge(product)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
