import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { db, CustomerOrder, Product } from '../db/dexieDb';
import { getOrders, getProducts, updateOrderStatus } from '../db/dbOperations';
import { dispatchSms } from '../services/smsService';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Send,
  Store,
  RefreshCw,
  Search,
  Filter,
  Check,
  Eye,
  ExternalLink
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [etaInput, setEtaInput] = useState('');
  const [actionToast, setActionToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const orderList = await getOrders();
      setOrders(orderList);

      const prodList = await getProducts();
      setProducts(prodList);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('gramvikas:data_changed', handler);
    return () => window.removeEventListener('gramvikas:data_changed', handler);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: CustomerOrder['status'], customEta?: string) => {
    const updated = await updateOrderStatus(orderId, newStatus, customEta);
    if (!updated) return;

    // Send SMS update to the customer
    let statusMr = 'स्वीकारली आहे';
    let statusEn = 'received';
    if (newStatus === 'packed') {
      statusMr = 'बांधणी पूर्ण (पॅक) झाली आहे';
      statusEn = 'packed and ready';
    } else if (newStatus === 'out_for_delivery') {
      statusMr = 'डिलिव्हरीसाठी रवाना झाली आहे';
      statusEn = 'out for delivery';
    } else if (newStatus === 'delivered') {
      statusMr = 'यशस्वीरित्या वितरित (पोहोच) झाली आहे';
      statusEn = 'delivered successfully';
    }

    const msg =
      language === 'mr'
        ? `ग्रामविकास ऑर्डर अपडेट: नमस्कार ${updated.customerName} जी, आपली ऑर्डर क्र. ${updated.id} ${statusMr}. अपेक्षित वेळ: ${updated.estimatedDeliveryDuration}. ${updated.shopName}.`
        : `GramVikas Order Update: Dear ${updated.customerName}, your order ${updated.id} is now ${statusEn}. ETA: ${updated.estimatedDeliveryDuration}. ${updated.shopName}.`;

    await dispatchSms({
      recipientPhone: updated.customerPhone,
      recipientName: updated.customerName,
      messageText: msg,
      category: 'order_update',
    });

    setActionToast(
      language === 'mr'
        ? `ऑर्डर स्थिती '${newStatus}' वर अपडेट केली आणि ग्राहकास एसएमएस पाठवला!`
        : `Order status updated to '${newStatus}' & SMS sent to customer!`
    );
    setTimeout(() => setActionToast(null), 4000);

    loadData();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
    window.dispatchEvent(new CustomEvent('gramvikas:data_changed'));
  };

  // Helper: check live stock availability for order items
  const checkStockAvailability = (order: CustomerOrder) => {
    let allAvailable = true;
    let hasLowStock = false;

    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      const currentStock = prod ? prod.currentStock : item.currentStock;
      if (currentStock < item.quantity) {
        allAvailable = false;
      } else if (currentStock <= (prod?.minStockThreshold || 5)) {
        hasLowStock = true;
      }
    }

    if (!allAvailable) return { status: 'out_of_stock', label: language === 'mr' ? 'माल अपुरा आहे' : 'Insufficient Stock', color: 'rose' };
    if (hasLowStock) return { status: 'low_stock', label: language === 'mr' ? 'मर्यादित साठा उपलब्ध' : 'Low Stock Warning', color: 'amber' };
    return { status: 'in_stock', label: language === 'mr' ? 'पूर्ण साठा दुकानात उपलब्ध' : 'All Items in Stock', color: 'emerald' };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerVillage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            {language === 'mr' ? 'स्वीकारली (Received)' : 'Received'}
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <Package className="w-3 h-3 text-amber-600" />
            {language === 'mr' ? 'पॅक झाली (Packed)' : 'Packed'}
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            {language === 'mr' ? 'रवाना झाली (Out for Delivery)' : 'Out for Delivery'}
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            <Store className="w-3 h-3 text-teal-600" />
            {language === 'mr' ? 'पिकअपसाठी तयार' : 'Ready for Pickup'}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {language === 'mr' ? 'पूर्ण / पोहोचली (Delivered)' : 'Delivered'}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-forest-700" />
        <p className="font-semibold text-sm">ऑर्डर्स लोड होत आहेत...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-bold border border-forest-200 mb-2">
            <Package className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'mr' ? 'ग्राहक प्री-ऑर्डर व माल साठा व्यवस्थापन' : 'Customer Orders & Live Stock Tracking'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'mr' ? 'ग्राहक ऑर्डर्स व डिलिव्हरी केंद्र' : 'Customer Orders & Dispatch Centre'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'mr'
              ? 'ग्राहकांनी नोंदवलेल्या प्री-ऑर्डर्स, दुकानातील उपलब्ध साठा, दर आणि डिलिव्हरी वेळ व्यवस्थापित करा.'
              : 'Review incoming customer orders, verify shop stock availability, unit price rates, and dispatch timelines.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-forest-50 text-forest-900 p-3 rounded-2xl border border-forest-200 text-center">
            <div className="text-xl font-black">{orders.length}</div>
            <div className="text-[11px] font-bold text-forest-700">{language === 'mr' ? 'एकूण ऑर्डर्स' : 'Total Orders'}</div>
          </div>
          <div className="bg-amber-50 text-amber-900 p-3 rounded-2xl border border-amber-200 text-center">
            <div className="text-xl font-black">{orders.filter((o) => o.status !== 'delivered').length}</div>
            <div className="text-[11px] font-bold text-amber-700">{language === 'mr' ? 'प्रलंबित' : 'Pending Action'}</div>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionToast && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-bold">{actionToast}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'mr' ? 'ग्राहक, ऑर्डर क्र. किंवा गाव शोधा...' : 'Search customer, order ID, village...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 text-xs focus:ring-2 focus:ring-forest-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'received', 'packed', 'out_for_delivery', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-cream-100 hover:bg-cream-200 text-slate-700'
              }`}
            >
              {st === 'all' && (language === 'mr' ? 'सर्व' : 'All')}
              {st === 'received' && (language === 'mr' ? 'स्वीकारली' : 'Received')}
              {st === 'packed' && (language === 'mr' ? 'पॅक केली' : 'Packed')}
              {st === 'out_for_delivery' && (language === 'mr' ? 'रवाना' : 'Dispatched')}
              {st === 'delivered' && (language === 'mr' ? 'पूर्ण' : 'Delivered')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-cream-200 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-600">
              {language === 'mr' ? 'कोणतीही ऑर्डर सापडली नाही.' : 'No orders found matching criteria.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const stockCheck = checkStockAvailability(order);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-cream-200 p-5 shadow-sm hover:border-forest-300 transition-all space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                      {order.id.split('-')[2] || 'ORD'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-slate-800">{order.customerName}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-forest-600" />
                          {order.customerVillage}
                        </span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center gap-1 text-forest-700 font-bold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stock Availability Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border ${
                        stockCheck.color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : stockCheck.color === 'amber'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full bg-${stockCheck.color}-500`}></span>
                      <span>{stockCheck.label}</span>
                    </span>

                    <span className="text-xl font-black text-slate-900 ml-2">₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Items in this order with Stock Availability and Price Rates */}
                <div className="bg-cream-50/70 rounded-2xl p-4 border border-cream-200 overflow-x-auto">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-forest-700" />
                    <span>{order.shopName} - {language === 'mr' ? 'ऑर्डरमधील वस्तू व दर' : 'Ordered Items & Price Rates'}</span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-cream-200 text-slate-500 font-bold">
                        <th className="pb-1.5">{language === 'mr' ? 'वस्तू / माल' : 'Product'}</th>
                        <th className="pb-1.5 text-center">{language === 'mr' ? 'नग (Qty)' : 'Quantity'}</th>
                        <th className="pb-1.5 text-right">{language === 'mr' ? 'दर (Rate)' : 'Unit Price'}</th>
                        <th className="pb-1.5 text-right">{language === 'mr' ? 'एकूण (Total)' : 'Item Subtotal'}</th>
                        <th className="pb-1.5 text-right">{language === 'mr' ? 'दुकानातील साठा' : 'Shop Stock'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100 font-medium">
                      {order.items.map((item, idx) => {
                        const prod = products.find((p) => p.id === item.productId);
                        const liveStock = prod ? prod.currentStock : item.currentStock;
                        const isSufficient = liveStock >= item.quantity;
                        return (
                          <tr key={idx} className="hover:bg-cream-100/50">
                            <td className="py-2 font-bold text-slate-800">
                              {language === 'mr' && item.productNameMr ? item.productNameMr : item.productName}
                              {language === 'mr' && item.productNameMr && (
                                <span className="block text-[10px] text-slate-400 font-normal">{item.productName}</span>
                              )}
                            </td>
                            <td className="py-2 text-center font-bold">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2 text-right text-slate-600 font-bold">
                              ₹{item.unitPrice} / {item.unit}
                            </td>
                            <td className="py-2 text-right font-black text-forest-900">
                              ₹{item.totalPrice}
                            </td>
                            <td className="py-2 text-right font-bold">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md ${
                                  isSufficient
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {liveStock} {item.unit} {isSufficient ? 'उपलब्ध' : 'अपुरा'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Duration & Delivery Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Truck className="w-3.5 h-3.5 text-forest-700" />
                      <span>{language === 'mr' ? 'डिलिव्हरी पद्धत:' : 'Mode:'}</span>
                      <span className="text-forest-800">
                        {order.deliveryMode === 'village_delivery'
                          ? language === 'mr'
                            ? 'गाव टेम्पोने घरपोच'
                            : 'Village Delivery'
                          : language === 'mr'
                          ? 'दुकान पिकअप'
                          : 'Shop Pickup'}
                      </span>
                    </span>

                    <span className="flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{language === 'mr' ? 'अपेक्षित वेळ / कालावधी:' : 'ETA:'}</span>
                      <span>{order.estimatedDeliveryDuration}</span>
                    </span>
                  </div>

                  {order.notes && (
                    <div className="text-[11px] text-slate-500 italic bg-white p-1 rounded">
                      "{order.notes}"
                    </div>
                  )}
                </div>

                {/* Shopkeeper Action Toolbar */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-cream-100">
                  {order.status === 'received' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'packed')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'माल पॅक करा (Pack Order)' : 'Mark as Packed'}</span>
                    </button>
                  )}

                  {order.status === 'packed' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'रवाना करा (Dispatch)' : 'Dispatch Order'}</span>
                    </button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'वितरित झाली (Mark Delivered)' : 'Complete & Delivered'}</span>
                    </button>
                  )}

                  {/* Resend SMS Update */}
                  <button
                    onClick={() => handleStatusUpdate(order.id, order.status)}
                    className="bg-cream-100 hover:bg-cream-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-cream-300 transition-colors flex items-center gap-1.5"
                    title="Send SMS update to customer"
                  >
                    <Send className="w-3 h-3 text-forest-700" />
                    <span>{language === 'mr' ? 'एसएमएस पाठवा' : 'Send SMS'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
