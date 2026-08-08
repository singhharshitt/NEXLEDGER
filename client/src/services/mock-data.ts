import type {
  User,
  Customer,
  CustomerFollowUp,
  Product,
  StockMovement,
  Challan,
  DashboardActivity,
  StockChartData,
} from '@/types';

// ── Users ──
export const mockUsers: User[] = [
  { id: 'u1', name: 'Arjun Mehta', email: 'admin@nexledger.in', role: 'admin', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@nexledger.in', role: 'sales', createdAt: '2025-02-20T10:00:00Z' },
  { id: 'u3', name: 'Rakesh Kumar', email: 'rakesh@nexledger.in', role: 'warehouse', createdAt: '2025-03-10T10:00:00Z' },
  { id: 'u4', name: 'Sonal Patel', email: 'sonal@nexledger.in', role: 'accounts', createdAt: '2025-04-05T10:00:00Z' },
];

// ── Customers ──
export const mockCustomers: Customer[] = [
  {
    id: 'c1', name: 'Vijay Traders', businessName: 'Vijay Traders Pvt Ltd', type: 'wholesaler', status: 'active',
    email: 'vijay@vijaytraders.com', mobile: '+91 98765 43210', gst: '27AABCV1234A1ZN',
    address: '42, Industrial Area Phase-II', city: 'Pune', state: 'Maharashtra', pincode: '411018',
    followUpDate: '2026-08-05T00:00:00Z', notes: 'Key wholesale client for chemicals',
    createdAt: '2025-06-10T10:30:00Z', updatedAt: '2026-07-28T14:00:00Z',
  },
  {
    id: 'c2', name: 'Anand Distributors', businessName: 'Anand Distribution Network', type: 'distributor', status: 'active',
    email: 'info@ananddist.com', mobile: '+91 87654 32109', gst: '24AABCA5678B1ZP',
    address: '15, GIDC Estate', city: 'Ahmedabad', state: 'Gujarat', pincode: '382445',
    followUpDate: '2026-08-12T00:00:00Z',
    createdAt: '2025-07-22T09:00:00Z', updatedAt: '2026-08-01T11:00:00Z',
  },
  {
    id: 'c3', name: 'Sri Lakshmi Stores', businessName: 'Sri Lakshmi General Stores', type: 'retailer', status: 'active',
    email: 'lakshmi@gmail.com', mobile: '+91 76543 21098',
    address: '8, Main Road, Kothapet', city: 'Hyderabad', state: 'Telangana', pincode: '500035',
    followUpDate: '2026-08-20T00:00:00Z',
    createdAt: '2025-09-15T08:30:00Z', updatedAt: '2026-07-15T16:00:00Z',
  },
  {
    id: 'c4', name: 'Metro Supplies Co', businessName: 'Metro Supplies Corporation', type: 'wholesaler', status: 'lead',
    email: 'contact@metrosupplies.in', mobile: '+91 65432 10987', gst: '29AABCM9012C1ZR',
    address: '201, Commercial Complex', city: 'Bengaluru', state: 'Karnataka', pincode: '560001',
    followUpDate: '2026-08-03T00:00:00Z', notes: 'New lead from trade fair',
    createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'c5', name: 'Gupta Hardware', businessName: 'Gupta Hardware & Tools', type: 'retailer', status: 'inactive',
    email: 'gupta.hardware@email.com', mobile: '+91 54321 09876',
    address: '33, Chandni Chowk', city: 'Delhi', state: 'Delhi', pincode: '110006',
    createdAt: '2025-04-20T12:00:00Z', updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'c6', name: 'Bharat Chemicals', businessName: 'Bharat Chemical Industries', type: 'distributor', status: 'active',
    email: 'sales@bharatchem.in', mobile: '+91 91234 56789', gst: '27AABCB7890D1ZS',
    address: '56, MIDC, Taloja', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '410208',
    followUpDate: '2026-08-15T00:00:00Z',
    createdAt: '2025-08-01T14:00:00Z', updatedAt: '2026-08-06T10:00:00Z',
  },
  {
    id: 'c7', name: 'Rajesh Enterprises', businessName: 'Rajesh Enterprises & Sons', type: 'wholesaler', status: 'active',
    email: 'rajesh@rajeshent.com', mobile: '+91 81234 56780', gst: '33AABCR2345E1ZT',
    address: '18, Guindy Industrial Estate', city: 'Chennai', state: 'Tamil Nadu', pincode: '600032',
    followUpDate: '2026-08-10T00:00:00Z',
    createdAt: '2025-05-12T11:00:00Z', updatedAt: '2026-08-04T09:00:00Z',
  },
  {
    id: 'c8', name: 'Sunrise Trading', businessName: 'Sunrise Trading Company', type: 'wholesaler', status: 'lead',
    email: 'info@sunrisetrading.in', mobile: '+91 70123 45678',
    address: '90, Sector 18', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301',
    followUpDate: '2026-08-09T00:00:00Z', notes: 'Interested in bulk packaging materials',
    createdAt: '2026-07-20T15:00:00Z', updatedAt: '2026-07-20T15:00:00Z',
  },
];

// ── Follow-ups ──
export const mockFollowUps: CustomerFollowUp[] = [
  { id: 'f1', customerId: 'c1', date: '2026-07-28T14:00:00Z', notes: 'Discussed Q3 order volumes. Will send revised pricing by Friday.', createdBy: 'u2', createdByName: 'Priya Sharma', createdAt: '2026-07-28T14:00:00Z' },
  { id: 'f2', customerId: 'c1', date: '2026-07-15T10:00:00Z', notes: 'Quarterly review meeting. Happy with delivery times. Want to explore new product line.', createdBy: 'u2', createdByName: 'Priya Sharma', createdAt: '2026-07-15T10:30:00Z' },
  { id: 'f3', customerId: 'c1', date: '2026-06-20T11:00:00Z', notes: 'Initial onboarding call. Shared product catalog and pricing.', createdBy: 'u1', createdByName: 'Arjun Mehta', createdAt: '2026-06-20T11:30:00Z' },
  { id: 'f4', customerId: 'c2', date: '2026-08-01T11:00:00Z', notes: 'Confirmed distribution agreement for western region.', createdBy: 'u2', createdByName: 'Priya Sharma', createdAt: '2026-08-01T11:00:00Z' },
  { id: 'f5', customerId: 'c4', date: '2026-07-01T10:00:00Z', notes: 'Met at trade fair. Strong interest in bulk chemical supplies.', createdBy: 'u1', createdByName: 'Arjun Mehta', createdAt: '2026-07-01T10:00:00Z' },
];

// ── Products ──
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Industrial Solvent Grade A', sku: 'CHEM-SOL-001', category: 'Chemicals', unitPrice: 2450.00, currentStock: 850, minStock: 200, unit: 'Litre', warehouse: 'Warehouse A', status: 'healthy', createdAt: '2025-06-01T10:00:00Z', updatedAt: '2026-08-06T10:00:00Z' },
  { id: 'p2', name: 'Acetic Acid 99%', sku: 'CHEM-ACE-002', category: 'Chemicals', unitPrice: 3200.00, currentStock: 45, minStock: 100, unit: 'Litre', warehouse: 'Warehouse A', status: 'low', createdAt: '2025-06-15T10:00:00Z', updatedAt: '2026-08-05T14:00:00Z' },
  { id: 'p3', name: 'HDPE Packaging Drum 200L', sku: 'PKG-DRM-001', category: 'Packaging', unitPrice: 1850.00, currentStock: 320, minStock: 50, unit: 'Piece', warehouse: 'Warehouse B', status: 'healthy', createdAt: '2025-07-01T10:00:00Z', updatedAt: '2026-08-04T09:00:00Z' },
  { id: 'p4', name: 'Safety Gloves (Box of 100)', sku: 'SAF-GLV-001', category: 'Safety', unitPrice: 750.00, currentStock: 0, minStock: 25, unit: 'Box', warehouse: 'Warehouse A', status: 'out', createdAt: '2025-08-10T10:00:00Z', updatedAt: '2026-08-03T16:00:00Z' },
  { id: 'p5', name: 'Sodium Hydroxide Flakes', sku: 'CHEM-SOH-003', category: 'Chemicals', unitPrice: 1800.00, currentStock: 1200, minStock: 300, unit: 'Kg', warehouse: 'Warehouse A', status: 'healthy', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2026-08-06T08:00:00Z' },
  { id: 'p6', name: 'Methanol Technical Grade', sku: 'CHEM-MET-004', category: 'Chemicals', unitPrice: 2800.00, currentStock: 15, minStock: 150, unit: 'Litre', warehouse: 'Warehouse A', status: 'low', createdAt: '2025-10-15T10:00:00Z', updatedAt: '2026-08-07T12:00:00Z' },
  { id: 'p7', name: 'Polypropylene Bags 50kg', sku: 'PKG-BAG-002', category: 'Packaging', unitPrice: 45.00, currentStock: 5000, minStock: 1000, unit: 'Piece', warehouse: 'Warehouse B', status: 'healthy', createdAt: '2025-11-01T10:00:00Z', updatedAt: '2026-08-05T10:00:00Z' },
  { id: 'p8', name: 'Safety Goggles', sku: 'SAF-GOG-002', category: 'Safety', unitPrice: 350.00, currentStock: 8, minStock: 20, unit: 'Piece', warehouse: 'Warehouse A', status: 'low', createdAt: '2025-12-01T10:00:00Z', updatedAt: '2026-08-06T15:00:00Z' },
  { id: 'p9', name: 'Citric Acid Monohydrate', sku: 'CHEM-CIT-005', category: 'Chemicals', unitPrice: 1650.00, currentStock: 600, minStock: 100, unit: 'Kg', warehouse: 'Warehouse A', status: 'healthy', createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-08-07T09:00:00Z' },
  { id: 'p10', name: 'Jerry Can 20L HDPE', sku: 'PKG-JCN-003', category: 'Packaging', unitPrice: 280.00, currentStock: 0, minStock: 100, unit: 'Piece', warehouse: 'Warehouse B', status: 'out', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-08-02T11:00:00Z' },
];

// ── Stock Movements ──
export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', productName: 'Industrial Solvent Grade A', type: 'in', quantity: 500, reason: 'Purchase order received', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-06T10:00:00Z' },
  { id: 'sm2', productId: 'p2', productName: 'Acetic Acid 99%', type: 'out', quantity: 55, reason: 'Challan CH-2026-000012', reference: 'ch3', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-05T14:00:00Z' },
  { id: 'sm3', productId: 'p1', productName: 'Industrial Solvent Grade A', type: 'out', quantity: 150, reason: 'Challan CH-2026-000011', reference: 'ch2', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-05T09:00:00Z' },
  { id: 'sm4', productId: 'p5', productName: 'Sodium Hydroxide Flakes', type: 'in', quantity: 800, reason: 'Supplier delivery', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-04T11:00:00Z' },
  { id: 'sm5', productId: 'p3', productName: 'HDPE Packaging Drum 200L', type: 'out', quantity: 30, reason: 'Challan CH-2026-000010', reference: 'ch1', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-04T09:00:00Z' },
  { id: 'sm6', productId: 'p4', productName: 'Safety Gloves (Box of 100)', type: 'out', quantity: 25, reason: 'Internal consumption', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-03T16:00:00Z' },
  { id: 'sm7', productId: 'p6', productName: 'Methanol Technical Grade', type: 'out', quantity: 135, reason: 'Challan CH-2026-000009', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-03T10:00:00Z' },
  { id: 'sm8', productId: 'p7', productName: 'Polypropylene Bags 50kg', type: 'in', quantity: 2000, reason: 'Supplier delivery', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-02T14:00:00Z' },
  { id: 'sm9', productId: 'p9', productName: 'Citric Acid Monohydrate', type: 'in', quantity: 300, reason: 'Purchase order received', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-02T10:00:00Z' },
  { id: 'sm10', productId: 'p10', productName: 'Jerry Can 20L HDPE', type: 'out', quantity: 100, reason: 'Challan CH-2026-000008', createdBy: 'u3', createdByName: 'Rakesh Kumar', createdAt: '2026-08-01T15:00:00Z' },
];

// ── Challans ──
export const mockChallans: Challan[] = [
  {
    id: 'ch1', challanNumber: 'CH-2026-000010', customerId: 'c1', customerName: 'Vijay Traders', customerBusiness: 'Vijay Traders Pvt Ltd',
    status: 'confirmed',
    items: [
      { id: 'ci1', productId: 'p1', productName: 'Industrial Solvent Grade A', sku: 'CHEM-SOL-001', unitPrice: 2450.00, quantity: 100, total: 245000.00 },
      { id: 'ci2', productId: 'p3', productName: 'HDPE Packaging Drum 200L', sku: 'PKG-DRM-001', unitPrice: 1850.00, quantity: 30, total: 55500.00 },
    ],
    totalQuantity: 130, totalAmount: 300500.00, createdBy: 'u2', createdByName: 'Priya Sharma',
    createdAt: '2026-08-04T09:00:00Z', updatedAt: '2026-08-04T14:00:00Z', confirmedAt: '2026-08-04T14:00:00Z',
  },
  {
    id: 'ch2', challanNumber: 'CH-2026-000011', customerId: 'c2', customerName: 'Anand Distributors', customerBusiness: 'Anand Distribution Network',
    status: 'confirmed',
    items: [
      { id: 'ci3', productId: 'p1', productName: 'Industrial Solvent Grade A', sku: 'CHEM-SOL-001', unitPrice: 2450.00, quantity: 150, total: 367500.00 },
      { id: 'ci4', productId: 'p5', productName: 'Sodium Hydroxide Flakes', sku: 'CHEM-SOH-003', unitPrice: 1800.00, quantity: 200, total: 360000.00 },
    ],
    totalQuantity: 350, totalAmount: 727500.00, createdBy: 'u2', createdByName: 'Priya Sharma',
    createdAt: '2026-08-05T09:00:00Z', updatedAt: '2026-08-05T11:00:00Z', confirmedAt: '2026-08-05T11:00:00Z',
  },
  {
    id: 'ch3', challanNumber: 'CH-2026-000012', customerId: 'c6', customerName: 'Bharat Chemicals', customerBusiness: 'Bharat Chemical Industries',
    status: 'draft',
    items: [
      { id: 'ci5', productId: 'p2', productName: 'Acetic Acid 99%', sku: 'CHEM-ACE-002', unitPrice: 3200.00, quantity: 55, total: 176000.00 },
      { id: 'ci6', productId: 'p9', productName: 'Citric Acid Monohydrate', sku: 'CHEM-CIT-005', unitPrice: 1650.00, quantity: 80, total: 132000.00 },
    ],
    totalQuantity: 135, totalAmount: 308000.00, createdBy: 'u2', createdByName: 'Priya Sharma',
    createdAt: '2026-08-06T10:00:00Z', updatedAt: '2026-08-06T10:00:00Z',
  },
  {
    id: 'ch4', challanNumber: 'CH-2026-000013', customerId: 'c7', customerName: 'Rajesh Enterprises', customerBusiness: 'Rajesh Enterprises & Sons',
    status: 'draft',
    items: [
      { id: 'ci7', productId: 'p5', productName: 'Sodium Hydroxide Flakes', sku: 'CHEM-SOH-003', unitPrice: 1800.00, quantity: 300, total: 540000.00 },
    ],
    totalQuantity: 300, totalAmount: 540000.00, createdBy: 'u2', createdByName: 'Priya Sharma',
    createdAt: '2026-08-07T08:30:00Z', updatedAt: '2026-08-07T08:30:00Z',
  },
  {
    id: 'ch5', challanNumber: 'CH-2026-000009', customerId: 'c3', customerName: 'Sri Lakshmi Stores', customerBusiness: 'Sri Lakshmi General Stores',
    status: 'cancelled',
    items: [
      { id: 'ci8', productId: 'p6', productName: 'Methanol Technical Grade', sku: 'CHEM-MET-004', unitPrice: 2800.00, quantity: 135, total: 378000.00 },
    ],
    totalQuantity: 135, totalAmount: 378000.00, createdBy: 'u2', createdByName: 'Priya Sharma',
    createdAt: '2026-08-03T10:00:00Z', updatedAt: '2026-08-03T15:00:00Z', cancelledAt: '2026-08-03T15:00:00Z',
  },
];

// ── Dashboard Activity ──
export const mockActivities: DashboardActivity[] = [
  { id: 'a1', type: 'challan_created', description: 'New draft challan CH-2026-000013 created for Rajesh Enterprises', user: 'Priya Sharma', timestamp: '2026-08-07T08:30:00Z' },
  { id: 'a2', type: 'stock_adjusted', description: 'Stock inward: 500L Industrial Solvent Grade A', user: 'Rakesh Kumar', timestamp: '2026-08-06T10:00:00Z' },
  { id: 'a3', type: 'challan_created', description: 'New draft challan CH-2026-000012 created for Bharat Chemicals', user: 'Priya Sharma', timestamp: '2026-08-06T10:00:00Z' },
  { id: 'a4', type: 'challan_confirmed', description: 'Challan CH-2026-000011 confirmed for Anand Distributors', user: 'Priya Sharma', timestamp: '2026-08-05T11:00:00Z' },
  { id: 'a5', type: 'followup_added', description: 'Follow-up added for Anand Distributors', user: 'Priya Sharma', timestamp: '2026-08-01T11:00:00Z' },
  { id: 'a6', type: 'customer_created', description: 'New lead: Sunrise Trading Company', user: 'Arjun Mehta', timestamp: '2026-07-20T15:00:00Z' },
  { id: 'a7', type: 'product_created', description: 'New product added: Jerry Can 20L HDPE', user: 'Rakesh Kumar', timestamp: '2026-02-01T10:00:00Z' },
];

// ── Stock Chart Data (last 7 days) ──
export const mockStockChartData: StockChartData[] = [
  { date: '2026-08-01', inward: 0, outward: 100 },
  { date: '2026-08-02', inward: 2300, outward: 0 },
  { date: '2026-08-03', inward: 0, outward: 160 },
  { date: '2026-08-04', inward: 800, outward: 30 },
  { date: '2026-08-05', inward: 500, outward: 205 },
  { date: '2026-08-06', inward: 500, outward: 0 },
  { date: '2026-08-07', inward: 0, outward: 135 },
];
