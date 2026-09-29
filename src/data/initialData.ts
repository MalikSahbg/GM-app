import {
  Company,
  Product,
  Customer,
  Sale,
  User,
  CustomerPayment,
  CompanyPayment,
  Purchase,
  BusinessSettings,
  StockAdjustment,
  CustomerOrder,
} from '../types';

export const INITIAL_USER: User | null = null;

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: '',
  tagline: '',
  logoUrl: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  currency: 'Rs.',
  invoicePrefix: 'INV-',
  pdfFooterText: 'Thank you for your business!',
  theme: 'light',
  whatsappTemplates: [
    {
      id: 'tpl-1',
      name: 'Udhaar Balance Reminder',
      type: 'UDHAAR_REMINDER',
      content: 'Assalam-o-Alaikum *{customer_name}*,\nThis is a friendly reminder from *{store_name}*. Your current outstanding Udhaar balance is *{currency} {balance}*.\nKindly arrange payment at your earliest convenience.\nFor inquiries contact: {phone}.\nThank you!',
    },
    {
      id: 'tpl-2',
      name: 'Sales Invoice Receipt',
      type: 'INVOICE',
      content: 'Assalam-o-Alaikum *{customer_name}*,\nThank you for shopping at *{store_name}*!\nInvoice ID: * [
    {
      id: 'tpl-1',
      name: 'Udhaar Balance Reminder',
      type: 'UDHAAR_REMINDER',
      content:
        'Assalam-o-Alaikum *{customer_name}*,\nThis is a reminder from *{store_name}*. Your outstanding balance is *{currency} {balance}*.\nKindly clear your dues at your earliest convenience.\nFor inquiries, contact: {phone}.\nThank you!',
    },
    {
      id: 'tpl-2',
      name: 'Sales Invoice Receipt',
      type: 'INVOICE',
      content:
        'Assalam-o-Alaikum *{customer_name}*,\nThank you for your order at *{store_name}*!\nInvoice ID: *{invoice_id}*\nTotal Amount: *{currency} {total_amount}*\nPaid: *{currency} {paid_amount}*\nRemaining Balance: *{currency} {balance}*\nThank you!',
    },
    {
      id: 'tpl-3',
      name: 'Khata Statement Summary',
      type: 'KHATA_STATEMENT',
      content:
        'Assalam-o-Alaikum *{customer_name}*,\nHere is your statement summary from *{store_name}*:\nTotal Orders/Purchases: *{currency} {total_purchased}*\nTotal Payments: *{currency}{invoice_id}*\nTotal Bill: *{currency} {total_amount}*\nAmount Paid: *{currency} {paid_amount}*\nRemaining Due: *{currency} {balance}*\nHave {total_paid}*\nNet Outstanding Balance: *{currency} {balance}*\nThank you!',
 a blessed day!',
    },
    {
      id: 'tpl-3',
      name: 'Khata Statement Summary',
      type: 'KHATA_STATEMENT',
      content: 'Assalam-o-Alaikum *{customer_name}*,\nHere is your account statement summary from *{store_name}*:\n    },
  ],
};

export const INITIAL_COMPANIES: Company[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_CUSTOMER_PAYMENTS: CustomerPayment[] = [];
export const INITIAL_COMPANY_PAYMENTS: CompanyPayment[] = [];
export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [];
export const INITIAL_CUSTOMER_ORDERS:Total Purchases: *{currency} {total_purchased}*\nTotal Payments: *{currency} {total_paid}*\nNet CustomerOrder[] = [];
``` Outstanding Balance: *{currency} {balance}*\nThank you!',
    },
  ],
};

export const INITIAL_COMPANIES
