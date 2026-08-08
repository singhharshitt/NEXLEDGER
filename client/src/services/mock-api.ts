import type { AxiosInstance, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import {
  mockUsers,
  mockCustomers,
  mockFollowUps,
  mockProducts,
  mockStockMovements,
  mockChallans,
  mockActivities,
  mockStockChartData,
} from './mock-data';
import type {
  Customer,
  Product,
  Challan,
  ChallanItem,
  StockMovement,
  CustomerFollowUp,
} from '@/types';

// Deep clone helper
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Mutable copies for CRUD operations
let customers = clone(mockCustomers);
let products = clone(mockProducts);
let challans = clone(mockChallans);
let stockMovements = clone(mockStockMovements);
let followUps = clone(mockFollowUps);
let activities = clone(mockActivities);

let nextChallanNum = 14;
let nextId = 100;

function genId(): string {
  return `mock-${++nextId}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200));
}

function mockResponse(data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {} as AxiosHeaders,
    config: {} as InternalAxiosRequestConfig,
  };
}

export function setupMockApi(api: AxiosInstance) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    // ── AUTH ──
    if (url === '/auth/login' && method === 'post') {
      await delay(500);
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const user = mockUsers.find((u) => u.email === body.email);
      if (user && body.password === 'admin123') {
        const response = mockResponse({ token: 'mock-jwt-token-' + user.id, user });
        config.adapter = () => Promise.resolve(response);
      } else {
        config.adapter = () =>
          Promise.reject({
            response: mockResponse({ message: 'Invalid email or password' }, 401),
            isAxiosError: true,
          });
      }
      return config;
    }

    if (url === '/auth/me' && method === 'get') {
      await delay(200);
      const token = config.headers?.Authorization?.toString().replace('Bearer ', '');
      if (token?.startsWith('mock-jwt-token-')) {
        const userId = token.replace('mock-jwt-token-', '');
        const user = mockUsers.find((u) => u.id === userId);
        if (user) {
          config.adapter = () => Promise.resolve(mockResponse({ user }));
          return config;
        }
      }
      config.adapter = () =>
        Promise.reject({
          response: mockResponse({ message: 'Unauthorized' }, 401),
          isAxiosError: true,
        });
      return config;
    }

    // ── DASHBOARD ──
    if (url === '/dashboard/stats' && method === 'get') {
      await delay(300);
      config.adapter = () =>
        Promise.resolve(
          mockResponse({
            totalCustomers: customers.length,
            totalProducts: products.length,
            lowStockItems: products.filter((p) => p.status === 'low' || p.status === 'out').length,
            draftChallans: challans.filter((c) => c.status === 'draft').length,
          })
        );
      return config;
    }

    if (url === '/dashboard/activity' && method === 'get') {
      await delay(200);
      config.adapter = () => Promise.resolve(mockResponse(activities.slice(0, 10)));
      return config;
    }

    if (url === '/dashboard/stock-chart' && method === 'get') {
      await delay(200);
      config.adapter = () => Promise.resolve(mockResponse(mockStockChartData));
      return config;
    }

    if (url === '/dashboard/recent-challans' && method === 'get') {
      await delay(200);
      config.adapter = () =>
        Promise.resolve(mockResponse(challans.slice(0, 5)));
      return config;
    }

    if (url === '/dashboard/low-stock' && method === 'get') {
      await delay(200);
      config.adapter = () =>
        Promise.resolve(
          mockResponse(products.filter((p) => p.status === 'low' || p.status === 'out'))
        );
      return config;
    }

    // ── CUSTOMERS ──
    if (url === '/customers' && method === 'get') {
      await delay(300);
      const params = config.params || {};
      let filtered = [...customers];

      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.businessName.toLowerCase().includes(s) ||
            c.mobile.includes(s)
        );
      }
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((c) => c.status === params.status);
      }
      if (params.type && params.type !== 'all') {
        filtered = filtered.filter((c) => c.type === params.type);
      }

      config.adapter = () =>
        Promise.resolve(
          mockResponse({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        );
      return config;
    }

    if (url.match(/^\/customers\/[^/]+$/) && method === 'get') {
      await delay(200);
      const id = url.split('/').pop();
      const customer = customers.find((c) => c.id === id);
      if (customer) {
        config.adapter = () => Promise.resolve(mockResponse(customer));
      } else {
        config.adapter = () =>
          Promise.reject({
            response: mockResponse({ message: 'Customer not found' }, 404),
            isAxiosError: true,
          });
      }
      return config;
    }

    if (url === '/customers' && method === 'post') {
      await delay(400);
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const newCustomer: Customer = {
        id: genId(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      customers.unshift(newCustomer);
      config.adapter = () => Promise.resolve(mockResponse(newCustomer, 201));
      return config;
    }

    if (url.match(/^\/customers\/[^/]+$/) && method === 'put') {
      await delay(400);
      const id = url.split('/').pop();
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const idx = customers.findIndex((c) => c.id === id);
      if (idx !== -1) {
        customers[idx] = { ...customers[idx]!, ...body, updatedAt: new Date().toISOString() };
        config.adapter = () => Promise.resolve(mockResponse(customers[idx]));
      } else {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Not found' }, 404), isAxiosError: true });
      }
      return config;
    }

    // ── FOLLOW-UPS ──
    if (url.match(/^\/customers\/[^/]+\/followups$/) && method === 'get') {
      await delay(200);
      const customerId = url.split('/')[2];
      const customerFollowUps = followUps
        .filter((f) => f.customerId === customerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      config.adapter = () => Promise.resolve(mockResponse(customerFollowUps));
      return config;
    }

    if (url.match(/^\/customers\/[^/]+\/followups$/) && method === 'post') {
      await delay(400);
      const customerId = url.split('/')[2];
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const newFollowUp: CustomerFollowUp = {
        id: genId(),
        customerId: customerId!,
        date: body.date,
        notes: body.notes,
        createdBy: 'u1',
        createdByName: 'Arjun Mehta',
        createdAt: new Date().toISOString(),
      };
      followUps.unshift(newFollowUp);
      config.adapter = () => Promise.resolve(mockResponse(newFollowUp, 201));
      return config;
    }

    // ── PRODUCTS ──
    if (url === '/products' && method === 'get') {
      await delay(300);
      const params = config.params || {};
      let filtered = [...products];

      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
        );
      }
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((p) => p.category === params.category);
      }
      if (params.stockStatus && params.stockStatus !== 'all') {
        filtered = filtered.filter((p) => p.status === params.stockStatus);
      }

      config.adapter = () =>
        Promise.resolve(
          mockResponse({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        );
      return config;
    }

    if (url.match(/^\/products\/[^/]+$/) && method === 'get') {
      await delay(200);
      const id = url.split('/').pop();
      const product = products.find((p) => p.id === id);
      if (product) {
        config.adapter = () => Promise.resolve(mockResponse(product));
      } else {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Product not found' }, 404), isAxiosError: true });
      }
      return config;
    }

    if (url === '/products' && method === 'post') {
      await delay(400);
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const newProduct: Product = {
        id: genId(),
        ...body,
        currentStock: 0,
        status: 'out' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      products.unshift(newProduct);
      config.adapter = () => Promise.resolve(mockResponse(newProduct, 201));
      return config;
    }

    if (url.match(/^\/products\/[^/]+$/) && method === 'put') {
      await delay(400);
      const id = url.split('/').pop();
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const idx = products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        products[idx] = { ...products[idx]!, ...body, updatedAt: new Date().toISOString() };
        config.adapter = () => Promise.resolve(mockResponse(products[idx]));
      } else {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Not found' }, 404), isAxiosError: true });
      }
      return config;
    }

    // ── STOCK MOVEMENTS ──
    if (url.match(/^\/products\/[^/]+\/stock-movements$/) && method === 'get') {
      await delay(200);
      const productId = url.split('/')[2];
      const movements = stockMovements
        .filter((m) => m.productId === productId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      config.adapter = () => Promise.resolve(mockResponse(movements));
      return config;
    }

    if (url === '/stock/adjust' && method === 'post') {
      await delay(500);
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const product = products.find((p) => p.id === body.productId);
      if (!product) {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Product not found' }, 404), isAxiosError: true });
        return config;
      }

      if (body.type === 'out' && product.currentStock < body.quantity) {
        config.adapter = () =>
          Promise.reject({
            response: mockResponse({ message: 'Insufficient stock', errors: { quantity: [`Available: ${product.currentStock}`] } }, 400),
            isAxiosError: true,
          });
        return config;
      }

      const newMovement: StockMovement = {
        id: genId(),
        productId: body.productId,
        productName: product.name,
        type: body.type,
        quantity: body.quantity,
        reason: body.reason,
        createdBy: 'u1',
        createdByName: 'Arjun Mehta',
        createdAt: new Date().toISOString(),
      };
      stockMovements.unshift(newMovement);

      if (body.type === 'in') {
        product.currentStock += body.quantity;
      } else {
        product.currentStock -= body.quantity;
      }
      // Update stock status
      if (product.currentStock === 0) product.status = 'out';
      else if (product.currentStock <= product.minStock) product.status = 'low';
      else product.status = 'healthy';

      product.updatedAt = new Date().toISOString();

      config.adapter = () => Promise.resolve(mockResponse(newMovement, 201));
      return config;
    }

    // ── STOCK/INVENTORY ──
    if (url === '/stock' && method === 'get') {
      await delay(300);
      const params = config.params || {};
      let filtered = [...products];

      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
        );
      }
      if (params.stockStatus && params.stockStatus !== 'all') {
        filtered = filtered.filter((p) => p.status === params.stockStatus);
      }

      config.adapter = () =>
        Promise.resolve(
          mockResponse({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        );
      return config;
    }

    if (url === '/stock/movements' && method === 'get') {
      await delay(200);
      config.adapter = () =>
        Promise.resolve(mockResponse(stockMovements.slice(0, 20)));
      return config;
    }

    // ── CHALLANS ──
    if (url === '/challans' && method === 'get') {
      await delay(300);
      const params = config.params || {};
      let filtered = [...challans];

      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.challanNumber.toLowerCase().includes(s) ||
            c.customerName.toLowerCase().includes(s)
        );
      }
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((c) => c.status === params.status);
      }

      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      config.adapter = () =>
        Promise.resolve(
          mockResponse({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        );
      return config;
    }

    if (url.match(/^\/challans\/[^/]+$/) && method === 'get') {
      await delay(200);
      const id = url.split('/').pop();
      const challan = challans.find((c) => c.id === id);
      if (challan) {
        config.adapter = () => Promise.resolve(mockResponse(challan));
      } else {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Challan not found' }, 404), isAxiosError: true });
      }
      return config;
    }

    if (url === '/challans' && method === 'post') {
      await delay(600);
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const customer = customers.find((c) => c.id === body.customerId);
      if (!customer) {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Customer not found' }, 404), isAxiosError: true });
        return config;
      }

      const items: ChallanItem[] = [];
      for (const item of body.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          config.adapter = () =>
            Promise.reject({ response: mockResponse({ message: `Product ${item.productId} not found` }, 400), isAxiosError: true });
          return config;
        }
        if (body.status === 'confirmed' && product.currentStock < item.quantity) {
          config.adapter = () =>
            Promise.reject({
              response: mockResponse({
                message: `Insufficient stock for ${product.name}`,
                errors: { [product.id]: [`Available: ${product.currentStock}, Requested: ${item.quantity}`] },
              }, 400),
              isAxiosError: true,
            });
          return config;
        }
        items.push({
          id: genId(),
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          total: product.unitPrice * item.quantity,
          availableStock: product.currentStock,
        });
      }

      const newChallan: Challan = {
        id: genId(),
        challanNumber: `CH-2026-${String(nextChallanNum++).padStart(6, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        customerBusiness: customer.businessName,
        status: body.status,
        items,
        totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
        totalAmount: items.reduce((s, i) => s + i.total, 0),
        notes: body.notes,
        createdBy: 'u1',
        createdByName: 'Arjun Mehta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confirmedAt: body.status === 'confirmed' ? new Date().toISOString() : undefined,
      };

      // Deduct stock if confirmed
      if (body.status === 'confirmed') {
        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            product.currentStock -= item.quantity;
            if (product.currentStock === 0) product.status = 'out';
            else if (product.currentStock <= product.minStock) product.status = 'low';
            else product.status = 'healthy';
            product.updatedAt = new Date().toISOString();
          }
        }
      }

      challans.unshift(newChallan);
      config.adapter = () => Promise.resolve(mockResponse(newChallan, 201));
      return config;
    }

    // Confirm challan
    if (url.match(/^\/challans\/[^/]+\/confirm$/) && method === 'post') {
      await delay(500);
      const id = url.split('/')[2];
      const challan = challans.find((c) => c.id === id);
      if (!challan) {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Not found' }, 404), isAxiosError: true });
        return config;
      }
      if (challan.status !== 'draft') {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Only draft challans can be confirmed' }, 400), isAxiosError: true });
        return config;
      }

      // Check stock
      for (const item of challan.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product && product.currentStock < item.quantity) {
          config.adapter = () =>
            Promise.reject({
              response: mockResponse({
                message: `Insufficient stock for ${item.productName}`,
                errors: { [item.productId]: [`Available: ${product.currentStock}, Requested: ${item.quantity}`] },
              }, 400),
              isAxiosError: true,
            });
          return config;
        }
      }

      // Deduct stock
      for (const item of challan.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          product.currentStock -= item.quantity;
          if (product.currentStock === 0) product.status = 'out';
          else if (product.currentStock <= product.minStock) product.status = 'low';
          else product.status = 'healthy';
          product.updatedAt = new Date().toISOString();
        }
      }

      challan.status = 'confirmed';
      challan.confirmedAt = new Date().toISOString();
      challan.updatedAt = new Date().toISOString();

      config.adapter = () => Promise.resolve(mockResponse(challan));
      return config;
    }

    // Cancel challan
    if (url.match(/^\/challans\/[^/]+\/cancel$/) && method === 'post') {
      await delay(400);
      const id = url.split('/')[2];
      const challan = challans.find((c) => c.id === id);
      if (!challan) {
        config.adapter = () =>
          Promise.reject({ response: mockResponse({ message: 'Not found' }, 404), isAxiosError: true });
        return config;
      }

      challan.status = 'cancelled';
      challan.cancelledAt = new Date().toISOString();
      challan.updatedAt = new Date().toISOString();

      config.adapter = () => Promise.resolve(mockResponse(challan));
      return config;
    }

    // ── PRODUCT CATEGORIES (for filter dropdowns) ──
    if (url === '/products/categories' && method === 'get') {
      await delay(100);
      const categories = [...new Set(products.map((p) => p.category))];
      config.adapter = () => Promise.resolve(mockResponse(categories));
      return config;
    }

    return config;
  });
}
