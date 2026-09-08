/* ==========================================================================
   CloudAcc - Inventory & Accessories Catalog View (MXN + Custom Categories)
   Catalog management, dynamic category creation, margin calculators & CRUD
   ========================================================================== */

import { Store } from '../store.js';
import { Formatters } from '../utils/formatters.js';
import { Toast } from '../utils/notifications.js';

export const InventoryView = {
  searchQuery: '',
  filterCategory: 'all',
  filterStatus: 'all',
  editingProductId: null,

  render(container) {
    const products = Store.getProducts();
    const categories = Store.getCategories();
    const settings = Store.getSettings();

    // Filter products
    const filteredProducts = products.filter(p => {
      const matchCat = this.filterCategory === 'all' || p.category === this.filterCategory;
      const matchStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'low' && p.stock <= p.minStock && p.stock > 0) ||
        (this.filterStatus === 'out' && p.stock <= 0);

      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.compatibleModel && p.compatibleModel.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      return matchCat && matchStatus && matchQuery;
    });

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header Actions Bar -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
          <div style="display: flex; gap: 0.75rem; flex: 1; min-width: 280px; max-width: 600px; flex-wrap: wrap;">
            <div class="search-input-box" style="flex: 1; min-width: 220px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="inv-search-input" placeholder="Buscar por accesorio, SKU, modelo o marca..." value="${Formatters.escape(this.searchQuery)}">
            </div>

            <select class="form-select" id="inv-category-filter" style="width: auto; min-width: 170px;">
              <option value="all">Todas las Categorías</option>
              ${categories.map(c => `<option value="${Formatters.escape(c)}" ${this.filterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-quick-new-category" title="Crear nueva categoría para productos no listados">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              + Nueva Categoría
            </button>
            <button class="btn btn-secondary" id="btn-export-csv" title="Descargar reporte en formato CSV">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </button>
            <button class="btn btn-primary" id="btn-add-product">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo Accesorio
            </button>
          </div>
        </div>

        <!-- Inventory Stats Pills -->
        <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.25rem;">
          <button class="filter-pill ${this.filterStatus === 'all' ? 'active' : ''}" data-status="all">
            Todos (${products.length})
          </button>
          <button class="filter-pill ${this.filterStatus === 'low' ? 'active' : ''}" data-status="low">
            ⚠️ Stock Bajo (${products.filter(p => p.stock <= p.minStock && p.stock > 0).length})
          </button>
          <button class="filter-pill ${this.filterStatus === 'out' ? 'active' : ''}" data-status="out">
            ⛔ Agotados (${products.filter(p => p.stock <= 0).length})
          </button>
        </div>

        <!-- Inventory Data Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Accesorio</th>
                <th>Modelo Compatible</th>
                <th>Categoría</th>
                <th>Costo</th>
                <th>Precio</th>
                <th>Margen</th>
                <th>Stock</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProducts.length > 0 ? filteredProducts.map(p => {
                const margin = Formatters.calcMargin(p.cost, p.price);
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock <= 0;

                return `
                  <tr>
                    <td class="font-mono text-xs font-semibold">${Formatters.escape(p.sku)}</td>
                    <td>
                      <div class="font-semibold text-sm">${Formatters.escape(p.name)}</div>
                      <div class="text-xs text-muted">Marca: ${Formatters.escape(p.brand || 'Genérica')}</div>
                    </td>
                    <td>
                      <span class="model-chip">${Formatters.escape(p.compatibleModel || 'Universal')}</span>
                    </td>
                    <td><span class="badge badge-neutral">${Formatters.escape(p.category)}</span></td>
                    <td class="font-mono text-sm">${Formatters.currency(p.cost, settings.currency)}</td>
                    <td class="font-mono text-sm font-semibold">${Formatters.currency(p.price, settings.currency)}</td>
                    <td>
                      <span class="badge ${margin >= 40 ? 'badge-success' : (margin >= 20 ? 'badge-primary' : 'badge-warning')}">
                        ${margin}%
                      </span>
                    </td>
                    <td>
                      <span class="badge ${isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success')}">
                        ${p.stock} unid.
                      </span>
                      ${isLow ? `<div class="text-xs text-danger" style="margin-top: 2px;">Min: ${p.minStock}</div>` : ''}
                    </td>
                    <td style="text-align: right;">
                      <div class="flex items-center justify-end gap-1">
                        <button class="btn btn-sm btn-secondary btn-stock-adjust" data-id="${p.id}" title="Ajustar existencia rápida">
                          ± Stock
                        </button>
                        <button class="btn btn-sm btn-ghost btn-edit-product" data-id="${p.id}" title="Editar accesorio">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-ghost text-danger btn-delete-product" data-id="${p.id}" title="Eliminar accesorio">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="9" class="text-center text-muted" style="padding: 3.5rem 1rem;">
                    No se encontraron accesorios bajo los filtros seleccionados
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div class="modal-overlay" id="product-modal">
        <div class="modal-card modal-lg">
          <div class="modal-header">
            <div class="modal-title" id="product-modal-title">Nuevo Accesorio para Celular</div>
            <button class="modal-close-btn" id="modal-close-product">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <form id="product-form">
              <div class="form-group">
                <label class="form-label">Nombre del Accesorio <span class="req">*</span></label>
                <input type="text" class="form-input" id="prod-name" required placeholder="Ej. Funda MagSafe Silicona Original">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <div class="flex justify-between items-center">
                    <label class="form-label">Categoría <span class="req">*</span></label>
                    <button type="button" class="btn btn-sm btn-ghost text-xs text-primary" id="btn-inline-new-cat" style="padding: 0;">+ Nueva</button>
                  </div>
                  <select class="form-select" id="prod-category" required>
                    ${categories.map(c => `<option value="${Formatters.escape(c)}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Modelo Celular Compatible <span class="req">*</span></label>
                  <input type="text" class="form-input" id="prod-compat" placeholder="Ej. iPhone 15 Pro, S24 Ultra o Universal" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Marca / Fabricante</label>
                  <input type="text" class="form-input" id="prod-brand" placeholder="Apple, Samsung, Baseus, etc.">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <div class="flex justify-between items-center">
                    <label class="form-label">Código SKU <span class="req">*</span></label>
                    <button type="button" class="btn btn-sm btn-ghost text-xs" id="btn-gen-sku">Generar SKU</button>
                  </div>
                  <input type="text" class="form-input font-mono" id="prod-sku" required placeholder="CASE-IP15-01">
                </div>
                <div class="form-group">
                  <label class="form-label">Código de Barras</label>
                  <input type="text" class="form-input font-mono" id="prod-barcode" placeholder="750100100...">
                </div>
              </div>

              <div class="form-row" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Costo de Compra ($ MXN) <span class="req">*</span></label>
                  <input type="number" step="1" min="0" class="form-input" id="prod-cost" required value="95">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Precio de Venta ($ MXN) <span class="req">*</span></label>
                  <input type="number" step="1" min="0" class="form-input font-bold" id="prod-price" required value="290">
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                  <div class="margin-indicator" id="prod-margin-preview">
                    Margen de Ganancia: <strong>67.2%</strong>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Stock Actual (piezas) <span class="req">*</span></label>
                  <input type="number" min="0" class="form-input" id="prod-stock" required value="15">
                </div>
                <div class="form-group">
                  <label class="form-label">Stock Mínimo de Alerta <span class="req">*</span></label>
                  <input type="number" min="1" class="form-input" id="prod-min-stock" required value="5">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel-product">Cancelar</button>
            <button class="btn btn-primary" id="modal-save-product">Guardar Accesorio</button>
          </div>
        </div>
      </div>

      <!-- Quick Stock Adjust Modal -->
      <div class="modal-overlay" id="stock-modal">
        <div class="modal-card" style="max-width: 440px;">
          <div class="modal-header">
            <div class="modal-title">Ajuste de Stock Rápido</div>
            <button class="modal-close-btn" id="modal-close-stock">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 1rem;">
              <div class="font-bold text-sm" id="stock-modal-prod-name">Accesorio</div>
              <div class="text-xs text-muted" id="stock-modal-current-stock">Stock actual: 0 unidades</div>
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de Movimiento</label>
              <select class="form-select" id="stock-adjust-type">
                <option value="in">Entrada por Proveedor (+)</option>
                <option value="out">Salida por Merma / Garantía (-)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Cantidad a Modificar (Piezas)</label>
              <input type="number" min="1" value="10" class="form-input font-bold" id="stock-adjust-qty">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel-stock">Cancelar</button>
            <button class="btn btn-primary" id="modal-confirm-stock">Aplicar Ajuste</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // Search
    const searchInput = container.querySelector('#inv-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
        const inputNow = container.querySelector('#inv-search-input');
        if (inputNow) {
          inputNow.focus();
          inputNow.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Category filter
    const catSelect = container.querySelector('#inv-category-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.filterCategory = e.target.value;
        this.render(container);
      });
    }

    // Status filter pills
    container.querySelectorAll('.filter-pill[data-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterStatus = e.currentTarget.getAttribute('data-status');
        this.render(container);
      });
    });

    // Quick New Category Button
    const quickNewCatBtn = container.querySelector('#btn-quick-new-category');
    if (quickNewCatBtn) {
      quickNewCatBtn.addEventListener('click', () => {
        this.promptNewCategory(container);
      });
    }

    // Inline New Category Button in Product Modal
    const inlineNewCatBtn = container.querySelector('#btn-inline-new-cat');
    if (inlineNewCatBtn) {
      inlineNewCatBtn.addEventListener('click', () => {
        const catName = prompt('Ingrese el nombre de la nueva categoría de producto (ej. Smartwatches, Correas, Micas UV):');
        if (catName && catName.trim()) {
          const added = Store.addCategory(catName.trim());
          if (added) {
            const select = container.querySelector('#prod-category');
            const opt = document.createElement('option');
            opt.value = added;
            opt.textContent = added;
            opt.selected = true;
            select.appendChild(opt);
          }
        }
      });
    }

    // Export CSV
    const exportBtn = container.querySelector('#btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportCSV());
    }

    // Product Modal bindings
    const prodModal = container.querySelector('#product-modal');
    const closeProdModal = container.querySelector('#modal-close-product');
    const cancelProdModal = container.querySelector('#modal-cancel-product');
    const saveProdModal = container.querySelector('#modal-save-product');
    const addProdBtn = container.querySelector('#btn-add-product');
    const genSkuBtn = container.querySelector('#btn-gen-sku');
    const costInput = container.querySelector('#prod-cost');
    const priceInput = container.querySelector('#prod-price');
    const marginPreview = container.querySelector('#prod-margin-preview');

    const updateMargin = () => {
      const c = parseFloat(costInput.value) || 0;
      const p = parseFloat(priceInput.value) || 0;
      const m = Formatters.calcMargin(c, p);
      marginPreview.innerHTML = `Margen de Ganancia: <strong>${m}%</strong> (Ganancia: ${Formatters.currency(Math.max(0, p - c))})`;
    };

    if (costInput && priceInput) {
      costInput.addEventListener('input', updateMargin);
      priceInput.addEventListener('input', updateMargin);
    }

    if (genSkuBtn) {
      genSkuBtn.addEventListener('click', () => {
        const cat = container.querySelector('#prod-category').value;
        const brand = container.querySelector('#prod-brand').value;
        const compat = container.querySelector('#prod-compat').value;
        container.querySelector('#prod-sku').value = Formatters.generateSKU(cat, brand, compat);
      });
    }

    if (addProdBtn && prodModal) {
      addProdBtn.addEventListener('click', () => {
        this.editingProductId = null;
        container.querySelector('#product-modal-title').textContent = 'Nuevo Accesorio para Celular';
        container.querySelector('#product-form').reset();
        container.querySelector('#prod-sku').value = Formatters.generateSKU('CASE', 'IPHONE', 'PRO');
        updateMargin();
        prodModal.classList.add('open');
      });

      closeProdModal.addEventListener('click', () => prodModal.classList.remove('open'));
      cancelProdModal.addEventListener('click', () => prodModal.classList.remove('open'));

      saveProdModal.addEventListener('click', () => {
        const name = container.querySelector('#prod-name').value.trim();
        const category = container.querySelector('#prod-category').value;
        const compatibleModel = container.querySelector('#prod-compat').value.trim();
        const brand = container.querySelector('#prod-brand').value.trim();
        const sku = container.querySelector('#prod-sku').value.trim();
        const barcode = container.querySelector('#prod-barcode').value.trim();
        const cost = parseFloat(container.querySelector('#prod-cost').value) || 0;
        const price = parseFloat(container.querySelector('#prod-price').value) || 0;
        const stock = parseInt(container.querySelector('#prod-stock').value, 10) || 0;
        const minStock = parseInt(container.querySelector('#prod-min-stock').value, 10) || 5;

        if (!name || !sku) {
          Toast.error('Por favor complete los campos obligatorios (*).');
          return;
        }

        const data = { name, category, compatibleModel, brand, sku, barcode, cost, price, stock, minStock };

        if (this.editingProductId) {
          Store.updateProduct(this.editingProductId, data);
          Toast.success('Accesorio actualizado en la nube');
        } else {
          Store.addProduct(data);
          Toast.success('Accesorio agregado y sincronizado con éxito');
        }

        prodModal.classList.remove('open');
      });
    }

    // Edit Product buttons
    container.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const prod = Store.getProductById(id);
        if (!prod) return;

        this.editingProductId = id;
        container.querySelector('#product-modal-title').textContent = 'Editar Accesorio';
        container.querySelector('#prod-name').value = prod.name;
        container.querySelector('#prod-category').value = prod.category;
        container.querySelector('#prod-compat').value = prod.compatibleModel || '';
        container.querySelector('#prod-brand').value = prod.brand || '';
        container.querySelector('#prod-sku').value = prod.sku;
        container.querySelector('#prod-barcode').value = prod.barcode || '';
        container.querySelector('#prod-cost').value = prod.cost;
        container.querySelector('#prod-price').value = prod.price;
        container.querySelector('#prod-stock').value = prod.stock;
        container.querySelector('#prod-min-stock').value = prod.minStock;

        updateMargin();
        prodModal.classList.add('open');
      });
    });

    // Delete Product buttons
    container.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const prod = Store.getProductById(id);
        if (prod && confirm(`¿Estás seguro de eliminar "${prod.name}" del catálogo?`)) {
          Store.deleteProduct(id);
          Toast.info('Producto eliminado de la base de datos');
        }
      });
    });

    // Quick Stock Adjust Modal bindings
    const stockModal = container.querySelector('#stock-modal');
    const closeStockModal = container.querySelector('#modal-close-stock');
    const cancelStockModal = container.querySelector('#modal-cancel-stock');
    const confirmStockModal = container.querySelector('#modal-confirm-stock');
    let activeStockProdId = null;

    if (stockModal) {
      container.querySelectorAll('.btn-stock-adjust').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeStockProdId = e.currentTarget.getAttribute('data-id');
          const prod = Store.getProductById(activeStockProdId);
          if (!prod) return;

          container.querySelector('#stock-modal-prod-name').textContent = prod.name;
          container.querySelector('#stock-modal-current-stock').textContent = `Stock actual: ${prod.stock} piezas (${prod.compatibleModel})`;
          stockModal.classList.add('open');
        });
      });

      closeStockModal.addEventListener('click', () => stockModal.classList.remove('open'));
      cancelStockModal.addEventListener('click', () => stockModal.classList.remove('open'));

      confirmStockModal.addEventListener('click', () => {
        const type = container.querySelector('#stock-adjust-type').value;
        const qty = parseInt(container.querySelector('#stock-adjust-qty').value, 10) || 0;
        if (qty <= 0) return;

        const delta = type === 'in' ? qty : -qty;
        Store.adjustStock(activeStockProdId, delta);
        Toast.success('Existencia actualizada en la nube');
        stockModal.classList.remove('open');
      });
    }
  },

  promptNewCategory(container) {
    const name = prompt('Ingrese el nombre de la nueva categoría (ej. "Micas de Hidrogel", "Stands de Escritorio", "Correas de Apple Watch"):');
    if (name && name.trim()) {
      const added = Store.addCategory(name.trim());
      if (added) {
        this.filterCategory = added;
        this.render(container);
      }
    }
  },

  exportCSV() {
    const products = Store.getProducts();
    const headers = ['SKU', 'Nombre', 'Categoria', 'Modelo_Compatible', 'Marca', 'Costo_MXN', 'Precio_MXN', 'Stock', 'Stock_Minimo', 'Margen_Pct'];

    const rows = products.map(p => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${(p.compatibleModel || '').replace(/"/g, '""')}"`,
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      p.cost,
      p.price,
      p.stock,
      p.minStock,
      Formatters.calcMargin(p.cost, p.price)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_accesorios_mxn_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.success('Catálogo exportado en formato CSV ($ MXN)');
  }
};
