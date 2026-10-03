import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
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
  CustomerOrder,
  OrderItem,
  CustomerOrderStatus,
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
  INITIAL_CUSTOMER_ORDERS,
} from '../data/initialData';

export const normalizeEmail = (email: string): string => {
  return (email || '').trim().toLowerCase();
};

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  storeName: string;
  createdAt: string;
}

export interface UserDataBundle {
  user: User;
  settings: BusinessSettings;
  companies: Company[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  purchases: Purchase[];
  customerPayments: CustomerPayment[];
  companyPayments: CompanyPayment[];
  stockAdjustments: StockAdjustment[];
  orders: CustomerOrder[];
}

const STORAGE_ACCOUNTS_KEY = 'salesapp_accounts';
const STORAGE_ACTIVE_EMAIL_KEY = 'salesapp_active_email';

export const getStoredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredAccount = (account: UserAccount) => {
  try {
    const accounts = getStoredAccounts();
    const normEmail = normalizeEmail(account.email);
    const existingIdx = accounts.findIndex((a) => normalizeEmail(a.email) === normEmail);
    if (existingIdx >= 0) {
      accounts[existingIdx] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save account:', e);
  }
};

export const loadUserBundle = (email: string): UserDataBundle | null => {
  try {
    const normEmail = normalizeEmail(email);
    if (!normEmail) return null;
    const raw = localStorage.getItem(`salesapp_user_data_${normEmail}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveUserBundle = (email: string, bundle: UserDataBundle) => {
  try {
    const normEmail = normalizeEmail(email);
    if (!normEmail) return;
    localStorage.setItem(`salesapp_user_data_${normEmail}`, JSON.stringify(bundle));
  } catch (e) {
    console.error('Failed to save user bundle:', e);
  }
};

interface AppContextType {
  currentUser: User | null;
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  updateProfile: (profile: Partial<Pick<User, 'name' | 'phone' | 'profileImage'>>) => void;
  
  companies: Company[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  purchases: Purchase[];
  customerPayments: CustomerPayment[];
  companyPayments: CompanyPayment[];
  stockAdjustments: StockAdjustment[];
  orders: CustomerOrder[];
  
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
  
  // Supplier purchases
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

  // Order Management
  addOrder: (data: {
    customerId: string;
    companyId?: string | null;
    items: OrderItem[];
    showPrice?: boolean;
    notes?: string;
    date?: string;
    status?: CustomerOrderStatus;
  }) => CustomerOrder;
  updateOrder: (id: string, data: Partial<CustomerOrder>) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: CustomerOrderStatus) => void;
  duplicateOrder: (orderId: string) => CustomerOrder | null;
  
  // Backup / Restore
  resetDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Determine initial state based on active logged-in email
  const initialData = useMemo(() => {
    try {
      const activeEmail = normalizeEmail(localStorage.getItem(STORAGE_ACTIVE_EMAIL_KEY) || '');
      if (activeEmail) {
        const bundle = loadUserBundle(activeEmail);
        if (bundle) {
          return bundle;
        }
      }
    } catch (e) {
      console.error('Error loading initial active user bundle:', e);
    }
    return null;
  }, []);

  // 1. Current user
  const [currentUser, setCurrentUser] = useState<User | null>(initialData?.user || INITIAL_USER);

  // 2. Business Settings
  const [settings, setSettings] = useState<BusinessSettings>(initialData?.settings || INITIAL_SETTINGS);

  // 3. Companies
  const [companies, setCompanies] = useState<Company[]>(initialData?.companies || INITIAL_COMPANIES);

  // 4. Products
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = initialData?.products || INITIAL_PRODUCTS;
    return raw.map((p) => ({
      ...p,
      purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : Math.round(p.price * 0.78),
      unit: p.unit || 'pcs',
    }));
  });

  // 5. Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const raw = initialData?.customers || INITIAL_CUSTOMERS;
    return raw.map((c) => ({
      ...c,
      whatsapp: c.whatsapp || c.phone,
    }));
  });

  // 6. Sales
  const [sales, setSales] = useState<Sale[]>(initialData?.sales || INITIAL_SALES);

  // 7. Purchases
  const [purchases, setPurchases] = useState<Purchase[]>(initialData?.purchases || INITIAL_PURCHASES);

  // 8. Customer Payments
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(
    initialData?.customerPayments || INITIAL_CUSTOMER_PAYMENTS
  );

  // 9. Company Payments
  const [companyPayments, setCompanyPayments] = useState<CompanyPayment[]>(
    initialData?.companyPayments || INITIAL_COMPANY_PAYMENTS
  );

  // 10. Stock Adjustments
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(
    initialData?.stockAdjustments || INITIAL_ADJUSTMENTS
  );

  // 11. Customer & Company Orders
  const [orders, setOrders] = useState<CustomerOrder[]>(
    initialData?.orders || INITIAL_CUSTOMER_ORDERS
  );

  // Flag to avoid saving during initial bundle switch
  const isSwitchingAccountRef = useRef(false);

  // Auto-persist active user bundle on any state change
  useEffect(() => {
    if (isSwitchingAccountRef.current) return;
    if (currentUser && currentUser.email) {
      const normEmail = normalizeEmail(currentUser.email);
      const bundle: UserDataBundle = {
        user: currentUser,
        settings,
        companies,
        products,
        customers,
        sales,
        purchases,
        customerPayments,
        companyPayments,
        stockAdjustments,
        orders,
      };
      saveUserBundle(normEmail, bundle);
    }
  }, [
    currentUser,
    settings,
    companies,
    products,
    customers,
    sales,
    purchases,
    customerPayments,
    companyPayments,
    stockAdjustments,
    orders,
  ]);

  // Sync theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Derived: Products with Company Name
  const productsWithCompany = useMemo<ProductWithCompany[]>(() => {
    const compMap = new Map(companies.map((c) => [c.id, c.name]));
    return products.map((p) => ({
      ...p,
      companyName: compMap.get(p.companyId) || 'Unknown Company',
    }));
  }, [products, companies]);

  // Derived: Detailed Sales with Customer and Products info
  const salesDetailed = useMemo<SaleDetail[]>(() => {
    const custMap = new Map(customers.map((c) => [c.id, c]));
    const compMap = new Map(companies.map((c) => [c.id, c.name]));

    return sales
      .map((s) => {
        const cust = custMap.get(s.customerId);
        let itemsCount = 1;
        let compName = '';

        if (s.items && s.items.length > 0) {
          itemsCount = s.items.reduce((sum, it) => sum + it.quantity, 0);
          const firstComp = s.items[0].companyName;
          compName = firstComp || '';
        } else if (s.companyId) {
          compName = compMap.get(s.companyId) || '';
        }

        return {
          ...s,
          customerName: cust ? cust.name : 'Walk-in Customer',
          customerPhone: cust ? cust.phone : '',
          customerWhatsApp: cust ? cust.whatsapp : '',
          companyName: compName,
          itemsCount,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, customers, companies]);

  // Derived: Customer Balances Ledger
  const customerBalances = useMemo<CustomerBalance[]>(() => {
    return customers.map((c) => {
      const custSales = sales.filter((s) => s.customerId === c.id);
      const totalPurchased = custSales.reduce((acc, s) => acc + s.totalPrice, 0);
      const paidViaSales = custSales.reduce((acc, s) => acc + s.paidAmount, 0);
      const custDirectPayments = customerPayments.filter((p) => p.customerId === c.id);
      const totalDirectPaid = custDirectPayments.reduce((acc, p) => acc + p.amount, 0);
      const totalPaid = paidViaSales + totalDirectPaid;
      const outstandingBalance = Math.max(0, totalPurchased - totalPaid);

      const allDates = [
        ...custSales.map((s) => s.date),
        ...custDirectPayments.map((p) => p.date),
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const lastSaleDate = allDates.length > 0 ? allDates[0] : undefined;

      return {
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone,
        customerWhatsApp: c.whatsapp,
        totalPurchased,
        totalPaid,
        outstandingBalance,
        lastSaleDate,
        totalSales: custSales.length,
        status: outstandingBalance > 0 ? 'UNPAID' : 'PAID',
      };
    });
  }, [customers, sales, customerPayments]);

  // Derived: Company Balances Ledger
  const companyBalances = useMemo<CompanyBalance[]>(() => {
    return companies.map((c) => {
      const compPurchases = purchases.filter((p) => p.companyId === c.id);
      const totalPurchasedAmount = compPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
      const paidViaPurchases = compPurchases.reduce((acc, p) => acc + p.paidAmount, 0);
      const compDirectPayments = companyPayments.filter((p) => p.companyId === c.id);
      const totalDirectPaid = compDirectPayments.reduce((acc, p) => acc + p.amount, 0);
      const totalPaidAmount = paidViaPurchases + totalDirectPaid;
      const remainingPayable = Math.max(0, totalPurchasedAmount - totalPaidAmount);

      const allDates = [
        ...compPurchases.map((p) => p.date),
        ...compDirectPayments.map((p) => p.date),
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const lastPurchaseDate = allDates.length > 0 ? allDates[0] : undefined;

      return {
        companyId: c.id,
        companyName: c.name,
        contactPerson: c.contactPerson,
        contactPhone: c.contactPhone,
        totalPurchasedAmount,
        totalPaidAmount,
        remainingPayable,
        lastPurchaseDate,
        totalPurchasesCount: compPurchases.length,
        productsCount: products.filter((p) => p.companyId === c.id).length,
      };
    });
  }, [companies, purchases, companyPayments, products]);

  // Derived: Overall Business Statistics
  const stats = useMemo<DashboardStats>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter((s) => s.date.slice(0, 10) === todayStr);
    const todaySalesAmount = todaySales.reduce((acc, s) => acc + s.totalPrice, 0);
    const todaySalesCount = todaySales.length;

    const todayProfit = todaySales.reduce((acc, s) => {
      if (s.totalProfit !== undefined) return acc + s.totalProfit;
      const cost = Math.round(s.totalPrice * 0.78);
      return acc + (s.totalPrice - cost);
    }, 0);

    const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
    const totalUdhaar = customerBalances.reduce((acc, b) => acc + b.outstandingBalance, 0);
    const totalPayable = companyBalances.reduce((acc, b) => acc + b.remainingPayable, 0);
    const pendingUdhaarCustomers = customerBalances.filter((b) => b.outstandingBalance > 0).length;

    const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

    const todayOrders = orders.filter((o) => o.date && o.date.slice(0, 10) === todayStr);
    const todayOrdersCount = todayOrders.length;
    const todayOrdersQuantity = todayOrders.reduce((acc, o) => acc + o.totalQuantity, 0);
    const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
    const companiesWithPendingOrders = new Set(
      orders.filter((o) => o.status === 'Pending' && o.companyId).map((o) => o.companyId)
    ).size;

    return {
      todaySalesCount,
      todaySalesAmount,
      todayProfit,
      totalRevenue,
      totalUdhaar,
      totalPayable,
      pendingUdhaarCustomers,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalCompanies: companies.length,
      totalPurchasesAmount,
      pendingOrdersCount,
      todayOrdersCount,
      todayOrdersQuantity,
      companiesWithPendingOrders,
    };
  }, [sales, customerBalances, companyBalances, products, customers, companies, purchases, orders]);

  // Business settings update
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateProfile = (profile: Partial<Pick<User, 'name' | 'phone' | 'profileImage'>>) => {
    setCurrentUser((user) => user ? { ...user, ...profile } : user);
  };

  // Helper to load bundle into state cleanly
  const applyBundle = (bundle: UserDataBundle) => {
    isSwitchingAccountRef.current = true;
    setCurrentUser(bundle.user);
    setSettings(bundle.settings || INITIAL_SETTINGS);
    setCompanies(bundle.companies || []);
    setProducts(bundle.products || []);
    setCustomers(bundle.customers || []);
    setSales(bundle.sales || []);
    setPurchases(bundle.purchases || []);
    setCustomerPayments(bundle.customerPayments || []);
    setCompanyPayments(bundle.companyPayments || []);
    setStockAdjustments(bundle.stockAdjustments || []);
    setOrders(bundle.orders || []);
    setTimeout(() => {
      isSwitchingAccountRef.current = false;
    }, 50);
  };

  // Helper to clear state to clean empty
  const applyEmptyState = () => {
    isSwitchingAccountRef.current = true;
    setCurrentUser(null);
    setSettings(INITIAL_SETTINGS);
    setCompanies([]);
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setPurchases([]);
    setCustomerPayments([]);
    setCompanyPayments([]);
    setStockAdjustments([]);
    setOrders([]);
    setTimeout(() => {
      isSwitchingAccountRef.current = false;
    }, 50);
  };

  // Auth: Login
  const login = (email: string, _pass: string): boolean => {
    const normEmail = normalizeEmail(email);
    if (!normEmail) return false;

    // Check if user has an existing saved bundle
    const existingBundle = loadUserBundle(normEmail);
    if (existingBundle) {
      // Restore the exact previous data - DO NOT RESET
      applyBundle(existingBundle);
      localStorage.setItem(STORAGE_ACTIVE_EMAIL_KEY, normEmail);
      return true;
    }

    // Check if account registered without bundle
    const accounts = getStoredAccounts();
    const existingAcc = accounts.find((a) => normalizeEmail(a.email) === normEmail);

    const user: User = {
      id: existingAcc ? existingAcc.id : 'usr-' + Date.now(),
      name: existingAcc ? existingAcc.name : normEmail.split('@')[0] || 'Store Owner',
      email: normEmail,
      storeName: existingAcc ? existingAcc.storeName : 'My Store',
      createdAt: existingAcc ? existingAcc.createdAt : new Date().toISOString(),
    };

    const newBundle: UserDataBundle = {
      user,
      settings: {
        ...INITIAL_SETTINGS,
        businessName: user.storeName,
        email: normEmail,
      },
      companies: [],
      products: [],
      customers: [],
      sales: [],
      purchases: [],
      customerPayments: [],
      companyPayments: [],
      stockAdjustments: [],
      orders: [],
    };

    saveUserBundle(normEmail, newBundle);
    saveStoredAccount(user);
    applyBundle(newBundle);
    localStorage.setItem(STORAGE_ACTIVE_EMAIL_KEY, normEmail);
    return true;
  };

  // Auth: Signup
  const signup = (name: string, email: string, _pass: string, storeName: string): boolean => {
    const normEmail = normalizeEmail(email);
    if (!normEmail) return false;

    // If an existing bundle exists for this email, RESTORE it without resetting
    const existingBundle = loadUserBundle(normEmail);
    if (existingBundle) {
      applyBundle(existingBundle);
      localStorage.setItem(STORAGE_ACTIVE_EMAIL_KEY, normEmail);
      return true;
    }

    // Create fresh account
    const cleanStoreName = storeName.trim() || 'My Store';
    const user: User = {
      id: 'usr-' + Date.now(),
      name: name.trim() || normEmail.split('@')[0] || 'Store Owner',
      email: normEmail,
      storeName: cleanStoreName,
      createdAt: new Date().toISOString(),
    };

    const newBundle: UserDataBundle = {
      user,
      settings: {
        ...INITIAL_SETTINGS,
        businessName: cleanStoreName,
        email: normEmail,
      },
      companies: [],
      products: [],
      customers: [],
      sales: [],
      purchases: [],
      customerPayments: [],
      companyPayments: [],
      stockAdjustments: [],
      orders: [],
    };

    saveUserBundle(normEmail, newBundle);
    saveStoredAccount(user);
    applyBundle(newBundle);
    localStorage.setItem(STORAGE_ACTIVE_EMAIL_KEY, normEmail);
    return true;
  };

  // Auth: Logout
  const logout = () => {
    localStorage.removeItem(STORAGE_ACTIVE_EMAIL_KEY);
    applyEmptyState();
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

  const deleteCompany = (id: string): { success: boolean; error?: string } => {
    const associatedProducts = products.filter((p) => p.companyId === id);
    if (associatedProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete company. There are ${associatedProducts.length} products attached to this supplier.`,
      };
    }
    const associatedPurchases = purchases.filter((p) => p.companyId === id);
    if (associatedPurchases.length > 0) {
      return {
        success: false,
        error: `Cannot delete company with recorded purchase bills (${associatedPurchases.length} bills).`,
      };
    }
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  // Product operations
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
      purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : Math.round(data.price * 0.78),
      unit: data.unit || 'pcs',
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProduct = (id: string): { success: boolean; error?: string } => {
    const inSales = sales.some(
      (s) => s.productId === id || (s.items && s.items.some((it) => it.productId === id))
    );
    if (inSales) {
      return {
        success: false,
        error: 'Cannot delete product that has existing sales transactions in ledger.',
      };
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return { success: true };
  };

  // Customer operations
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: 'cust-' + Date.now(),
      createdAt: new Date().toISOString(),
      whatsapp: data.whatsapp || data.phone,
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, whatsapp: data.whatsapp || c.whatsapp } : c))
    );
  };

  const deleteCustomer = (id: string): { success: boolean; error?: string } => {
    const custSales = sales.filter((s) => s.customerId === id);
    if (custSales.length > 0) {
      return {
        success: false,
        error: `Cannot delete customer with ${custSales.length} recorded sales transactions.`,
      };
    }
    const custBalance = customerBalances.find((b) => b.customerId === id);
    if (custBalance && custBalance.outstandingBalance > 0) {
      return {
        success: false,
        error: `Customer has outstanding Udhaar balance of ${settings.currency} ${custBalance.outstandingBalance}. Settle payment first.`,
      };
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    return { success: true };
  };

  // Multi-item Sale Recording
  const recordMultiItemSale = (data: {
    customerId: string;
    items: SaleItem[];
    paidAmount: number;
    paymentMethod?: Sale['paymentMethod'];
    notes?: string;
  }): { success: boolean; error?: string; sale?: Sale } => {
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Cannot record sale with no items' };
    }

    // Ensure selected products still exist.
    for (const item of data.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product "${item.productName}" not found.` };
      }
    }

    const subtotal = data.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const totalDiscount = data.items.reduce((acc, it) => acc + (it.discount || 0), 0);
    const totalPrice = Math.max(0, subtotal - totalDiscount);
    const paidAmount = Math.max(0, Math.min(data.paidAmount, totalPrice));
    const balanceDue = Math.max(0, totalPrice - paidAmount);

    const totalProfit = data.items.reduce((acc, it) => acc + it.itemProfit, 0);

    const saleId = 'sale-' + Date.now();
    const invoiceNumber = `${settings.invoicePrefix || 'INV-'}${1000 + sales.length + 1}`;

    const newSale: Sale = {
      id: saleId,
      customerId: data.customerId,
      customerName: customer.name,
      items: data.items,
      subtotal,
      totalDiscount,
      totalPrice,
      paidAmount,
      balanceDue,
      paymentMethod: data.paymentMethod || (balanceDue === 0 ? 'Cash' : 'Udhaar'),
      totalProfit,
      invoiceNumber,
      date: new Date().toISOString(),
      notes: data.notes,
    };

    setSales((prev) => [newSale, ...prev]);
    return { success: true, sale: newSale };
  };

  // Backward compatible recordSale
  const recordSale = (
    customerIdOrData: string | { customerId: string; items: SaleItem[]; paidAmount: number; paymentMethod?: Sale['paymentMethod']; notes?: string },
    productId?: string,
    quantity: number = 1,
    paidAmount: number = 0,
    notes?: string
  ): { success: boolean; error?: string; sale?: Sale } => {
    if (typeof customerIdOrData === 'object') {
      return recordMultiItemSale(customerIdOrData);
    }

    const customerId = customerIdOrData;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };

    const itemPrice = prod.price;
    const cost = prod.purchasePrice || Math.round(prod.price * 0.78);
    const lineTotal = itemPrice * quantity;
    const itemProfit = (itemPrice - cost) * quantity;

    const singleItem: SaleItem = {
      productId: prod.id,
      productName: prod.name,
      companyName: companies.find((company) => company.id === prod.companyId)?.name,
      unit: prod.unit || 'pcs',
      purchasePrice: cost,
      unitPrice: itemPrice,
      quantity,
      discount: 0,
      totalPrice: lineTotal,
      itemProfit,
    };

    return recordMultiItemSale({
      customerId,
      items: [singleItem],
      paidAmount,
      notes,
    });
  };

  const deleteSale = (id: string) => {
    const saleToDelete = sales.find((s) => s.id === id);
    if (!saleToDelete) return;

    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Supplier purchases
  const recordPurchase = (data: {
    companyId: string;
    billNumber?: string;
    items: PurchaseItem[];
    paidAmount: number;
    paymentMethod?: Purchase['paymentMethod'];
    notes?: string;
  }): { success: boolean; error?: string; purchase?: Purchase } => {
    const company = companies.find((c) => c.id === data.companyId);
    if (!company) {
      return { success: false, error: 'Supplier company not found' };
    }
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Cannot record purchase bill with zero items' };
    }

    const totalAmount = data.items.reduce((acc, it) => acc + it.totalCost, 0);
    const paidAmount = Math.max(0, Math.min(data.paidAmount, totalAmount));
    const balancePayable = Math.max(0, totalAmount - paidAmount);

    const purchaseId = 'pur-' + Date.now();
    const newPurchase: Purchase = {
      id: purchaseId,
      companyId: data.companyId,
      companyName: company.name,
      billNumber: data.billNumber || `BILL-${Date.now().toString().slice(-6)}`,
      items: data.items,
      totalAmount,
      paidAmount,
      balancePayable,
      paymentMethod: data.paymentMethod || 'Cash',
      date: new Date().toISOString(),
      notes: data.notes,
    };

    // Keep supplier cost current without maintaining stock counts.
    setProducts((prev) => {
      const itemMap = new Map(data.items.map((it) => [it.productId, it]));
      return prev.map((p) => {
        const purItem = itemMap.get(p.id);
        if (purItem) {
          return {
            ...p,
            purchasePrice: purItem.costPrice,
          };
        }
        return p;
      });
    });

    setPurchases((prev) => [newPurchase, ...prev]);
    return { success: true, purchase: newPurchase };
  };

  const deletePurchase = (id: string) => {
    const pur = purchases.find((p) => p.id === id);
    if (!pur) return;

    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  // Payments
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
      paymentMethod: method,
      referenceNumber: ref,
      note,
      date: new Date().toISOString(),
    };
    setCustomerPayments((prev) => [newPayment, ...prev]);
  };

  const deleteCustomerPayment = (id: string) => {
    setCustomerPayments((prev) => prev.filter((p) => p.id !== id));
  };

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
      paymentMethod: method,
      referenceNumber: ref,
      note,
      date: new Date().toISOString(),
    };
    setCompanyPayments((prev) => [newPayment, ...prev]);
  };

  const deleteCompanyPayment = (id: string) => {
    setCompanyPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const recordPayment = (customerId: string, amount: number, note?: string) => {
    recordCustomerPayment(customerId, amount, 'Cash', note);
  };

  // Orders Management
  const addOrder = (data: {
    customerId: string;
    companyId?: string | null;
    items: OrderItem[];
    showPrice?: boolean;
    notes?: string;
    date?: string;
    status?: CustomerOrderStatus;
  }): CustomerOrder => {
    const cust = customers.find((c) => c.id === data.customerId);
    const comp = data.companyId ? companies.find((c) => c.id === data.companyId) : undefined;

    const totalProducts = data.items.length;
    const totalQuantity = data.items.reduce((sum, it) => sum + it.quantity, 0);
    const totalAmount = data.items.reduce((sum, it) => sum + (it.totalPrice ?? (it.price ?? 0) * it.quantity), 0);

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: CustomerOrder = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customerId: data.customerId,
      customerName: cust ? cust.name : 'Unknown Customer',
      customerPhone: cust ? cust.phone : '',
      customerWhatsApp: cust ? cust.whatsapp : '',
      companyId: data.companyId || undefined,
      companyName: comp ? comp.name : undefined,
      companyPhone: comp ? comp.contactPhone : undefined,
      items: data.items,
      totalProducts,
      totalQuantity,
      totalAmount,
      showPrice: data.showPrice !== undefined ? data.showPrice : true,
      status: data.status || 'Pending',
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: data.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id: string, data: Partial<CustomerOrder>) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, ...data };
        if (data.items) {
          updated.totalProducts = data.items.length;
          updated.totalQuantity = data.items.reduce((sum, it) => sum + it.quantity, 0);
          updated.totalAmount = data.items.reduce(
            (sum, it) => sum + (it.totalPrice ?? (it.price ?? 0) * it.quantity),
            0
          );
        }
        return updated;
      })
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOrderStatus = (id: string, status: CustomerOrderStatus) => {
    updateOrder(id, { status });
  };

  const duplicateOrder = (orderId: string): CustomerOrder | null => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) return null;

    return addOrder({
      customerId: existing.customerId,
      companyId: existing.companyId,
      items: existing.items.map((it) => ({ ...it })),
      showPrice: existing.showPrice,
      notes: existing.notes ? `(Duplicate) ${existing.notes}` : 'Duplicate order',
    });
  };

  // Clear data for current user (or globally if no user)
  const clearAllData = () => {
    setCompanies([]);
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setPurchases([]);
    setCustomerPayments([]);
    setCompanyPayments([]);
    setStockAdjustments([]);
    setOrders([]);

    if (currentUser && currentUser.email) {
      const normEmail = normalizeEmail(currentUser.email);
      const emptyBundle: UserDataBundle = {
        user: currentUser,
        settings,
        companies: [],
        products: [],
        customers: [],
        sales: [],
        purchases: [],
        customerPayments: [],
        companyPayments: [],
        stockAdjustments: [],
        orders: [],
      };
      saveUserBundle(normEmail, emptyBundle);
    }
  };

  // Replaced resetDemoData with a clean reset to empty state (no demo data)
  const resetDemoData = () => {
    clearAllData();
  };

  const exportDataJSON = (): string => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: currentUser,
      settings,
      companies,
      products,
      customers,
      sales,
      purchases,
      customerPayments,
      companyPayments,
      stockAdjustments,
      orders,
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
      if (Array.isArray(data.orders)) setOrders(data.orders);
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
        updateProfile,
        companies,
        products,
        customers,
        sales,
        purchases,
        customerPayments,
        companyPayments,
        stockAdjustments,
        orders,
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
        addOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        duplicateOrder,
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
