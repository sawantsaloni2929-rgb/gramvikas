import { db, Product, Sale, Expense, Customer, Payment, InventoryLog, SmsRecord, SchemeInfo, CustomerOrder } from './dexieDb';
import { initialProducts, initialCustomers, initialSales, initialExpenses, initialSmsRecords, verifiedSchemes, initialOrders } from './initialData';

// Generates unique client-side ID
export const generateId = (prefix: string = 'gv'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

// Initialize DB with seed data if empty
export const initDatabase = async (): Promise<void> => {
  const productCount = await db.products.count();
  if (productCount === 0) {
    console.log('[GramVikas DB] Initializing with default Maharashtra rural demo data...');
    await resetToDemoData();
  } else {
    // Check if orders table exists and is populated
    try {
      const orderCount = await db.orders.count();
      if (orderCount === 0) {
        await db.orders.bulkAdd(initialOrders);
      }
    } catch {
      // ignore
    }
  }
};

// Reset database to rich demo state
export const resetToDemoData = async (): Promise<void> => {
  await db.transaction('rw', [
    db.products,
    db.customers,
    db.sales,
    db.expenses,
    db.smsQueue,
    db.schemes,
    db.inventoryLogs,
    db.payments,
    db.orders,
  ], async () => {
    await db.products.clear();
    await db.customers.clear();
    await db.sales.clear();
    await db.expenses.clear();
    await db.smsQueue.clear();
    await db.schemes.clear();
    await db.inventoryLogs.clear();
    await db.payments.clear();
    await db.orders.clear();

    await db.products.bulkAdd(initialProducts);
    await db.customers.bulkAdd(initialCustomers);
    await db.sales.bulkAdd(initialSales);
    await db.expenses.bulkAdd(initialExpenses);
    await db.smsQueue.bulkAdd(initialSmsRecords);
    await db.schemes.bulkAdd(verifiedSchemes);
    await db.orders.bulkAdd(initialOrders);
  });
  console.log('[GramVikas DB] Reset to demo data complete.');
};

// Check and generate low-stock alert without duplicate alerts
export const checkAndGenerateLowStockAlert = async (product: Product): Promise<void> => {
  if (product.currentStock <= product.minStockThreshold) {
    // Check if an unresolved or pending alert already exists for this product today
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.smsQueue
      .where('category')
      .equals('low_stock')
      .filter((sms) => sms.messageText.includes(product.name) && sms.createdAt.startsWith(today))
      .first();

    if (!existing) {
      const ownerPhone = localStorage.getItem('gv_owner_phone') || '+919822998877';
      const ownerName = localStorage.getItem('gv_owner_name') || 'Shop Owner';
      
      const newAlert: SmsRecord = {
        id: generateId('sms_low'),
        category: 'low_stock',
        recipientPhone: ownerPhone,
        recipientName: ownerName,
        messageText: `GramVikas Alert: Your stock of ${product.name} is running low. Current stock: ${product.currentStock} ${product.unit}(s) (Min threshold: ${product.minStockThreshold}). Please restock soon.`,
        status: navigator.onLine ? 'pending_sync' : 'offline_queued',
        deliveryProvider: 'MSG91',
        createdAt: new Date().toISOString(),
        syncStatus: 'pending',
        userId: product.userId,
      };

      await db.smsQueue.add(newAlert);
      console.log(`[GramVikas SMS] Low stock alert queued for ${product.name}`);
    }
  }
};

// Product Operations
export const getProducts = async (): Promise<Product[]> => {
  return await db.products.toArray();
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return await db.products.get(id);
};

export const saveProduct = async (productData: Partial<Product> & { name: string; sellingPrice: number }): Promise<Product> => {
  const now = new Date().toISOString();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';

  if (productData.id) {
    const existing = await db.products.get(productData.id);
    const updated: Product = {
      ...(existing || {}),
      ...productData,
      id: productData.id,
      updatedAt: now,
      syncStatus: 'pending',
      userId: existing?.userId || userId,
    } as Product;

    await db.products.put(updated);
    await checkAndGenerateLowStockAlert(updated);
    return updated;
  } else {
    const created: Product = {
      id: generateId('prod'),
      name: productData.name,
      nameMr: productData.nameMr || '',
      category: productData.category || 'Kirana',
      sku: productData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      unit: productData.unit || 'unit',
      costPrice: Number(productData.costPrice || 0),
      sellingPrice: Number(productData.sellingPrice),
      currentStock: Number(productData.currentStock || 0),
      minStockThreshold: Number(productData.minStockThreshold || 5),
      barcode: productData.barcode || '',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      userId,
    };

    await db.products.add(created);
    await checkAndGenerateLowStockAlert(created);
    return created;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  await db.products.delete(id);
};

export const updateStock = async (
  productId: string,
  quantityChange: number,
  changeType: InventoryLog['changeType'],
  reason?: string
): Promise<Product | undefined> => {
  const product = await db.products.get(productId);
  if (!product) return undefined;

  const previousStock = product.currentStock;
  const newStock = Math.max(0, previousStock + quantityChange);
  const now = new Date().toISOString();

  product.currentStock = newStock;
  product.updatedAt = now;
  product.syncStatus = 'pending';

  await db.products.put(product);

  // Log inventory movement
  const log: InventoryLog = {
    id: generateId('invlog'),
    productId,
    productName: product.name,
    changeType,
    quantityChange,
    previousStock,
    newStock,
    reason: reason || `${changeType} recorded`,
    timestamp: now,
    syncStatus: 'pending',
    userId: product.userId,
  };
  await db.inventoryLogs.add(log);

  // Check low stock condition
  await checkAndGenerateLowStockAlert(product);

  return product;
};

// Sales Operations
export const recordSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'userId'>): Promise<Sale> => {
  const now = new Date().toISOString();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';

  const sale: Sale = {
    ...saleData,
    id: generateId('sale'),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    userId,
  };

  await db.transaction('rw', [db.sales, db.products, db.customers, db.inventoryLogs, db.smsQueue], async () => {
    // 1. Add sale
    await db.sales.add(sale);

    // 2. Decrement inventory for each item
    for (const item of sale.items) {
      await updateStock(item.productId, -item.quantity, 'sale', `Sold in invoice ${sale.invoiceNumber}`);
    }

    // 3. Update customer record if credit/partial payment
    if (sale.customerId) {
      const customer = await db.customers.get(sale.customerId);
      if (customer) {
        customer.totalPurchases += sale.totalAmount;
        if (sale.balanceAmount > 0) {
          customer.outstandingBalance += sale.balanceAmount;
        }
        customer.updatedAt = now;
        customer.syncStatus = 'pending';
        await db.customers.put(customer);
      }
    }
  });

  return sale;
};

export const getSales = async (): Promise<Sale[]> => {
  return await db.sales.reverse().sortBy('transactionDate');
};

// Expenses Operations
export const recordExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'userId'>): Promise<Expense> => {
  const now = new Date().toISOString();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';

  const expense: Expense = {
    ...expenseData,
    id: generateId('exp'),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    userId,
  };

  await db.expenses.add(expense);
  return expense;
};

export const getExpenses = async (): Promise<Expense[]> => {
  return await db.expenses.reverse().sortBy('expenseDate');
};

export const deleteExpense = async (id: string): Promise<void> => {
  await db.expenses.delete(id);
};

// Customer Operations
export const getCustomers = async (): Promise<Customer[]> => {
  return await db.customers.toArray();
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  return await db.customers.get(id);
};

export const saveCustomer = async (customerData: Partial<Customer> & { name: string; phone: string }): Promise<Customer> => {
  const now = new Date().toISOString();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';

  if (customerData.id) {
    const existing = await db.customers.get(customerData.id);
    const updated: Customer = {
      ...(existing || {}),
      ...customerData,
      id: customerData.id,
      updatedAt: now,
      syncStatus: 'pending',
      userId: existing?.userId || userId,
    } as Customer;
    await db.customers.put(updated);
    return updated;
  } else {
    const created: Customer = {
      id: generateId('cust'),
      name: customerData.name,
      phone: customerData.phone,
      village: customerData.village || '',
      taluka: customerData.taluka || '',
      district: customerData.district || 'Pune',
      totalPurchases: Number(customerData.totalPurchases || 0),
      outstandingBalance: Number(customerData.outstandingBalance || 0),
      paymentDueDate: customerData.paymentDueDate || null,
      lastPaymentDate: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      userId,
    };
    await db.customers.add(created);
    return created;
  }
};

export const recordPayment = async (paymentData: {
  customerId: string;
  customerName: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank_transfer';
  receiptNote?: string;
}): Promise<Payment> => {
  const now = new Date().toISOString();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';

  const payment: Payment = {
    id: generateId('pay'),
    customerId: paymentData.customerId,
    customerName: paymentData.customerName,
    amount: paymentData.amount,
    paymentDate: now,
    paymentMode: paymentData.paymentMode,
    receiptNote: paymentData.receiptNote || '',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    userId,
  };

  await db.transaction('rw', [db.payments, db.customers], async () => {
    await db.payments.add(payment);

    const customer = await db.customers.get(paymentData.customerId);
    if (customer) {
      customer.outstandingBalance = Math.max(0, customer.outstandingBalance - paymentData.amount);
      customer.lastPaymentDate = now;
      customer.updatedAt = now;
      customer.syncStatus = 'pending';
      await db.customers.put(customer);
    }
  });

  return payment;
};

// SMS Queue Operations
export const getSmsQueue = async (): Promise<SmsRecord[]> => {
  return await db.smsQueue.reverse().sortBy('createdAt');
};

export const queueSms = async (smsData: Omit<SmsRecord, 'id' | 'createdAt' | 'syncStatus'>): Promise<SmsRecord> => {
  const now = new Date().toISOString();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';

  const sms: SmsRecord = {
    ...smsData,
    id: generateId('sms'),
    createdAt: now,
    syncStatus: 'pending',
    userId,
  };

  await db.smsQueue.add(sms);
  return sms;
};

// Sync Summary Counters
export const getPendingSyncCount = async (): Promise<number> => {
  const pendingProducts = await db.products.where('syncStatus').equals('pending').count();
  const pendingSales = await db.sales.where('syncStatus').equals('pending').count();
  const pendingExpenses = await db.expenses.where('syncStatus').equals('pending').count();
  const pendingCustomers = await db.customers.where('syncStatus').equals('pending').count();
  const pendingPayments = await db.payments.where('syncStatus').equals('pending').count();
  const pendingSms = await db.smsQueue.where('syncStatus').equals('pending').count();
  const pendingOrders = await db.orders.where('syncStatus').equals('pending').count();

  return pendingProducts + pendingSales + pendingExpenses + pendingCustomers + pendingPayments + pendingSms + pendingOrders;
};

// Customer Orders Operations
export const getOrders = async (): Promise<CustomerOrder[]> => {
  return await db.orders.reverse().sortBy('orderedAt');
};

export const getCustomerOrders = async (customerId: string): Promise<CustomerOrder[]> => {
  return await db.orders.where('customerId').equals(customerId).reverse().sortBy('orderedAt');
};

export const saveCustomerOrder = async (order: CustomerOrder): Promise<CustomerOrder> => {
  await db.orders.put(order);
  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: CustomerOrder['status'],
  newEta?: string
): Promise<CustomerOrder | null> => {
  const order = await db.orders.get(orderId);
  if (!order) return null;
  order.status = newStatus;
  if (newEta) {
    order.estimatedDeliveryDuration = newEta;
  }
  order.updatedAt = new Date().toISOString();
  order.syncStatus = 'pending';
  await db.orders.put(order);
  return order;
};

