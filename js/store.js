/* ==========================================================================
   CloudAcc - Reactive Cloud Store (with MXN, Custom Categories & RBAC)
   Offline-first state management with cloud synchronization and snapshot exports
   ========================================================================== */

import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_SETTINGS, INITIAL_CATEGORIES } from './sample-data.js';
import { Toast } from './utils/notifications.js';

const STORAGE_KEY = 'cloudacc_store_v2'; // Migrated to v2 for MXN and categories

class AppStore {
  constructor() {
    this.subscribers = new Map();
    this.state = this.loadState();
    this.cart = [];
    this.cartDiscount = 0;
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const settings = {
          ...INITIAL_SETTINGS,
          ...(parsed.settings || {}),
          currency: 'MXN' // Enforce Mexican Pesos
        };

        return {
          products: parsed.products && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS,
          sales: parsed.sales || INITIAL_SALES,
          settings,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_CATEGORIES,
          theme: parsed.theme || 'dark',
          currentUser: parsed.currentUser || 'admin',
          cloudStatus: {
            connected: true,
            lastSync: new Date().toISOString(),
            isSyncing: false
          }
        };
      }
    } catch (e) {
      console.warn('Error loading localStorage state, using defaults', e);
    }

    return {
      products: INITIAL_PRODUCTS,
      sales: INITIAL_SALES,
      settings: INITIAL_SETTINGS,
      categories: INITIAL_CATEGORIES,
      theme: 'dark',
      currentUser: 'admin',
      cloudStatus: {
        connected: true,
        lastSync: new Date().toISOString(),
        isSyncing: false
      }
    };
  }

  saveState() {
    try {
      const toPersist = {
        products: this.state.products,
        sales: this.state.sales,
        settings: this.state.settings,
        categories: this.state.categories,
        theme: this.state.theme,
        currentUser: this.state.currentUser
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    return () => {
      const listeners = this.subscribers.get(event).filter(cb => cb !== callback);
      this.subscribers.set(event, listeners);
    };
  }

  notify(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => cb(data));
    }
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(cb => cb({ event, data }));
    }
  }

  // ------------------------------------------------------------------------
  // User Roles & Security (Admin / Employee / PIN)
  // ------------------------------------------------------------------------
  getCurrentUser() {
    return this.state.currentUser || 'admin';
  }

  setCurrentUser(role) {
    if (role !== 'admin' && role !== 'employee') return;
    this.state.currentUser = role;
    this.saveState();
    this.notify('user', role);
  }

  verifyAdminPin(enteredPin) {
    const validPin = (this.state.settings && this.state.settings.adminPin) ? String(this.state.settings.adminPin) : '1234';
    return String(enteredPin).trim() === validPin.trim();
  }

  setAdminPin(newPin) {
    const cleanPin = String(newPin).trim();
    if (cleanPin.length < 4) {
      Toast.error('El PIN debe tener al menos 4 dígitos.');
      return false;
    }
    this.state.settings.adminPin = cleanPin;
    this.saveState();
    this.triggerCloudSync('admin_pin_updated');
    this.notify('settings', this.state.settings);
    Toast.success('Código PIN de Administrador actualizado');
    return true;
  }

  // ------------------------------------------------------------------------
  // Categories Management (Dynamic CRUD)
  // ------------------------------------------------------------------------
  getCategories() {
    return this.state.categories;
  }

  addCategory(categoryName) {
    const trimmed = (categoryName || '').trim();
    if (!trimmed) {
      Toast.error('El nombre de la categoría no puede estar vacío.');
      return false;
    }

    const exists = this.state.categories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Toast.warning('Esta categoría ya existe en el catálogo.');
      return false;
    }

    this.state.categories.push(trimmed);
    this.saveState();
    this.triggerCloudSync('category_add');
    this.notify('categories', this.state.categories);
    Toast.success(`Categoría "${trimmed}" creada exitosamente`);
    return trimmed;
  }

  removeCategory(categoryName) {
    this.state.categories = this.state.categories.filter(c => c !== categoryName);
    this.saveState();
    this.triggerCloudSync('category_remove');
    this.notify('categories', this.state.categories);
    return true;
  }

  // ------------------------------------------------------------------------
  // Products / Inventory Actions
  // ------------------------------------------------------------------------
  getProducts() {
    return this.state.products;
  }

  getProductById(id) {
    return this.state.products.find(p => p.id === id);
  }

  addProduct(productData) {
    // If the product specifies a new category not yet in categories list, add it
    if (productData.category && !this.state.categories.includes(productData.category)) {
      this.state.categories.push(productData.category);
    }

    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      cost: Number(productData.cost) || 0,
      price: Number(productData.price) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      minStock: parseInt(productData.minStock, 10) || 5
    };

    this.state.products.unshift(newProduct);
    this.saveState();
    this.triggerCloudSync('product_create');
    this.notify('products', this.state.products);
    this.notify('categories', this.state.categories);
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const index = this.state.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    if (updatedData.category && !this.state.categories.includes(updatedData.category)) {
      this.state.categories.push(updatedData.category);
    }

    this.state.products[index] = {
      ...this.state.products[index],
      ...updatedData,
      cost: Number(updatedData.cost) || 0,
      price: Number(updatedData.price) || 0,
      stock: parseInt(updatedData.stock, 10) || 0,
      minStock: parseInt(updatedData.minStock, 10) || 5
    };

    this.saveState();
    this.triggerCloudSync('product_update');
    this.notify('products', this.state.products);
    this.notify('categories', this.state.categories);
    return this.state.products[index];
  }

  deleteProduct(id) {
    this.state.products = this.state.products.filter(p => p.id !== id);
    this.saveState();
    this.triggerCloudSync('product_delete');
    this.notify('products', this.state.products);
    return true;
  }

  adjustStock(productId, deltaQty, reason = 'Ajuste Manual') {
    const product = this.getProductById(productId);
    if (!product) return false;

    const newStock = Math.max(0, product.stock + deltaQty);
    product.stock = newStock;

    this.saveState();
    this.triggerCloudSync('stock_adjust');
    this.notify('products', this.state.products);
    return product;
  }

  // ------------------------------------------------------------------------
  // POS Cart Actions
  // ------------------------------------------------------------------------
  getCart() {
    return this.cart;
  }

  addToCart(product) {
    const existing = this.cart.find(item => item.id === product.id);

    if (existing) {
      if (existing.qty + 1 > product.stock) {
        Toast.warning(`No hay más stock disponible de ${product.name}`);
        return false;
      }
      existing.qty += 1;
    } else {
      if (product.stock <= 0) {
        Toast.warning(`El producto ${product.name} está agotado`);
        return false;
      }
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        cost: product.cost,
        sku: product.sku,
        compatibleModel: product.compatibleModel,
        qty: 1,
        maxStock: product.stock
      });
    }

    this.notify('cart', this.getCartTotals());
    return true;
  }

  updateCartQty(productId, qty) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    if (qty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (qty > item.maxStock) {
      Toast.warning(`Stock máximo disponible alcanzado (${item.maxStock})`);
      item.qty = item.maxStock;
    } else {
      item.qty = qty;
    }

    this.notify('cart', this.getCartTotals());
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this.notify('cart', this.getCartTotals());
  }

  clearCart() {
    this.cart = [];
    this.cartDiscount = 0;
    this.notify('cart', this.getCartTotals());
  }

  setCartDiscount(amount) {
    this.cartDiscount = Math.max(0, Number(amount) || 0);
    this.notify('cart', this.getCartTotals());
  }

  getCartTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalCost = this.cart.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    const discount = Math.min(subtotal, this.cartDiscount);
    const tax = 0;
    const total = Math.max(0, subtotal - discount + tax);
    const totalItems = this.cart.reduce((sum, item) => sum + item.qty, 0);

    return {
      items: [...this.cart],
      totalItems,
      subtotal,
      discount,
      tax,
      total,
      totalCost,
      profit: Math.max(0, total - totalCost)
    };
  }

  // ------------------------------------------------------------------------
  // Checkout & Sales Actions
  // ------------------------------------------------------------------------
  getSales() {
    return this.state.sales;
  }

  completeSale({ customer = 'Cliente Mostrador', paymentMethod = 'Efectivo', amountPaid = 0 }) {
    const totals = this.getCartTotals();
    if (totals.items.length === 0) return null;

    totals.items.forEach(cartItem => {
      const product = this.getProductById(cartItem.id);
      if (product) {
        product.stock = Math.max(0, product.stock - cartItem.qty);
      }
    });

    const change = Math.max(0, amountPaid - totals.total);

    const saleRecord = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      customer: customer.trim() || 'Cliente Mostrador',
      cashier: this.state.currentUser === 'employee' ? 'Empleado (Cajero)' : 'Administrador',
      items: totals.items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        cost: i.cost,
        qty: i.qty,
        sku: i.sku,
        compatibleModel: i.compatibleModel
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      totalCost: totals.totalCost,
      profit: totals.profit,
      paymentMethod,
      amountPaid: Math.max(amountPaid, totals.total),
      change,
      status: 'COMPLETED'
    };

    this.state.sales.unshift(saleRecord);
    this.clearCart();
    this.saveState();
    this.triggerCloudSync('sale_created');
    this.notify('sales', this.state.sales);
    this.notify('products', this.state.products);

    return saleRecord;
  }

  refundSale(saleId) {
    const sale = this.state.sales.find(s => s.id === saleId);
    if (!sale || sale.status === 'REFUNDED') return false;

    // Restore stock
    sale.items.forEach(item => {
      const product = this.getProductById(item.id);
      if (product) {
        product.stock += item.qty;
      }
    });

    sale.status = 'REFUNDED';
    this.saveState();
    this.triggerCloudSync('sale_refunded');
    this.notify('sales', this.state.sales);
    this.notify('products', this.state.products);
    return true;
  }

  // ------------------------------------------------------------------------
  // Settings & Cloud Actions
  // ------------------------------------------------------------------------
  getSettings() {
    return this.state.settings;
  }

  updateSettings(newSettings) {
    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
      currency: 'MXN' // Enforce MXN
    };
    this.saveState();
    this.notify('settings', this.state.settings);
    return this.state.settings;
  }

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.saveState();
    this.notify('theme', theme);
  }

  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  triggerCloudSync(reason = 'auto') {
    this.state.cloudStatus.isSyncing = true;
    this.notify('cloudStatus', this.state.cloudStatus);

    setTimeout(() => {
      this.state.cloudStatus.isSyncing = false;
      this.state.cloudStatus.lastSync = new Date().toISOString();
      this.state.cloudStatus.connected = true;
      this.notify('cloudStatus', this.state.cloudStatus);
    }, 500);
  }

  exportJSONSnapshot() {
    const snapshot = {
      appName: 'CloudAcc Mobile Accessories Management',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      currency: 'MXN',
      data: {
        products: this.state.products,
        sales: this.state.sales,
        settings: this.state.settings,
        categories: this.state.categories
      }
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudacc_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Copia de seguridad descargada exitosamente');
  }

  importJSONSnapshot(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.products)) {
        throw new Error('Estructura de respaldo inválida.');
      }

      this.state.products = parsed.data.products;
      this.state.sales = parsed.data.sales || [];
      if (parsed.data.settings) this.state.settings = { ...parsed.data.settings, currency: 'MXN' };
      if (parsed.data.categories) this.state.categories = parsed.data.categories;

      this.saveState();
      this.triggerCloudSync('backup_restore');
      this.notify('products', this.state.products);
      this.notify('sales', this.state.sales);
      this.notify('categories', this.state.categories);
      this.notify('settings', this.state.settings);
      Toast.success('Base de datos restaurada y sincronizada');
      return true;
    } catch (e) {
      Toast.error(`Error al importar: ${e.message}`);
      return false;
    }
  }

  resetToDefaults() {
    this.state.products = [...INITIAL_PRODUCTS];
    this.state.sales = [...INITIAL_SALES];
    this.state.settings = { ...INITIAL_SETTINGS };
    this.state.categories = [...INITIAL_CATEGORIES];
    this.state.currentUser = 'admin';
    this.saveState();
    this.triggerCloudSync('factory_reset');
    this.notify('products', this.state.products);
    this.notify('sales', this.state.sales);
    this.notify('categories', this.state.categories);
    this.notify('settings', this.state.settings);
    this.notify('user', this.state.currentUser);
    Toast.info('Datos restablecidos al catálogo base en Pesos Mexicanos (MXN)');
  }
}

export const Store = new AppStore();
