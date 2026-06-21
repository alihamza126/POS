import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  XCircle,
  Users,
  Building,
  Calendar,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  Package,
  Activity,
  Layers,
  ArrowDownRight,
  TrendingDown,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { APP_CONFIG } from '../../../shared/constants/config';
import { useAuthStore } from '../../../stores/auth-store';
import { cn } from '../../../shared/utils';
import { useNavigate } from 'react-router-dom';
import ExpiryAlertPanel from '../../inventory/components/ExpiryAlertPanel';

interface SalesGroup {
  label: string;
  total: number;
  count: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // State parameters
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | 'month' | 'year'>('7days');
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');
  const [loading, setLoading] = useState(true);

  // Data states
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'lowStock' | 'outOfStock'>('overview');

  // Hover state for tooltip in custom SVG chart
  const [hoveredPoint, setHoveredPoint] = useState<SalesGroup | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Sales (Limit 2000 for local analytics)
      // @ts-ignore
      const salesRes = await window.api.sales.list({
        branchId: APP_CONFIG.branch.defaultId,
        limit: 2000,
      });
      setSales(salesRes?.items || []);

      // 2. Fetch Products
      // @ts-ignore
      const productsRes = await window.api.products.list({
        branchId: APP_CONFIG.branch.defaultId,
        limit: 1000,
      });
      setProducts(productsRes?.items || []);

      // 3. Fetch Customers count
      // @ts-ignore
      const customersRes = await window.api.customers.list({ limit: 1 });
      setCustomersCount(customersRes?.total || 0);

      // 4. Fetch Suppliers count
      // @ts-ignore
      const suppliersRes = await window.api.suppliers.list({ limit: 1 });
      setSuppliersCount(suppliersRes?.total || 0);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync timeframe toggle with default group settings
  useEffect(() => {
    if (timeframe === 'year') {
      setGroupBy('month');
    } else {
      setGroupBy('day');
    }
  }, [timeframe]);

  // Aggregate metrics based on active sales
  const metrics = useMemo(() => {
    const activeSales = sales.filter((s) => s.status === 'active');
    const totalRevenue = activeSales.reduce((acc, curr) => acc + (curr.payableAmount || 0), 0);
    const totalTransactions = activeSales.length;

    // Categorize inventory stock items
    let lowStockCount = 0;
    let outOfStockCount = 0;
    products.forEach((p) => {
      const stock = p.currentStock || 0;
      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= (p.reorderLevel || 10)) {
        lowStockCount++;
      }
    });

    return {
      totalRevenue,
      totalTransactions,
      lowStockCount,
      outOfStockCount,
    };
  }, [sales, products]);

  // Filter & Group Sales Data for the Graph based on sorting criteria
  const chartData = useMemo<SalesGroup[]>(() => {
    const activeSales = sales.filter((s) => s.status === 'active');
    const now = new Date();

    // 1. Filter sales within the timeframe limit
    let filteredSales = activeSales;
    const cutoffDate = new Date();

    if (timeframe === '7days') {
      cutoffDate.setDate(now.getDate() - 7);
      filteredSales = activeSales.filter((s) => new Date(s.createdAt) >= cutoffDate);
    } else if (timeframe === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
      filteredSales = activeSales.filter((s) => new Date(s.createdAt) >= cutoffDate);
    } else if (timeframe === 'month') {
      cutoffDate.setDate(1); // Beginning of month
      cutoffDate.setHours(0, 0, 0, 0);
      filteredSales = activeSales.filter((s) => new Date(s.createdAt) >= cutoffDate);
    } else if (timeframe === 'year') {
      cutoffDate.setMonth(0, 1); // Beginning of year
      cutoffDate.setHours(0, 0, 0, 0);
      filteredSales = activeSales.filter((s) => new Date(s.createdAt) >= cutoffDate);
    }

    // 2. Generate target date labels for continuous scale
    const groups: { [key: string]: { total: number; count: number } } = {};

    if (groupBy === 'day') {
      const dayCount = timeframe === '7days' ? 7 : timeframe === 'month' ? now.getDate() : 30;
      for (let i = dayCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        groups[key] = { total: 0, count: 0 };
      }

      filteredSales.forEach((sale) => {
        const dateStr = new Date(sale.createdAt).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
        });
        if (groups[dateStr] !== undefined) {
          groups[dateStr].total += sale.payableAmount || 0;
          groups[dateStr].count += 1;
        }
      });
    } else {
      // Group by Month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthLimit = timeframe === 'year' ? 12 : 6;
      const currentMonthIndex = now.getMonth();

      for (let i = monthLimit - 1; i >= 0; i--) {
        const idx = (currentMonthIndex - i + 12) % 12;
        const key = months[idx];
        groups[key] = { total: 0, count: 0 };
      }

      filteredSales.forEach((sale) => {
        const mIdx = new Date(sale.createdAt).getMonth();
        const key = months[mIdx];
        if (groups[key] !== undefined) {
          groups[key].total += sale.payableAmount || 0;
          groups[key].count += 1;
        }
      });
    }

    return Object.entries(groups).map(([label, val]) => ({
      label,
      total: val.total,
      count: val.count,
    }));
  }, [sales, timeframe, groupBy]);

  // Inventory lists for tables
  const inventoryLists = useMemo(() => {
    const outOfStock = products.filter((p) => (p.currentStock || 0) <= 0);
    const lowStock = products.filter(
      (p) => (p.currentStock || 0) > 0 && (p.currentStock || 0) <= (p.reorderLevel || 10)
    );
    return { outOfStock, lowStock };
  }, [products]);

  // Dynamic values for SVG Chart dimensions
  const maxTotal = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.total), 0);
    return maxVal === 0 ? 1000 : maxVal * 1.15; // padding top
  }, [chartData]);

  // Chart rendering properties
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const points = useMemo(() => {
    if (chartData.length === 0) return [];
    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1 || 1)) * (svgWidth - 2 * paddingX);
      const y = svgHeight - paddingY - (d.total / maxTotal) * (svgHeight - 2 * paddingY);
      return { x, y, data: d };
    });
  }, [chartData, maxTotal]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${pathD} L ${last.x} ${svgHeight - paddingY} L ${first.x} ${svgHeight - paddingY} Z`;
  }, [points, pathD]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header and Quick Sync Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-navy tracking-tight uppercase">
            {APP_CONFIG.defaults.companyName}
          </h1>
          <p className="text-text-secondary mt-1 font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            POS Terminal Active &bull; {APP_CONFIG.defaults.companyAddress} &bull; {APP_CONFIG.defaults.companyPhone}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            className="h-12 px-5 rounded-xl border border-navy/10 font-bold bg-white text-navy hover:bg-navy/5 gap-2 transition-all"
          >
            <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
            Refresh Metrics
          </Button>
          <Button
            onClick={() => navigate('/pos')}
            className="h-12 px-6 rounded-xl font-black bg-primary text-navy hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 gap-2"
          >
            <ShoppingBag size={18} />
            Launch POS Cashier
          </Button>
        </div>
      </div>

      {/* KPI Analytical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <Card className="p-5 border-none shadow-soft bg-white rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative group overflow-hidden border border-navy/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Revenue</span>
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <DollarSign size={18} className="stroke-[3px]" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-navy">Rs. {metrics.totalRevenue.toLocaleString()}</h2>
            <p className="text-xs text-text-secondary font-bold mt-1 uppercase flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              Active Sales volume
            </p>
          </div>
        </Card>

        {/* Total Sales count */}
        <Card className="p-5 border-none shadow-soft bg-white rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative group overflow-hidden border border-navy/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Transactions</span>
            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-navy">{metrics.totalTransactions.toLocaleString()}</h2>
            <p className="text-xs text-text-secondary font-bold mt-1 uppercase flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              Completed Invoices
            </p>
          </div>
        </Card>

        {/* Out of Stock Alert */}
        <Card
          onClick={() => {
            setActiveTab('outOfStock');
            const el = document.getElementById('inventory-alerts-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={cn(
            "p-5 border-none shadow-soft rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative overflow-hidden border border-navy/5 cursor-pointer",
            metrics.outOfStockCount > 0 ? "bg-red-50" : "bg-white"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Out of Stock</span>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border",
              metrics.outOfStockCount > 0
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-navy/5 text-navy border-navy/10"
            )}>
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className={cn("text-2xl font-black", metrics.outOfStockCount > 0 ? "text-red-500" : "text-navy")}>
              {metrics.outOfStockCount}
            </h2>
            <p className="text-xs text-text-secondary font-bold mt-1 uppercase">
              {metrics.outOfStockCount > 0 ? "Critical reorder items" : "Inventory fully active"}
            </p>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card
          onClick={() => {
            setActiveTab('lowStock');
            const el = document.getElementById('inventory-alerts-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={cn(
            "p-5 border-none shadow-soft rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative overflow-hidden border border-navy/5 cursor-pointer",
            metrics.lowStockCount > 0 ? "bg-amber-50" : "bg-white"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Low Stock</span>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center border",
              metrics.lowStockCount > 0
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-navy/5 text-navy border-navy/10"
            )}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className={cn("text-2xl font-black", metrics.lowStockCount > 0 ? "text-amber-600" : "text-navy")}>
              {metrics.lowStockCount}
            </h2>
            <p className="text-xs text-text-secondary font-bold mt-1 uppercase">
              {metrics.lowStockCount > 0 ? "Approaching threshold" : "All levels secure"}
            </p>
          </div>
        </Card>

        {/* Partners */}
        <Card className="p-5 border-none shadow-soft bg-white rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative group overflow-hidden border border-navy/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-navy/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-text-secondary uppercase tracking-widest">Stakeholders</span>
            <div className="w-9 h-9 bg-navy/5 rounded-xl flex items-center justify-center text-navy border border-navy/10">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-navy">
              {customersCount + suppliersCount}
            </h2>
            <p className="text-[11px] text-text-secondary font-bold mt-1 uppercase">
              {customersCount} Clients &bull; {suppliersCount} Vendors
            </p>
          </div>
        </Card>
      </div>

      {/* Expiry Alert Panel — Medical POS */}
      <ExpiryAlertPanel />

      {/* Main Analytics Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend interactive custom SVG Area/Line Chart */}
        <Card className="lg:col-span-2 p-6 border-none shadow-soft bg-white rounded-[32px] border border-navy/5 flex flex-col justify-between min-h-[380px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <Activity size={18} className="text-primary stroke-[3px]" />
                Sales & Revenue Analytics
              </h3>
              <p className="text-xs text-text-secondary font-bold">
                Date-wise & Month-wise revenue trends visual scale
              </p>
            </div>

            {/* Timeframe Sort & Group Dropdowns/Toggles */}
            <div className="flex gap-2">
              <div className="bg-background p-1.5 rounded-xl border border-navy/5 flex gap-1">
                {(['7days', '30days', 'month', 'year'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter",
                      timeframe === t
                        ? "bg-navy text-white shadow-sm"
                        : "text-text-secondary hover:text-navy hover:bg-navy/5"
                    )}
                  >
                    {t === '7days' ? '7 Days' : t === '30days' ? '30 Days' : t === 'month' ? 'This Month' : 'Yearly'}
                  </button>
                ))}
              </div>

              <div className="bg-background p-1.5 rounded-xl border border-navy/5 flex gap-1">
                {(['day', 'month'] as const).map((g) => (
                  <button
                    key={g}
                    disabled={timeframe === 'year' && g === 'day'} // enforce month on yearly
                    onClick={() => setGroupBy(g)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter",
                      groupBy === g
                        ? "bg-primary text-navy shadow-sm"
                        : "text-text-secondary hover:text-navy hover:bg-navy/5 disabled:opacity-40 disabled:pointer-events-none"
                    )}
                  >
                    {g === 'day' ? 'Daily' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative w-full h-[220px] bg-background/30 rounded-2xl border border-navy/5 overflow-hidden flex items-center justify-center px-4 py-2 mt-2">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw size={24} className="text-primary animate-spin" />
                <span className="text-xs font-black text-navy/40">Aggregating visual data...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-text-secondary py-8 text-center">
                <Activity size={32} className="opacity-20 mb-2" />
                <p className="font-bold text-navy/40">No sales recorded in this period</p>
                <p className="text-[10px]">Open the Cashier to record invoices first.</p>
              </div>
            ) : (
              <div className="w-full h-full relative">
                {/* SVG Visual Lines and Area */}
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#24D4FE" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#24D4FE" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                    const y = paddingY + r * (svgHeight - 2 * paddingY);
                    const gridVal = maxTotal * (1 - r);
                    return (
                      <g key={`grid-${idx}`} className="opacity-[0.06]">
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={svgWidth - paddingX}
                          y2={y}
                          stroke="#02025C"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 10}
                          y={y + 4}
                          className="text-[9px] font-black text-navy text-right fill-current"
                          textAnchor="end"
                        >
                          Rs. {Math.round(gridVal).toLocaleString()}
                        </text>
                      </g>
                    );
                  })}

                  {/* SVG Area fill */}
                  <path d={areaD} fill="url(#areaGrad)" className="transition-all duration-500" />

                  {/* SVG Main line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#24D4FE"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500 drop-shadow-[0_2px_8px_rgba(36,212,254,0.4)]"
                  />

                  {/* Interactive Points circles and hover highlights */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredIndex === idx;
                    return (
                      <g key={`point-${idx}`} className="cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 7.5 : 4.5}
                          fill={isHovered ? '#02025C' : '#FFFFFF'}
                          stroke={isHovered ? '#24D4FE' : '#24D4FE'}
                          strokeWidth={isHovered ? 2.5 : 2}
                          className="transition-all duration-150"
                          onMouseEnter={() => {
                            setHoveredPoint(p.data);
                            setHoveredIndex(idx);
                          }}
                          onMouseLeave={() => {
                            setHoveredPoint(null);
                            setHoveredIndex(null);
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X Axis Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[9px] font-black text-navy/40 uppercase">
                  {chartData.map((d, i) => {
                    // Reduce labels on busy charts to ensure gorgeous sizing
                    const skipLabel =
                      chartData.length > 10 && i % Math.floor(chartData.length / 5) !== 0;
                    return (
                      <span key={`lbl-${i}`} style={{ width: '40px', textAlign: 'center' }}>
                        {!skipLabel && d.label}
                      </span>
                    );
                  })}
                </div>

                {/* Custom glowing floating Tooltip portal */}
                {hoveredPoint && hoveredIndex !== null && (
                  <div
                    className="absolute bg-navy text-white text-[11px] p-3 rounded-xl shadow-lg border border-primary/20 pointer-events-none transition-all duration-150 z-50 flex flex-col gap-1 min-w-[130px]"
                    style={{
                      left: `${Math.min(
                        Math.max(
                          (hoveredIndex / (chartData.length - 1)) * 90 + 5, // percentage based layout
                          5
                        ),
                        80
                      )}%`,
                      top: `${Math.min(
                        Math.max(
                          (1 - hoveredPoint.total / maxTotal) * 100 - 30,
                          10
                        ),
                        60
                      )}%`,
                    }}
                  >
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      {hoveredPoint.label}
                    </span>
                    <span className="font-bold text-xs">
                      Sales: Rs. {Math.round(hoveredPoint.total).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      Invoices: {hoveredPoint.count} items
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Dynamic Branch Quick Shortcuts and Sync Stats */}
        <div className="flex flex-col gap-6">
          {/* Quick Shortcuts */}
          <Card className="p-6 border-none shadow-soft bg-white rounded-[32px] border border-navy/5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <Layers size={18} className="text-navy" />
                Quick Operations
              </h3>
              <p className="text-xs text-text-secondary font-bold">
                Jump to business and inventory registers
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => navigate('/pos')}
                className="p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-left group flex flex-col justify-between h-28"
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <div className="font-black text-navy text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                    Cashier POS
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary">SELL SPARE PARTS</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/inventory')}
                className="p-4 rounded-2xl bg-navy/5 border border-navy/10 hover:bg-navy/10 transition-all text-left group flex flex-col justify-between h-28"
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-navy border border-navy/10 shadow-sm">
                  <Package size={16} />
                </div>
                <div>
                  <div className="font-black text-navy text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                    Inventory
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary">STOCK REGISTERS</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/suppliers')}
                className="p-4 rounded-2xl bg-navy/5 border border-navy/10 hover:bg-navy/10 transition-all text-left group flex flex-col justify-between h-28"
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-navy border border-navy/10 shadow-sm">
                  <Building size={16} />
                </div>
                <div>
                  <div className="font-black text-navy text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                    Suppliers
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary">MANAGE KCAR & VENDORS</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/customers')}
                className="p-4 rounded-2xl bg-navy/5 border border-navy/10 hover:bg-navy/10 transition-all text-left group flex flex-col justify-between h-28"
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-navy border border-navy/10 shadow-sm">
                  <Users size={16} />
                </div>
                <div>
                  <div className="font-black text-navy text-sm flex items-center gap-1 group-hover:text-primary transition-colors">
                    Customers
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary">LEDGERS & DUES</span>
                </div>
              </button>
            </div>
          </Card>

          {/* Business identity panel */}
          <Card className="p-6 border-none shadow-soft bg-white rounded-[32px] border border-navy/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
            <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-4">Branding & Terminal details</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-navy/5 pb-2">
                <span className="text-xs text-text-secondary font-bold uppercase">POS Terminal ID</span>
                <span className="text-xs text-navy font-black">{APP_CONFIG.branch.defaultDeviceId}</span>
              </div>
              <div className="flex justify-between border-b border-navy/5 pb-2">
                <span className="text-xs text-text-secondary font-bold uppercase">Default Branch ID</span>
                <span className="text-xs text-navy font-black">{APP_CONFIG.branch.defaultId}</span>
              </div>
              <div className="flex justify-between border-b border-navy/5 pb-2">
                <span className="text-xs text-text-secondary font-bold uppercase">Invoice Prefix</span>
                <span className="text-xs text-primary font-black uppercase">{APP_CONFIG.branch.invoicePrefix}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-secondary font-bold uppercase">License Owner</span>
                <span className="text-xs text-navy font-black">{APP_CONFIG.defaults.companyName}</span>
              </div>
            </div>
            <div className="mt-6 bg-navy/[0.03] p-3.5 rounded-2xl border border-navy/5 text-center">
              <p className="text-[10px] font-black text-navy/40 uppercase tracking-wider">{APP_CONFIG.developer.footerText}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Out of Stock and Low Stock Alerts Section */}
      <div id="inventory-alerts-section" className="space-y-6">
        <div className="flex items-center justify-between border-b border-navy/5 pb-4">
          <div>
            <h3 className="text-2xl font-black text-navy tracking-tight uppercase flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} />
              Stock Alert Registers
            </h3>
            <p className="text-xs text-text-secondary font-semibold">
              Track products requiring replenishment to maintain business operations.
            </p>
          </div>

          {/* Quick Alert Filter tabs */}
          <div className="bg-white p-1 rounded-xl border border-navy/5 flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all",
                activeTab === 'overview'
                  ? "bg-navy text-white"
                  : "text-text-secondary hover:text-navy"
              )}
            >
              All Alerts ({inventoryLists.lowStock.length + inventoryLists.outOfStock.length})
            </button>
            <button
              onClick={() => setActiveTab('outOfStock')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all",
                activeTab === 'outOfStock'
                  ? "bg-red-550 bg-red-500 text-white"
                  : "text-text-secondary hover:text-red-500"
              )}
            >
              Out Of Stock ({inventoryLists.outOfStock.length})
            </button>
            <button
              onClick={() => setActiveTab('lowStock')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all",
                activeTab === 'lowStock'
                  ? "bg-amber-550 bg-amber-500 text-white animate-pulse"
                  : "text-text-secondary hover:text-amber-500"
              )}
            >
              Low Stock ({inventoryLists.lowStock.length})
            </button>
          </div>
        </div>

        {/* Display Alert Tables */}
        <Card className="p-6 border-none shadow-soft bg-white rounded-[32px] border border-navy/5">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Out of Stock summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                    <XCircle size={16} />
                    Critical Out of Stock ({inventoryLists.outOfStock.length})
                  </h4>
                  <div className="max-h-[220px] overflow-y-auto rounded-2xl border border-navy/5">
                    <Table>
                      <TableHeader className="bg-navy/[0.02] sticky top-0 z-10">
                        <TableRow className="border-navy/5">
                          <TableHead className="py-3 font-bold text-[10px] text-navy uppercase">Item / SKU</TableHead>
                          <TableHead className="py-3 font-bold text-[10px] text-navy uppercase text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryLists.outOfStock.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="py-6 text-center text-xs font-bold text-text-secondary/50">
                              No items currently out of stock
                            </TableCell>
                          </TableRow>
                        ) : (
                          inventoryLists.outOfStock.slice(0, 5).map((item) => (
                            <TableRow
                              key={item.id}
                              onClick={() => navigate(`/inventory/${item.id}`)}
                              className="border-navy/5 cursor-pointer hover:bg-red-50/40"
                            >
                              <TableCell className="py-3 font-bold text-navy text-xs">
                                <div>{item.name}</div>
                                <span className="text-[10px] text-text-secondary uppercase">{item.sku}</span>
                              </TableCell>
                              <TableCell className="py-3 text-center">
                                <span className="px-2.5 py-1 text-[9px] font-black rounded-lg bg-red-100 text-red-700 uppercase">
                                  0 Stock
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Low Stock summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    Low Stock Threshold ({inventoryLists.lowStock.length})
                  </h4>
                  <div className="max-h-[220px] overflow-y-auto rounded-2xl border border-navy/5">
                    <Table>
                      <TableHeader className="bg-navy/[0.02] sticky top-0 z-10">
                        <TableRow className="border-navy/5">
                          <TableHead className="py-3 font-bold text-[10px] text-navy uppercase">Item / SKU</TableHead>
                          <TableHead className="py-3 font-bold text-[10px] text-navy uppercase text-center">Remaining</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryLists.lowStock.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="py-6 text-center text-xs font-bold text-text-secondary/50">
                              All products secure and well-stocked
                            </TableCell>
                          </TableRow>
                        ) : (
                          inventoryLists.lowStock.slice(0, 5).map((item) => (
                            <TableRow
                              key={item.id}
                              onClick={() => navigate(`/inventory/${item.id}`)}
                              className="border-navy/5 cursor-pointer hover:bg-amber-50/40"
                            >
                              <TableCell className="py-3 font-bold text-navy text-xs">
                                <div>{item.name}</div>
                                <span className="text-[10px] text-text-secondary uppercase">{item.sku}</span>
                              </TableCell>
                              <TableCell className="py-3 text-center">
                                <span className="px-2.5 py-1 text-[9px] font-black rounded-lg bg-amber-100 text-amber-800 uppercase">
                                  {item.currentStock} / {item.reorderLevel} Left
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outOfStock' && (
            <div className="rounded-2xl border border-navy/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-red-50/50">
                  <TableRow className="border-navy/5">
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs">Product Details</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs">SKU Code</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs">Barcode</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs text-right">Selling Price</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs text-center">Current Stock</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryLists.outOfStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-text-secondary">
                          <XCircle size={36} className="mb-2 opacity-10" />
                          <p className="font-bold text-navy/40">No items out of stock</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryLists.outOfStock.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-navy/5 hover:bg-primary/[0.02] cursor-pointer"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                      >
                        <TableCell className="py-4 px-6 font-black text-navy text-sm">{item.name}</TableCell>
                        <TableCell className="py-4 px-6 text-text-secondary font-bold uppercase text-xs">{item.sku}</TableCell>
                        <TableCell className="py-4 px-6 text-text-secondary font-medium text-xs">{item.barcode || '-'}</TableCell>
                        <TableCell className="py-4 px-6 text-right font-bold text-navy text-sm">Rs. {item.sellingPrice.toLocaleString()}</TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <span className="px-3 py-1 text-[9px] font-black rounded-lg bg-red-100 text-red-600 uppercase">
                            0 Left
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-navy hover:bg-primary/10 rounded-lg text-xs font-black uppercase"
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'lowStock' && (
            <div className="rounded-2xl border border-navy/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-amber-50/50">
                  <TableRow className="border-navy/5">
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs">Product Details</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs">SKU Code</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs">Min Threshold</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs text-right">Unit cost</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs text-center">Remaining Stock</TableHead>
                    <TableHead className="py-4 px-6 font-black text-navy uppercase text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryLists.lowStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-text-secondary">
                          <AlertTriangle size={36} className="mb-2 opacity-10" />
                          <p className="font-bold text-navy/40">No items in low stock thresholds</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryLists.lowStock.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-navy/5 hover:bg-primary/[0.02] cursor-pointer"
                        onClick={() => navigate(`/inventory/${item.id}`)}
                      >
                        <TableCell className="py-4 px-6 font-black text-navy text-sm">{item.name}</TableCell>
                        <TableCell className="py-4 px-6 text-text-secondary font-bold uppercase text-xs">{item.sku}</TableCell>
                        <TableCell className="py-4 px-6 text-text-secondary font-bold text-xs">{item.reorderLevel} units</TableCell>
                        <TableCell className="py-4 px-6 text-right font-bold text-navy text-sm">Rs. {item.sellingPrice.toLocaleString()}</TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <span className="px-3 py-1 text-[9px] font-black rounded-lg bg-amber-100 text-amber-700 uppercase">
                            {item.currentStock} remaining
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-navy hover:bg-primary/10 rounded-lg text-xs font-black uppercase"
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
