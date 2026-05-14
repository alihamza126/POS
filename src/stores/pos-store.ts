import { create } from 'zustand';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  availableStock: number;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit';

interface POSStore {
  // Cart state
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  paymentMethod: PaymentMethod;
  invoiceDiscount: number;
  taxRate: number;
  amountTendered: number;

  // Actions
  addItem: (product: {
    id: string;
    name: string;
    sellingPrice: number;
    currentStock: number;
  }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setInvoiceDiscount: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  setAmountTendered: (amount: number) => void;
  clearCart: () => void;

  // Computed helpers
  getSubtotal: () => number;
  getItemDiscountTotal: () => number;
  getTotalDiscount: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
  getChangeAmount: () => number;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  // Initial state
  items: [],
  customerId: null,
  customerName: null,
  paymentMethod: 'cash',
  invoiceDiscount: 0,
  taxRate: 0,
  amountTendered: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find(
        (item) => item.productId === product.id,
      );

      if (existing) {
        // Increment quantity if already in cart (respect stock limit)
        if (existing.quantity >= product.currentStock) return state;
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }

      // Add new item
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discount: 0,
            availableStock: product.currentStock,
          },
        ],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.productId !== productId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      };
    });
  },

  updateItemDiscount: (productId, discount) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, discount: Math.max(0, discount) }
          : item,
      ),
    }));
  },

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setInvoiceDiscount: (amount) => set({ invoiceDiscount: Math.max(0, amount) }),
  setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),
  setAmountTendered: (amount) => set({ amountTendered: Math.max(0, amount) }),

  clearCart: () =>
    set({
      items: [],
      customerId: null,
      customerName: null,
      paymentMethod: 'cash',
      invoiceDiscount: 0,
      amountTendered: 0,
    }),

  // Computed
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },

  getItemDiscountTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.discount || 0), 0);
  },

  getTotalDiscount: () => {
    const { invoiceDiscount } = get();
    return get().getItemDiscountTotal() + invoiceDiscount;
  },

  getTaxAmount: () => {
    const { taxRate } = get();
    const afterDiscount = get().getSubtotal() - get().getTotalDiscount();
    return afterDiscount * (taxRate / 100);
  },

  getGrandTotal: () => {
    const afterDiscount = get().getSubtotal() - get().getTotalDiscount();
    const total = afterDiscount + get().getTaxAmount();
    return Math.round(total * 100) / 100;
  },

  getChangeAmount: () => {
    const { amountTendered } = get();
    const grandTotal = get().getGrandTotal();
    return Math.max(0, Math.round((amountTendered - grandTotal) * 100) / 100);
  },
}));
