/* ==========================================================================
   CloudAcc - Main Application Router & Lifecycle
   Hash-based SPA router, event orchestration, reactive state rendering
   ========================================================================== */

import { Store } from './store.js';
import { DashboardView } from './views/dashboard.js';
import { PosView } from './views/pos.js';
import { InventoryView } from './views/inventory.js';
import { SalesView } from './views/sales.js';
import { SettingsView } from './views/settings.js';

class Application {
  constructor() {
    this.views = {
      dashboard: {
        title: 'Tablero Ejecutivo',
        subtitle: 'Resumen de ventas en vivo, ganancias y métricas del negocio',
        module: DashboardView
      },
      pos: {
        title: 'Punto de Venta (Terminal POS)',
        subtitle: 'Cobro ágil, catálogo compatible y emisión de comprobante térmico',
        module: PosView
      },
      inventory: {
        title: 'Gestión de Inventario de Accesorios',
        subtitle: 'Control de stock por modelo de celular, alertas y cálculo de margen',
        module: InventoryView
      },
      sales: {
        title: 'Historial de Ventas & Facturación',
        subtitle: 'Registro de transacciones, reimpresión de tickets y devoluciones',
        module: SalesView
      },
      settings: {
        title: 'Configuración de Nube & Negocio',
        subtitle: 'Conexión a Supabase/Firebase, respaldos y personalización de tickets',
        module: SettingsView
      }
    };

    this.currentViewId = 'dashboard';
  }

  init() {
    // Set initial theme
    const currentTheme = Store.state.theme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Setup global navigation bindings
    this.bindNavigation();
    this.bindHeaderActions();

    // Listen to route changes
    window.addEventListener('hashchange', () => this.handleRouting());

    // Subscribe to store updates for reactive badge & header updates
    Store.subscribe('*', () => {
      this.updateHeaderAndBadges();
    });

    // Initial route load
    this.handleRouting();
    this.updateHeaderAndBadges();

    // Periodic subtle cloud sync pulse simulation
    setInterval(() => {
      Store.triggerCloudSync('heartbeat');
    }, 45000);
  }

  handleRouting() {
    const hash = window.location.hash.replace('#', '').trim() || 'dashboard';
    const viewKey = this.views[hash] ? hash : 'dashboard';
    this.currentViewId = viewKey;

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(item => {
      const target = item.getAttribute('data-view');
      if (target === viewKey) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('open');

    // Update Header Text
    const meta = this.views[viewKey];
    const pageTitleEl = document.getElementById('header-title');
    const pageSubtitleEl = document.getElementById('header-subtitle');
    if (pageTitleEl) pageTitleEl.textContent = meta.title;
    if (pageSubtitleEl) pageSubtitleEl.textContent = meta.subtitle;

    // Render View
    const mainContainer = document.getElementById('view-mount');
    if (mainContainer) {
      mainContainer.innerHTML = '';
      meta.module.render(mainContainer);
    }
  }

  bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = item.getAttribute('data-view');
        window.location.hash = `#${viewName}`;
      });
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('btn-toggle-menu');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleBtn && sidebar && overlay) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      });
    }
  }

  bindHeaderActions() {
    // Theme toggle button
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const newTheme = Store.toggleTheme();
        this.updateThemeIcon(newTheme);
      });
      this.updateThemeIcon(Store.state.theme);
    }

    // Quick POS Button in Header
    const quickPosBtn = document.getElementById('btn-header-quick-pos');
    if (quickPosBtn) {
      quickPosBtn.addEventListener('click', () => {
        window.location.hash = '#pos';
      });
    }
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (!themeBtn) return;

    if (theme === 'dark') {
      themeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y1="12"/><line x1="21" y1="12" x2="23" y1="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      `;
      themeBtn.setAttribute('title', 'Cambiar a modo claro');
    } else {
      themeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      `;
      themeBtn.setAttribute('title', 'Cambiar a modo oscuro');
    }
  }

  updateHeaderAndBadges() {
    const products = Store.getProducts();
    const settings = Store.getSettings();
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    // Sidebar stock badge
    const badgeEl = document.getElementById('nav-badge-inventory');
    if (badgeEl) {
      if (lowStockCount > 0) {
        badgeEl.textContent = lowStockCount;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Store name in header pill
    const storePillName = document.getElementById('header-store-name');
    if (storePillName) {
      storePillName.textContent = settings.storeName;
    }
  }
}

// Instantiate and initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
