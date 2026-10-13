import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getExpenses, recordExpense, deleteExpense } from '../db/dbOperations';
import { Expense } from '../db/dexieDb';
import { Receipt, PlusCircle, Trash2, Search, IndianRupee, Tag } from 'lucide-react';

const CATEGORIES = [
  'transport',
  'electricity_power',
  'shop_rent',
  'stock_purchase',
  'wages_labour',
  'packaging',
  'maintenance',
  'other',
];

export const ExpensesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    category: 'transport',
    amount: 100,
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    paymentMode: 'cash' as Expense['paymentMode'],
  });

  const loadExpenses = async () => {
    const list = await getExpenses();
    setExpenses(list);
  };

  useEffect(() => {
    loadExpenses();
    const handleDataChange = () => loadExpenses();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    await recordExpense(formData);
    setShowAddModal(false);
    setFormData({
      category: 'transport',
      amount: 100,
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      paymentMode: 'cash',
    });
    loadExpenses();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this expense record?')) {
      await deleteExpense(id);
      loadExpenses();
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenses.filter((e) => {
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'transport': return t.transport;
      case 'electricity_power': return t.electricity;
      case 'shop_rent': return t.rent;
      case 'stock_purchase': return t.stockPurchase;
      case 'wages_labour': return t.wages;
      case 'packaging': return t.packaging;
      case 'maintenance': return t.maintenance;
      default: return t.other;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-forest-700" />
            <span>{t.expenses}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'दुकान खर्च, वाहतूक भाडे, वीज बिल, हमाली व इतर खर्चाची स्थानिक नोंद'
              : 'Track daily operational expenses to calculate genuine profit margins'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* KPI Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            {language === 'mr' ? 'एकूण नोंदवलेला खर्च' : 'Total Recorded Expenses'}
          </span>
          <div className="text-2xl font-black text-amber-950 mt-0.5">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-xs text-amber-800 font-semibold text-right">
          <div>{expenses.length} {language === 'mr' ? 'नोंदी' : 'records'}</div>
          <div className="text-[10px] text-amber-700">IndexedDB Local</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-cream-200 shadow-sm flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'mr' ? 'खर्चाचा तपशील शोधा...' : 'Search expense notes...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-cream-300 text-xs font-bold bg-cream-50"
        >
          <option value="ALL">{language === 'mr' ? 'सर्व खर्च प्रकार (All)' : 'All Categories'}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{getCategoryLabel(c)}</option>
          ))}
        </select>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-cream-200">
              <tr>
                <th className="p-3.5">{t.date}</th>
                <th className="p-3.5">{t.expenseCategory}</th>
                <th className="p-3.5">{t.description}</th>
                <th className="p-3.5">{t.paymentMethod}</th>
                <th className="p-3.5 text-right">{t.amount}</th>
                <th className="p-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.length > 0 ? (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-medium">
                      {new Date(exp.expenseDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-cream-200 text-slate-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {getCategoryLabel(exp.category)}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 max-w-xs truncate">
                      {exp.description || '-'}
                    </td>
                    <td className="p-3.5 capitalize font-semibold text-slate-600">
                      {exp.paymentMode}
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900 text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    {t.noRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-cream-200 animate-scale-up">
            <h3 className="font-black text-base text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-forest-700" />
              <span>{t.saveExpense}</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.expenseCategory} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 text-xs font-bold bg-cream-50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.amount} (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-sm font-black text-forest-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'upi', 'bank_transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: m })}
                      className={`py-2 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                        formData.paymentMode === m
                          ? 'bg-forest-700 text-white border-forest-800'
                          : 'bg-cream-50 text-slate-700 border-cream-300'
                      }`}
                    >
                      {m === 'cash' ? t.cash : m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.description} / टीप
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="उदा. टेम्पो भाडे किंवा हमाली मजुरी"
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
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
