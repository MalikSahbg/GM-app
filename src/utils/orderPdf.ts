import { BusinessSettings, CustomerOrder } from '../types';
import { formatCurrency, formatDate } from './formatters';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type OrderDocumentType = 'CUSTOMER' | 'COMPANY';

const safeFilePart = (value: string) => value.trim().replace(/[^a-z0-9_-]+/gi, '_').slice(0, 60) || 'document';

const addPdfFooter = (pdf: jsPDF) => {
  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    const height = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor(110);
    pdf.text('Powered by Noman Ali  |  Phone: 03067458074', pdf.internal.pageSize.getWidth() / 2, height - 7, { align: 'center' });
  }
};

export const createOrderPdfFile = (
  order: CustomerOrder,
  settings: BusinessSettings,
  docType: OrderDocumentType
): File => {
  const landscape = !!order.showPrice;
  const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(settings.businessName || 'Sales Manager', 14, 18, { maxWidth: pageWidth - 28 });
  pdf.setFontSize(10);
  pdf.setTextColor(70);
  pdf.text(docType === 'CUSTOMER' ? 'CUSTOMER ORDER' : 'COMPANY ORDER', 14, 25);
  pdf.text(`Order: ${order.orderNumber}   Date: ${formatDate(order.date)}`, 14, 32, { maxWidth: pageWidth - 28 });
  pdf.text(`Customer: ${order.customerName}   Phone: ${order.customerPhone || '-'}`, 14, 38, { maxWidth: pageWidth - 28 });
  if (docType === 'COMPANY') pdf.text(`Company: ${order.companyName || '-'}`, 14, 44, { maxWidth: pageWidth - 28 });

  const head = [['#', 'Product', 'Company', 'Quantity', ...(order.showPrice ? ['Rate', 'Total'] : [])]];
  const body = order.items.map((item, index) => [
    String(index + 1), item.productName, item.companyName || '-', `${item.quantity} ${item.unit || 'pcs'}`,
    ...(order.showPrice ? [formatCurrency(item.price || 0, settings.currency), formatCurrency(item.totalPrice ?? (item.price || 0) * item.quantity, settings.currency)] : []),
  ]);
  autoTable(pdf, {
    head, body,
    startY: docType === 'COMPANY' ? 50 : 44,
    margin: { left: 14, right: 14, bottom: 15 },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, overflow: 'linebreak', valign: 'middle' },
    headStyles: { fillColor: [15, 79, 68], textColor: 255 },
    columnStyles: { 0: { cellWidth: 9 }, 1: { cellWidth: 'auto' }, 3: { halign: 'center', cellWidth: 26 } },
  });
  const finalY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50;
  const footerY = Math.min(finalY + 8, pdf.internal.pageSize.getHeight() - 24);
  pdf.setFontSize(9);
  pdf.setTextColor(45);
  pdf.text(`Total products: ${order.totalProducts}   Total quantity: ${order.totalQuantity}`, 14, footerY);
  if (order.showPrice && order.totalAmount !== undefined) pdf.text(`Order total: ${formatCurrency(order.totalAmount, settings.currency)}`, 14, footerY + 6);
  if (order.notes) pdf.text(`Notes: ${order.notes}`, 14, footerY + (order.showPrice ? 12 : 6), { maxWidth: pageWidth - 28 });
  pdf.setFontSize(8);
  pdf.text(settings.pdfFooterText || 'Thank you for your order.', 14, pdf.internal.pageSize.getHeight() - 14, { maxWidth: pageWidth - 28 });
  addPdfFooter(pdf);
  const safeOrderNumber = safeFilePart(order.orderNumber);
  return new File([pdf.output('arraybuffer')], `order_${safeOrderNumber}_${docType.toLowerCase()}.pdf`, { type: 'application/pdf' });
};

export const createReportPdfFile = (
  title: string,
  subtitle: string,
  summary: { label: string; value: string }[],
  headers: string[],
  rows: (string | number)[][],
  settings: BusinessSettings,
  filePrefix: string
): File => {
  const pdf = new jsPDF({ orientation: headers.length > 5 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const width = pdf.internal.pageSize.getWidth();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(settings.businessName || 'Sales Manager', 14, 18, { maxWidth: width - 28 });
  pdf.setFontSize(13);
  pdf.text(title, 14, 27, { maxWidth: width - 28 });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(subtitle, 14, 33, { maxWidth: width - 28 });
  autoTable(pdf, {
    head: [['Summary', 'Value']],
    body: summary.map(({ label, value }) => [label, value]),
    startY: 38,
    margin: { left: 14, right: 14, bottom: 15 },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 79, 68], textColor: 255 },
    columnStyles: { 0: { cellWidth: 55 } },
  });
  const summaryY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 38;
  autoTable(pdf, {
    head: [headers],
    body: rows.map((row) => row.map(String)),
    startY: summaryY + 5,
    margin: { left: 14, right: 14, bottom: 15 },
    styles: { font: 'helvetica', fontSize: headers.length > 5 ? 7 : 8, cellPadding: 2, overflow: 'linebreak', valign: 'top' },
    headStyles: { fillColor: [15, 79, 68], textColor: 255 },
    didDrawPage: () => {
      pdf.setFontSize(9);
      pdf.setTextColor(70);
      pdf.text(settings.businessName || 'Sales Manager', 14, 10, { maxWidth: width - 28 });
    },
  });
  addPdfFooter(pdf);
  return new File([pdf.output('arraybuffer')], `${safeFilePart(filePrefix)}.pdf`, { type: 'application/pdf' });
};

const saveNativeOrderPdf = async (file: File): Promise<string> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  const result = await Filesystem.writeFile({
    path: `SalesManager/${file.name}`,
    data: btoa(binary),
    directory: Directory.Documents,
    recursive: true,
  });
  return result.uri;
};

export const downloadOrderPdf = async (file: File): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    await saveNativeOrderPdf(file);
    return;
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const shareOrderPdf = async (file: File, title: string): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const uri = await saveNativeOrderPdf(file);
    await Share.share({
      title,
      dialogTitle: 'Share order PDF',
      files: [uri],
    });
    return;
  }

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, files: [file] });
    return;
  }

  await downloadOrderPdf(file);
};
