import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Clock,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import CartPanel from '../components/CartPanel';
import { usePOSStore } from '../../../stores/pos-store';
import { useAuthStore } from '../../../stores/auth-store';

export default function POSPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items } = usePOSStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dailySummary, setDailySummary] = useState({
    totalSales: 0,
    invoiceCount: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchRef = useRef<HTMLInputElement>(null);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Auto-focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch categories
  useEffect(() => {
    const loadCats = async () => {
      try {
        // @ts-ignore
        const cats = await window.api.categories.list('main-branch');
        setCategoryList(cats || []);
      } catch {
        // silently fail
      }
    };
    loadCats();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      // @ts-ignore
      const result = await window.api.products.list({
        branchId: 'main-branch',
        query: searchQuery || undefined,
        limit: 100,
      });
      setProducts(result.items || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 200);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  // Filter products by selected category (client-side)
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.categoryId === selectedCategory);
  }, [products, selectedCategory]);

  // Fetch daily summary
  const fetchDailySummary = useCallback(async () => {
    try {
      // @ts-ignore
      const summary = await window.api.sales.getDailySummary('main-branch');
      setDailySummary(summary);
    } catch {
      // Silently fail — status bar is non-critical
    }
  }, []);

  useEffect(() => {
    fetchDailySummary();
  }, [fetchDailySummary]);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-screen bg-[#F1EFF9] overflow-hidden">
      {/* Top Bar */}
      <header className="bg-[#02025C] text-white px-6 py-3 flex items-center gap-4 shrink-0 shadow-xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Exit POS
        </button>

        <div className="flex-1 max-w-2xl mx-auto relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#24D4FE] focus:bg-white/15 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-6 text-white/50 text-xs font-bold shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-[#24D4FE]" />
            <span>{dailySummary.invoiceCount} invoices</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-400" />
            <span>Rs. {dailySummary.totalSales.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>
              {currentTime.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg">
            {user?.username || 'Cashier'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Product Grid (left) */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Category Tabs */}
          {categoryList.length > 0 && (
            <div className="flex items-center gap-2 px-5 pt-4 pb-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  selectedCategory === null
                    ? 'bg-[#24D4FE] text-white shadow-md'
                    : 'bg-white/60 text-navy/50 hover:bg-white'
                }`}
              >
                All
              </button>
              {categoryList.map((cat: any) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#24D4FE] text-white shadow-md'
                      : 'bg-white/60 text-navy/50 hover:bg-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-5 pt-2">
            <ProductGrid
              products={filteredProducts}
              loading={loadingProducts}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* Cart Panel (right) */}
        <div className="w-[440px] shrink-0 border-l border-navy/10 bg-white shadow-2xl flex flex-col">
          <CartPanel
            onSaleComplete={() => {
              fetchProducts();
              fetchDailySummary();
            }}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="bg-white border-t border-navy/10 px-6 py-2 flex items-center justify-between text-xs font-bold text-navy/40 shrink-0">
        <span>
          Cart: {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
        </span>
        <span>Offline-First POS • All data saved locally</span>
        <span>
          {currentTime.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </footer>
    </div>
  );
}
