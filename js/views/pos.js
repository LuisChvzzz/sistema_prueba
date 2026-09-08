/* ==========================================================================
   CloudAcc - Fast Point of Sale (POS) View
   Touch-friendly catalog, instant search, dynamic cart & thermal receipt generator
   ========================================================================== */

import { Store } from '../store.js';
import { Formatters } from '../utils/formatters.js';
import { Toast } from '../utils/notifications.js';

export const PosView = {
  selectedCategory: 'all',
  selectedModel: 'all',
  searchQuery: '',

  render(container) {
    const products = Store.getProducts();
    const categories = Store.state.categories;
    const settings = Store.getSettings();

    // Extract unique models from catalog
    const allModels = ['all', ...new Set(products.map(p => p.compatibleModel).filter(Boolean))];

    // Filter products
    const filteredProducts = products.filter(product => {
      const matchCat = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      const matchModel = this.selectedModel === 'all' || product.compatibleModel === this.selectedModel;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        (product.barcode && product.barcode.includes(q)) ||
        (product.compatibleModel && product.compatibleModel.toLowerCase().includes(q));

      return matchCat && matchModel && matchQuery;
    });

    const cartTotals = Store.getCartTotals();

    container.innerHTML = `
      <div class="pos-layout">
        <!-- Catalog & Filters Column -->
        <div class="pos-catalog-area">
          <div class="pos-toolbar">
            <!-- Search Input -->
            <div class="search-input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="pos-search-input" placeholder="Buscar por accesorio, modelo compatible (ej. iPhone 15, S24) o SKU..." value="${Formatters.escape(this.searchQuery)}">
            </div>

            <!-- Model Pills Quick Filter -->
            <div class="filter-pills-bar" id="model-pills">
              <button class="filter-pill ${this.selectedModel === 'all' ? 'active' : ''}" data-model="all">Todos los Modelos</button>
              ${allModels.filter(m => m !== 'all').map(model => `
                <button class="filter-pill ${this.selectedModel === model ? 'active' : ''}" data-model="${Formatters.escape(model)}">${model}</button>
              `).join('')}
            </div>

            <!-- Category Pills Filter -->
            <div class="filter-pills-bar" id="category-pills">
              <button class="filter-pill ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">Todas las Categorías</button>
              ${categories.map(cat => `
                <button class="filter-pill ${this.selectedCategory === cat ? 'active' : ''}" data-cat="${Formatters.escape(cat)}">${cat}</button>
              `).join('')}
            </div>
          </div>

          <!-- Product Grid -->
          <div class="products-grid">
            ${filteredProducts.length > 0 ? filteredProducts.map(product => {
              const isLowStock = product.stock <= product.minStock;
              const isOutOfStock = product.stock <= 0;

              return `
                <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${product.id}">
                  <div class="product-header">
                    <div class="product-icon-wrap">
                      ${this.getProductIconSvg(product.category)}
                    </div>
                    <span class="badge ${isOutOfStock ? 'badge-danger' : (isLowStock ? 'badge-warning' : 'badge-neutral')}">
                      ${isOutOfStock ? 'Agotado' : `${product.stock} disp.`}
                    </span>
                  </div>
                  <div class="product-card-title">${Formatters.escape(product.name)}</div>
                  <div class="product-compat-chip">${Formatters.escape(product.compatibleModel || 'Universal')}</div>
                  <div class="product-card-footer">
                    <span class="product-price-tag">${Formatters.currency(product.price, settings.currency)}</span>
                    <button class="btn btn-sm btn-primary add-to-cart-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                      + Añadir
                    </button>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="text-center text-muted" style="grid-column: 1 / -1; padding: 4rem 1rem;">
                <svg style="width: 48px; height: 48px; stroke: var(--border-strong); margin: 0 auto 1rem;" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <div class="font-semibold text-lg">No se encontraron accesorios</div>
                <div class="text-sm">Intenta con otro término o limpia los filtros de modelo.</div>
              </div>
            `}
          </div>
        </div>

        <!-- POS Cart Sidebar -->
        <div class="pos-cart-panel">
          <div class="cart-header">
            <div class="cart-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span>Venta en Curso</span>
            </div>
            ${cartTotals.items.length > 0 ? `
              <button class="btn btn-sm btn-ghost text-danger" id="btn-clear-cart" title="Vaciar Carrito">Vaciar</button>
            ` : ''}
          </div>

          <div class="cart-items-container">
            ${cartTotals.items.length > 0 ? cartTotals.items.map(item => `
              <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                  <div class="cart-item-name">${Formatters.escape(item.name)}</div>
                  <div class="cart-item-meta">${Formatters.escape(item.compatibleModel)} · ${Formatters.currency(item.price, settings.currency)}</div>
                </div>
                <div class="cart-item-qty-ctrls">
                  <button class="qty-btn btn-qty-minus" data-id="${item.id}">−</button>
                  <span class="qty-number">${item.qty}</span>
                  <button class="qty-btn btn-qty-plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">
                  ${Formatters.currency(item.price * item.qty, settings.currency)}
                </div>
                <button class="cart-item-remove btn-item-remove" data-id="${item.id}" title="Eliminar artículo">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            `).join('') : `
              <div class="cart-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <div class="font-semibold text-sm">El carrito está vacío</div>
                <div class="text-xs">Haz clic en cualquier accesorio para comenzar la venta</div>
              </div>
            `}
          </div>

          <!-- Cart Footer Summary -->
          <div class="cart-footer">
            <div class="summary-row">
              <span>Artículos</span>
              <span class="font-semibold">${cartTotals.totalItems}</span>
            </div>
            <div class="summary-row">
              <span>Subtotal</span>
              <span class="font-semibold">${Formatters.currency(cartTotals.subtotal, settings.currency)}</span>
            </div>
            <div class="summary-row">
              <span>Descuento aplicado</span>
              <span class="text-danger font-semibold">-${Formatters.currency(cartTotals.discount, settings.currency)}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total a Cobrar</span>
              <span class="text-primary">${Formatters.currency(cartTotals.total, settings.currency)}</span>
            </div>

            <div class="cart-action-btns">
              <button class="btn btn-secondary w-full" id="btn-add-discount" ${cartTotals.items.length === 0 ? 'disabled' : ''}>
                Descuento
              </button>
              <button class="btn btn-success btn-lg w-full" id="btn-checkout" ${cartTotals.items.length === 0 ? 'disabled' : ''}>
                Cobrar ${Formatters.currency(cartTotals.total, settings.currency)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Payment Modal -->
      <div class="modal-overlay" id="checkout-modal">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">Finalizar Venta</div>
            <button class="modal-close-btn" id="modal-close-checkout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="text-center" style="margin-bottom: 1.5rem;">
              <span class="text-xs text-muted font-bold text-uppercase">Total a Pagar</span>
              <div class="font-bold text-primary" style="font-size: 2.2rem;" id="checkout-display-total">
                ${Formatters.currency(cartTotals.total, settings.currency)}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nombre del Cliente (Opcional)</label>
              <input type="text" class="form-input" id="checkout-customer" placeholder="Cliente Mostrador" value="Cliente Mostrador">
            </div>

            <div class="form-group">
              <label class="form-label">Método de Pago</label>
              <select class="form-select" id="checkout-payment-method">
                <option value="Efectivo" selected>Efectivo</option>
                <option value="Tarjeta">Tarjeta Débito / Crédito</option>
                <option value="Transferencia">Transferencia Digital / QR</option>
                <option value="Mixto">Pago Mixto</option>
              </select>
            </div>

            <div id="cash-payment-section">
              <div class="form-group">
                <label class="form-label">Monto Recibido</label>
                <input type="number" step="0.5" class="form-input font-bold" id="checkout-amount-paid" value="${cartTotals.total}">
              </div>

              <!-- Quick cash buttons -->
              <div class="flex gap-2" style="margin-bottom: 1rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-sm btn-secondary quick-cash-btn" data-val="exact">Monto Exacto</button>
                <button type="button" class="btn btn-sm btn-secondary quick-cash-btn" data-val="20">$20</button>
                <button type="button" class="btn btn-sm btn-secondary quick-cash-btn" data-val="50">$50</button>
                <button type="button" class="btn btn-sm btn-secondary quick-cash-btn" data-val="100">$100</button>
                <button type="button" class="btn btn-sm btn-secondary quick-cash-btn" data-val="200">$200</button>
                <button type="button" class="btn btn-sm btn-secondary quick-cash-btn" data-val="500">$500</button>
              </div>

              <div class="flex justify-between items-center" style="padding: 0.85rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <span class="font-semibold text-sm">Cambio / Vuelto:</span>
                <span class="font-bold text-lg text-success" id="checkout-change-display">$0.00</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel-checkout">Cancelar</button>
            <button class="btn btn-success btn-lg" id="modal-confirm-sale">Confirmar & Emitir Ticket</button>
          </div>
        </div>
      </div>

      <!-- Printable Thermal Ticket Modal -->
      <div class="modal-overlay" id="ticket-modal">
        <div class="modal-card" style="max-width: 420px;">
          <div class="modal-header">
            <div class="modal-title">Comprobante Digital</div>
            <button class="modal-close-btn" id="modal-close-ticket">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body" style="background-color: #f1f5f9; padding: 1.5rem 1rem;">
            <div id="thermal-ticket-container">
              <!-- Dynamically populated ticket -->
            </div>
          </div>
          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-secondary" id="btn-share-whatsapp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              WhatsApp
            </button>
            <div class="flex gap-2">
              <button class="btn btn-primary" id="btn-print-ticket">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  getProductIconSvg(category) {
    switch (category) {
      case 'Fundas y Cases':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="6" r="1"/></svg>`;
      case 'Micas y Vidrio Templado':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 3v18"/></svg>`;
      case 'Cargadores y Cables':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="13 11 10 17 15 17 12 23"/></svg>`;
      case 'Audio y Audífonos TWS':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`;
      case 'Soportes y MagSafe':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`;
      case 'Power Banks y Baterías':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    }
  },

  bindEvents(container) {
    // Search input
    const searchInput = container.querySelector('#pos-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
        const inputNow = container.querySelector('#pos-search-input');
        if (inputNow) {
          inputNow.focus();
          inputNow.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Model filter pills
    container.querySelectorAll('#model-pills .filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedModel = e.currentTarget.getAttribute('data-model');
        this.render(container);
      });
    });

    // Category filter pills
    container.querySelectorAll('#category-pills .filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedCategory = e.currentTarget.getAttribute('data-cat');
        this.render(container);
      });
    });

    // Add to cart buttons
    container.querySelectorAll('.add-to-cart-btn, .product-card').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const id = elem.getAttribute('data-id');
        const prod = Store.getProductById(id);
        if (prod && prod.stock > 0) {
          Store.addToCart(prod);
        }
      });
    });

    // Cart Quantity Controls
    container.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        const item = Store.getCart().find(i => i.id === id);
        if (item) Store.updateCartQty(id, item.qty + 1);
      });
    });

    container.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        const item = Store.getCart().find(i => i.id === id);
        if (item) Store.updateCartQty(id, item.qty - 1);
      });
    });

    container.querySelectorAll('.btn-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        Store.removeFromCart(id);
      });
    });

    // Clear cart
    const clearCartBtn = container.querySelector('#btn-clear-cart');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => Store.clearCart());
    }

    // Discount button
    const discountBtn = container.querySelector('#btn-add-discount');
    if (discountBtn) {
      discountBtn.addEventListener('click', () => {
        const currentDiscount = Store.cartDiscount;
        const input = prompt('Ingrese el monto de descuento en moneda:', currentDiscount || '');
        if (input !== null) {
          const val = parseFloat(input);
          Store.setCartDiscount(isNaN(val) ? 0 : val);
        }
      });
    }

    // Checkout button & modal
    const checkoutBtn = container.querySelector('#btn-checkout');
    const checkoutModal = container.querySelector('#checkout-modal');
    const closeCheckoutBtn = container.querySelector('#modal-close-checkout');
    const cancelCheckoutBtn = container.querySelector('#modal-cancel-checkout');
    const confirmSaleBtn = container.querySelector('#modal-confirm-sale');
    const amountPaidInput = container.querySelector('#checkout-amount-paid');
    const changeDisplay = container.querySelector('#checkout-change-display');
    const paymentMethodSelect = container.querySelector('#checkout-payment-method');
    const cashSection = container.querySelector('#cash-payment-section');

    const updateChange = () => {
      const totals = Store.getCartTotals();
      const paid = parseFloat(amountPaidInput.value) || 0;
      const change = Math.max(0, paid - totals.total);
      changeDisplay.textContent = Formatters.currency(change, Store.getSettings().currency);
    };

    if (checkoutBtn && checkoutModal) {
      checkoutBtn.addEventListener('click', () => {
        const totals = Store.getCartTotals();
        amountPaidInput.value = totals.total;
        updateChange();
        checkoutModal.classList.add('open');
      });

      closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('open'));
      cancelCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('open'));

      amountPaidInput.addEventListener('input', updateChange);

      paymentMethodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Efectivo') {
          cashSection.style.display = 'block';
        } else {
          cashSection.style.display = 'none';
          amountPaidInput.value = Store.getCartTotals().total;
          updateChange();
        }
      });

      // Quick cash buttons
      container.querySelectorAll('.quick-cash-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = e.currentTarget.getAttribute('data-val');
          const totals = Store.getCartTotals();
          if (val === 'exact') {
            amountPaidInput.value = totals.total;
          } else {
            amountPaidInput.value = val;
          }
          updateChange();
        });
      });

      // Complete sale
      confirmSaleBtn.addEventListener('click', () => {
        const totals = Store.getCartTotals();
        const customer = container.querySelector('#checkout-customer').value;
        const paymentMethod = paymentMethodSelect.value;
        const amountPaid = parseFloat(amountPaidInput.value) || totals.total;

        if (paymentMethod === 'Efectivo' && amountPaid < totals.total) {
          Toast.error('El monto recibido es menor al total a cobrar.');
          return;
        }

        const saleRecord = Store.completeSale({ customer, paymentMethod, amountPaid });
        if (saleRecord) {
          checkoutModal.classList.remove('open');
          Toast.success(`¡Venta ${saleRecord.id} registrada exitosamente!`);
          this.showTicketModal(container, saleRecord);
        }
      });
    }

    // Ticket Modal Closers
    const ticketModal = container.querySelector('#ticket-modal');
    const closeTicketBtn = container.querySelector('#modal-close-ticket');
    if (closeTicketBtn && ticketModal) {
      closeTicketBtn.addEventListener('click', () => ticketModal.classList.remove('open'));
    }
  },

  showTicketModal(container, sale) {
    const settings = Store.getSettings();
    const ticketModal = container.querySelector('#ticket-modal');
    const ticketContainer = container.querySelector('#thermal-ticket-container');

    ticketContainer.innerHTML = `
      <div class="ticket-wrapper">
        <div class="ticket-header">
          <div class="ticket-store-name">${Formatters.escape(settings.storeName)}</div>
          <div class="ticket-meta">${Formatters.escape(settings.address || '')}</div>
          <div class="ticket-meta">Tel: ${Formatters.escape(settings.phone || '')}</div>
          <hr class="ticket-divider">
          <div class="ticket-meta">Folio: <strong>${sale.id}</strong></div>
          <div class="ticket-meta">Fecha: ${Formatters.dateTime(sale.date)}</div>
          <div class="ticket-meta">Cliente: ${Formatters.escape(sale.customer)}</div>
        </div>

        <table class="ticket-items-list">
          <thead>
            <tr style="border-bottom: 1px dashed #cbd5e1; font-size: 0.72rem;">
              <th align="left">Cant.</th>
              <th align="left">Accesorio</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(i => `
              <tr>
                <td style="vertical-align: top; width: 25px;">${i.qty}x</td>
                <td>
                  <div>${Formatters.escape(i.name)}</div>
                  <div style="font-size: 0.7rem; color: #64748b;">${Formatters.escape(i.compatibleModel || '')}</div>
                </td>
                <td align="right" style="vertical-align: top;">${Formatters.currency(i.price * i.qty, settings.currency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <hr class="ticket-divider">

        <div class="ticket-totals">
          <div class="ticket-row">
            <span>Subtotal:</span>
            <span>${Formatters.currency(sale.subtotal, settings.currency)}</span>
          </div>
          ${sale.discount > 0 ? `
            <div class="ticket-row">
              <span>Descuento:</span>
              <span>-${Formatters.currency(sale.discount, settings.currency)}</span>
            </div>
          ` : ''}
          <div class="ticket-row total-bold">
            <span>TOTAL:</span>
            <span>${Formatters.currency(sale.total, settings.currency)}</span>
          </div>
          <div class="ticket-row" style="margin-top: 0.4rem; font-size: 0.76rem;">
            <span>Método de Pago:</span>
            <span>${sale.paymentMethod}</span>
          </div>
          ${sale.paymentMethod === 'Efectivo' ? `
            <div class="ticket-row" style="font-size: 0.76rem;">
              <span>Recibido:</span>
              <span>${Formatters.currency(sale.amountPaid, settings.currency)}</span>
            </div>
            <div class="ticket-row" style="font-size: 0.76rem;">
              <span>Cambio:</span>
              <span>${Formatters.currency(sale.change, settings.currency)}</span>
            </div>
          ` : ''}
        </div>

        <div class="ticket-footer">
          <div>${Formatters.escape(settings.ticketFooter)}</div>
          <div style="margin-top: 0.5rem; font-size: 0.65rem; color: #94a3b8;">Sistema CloudAcc · Nube Segura</div>
        </div>
      </div>
    `;

    ticketModal.classList.add('open');

    // WhatsApp Share button
    const shareWhatsappBtn = container.querySelector('#btn-share-whatsapp');
    if (shareWhatsappBtn) {
      shareWhatsappBtn.onclick = () => {
        const text = encodeURIComponent(
          `¡Hola ${sale.customer}! Gracias por tu compra en ${settings.storeName}.\n` +
          `Comprobante: ${sale.id}\n` +
          `Total: ${Formatters.currency(sale.total, settings.currency)}\n` +
          `Artículos:\n` +
          sale.items.map(i => `• ${i.qty}x ${i.name} (${Formatters.currency(i.price * i.qty, settings.currency)})`).join('\n') +
          `\n\n${settings.ticketFooter}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
      };
    }

    // Print button
    const printBtn = container.querySelector('#btn-print-ticket');
    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
      };
    }
  }
};
