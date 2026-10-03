import React, { useState, useMemo, useEffect } from 'react';
import { CustomerOrder, OrderItem, Customer, Company, ProductWithCompany } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { createOrderPdfFile, shareOrderPdf } from '../utils/orderPdf';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Building2,
  User,
  Package,
  FileText,
  MessageCircle,
  Share2,
  Eye,
  AlertCircle,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderToDuplicate?: CustomerOrder | null;
  initialOrderToEdit?: CustomerOrder | null;
  onOrderSaved?: (order: CustomerOrder) => void;
  onOpenPdf?: (order: CustomerOrder, docType?: 'CUSTOMER' | 'COMPANY') => void;
  onOpenDetails?: (order: CustomerOrder) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderToDuplicate,
  initialOrderToEdit,
  onOrderSaved,
  onOpenPdf,
  onOpenDetails,
}) => {
  const { customers, companies, productsWithCompany, addOrder, updateOrder, settings } = useApp();

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(''); // Optional
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [sendPdfToCustomer, setSendPdfToCustomer] = useState(false);
  const [sendPdfToCompany, setSendPdfToCompany] = useState(false);
  const [notes, setNotes] = useState<string>('');

  // Selected products: array of { product, quantity }
  interface SelectedItem {
    productId: string;
    productName: string;
    companyId?: string;
    companyName?: string;
    unit: string;
    price: number;
    quantity: number;
    image?: string;
  }
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Search & picker states
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);

  const [companySearch, setCompanySearch] = useState('');
  const [isCompanyPickerOpen, setIsCompanyPickerOpen] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Post-completion state (Step 8: PDF / share options)
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);

  // Initialize or reset when modal opens or duplicate/edit changes
  useEffect(() => {
    if (isOpen) {
      setCompletedOrder(null);
      setErrorMsg(null);
      setSendPdfToCustomer(false);
      setSendPdfToCompany(false);

      if (initialOrderToEdit) {
        setSelectedCustomerId(initialOrderToEdit.customerId);
        setSelectedCompanyId(initialOrderToEdit.companyId || '');
        setShowPrice(initialOrderToEdit.showPrice !== undefined ? initialOrderToEdit.showPrice : true);
        setNotes(initialOrderToEdit.notes || '');
        setSelectedItems(
          initialOrderToEdit.items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            companyId: it.companyId,
            companyName: it.companyName,
            unit: it.unit || 'pcs',
            price: it.price || 0,
            quantity: it.quantity || 1,
            image: it.image,
          }))
        );
      } else if (initialOrderToDuplicate) {
        setSelectedCustomerId(initialOrderToDuplicate.customerId);
        setSelectedCompanyId(initialOrderToDuplicate.companyId || '');
        setShowPrice(initialOrderToDuplicate.showPrice !== undefined ? initialOrderToDuplicate.showPrice : true);
        setNotes(initialOrderToDuplicate.notes ? `Repeat Order: ${initialOrderToDuplicate.notes}` : '');
        setSelectedItems(
          initialOrderToDuplicate.items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            companyId: it.companyId,
            companyName: it.companyName,
            unit: it.unit || 'pcs',
            price: it.price || 0,
            quantity: it.quantity || 1,
            image: it.image,
          }))
        );
      } else {
        setSelectedCustomerId('');
        setSelectedCompanyId('');
        setShowPrice(true);
        setNotes('');
        setSelectedItems([]);
      }
    }
  }, [isOpen, initialOrderToDuplicate, initialOrderToEdit]);

  // Selected customer object
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Selected company object
  const selectedCompany = useMemo(
    () => (selectedCompanyId ? companies.find((c) => c.id === selectedCompanyId) : null),
    [companies, selectedCompanyId]
  );

  // Filtered customer list for picker
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, customerSearch]);

  // Filtered company list for picker
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
    );
  }, [companies, companySearch]);

  // Filtered product list for picker (optionally prioritize or filter by selected company)
  const filteredProducts = useMemo(() => {
    let list = productsWithCompany;
    if (selectedCompanyId) {
      // If company selected, highlight or filter items from that company
      list = list.filter((p) => p.companyId === selectedCompanyId);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [productsWithCompany, selectedCompanyId, productSearch]);

  // Product manipulation handlers
  const handleAddProduct = (prod: ProductWithCompany) => {
    setSelectedItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === prod.id);
      if (existingIdx >= 0) {
        // Increment quantity
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          companyId: prod.companyId,
          companyName: prod.companyName,
          unit: prod.unit || 'pcs',
          price: prod.price || 0,
          quantity: 1,
          image: prod.image,
        },
      ];
    });
    setIsProductPickerOpen(false);
    setProductSearch('');
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Order summary calculations
  const totalProducts = selectedItems.length;
  const totalQuantity = selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const grandTotal = selectedItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // Complete Order handler
  const handleCompleteOrder = () => {
    setErrorMsg(null);

    // Validation
    if (!selectedCustomerId) {
      setErrorMsg('Please select a Customer for this order.');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMsg('Please add at least one product to the order.');
      return;
    }

    const hasInvalidQty = selectedItems.some((it) => it.quantity <= 0);
    if (hasInvalidQty) {
      setErrorMsg('Please ensure all products have a quantity greater than 0.');
      return;
    }

    const orderItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      companyId: item.companyId || selectedCompanyId || '',
      companyName: item.companyName || selectedCompany?.name || '',
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity,
      image: item.image,
    }));

    if (initialOrderToEdit) {
      updateOrder(initialOrderToEdit.id, {
        customerId: selectedCustomerId,
        companyId: selectedCompanyId || null,
        companyName: selectedCompany ? selectedCompany.name : null,
        items: orderItems,
        showPrice,
        notes,
      });

      const updated = {
        ...initialOrderToEdit,
        customerId: selectedCustomerId,
        customerName: selectedCustomer?.name || 'Customer',
        customerPhone: selectedCustomer?.phone || '',
        customerAddress: selectedCustomer?.address || '',
        companyId: selectedCompanyId || null,
        companyName: selectedCompany ? selectedCompany.name : null,
        items: orderItems,
        totalProducts: orderItems.length,
        totalQuantity,
        totalAmount: grandTotal,
        showPrice,
        notes,
      };

      setCompletedOrder(updated);
      if (onOrderSaved) onOrderSaved(updated);
    } else {
      const saved = addOrder({
        customerId: selectedCustomerId,
        companyId: selectedCompanyId || null,
        items: orderItems,
        showPrice,
        notes,
      });

      setCompletedOrder(saved);
      if (onOrderSaved) onOrderSaved(saved);
    }
  };

  const handleWhatsAppSend = (target: 'CUSTOMER' | 'COMPANY') => {
    if (!completedOrder) return;
    const itemsList = completedOrder.items
      .map((it, idx) => {
        const priceStr =
          completedOrder.showPrice && it.price
            ? ` @ ${formatCurrency(it.price, settings.currency)}`
            : '';
        return `${idx + 1}. *${it.productName}* - ${it.quantity} ${it.unit || 'pcs'}${priceStr}`;
      })
      .join('\n');

    const totalStr =
      completedOrder.showPrice && completedOrder.totalAmount
        ? `\n*Grand Total:* ${formatCurrency(completedOrder.totalAmount, settings.currency)}`
        : '';

    let text = '';
    let phone = '';

    if (target === 'CUSTOMER') {
      text = `*${settings.businessName}*\n*ORDER CONFIRMATION*\n*Order #:* ${completedOrder.orderNumber}\n*Customer:* ${completedOrder.customerName}\n*Status:* ${completedOrder.status}\n\n*Ordered Items:*\n${itemsList}\n${totalStr}\n\nThank you for ordering with us!`;
      phone = (completedOrder.customerWhatsApp || completedOrder.customerPhone || '').replace(
        /[^0-9]/g,
        ''
      );
    } else {
      text = `*Order Booking for ${completedOrder.companyName}*\n*Order #:* ${completedOrder.orderNumber}\n*From:* ${settings.businessName}\n*Customer:* ${completedOrder.customerName}\n\n*Products Requested:*\n${itemsList}\n${totalStr}\n\nPlease prepare this order for supply.`;
      phone = '';
    }

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendPdf = async (target: 'CUSTOMER' | 'COMPANY') => {
    if (!completedOrder) return;
    const file = createOrderPdfFile(completedOrder, settings, target);
    try {
      await shareOrderPdf(file, `Order ${completedOrder.orderNumber}`);
    } catch {
      window.alert('The PDF was saved in Documents/SalesManager, but the share sheet could not be opened.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                {initialOrderToEdit
                  ? `Edit Order #${initialOrderToEdit.orderNumber}`
                  : initialOrderToDuplicate
                  ? `Duplicate Order #${initialOrderToDuplicate.orderNumber}`
                  : 'Create New Order'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                Book sales order for customer & optional supplier dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Post-Completion Success Screen (Point 8) */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Order Saved Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
                #{completedOrder.orderNumber}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Booked for <strong className="text-slate-900">{completedOrder.customerName}</strong>
                {completedOrder.companyName && (
                  <span> via <strong className="text-teal-700">{completedOrder.companyName}</strong></span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {completedOrder.totalProducts} Products | {completedOrder.totalQuantity} Total Units
                {completedOrder.showPrice && completedOrder.totalAmount && (
                  <span> | Grand Total: {formatCurrency(completedOrder.totalAmount, settings.currency)}</span>
                )}
              </p>
            </div>

            {/* Quick Action Options */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto space-y-2.5 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Next Actions (Optional):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onOpenDetails) onOpenDetails(completedOrder);
                    onClose();
                  }}
                  className="w-full px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  <span>View Order</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenPdf) onOpenPdf(completedOrder, 'CUSTOMER');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Generate PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleWhatsAppSend('CUSTOMER')}
                  className="w-full px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Send to Customer</span>
                </button>

                {completedOrder.companyName ? (
                  <button
                    onClick={() => handleWhatsAppSend('COMPANY')}
                    className="w-full px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Send to Company</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-200 text-slate-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                    title="No company was selected for this order"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Send to Company (N/A)</span>
                  </button>
                )}
              </div>

              {(sendPdfToCustomer || (sendPdfToCompany && completedOrder.companyName)) && (
                <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-3">
                  {sendPdfToCustomer && (
                    <button
                      type="button"
                      onClick={() => void handleSendPdf('CUSTOMER')}
                      className="w-full rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Share PDF to Customer
                    </button>
                  )}
                  {sendPdfToCompany && completedOrder.companyName && (
                    <button
                      type="button"
                      onClick={() => void handleSendPdf('COMPANY')}
                      className="w-full rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Share PDF to Company
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Create / Edit Order Form */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. CUSTOMER SELECTION (Point 2) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Customer</span>
                  <span className="text-rose-500">*</span>
                </label>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomerId('');
                      setIsCustomerPickerOpen(true);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Change Customer
                  </button>
                )}
              </div>

              {!selectedCustomer ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCustomerPickerOpen(!isCustomerPickerOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-600 hover:border-emerald-500 hover:bg-slate-50 transition-colors text-sm shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>[ Select Customer ]</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* Customer Searchable Dropdown */}
                  {isCustomerPickerOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-2">
                      <div className="relative">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search customer name, phone, address..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredCustomers.length === 0 ? (
                          <p className="p-3 text-center text-xs text-slate-400">No customers found</p>
                        ) : (
                          filteredCustomers.map((cust) => (
                            <button
                              key={cust.id}
                              type="button"
                              onClick={() => {
                                setSelectedCustomerId(cust.id);
                                setIsCustomerPickerOpen(false);
                                setCustomerSearch('');
                              }}
                              className="w-full text-left p-2.5 hover:bg-emerald-50/70 rounded-lg transition-colors flex items-center justify-between"
                            >
                              <div>
                                <p className="font-bold text-xs text-slate-900">{cust.name}</p>
                                <p className="text-[11px] text-slate-500">{cust.phone}</p>
                                {cust.address && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-xs">{cust.address}</p>
                                )}
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Customer Details Card */
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-sm text-slate-900">{selectedCustomer.name}</p>
                    <p className="text-xs text-slate-600 font-mono">Phone: {selectedCustomer.phone}</p>
                    {selectedCustomer.address && (
                      <p className="text-xs text-slate-500">Address: {selectedCustomer.address}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    Selected
                  </span>
                </div>
              )}
            </div>

            {/* 2. COMPANY SELECTION (OPTIONAL) (Point 3) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Company</span>
                  <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                {selectedCompany && (
                  <button
                    type="button"
                    onClick={() => setSelectedCompanyId('')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear Company
                  </button>
                )}
              </div>

              {!selectedCompany ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCompanyPickerOpen(!isCompanyPickerOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-600 hover:border-teal-500 hover:bg-slate-50 transition-colors text-sm shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>[ Select Company (Optional) ]</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {isCompanyPickerOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-2">
                      <div className="relative">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search company name..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCompanyId('');
                            setIsCompanyPickerOpen(false);
                          }}
                          className="w-full text-left p-2.5 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-500 italic"
                        >
                          -- None / All Companies (Optional) --
                        </button>
                        {filteredCompanies.map((comp) => (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setSelectedCompanyId(comp.id);
                              setIsCompanyPickerOpen(false);
                              setCompanySearch('');
                            }}
                            className="w-full text-left p-2.5 hover:bg-teal-50 rounded-lg transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-xs text-slate-900">{comp.name}</p>
                              {comp.contactPerson && (
                                <p className="text-[11px] text-slate-500">{comp.contactPerson}</p>
                              )}
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3 flex items-start justify-between">
                  <div>
                    <p className="font-extrabold text-sm text-slate-900">{selectedCompany.name}</p>
                    {selectedCompany.contactPhone && (
                      <p className="text-xs text-slate-600 font-mono">Tel: {selectedCompany.contactPhone}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                    Optional Selected
                  </span>
                </div>
              )}
            </div>

            {/* 3. ADD PRODUCTS (Point 4) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>Products</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Product</span>
                </button>
              </div>

              {/* Product Picker Modal / Drawer */}
              {isProductPickerOpen && (
                <div className="bg-slate-50 border border-slate-300 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">Select Products from Database</p>
                    <button
                      type="button"
                      onClick={() => setIsProductPickerOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search product name, company, category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-2xs"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-200">
                    {filteredProducts.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">No matching products found</p>
                    ) : (
                      filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-2.5 bg-white hover:bg-emerald-50/60 rounded-xl flex items-center justify-between gap-3 transition-colors my-1 border border-slate-100"
                        >
                          <div className="flex items-center gap-2.5">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-xs text-slate-900">{prod.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {prod.companyName} | {prod.unit}
                              </p>
                              <p className="text-[11px] font-semibold text-emerald-700">
                                Price: {formatCurrency(prod.price, settings.currency)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddProduct(prod)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1 shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Selected Products List */}
              {selectedItems.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                  <Package className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">No products added to this order yet</p>
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Choose Products</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-slate-900">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">Company: {item.companyName || 'Not Set'}</p>
                          {showPrice && (
                            <p className="text-xs text-emerald-700 font-semibold font-mono">
                              {formatCurrency(item.price, settings.currency)} × {item.quantity} ={' '}
                              <strong className="text-emerald-800">
                                {formatCurrency(item.price * item.quantity, settings.currency)}
                              </strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls (Point 4) */}
                      <div className="flex items-center justify-end gap-3 self-end sm:self-center">
                        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.productId,
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className="w-14 text-center py-1 text-xs font-bold text-slate-800 bg-white border-x border-slate-300 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium w-8">
                          {item.unit || 'pcs'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.productId)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. PRICE SHOW / HIDE OPTION (Point 5) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Price in Order</p>
                <p className="text-[11px] text-slate-500">
                  {showPrice
                    ? 'ON: Product rates & totals will appear in preview and PDF'
                    : 'OFF: Prices will be hidden from customer & company PDFs'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={`flex min-h-14 min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${sendPdfToCustomer ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={sendPdfToCustomer}
                  onChange={(event) => setSendPdfToCustomer(event.target.checked)}
                  className="peer sr-only"
                />
                <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 peer-focus-visible:ring-offset-2 ${sendPdfToCustomer ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${sendPdfToCustomer ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">Send PDF to Customer</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">Share after saving the order</span>
                </span>
              </label>
              <label className={`flex min-h-14 min-w-0 items-center gap-3 rounded-xl border p-3.5 transition-colors ${selectedCompany ? `cursor-pointer ${sendPdfToCompany ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-white hover:border-slate-300'}` : 'cursor-not-allowed border-slate-200 bg-slate-50'}`}>
                <input
                  type="checkbox"
                  checked={sendPdfToCompany}
                  onChange={(event) => setSendPdfToCompany(event.target.checked)}
                  disabled={!selectedCompany}
                  className="peer sr-only"
                />
                <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 peer-focus-visible:ring-offset-2 ${sendPdfToCompany ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${sendPdfToCompany ? 'translate-x-5' : 'translate-x-0'}`} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${selectedCompany ? 'text-slate-800' : 'text-slate-400'}`}>Send PDF to Company</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">{selectedCompany ? 'Share after saving the order' : 'Select a company to enable'}</span>
                </span>
              </label>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Notes / Special Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Urgent morning delivery, dispatch via XYZ cargo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 5. ORDER SUMMARY (Point 6) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-400">
                  Order Summary
                </h4>
                <span className="text-xs text-slate-300">
                  Customer: <strong>{selectedCustomer?.name || 'Not Selected'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/5 p-2.5 rounded-xl">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Company</p>
                  <p className="font-bold text-slate-100 truncate mt-0.5">
                    {selectedCompany?.name || 'Not Selected'}
                  </p>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Total Products</p>
                  <p className="font-bold text-slate-100 text-base mt-0.5">{totalProducts}</p>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Total Quantity</p>
                  <p className="font-bold text-emerald-300 text-base mt-0.5">{totalQuantity}</p>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Grand Total</p>
                  <p className="font-extrabold text-emerald-400 text-base font-mono mt-0.5">
                    {showPrice ? formatCurrency(grandTotal, settings.currency) : 'Prices Hidden'}
                  </p>
                </div>
              </div>
            </div>

            {/* 6. COMPLETE ORDER BUTTON (Point 7) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  {initialOrderToEdit ? 'Save Order Changes' : 'COMPLETE ORDER'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
