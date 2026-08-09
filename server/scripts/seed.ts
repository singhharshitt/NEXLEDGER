import bcrypt from "bcrypt";
import type { PoolClient } from "pg";
import { pool, closeDatabase } from "../src/config/database";
import { env } from "../src/config/env";
import { login } from "../src/services/auth.service";

type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";
type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

const DEMO_PASSWORD = "NexLedger@2026!";
const DEMO_DOMAIN = "nexledger.example.com";
const CUSTOMER_DOMAIN = "customers.nexledger.example.com";
const SKU_PREFIX = "NX-";
const year = new Date().getFullYear();

function daysFromNow(days: number, hour = 10): Date {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function dateOnly(days: number): string {
  return daysFromNow(days).toISOString().split("T")[0];
}

function challanNumber(sequence: number): string {
  return `CH-${year}-${String(900000 + sequence).padStart(6, "0")}`;
}

async function getTableColumns(client: PoolClient, tableName: string): Promise<Set<string>> {
  const { rows } = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return new Set(rows.map((row) => row.column_name as string));
}

function addColumn(
  availableColumns: Set<string>,
  columns: string[],
  values: unknown[],
  columnName: string,
  value: unknown
): void {
  if (availableColumns.has(columnName) && !columns.includes(columnName)) {
    columns.push(columnName);
    values.push(value);
  }
}

async function insertRow(
  client: PoolClient,
  tableName: string,
  columns: string[],
  values: unknown[]
): Promise<{ id: string }> {
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(",");
  const { rows } = await client.query(
    `INSERT INTO ${tableName} (${columns.join(", ")})
     VALUES (${placeholders})
     RETURNING id`,
    values
  );
  return rows[0];
}

const demoUsers: Array<{ fullName: string; email: string; role: Role }> = [
  { fullName: "Aarav Mehta", email: `admin@${DEMO_DOMAIN}`, role: "ADMIN" },
  { fullName: "Riya Kapoor", email: `sales@${DEMO_DOMAIN}`, role: "SALES" },
  { fullName: "Kabir Sinha", email: `sales.north@${DEMO_DOMAIN}`, role: "SALES" },
  { fullName: "Meera Iyer", email: `sales.keyaccounts@${DEMO_DOMAIN}`, role: "SALES" },
  { fullName: "Dev Malhotra", email: `warehouse@${DEMO_DOMAIN}`, role: "WAREHOUSE" },
  { fullName: "Nisha Rao", email: `warehouse.dispatch@${DEMO_DOMAIN}`, role: "WAREHOUSE" },
  { fullName: "Ishaan Verma", email: `accounts@${DEMO_DOMAIN}`, role: "ACCOUNTS" },
  { fullName: "Tara Shah", email: `accounts.receivables@${DEMO_DOMAIN}`, role: "ACCOUNTS" },
];

const customerSeed = [
  ["Metro Traders", "Ankit Bansal", "RETAIL", "ACTIVE", "Delhi", "Delhi", -1, 250000],
  ["Sharma Wholesale Mart", "Pooja Sharma", "WHOLESALE", "ACTIVE", "Lucknow", "Uttar Pradesh", 0, 600000],
  ["NorthStar Distributors", "Naveen Chawla", "DISTRIBUTOR", "ACTIVE", "Jaipur", "Rajasthan", 3, 850000],
  ["Apex Retail Hub", "Sahil Gupta", "RETAIL", "LEAD", "Noida", "Uttar Pradesh", 7, 120000],
  ["Varanasi Tech Supplies", "Kritika Singh", "WHOLESALE", "ACTIVE", "Varanasi", "Uttar Pradesh", -3, 450000],
  ["Lotus Office Mart", "Rohan Kulkarni", "RETAIL", "ACTIVE", "Pune", "Maharashtra", 14, 180000],
  ["Kashi Digital Depot", "Aditi Mishra", "DISTRIBUTOR", "LEAD", "Prayagraj", "Uttar Pradesh", 1, 500000],
  ["Skyline Peripheral House", "Manav Jain", "WHOLESALE", "ACTIVE", "Gurugram", "Haryana", null, 400000],
  ["Pragati Retail Stores", "Neelam Yadav", "RETAIL", "INACTIVE", "Kanpur", "Uttar Pradesh", -8, 75000],
  ["Eastern Supply Co", "Rahul Sen", "DISTRIBUTOR", "ACTIVE", "Kolkata", "West Bengal", 5, 900000],
  ["Capital Network Bazaar", "Simran Kaur", "WHOLESALE", "ACTIVE", "Delhi", "Delhi", -2, 520000],
  ["Vaibhav Stationers", "Gaurav Joshi", "RETAIL", "ACTIVE", "Indore", "Madhya Pradesh", 2, 160000],
  ["Jaipur Gadget Centre", "Ira Rathore", "RETAIL", "LEAD", "Jaipur", "Rajasthan", 10, 140000],
  ["Gomti Trading House", "Vikas Tiwari", "WHOLESALE", "ACTIVE", "Lucknow", "Uttar Pradesh", -6, 380000],
  ["Sunrise IT Resellers", "Mitali Das", "DISTRIBUTOR", "ACTIVE", "Patna", "Bihar", 4, 720000],
  ["BluePeak Distribution", "Arjun Nair", "DISTRIBUTOR", "ACTIVE", "Bengaluru", "Karnataka", null, 950000],
  ["Om Sai Computer Needs", "Chetan Patil", "RETAIL", "ACTIVE", "Nagpur", "Maharashtra", 0, 110000],
  ["Bharat Office Essentials", "Sonal Agarwal", "WHOLESALE", "ACTIVE", "Bhopal", "Madhya Pradesh", 6, 430000],
  ["CityLink Electronics", "Farhan Khan", "RETAIL", "INACTIVE", "Mumbai", "Maharashtra", -12, 90000],
  ["Horizon Retail Hub", "Tanya Saxena", "RETAIL", "LEAD", "Chandigarh", "Chandigarh", 12, 135000],
  ["Royal Wholesale Point", "Harish Kapoor", "WHOLESALE", "ACTIVE", "Ludhiana", "Punjab", -4, 470000],
  ["Pearl Accessories", "Sneha Pillai", "RETAIL", "ACTIVE", "Kochi", "Kerala", 8, 130000],
  ["Narmada Supply Syndicate", "Dhruv Bhatt", "DISTRIBUTOR", "ACTIVE", "Vadodara", "Gujarat", 3, 780000],
  ["Vertex Business Supplies", "Lavanya Reddy", "WHOLESALE", "LEAD", "Hyderabad", "Telangana", 15, 390000],
  ["BrightByte Traders", "Ritesh Menon", "RETAIL", "ACTIVE", "Chennai", "Tamil Nadu", null, 175000],
  ["Delta Warehouse Partners", "Nitin Suri", "DISTRIBUTOR", "ACTIVE", "Ghaziabad", "Uttar Pradesh", -7, 880000],
  ["Greenline Corporate Supply", "Ananya Bose", "WHOLESALE", "ACTIVE", "Kolkata", "West Bengal", 1, 510000],
  ["PrimeTech Retail", "Mohit Arora", "RETAIL", "LEAD", "Faridabad", "Haryana", 9, 125000],
  ["RapidLink Distributors", "Prerna Sethi", "DISTRIBUTOR", "ACTIVE", "Surat", "Gujarat", 11, 820000],
  ["SilverStone Office Needs", "Kunal Dutta", "WHOLESALE", "INACTIVE", "Ranchi", "Jharkhand", -10, 220000],
  ["Triveni Wholesale", "Bhavna Tripathi", "WHOLESALE", "ACTIVE", "Allahabad", "Uttar Pradesh", 2, 410000],
  ["CoreGrid Networking", "Yash Bedi", "DISTRIBUTOR", "ACTIVE", "Ahmedabad", "Gujarat", -5, 760000],
  ["Unity Mobile Accessories", "Jaya Nambiar", "RETAIL", "ACTIVE", "Coimbatore", "Tamil Nadu", 4, 145000],
  ["Summit Stationers", "Parth Desai", "RETAIL", "LEAD", "Rajkot", "Gujarat", 13, 115000],
  ["Coral Distribution House", "Rehan Qureshi", "DISTRIBUTOR", "INACTIVE", "Bhubaneswar", "Odisha", null, 650000],
  ["NovaDesk Supplies", "Amrita Lal", "WHOLESALE", "ACTIVE", "Dehradun", "Uttarakhand", 7, 340000],
] as const;

const products = [
  { key: "keyboard", name: "Wireless Keyboard", sku: "NX-KEY-WLS-001", category: "Computer Accessories", unitPrice: 1199, finalStock: 80, minStock: 20 },
  { key: "mouse", name: "USB Optical Mouse", sku: "NX-MSE-USB-002", category: "Computer Accessories", unitPrice: 399, finalStock: 142, minStock: 25 },
  { key: "hdmi", name: "HDMI Cable 2m", sku: "NX-CBL-HDM-003", category: "Cables", unitPrice: 249, finalStock: 360, minStock: 50 },
  { key: "stand", name: "Aluminium Laptop Stand", sku: "NX-STD-LAP-004", category: "Office Supplies", unitPrice: 1299, finalStock: 38, minStock: 10 },
  { key: "monitor", name: "24 Inch LED Monitor", sku: "NX-MON-024-005", category: "Electronics", unitPrice: 8499, finalStock: 18, minStock: 5 },
  { key: "paper", name: "A4 Copier Paper Ream", sku: "NX-PPR-A4R-006", category: "Office Supplies", unitPrice: 289, finalStock: 610, minStock: 120 },
  { key: "ink", name: "Black Ink Cartridge", sku: "NX-INK-BLK-007", category: "Printer Supplies", unitPrice: 949, finalStock: 9, minStock: 18 },
  { key: "switch", name: "8 Port Network Switch", sku: "NX-NET-SW8-008", category: "Networking", unitPrice: 2199, finalStock: 14, minStock: 16 },
  { key: "webcam", name: "HD Webcam", sku: "NX-CAM-WEB-009", category: "Electronics", unitPrice: 1599, finalStock: 7, minStock: 12 },
  { key: "ethernet", name: "Cat6 Ethernet Cable 5m", sku: "NX-CBL-CAT-010", category: "Cables", unitPrice: 199, finalStock: 0, minStock: 40 },
  { key: "chair", name: "Ergo Office Chair", sku: "NX-FUR-CHR-011", category: "Furniture", unitPrice: 4599, finalStock: 6, minStock: 8 },
  { key: "whiteboard", name: "Whiteboard 4x3 ft", sku: "NX-OFC-WBD-012", category: "Office Supplies", unitPrice: 1899, finalStock: 0, minStock: 4 },
  { key: "stapler", name: "Heavy Duty Stapler", sku: "NX-STA-HDS-013", category: "Stationery", unitPrice: 349, finalStock: 48, minStock: 20 },
  { key: "cabinet", name: "Steel File Cabinet", sku: "NX-FUR-CAB-014", category: "Furniture", unitPrice: 3299, finalStock: 2, minStock: 5 },
  { key: "ssd", name: "512GB SATA SSD", sku: "NX-STR-SSD-015", category: "Storage Devices", unitPrice: 2999, finalStock: 31, minStock: 10 },
  { key: "powerbank", name: "10000mAh Power Bank", sku: "NX-MOB-PWB-016", category: "Mobile Accessories", unitPrice: 1499, finalStock: 54, minStock: 15 },
  { key: "hub", name: "USB-C 6-in-1 Hub", sku: "NX-HUB-USC-017", category: "Computer Accessories", unitPrice: 1799, finalStock: 0, minStock: 12 },
  { key: "router", name: "Dual Band WiFi Router", sku: "NX-NET-RTR-018", category: "Networking", unitPrice: 2499, finalStock: 11, minStock: 14 },
  { key: "scanner", name: "Handheld Barcode Scanner", sku: "NX-POS-SCN-019", category: "POS Hardware", unitPrice: 3699, finalStock: 13, minStock: 6 },
  { key: "printer", name: "Thermal Receipt Printer", sku: "NX-POS-PRN-020", category: "POS Hardware", unitPrice: 5999, finalStock: 5, minStock: 4 },
  { key: "toner", name: "Laser Toner Cartridge", sku: "NX-PRN-TON-021", category: "Printer Supplies", unitPrice: 1299, finalStock: 22, minStock: 8 },
  { key: "rolls", name: "POS Billing Paper Rolls", sku: "NX-POS-ROL-022", category: "POS Hardware", unitPrice: 69, finalStock: 240, minStock: 50 },
  { key: "cctv", name: "Indoor CCTV Camera", sku: "NX-SEC-CAM-023", category: "Electronics", unitPrice: 2199, finalStock: 19, minStock: 8 },
  { key: "speaker", name: "Bluetooth Counter Speaker", sku: "NX-AUD-SPK-024", category: "Electronics", unitPrice: 1299, finalStock: 0, minStock: 10 },
  { key: "tabletStand", name: "Counter Tablet Stand", sku: "NX-POS-TST-025", category: "POS Hardware", unitPrice: 999, finalStock: 27, minStock: 10 },
  { key: "tester", name: "LAN Cable Tester", sku: "NX-NET-TST-026", category: "Networking", unitPrice: 899, finalStock: 16, minStock: 5 },
] as const;

type ProductKey = (typeof products)[number]["key"];

const challanPlans: Array<{
  customer: string;
  status: ChallanStatus;
  createdOffset: number;
  createdBy: Role;
  notes: string;
  items: Array<{ product: ProductKey; quantity: number; snapshotPrice?: number }>;
}> = [
  { customer: "Metro Traders", status: "CONFIRMED", createdOffset: -1, createdBy: "SALES", notes: "Main demo scenario: keyboard stock reduced after confirmation.", items: [{ product: "keyboard", quantity: 20, snapshotPrice: 999 }] },
  { customer: "Sharma Wholesale Mart", status: "CONFIRMED", createdOffset: -2, createdBy: "SALES", notes: "Repeat wholesale order for office accessories.", items: [{ product: "mouse", quantity: 28 }, { product: "hdmi", quantity: 40 }, { product: "paper", quantity: 80 }] },
  { customer: "NorthStar Distributors", status: "CONFIRMED", createdOffset: -4, createdBy: "SALES", notes: "Distributor bundle for Jaipur retailers.", items: [{ product: "router", quantity: 8, snapshotPrice: 2299 }, { product: "switch", quantity: 10 }, { product: "tester", quantity: 4 }] },
  { customer: "Varanasi Tech Supplies", status: "CONFIRMED", createdOffset: -6, createdBy: "SALES", notes: "Printer supplies dispatch.", items: [{ product: "ink", quantity: 24 }, { product: "toner", quantity: 10 }, { product: "rolls", quantity: 100 }] },
  { customer: "Eastern Supply Co", status: "CONFIRMED", createdOffset: -8, createdBy: "SALES", notes: "POS hardware replenishment.", items: [{ product: "scanner", quantity: 5 }, { product: "printer", quantity: 3 }, { product: "tabletStand", quantity: 12 }] },
  { customer: "Capital Network Bazaar", status: "CONFIRMED", createdOffset: -10, createdBy: "SALES", notes: "Network cable clearance.", items: [{ product: "ethernet", quantity: 65 }, { product: "hdmi", quantity: 25 }] },
  { customer: "Gomti Trading House", status: "CONFIRMED", createdOffset: -14, createdBy: "SALES", notes: "Furniture and office setup order.", items: [{ product: "chair", quantity: 9 }, { product: "cabinet", quantity: 6 }, { product: "whiteboard", quantity: 7 }] },
  { customer: "Sunrise IT Resellers", status: "CONFIRMED", createdOffset: -18, createdBy: "SALES", notes: "Storage and monitor order.", items: [{ product: "ssd", quantity: 14 }, { product: "monitor", quantity: 6 }, { product: "stand", quantity: 12 }] },
  { customer: "BluePeak Distribution", status: "CONFIRMED", createdOffset: -23, createdBy: "SALES", notes: "Mobile accessories campaign stock.", items: [{ product: "powerbank", quantity: 30 }, { product: "speaker", quantity: 18 }, { product: "webcam", quantity: 16 }] },
  { customer: "Narmada Supply Syndicate", status: "CONFIRMED", createdOffset: -31, createdBy: "SALES", notes: "Mixed accessories shipment.", items: [{ product: "hub", quantity: 22 }, { product: "keyboard", quantity: 16 }, { product: "mouse", quantity: 32 }, { product: "stapler", quantity: 25 }] },
  { customer: "CoreGrid Networking", status: "CONFIRMED", createdOffset: -38, createdBy: "SALES", notes: "Networking replenishment cycle.", items: [{ product: "switch", quantity: 6 }, { product: "router", quantity: 7 }, { product: "tester", quantity: 3 }, { product: "ethernet", quantity: 40 }, { product: "cctv", quantity: 6 }] },
  { customer: "Apex Retail Hub", status: "DRAFT", createdOffset: 0, createdBy: "SALES", notes: "Awaiting customer approval.", items: [{ product: "monitor", quantity: 2 }, { product: "keyboard", quantity: 5 }] },
  { customer: "Lotus Office Mart", status: "DRAFT", createdOffset: -1, createdBy: "SALES", notes: "Price discussion in progress.", items: [{ product: "paper", quantity: 60 }] },
  { customer: "Jaipur Gadget Centre", status: "DRAFT", createdOffset: -3, createdBy: "SALES", notes: "Lead requested a starter bundle.", items: [{ product: "powerbank", quantity: 12 }, { product: "webcam", quantity: 4 }, { product: "speaker", quantity: 5 }] },
  { customer: "Vertex Business Supplies", status: "DRAFT", createdOffset: -5, createdBy: "SALES", notes: "Credit approval pending.", items: [{ product: "chair", quantity: 3 }, { product: "cabinet", quantity: 2 }, { product: "whiteboard", quantity: 2 }, { product: "stapler", quantity: 12 }] },
  { customer: "PrimeTech Retail", status: "DRAFT", createdOffset: -7, createdBy: "SALES", notes: "Draft for new retail prospect.", items: [{ product: "mouse", quantity: 20 }, { product: "hdmi", quantity: 30 }] },
  { customer: "NovaDesk Supplies", status: "DRAFT", createdOffset: -9, createdBy: "SALES", notes: "Awaiting final delivery address.", items: [{ product: "printer", quantity: 2 }, { product: "rolls", quantity: 80 }, { product: "scanner", quantity: 2 }] },
  { customer: "CityLink Electronics", status: "CANCELLED", createdOffset: -12, createdBy: "SALES", notes: "Cancelled after confirmation; stock restored.", items: [{ product: "cctv", quantity: 4 }, { product: "speaker", quantity: 6 }] },
  { customer: "SilverStone Office Needs", status: "CANCELLED", createdOffset: -20, createdBy: "SALES", notes: "Cancelled before dispatch; stock restored.", items: [{ product: "paper", quantity: 50 }, { product: "toner", quantity: 6 }] },
  { customer: "Coral Distribution House", status: "CANCELLED", createdOffset: -28, createdBy: "SALES", notes: "Draft cancelled due inactive account.", items: [{ product: "hub", quantity: 4 }, { product: "tabletStand", quantity: 3 }] },
];

async function deleteExistingDemoData(client: PoolClient): Promise<void> {
  await client.query(
    `DELETE FROM challan_items
     WHERE challan_id IN (
       SELECT c.id FROM challans c
       LEFT JOIN customers cu ON cu.id = c.customer_id
       LEFT JOIN users u ON u.id = c.created_by
       WHERE cu.email LIKE $1 OR u.email LIKE $2 OR c.challan_number LIKE $3
     )`,
    [`%@${CUSTOMER_DOMAIN}`, `%@${DEMO_DOMAIN}`, `CH-${year}-9%`]
  );
  await client.query(
    `DELETE FROM stock_movements
     WHERE product_id IN (SELECT id FROM products WHERE sku LIKE $1)
        OR created_by IN (SELECT id FROM users WHERE email LIKE $2)
        OR reference_id IN (
          SELECT id FROM challans WHERE challan_number LIKE $3
        )`,
    [`${SKU_PREFIX}%`, `%@${DEMO_DOMAIN}`, `CH-${year}-9%`]
  );
  await client.query(
    `DELETE FROM challans
     WHERE challan_number LIKE $1
        OR customer_id IN (SELECT id FROM customers WHERE email LIKE $2)
        OR created_by IN (SELECT id FROM users WHERE email LIKE $3)`,
    [`CH-${year}-9%`, `%@${CUSTOMER_DOMAIN}`, `%@${DEMO_DOMAIN}`]
  );
  await client.query(`DELETE FROM customer_followups WHERE customer_id IN (SELECT id FROM customers WHERE email LIKE $1)`, [`%@${CUSTOMER_DOMAIN}`]);
  await client.query(`DELETE FROM customers WHERE email LIKE $1`, [`%@${CUSTOMER_DOMAIN}`]);
  await client.query(`DELETE FROM products WHERE sku LIKE $1`, [`${SKU_PREFIX}%`]);
  await client.query(`DELETE FROM users WHERE email LIKE $1`, [`%@${DEMO_DOMAIN}`]);
}

async function resetAllData(client: PoolClient): Promise<void> {
  await client.query(
    `TRUNCATE TABLE
       challan_items,
       challans,
       customer_followups,
       stock_movements,
       products,
       customers,
       users,
       challan_sequences
     RESTART IDENTITY CASCADE`
  );
}

async function insertUsers(client: PoolClient): Promise<Record<Role, string>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.BCRYPT_ROUNDS);
  const primaryUserIds = {} as Record<Role, string>;
  const availableColumns = await getTableColumns(client, "users");

  for (const user of demoUsers) {
    const columns = ["full_name", "email", "password_hash", "role", "is_active", "created_at", "updated_at"];
    const createdAt = daysFromNow(-55);
    const values = [user.fullName, user.email, passwordHash, user.role, true, createdAt, createdAt];

    addColumn(availableColumns, columns, values, "name", user.fullName);

    const row = await insertRow(client, "users", columns, values);
    if (!primaryUserIds[user.role]) primaryUserIds[user.role] = row.id;
  }

  return primaryUserIds;
}

async function insertCustomers(client: PoolClient, userIds: Record<Role, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  const availableColumns = await getTableColumns(client, "customers");

  for (let i = 0; i < customerSeed.length; i++) {
    const [businessName, contactName, type, status, city, state, followOffset, creditLimit] = customerSeed[i];
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
    const hasGstin = i % 5 !== 3;
    const createdAt = daysFromNow(-45 + i, 9);
    
    const columns = [
      "business_name", "contact_name", "email", "mobile", "address", "city", "state", "gstin",
      "type", "status", "credit_limit", "notes", "follow_up_date", "created_by", "created_at", "updated_at"
    ];
    
    const values = [
      businessName,
      contactName,
      `${slug}@${CUSTOMER_DOMAIN}`,
      `98${String(76000000 + i).padStart(8, "0")}`,
      `${12 + i}, ${city} Trade Market`,
      city,
      state,
      hasGstin ? `27AA${String(1000 + i)}NX${String.fromCharCode(65 + (i % 26))}1Z${i % 9}` : null,
      type as CustomerType,
      status as CustomerStatus,
      creditLimit,
      `${businessName} is part of the NexLedger demo distribution pipeline.`,
      followOffset === null ? null : dateOnly(Number(followOffset)),
      userIds.SALES,
      createdAt,
      createdAt
    ];

    addColumn(availableColumns, columns, values, "customer_type", type);
    addColumn(availableColumns, columns, values, "customer_status", status);
    addColumn(availableColumns, columns, values, "customer_name", businessName);

    const row = await insertRow(client, "customers", columns, values);
    ids.set(businessName, row.id);
  }

  return ids;
}

async function insertFollowUps(client: PoolClient, customerIds: Map<string, string>, userIds: Record<Role, string>): Promise<void> {
  const followUps = [
    ["Metro Traders", -20, "Initial product discussion for keyboard and mouse bundle.", true],
    ["Metro Traders", -12, "Shared revised wholesale price list with historical keyboard price.", true],
    ["Metro Traders", -1, "Confirmed order and scheduled next replenishment discussion.", false],
    ["Sharma Wholesale Mart", -9, "Reviewed office stationery reorder volume.", true],
    ["Sharma Wholesale Mart", 0, "Call due today for August purchase forecast.", false],
    ["NorthStar Distributors", -6, "Mapped Jaipur dealer requirements.", true],
    ["NorthStar Distributors", 3, "Follow up on router and switch replenishment.", false],
    ["Apex Retail Hub", 7, "New lead needs sample quote approval.", false],
    ["Varanasi Tech Supplies", -3, "Overdue: requested printer supply credit terms.", false],
    ["Capital Network Bazaar", -2, "Overdue: confirm networking bundle balance.", false],
    ["Gomti Trading House", -6, "Overdue: furniture delivery feedback pending.", false],
    ["Sunrise IT Resellers", 4, "Schedule SSD replenishment review.", false],
    ["BluePeak Distribution", -18, "Distributor onboarding completed.", true],
    ["Narmada Supply Syndicate", 3, "Review quarterly accessories forecast.", false],
    ["PrimeTech Retail", 9, "Lead asked for HDMI and mouse demo pricing.", false],
    ["CoreGrid Networking", -5, "Overdue: confirm LAN tester reorder.", false],
    ["Unity Mobile Accessories", 4, "Upcoming accessories promotion discussion.", false],
    ["NovaDesk Supplies", 7, "Confirm delivery address and dispatch window.", false],
  ] as const;

  const availableColumns = await getTableColumns(client, "customer_followups");

  for (let i = 0; i < followUps.length; i++) {
    const [customerName, offset, notes, completed] = followUps[i];
    const customerId = customerIds.get(customerName as string);
    if (!customerId) continue;

    const columns = ["customer_id", "follow_up_date", "created_by", "created_at"];
    const values = [customerId, dateOnly(offset as number), userIds.SALES, daysFromNow((offset as number) - 1, 11)];

    if (availableColumns.has("notes")) {
      columns.push("notes");
      values.push(notes);
    } else if (availableColumns.has("note")) {
      columns.push("note");
      values.push(notes);
    }

    if (availableColumns.has("completed")) {
      columns.push("completed");
      values.push(completed);
    } else if (availableColumns.has("is_completed")) {
      columns.push("is_completed");
      values.push(completed);
    }

    await insertRow(client, "customer_followups", columns, values);
  }
}

async function insertProducts(client: PoolClient, userIds: Record<Role, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  const availableColumns = await getTableColumns(client, "products");

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    const columns = [
      "name", "sku", "description", "category", "unit", "unit_price",
      "current_stock", "minimum_stock", "is_active", "created_by", "created_at", "updated_at"
    ];
    
    const values = [
      product.name,
      product.sku,
      `${product.name} for wholesale and distribution demo workflows.`,
      product.category,
      "pcs",
      product.unitPrice,
      product.finalStock,
      product.minStock,
      true,
      userIds.ADMIN,
      daysFromNow(-70 + i, 8),
      daysFromNow(-70 + i, 8)
    ];

    addColumn(availableColumns, columns, values, "price", product.unitPrice);
    addColumn(availableColumns, columns, values, "stock_quantity", product.finalStock);
    addColumn(availableColumns, columns, values, "product_name", product.name);

    const row = await insertRow(client, "products", columns, values);
    ids.set(product.key, row.id);
  }

  return ids;
}

function getActiveSalesByProduct(): Map<string, number> {
  const totals = new Map<string, number>();
  for (const challan of challanPlans.filter((plan) => plan.status === "CONFIRMED")) {
    for (const item of challan.items) {
      totals.set(item.product, (totals.get(item.product) ?? 0) + item.quantity);
    }
  }
  return totals;
}

function getCancelledSalesByProduct(): Map<string, number> {
  const totals = new Map<string, number>();
  for (const challan of challanPlans.filter((plan) => plan.status === "CANCELLED")) {
    for (const item of challan.items) {
      totals.set(item.product, (totals.get(item.product) ?? 0) + item.quantity);
    }
  }
  return totals;
}

async function insertBaseStockMovements(
  client: PoolClient,
  productIds: Map<string, string>,
  userIds: Record<Role, string>
): Promise<void> {
  const activeSales = getActiveSalesByProduct();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productId = productIds.get(product.key)!;
    let restockIn = i % 4 === 0 ? 15 + (i % 3) * 5 : 0;
    let returnIn = i % 7 === 0 ? 3 : 0;
    const forcedOut = product.finalStock === 0 ? product.minStock + 8 : i % 5 === 0 ? 6 : 0;
    let initialStock = product.finalStock + (activeSales.get(product.key) ?? 0) + forcedOut - restockIn - returnIn;

    if (initialStock <= 0) {
      restockIn = 0;
      returnIn = 0;
      initialStock = product.finalStock + (activeSales.get(product.key) ?? 0) + forcedOut;
    }

    await client.query(
      `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by, created_at)
       VALUES ($1,$2,'IN',$3,NULL,$4,$5)`,
      [productId, initialStock, "Initial stock - Delhi Warehouse", userIds.WAREHOUSE, daysFromNow(-82 + i, 8)]
    );

    if (restockIn > 0) {
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by, created_at)
         VALUES ($1,$2,'IN',$3,NULL,$4,$5)`,
        [productId, restockIn, "Restock purchase - Lucknow Warehouse", userIds.WAREHOUSE, daysFromNow(-28 + (i % 8), 13)]
      );
    }

    if (returnIn > 0) {
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by, created_at)
         VALUES ($1,$2,'IN',$3,NULL,$4,$5)`,
        [productId, returnIn, "Customer return accepted into Jaipur Warehouse", userIds.WAREHOUSE, daysFromNow(-11 + (i % 4), 12)]
      );
    }

    if (forcedOut > 0) {
      const forcedOutAt = product.finalStock === 0
        ? daysFromNow(-3 + (i % 2), 16)
        : daysFromNow(-16 + (i % 7), 16);
      await client.query(
        `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by, created_at)
         VALUES ($1,$2,'OUT',$3,NULL,$4,$5)`,
        [productId, forcedOut, "Manual adjustment - damaged or sample stock", userIds.WAREHOUSE, forcedOutAt]
      );
    }
  }
}

async function insertChallans(
  client: PoolClient,
  customerIds: Map<string, string>,
  productIds: Map<string, string>,
  userIds: Record<Role, string>
): Promise<void> {
  const productByKey = new Map(products.map((product) => [product.key, product]));

  for (let i = 0; i < challanPlans.length; i++) {
    const plan = challanPlans[i];
    const items = plan.items.map((item) => {
      const product = productByKey.get(item.product)!;
      const unitPrice = item.snapshotPrice ?? product.unitPrice;
      return {
        productId: productIds.get(item.product)!,
        name: product.name,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        totalPrice: unitPrice * item.quantity,
      };
    });
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const createdAt = daysFromNow(plan.createdOffset, 10 + (i % 5));
    const confirmedAt = plan.status === "CONFIRMED" || (plan.status === "CANCELLED" && i < 19)
      ? daysFromNow(plan.createdOffset, 12 + (i % 5))
      : null;
    const cancelledAt = plan.status === "CANCELLED" ? daysFromNow(plan.createdOffset + 1, 14) : null;

    const { rows } = await client.query(
      `INSERT INTO challans (
        challan_number, customer_id, status, notes, total_quantity, total_amount,
        confirmed_at, cancelled_at, created_by, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [
        challanNumber(i + 1),
        customerIds.get(plan.customer),
        plan.status,
        plan.notes,
        totalQuantity,
        totalAmount,
        plan.status === "CONFIRMED" ? confirmedAt : null,
        cancelledAt,
        userIds[plan.createdBy],
        createdAt,
        cancelledAt ?? confirmedAt ?? createdAt,
      ]
    );
    const challanId = rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO challan_items (
          challan_id, product_id, product_name_snapshot, sku_snapshot,
          unit_price_snapshot, quantity, total_price
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [challanId, item.productId, item.name, item.sku, item.unitPrice, item.quantity, item.totalPrice]
      );

      if (plan.status === "CONFIRMED") {
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by, created_at)
           VALUES ($1,$2,'OUT',$3,$4,$5,$6)`,
          [item.productId, item.quantity, `Challan confirmation: ${challanNumber(i + 1)}`, challanId, userIds.SALES, confirmedAt]
        );
      }

      if (plan.status === "CANCELLED" && confirmedAt && cancelledAt) {
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity, type, notes, reference_id, created_by, created_at)
           VALUES ($1,$2,'OUT',$3,$4,$5,$6), ($1,$2,'IN',$7,$4,$8,$9)`,
          [
            item.productId,
            item.quantity,
            `Challan confirmation: ${challanNumber(i + 1)}`,
            challanId,
            userIds.SALES,
            confirmedAt,
            `Challan cancellation restore: ${challanNumber(i + 1)}`,
            userIds.SALES,
            cancelledAt,
          ]
        );
      }
    }
  }

  const seqCols = await getTableColumns(client, "challan_sequences");
  const colName = seqCols.has("last_sequence") ? "last_sequence" : "last_number";

  await client.query(
    `INSERT INTO challan_sequences (year, ${colName})
     VALUES ($1, $2)
     ON CONFLICT (year) DO UPDATE
     SET ${colName} = GREATEST(challan_sequences.${colName}, EXCLUDED.${colName})`,
    [year, 900000 + challanPlans.length]
  );
}

async function verifySeed(client: PoolClient): Promise<Record<string, number>> {
  const counts = await client.query(
    `SELECT
      (SELECT COUNT(*)::int FROM users WHERE email LIKE $1) AS users,
      (SELECT COUNT(*)::int FROM customers WHERE email LIKE $2) AS customers,
      (SELECT COUNT(*)::int FROM customer_followups cf JOIN customers c ON c.id = cf.customer_id WHERE c.email LIKE $2) AS followups,
      (SELECT COUNT(*)::int FROM products WHERE sku LIKE $3) AS products,
      (SELECT COUNT(*)::int FROM stock_movements sm JOIN products p ON p.id = sm.product_id WHERE p.sku LIKE $3) AS stock_movements,
      (SELECT COUNT(*)::int FROM challans WHERE challan_number LIKE $4) AS challans,
      (SELECT COUNT(*)::int FROM challan_items ci JOIN challans c ON c.id = ci.challan_id WHERE c.challan_number LIKE $4) AS challan_items`,
    [`%@${DEMO_DOMAIN}`, `%@${CUSTOMER_DOMAIN}`, `${SKU_PREFIX}%`, `CH-${year}-9%`]
  );

  const checks = [
    [`SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1`, "Duplicate user emails"],
    [`SELECT sku FROM products GROUP BY sku HAVING COUNT(*) > 1`, "Duplicate product SKUs"],
    [`SELECT challan_number FROM challans GROUP BY challan_number HAVING COUNT(*) > 1`, "Duplicate challan numbers"],
    [`SELECT id FROM products WHERE current_stock < 0`, "Negative product stock"],
    [
      `SELECT p.sku, p.current_stock,
              COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE -sm.quantity END), 0)::int AS expected_stock
       FROM products p
       LEFT JOIN stock_movements sm ON sm.product_id = p.id
       WHERE p.sku LIKE '${SKU_PREFIX}%'
       GROUP BY p.id, p.sku, p.current_stock
       HAVING p.current_stock <> COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE -sm.quantity END), 0)::int`,
      "Inventory reconciliation mismatch",
    ],
    [
      `SELECT c.challan_number
       FROM challans c
       JOIN challan_items ci ON ci.challan_id = c.id
       WHERE c.challan_number LIKE 'CH-${year}-9%'
       GROUP BY c.id, c.challan_number, c.total_quantity, c.total_amount
       HAVING c.total_quantity <> SUM(ci.quantity)::int
          OR c.total_amount <> SUM(ci.total_price)`,
      "Challan total mismatch",
    ],
  ] as const;

  for (const [sql, label] of checks) {
    const result = await client.query(sql);
    if (result.rows.length > 0) {
      throw new Error(`${label}: ${JSON.stringify(result.rows.slice(0, 5))}`);
    }
  }

  return counts.rows[0];
}

async function verifyDemoLogins(): Promise<void> {
  for (const user of demoUsers.filter((u, index) => index === 0 || ["SALES", "WAREHOUSE", "ACCOUNTS"].includes(u.role))) {
    const result = await login(user.email, DEMO_PASSWORD);
    if (!result.token || result.user.role !== user.role) {
      throw new Error(`Login verification failed for ${user.email}`);
    }
  }
}

export async function seed(): Promise<void> {
  if (env.NODE_ENV === "production") {
    console.error("Refusing to seed in production.");
    process.exit(1);
  }

  const client = await pool.connect();
  let counts: Record<string, number> | null = null;

  try {
    await client.query("BEGIN");
    console.log("Database connected");

    if (process.env.ALLOW_DB_RESET === "true") {
      console.log("Full development reset enabled by ALLOW_DB_RESET=true");
      await resetAllData(client);
    } else {
      await deleteExistingDemoData(client);
    }

    const userIds = await insertUsers(client);
    console.log(`Users seeded: ${demoUsers.length}`);

    const customerIds = await insertCustomers(client, userIds);
    console.log(`Customers seeded: ${customerIds.size}`);

    await insertFollowUps(client, customerIds, userIds);
    console.log("Follow-ups seeded: 18");

    const productIds = await insertProducts(client, userIds);
    console.log(`Products seeded: ${productIds.size}`);

    await insertBaseStockMovements(client, productIds, userIds);
    await insertChallans(client, customerIds, productIds, userIds);
    console.log(`Challans seeded: ${challanPlans.length}`);

    counts = await verifySeed(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await verifyDemoLogins();
  if (!counts) throw new Error("Seed verification did not return record counts.");

  console.log("");
  console.log("NEXLEDGER SEED COMPLETE");
  console.log(`Database: ${env.DATABASE_URL.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@")}`);
  console.log("Records created");
  console.log(`Users: ${counts.users}`);
  console.log(`Customers: ${counts.customers}`);
  console.log(`Follow-ups: ${counts.followups}`);
  console.log(`Products: ${counts.products}`);
  console.log(`Stock Movements: ${counts.stock_movements}`);
  console.log(`Challans: ${counts.challans}`);
  console.log(`Challan Items: ${counts.challan_items}`);
  console.log("");
  console.log("Demo credentials");
  console.log(`Admin: admin@${DEMO_DOMAIN}`);
  console.log(`Sales: sales@${DEMO_DOMAIN}`);
  console.log(`Warehouse: warehouse@${DEMO_DOMAIN}`);
  console.log(`Accounts: accounts@${DEMO_DOMAIN}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("");
  console.log("Validation: duplicate checks PASS, inventory reconciliation PASS, challan totals PASS, auth login PASS");

  await closeDatabase();
}

if (require.main === module) {
  seed().catch(async (err) => {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    await closeDatabase().catch(() => undefined);
    process.exit(1);
  });
}
