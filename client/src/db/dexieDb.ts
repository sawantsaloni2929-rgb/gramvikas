import Dexie, { Table } from 'dexie';

export interface Product {
  id: string;
  name: string;
  nameMr?: string;
  category: string;
  sku: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockThreshold: number;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  userId: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: 'cash' | 'upi' | 'credit_udhari' | 'card' | 'mixed';
  transactionDate: string;
  items: SaleItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  userId: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  paymentMode: 'cash' | 'upi' | 'bank_transfer';
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  userId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  village: string;
  taluka?: string;
  district?: string;
  totalPurchases: number;
  outstandingBalance: number;
  paymentDueDate?: string | null;
  lastPaymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  userId: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'upi' | 'bank_transfer';
  receiptNote?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  userId: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeType: 'sale' | 'purchase_restock' | 'manual_adjustment' | 'damage_loss';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  timestamp: string;
  syncStatus: 'synced' | 'pending';
  userId: string;
}

export interface SmsRecord {
  id: string;
  category: 'low_stock' | 'payment_reminder' | 'order_update' | 'business_alert' | 'scheme_training';
  recipientPhone: string;
  recipientName: string;
  messageText: string;
  status: 'draft' | 'offline_queued' | 'pending_sync' | 'sent' | 'delivered' | 'failed';
  deliveryProvider: 'MSG91' | 'Twilio' | 'Mock_Gateway' | 'Native_SMS_Fallback';
  providerMessageId?: string | null;
  scheduledDate?: string | null;
  sentAt?: string | null;
  createdAt: string;
  errorDetails?: string | null;
  isTest?: boolean;
  syncStatus: 'synced' | 'pending';
  userId: string;
}

export interface SyncEvent {
  id: string;
  timestamp: string;
  itemsPushed: number;
  itemsPulled: number;
  status: 'success' | 'failed' | 'partial_conflicts';
  details: string;
}

export interface SchemeInfo {
  id: string;
  title: string;
  titleMr: string;
  department: string;
  description: string;
  descriptionMr: string;
  benefits: string;
  benefitsMr: string;
  eligibility: string;
  eligibilityMr: string;
  deadline: string;
  verifiedDate: string;
  officialSource: string;
  sourceUrl: string;
  category: 'subsidy' | 'loan' | 'training' | 'equipment' | 'insurance';
}

export interface AppSetting {
  key: string;
  value: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameMr?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  isAvailableInStock: boolean;
  currentStock: number;
}

export interface CustomerOrder {
  id: string; // e.g. "GV-ORD-1001"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerVillage: string;
  shopName: string;
  shopOwner: string;
  shopPhone: string;
  shopVillage: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'received' | 'packed' | 'out_for_delivery' | 'ready_for_pickup' | 'delivered';
  deliveryMode: 'shop_pickup' | 'village_delivery';
  estimatedDeliveryDuration: string; // e.g. "2 तास (आज संध्याकाळी ५:०० वाजता)"
  estimatedDeliveryDate: string;
  notes?: string;
  orderedAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending';
  userId: string;
}

export class GramVikasDatabase extends Dexie {
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  expenses!: Table<Expense, string>;
  customers!: Table<Customer, string>;
  payments!: Table<Payment, string>;
  inventoryLogs!: Table<InventoryLog, string>;
  smsQueue!: Table<SmsRecord, string>;
  syncEvents!: Table<SyncEvent, string>;
  schemes!: Table<SchemeInfo, string>;
  settings!: Table<AppSetting, string>;
  orders!: Table<CustomerOrder, string>;

  constructor() {
    super('GramVikasLocalDB');
    this.version(1).stores({
      products: 'id, name, category, sku, currentStock, minStockThreshold, syncStatus, userId, updatedAt',
      sales: 'id, invoiceNumber, customerId, customerName, totalAmount, paymentMethod, transactionDate, syncStatus, userId, updatedAt',
      expenses: 'id, category, amount, expenseDate, syncStatus, userId, updatedAt',
      customers: 'id, name, phone, village, outstandingBalance, paymentDueDate, syncStatus, userId, updatedAt',
      payments: 'id, customerId, amount, paymentDate, syncStatus, userId, updatedAt',
      inventoryLogs: 'id, productId, changeType, timestamp, syncStatus, userId',
      smsQueue: 'id, category, recipientPhone, status, createdAt, syncStatus, userId',
      syncEvents: 'id, timestamp, status',
      schemes: 'id, category, verifiedDate',
      settings: 'key',
    });

    this.version(2).stores({
      orders: 'id, customerId, customerName, status, orderedAt, syncStatus, userId',
    });
  }
}

export const db = new GramVikasDatabase();
