import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getProducts, getCustomers, recordSale, getSales } from '../db/dbOperations';
import { Product, Customer, Sale, SaleItem } from '../db/dexieDb';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  Search,
  IndianRupee,
  CreditCard,
  User,
  History,
  QrCode,
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);

  // POS State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkinName, setWalkinName] = useState('रोख ग्राहक (Cash Customer)');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const p = await getProducts();
    const c = await getCustomers();
    const s = await getSales();
    setProducts(p);
    setCustomers(c);
    setSalesHistory(s);
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  // Auto-set paid amount when total changes unless credit
  useEffect(() => {
    if (paymentMethod !== 'credit_udhari') {
      setPaidAmount(totalAmount);
    }
  }, [totalAmount, paymentMethod]);

  const balanceAmount = Math.max(0, totalAmount - paidAmount);

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      alert(language === 'mr' ? 'या वस्तूचा साठा संपला आहे!' : 'Out of stock!');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          alert(language === 'mr' ? 'शिल्लक साठ्यापेक्षा जास्त संख्या घेता येणार नाही' : 'Cannot exceed available stock');
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: language === 'mr' && product.nameMr ? product.nameMr : product.name,
            quantity: 1,
            unit: product.unit,
            costPrice: product.costPrice,
            unitPrice: product.sellingPrice,
            totalPrice: product.sellingPrice,
          },
        ];
      }
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (prod && newQty > prod.currentStock) {
              alert(language === 'mr' ? 'शिल्लक साठ्यापेक्षा जास्त संख्या घेता येणार नाही' : 'Cannot exceed available stock');
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert(language === 'mr' ? 'कृपया किमान एक वस्तू निवडा' : 'Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      const custName = customer ? customer.name : walkinName;
      const custPhone = customer ? customer.phone : walkinPhone;

      const sale = await recordSale({
        invoiceNumber: `GV-${Date.now().toString().slice(-4)}`,
        customerId: selectedCustomerId || null,
        customerName: custName,
        customerPhone: custPhone,
        subtotal,
        discount,
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentMethod,
        transactionDate: new Date().toISOString(),
        items: cart,
        notes: balanceAmount > 0 ? `शिल्लक उधारी: ₹${balanceAmount}` : 'Full payment recorded',
      });

      setCompletedSale(sale);
      setCart([]);
      setDiscount(0);
      loadData();
    } catch (err: any) {
      alert(`Sale failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.nameMr && p.nameMr.includes(productSearch)) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-cream-300 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-cream-100 border border-cream-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{language === 'mr' ? 'नवीन बिलिंग (POS)' : 'New Sale / Billing'}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-cream-100 border border-cream-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'mr' ? 'मागील बिले इतिहास' : 'Billing History'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Product Selector */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-cream-200 shadow-sm">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={language === 'mr' ? 'वस्तू शोधा (उदा. तांदूळ, तेल, खत)...' : 'Search products to add...'}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.currentStock <= 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isOutOfStock
                          ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : 'bg-cream-50/60 hover:bg-forest-50 hover:border-forest-300 border-cream-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                          {language === 'mr' && p.nameMr ? p.nameMr : p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {p.currentStock} {p.unit} शिल्लक
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-black text-sm text-forest-900">₹{p.sellingPrice}</span>
                        <span className="w-6 h-6 rounded-lg bg-forest-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          +
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Cart, Customer & Checkout */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm space-y-3.5">
              <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
                <span>{t.cart}</span>
                <span className="text-xs bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded-full">
                  {cart.length} {language === 'mr' ? 'वस्तू' : 'items'}
                </span>
              </h3>

              {/* Customer Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'ग्राहक निवडा (उधारी खाते किंवा रोख)' : 'Customer / Khata Account'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-bold bg-cream-50"
                >
                  <option value="">{language === 'mr' ? '-- रोख ग्राहक (Walk-in Customer) --' : '-- Walk-in Cash Customer --'}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.village}) — Due: ₹{c.outstandingBalance}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto divide-y divide-cream-100 pr-1">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.productId} className="pt-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 line-clamp-1">{item.productName}</div>
                        <div className="text-[10px] text-slate-400">
                          ₹{item.unitPrice} × {item.quantity} {item.unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(item.productId, -1)}
                          className="w-5 h-5 rounded bg-cream-200 hover:bg-cream-300 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.productId, 1)}
                          className="w-5 h-5 rounded bg-cream-200 hover:bg-cream-300 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-black text-slate-900 text-right min-w-[50px]">
                        ₹{item.totalPrice}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 italic">
                    {language === 'mr' ? 'खरेदी सूची रिकामी आहे. वस्तू निवडा.' : 'Cart is empty. Select products from left.'}
                  </p>
                )}
              </div>

              {/* Payment Mode Selection */}
              <div className="pt-2 border-t border-cream-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-forest-700 text-white border-forest-800'
                        : 'bg-cream-50 text-slate-700 border-cream-300'
                    }`}
                  >
                    {t.cash}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-forest-700 text-white border-forest-800'
                        : 'bg-cream-50 text-slate-700 border-cream-300'
                    }`}
                  >
                    {t.upi}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_udhari')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      paymentMethod === 'credit_udhari'
                        ? 'bg-amber-700 text-white border-amber-800'
                        : 'bg-cream-50 text-slate-700 border-cream-300'
                    }`}
                  >
                    {t.creditUdhari}
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-cream-50 p-3 rounded-xl border border-cream-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t.subtotal}:</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>{t.discount}:</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 border border-cream-300 rounded text-right font-bold text-xs"
                  />
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-cream-200">
                  <span>{t.total}:</span>
                  <span className="text-forest-900">₹{totalAmount}</span>
                </div>

                {paymentMethod === 'credit_udhari' && (
                  <div className="pt-2 border-t border-amber-200 text-amber-900 space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span>{t.paidAmount}:</span>
                      <input
                        type="number"
                        min="0"
                        value={paidAmount || ''}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 border border-amber-300 rounded text-right font-bold text-xs bg-white"
                      />
                    </div>
                    <div className="flex justify-between font-black text-red-700">
                      <span>{t.balanceDue}:</span>
                      <span>₹{balanceAmount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCompleteSale}
                disabled={loading || cart.length === 0}
                className="w-full bg-forest-700 hover:bg-forest-800 text-white font-extrabold py-3.5 rounded-2xl shadow-sm text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? t.loading : t.completeSale}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-cream-200">
                <tr>
                  <th className="p-3">{t.invoice}</th>
                  <th className="p-3">{t.customer}</th>
                  <th className="p-3">{t.date}</th>
                  <th className="p-3">{t.paymentMethod}</th>
                  <th className="p-3 text-right">{t.total}</th>
                  <th className="p-3 text-right">{t.paidAmount}</th>
                  <th className="p-3 text-right">{t.balanceDue}</th>
                  <th className="p-3 text-center">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {salesHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-cream-50">
                    <td className="p-3 font-bold text-forest-800">{s.invoiceNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">{s.customerName}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(s.transactionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-200">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black">₹{s.totalAmount}</td>
                    <td className="p-3 text-right font-medium text-emerald-700">₹{s.paidAmount}</td>
                    <td className="p-3 text-right font-bold text-red-600">
                      {s.balanceAmount > 0 ? `₹${s.balanceAmount}` : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.syncStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200 animate-scale-up">
            <div className="text-center pb-4 border-b border-cream-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-slate-900">
                {language === 'mr' ? 'विक्री पावती' : 'Sale Receipt'}
              </h3>
              <p className="text-xs text-forest-800 font-bold">
                {localStorage.getItem('gv_business_name') || 'Shree Ganesh Krishi & Kirana'}
              </p>
              <p className="text-[10px] text-slate-400">
                Bill #{completedSale.invoiceNumber} | {new Date(completedSale.transactionDate).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="py-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>{t.customer}:</span>
                <span className="font-bold text-slate-900">{completedSale.customerName}</span>
              </div>
              <div className="divide-y divide-cream-100 max-h-36 overflow-y-auto">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span>{item.productName} ({item.quantity} {item.unit})</span>
                    <span className="font-bold">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-cream-200 flex justify-between font-black text-sm">
                <span>{t.total}:</span>
                <span className="text-forest-900">₹{completedSale.totalAmount}</span>
              </div>
              {completedSale.balanceAmount > 0 && (
                <div className="flex justify-between text-red-700 font-bold text-xs">
                  <span>{t.balanceDue}:</span>
                  <span>₹{completedSale.balanceAmount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-cream-200">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-cream-300 font-bold text-xs text-slate-700 hover:bg-cream-100 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printReceipt}</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 font-bold text-xs text-white"
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
