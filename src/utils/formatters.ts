export const formatCurrency = (amount: number, currency: string = 'Rs.'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount || 0);

  return `${currency} ${formatted}`;
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const cleanPhoneForWhatsApp = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.slice(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
};
