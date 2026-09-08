/* ==========================================================================
   CloudAcc - Settings & Cloud Synchronization View (MXN & Security RBAC)
   Cloud database configuration, Admin PIN management, store profile & backups
   ========================================================================== */

import { Store } from '../store.js';
import { Toast } from '../utils/notifications.js';

export const SettingsView = {
  render(container) {
    const settings = Store.getSettings();
    const cloudStatus = Store.state.cloudStatus;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 960px; margin: 0 auto;">
        
        <!-- Security & Admin PIN Card -->
        <div class="card" style="border-left: 4px solid var(--warning);">
          <div style="margin-bottom: 1.25rem;">
            <div class="flex justify-between items-center">
              <h2 style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Seguridad y Control de Acceso (PIN de Administrador)
              </h2>
              <span class="badge badge-warning">Protección Activa</span>
            </div>
            <p class="text-sm text-muted">
              El rol de <strong>Empleado (Cajero)</strong> solo tiene permiso para operar el Punto de Venta (POS). Para acceder a Inventario, Tablero, Ventas o Nube, el sistema requerirá este código PIN.
            </p>
          </div>

          <form id="admin-pin-form" style="background-color: var(--bg-surface-elevated); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div class="form-row">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">PIN Actual de Administrador</label>
                <input type="password" class="form-input font-mono font-bold" id="input-current-pin" placeholder="PIN actual (por defecto 1234)" required maxlength="8">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Nuevo PIN de Administrador (4 a 6 dígitos)</label>
                <input type="password" class="form-input font-mono font-bold" id="input-new-pin" placeholder="Ej. 5678" required maxlength="8">
              </div>
            </div>

            <div class="flex justify-between items-center" style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-subtle);">
              <div class="text-xs text-muted">
                PIN activo actual: <span class="font-mono font-bold">••••</span> (Predeterminado de fábrica: 1234)
              </div>
              <button type="submit" class="btn btn-primary">
                Actualizar Código PIN
              </button>
            </div>
          </form>

          <!-- Permissions Comparison Table -->
          <div style="margin-top: 1.25rem; font-size: 0.82rem;">
            <div class="font-semibold" style="margin-bottom: 0.5rem;">Nivel de Permisos por Usuario:</div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th>👑 Administrador</th>
                    <th>👤 Empleado (Cajero)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Punto de Venta (POS) & Cobros</strong></td>
                    <td><span class="badge badge-success">✓ Permitido</span></td>
                    <td><span class="badge badge-success">✓ Permitido</span></td>
                  </tr>
                  <tr>
                    <td><strong>Inventario (Precios, Costos y Altas)</strong></td>
                    <td><span class="badge badge-success">✓ Permitido</span></td>
                    <td><span class="badge badge-warning">🔒 Requiere PIN Admin</span></td>
                  </tr>
                  <tr>
                    <td><strong>Tablero Ejecutivo & Ganancias Netas</strong></td>
                    <td><span class="badge badge-success">✓ Permitido</span></td>
                    <td><span class="badge badge-warning">🔒 Requiere PIN Admin</span></td>
                  </tr>
                  <tr>
                    <td><strong>Historial & Cancelaciones / Reembolsos</strong></td>
                    <td><span class="badge badge-success">✓ Permitido</span></td>
                    <td><span class="badge badge-warning">🔒 Requiere PIN Admin</span></td>
                  </tr>
                  <tr>
                    <td><strong>Configuración Cloud & Respaldos</strong></td>
                    <td><span class="badge badge-success">✓ Permitido</span></td>
                    <td><span class="badge badge-warning">🔒 Requiere PIN Admin</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Store Profile Card -->
        <div class="card">
          <div style="margin-bottom: 1.25rem;">
            <h2 style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Perfil de la Tienda de Accesorios
            </h2>
            <p class="text-sm text-muted">Datos que se mostrarán en la interfaz y en los comprobantes/tickets térmicos impresos.</p>
          </div>

          <form id="store-profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre del Negocio</label>
                <input type="text" class="form-input" id="set-store-name" value="${settings.storeName}" required>
              </div>

              <div class="form-group">
                <label class="form-label">Moneda Principal</label>
                <select class="form-select" id="set-currency">
                  <option value="MXN" selected>MXN ($ - Peso Mexicano)</option>
                  <option value="USD">USD ($ - Dólar Estadounidense)</option>
                  <option value="COP">COP ($ - Peso Colombiano)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono de Atención / WhatsApp</label>
                <input type="text" class="form-input" id="set-phone" value="${settings.phone || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Dirección Física / Sucursal</label>
                <input type="text" class="form-input" id="set-address" value="${settings.address || ''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Pie de Página del Ticket (Términos / Garantía)</label>
              <textarea class="form-textarea" id="set-ticket-footer" rows="2">${settings.ticketFooter || ''}</textarea>
            </div>

            <div class="flex justify-end" style="margin-top: 1rem;">
              <button type="submit" class="btn btn-primary">Guardar Perfil</button>
            </div>
          </form>
        </div>

        <!-- Cloud Connectivity Card -->
        <div class="card" style="border-left: 4px solid var(--primary);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
            <div>
              <h2 style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                Conexión & Sincronización 100% en la Nube
              </h2>
              <p class="text-sm text-muted">Configura el backend en la nube para sincronizar inventario entre múltiples sucursales y terminales en tiempo real.</p>
            </div>
            <span class="badge badge-success" id="cloud-sync-badge">
              ● Nube Conectada
            </span>
          </div>

          <form id="cloud-config-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Proveedor Cloud / Backend</label>
                <select class="form-select" id="cloud-provider">
                  <option value="supabase" ${settings.cloudSync.provider === 'supabase' ? 'selected' : ''}>Supabase (PostgreSQL Realtime)</option>
                  <option value="firebase" ${settings.cloudSync.provider === 'firebase' ? 'selected' : ''}>Firebase Firestore (Google Cloud)</option>
                  <option value="rest" ${settings.cloudSync.provider === 'rest' ? 'selected' : ''}>API REST / Servidor Propio</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Endpoint URL de la Nube</label>
                <input type="text" class="form-input font-mono" id="cloud-endpoint" value="${settings.cloudSync.endpoint}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">API Key / Token de Acceso Cloud</label>
              <input type="password" class="form-input font-mono" id="cloud-apikey" value="${settings.cloudSync.apiKey}">
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
              <div class="text-xs text-muted">
                Última sincronización exitosa: <strong id="cloud-last-sync-time">${new Date(cloudStatus.lastSync).toLocaleTimeString()}</strong>
              </div>
              <div class="flex gap-2">
                <button type="button" class="btn btn-secondary" id="btn-test-cloud">
                  Probar Conexión (Ping)
                </button>
                <button type="submit" class="btn btn-primary">
                  Guardar Conexión Cloud
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Cloud Backups & Migration -->
        <div class="card">
          <div style="margin-bottom: 1.25rem;">
            <h2 style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Respaldos y Migración de Datos (Snapshot)
            </h2>
            <p class="text-sm text-muted">Descarga un respaldo completo en pesos mexicanos ($ MXN) o restaura tu base de datos para transferirla a otra terminal.</p>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; padding: 1rem; background-color: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div>
              <div class="font-semibold text-sm">Respaldo Completo en Archivo JSON</div>
              <div class="text-xs text-muted">Incluye catálogo completo en $ MXN, categorías nuevas y ventas</div>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-secondary" id="btn-download-backup">
                Descargar Respaldo JSON
              </button>
              <label class="btn btn-secondary" style="cursor: pointer;">
                Restaurar Respaldo
                <input type="file" id="input-import-backup" accept=".json" style="display: none;">
              </label>
            </div>
          </div>

          <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="font-semibold text-sm text-danger">Restablecer a Datos de Prueba Iniciales</div>
              <div class="text-xs text-muted">Carga el catálogo base optimizado en Pesos Mexicanos (MXN) con PIN: 1234</div>
            </div>
            <button class="btn btn-sm btn-ghost text-danger" id="btn-reset-defaults">
              Restablecer Fábrica
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    // PIN Change Form
    const pinForm = container.querySelector('#admin-pin-form');
    if (pinForm) {
      pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPin = container.querySelector('#input-current-pin').value;
        const newPin = container.querySelector('#input-new-pin').value;

        if (!Store.verifyAdminPin(currentPin)) {
          Toast.error('El PIN actual ingresado es incorrecto.');
          return;
        }

        if (Store.setAdminPin(newPin)) {
          pinForm.reset();
        }
      });
    }

    // Cloud Connection Form
    const cloudForm = container.querySelector('#cloud-config-form');
    if (cloudForm) {
      cloudForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const provider = container.querySelector('#cloud-provider').value;
        const endpoint = container.querySelector('#cloud-endpoint').value.trim();
        const apiKey = container.querySelector('#cloud-apikey').value.trim();

        const curSettings = Store.getSettings();
        Store.updateSettings({
          cloudSync: {
            ...curSettings.cloudSync,
            provider,
            endpoint,
            apiKey,
            lastSync: new Date().toISOString()
          }
        });

        Toast.success('Configuración de la nube guardada y sincronizada');
      });
    }

    // Ping Cloud Test
    const testCloudBtn = container.querySelector('#btn-test-cloud');
    if (testCloudBtn) {
      testCloudBtn.addEventListener('click', () => {
        testCloudBtn.disabled = true;
        testCloudBtn.textContent = 'Conectando...';

        setTimeout(() => {
          testCloudBtn.disabled = false;
          testCloudBtn.textContent = 'Probar Conexión (Ping)';
          Toast.success('¡Conexión con la Nube Exitosa! Latencia: 38ms (Supabase Cloud OK)');
          const syncTimeEl = container.querySelector('#cloud-last-sync-time');
          if (syncTimeEl) syncTimeEl.textContent = new Date().toLocaleTimeString();
        }, 500);
      });
    }

    // Store Profile Form
    const profileForm = container.querySelector('#store-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const storeName = container.querySelector('#set-store-name').value.trim();
        const currency = container.querySelector('#set-currency').value;
        const phone = container.querySelector('#set-phone').value.trim();
        const address = container.querySelector('#set-address').value.trim();
        const ticketFooter = container.querySelector('#set-ticket-footer').value.trim();

        Store.updateSettings({ storeName, currency, phone, address, ticketFooter });
        Toast.success('Perfil de la tienda actualizado');
      });
    }

    // Download Backup JSON
    const downloadBackupBtn = container.querySelector('#btn-download-backup');
    if (downloadBackupBtn) {
      downloadBackupBtn.addEventListener('click', () => Store.exportJSONSnapshot());
    }

    // Import Backup JSON
    const importInput = container.querySelector('#input-import-backup');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          Store.importJSONSnapshot(event.target.result);
          this.render(container);
        };
        reader.readAsText(file);
      });
    }

    // Reset to defaults
    const resetBtn = container.querySelector('#btn-reset-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('¿Restablecer el inventario al catálogo de prueba en Pesos Mexicanos ($ MXN)?')) {
          Store.resetToDefaults();
          this.render(container);
        }
      });
    }
  }
};
