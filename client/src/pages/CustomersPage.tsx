import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getCustomers, saveCustomer } from '../db/dbOperations';
import { Customer } from '../db/dexieDb';
import { Link } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  Search,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    taluka: 'Baramati',
    district: 'Pune',
    outstandingBalance: 0,
    paymentDueDate: '',
  });

  const loadCustomers = async () => {
    const list = await getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
    const handleDataChange = () => loadCustomers();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    await saveCustomer(formData as any);
    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      village: '',
      taluka: 'Baramati',
      district: 'Pune',
      outstandingBalance: 0,
      paymentDueDate: '',
    });
    loadCustomers();
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-700" />
            <span>{t.customers}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'ग्रामीण ग्राहकांची उधारी वही, संपर्क क्रमांक व देय तारीख ट्रॅकिंग'
              : 'Digital rural customer ledger (Khata) with offline balance tracking'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addCustomer}</span>
        </button>
      </div>

      {/* Outstanding Summary Card */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
            {language === 'mr' ? 'एकूण येणे बाकी (शिल्लक उधारी)' : 'Total Outstanding Balance (Udhari)'}
          </span>
          <div className="text-2xl font-black text-red-950 mt-0.5">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-xs text-red-800 font-semibold text-right">
          <div>{customers.length} {language === 'mr' ? 'ग्राहक' : 'customers'}</div>
          <Link
            to="/payments"
            className="text-[11px] underline text-forest-800 font-bold hover:text-forest-900"
          >
            {language === 'mr' ? 'उधारी जमा करा' : 'Collect Payments'}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-cream-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'mr' ? 'ग्राहकाचे नाव, फोन किंवा गाव शोधा...' : 'Search customer by name, phone or village...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500"
          />
        </div>
      </div>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((customer) => {
          const hasDue = customer.outstandingBalance > 0;
          return (
            <div
              key={customer.id}
              className="bg-white rounded-2xl p-4 border border-cream-200 shadow-sm flex flex-col justify-between hover:border-forest-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{customer.village || 'गाव'}, {customer.district || 'Pune'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {language === 'mr' ? 'बाकी उधारी' : 'Balance'}
                    </span>
                    <div
                      className={`font-black text-base ${
                        hasDue ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      ₹{customer.outstandingBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {customer.paymentDueDate && (
                  <div className="mt-2.5 p-2 bg-amber-50 rounded-xl text-[11px] font-bold text-amber-900 flex items-center justify-between border border-amber-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t.dueDate}:</span>
                    </span>
                    <span>{new Date(customer.paymentDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-cream-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  खरेदी: ₹{(customer.totalPurchases || 0).toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/payments?customerId=${customer.id}`}
                    className="p-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold px-2.5 border border-forest-200 flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'जमा करा' : 'Pay'}</span>
                  </Link>
                  {hasDue && (
                    <Link
                      to={`/sms?customerId=${customer.id}`}
                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-2.5 border border-amber-200 flex items-center gap-1"
                      title="Send SMS Payment Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-cream-200 animate-scale-up">
            <h3 className="font-black text-base text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-forest-700" />
              <span>{t.addCustomer}</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. ज्ञानेश्वर विठ्ठल शिंदे"
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.phone} (मोबाईल क्रमांक) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+919822000000"
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.village} (गाव)
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="गाव / वाडी"
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.district}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सुरुवातीची उधारी (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.outstandingBalance}
                    onChange={(e) => setFormData({ ...formData, outstandingBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-black text-red-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.dueDate}
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDueDate}
                    onChange={(e) => setFormData({ ...formData, paymentDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-300 text-xs font-bold text-slate-600 hover:bg-cream-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-xs font-bold text-white shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
