export interface User {
  id: string;
  name: string;
  email: string;
  storeName?: string;
  role?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  contactPerson?: string;
  ntn?: string;
  bankDetails?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  companyId: string;
  purchasePrice: number; // Cost price to calculate profit
  price: number; // Sale price
  stockQuantity: number;
  minStockThreshold: number; // Default 5 for low stock badge
  category?: string;
  sku?: string; // Barcode / SKU
  unit: string; // pcs, kg, litre, box, packet, etc.
  image?: string; // Base64 or image URL
  createdAt: string;
}

export interface ProductWithCompany extends Product {
  companyName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  email?: string;
  creditLimit?: number;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  companyName?: string;
  unit: string;
  image?: string;
  purchasePrice: number; // Snapshot of cost at sale time
  unitPrice: number; // Snapshot of sale price
  quantity: number;
  discount: number; // Discount amount on line item
  totalPrice: number; // (unitPrice * quantity) - discount
  itemProfit: number; // totalPrice - (purchasePrice * quantity)
}

export interface Sale {
  id: string;
  invoiceNumber?: string;
  customerId: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  totalDiscount: number;
  totalPrice: number; // Grand total after discount
  paidAmount: number;
  balanceDue: number; // totalPrice - paidAmount
  paymentMethod: 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cheque' | 'Udhaar';
  totalProfit: number; // Profit computed from cost snapshot
  notes?: string;
  // Backward compatibility fields for legacy single-item sales
  productId?: string;
  productName?: string;
  companyName?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface SaleDetail extends Sale {
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  customerAddress?: string;
  productName?: string; // Legacy fallback
  companyName?: string; // Legacy fallback
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit: string;
  costPrice: number;
  quantity: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  companyId: string;
  companyName: string;
  billNumber?: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balancePayable: number; // totalAmount - paidAmount
  paymentMethod: 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cheque' | 'Credit';
  notes?: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cheque';
  referenceNumber?: string;
  note?: string;
}

export interface CompanyPayment {
  id: string;
  companyId: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cheque';
  referenceNumber?: string;
  note?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'ADD' | 'DEDUCT' | 'RETURN' | 'DAMAGE';
  quantity: number;
  reason: string;
  date: string;
}

export interface CustomerBalance {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  totalSales: number;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number; // positive = customer owes money (Receivable/Udhaar)
  lastSaleDate?: string;
  status: 'UNPAID' | 'PAID';
}

export interface CompanyBalance {
  companyId: string;
  companyName: string;
  contactPhone?: string;
  totalPurchasesCount: number;
  totalPurchasedAmount: number;
  totalPaidAmount: number;
  remainingPayable: number; // positive = we owe company (Payable)
  productsCount: number;
  lastPurchaseDate?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  type: 'INVOICE' | 'UDHAAR_REMINDER' | 'KHATA_STATEMENT' | 'GENERAL';
  content: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  invoicePrefix: string;
  pdfFooterText: string;
  theme: 'light' | 'dark';
  whatsappTemplates: WhatsAppTemplate[];
}

export interface DashboardStats {
  todaySalesCount: number;
  todaySalesAmount: number;
  todayProfit: number;
  totalRevenue: number;
  totalUdhaar: number; // Total Receivable
  totalPayable: number; // Total Payable to Companies
  pendingUdhaarCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  totalCompanies: number;
  totalPurchasesAmount: number;
  // Field Sales & Orders metrics
  pendingOrdersCount?: number;
  todayOrdersCount?: number;
  todayOrdersQuantity?: number;
  companiesWithPendingOrders?: number;
}

export type CustomerOrderStatus =
  | 'Pending'
  | 'Sent to Company'
  | 'Confirmed'
  | 'Processing'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export type CompanyOrderStatus =
  | 'Pending'
  | 'Sent to Company'
  | 'Confirmed'
  | 'Processing'
  | 'Dispatched'
  | 'Completed'
  | 'Partially Supplied';

export interface OrderItem {
  productId: string;
  productName: string;
  companyId: string;
  companyName: string;
  unit: string;
  quantity: number;
  price?: number;
  totalPrice?: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string; // e.g. ORD-000001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  customerAddress?: string;
  date: string;
  salesRepName: string;
  items: OrderItem[];
  totalProducts: number;
  totalQuantity: number;
  totalAmount?: number;
  status: CustomerOrderStatus;
  notes?: string;
  createdAt: string;
}

export interface CompanyOrderItemBreakdown {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  unit: string;
  date: string;
  status: CustomerOrderStatus;
}

export interface CompanyConsolidatedProduct {
  productId: string;
  productName: string;
  unit: string;
  totalQuantity: number;
  customerBreakdown: CompanyOrderItemBreakdown[];
}

export interface CompanyConsolidatedOrder {
  companyId: string;
  companyName: string;
  companyPhone?: string;
  companyEmail?: string;
  orderNumber: string; // e.g. CO-000001
  orderDate: string;
  status: CompanyOrderStatus;
  totalCustomers: number;
  totalProducts: number;
  totalQuantity: number;
  products: CompanyConsolidatedProduct[];
  customerOrders: {
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    date: string;
    status: CustomerOrderStatus;
    items: {
      productId: string;
      productName: string;
      unit: string;
      quantity: number;
    }[];
  }[];
}

