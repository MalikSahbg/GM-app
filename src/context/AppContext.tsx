import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  Company,
  Product,
  Customer,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
  CustomerPayment,
  CompanyPayment,
  StockAdjustment,
  CustomerBalance,
  CompanyBalance,
  DashboardStats,
  ProductWithCompany,
  SaleDetail,
  BusinessSettings,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_SETTINGS,
  INITIAL_COMPANIES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_CUSTOMER_PAYMENTS,
  INITIAL_COMPANY_PAYMENTS,
  INITIAL_ADJUSTMENTS,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  
  companies: Company[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  purchases: Purchase[];
  customerPayments: CustomerPayment[];
  companyPayments: CompanyPayment[];
  stockAdjustments: StockAdjustment[];
  
  // Derived state
  productsWithCompany: ProductWithCompany[];
  salesDetailed: SaleDetail[];
  customerBalances: CustomerBalance[];
  companyBalances: CompanyBalance[];
  stats: DashboardStats;
  
  // Auth
  login: (email: string, pass: string) => boolean;
  signup: (name: string, email: string, pass: string, storeName: string) => boolean;
  logout: () => void;
  
  // Companies
  addCompany: (data: Omit<Company, 'id' | 'createdAt'>) => Company;
  updateCompany: (id: string, data: Partial<Omit<Company, 'id' | 'createdAt'>>) => void;
  deleteCompany: (id: string) => { success: boolean; error?: string };
  
  // Products
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => { success: boolean; error?: string };
  adjustStock: (id: string, deltaQuantity: number, reason?: string, type?: StockAdjustment['type']) => void;
  setStockQuantity: (id: string, newQuantity: number, reason?: string) => void;
  
  // Customers
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>) => void;
  deleteCustomer: (id: string) => { success: boolean; error?: string };
  
  // Sales
  recordMultiItemSale: (data: {
    customerId: string;
    items: SaleItem[];
    paidAmount: number;
    paymentMethod?: Sale['paymentMethod'];
    notes?: string;
  }) => { success: boolean; error?: string; sale?: Sale };
  
  // Legacy / Quick single-item overload
  recordSale: (
    customerIdOrData: string | { customerId: string; items: SaleItem[]; paidAmount: number; paymentMethod?: Sale['paymentMethod']; notes?: string },
    productId?: string,
    quantity?: number,
    paidAmount?: number,
    notes?: string
  ) => { success: boolean; error?: string; sale?: Sale };
  deleteSale: (id: string) => void;
  
  // Purchases (Stock incoming from companies)
  recordPurchase: (data: {
    companyId: string;
    billNumber?: string;
    items: PurchaseItem[];
    paidAmount: number;
    paymentMethod?: Purchase['paymentMethod'];
    notes?: string;
  }) => { success: boolean; error?: string; purchase?: Purchase };
  deletePurchase: (id: string) => void;
  
  // Payments
  recordCustomerPayment: (
    customerId: string,
    amount: number,
    method?: CustomerPayment['paymentMethod'],
    note?: string,
    ref?: string
  ) => void;
  deleteCustomerPayment: (id: string) => void;
  
  recordCompanyPayment: (
    companyId: string,
    amount: number,
    method?: CompanyPayment['paymentMethod'],
    note?: string,
    ref?: string
  ) => void;
  deleteCompanyPayment: (id: string) => void;
  
  // Backward compatibility alias for customer payment
  recordPayment: (customerId: string, amount: number, note?: string) => void;
  
  // Backup / Restore
  resetDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'salesapp_user',
  SETTINGS: 'salesapp_settings',
  COMPANIES: 'salesapp_companies',
  PRODUCTS: 'salesapp_products',
  CUSTOMERS: 'salesapp_customers',
  SALES: 'salesapp_sales',
  PURCHASES: 'salesapp_purchases',
  CUSTOMER_PAYMENTS: 'salesapp_cust_payments',
  COMPANY_PAYMENTS: 'salesapp_comp_payments',
  ADJUSTMENTS: 'salesapp_adjustments',
  LEGACY_PAYMENTS: 'salesapp_payments',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Current user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // 2. Business Settings
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(stored) };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 3. Companies
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      return stored ? JSON.parse(stored) : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  // 4. Products (ensure migration for purchasePrice and unit)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const parsed: Product[] = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
      return parsed.map((p) => ({
        ...p,
        purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : Math.round(p.price * 0.78),
        unit: p.unit || 'pcs',
        minStockThreshold: p.minStockThreshold !== undefined ? p.minStockThreshold : 5,
      }));
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 5. Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const parsed: Customer[] = stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
      return parsed.map((c) => ({
        ...c,
        whatsapp: c.whatsapp || c.phone,
      }));
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // 6. Sales (migrate legacy single-item sales to multi-item structure)
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SALES);
      const parsed = stored ? JSON.parse(stored) : INITIAL_SALES;
      return parsed.map((s: any, idx: number) => {
        if (!s.items || s.items.length === 0) {
          const itemPrice = s.unitPrice || (s.quantity ? s.totalPrice / s.quantity : s.totalPrice);
          const cost = Math.round(itemPrice * 0.78);
          const qty = s.quantity || 1;
          const items: SaleItem[] = [
            {
              productId: s.productId || 'legacy-item',
              productName: s.productName || 'General Merchandise',
              unit: 'pcs',
              purchasePrice: cost,
              unitPrice: itemPrice,
              quantity: qty,
              discount: 0,
              totalPrice: s.totalPrice,
              itemProfit: s.totalPrice - cost * qty,
            },
          ];
          return {
            ...s,
            invoiceNumber: s.invoiceNumber || `INV-${1000 + idx + 1}`,
            items,
            subtotal: s.totalPrice,
            totalDiscount: 0,
            paymentMethod: s.paymentMethod || (s.balanceDue === 0 ? 'Cash' : 'Udhaar'),
            totalProfit: s.totalPrice - cost * qty,
          };
        }
        return s;
      });
    } catch {
      return INITIAL_SALES;
    }
  });

  // 7. Purchases
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return stored ? JSON.parse(stored) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  // 8. Customer Payments
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PAYMENTS);
      if (stored) return JSON.parse(stored);
      // Migrate from legacy payments key if available
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PAYMENTS);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return parsed.map((p: any) => ({
          id: p.id || 'pay-' + Date.now(),
          customerId: p.customerId,
          amount: p.amount,
          date: p.date,
          paymentMethod: 'Cash',
          note: p.note,
        }));
      }
      return INITIAL_CUSTOMER_PAYMENTS;
    } catch {
      return INITIAL_CUSTOMER_PAYMENTS;
    }
  });

  // 9. Company Payments
  const [companyPayments, setCompanyPayments] = useState<CompanyPayment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPANY_PAYMENTS);
      return stored ? JSON.parse(stored) : INITIAL_COMPANY_PAYMENTS;
    } catch {
      return INITIAL_COMPANY_PAYMENTS;
    }
  });

  // 10. Stock Adjustments
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
      return stored ? JSON.parse(stored) : INITIAL_ADJUSTMENTS;
    } catch {
      return INITIAL_ADJUSTMENTS;
    }
  });

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, JSON.stringify(customerPayments));
  }, [customerPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY_PAYMENTS, JSON.stringify(companyPayments));
  }, [companyPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(stockAdjustments));
  }, [stockAdjustments]);

  // Derived: Products with Company Name
  const productsWithCompany = useMemo<ProductWithCompany[]>(() => {
    const compMap = new Map(companies.map((c) => [c.id, c.name]));
    return products.map((p) => ({
      ...p,
      companyName: compMap.get(p.companyId) || 'Unknown Company',
    }));
  }, [products, companies]);

  // Derived: Detailed Sales
  const salesDetailed = useMemo<SaleDetail[]>(() => {
    const custMap = new Map(customers.map((c) => [c.id, c]));
    const prodMap = new Map(productsWithCompany.map((p) => [p.id, p]));

    return sales
      .map((s) => {
        const cust = custMap.get(s.customerId);
        // Fallback for single item legacy display
        const firstItem = s.items?.[0];
        const prod = firstItem ? prodMap.get(firstItem.productId) : (s.productId ? prodMap.get(s.productId) : undefined);

        return {
          ...s,
          customerName: cust?.name || 'Walk-in Customer',
          customerPhone: cust?.phone || '',
          customerWhatsApp: cust?.whatsapp || cust?.phone || '',
          customerAddress: cust?.address,
          productName: s.items && s.items.length > 1
            ? `${s.items[0].productName} + ${s.items.length - 1} more items`
            : (s.items?.[0]?.productName || prod?.name || 'General Merchandise'),
          companyName: s.items?.[0]?.companyName || prod?.companyName,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, customers, productsWithCompany]);

  // Derived: Customer Balances & Khata
  const customerBalances = useMemo<CustomerBalance[]>(() => {
    return customers.map((cust) => {
      const custSales = sales.filter((s) => s.customerId === cust.id);
      const custPayments = customerPayments.filter((p) => p.customerId === cust.id);

      const totalPurchased = custSales.reduce((acc, s) => acc + s.totalPrice, 0);
      const totalPaidOnSales = custSales.reduce((acc, s) => acc + s.paidAmount, 0);
      const totalAdditionalPayments = custPayments.reduce((acc, p) => acc + p.amount, 0);
      const totalPaid = totalPaidOnSales + totalAdditionalPayments;

      const outstandingBalance = Math.max(0, totalPurchased - totalPaid);

      const sortedSales = [...custSales].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastSaleDate = sortedSales[0]?.date;

      return {
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerWhatsApp: cust.whatsapp || cust.phone,
        totalSales: custSales.length,
        totalPurchased,
        totalPaid,
        outstandingBalance,
        lastSaleDate,
        status: outstandingBalance > 0 ? 'UNPAID' : 'PAID',
      };
    });
  }, [customers, sales, customerPayments]);

  // Derived: Company Balances & Khata (Company purchases, payments, remaining payable)
  const companyBalances = useMemo<CompanyBalance[]>(() => {
    return companies.map((comp) => {
      const compPurchases = purchases.filter((p) => p.companyId === comp.id);
      const compPayments = companyPayments.filter((p) => p.companyId === comp.id);
      const compProducts = products.filter((p) => p.companyId === comp.id);

      const totalPurchasedAmount = compPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
      const paidOnPurchases = compPurchases.reduce((acc, p) => acc + p.paidAmount, 0);
      const directPayments = compPayments.reduce((acc, p) => acc + p.amount, 0);
      const totalPaidAmount = paidOnPurchases + directPayments;

      const remainingPayable = Math.max(0, totalPurchasedAmount - totalPaidAmount);

      const sortedPurchases = [...compPurchases].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastPurchaseDate = sortedPurchases[0]?.date;

      return {
        companyId: comp.id,
        companyName: comp.name,
        contactPhone: comp.contactPhone,
        totalPurchasesCount: compPurchases.length,
        totalPurchasedAmount,
        totalPaidAmount,
        remainingPayable,
        productsCount: compProducts.length,
        lastPurchaseDate,
      };
    });
  }, [companies, purchases, companyPayments, products]);

  // Derived: Dashboard Stats
  const stats = useMemo<DashboardStats>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter((s) => s.date.slice(0, 10) === todayStr);

    const todaySalesCount = todaySales.length;
    const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.totalPrice, 0);
    const todayProfit = todaySales.reduce((acc, s) => acc + (s.totalProfit || 0), 0);

    const totalRevenue =
      sales.reduce((acc, s) => acc + s.paidAmount, 0) +
      customerPayments.reduce((acc, p) => acc + p.amount, 0);

    const totalUdhaar = customerBalances.reduce((acc, b) => acc + b.outstandingBalance, 0);
    const totalPayable = companyBalances.reduce((acc, b) => acc + b.remainingPayable, 0);
    const pendingUdhaarCustomers = customerBalances.filter((b) => b.outstandingBalance > 0).length;

    const lowStockCount = products.filter(
      (p) => p.stockQuantity <= (p.minStockThreshold || 5)
    ).length;

    const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

    return {
      todaySalesCount,
      todaySalesAmount,
      todayProfit,
      totalRevenue,
      totalUdhaar,
      totalPayable,
      pendingUdhaarCustomers,
      totalProducts: products.length,
      lowStockCount,
      totalCustomers: customers.length,
      totalCompanies: companies.length,
      totalPurchasesAmount,
    };
  }, [sales, customerPayments, customerBalances, companyBalances, products, customers, companies, purchases]);

  // Business settings update
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Auth
  const login = (email: string, _pass: string) => {
    const user: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0] || 'Store Owner',
      email,
      storeName: settings.businessName || 'Malik General & Wholesale Mart',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    return true;
  };

  const signup = (name: string, email: string, _pass: string, storeName: string) => {
    const user: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      storeName: storeName || 'My Retail Store',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    if (storeName) {
      updateSettings({ businessName: storeName });
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Company operations
  const addCompany = (data: Omit<Company, 'id' | 'createdAt'>): Company => {
    const newComp: Company = {
      ...data,
      id: 'comp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newComp, ...prev]);
    return newComp;
  };

  const updateCompany = (id: string, data: Partial<Omit<Company, 'id' | 'createdAt'>>) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

  const deleteCompany = (id: string) => {
    const hasProducts = products.some((p) => p.companyId === id);
    if (hasProducts) {
      return {
        success: false,
        error: 'Cannot delete company with active catalog products. Please delete or reassign products first.',
      };
    }
    const hasPurchases = purchases.some((p) => p.companyId === id);
    if (hasPurchases) {
      return {
        success: false,
        error: 'Cannot delete company with purchase invoice history. Records must be preserved for accounting.',
      };
    }
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  // Product operations
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProd: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      minStockThreshold: data.minStockThreshold !== undefined ? data.minStockThreshold : 5,
      purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : Math.round(data.price * 0.78),
      unit: data.unit || 'pcs',
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProduct = (id: string) => {
    const hasSales = sales.some((s) =>
      s.items ? s.items.some((item) => item.productId === id) : s.productId === id
    );
    if (hasSales) {
      return {
        success: false,
        error: 'Product has past sales history. To prevent ledger inconsistency, set stock to 0 instead of deleting.',
      };
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  };

  const adjustStock = (
    id: string,
    deltaQuantity: number,
    reason: string = 'Stock Adjustment',
    type: StockAdjustment['type'] = deltaQuantity >= 0 ? 'ADD' : 'DEDUCT'
  ) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const newQty = Math.max(0, target.stockQuantity + deltaQuantity);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockQuantity: newQty } : p))
    );

    // Record adjustment entry
    const adjustment: StockAdjustment = {
      id: 'adj-' + Date.now(),
      productId: id,
      productName: target.name,
      type,
      quantity: Math.abs(deltaQuantity),
      reason,
      date: new Date().toISOString(),
    };
    setStockAdjustments((prev) => [adjustment, ...prev]);
  };

  const setStockQuantity = (id: string, newQuantity: number, reason: string = 'Manual Count Correction') => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const diff = newQuantity - target.stockQuantity;
    adjustStock(id, diff, reason, diff >= 0 ? 'ADD' : 'DEDUCT');
  };

  // Customer operations
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: 'cust-' + Date.now(),
      whatsapp: data.whatsapp || data.phone,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, whatsapp: data.whatsapp || data.phone || c.whatsapp } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    const hasSales = sales.some((s) => s.customerId === id);
    if (hasSales) {
      return {
        success: false,
        error: 'Customer has recorded sales records and Khata ledger. Deletion is blocked to preserve financial data.',
      };
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  // Professional Multi-Item Sale
  const recordMultiItemSale = ({
    customerId,
    items,
    paidAmount,
    paymentMethod = 'Cash',
    notes,
  }: {
    customerId: string;
    items: SaleItem[];
    paidAmount: number;
    paymentMethod?: Sale['paymentMethod'];
    notes?: string;
  }): { success: boolean; error?: string; sale?: Sale } => {
    if (!customerId) return { success: false, error: 'Please select a customer.' };
    if (!items || items.length === 0) return { success: false, error: 'Invoice must contain at least 1 item.' };

    // Stock verification
    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product "${item.productName}" not found.` };
      }
      if (item.quantity <= 0) {
        return { success: false, error: `Quantity for "${item.productName}" must be at least 1.` };
      }
      if (item.quantity > prod.stockQuantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}"! Available: ${prod.stockQuantity} ${prod.unit}, requested: ${item.quantity}.`,
        };
      }
    }

    const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const totalDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0);
    const totalPrice = Math.max(0, subtotal - totalDiscount);
    const cleanPaid = Math.max(0, Math.min(paidAmount, totalPrice));
    const balanceDue = totalPrice - cleanPaid;
    const totalProfit = items.reduce((acc, item) => acc + item.itemProfit, 0);

    const nextInvoiceNum = `${settings.invoicePrefix || 'INV-'}${1000 + sales.length + 1}`;

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: nextInvoiceNum,
      customerId,
      date: new Date().toISOString(),
      items,
      subtotal,
      totalDiscount,
      totalPrice,
      paidAmount: cleanPaid,
      balanceDue,
      paymentMethod,
      totalProfit,
      notes,
    };

    // 1. Deduct stock for all items
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = items.find((it) => it.productId === prod.id);
        if (soldItem) {
          return { ...prod, stockQuantity: Math.max(0, prod.stockQuantity - soldItem.quantity) };
        }
        return prod;
      })
    );

    // 2. Append sale
    setSales((prev) => [newSale, ...prev]);

    return { success: true, sale: newSale };
  };

  // Overloaded recordSale for backward compatibility with single-item callers
  const recordSale = (
    customerIdOrData: string | { customerId: string; items: SaleItem[]; paidAmount: number; paymentMethod?: Sale['paymentMethod']; notes?: string },
    productId?: string,
    quantity?: number,
    paidAmount?: number,
    notes?: string
  ): { success: boolean; error?: string; sale?: Sale } => {
    if (typeof customerIdOrData === 'object') {
      return recordMultiItemSale(customerIdOrData);
    }

    // Single item flow
    const customerId = customerIdOrData;
    if (!productId) return { success: false, error: 'Product required' };
    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };

    const qty = quantity || 1;
    const cost = prod.purchasePrice || Math.round(prod.price * 0.78);
    const itemTotal = prod.price * qty;
    const singleItem: SaleItem = {
      productId: prod.id,
      productName: prod.name,
      companyName: companies.find((c) => c.id === prod.companyId)?.name,
      unit: prod.unit || 'pcs',
      image: prod.image,
      purchasePrice: cost,
      unitPrice: prod.price,
      quantity: qty,
      discount: 0,
      totalPrice: itemTotal,
      itemProfit: itemTotal - cost * qty,
    };

    return recordMultiItemSale({
      customerId,
      items: [singleItem],
      paidAmount: paidAmount !== undefined ? paidAmount : itemTotal,
      paymentMethod: (paidAmount !== undefined && paidAmount < itemTotal) ? 'Udhaar' : 'Cash',
      notes,
    });
  };

  const deleteSale = (id: string) => {
    const saleToDelete = sales.find((s) => s.id === id);
    if (saleToDelete) {
      // Revert product stock
      if (saleToDelete.items && saleToDelete.items.length > 0) {
        saleToDelete.items.forEach((it) => {
          adjustStock(it.productId, it.quantity, `Void Sale ${saleToDelete.invoiceNumber || saleToDelete.id}`, 'ADD');
        });
      } else if (saleToDelete.productId && saleToDelete.quantity) {
        adjustStock(saleToDelete.productId, saleToDelete.quantity, 'Void Sale', 'ADD');
      }
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Purchase System (Incoming goods from companies)
  const recordPurchase = ({
    companyId,
    billNumber,
    items,
    paidAmount,
    paymentMethod = 'Bank Transfer',
    notes,
  }: {
    companyId: string;
    billNumber?: string;
    items: PurchaseItem[];
    paidAmount: number;
    paymentMethod?: Purchase['paymentMethod'];
    notes?: string;
  }): { success: boolean; error?: string; purchase?: Purchase } => {
    if (!companyId) return { success: false, error: 'Please select a supplier company.' };
    if (!items || items.length === 0) return { success: false, error: 'Purchase must contain at least 1 item.' };

    const company = companies.find((c) => c.id === companyId);
    const totalAmount = items.reduce((acc, it) => acc + it.totalCost, 0);
    const cleanPaid = Math.max(0, Math.min(paidAmount, totalAmount));
    const balancePayable = totalAmount - cleanPaid;

    const newPurchase: Purchase = {
      id: 'pur-' + Date.now(),
      companyId,
      companyName: company?.name || 'Company Supplier',
      billNumber: billNumber || `BILL-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      items,
      totalAmount,
      paidAmount: cleanPaid,
      balancePayable,
      paymentMethod,
      notes,
    };

    // 1. Increase stock for each purchased product & update purchasePrice
    setProducts((prev) =>
      prev.map((prod) => {
        const item = items.find((it) => it.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stockQuantity: prod.stockQuantity + item.quantity,
            purchasePrice: item.costPrice > 0 ? item.costPrice : prod.purchasePrice,
          };
        }
        return prod;
      })
    );

    // 2. Add purchase record
    setPurchases((prev) => [newPurchase, ...prev]);

    return { success: true, purchase: newPurchase };
  };

  const deletePurchase = (id: string) => {
    const pur = purchases.find((p) => p.id === id);
    if (pur) {
      // Revert product stock
      pur.items.forEach((it) => {
        adjustStock(it.productId, -it.quantity, `Void Purchase Bill ${pur.billNumber || pur.id}`, 'DEDUCT');
      });
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Payments: Customer
  const recordCustomerPayment = (
    customerId: string,
    amount: number,
    method: CustomerPayment['paymentMethod'] = 'Cash',
    note?: string,
    ref?: string
  ) => {
    if (amount <= 0) return;
    const newPayment: CustomerPayment = {
      id: 'pay-' + Date.now(),
      customerId,
      amount,
      date: new Date().toISOString(),
      paymentMethod: method,
      referenceNumber: ref,
      note,
    };
    setCustomerPayments((prev) => [newPayment, ...prev]);
  };

  const deleteCustomerPayment = (id: string) => {
    setCustomerPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Backward compatibility alias
  const recordPayment = (customerId: string, amount: number, note?: string) => {
    recordCustomerPayment(customerId, amount, 'Cash', note);
  };

  // Payments: Company (Suppliers)
  const recordCompanyPayment = (
    companyId: string,
    amount: number,
    method: CompanyPayment['paymentMethod'] = 'Bank Transfer',
    note?: string,
    ref?: string
  ) => {
    if (amount <= 0) return;
    const newPayment: CompanyPayment = {
      id: 'cpay-' + Date.now(),
      companyId,
      amount,
      date: new Date().toISOString(),
      paymentMethod: method,
      referenceNumber: ref,
      note,
    };
    setCompanyPayments((prev) => [newPayment, ...prev]);
  };

  const deleteCompanyPayment = (id: string) => {
    setCompanyPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Backup & Restore
  const resetDemoData = () => {
    setCurrentUser(INITIAL_USER);
    setSettings(INITIAL_SETTINGS);
    setCompanies(INITIAL_COMPANIES);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setCustomerPayments(INITIAL_CUSTOMER_PAYMENTS);
    setCompanyPayments(INITIAL_COMPANY_PAYMENTS);
    setStockAdjustments([]);
    localStorage.clear();
  };

  const clearAllData = () => {
    setCompanies([]);
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setPurchases([]);
    setCustomerPayments([]);
    setCompanyPayments([]);
    setStockAdjustments([]);
  };

  const exportDataJSON = (): string => {
    const data = {
      exportedAt: new Date().toISOString(),
      settings,
      companies,
      products,
      customers,
      sales,
      purchases,
      customerPayments,
      companyPayments,
      stockAdjustments,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.companies)) setCompanies(data.companies);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.customers)) setCustomers(data.customers);
      if (Array.isArray(data.sales)) setSales(data.sales);
      if (Array.isArray(data.purchases)) setPurchases(data.purchases);
      if (Array.isArray(data.customerPayments)) setCustomerPayments(data.customerPayments);
      if (Array.isArray(data.companyPayments)) setCompanyPayments(data.companyPayments);
      if (Array.isArray(data.stockAdjustments)) setStockAdjustments(data.stockAdjustments);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON format' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        settings,
        updateSettings,
        companies,
        products,
        customers,
        sales,
        purchases,
        customerPayments,
        companyPayments,
        stockAdjustments,
        productsWithCompany,
        salesDetailed,
        customerBalances,
        companyBalances,
        stats,
        login,
        signup,
        logout,
        addCompany,
        updateCompany,
        deleteCompany,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        setStockQuantity,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordMultiItemSale,
        recordSale,
        deleteSale,
        recordPurchase,
        deletePurchase,
        recordCustomerPayment,
        deleteCustomerPayment,
        recordCompanyPayment,
        deleteCompanyPayment,
        recordPayment,
        resetDemoData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
