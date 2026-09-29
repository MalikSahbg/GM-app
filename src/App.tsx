import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { UdhaarView } from './views/UdhaarView';
import { StockView } from './views/StockView';
import { ProductView } from './views/ProductView';
import { CompanyView } from './views/CompanyView';
import { CustomerView } from './views/CustomerView';
import { SalesHistoryView } from './views/SalesHistoryView';
import { PurchasesView } from './views/PurchasesView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { OrdersView } from './views/OrdersView';
import { NewSaleModal } from './views/NewSaleModal';
import { SaleReceiptModal } from './components/SaleReceiptModal';
import { AddProductModal } from './components/AddProductModal';
import { AddCompanyModal } from './components/AddCompanyModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { AddPurchaseModal } from './components/AddPurchaseModal';
import { CustomerPaymentModal } from './components/CustomerPaymentModal';
import { CompanyPaymentModal } from './components/CompanyPaymentModal';
import { DocumentPrintModal, DocumentType } from './components/DocumentPrintModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AuthModal } from './views/AuthModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { OrderPdfModal } from './components/OrderPdfModal';
import { Sale, Customer, Company, CustomerOrder } from './types';

export const App: React.FC = () => {
  const { companies } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productToEditId, setProductToEditId] = useState<string | null>(null);

  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [purchaseCompanyId, setPurchaseCompanyId] = useState<string | undefined>(undefined);

  const [isCustomerPaymentOpen, setIsCustomerPaymentOpen] = useState(false);
  const [customerPaymentId, setCustomerPaymentId] = useState<string | undefined>(undefined);

  const [isCompanyPaymentOpen, setIsCompanyPaymentOpen] = useState(false);
  const [companyPaymentId, setCompanyPaymentId] = useState<string | undefined>(undefined);

  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppCustomerId, setWhatsAppCustomerId] = useState<string | undefined>(undefined);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Orders Modals
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [orderToDuplicate, setOrderToDuplicate] = useState<CustomerOrder | null>(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState<CustomerOrder | null>(null);
  const [activeOrderPdf, setActiveOrderPdf] = useState<{
    order: CustomerOrder;
    docType?: 'CUSTOMER' | 'COMPANY';
  } | null>(null);

  // Handlers
  const handleOpenQuickSale = () => {
    setIsSaleModalOpen(true);
  };

  const handleSaleSuccess = (sale: Sale) => {
    setActiveReceiptSale(sale);
  };

  const handleOpenCreateOrder = () => {
    setOrderToDuplicate(null);
    setIsCreateOrderOpen(true);
  };

  const handleDuplicateOrder = (order: CustomerOrder) => {
    setOrderToDuplicate(order);
    setIsCreateOrderOpen(true);
  };

  const handleOpenAddProduct = () => {
    setProductToEditId(null);
    setIsAddProductOpen(true);
  };

  const handleEditProduct = (id: string) => {
    setProductToEditId(id);
    setIsAddProductOpen(true);
  };

  const handleOpenAddCompany = () => {
    setCompanyToEdit(null);
    setIsAddCompanyOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setCompanyToEdit(company);
    setIsAddCompanyOpen(true);
  };

  const handleOpenAddCustomer = () => {
    setCustomerToEdit(null);
    setIsAddCustomerOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsAddCustomerOpen(true);
  };

  const handleOpenCustomerPayment = (customerId?: string) => {
    setCustomerPaymentId(customerId);
    setIsCustomerPaymentOpen(true);
  };

  const handleOpenCompanyPayment = (compId?: string) => {
    setCompanyPaymentId(compId);
    setIsCompanyPaymentOpen(true);
  };

  const handleOpenWhatsAppBroadcast = (customerId?: string) => {
    setWhatsAppCustomerId(customerId);
    setIsWhatsAppOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'auth') setIsAuthModalOpen(true);
          else if (tab === 'whatsapp') handleOpenWhatsAppBroadcast();
          else setCurrentTab(tab);
        }}
      />

      {/* Main Tab Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'new-sale') {
            setIsSaleModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectTab={setCurrentTab}
            onOpenQuickSale={handleOpenQuickSale}
            onOpenCreateOrder={handleOpenCreateOrder}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenAddCompany={handleOpenAddCompany}
            onOpenAddCustomer={handleOpenAddCustomer}
            onOpenRecordPayment={handleOpenCustomerPayment}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersView
            onOpenCreateOrder={handleOpenCreateOrder}
            onOpenOrderDetails={(order) => setActiveOrderDetails(order)}
            onOpenOrderPdf={(order, docType) => setActiveOrderPdf({ order, docType })}
            onDuplicateOrder={handleDuplicateOrder}
          />
        )}

        {currentTab === 'purchases' && (
          <PurchasesView
            onOpenNewPurchase={() => {
              setPurchaseCompanyId(undefined);
              setIsAddPurchaseOpen(true);
            }}
            onViewCompanyKhata={(compId) => {
              const comp = companies.find((c) => c.id === compId);
              if (comp) setActiveDocument({ type: 'COMPANY_KHATA', company: comp });
            }}
          />
        )}

        {currentTab === 'payments' && (
          <PaymentsView
            onOpenCustomerPayment={(id) => handleOpenCustomerPayment(id)}
            onOpenCompanyPayment={(id) => handleOpenCompanyPayment(id)}
          />
        )}

        {currentTab === 'udhaar' && (
          <UdhaarView
            onOpenRecordPayment={handleOpenCustomerPayment}
            onOpenQuickSale={handleOpenQuickSale}
          />
        )}

        {currentTab === 'stock' && (
          <StockView
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {currentTab === 'products' && (
          <ProductView
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
            onOpenAddCompany={handleOpenAddCompany}
          />
        )}

        {currentTab === 'companies' && (
          <CompanyView
            onOpenAddCompany={handleOpenAddCompany}
            onEditCompany={handleEditCompany}
            onOpenPurchase={(compId) => {
              setPurchaseCompanyId(compId);
              setIsAddPurchaseOpen(true);
            }}
            onOpenPayment={(compId) => handleOpenCompanyPayment(compId)}
            onViewKhata={(c) => setActiveDocument({ type: 'COMPANY_KHATA', company: c })}
          />
        )}

        {currentTab === 'customers' && (
          <CustomerView
            onOpenAddCustomer={handleOpenAddCustomer}
            onEditCustomer={handleEditCustomer}
            onOpenRecordPayment={handleOpenCustomerPayment}
            onViewKhata={(c) => setActiveDocument({ type: 'CUSTOMER_KHATA', customer: c })}
            onOpenWhatsApp={(cId) => handleOpenWhatsAppBroadcast(cId)}
          />
        )}

        {currentTab === 'sales-history' && (
          <SalesHistoryView
            onOpenQuickSale={handleOpenQuickSale}
            onViewReceipt={(sale) => setActiveDocument({ type: 'SALE_INVOICE', sale })}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            onOpenDocument={(doc) => setActiveDocument(doc)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Modals */}
      <NewSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSaleSuccess={handleSaleSuccess}
        onOpenAddCustomer={handleOpenAddCustomer}
        onOpenAddProduct={handleOpenAddProduct}
      />

      <SaleReceiptModal
        sale={activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
      />

      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => {
          setIsCreateOrderOpen(false);
          setOrderToDuplicate(null);
        }}
        initialOrderToDuplicate={orderToDuplicate}
        onOpenPdf={(order, docType) => setActiveOrderPdf({ order, docType })}
        onOpenDetails={(order) => setActiveOrderDetails(order)}
      />

      <OrderDetailsModal
        isOpen={activeOrderDetails !== null}
        order={activeOrderDetails}
        onClose={() => setActiveOrderDetails(null)}
        onOpenPdf={(order, docType) => setActiveOrderPdf({ order, docType })}
      />

      <OrderPdfModal
        isOpen={activeOrderPdf !== null}
        order={activeOrderPdf?.order || null}
        docType={activeOrderPdf?.docType || 'CUSTOMER'}
        onClose={() => setActiveOrderPdf(null)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        productIdToEdit={productToEditId}
        onClose={() => setIsAddProductOpen(false)}
        onOpenAddCompany={handleOpenAddCompany}
      />

      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        companyToEdit={companyToEdit}
        onClose={() => setIsAddCompanyOpen(false)}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        customerToEdit={customerToEdit}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <AddPurchaseModal
        isOpen={isAddPurchaseOpen}
        preselectedCompanyId={purchaseCompanyId}
        onClose={() => {
          setIsAddPurchaseOpen(false);
          setPurchaseCompanyId(undefined);
        }}
        onOpenAddCompany={handleOpenAddCompany}
        onOpenAddProduct={handleOpenAddProduct}
      />

      <CustomerPaymentModal
        isOpen={isCustomerPaymentOpen}
        preselectedCustomerId={customerPaymentId}
        onClose={() => {
          setIsCustomerPaymentOpen(false);
          setCustomerPaymentId(undefined);
        }}
      />

      <CompanyPaymentModal
        isOpen={isCompanyPaymentOpen}
        preselectedCompanyId={companyPaymentId}
        onClose={() => {
          setIsCompanyPaymentOpen(false);
          setCompanyPaymentId(undefined);
        }}
      />

      <DocumentPrintModal
        isOpen={activeDocument !== null}
        document={activeDocument}
        onClose={() => setActiveDocument(null)}
        onSendWhatsApp={(phone, text) => {
          const clean = phone.replace(/[^0-9]/g, '');
          window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
        }}
      />

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        preselectedCustomerId={whatsAppCustomerId}
        onClose={() => {
          setIsWhatsAppOpen(false);
          setWhatsAppCustomerId(undefined);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
export default App;
