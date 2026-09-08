/* ==========================================================================
   CloudAcc - Formatters & Utilities
   Currency, dates, SKU generators, calculations & string sanitizers
   ========================================================================== */

export const Formatters = {
  /**
   * Format numbers to localized currency
   * @param {number} amount
   * @param {string} currencyCode 'MXN', 'USD', 'COP', 'EUR', etc.
   */
  currency(amount, currencyCode = 'MXN') {
    const num = Number(amount) || 0;
    try {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currencyCode || 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    } catch {
      return `$${num.toFixed(2)} MXN`;
    }
  },

  /**
   * Format dates to short localized format
   */
  date(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Format date with time
   */
  dateTime(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Calculate profit margin percentage based on cost and selling price
   * Formula: ((Price - Cost) / Price) * 100
   */
  calcMargin(cost, price) {
    const c = Number(cost) || 0;
    const p = Number(price) || 0;
    if (p <= 0) return 0;
    const margin = ((p - c) / p) * 100;
    return Math.round(margin * 10) / 10;
  },

  /**
   * Calculate profit in currency
   */
  calcProfit(cost, price) {
    const c = Number(cost) || 0;
    const p = Number(price) || 0;
    return Math.max(0, p - c);
  },

  /**
   * Generate an intelligent SKU for cell accessories
   * E.g. CASE-IPH15-084
   */
  generateSKU(category = 'ACC', brand = 'GEN', model = '') {
    const catCode = (category || 'ACC').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
    const modelCode = (model || brand || 'GEN').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    return `${catCode}-${modelCode}-${rand}`;
  },

  /**
   * Safe HTML Escaping
   */
  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
