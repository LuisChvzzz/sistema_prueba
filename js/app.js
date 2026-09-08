/* ==========================================================================
   CloudAcc - Main Application Router & Lifecycle
   Hash-based SPA router, Role-Based Navigation Guards, PIN Security Pad
   ========================================================================== */

import { Store } from './store.js';
import { Toast } from './utils/notifications.js';
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
        subtitle: 'Resumen de ventas en vivo, ganancias y métricas del negocio ($ MXN)',
        module: DashboardView,
        restricted: true
      },
      pos: {
        title: 'Punto de Venta (Terminal POS)',
        subtitle: 'Cobro ágil, catálogo compatible y emisión de comprobante térmico',
        module: PosView,
        restricted: false // Employee accessible
      },
      inventory: {
        title: 'Gestión de Inventario de Accesorios',
        subtitle: 'Control de stock por modelo de celular, categorías y cálculo de margen',
        module: InventoryView,
        restricted: true
      },
      sales: {
        title: 'Historial de Ventas & Facturación',
        subtitle: 'Registro de transacciones en $ MXN, reimpresión y devoluciones',
        module: SalesView,
        restricted: true
      },
      settings: {
        title: 'Configuración de Nube & Negocio',
        subtitle: 'Seguridad con PIN, conexión a Supabase/Firebase y respaldos',
        module: SettingsView,
        restricted: true
      }
    };

    this.currentViewId = 'dashboard';
    this.pendingRoute = null;
    this.enteredPin = '';
  }

  init() {
    // Set initial theme
    const currentTheme = Store.state.theme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Setup global navigation bindings
    this.bindNavigation();
    this.bindHeaderActions();
    this.bindSecurityPinPad();

    // Listen to route changes
    window.addEventListener('hashchange', () => this.handleRouting());

    // Subscribe to store updates for reactive updates
    Store.subscribe('*', () => {
      this.updateHeaderAndBadges();
    });

    // Initial check: if employee, redirect to POS by default
    if (Store.getCurrentUser() === 'employee' && !window.location.hash.includes('pos')) {
      window.location.hash = '#pos';
    } else {
      this.handleRouting();
    }

    this.updateHeaderAndBadges();

    // Periodic cloud sync pulse
    setInterval(() => {
      Store.triggerCloudSync('heartbeat');
    }, 45000);
  }

  handleRouting() {
    const rawHash = window.location.hash.replace('#', '').trim() || 'dashboard';
    const viewKey = this.views[rawHash] ? rawHash : 'dashboard';
    const targetMeta = this.views[viewKey];

    // Role-based Navigation Guard
    const currentUser = Store.getCurrentUser();
    if (currentUser === 'employee' && targetMeta.restricted) {
      this.pendingRoute = viewKey;
      this.openPinModal(`Acceso a "${targetMeta.title}" restringido a Administrador.`);
      return;
    }

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

    // User Switcher Button in Header
    const userSwitchBtn = document.getElementById('btn-user-switch');
    if (userSwitchBtn) {
      userSwitchBtn.addEventListener('click', () => {
        const currentUser = Store.getCurrentUser();
        if (currentUser === 'admin') {
          if (confirm('¿Deseas cambiar la sesión al rol de Empleado (Cajero)? Las funciones administrativas quedarán protegidas por PIN.')) {
            Store.setCurrentUser('employee');
            Toast.info('Modo Empleado activado (Solo POS)');
            window.location.hash = '#pos';
          }
        } else {
          this.pendingRoute = this.currentViewId;
          this.openPinModal('Ingrese el PIN de Administrador para desbloquear la sesión:');
        }
      });
    }
  }

  // ------------------------------------------------------------------------
  // Security PIN Pad Modal Logic
  // ------------------------------------------------------------------------
  bindSecurityPinPad() {
    const modal = document.getElementById('admin-pin-modal');
    const closeBtn = document.getElementById('modal-close-pin');
    const cancelBtn = document.getElementById('btn-cancel-pin');
    const clearBtn = document.getElementById('btn-pin-clear');
    const backspaceBtn = document.getElementById('btn-pin-backspace');

    if (closeBtn) closeBtn.addEventListener('click', () => this.cancelPinModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelPinModal());

    // Keypad numbers
    document.querySelectorAll('.pin-key[data-num]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const num = e.currentTarget.getAttribute('data-num');
        this.handlePinInput(num);
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.enteredPin = '';
        this.updatePinDisplay();
      });
    }

    if (backspaceBtn) {
      backspaceBtn.addEventListener('click', () => {
        this.enteredPin = this.enteredPin.slice(0, -1);
        this.updatePinDisplay();
      });
    }

    // Physical Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (!modal || !modal.classList.contains('open')) return;

      if (e.key >= '0' && e.key <= '9') {
        this.handlePinInput(e.key);
      } else if (e.key === 'Backspace') {
        this.enteredPin = this.enteredPin.slice(0, -1);
        this.updatePinDisplay();
      } else if (e.key === 'Escape') {
        this.cancelPinModal();
      }
    });
  }

  openPinModal(instructionText) {
    this.enteredPin = '';
    this.updatePinDisplay();

    const instructionEl = document.getElementById('pin-modal-instruction');
    if (instructionEl && instructionText) {
      instructionEl.textContent = instructionText;
    }

    const modal = document.getElementById('admin-pin-modal');
    if (modal) modal.classList.add('open');
  }

  cancelPinModal() {
    const modal = document.getElementById('admin-pin-modal');
    if (modal) modal.classList.remove('open');
    this.enteredPin = '';
    this.pendingRoute = null;

    // Return to safe POS view
    window.location.hash = '#pos';
  }

  handlePinInput(digit) {
    if (this.enteredPin.length >= 6) return;
    this.enteredPin += digit;
    this.updatePinDisplay();

    // Verify when PIN reaches 4 digits
    if (this.enteredPin.length >= 4) {
      if (Store.verifyAdminPin(this.enteredPin)) {
        // Success
        Store.setCurrentUser('admin');
        const modal = document.getElementById('admin-pin-modal');
        if (modal) modal.classList.remove('open');

        Toast.success('¡Código PIN de Administrador verificado!');

        const target = this.pendingRoute || 'dashboard';
        this.pendingRoute = null;
        window.location.hash = `#${target}`;
        this.handleRouting();
      } else {
        // Error feedback
        const padWrap = document.getElementById('pin-pad-wrap');
        if (padWrap) {
          padWrap.classList.add('shake-error');
          setTimeout(() => padWrap.classList.remove('shake-error'), 400);
        }
        Toast.error('PIN incorrecto. Intente nuevamente.');
        setTimeout(() => {
          this.enteredPin = '';
          this.updatePinDisplay();
        }, 300);
      }
    }
  }

  updatePinDisplay() {
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`dot-${i}`);
      if (dot) {
        if (i < this.enteredPin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      }
    }
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (!themeBtn) return;

    if (theme === 'dark') {
      themeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y1="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
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
    const currentUser = Store.getCurrentUser();
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

    // User Role Switcher Pill in Header
    const userRolePill = document.getElementById('btn-user-switch');
    const roleIcon = document.getElementById('user-role-icon');
    const roleText = document.getElementById('user-role-text');

    if (userRolePill && roleIcon && roleText) {
      if (currentUser === 'admin') {
        userRolePill.className = 'user-role-pill role-admin';
        roleIcon.textContent = '👑';
        roleText.textContent = 'Administrador';
        userRolePill.setAttribute('title', 'Sesión: Administrador (clic para cambiar a Empleado)');
      } else {
        userRolePill.className = 'user-role-pill role-employee';
        roleIcon.textContent = '👤';
        roleText.textContent = 'Empleado';
        userRolePill.setAttribute('title', 'Sesión: Empleado (clic para ingresar PIN de Admin)');
      }
    }
  }
}

// Instantiate and initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
