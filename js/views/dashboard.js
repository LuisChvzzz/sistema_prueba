/* ==========================================================================
   CloudAcc - Executive Dashboard View
   Real-time business performance, KPI metrics, category charts & low-stock alerts
   ========================================================================== */

import { Store } from '../store.js';
import { Formatters } from '../utils/formatters.js';

export const DashboardView = {
  render(container) {
    const products = Store.getProducts();
    const sales = Store.getSales().filter(s => s.status === 'COMPLETED');
    const settings = Store.getSettings();

    // Calculate executive KPIs
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalProfit = sales.reduce((acc, s) => acc + (s.profit || 0), 0);
    const totalItemsSold = sales.reduce((acc, s) => acc + s.items.reduce((iAcc, i) => iAcc + i.qty, 0), 0);
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);

    // Sales by Category
    const categoryStats = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = Store.getProductById(item.id);
        const cat = prod ? prod.category : 'Otros';
        categoryStats[cat] = (categoryStats[cat] || 0) + (item.price * item.qty);
      });
    });

    const categoriesList = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    const maxCatSales = categoriesList.length > 0 ? Math.max(...categoriesList.map(c => c[1])) : 1;

    container.innerHTML = `
      <div class="kpi-grid">
        <!-- Revenue Card -->
        <div class="kpi-card" style="--kpi-accent: #4f46e5; --kpi-light: rgba(79, 70, 229, 0.1);">
          <div class="kpi-header">
            <span class="kpi-title">Ingresos Totales</span>
            <div class="kpi-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="kpi-value">${Formatters.currency(totalRevenue, settings.currency)}</div>
          <div class="kpi-footer">
            <span class="kpi-badge positive">↑ Activo</span>
            <span>Registrado en Nube</span>
          </div>
        </div>

        <!-- Profit Card -->
        <div class="kpi-card" style="--kpi-accent: #10b981; --kpi-light: rgba(16, 185, 129, 0.1);">
          <div class="kpi-header">
            <span class="kpi-title">Ganancia Estimada</span>
            <div class="kpi-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
            </div>
          </div>
          <div class="kpi-value">${Formatters.currency(totalProfit, settings.currency)}</div>
          <div class="kpi-footer">
            <span class="kpi-badge positive">${totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}% margen</span>
            <span>Sobre costo neto</span>
          </div>
        </div>

        <!-- Items Sold Card -->
        <div class="kpi-card" style="--kpi-accent: #0ea5e9; --kpi-light: rgba(14, 165, 233, 0.1);">
          <div class="kpi-header">
            <span class="kpi-title">Accesorios Vendidos</span>
            <div class="kpi-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
          </div>
          <div class="kpi-value">${totalItemsSold}</div>
          <div class="kpi-footer">
            <span class="kpi-badge neutral">${sales.length} tickets</span>
            <span>Ventas completadas</span>
          </div>
        </div>

        <!-- Low Stock Alert Card -->
        <div class="kpi-card" style="--kpi-accent: ${lowStockProducts.length > 0 ? '#ef4444' : '#10b981'}; --kpi-light: ${lowStockProducts.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};">
          <div class="kpi-header">
            <span class="kpi-title">Alertas de Inventario</span>
            <div class="kpi-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div class="kpi-value">${lowStockProducts.length}</div>
          <div class="kpi-footer">
            <span class="kpi-badge ${lowStockProducts.length > 0 ? 'negative' : 'positive'}">
              ${lowStockProducts.length > 0 ? 'Por Reponer' : 'Stock Óptimo'}
            </span>
            <span>Productos bajo mínimo</span>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- Category Sales Bar Chart -->
        <div class="card chart-card">
          <div class="chart-header">
            <div>
              <h3 style="font-size: 1.05rem;">Ventas por Categoría de Accesorio</h3>
              <p class="text-xs text-muted">Distribución de ingresos por tipo de producto</p>
            </div>
            <span class="badge badge-primary">Nube en vivo</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem;">
            ${categoriesList.length > 0 ? categoriesList.map(([cat, amount]) => {
              const percent = Math.round((amount / maxCatSales) * 100);
              return `
                <div>
                  <div class="flex justify-between text-xs font-semibold" style="margin-bottom: 0.3rem;">
                    <span>${cat}</span>
                    <span>${Formatters.currency(amount, settings.currency)}</span>
                  </div>
                  <div style="height: 8px; background-color: var(--bg-surface-hover); border-radius: var(--radius-full); overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, #8b5cf6 100%); border-radius: var(--radius-full);"></div>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="text-center text-muted" style="padding: 2.5rem 0;">No hay ventas registradas aún</div>
            `}
          </div>
        </div>

        <!-- Low Stock Fast Reposition Table -->
        <div class="card">
          <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1.05rem;">Atención Urgente: Stock Crítico</h3>
              <p class="text-xs text-muted">Accesorios que requieren pedido con proveedor</p>
            </div>
            <button class="btn btn-sm btn-secondary" id="btn-goto-inventory">Ver Todo</button>
          </div>

          ${lowStockProducts.length > 0 ? `
            <div class="table-container" style="max-height: 250px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Modelo</th>
                    <th>Existencia</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  ${lowStockProducts.map(p => `
                    <tr>
                      <td>
                        <div class="font-semibold text-sm truncate" style="max-width: 170px;" title="${p.name}">${p.name}</div>
                        <div class="text-xs text-muted font-mono">${p.sku}</div>
                      </td>
                      <td><span class="model-chip">${p.compatibleModel}</span></td>
                      <td>
                        <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">
                          ${p.stock} / min ${p.minStock}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-primary quick-restock-btn" data-id="${p.id}" title="Añadir 10 unidades rápido">+10 Stock</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="text-center text-muted" style="padding: 3rem 1rem;">
              <svg style="width: 40px; height: 40px; stroke: var(--success); margin-bottom: 0.5rem;" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div class="font-semibold text-sm text-primary">¡Inventario Excelente!</div>
              <div class="text-xs">No hay productos con stock por debajo del mínimo.</div>
            </div>
          `}
        </div>

      </div>
    `;

    // Bind event listeners
    const gotoInvBtn = container.querySelector('#btn-goto-inventory');
    if (gotoInvBtn) {
      gotoInvBtn.addEventListener('click', () => {
        window.location.hash = '#inventory';
      });
    }

    container.querySelectorAll('.quick-restock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        Store.adjustStock(id, 10, 'Reabastecimiento Express');
      });
    });
  }
};
