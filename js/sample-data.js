/* ==========================================================================
   CloudAcc - Initial Sample Catalog Data (MXN Edition)
   Curated stock for mobile phone accessories store in Mexican Pesos ($ MXN)
   ========================================================================== */

export const INITIAL_CATEGORIES = [
  'Fundas y Cases',
  'Micas y Vidrio Templado',
  'Cargadores y Cables',
  'Audio y Audífonos TWS',
  'Soportes y MagSafe',
  'Power Banks y Baterías',
  'Accesorios y Limpieza'
];

export const INITIAL_PHONE_MODELS = [
  'Todos los modelos',
  'iPhone 15 Pro / Max',
  'iPhone 15 / Plus',
  'iPhone 14 / 13',
  'iPhone 11 / 12',
  'Samsung Galaxy S24 Ultra',
  'Samsung Galaxy S24 / S23',
  'Samsung Galaxy A54 / A34',
  'Xiaomi Redmi Note 13',
  'Moto G84 / G54',
  'Universal'
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    sku: 'CASE-IP15PM-CL',
    name: 'Funda Silicona Líquida Antigolpe MagSafe',
    category: 'Fundas y Cases',
    brand: 'Apple',
    compatibleModel: 'iPhone 15 Pro / Max',
    cost: 95.00,
    price: 290.00,
    stock: 24,
    minStock: 8,
    barcode: '750100100201',
    iconType: 'case'
  },
  {
    id: 'prod-002',
    sku: 'MICA-S24U-PRIV',
    name: 'Mica Cerámica Privacidad Antiespía 9D Full Glue',
    category: 'Micas y Vidrio Templado',
    brand: 'Samsung',
    compatibleModel: 'Samsung Galaxy S24 Ultra',
    cost: 45.00,
    price: 180.00,
    stock: 35,
    minStock: 10,
    barcode: '750100100202',
    iconType: 'screen'
  },
  {
    id: 'prod-003',
    sku: 'CARG-GAN-65W',
    name: 'Cargador Rápido GaN 65W Doble USB-C + USB-A',
    category: 'Cargadores y Cables',
    brand: 'Ugreen',
    compatibleModel: 'Universal',
    cost: 250.00,
    price: 599.00,
    stock: 12,
    minStock: 5,
    barcode: '750100100203',
    iconType: 'charger'
  },
  {
    id: 'prod-004',
    sku: 'CABL-USBC-BRD',
    name: 'Cable USB-C a Lightning Reforzado en Nylon 1.5m',
    category: 'Cargadores y Cables',
    brand: 'Anker',
    compatibleModel: 'iPhone 14 / 13',
    cost: 65.00,
    price: 210.00,
    stock: 40,
    minStock: 12,
    barcode: '750100100204',
    iconType: 'cable'
  },
  {
    id: 'prod-005',
    sku: 'AUD-TWS-ANC',
    name: 'Audífonos In-Ear Bluetooth TWS con Cancelación Ruido ANC',
    category: 'Audio y Audífonos TWS',
    brand: 'Soundcore',
    compatibleModel: 'Universal',
    cost: 320.00,
    price: 790.00,
    stock: 9,
    minStock: 4,
    barcode: '750100100205',
    iconType: 'audio'
  },
  {
    id: 'prod-006',
    sku: 'SOP-MAG-CAR',
    name: 'Soporte Magnético MagSafe para Rejilla de Auto con Carga 15W',
    category: 'Soportes y MagSafe',
    brand: 'Baseus',
    compatibleModel: 'iPhone 15 Pro / Max',
    cost: 160.00,
    price: 430.00,
    stock: 15,
    minStock: 5,
    barcode: '750100100206',
    iconType: 'holder'
  },
  {
    id: 'prod-007',
    sku: 'POW-10000-MAG',
    name: 'Batería Portátil Slim MagSafe 10,000 mAh Inalámbrica',
    category: 'Power Banks y Baterías',
    brand: 'Joyroom',
    compatibleModel: 'Universal',
    cost: 240.00,
    price: 550.00,
    stock: 7,
    minStock: 5,
    barcode: '750100100207',
    iconType: 'battery'
  },
  {
    id: 'prod-008',
    sku: 'CASE-S24-TRNS',
    name: 'Funda Transparente Acrílico TPU Anti-Amarilleo',
    category: 'Fundas y Cases',
    brand: 'Samsung',
    compatibleModel: 'Samsung Galaxy S24 / S23',
    cost: 50.00,
    price: 170.00,
    stock: 22,
    minStock: 8,
    barcode: '750100100208',
    iconType: 'case'
  },
  {
    id: 'prod-009',
    sku: 'MICA-IP15-TEMP',
    name: 'Vidrio Templado Premium 9H Bordes Redondeados 2.5D',
    category: 'Micas y Vidrio Templado',
    brand: 'Apple',
    compatibleModel: 'iPhone 15 / Plus',
    cost: 35.00,
    price: 150.00,
    stock: 45,
    minStock: 15,
    barcode: '750100100209',
    iconType: 'screen'
  },
  {
    id: 'prod-010',
    sku: 'CASE-REDMI13-ARM',
    name: 'Funda Blindada Rugged Armor con Anillo y Soporte 360',
    category: 'Fundas y Cases',
    brand: 'Xiaomi',
    compatibleModel: 'Xiaomi Redmi Note 13',
    cost: 75.00,
    price: 240.00,
    stock: 18,
    minStock: 6,
    barcode: '750100100210',
    iconType: 'case'
  },
  {
    id: 'prod-011',
    sku: 'CABL-TYPEC-100W',
    name: 'Cable Tipo-C a Tipo-C Carga Ultra Rápida 100W PD trenzado',
    category: 'Cargadores y Cables',
    brand: 'Baseus',
    compatibleModel: 'Universal',
    cost: 70.00,
    price: 220.00,
    stock: 28,
    minStock: 10,
    barcode: '750100100211',
    iconType: 'cable'
  },
  {
    id: 'prod-012',
    sku: 'LIMP-KIT-SCRN',
    name: 'Kit de Limpieza Pantalla + Spray Antibacterial + Paño Microfibra',
    category: 'Accesorios y Limpieza',
    brand: 'CleanTech',
    compatibleModel: 'Universal',
    cost: 35.00,
    price: 120.00,
    stock: 3,
    minStock: 8,
    barcode: '750100100212',
    iconType: 'clean'
  }
];

export const INITIAL_SALES = [
  {
    id: 'TKT-1082',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: 'Cliente Mostrador',
    items: [
      { id: 'prod-001', name: 'Funda Silicona Líquida Antigolpe MagSafe', price: 290.00, qty: 1, cost: 95.00 },
      { id: 'prod-009', name: 'Vidrio Templado Premium 9H Bordes Redondeados', price: 150.00, qty: 1, cost: 35.00 }
    ],
    subtotal: 440.00,
    discount: 0,
    tax: 0,
    total: 440.00,
    totalCost: 130.00,
    profit: 310.00,
    paymentMethod: 'Efectivo',
    amountPaid: 500.00,
    change: 60.00,
    status: 'COMPLETED'
  },
  {
    id: 'TKT-1081',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: 'Marcos R.',
    items: [
      { id: 'prod-003', name: 'Cargador Rápido GaN 65W Doble USB-C', price: 599.00, qty: 1, cost: 250.00 },
      { id: 'prod-011', name: 'Cable Tipo-C a Tipo-C Carga Ultra Rápida 100W', price: 220.00, qty: 1, cost: 70.00 }
    ],
    subtotal: 819.00,
    discount: 19.00,
    tax: 0,
    total: 800.00,
    totalCost: 320.00,
    profit: 480.00,
    paymentMethod: 'Tarjeta',
    amountPaid: 800.00,
    change: 0.00,
    status: 'COMPLETED'
  },
  {
    id: 'TKT-1080',
    date: new Date(Date.now() - 3600000 * 26).toISOString(),
    customer: 'Lucía V.',
    items: [
      { id: 'prod-005', name: 'Audífonos In-Ear Bluetooth TWS ANC', price: 790.00, qty: 1, cost: 320.00 }
    ],
    subtotal: 790.00,
    discount: 0,
    tax: 0,
    total: 790.00,
    totalCost: 320.00,
    profit: 470.00,
    paymentMethod: 'Transferencia',
    amountPaid: 790.00,
    change: 0.00,
    status: 'COMPLETED'
  }
];

export const INITIAL_SETTINGS = {
  storeName: 'iAccessories Cloud Store',
  currency: 'MXN',
  taxRate: 0,
  ticketFooter: '¡Gracias por su compra! Garantía de 30 días en cargadores y accesorios electrónicos. Precios en Moneda Nacional ($ MXN).',
  phone: '+52 55 1234 5678',
  address: 'Av. Insurgentes Sur 1450, Local 4B, CDMX',
  adminPin: '1234',
  currentUser: 'admin', // 'admin' | 'employee'
  cloudSync: {
    enabled: true,
    provider: 'supabase',
    endpoint: 'https://cloudacc-db-sync.supabase.co',
    apiKey: 'sbp_live_83921980312fa8c49e',
    lastSync: new Date().toISOString(),
    status: 'connected'
  }
};
