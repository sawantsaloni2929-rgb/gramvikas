import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getCustomers, recordPayment } from '../db/dbOperations';
import { db, Customer, Payment } from '../db/dexieDb';
import { dispatchSms, formatPaymentReminderText } from '../services/smsService';
import { CreditCard, CheckCircle, Send, MessageSquare, IndianRupee, Clock, AlertTriangle } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<Payment['paymentMode']>('cash');
  const [receiptNote, setReceiptNote] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // SMS Reminder State
  const [smsModalCustomer, setSmsModalCustomer] = useState<Customer | null>(null);
  const [smsPreviewText, setSmsPreviewText] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  const loadData = async () => {
    const cList = await getCustomers();
    setCustomers(cList);
    const pList = await db.payments.reverse().sortBy('paymentDate');
    setPayments(pList);

    // Read query parameter if arrived from customer page
    const params = new URLSearchParams(location.search);
    const cId = params.get('customerId');
    if (cId) {
      setSelectedCustomerId(cId);
      const target = cList.find((c) => c.id === cId);
      if (target) setPaymentAmount(target.outstandingBalance);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.search]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;

    await recordPayment({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amount: paymentAmount,
      paymentMode,
      receiptNote,
    });

    setSuccessToast(
      language === 'mr'
        ? `₹${paymentAmount} उधारी वसुली यशस्वीरीत्या नोंदवली गेली!`
        : `Payment of ₹${paymentAmount} recorded successfully!`
    );
    setPaymentAmount(0);
    setReceiptNote('');
    loadData();
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const openSmsModal = (customer: Customer) => {
    const bName = localStorage.getItem('gv_business_name') || 'Shree Ganesh Krishi & Kirana';
    const text = formatPaymentReminderText(
      customer.name,
      customer.outstandingBalance,
      customer.paymentDueDate || new Date().toISOString().split('T')[0],
      bName,
      language
    );
    setSmsModalCustomer(customer);
    setSmsPreviewText(text);
  };

  const handleSendReminder = async () => {
    if (!smsModalCustomer) return;
    setSendingSms(true);
    const res = await dispatchSms({
      recipientPhone: smsModalCustomer.phone,
      recipientName: smsModalCustomer.name,
      messageText: smsPreviewText,
      category: 'payment_reminder',
    });
    setSendingSms(false);
    setSmsModalCustomer(null);
    setSuccessToast(res.message);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-forest-700" />
          <span>{t.payments}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'mr'
            ? 'ग्राहकांकडून आलेली उधारी वसुली, पावती नोंद व स्मरणपत्र एसएमएस पाठवा'
            : 'Record customer due payments and dispatch automated SMS payment reminders'}
        </p>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Record Payment Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-cream-200 shadow-sm space-y-3.5">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-forest-700" />
            <span>{t.recordCustomerPayment}</span>
          </h3>

          <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.customer} *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const cust = customers.find((c) => c.id === e.target.value);
                  if (cust) setPaymentAmount(cust.outstandingBalance);
                }}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-cream-300 text-xs font-bold bg-cream-50"
              >
                <option value="">-- {language === 'mr' ? 'ग्राहक निवडा' : 'Select Customer'} --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.village}) — Due: ₹{c.outstandingBalance}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex justify-between items-center text-amber-950 font-bold">
                <span>{language === 'mr' ? 'सध्याची एकूण उधारी:' : 'Current Due:'}</span>
                <span className="text-red-700 text-sm">₹{selectedCustomer.outstandingBalance}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'जमा रक्कम (₹)' : 'Received Amount (₹)'} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-base font-black text-forest-900"
              />
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
                    onClick={() => setPaymentMode(m)}
                    className={`py-2 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                      paymentMode === m
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
                पावती नोंद / टीप (Note)
              </label>
              <input
                type="text"
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="उदा. दुधाच्या बिलावरून रोख जमा"
                className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedCustomer || paymentAmount <= 0}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white font-extrabold py-3 rounded-xl shadow-sm text-xs sm:text-sm transition-all"
            >
              {language === 'mr' ? 'जमा पावती नोंदवा' : 'Save Payment Receipt'}
            </button>
          </form>
        </div>

        {/* Due Customers & SMS Reminders */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>{language === 'mr' ? 'उधारी परतफेड प्रलंबित ग्राहक' : 'Pending Customer Payments & Reminders'}</span>
              <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                {customers.filter((c) => c.outstandingBalance > 0).length} {language === 'mr' ? 'खाती' : 'Due'}
              </span>
            </h3>

            <div className="divide-y divide-cream-100 max-h-[360px] overflow-y-auto pr-1">
              {customers
                .filter((c) => c.outstandingBalance > 0)
                .map((cust) => (
                  <div key={cust.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {cust.village} | {cust.phone}
                      </div>
                      {cust.paymentDueDate && (
                        <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                          देय तारीख: {cust.paymentDueDate}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-black text-red-700 text-sm text-right">
                        ₹{cust.outstandingBalance}
                      </div>
                      <button
                        onClick={() => openSmsModal(cust)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                        title="Preview & Send Payment Reminder SMS"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* SMS Reminder Preview Modal */}
      {smsModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-cream-200 animate-scale-up">
            <h3 className="font-black text-base text-slate-900 mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-700" />
              <span>{t.sendReminder}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3 font-semibold">
              To: {smsModalCustomer.name} ({smsModalCustomer.phone})
            </p>

            <div className="mb-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.messagePreview} (संपादन करू शकता):
              </label>
              <textarea
                rows={4}
                value={smsPreviewText}
                onChange={(e) => setSmsPreviewText(e.target.value)}
                className="w-full p-3 rounded-xl border border-cream-300 text-xs font-medium focus:ring-2 focus:ring-forest-500 bg-cream-50 leading-relaxed"
              />
            </div>

            <p className="text-[11px] text-slate-500 italic mb-4">
              {language === 'mr'
                ? 'ऑफलाइन असल्यास एसएमएस रांगेत सेव्ह होईल किंवा मोबाईलच्या एसएमएस ॲपद्वारे पाठवता येईल.'
                : 'If offline, message will queue in IndexedDB or trigger native SMS app fallback.'}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSmsModalCustomer(null)}
                className="flex-1 py-2.5 rounded-xl border border-cream-300 text-xs font-bold text-slate-600 hover:bg-cream-100"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={sendingSms}
                className="flex-1 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingSms ? t.loading : 'Send SMS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
