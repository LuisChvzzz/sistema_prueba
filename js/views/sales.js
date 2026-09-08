/* ==========================================================================
   CloudAcc - Sales History & Transactions Ledger
   Audit log, transaction receipts reprint, returns & financial ledger
   ========================================================================== */

import { Store } from '../store.js';
import { Formatters } from '../utils/formatters.js';
import { Toast } from '../utils/notifications.js';
import { PosView } from './pos.js';

export const SalesView = {
  searchQuery: '',
  statusFilter: 'all',

  render(container) {
    const sales = Store.getSales();
    const settings = Store.getSettings();

    // Filter sales
    const filteredSales = sales.filter(s => {
      const matchStatus = this.statusFilter === 'all' || s.status === this.statusFilter;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        s.id.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.paymentMethod.toLowerCase().includes(q) ||
        s.items.some(i => i.name.toLowerCase().includes(q));

      return matchStatus && matchQuery;
    });

    const totalSold = sales.filter(s => s.status === 'COMPLETED').reduce((acc, s) => acc + s.total, 0);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header Actions -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
          <div style="display: flex; gap: 0.75rem; flex: 1; min-width: 280px; max-width: 500px;">
            <div class="search-input-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="sales-search-input" placeholder="Buscar por folio (ej. TKT-1082), cliente o artículo..." value="${Formatters.escape(this.searchQuery)}">
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <span class="badge badge-success" style="font-size: 0.85rem; padding: 0.5rem 0.85rem;">
              Total Registrado: ${Formatters.currency(totalSold, settings.currency)}
            </span>
            <button class="btn btn-secondary" id="btn-export-sales-csv">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar Ventas
            </button>
          </div>
        </div>

        <!-- Filter pills -->
        <div style="display: flex; gap: 0.75rem;">
          <button class="filter-pill ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">
            Todas (${sales.length})
          </button>
          <button class="filter-pill ${this.statusFilter === 'COMPLETED' ? 'active' : ''}" data-status="COMPLETED">
            Completadas (${sales.filter(s => s.status === 'COMPLETED').length})
          </button>
          <button class="filter-pill ${this.statusFilter === 'REFUNDED' ? 'active' : ''}" data-status="REFUNDED">
            Reembolsadas / Devoluciones (${sales.filter(s => s.status === 'REFUNDED').length})
          </button>
        </div>

        <!-- Transactions Table -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Folio / Ticket</th>
                <th>Fecha & Hora</th>
                <th>Cliente</th>
                <th>Artículos</th>
                <th>Método de Pago</th>
                <th>Total</th>
                <th>Ganancia</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales.length > 0 ? filteredSales.map(sale => {
                const isRefunded = sale.status === 'REFUNDED';
                const totalItems = sale.items.reduce((sum, i) => sum + i.qty, 0);

                return `
                  <tr style="${isRefunded ? 'opacity: 0.65; background-color: var(--bg-surface-elevated);' : ''}">
                    <td class="font-mono font-bold text-xs">
                      ${sale.id}
                    </td>
                    <td class="text-xs text-muted">
                      ${Formatters.dateTime(sale.date)}
                    </td>
                    <td>
                      <div class="font-semibold text-sm">${Formatters.escape(sale.customer)}</div>
                    </td>
                    <td>
                      <div class="text-xs font-medium">
                        ${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}
                      </div>
                      <div class="text-xs text-muted truncate" style="max-width: 220px;" title="${sale.items.map(i => `${i.qty}x ${i.name}`).join(', ')}">
                        ${sale.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-neutral">${sale.paymentMethod}</span>
                    </td>
                    <td class="font-mono font-bold text-sm">
                      ${Formatters.currency(sale.total, settings.currency)}
                    </td>
                    <td class="font-mono text-xs text-success font-semibold">
                      ${isRefunded ? '-' : `+${Formatters.currency(sale.profit || 0, settings.currency)}`}
                    </td>
                    <td>
                      <span class="badge ${isRefunded ? 'badge-danger' : 'badge-success'}">
                        ${isRefunded ? 'Devolución' : 'Completado'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <div class="flex items-center justify-end gap-1">
                        <button class="btn btn-sm btn-secondary btn-view-ticket" data-id="${sale.id}" title="Reimprimir o Ver Ticket">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          Ticket
                        </button>
                        ${!isRefunded ? `
                          <button class="btn btn-sm btn-ghost text-danger btn-refund-sale" data-id="${sale.id}" title="Devolución y reintegrar stock">
                            Reembolsar
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="9" class="text-center text-muted" style="padding: 3.5rem 1rem;">
                    No se encontraron transacciones registradas
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ticket Modal Container inside sales view if opened here -->
      <div class="modal-overlay" id="sales-ticket-modal">
        <div class="modal-card" style="max-width: 420px;">
          <div class="modal-header">
            <div class="modal-title">Reimpresión de Ticket</div>
            <button class="modal-close-btn" id="modal-close-sales-ticket">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body" style="background-color: #f1f5f9; padding: 1.5rem 1rem;">
            <div id="sales-thermal-ticket-container"></div>
          </div>
          <div class="modal-footer" style="justify-content: space-between;">
            <button class="btn btn-secondary" id="sales-btn-share-whatsapp">WhatsApp</button>
            <button class="btn btn-primary" id="sales-btn-print">Imprimir</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // Search
    const searchInput = container.querySelector('#sales-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
        const inputNow = container.querySelector('#sales-search-input');
        if (inputNow) {
          inputNow.focus();
          inputNow.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Status filter
    container.querySelectorAll('.filter-pill[data-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.statusFilter = e.currentTarget.getAttribute('data-status');
        this.render(container);
      });
    });

    // Export CSV
    const exportBtn = container.querySelector('#btn-export-sales-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportSalesCSV());
    }

    // View Ticket
    const ticketModal = container.querySelector('#sales-ticket-modal');
    const closeTicketModal = container.querySelector('#modal-close-sales-ticket');
    if (ticketModal && closeTicketModal) {
      closeTicketModal.addEventListener('click', () => ticketModal.classList.remove('open'));

      container.querySelectorAll('.btn-view-ticket').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const sale = Store.getSales().find(s => s.id === id);
          if (sale) {
            this.showReprintTicket(container, sale);
          }
        });
      });
    }

    // Refund button
    container.querySelectorAll('.btn-refund-sale').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm(`¿Confirma el reembolso del ticket ${id}? Los artículos regresarán automáticamente al inventario.`)) {
          Store.refundSale(id);
          Toast.warning(`Venta ${id} reembolsada. Stock restaurado.`);
        }
      });
    });
  },

  showReprintTicket(container, sale) {
    const settings = Store.getSettings();
    const modal = container.querySelector('#sales-ticket-modal');
    const containerEl = container.querySelector('#sales-thermal-ticket-container');

    containerEl.innerHTML = `
      <div class="ticket-wrapper">
        <div class="ticket-header">
          <div class="ticket-store-name">${Formatters.escape(settings.storeName)}</div>
          <div class="ticket-meta">${Formatters.escape(settings.address || '')}</div>
          <div class="ticket-meta">Tel: ${Formatters.escape(settings.phone || '')}</div>
          <hr class="ticket-divider">
          <div class="ticket-meta">Folio: <strong>${sale.id}</strong> (COPIA)</div>
          <div class="ticket-meta">Fecha: ${Formatters.dateTime(sale.date)}</div>
          <div class="ticket-meta">Cliente: ${Formatters.escape(sale.customer)}</div>
          ${sale.status === 'REFUNDED' ? '<div style="color: red; font-weight: bold; margin-top: 4px;">*** VENTA REEMBOLSADA ***</div>' : ''}
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
            <span>Método:</span>
            <span>${sale.paymentMethod}</span>
          </div>
        </div>

        <div class="ticket-footer">
          <div>${Formatters.escape(settings.ticketFooter)}</div>
          <div style="margin-top: 0.5rem; font-size: 0.65rem; color: #94a3b8;">Copia de Comprobante · CloudAcc</div>
        </div>
      </div>
    `;

    modal.classList.add('open');

    container.querySelector('#sales-btn-print').onclick = () => window.print();
    container.querySelector('#sales-btn-share-whatsapp').onclick = () => {
      const text = encodeURIComponent(
        `Ticket de compra ${sale.id} de ${settings.storeName}\n` +
        `Total: ${Formatters.currency(sale.total, settings.currency)}\n` +
        `Fecha: ${Formatters.dateTime(sale.date)}`
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    };
  },

  exportSalesCSV() {
    const sales = Store.getSales();
    const headers = ['Folio', 'Fecha', 'Cliente', 'Items_Vendidos', 'Metodo_Pago', 'Total', 'Ganancia', 'Estado'];

    const rows = sales.map(s => [
      `"${s.id}"`,
      `"${s.date}"`,
      `"${s.customer.replace(/"/g, '""')}"`,
      s.items.reduce((acc, i) => acc + i.qty, 0),
      `"${s.paymentMethod}"`,
      s.total,
      s.profit || 0,
      `"${s.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventas_accesorios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.success('Historial de ventas exportado en formato CSV');
  }
};
