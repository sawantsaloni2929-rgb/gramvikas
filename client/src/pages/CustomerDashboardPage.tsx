import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { db, Customer, Sale, Payment, Product, SmsRecord, CustomerOrder, OrderItem } from '../db/dexieDb';
import { getCustomers, getSales, getProducts, recordPayment, generateId, getCustomerOrders, saveCustomerOrder } from '../db/dbOperations';
import { dispatchSms } from '../services/smsService';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  ShoppingCart,
  Receipt,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  Package,
  Plus,
  Minus,
  Trash2,
  Printer,
  Download,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Store,
  Truck
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { language, t } = useLanguage();

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [customerSmsList, setCustomerSmsList] = useState<SmsRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'passbook' | 'orders' | 'catalog' | 'preorder' | 'sms'>('orders');

  // UPI Payment Modal
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiPayAmount, setUpiPayAmount] = useState<number>(0);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Bill Modal
  const [selectedSaleForBill, setSelectedSaleForBill] = useState<Sale | null>(null);

  // Pre-Order Cart
  const [preOrderCart, setPreOrderCart] = useState<{ [productId: string]: number }>({});
  const [preOrderNotes, setPreOrderNotes] = useState('');
  const [preOrderSubmitted, setPreOrderSubmitted] = useState<string | null>(null);

  // Agro forecast data (Python-powered)
  const [agroForecast, setAgroForecast] = useState<any>(null);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const custList = await getCustomers();
      setCustomers(custList);

      const prodList = await getProducts();
      setProducts(prodList);

      // Default to first customer if none selected
      const activeId = selectedCustomerId || (custList.length > 0 ? custList[0].id : '');
      if (activeId) {
        setSelectedCustomerId(activeId);
        await loadCustomerDetails(activeId);
      }
    } catch (err) {
      console.error('Error loading customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (custId: string) => {
    const cust = await db.customers.get(custId);
    setCurrentCustomer(cust || null);
    if (cust) {
      setUpiPayAmount(cust.outstandingBalance || 0);

      // Load Sales
      const sales = await db.sales.where('customerId').equals(custId).reverse().sortBy('transactionDate');
      setCustomerSales(sales);

      // Load Payments
      const pmts = await db.payments.where('customerId').equals(custId).reverse().sortBy('paymentDate');
      setCustomerPayments(pmts);

      // Load SMS records for this customer's phone
      if (cust.phone) {
        const smsRecords = await db.smsQueue.filter((s) => s.recipientPhone.includes(cust.phone.slice(-10))).toArray();
        setCustomerSmsList(smsRecords);
      }

      // Load Customer Orders & Delivery Status
      const ords = await getCustomerOrders(custId);
      setCustomerOrders(ords);
    }
  };

  useEffect(() => {
    loadData();
    // Fetch Python Agro forecast if available
    fetch('http://localhost:5001/api/python/forecast')
      .then((res) => res.json())
      .then((data) => setAgroForecast(data))
      .catch(() => {
        // Fallback local forecast
        setAgroForecast({
          district: 'Pune / Baramati',
          season: 'Kharif (खरीप - June to October)',
          demand_surge_percent: 45.0,
          priority_items: ['NPK Fertilizer 24:24:0', 'Urea 45kg', 'Paddy Seed', 'Sunflower Oil'],
          recommendation_mr: 'खरीप हंगामासाठी खते व बियाण्यांचा साठा वेळेत करून ठेवा.',
          recommendation_en: 'Stock up on fertilizers and seeds for the peak Kharif sowing season.'
        });
      });
  }, []);

  const handleCustomerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    await loadCustomerDetails(id);
  };

  // Simulate Instant UPI Payment
  const handleConfirmUpiPayment = async () => {
    if (!currentCustomer || upiPayAmount <= 0) return;

    try {
      await recordPayment({
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        amount: upiPayAmount,
        paymentMode: 'upi',
        receiptNote: `Online UPI QR Payment by Customer (${new Date().toLocaleTimeString()})`,
      });

      // Queue an SMS confirmation
      await dispatchSms({
        recipientPhone: currentCustomer.phone,
        recipientName: currentCustomer.name,
        messageText:
          language === 'mr'
            ? `ग्रामविकास पावती: धन्यवाद ${currentCustomer.name} जी! आपले ₹${upiPayAmount} चे UPI पेमेंट यशस्वीरीत्या जमा झाले आहे.`
            : `GramVikas Receipt: Thank you ${currentCustomer.name}! Your UPI payment of Rs. ${upiPayAmount} has been recorded.`,
        category: 'payment_reminder',
      });

      setIsUpiModalOpen(false);
      setPaymentSuccessToast(
        language === 'mr'
          ? `₹${upiPayAmount} चा भरणा यशस्वीरित्या जमा झाला आणि पावती नोंदवली!`
          : `Payment of ₹${upiPayAmount} recorded successfully!`
      );
      setTimeout(() => setPaymentSuccessToast(null), 5000);

      // Refresh customer data
      await loadCustomerDetails(currentCustomer.id);
      window.dispatchEvent(new CustomEvent('gramvikas:data_changed'));
    } catch (err) {
      console.error('Error recording UPI payment:', err);
    }
  };

  // Pre-Order Actions
  const updatePreOrderQty = (productId: string, delta: number) => {
    setPreOrderCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handlePreOrderSubmit = async () => {
    if (!currentCustomer || Object.keys(preOrderCart).length === 0) return;

    const items = Object.entries(preOrderCart).map(([prodId, qty]) => {
      const p = products.find((x) => x.id === prodId);
      return {
        id: prodId,
        name: p?.name || 'Item',
        price: p?.sellingPrice || 0,
        qty,
      };
    });

    const orderId = `GV-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Call Python backend pre-order if online, or local Dexie SMS queue
    try {
      await fetch('http://localhost:5001/api/python/customer/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: currentCustomer.name,
          items,
          notes: preOrderNotes,
        }),
      }).catch(() => null);
    } catch {
      // offline fallback
    }

    // Construct full persistent Order Record
    const orderItems: OrderItem[] = Object.entries(preOrderCart).map(([prodId, qty]) => {
      const p = products.find((x) => x.id === prodId);
      return {
        productId: prodId,
        productName: p?.name || 'Item',
        productNameMr: p?.nameMr,
        quantity: qty,
        unit: p?.unit || 'unit',
        unitPrice: p?.sellingPrice || 0,
        totalPrice: (p?.sellingPrice || 0) * qty,
        isAvailableInStock: (p?.currentStock || 0) >= qty,
        currentStock: p?.currentStock || 0,
      };
    });

    const newOrder: CustomerOrder = {
      id: orderId,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      customerVillage: `${currentCustomer.village}, ${currentCustomer.taluka || 'Baramati'}`,
      shopName: 'श्री गणेश कृषी व किराणा स्टोअर्स',
      shopOwner: 'सुरेश तुकाराम पाटील',
      shopPhone: '+919822998877',
      shopVillage: 'बारामती ग्रामीण, जि. पुणे',
      items: orderItems,
      totalAmount: preOrderCartTotal,
      status: 'received',
      deliveryMode: 'village_delivery',
      estimatedDeliveryDuration: '२ तास (आज संध्याकाळी ५:०० वाजता गाव गाडीने पोहोचेल)',
      estimatedDeliveryDate: '2026-10-14 17:00',
      notes: preOrderNotes,
      orderedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      userId: currentCustomer.userId,
    };

    await saveCustomerOrder(newOrder);

    // Queue SMS notification for pre-order
    await dispatchSms({
      recipientPhone: currentCustomer.phone,
      recipientName: currentCustomer.name,
      messageText:
        language === 'mr'
          ? `ग्रामविकास प्री-ऑर्डर: तुमची ऑर्डर क्र. ${orderId} (${items.length} वस्तू) दुकानदारास मिळाली आहे. माल तयार होताच कळवले जाईल.`
          : `GramVikas Pre-Order: Your order ${orderId} (${items.length} items) has been received by the shopkeeper.`,
      category: 'order_update',
    });

    setPreOrderSubmitted(orderId);
    setPreOrderCart({});
    setPreOrderNotes('');
    loadCustomerDetails(currentCustomer.id);
  };

  const getStockBadge = (prod: Product) => {
    if (prod.currentStock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {language === 'mr' ? 'साठा संपला' : 'Out of Stock'}
        </span>
      );
    }
    if (prod.currentStock <= prod.minStockThreshold) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {language === 'mr' ? `मर्यादित शिल्लक (${prod.currentStock} ${prod.unit})` : `Low Stock (${prod.currentStock})`}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        {language === 'mr' ? `उपलब्ध (${prod.currentStock} ${prod.unit})` : `In Stock (${prod.currentStock})`}
      </span>
    );
  };

  const preOrderCartTotal = Object.entries(preOrderCart).reduce((sum, [prodId, qty]) => {
    const p = products.find((x) => x.id === prodId);
    return sum + (p ? p.sellingPrice * qty : 0);
  }, 0);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-forest-700" />
        <p className="font-semibold text-sm">ग्राहक खातेवही लोड होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Customer Switcher Bar */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-cream-200 mb-2 border border-white/10">
              <Users className="w-3.5 h-3.5 text-cream-300" />
              <span>{language === 'mr' ? 'ग्राहक डिजिटल पासबुक व सेवा पोर्टल' : 'Customer Digital Khata & Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {currentCustomer?.name || (language === 'mr' ? 'ग्राहक खाते' : 'Customer Account')}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-cream-200 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {currentCustomer?.village || 'गाव'}, {currentCustomer?.taluka || 'तालुका'} ({currentCustomer?.district || 'पुणे'})
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {currentCustomer?.phone}
              </span>
              <span className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-md text-[11px] font-mono">
                ID: {currentCustomer?.id}
              </span>
            </div>
          </div>

          {/* Customer Profile Picker & Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
              <label className="text-[10px] font-bold uppercase text-cream-200 px-2 block">
                {language === 'mr' ? 'ग्राहक खाते निवडा (Select Khata)' : 'Switch Customer'}
              </label>
              <select
                value={selectedCustomerId}
                onChange={handleCustomerChange}
                className="bg-transparent text-white font-bold text-xs sm:text-sm px-2 py-1 outline-none w-full cursor-pointer [&>option]:text-slate-900"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.village} (₹{c.outstandingBalance} बाकी)
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/dashboard"
              className="bg-cream-100 hover:bg-white text-forest-900 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
              title="Return to Shopkeeper View"
            >
              <Store className="w-4 h-4 text-forest-700" />
              <span>{language === 'mr' ? 'दुकानदार पोर्टल' : 'Shopkeeper View'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {paymentSuccessToast && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-bold">{paymentSuccessToast}</span>
        </div>
      )}

      {/* KPI Cards: Passbook Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Outstanding Udhari */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{language === 'mr' ? 'एकूण बाकी उधारी' : 'Outstanding Balance'}</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            ₹{currentCustomer?.outstandingBalance?.toLocaleString('en-IN') || 0}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {(currentCustomer?.outstandingBalance || 0) > 0 ? (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentCustomer?.paymentDueDate
                  ? `${language === 'mr' ? 'देय दिनांक:' : 'Due:'} ${currentCustomer.paymentDueDate}`
                  : language === 'mr'
                  ? 'भरणा प्रलंबित'
                  : 'Payment Pending'}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'mr' ? 'सर्व खाते जमा (Clear)' : 'Account Clear'}
              </span>
            )}
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{language === 'mr' ? 'एकूण खरेदी' : 'Total Purchases'}</span>
            <ShoppingCart className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ₹{currentCustomer?.totalPurchases?.toLocaleString('en-IN') || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {language === 'mr' ? `${customerSales.length} एकूण बिले नोंदवली` : `${customerSales.length} total orders recorded`}
          </p>
        </div>

        {/* Last Repayment */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{language === 'mr' ? 'शेवटचा भरणा' : 'Last Payment'}</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            {customerPayments.length > 0 ? `₹${customerPayments[0].amount}` : '₹0'}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {currentCustomer?.lastPaymentDate
              ? `${language === 'mr' ? 'तारीख:' : 'Date:'} ${currentCustomer.lastPaymentDate}`
              : language === 'mr'
              ? 'अद्याप भरणा नाही'
              : 'No payment recorded'}
          </p>
        </div>

        {/* Quick Action: Instant Pay Button */}
        <div className="bg-gradient-to-br from-cream-100 to-forest-50 p-4 sm:p-5 rounded-2xl border border-forest-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-forest-900 mb-1 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-forest-700" />
              <span>{language === 'mr' ? 'त्वरित UPI भरणा' : 'Instant UPI Pay'}</span>
            </div>
            <p className="text-xs text-slate-600">
              {language === 'mr' ? 'QR कोड स्कॅन करून उधारी जमा करा' : 'Scan QR code to clear balance'}
            </p>
          </div>
          <button
            onClick={() => setIsUpiModalOpen(true)}
            className="mt-3 w-full bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs sm:text-sm py-2 px-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>{language === 'mr' ? 'UPI द्वारे भरा' : 'Pay via UPI QR'}</span>
          </button>
        </div>
      </div>

      {/* Python Agro-Seasonal Forecast Advisory Widget */}
      {agroForecast && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  {language === 'mr' ? 'हंगामी शेती सल्ला (Python Agro-BI)' : 'Maharashtra Agro Season Advisory'}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  {agroForecast.season} (+{agroForecast.demand_surge_percent}% मागणी)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                {language === 'mr' ? agroForecast.recommendation_mr : agroForecast.recommendation_en}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-bold text-slate-500">
                  {language === 'mr' ? 'महत्त्वाचा शेती साठा:' : 'Key Farm Supplies:'}
                </span>
                {agroForecast.priority_items?.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-white font-bold text-slate-800 px-2 py-0.5 rounded-md border border-amber-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Portal Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-cream-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-cream-100 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'mr' ? 'माझ्या ऑर्डर्स व डिलिव्हरी (Orders)' : 'My Orders & Delivery'}</span>
          <span className="text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full">{customerOrders.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('passbook')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'passbook'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-cream-100 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{language === 'mr' ? 'खातेवही व बिले (Passbook)' : 'Khata & Digital Bills'}</span>
          <span className="text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full">{customerSales.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-cream-100 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{language === 'mr' ? 'दुकानातील माल व साठा' : 'Store Catalog & Stock'}</span>
        </button>

        <button
          onClick={() => setActiveTab('preorder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap relative ${
            activeTab === 'preorder'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-cream-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{language === 'mr' ? 'प्री-ऑर्डर नोंदणी' : 'Place Pre-Order'}</span>
          {Object.keys(preOrderCart).length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center">
              {Object.keys(preOrderCart).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'sms'
              ? 'bg-forest-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-cream-100 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{language === 'mr' ? 'प्राप्त एसएमएस' : 'Received SMS'}</span>
          <span className="text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full">{customerSmsList.length}</span>
        </button>
      </div>

      {/* TAB: CUSTOMER ORDERS & LIVE DELIVERY TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest-700" />
                <span>{language === 'mr' ? 'माझ्या ऑर्डर्स, साठा स्थिती व थेट डिलिव्हरी ट्रॅकिंग' : 'My Orders, Stock Status & Live Delivery'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'mr'
                  ? 'कोणत्या दुकानातून मागवले, मालाचे दर, साठा उपलब्ध आहे का आणि पोहोचण्यासाठी लागणारा वेळ पहा.'
                  : 'Track shop details, item availability, unit price rates, and estimated delivery duration.'}
              </p>
            </div>
            <div className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-200">
              {customerOrders.length} {language === 'mr' ? 'ऑर्डर्स नोंदवल्या' : 'Orders recorded'}
            </div>
          </div>

          {customerOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-cream-200 text-center text-slate-400 space-y-3">
              <Package className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-600">
                {language === 'mr' ? 'अद्याप कोणतीही ऑर्डर नोंदवलेली नाही.' : 'No orders found for your account.'}
              </p>
              <button
                onClick={() => setActiveTab('preorder')}
                className="bg-forest-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                {language === 'mr' ? 'नवीन ऑर्डर नोंदवा' : 'Place an Order Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-cream-200 p-5 shadow-sm space-y-4 hover:border-forest-300 transition-all"
                >
                  {/* Top Bar: Order ID, Shop Details & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">{ord.id}</span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : ord.status === 'out_for_delivery'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : ord.status === 'packed'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {ord.status === 'received' && (language === 'mr' ? 'नोंदणी झाली (Order Received)' : 'Order Received')}
                          {ord.status === 'packed' && (language === 'mr' ? 'पॅकिंग पूर्ण (Packed & Ready)' : 'Packed & Ready')}
                          {ord.status === 'out_for_delivery' && (language === 'mr' ? 'डिलिव्हरीसाठी रवाना (Out for Delivery)' : 'Out for Delivery')}
                          {ord.status === 'delivered' && (language === 'mr' ? 'घरपोच मिळाली (Delivered)' : 'Delivered')}
                        </span>
                      </div>

                      {/* WHICH SHOP IS IT FROM */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5 font-medium">
                        <span className="flex items-center gap-1 font-bold text-forest-900">
                          <Store className="w-3.5 h-3.5 text-forest-700" />
                          <span>{language === 'mr' ? 'दुकान:' : 'Shop:'}</span>
                          <span>{ord.shopName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {ord.shopVillage} (मालक: {ord.shopOwner})
                        </span>
                        <a
                          href={`tel:${ord.shopPhone}`}
                          className="flex items-center gap-1 text-forest-700 font-bold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {ord.shopPhone}
                        </a>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold">{language === 'mr' ? 'एकूण रक्कम:' : 'Total Amount:'}</span>
                      <div className="text-2xl font-black text-forest-900">₹{ord.totalAmount}</div>
                    </div>
                  </div>

                  {/* VISUAL 4-STEP DELIVERY PROGRESS TRACKER */}
                  <div className="bg-cream-50/80 p-4 rounded-2xl border border-cream-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {language === 'mr' ? 'थेट डिलिव्हरी प्रगती ट्रॅकर (Live Progress)' : 'Delivery Progress'}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1: Received */}
                      <div className="space-y-1">
                        <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold bg-forest-700 text-white shadow-sm">
                          ✓
                        </div>
                        <div className="font-bold text-slate-800 text-[11px]">
                          {language === 'mr' ? 'स्वीकारली' : 'Received'}
                        </div>
                      </div>

                      {/* Step 2: Packed */}
                      <div className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold ${
                            ['packed', 'out_for_delivery', 'delivered'].includes(ord.status)
                              ? 'bg-forest-700 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {['packed', 'out_for_delivery', 'delivered'].includes(ord.status) ? '✓' : '2'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px]">
                          {language === 'mr' ? 'पॅक झाली' : 'Packed'}
                        </div>
                      </div>

                      {/* Step 3: Out for delivery */}
                      <div className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold ${
                            ['out_for_delivery', 'delivered'].includes(ord.status)
                              ? 'bg-forest-700 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {['out_for_delivery', 'delivered'].includes(ord.status) ? '✓' : '3'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px]">
                          {language === 'mr' ? 'रवाना' : 'On The Way'}
                        </div>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {ord.status === 'delivered' ? '✓' : '4'}
                        </div>
                        <div className="font-bold text-slate-800 text-[11px]">
                          {language === 'mr' ? 'पोहोचली' : 'Delivered'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WHAT THINGS ORDERED, WHAT PRICE RATE & STOCK AVAILABILITY TABLE */}
                  <div className="border border-cream-200 rounded-2xl overflow-hidden">
                    <div className="bg-cream-100/70 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-cream-200">
                      <span>{language === 'mr' ? 'मागवलेला माल व दर (Items & Price Rates)' : 'Ordered Items & Rates'}</span>
                      <span className="text-[11px] text-forest-800 font-bold">
                        {ord.items.length} {language === 'mr' ? 'वस्तू' : 'items'}
                      </span>
                    </div>

                    <div className="divide-y divide-cream-100 bg-white">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900">
                              {language === 'mr' && item.productNameMr ? item.productNameMr : item.productName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-forest-800">
                                {language === 'mr' ? 'दर:' : 'Rate:'} ₹{item.unitPrice} / {item.unit}
                              </span>
                              <span>•</span>
                              <span>
                                {language === 'mr' ? 'मागणी:' : 'Qty:'} {item.quantity} {item.unit}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            {/* LIVE STOCK AVAILABILITY IN SHOP */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{language === 'mr' ? `साठा उपलब्ध (${item.currentStock} ${item.unit})` : `In Stock (${item.currentStock})`}</span>
                            </span>

                            <span className="font-black text-sm text-slate-900 w-20 text-right">
                              ₹{item.totalPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DURATION OF TIME TO BE DELIVERED */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>{language === 'mr' ? 'डिलिव्हरी कालावधी व वेळ:' : 'Delivery Duration & Time:'}</span>
                      <span className="text-amber-900 font-extrabold">{ord.estimatedDeliveryDuration}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <span>
                        {ord.deliveryMode === 'village_delivery'
                          ? language === 'mr'
                            ? 'गाव टेम्पोने घरपोच'
                            : 'Village Delivery'
                          : language === 'mr'
                          ? 'दुकान पिकअप'
                          : 'Shop Pickup'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: PASSBOOK & PURCHASE HISTORY */}
      {activeTab === 'passbook' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-forest-700" />
                  <span>{language === 'mr' ? 'खरेदी व बिलांचा इतिहास' : 'Purchase & Bill History'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'mr'
                    ? 'सर्व रोख व उधारी खरेदीच्या डिजिटल पावत्या येथे उपलब्ध आहेत.'
                    : 'Itemized digital bills for all cash and credit purchases.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'पासबुक प्रिंट' : 'Print Passbook'}</span>
                </button>
              </div>
            </div>

            {customerSales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                {language === 'mr' ? 'या ग्राहकाची कोणतीही खरेदी नोंदवलेली नाही.' : 'No purchases found for this customer.'}
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {customerSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 hover:bg-cream-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-black text-xs flex-shrink-0">
                        {sale.invoiceNumber.split('-')[1] || 'GV'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{sale.invoiceNumber}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sale.paymentMethod === 'credit_udhari'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : sale.paymentMethod === 'upi'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {sale.paymentMethod === 'credit_udhari'
                              ? language === 'mr'
                                ? 'उधारी'
                                : 'Credit (Udhari)'
                              : sale.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {sale.transactionDate}
                          </span>
                          <span>{sale.items.length} {language === 'mr' ? 'वस्तू' : 'items'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">₹{sale.totalAmount}</div>
                        {sale.balanceAmount > 0 && (
                          <div className="text-[11px] font-bold text-rose-600">
                            ₹{sale.balanceAmount} {language === 'mr' ? 'बाकी' : 'balance'}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedSaleForBill(sale)}
                        className="bg-cream-100 hover:bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5 text-forest-700" />
                        <span>{language === 'mr' ? 'पावती पहा' : 'View Bill'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repayment History Ledger */}
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-cream-200">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'mr' ? 'जमा पावत्या (Repayment Ledger)' : 'Repayment Receipts'}</span>
              </h3>
            </div>

            {customerPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                {language === 'mr' ? 'अद्याप कोणताही भरणा झालेला नाही.' : 'No repayment records.'}
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {customerPayments.map((pmt) => (
                  <div key={pmt.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{pmt.receiptNote || 'उधारी भरणा पावती'}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded border border-emerald-200">
                          {pmt.paymentMode.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{pmt.paymentDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-600">+₹{pmt.amount}</div>
                      <span className="text-[10px] text-slate-400 font-semibold">{pmt.syncStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STORE PRODUCT CATALOG & LIVE STOCK CHECK */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-forest-700" />
                <span>{language === 'mr' ? 'दुकानातील उपलब्ध माल व थेट साठा' : 'Store Catalog & Stock Check'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'mr'
                  ? 'दुकानात जाण्यापूर्वी येथे माल उपलब्ध आहे का ते तपासा आणि थेट प्री-ऑर्डर करा.'
                  : 'Check product availability and prices before visiting the store.'}
              </p>
            </div>
            <div className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-200">
              {products.length} {language === 'mr' ? 'वस्तू उपलब्ध' : 'Products listed'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => {
              const inCartQty = preOrderCart[prod.id] || 0;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-cream-200 p-4 shadow-sm hover:border-forest-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      {getStockBadge(prod)}
                    </div>

                    <h4 className="font-black text-slate-900 text-sm leading-snug">
                      {language === 'mr' && prod.nameMr ? prod.nameMr : prod.name}
                    </h4>
                    {language === 'mr' && prod.nameMr && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{prod.name}</p>
                    )}

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-xl font-black text-forest-900">₹{prod.sellingPrice}</span>
                      <span className="text-xs text-slate-500 font-medium">/ {prod.unit}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between">
                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-2 bg-cream-100 p-1 rounded-xl">
                        <button
                          onClick={() => updatePreOrderQty(prod.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs px-2 text-forest-900">{inCartQty}</span>
                        <button
                          onClick={() => updatePreOrderQty(prod.id, 1)}
                          className="w-7 h-7 rounded-lg bg-forest-700 text-white flex items-center justify-center font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updatePreOrderQty(prod.id, 1)}
                        className="bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'मागणी करा' : 'Pre-Order'}</span>
                      </button>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">SKU: {prod.sku}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRE-ORDER SUBMISSION */}
      {activeTab === 'preorder' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {preOrderSubmitted ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 text-center space-y-3 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-xl text-emerald-900">
                {language === 'mr' ? 'प्री-ऑर्डर यशस्वीरित्या नोंदवली!' : 'Pre-Order Submitted Successfully!'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 font-semibold max-w-md mx-auto">
                {language === 'mr'
                  ? `ऑर्डर क्रमांक: ${preOrderSubmitted}. दुकानदार मालाची बांधणी करून ठेवतील व तयार झाल्यावर एसएमएस द्वारे कळवतील.`
                  : `Order ID: ${preOrderSubmitted}. The store owner will pack your items and send an SMS update.`}
              </p>
              <button
                onClick={() => setPreOrderSubmitted(null)}
                className="bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-emerald-800"
              >
                {language === 'mr' ? 'नवीन ऑर्डर करा' : 'Place Another Order'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-cream-200 p-5 sm:p-7 shadow-sm space-y-5">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-forest-700" />
                  <span>{language === 'mr' ? 'ग्रामीण प्री-ऑर्डर व आगाऊ बुकिंग' : 'Rural Pre-Order Booking'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'mr'
                    ? 'गावातून किंवा शेतातून निघण्यापूर्वी माल बुक करा, म्हणजे दुकानात आल्यावर थेट तयार पार्सल मिळेल.'
                    : 'Reserve required groceries & farm items in advance for quick pickup.'}
                </p>
              </div>

              {Object.keys(preOrderCart).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-cream-300 rounded-2xl">
                  <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">
                    {language === 'mr' ? 'ऑर्डर कार्ट रिकामे आहे.' : 'Your order cart is empty.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-3 text-xs font-bold bg-forest-700 text-white px-4 py-2 rounded-xl"
                  >
                    {language === 'mr' ? 'मालाची यादी पहा व निवडा' : 'Browse Catalog'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-cream-100 border border-cream-200 rounded-2xl overflow-hidden">
                    {Object.entries(preOrderCart).map(([prodId, qty]) => {
                      const p = products.find((x) => x.id === prodId);
                      if (!p) return null;
                      return (
                        <div key={prodId} className="p-3.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900">
                              {language === 'mr' && p.nameMr ? p.nameMr : p.name}
                            </div>
                            <div className="text-[11px] text-slate-500">₹{p.sellingPrice} / {p.unit}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-cream-100 p-1 rounded-lg">
                              <button
                                onClick={() => updatePreOrderQty(prodId, -1)}
                                className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs px-1.5">{qty}</span>
                              <button
                                onClick={() => updatePreOrderQty(prodId, 1)}
                                className="w-6 h-6 rounded bg-forest-700 text-white flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-black text-xs text-forest-900 w-16 text-right">
                              ₹{p.sellingPrice * qty}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Total */}
                  <div className="bg-cream-50 p-4 rounded-2xl flex items-center justify-between border border-cream-200">
                    <span className="font-bold text-xs sm:text-sm text-slate-700">
                      {language === 'mr' ? 'अंदाजे एकूण रक्कम:' : 'Estimated Order Total:'}
                    </span>
                    <span className="font-black text-xl text-forest-900">₹{preOrderCartTotal}</span>
                  </div>

                  {/* Pickup Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'mr' ? 'दुकानदारासाठी सूचना / वेळ' : 'Pickup Instructions / Notes'}
                    </label>
                    <textarea
                      value={preOrderNotes}
                      onChange={(e) => setPreOrderNotes(e.target.value)}
                      placeholder={
                        language === 'mr'
                          ? 'उदा. उद्या सकाळी ८ वाजता शेतात जाताना गाडीवरून घेईन...'
                          : 'E.g., will pick up tomorrow morning at 8 AM...'
                      }
                      rows={2}
                      className="w-full text-xs p-3 rounded-xl border border-cream-300 focus:ring-2 focus:ring-forest-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={handlePreOrderSubmit}
                    className="w-full bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'mr' ? 'दुकानदारास ऑर्डर पाठवा' : 'Submit Pre-Order to Store'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECEIVED SMS NOTIFICATIONS */}
      {activeTab === 'sms' && (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-cream-200">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-forest-700" />
              <span>{language === 'mr' ? 'दुकानदाराकडून आलेले एसएमएस व संदेश' : 'Store SMS Notifications'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'mr'
                ? 'उधारी स्मरणपत्र, खरेदी पावत्या आणि शासकीय योजना सूचनांचे रेकॉर्ड.'
                : 'Payment reminders, invoices, and agricultural scheme updates sent to your number.'}
            </p>
          </div>

          {customerSmsList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              {language === 'mr' ? 'अद्याप कोणतेही एसएमएस रेकॉर्ड उपलब्ध नाहीत.' : 'No SMS messages recorded.'}
            </div>
          ) : (
            <div className="divide-y divide-cream-100">
              {customerSmsList.map((sms) => (
                <div key={sms.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {sms.category}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      {sms.status.toUpperCase()} ({sms.deliveryProvider})
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed bg-cream-50 p-3 rounded-xl border border-cream-200">
                    "{sms.messageText}"
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{sms.sentAt ? new Date(sms.sentAt).toLocaleString() : 'Offline Logged'}</span>
                    <span>•</span>
                    <a
                      href={`sms:${sms.recipientPhone}?body=${encodeURIComponent(sms.messageText)}`}
                      className="text-forest-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{language === 'mr' ? 'मोबाईल SMS ॲपमध्ये उघडा' : 'Open in Phone SMS'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: UPI QR PAYMENT SIMULATION */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-cream-200 text-center space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-forest-700" />
                <span>{language === 'mr' ? 'थेट UPI QR भरणा' : 'Direct UPI QR Payment'}</span>
              </span>
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Generated UPI QR Display */}
            <div className="p-3 bg-white border-2 border-forest-600 rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `upi://pay?pa=gramvikas.patil@upi&pn=GramVikas+Kirana&am=${upiPayAmount}&cu=INR`
                )}`}
                alt="UPI QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">
                {language === 'mr' ? 'दुकानदार VPA: gramvikas.patil@upi' : 'Store VPA: gramvikas.patil@upi'}
              </p>
              <div className="mt-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'mr' ? 'भरणा रक्कम (₹):' : 'Payment Amount (₹):'}
                </label>
                <input
                  type="number"
                  value={upiPayAmount}
                  onChange={(e) => setUpiPayAmount(Math.max(0, Number(e.target.value)))}
                  className="font-black text-xl text-center text-forest-900 border border-cream-300 rounded-xl px-3 py-1.5 w-36 outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-cream-50 p-2.5 rounded-xl border border-cream-200 leading-relaxed">
              {language === 'mr'
                ? 'PhonePe, Google Pay किंवा BHIM ॲपद्वारे स्कॅन करा. खालील बटनावर क्लिक करून भरणा नोंदवा.'
                : 'Scan with any UPI App. Click confirm below to record offline and clear balance.'}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsUpiModalOpen(false)}
                className="flex-1 bg-cream-100 hover:bg-cream-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmUpiPayment}
                className="flex-1 bg-forest-700 hover:bg-forest-800 text-white text-xs font-extrabold py-2.5 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'भरणा नोंदवा' : 'Confirm Paid'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL ITEMIZED BILL */}
      {selectedSaleForBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="font-extrabold text-sm text-slate-900">
                  {language === 'mr' ? 'डिजिटल पावती' : 'Digital Invoice'}
                </span>
                <p className="text-[11px] text-slate-500 font-mono">{selectedSaleForBill.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedSaleForBill(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Bill Receipt Body */}
            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 text-xs space-y-3 font-mono">
              <div className="text-center border-b border-cream-200 pb-2 font-sans">
                <h4 className="font-black text-sm text-forest-900">ग्रामविकास किराणा व ॲग्रो सेंटर</h4>
                <p className="text-[10px] text-slate-500">बारामती, जि. पुणे, महाराष्ट्र</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedSaleForBill.transactionDate}</p>
              </div>

              <div className="divide-y divide-cream-200">
                {selectedSaleForBill.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.quantity} × ₹{item.unitPrice}
                      </div>
                    </div>
                    <span className="font-black text-slate-900">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-cream-300 pt-2 space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>एकूण रक्कम (Total):</span>
                  <span>₹{selectedSaleForBill.totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>रोख / UPI भरणा:</span>
                  <span>₹{selectedSaleForBill.paidAmount}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-black">
                  <span>बाकी उधारी:</span>
                  <span>₹{selectedSaleForBill.balanceAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-cream-100 hover:bg-cream-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'प्रिंट पावती' : 'Print Receipt'}</span>
              </button>
              <button
                onClick={() => setSelectedSaleForBill(null)}
                className="flex-1 bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
