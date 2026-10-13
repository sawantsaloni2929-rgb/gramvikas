import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { getSmsQueue } from '../db/dbOperations';
import { SmsRecord } from '../db/dexieDb';
import { dispatchSms, generateNativeSmsUri } from '../services/smsService';
import {
  MessageSquare,
  Send,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Settings,
} from 'lucide-react';

export const SmsNotificationsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [smsList, setSmsList] = useState<SmsRecord[]>([]);
  const [testPhone, setTestPhone] = useState('+919822998877');
  const [testCategory, setTestCategory] = useState<SmsRecord['category']>('low_stock');
  const [testMessage, setTestMessage] = useState(
    'GramVikas Alert: Your stock of Wada Kolam Rice is running low (3 bags left). Please restock soon.'
  );
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Preference Toggles
  const [prefs, setPrefs] = useState({
    lowStock: true,
    paymentReminders: true,
    orderStatus: true,
    businessAlerts: true,
    schemes: true,
  });

  const loadQueue = async () => {
    const list = await getSmsQueue();
    setSmsList(list);
  };

  useEffect(() => {
    loadQueue();
    const handleDataChange = () => loadQueue();
    window.addEventListener('gramvikas:data_changed', handleDataChange);
    return () => window.removeEventListener('gramvikas:data_changed', handleDataChange);
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await dispatchSms({
        recipientPhone: testPhone,
        recipientName: 'Test Recipient',
        messageText: testMessage,
        category: testCategory,
        isTest: true,
      });
      setFeedback(res.message);
      loadQueue();
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSending(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const getStatusBadge = (status: SmsRecord['status']) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>{status.toUpperCase()}</span>
          </span>
        );
      case 'offline_queued':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            <Clock className="w-3 h-3" />
            <span>OFFLINE QUEUED</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-forest-700" />
          <span>{t.smsHubTitle}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'mr'
            ? 'कमी साठा, उधारी स्मरणपत्र व शासकीय योजनांचे थेट एसएमएस व्यवस्थापन'
            : 'SMS dispatch engine with offline queuing and native phone fallback'}
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-forest-100 border border-forest-300 text-forest-900 text-xs font-bold rounded-xl shadow-sm">
          {feedback}
        </div>
      )}

      {/* Gateway Status & Category Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Preferences */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm space-y-3 lg:col-span-1">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-forest-700" />
            <span>{language === 'mr' ? 'एसएमएस सूचना प्राधान्ये' : 'Notification Channels'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded-xl bg-cream-50 cursor-pointer">
              <span className="font-bold text-slate-700">{t.lowStockAlertSMS}</span>
              <input
                type="checkbox"
                checked={prefs.lowStock}
                onChange={(e) => setPrefs({ ...prefs, lowStock: e.target.checked })}
                className="w-4 h-4 text-forest-700 rounded accent-forest-700"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-cream-50 cursor-pointer">
              <span className="font-bold text-slate-700">{t.paymentReminderSMS}</span>
              <input
                type="checkbox"
                checked={prefs.paymentReminders}
                onChange={(e) => setPrefs({ ...prefs, paymentReminders: e.target.checked })}
                className="w-4 h-4 text-forest-700 rounded accent-forest-700"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-cream-50 cursor-pointer">
              <span className="font-bold text-slate-700">{t.orderStatusSMS}</span>
              <input
                type="checkbox"
                checked={prefs.orderStatus}
                onChange={(e) => setPrefs({ ...prefs, orderStatus: e.target.checked })}
                className="w-4 h-4 text-forest-700 rounded accent-forest-700"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-cream-50 cursor-pointer">
              <span className="font-bold text-slate-700">{t.schemeAlertSMS}</span>
              <input
                type="checkbox"
                checked={prefs.schemes}
                onChange={(e) => setPrefs({ ...prefs, schemes: e.target.checked })}
                className="w-4 h-4 text-forest-700 rounded accent-forest-700"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-cream-200 text-[11px] text-slate-400">
            {t.smsConsentNote}
          </div>
        </div>

        {/* Send Test SMS Card */}
        <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-sm space-y-3 lg:col-span-2">
          <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4 text-forest-700" />
              <span>{t.sendTestSMS} (Gateway / Phone Fallback)</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              MSG91 & Native SMS
            </span>
          </h3>

          <form onSubmit={handleSendTest} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.smsCategory}
                </label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-semibold bg-cream-50"
                >
                  <option value="low_stock">{t.lowStockAlertSMS}</option>
                  <option value="payment_reminder">{t.paymentReminderSMS}</option>
                  <option value="order_update">{t.orderStatusSMS}</option>
                  <option value="business_alert">{t.businessAlertsSMS}</option>
                  <option value="scheme_training">{t.schemeAlertSMS}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.messagePreview}
              </label>
              <textarea
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-cream-300 text-xs font-medium bg-cream-50"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={sending}
                className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? t.loading : 'Dispatch via Gateway'}</span>
              </button>

              <a
                href={generateNativeSmsUri(testPhone, testMessage)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-800" />
                <span>{t.openNativeSMS}</span>
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* SMS Queue & Delivery History */}
      <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-cream-200 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700" />
            <span>{language === 'mr' ? 'एसएमएस पाठवणी इतिहास व रांग (Queue)' : 'SMS Dispatch History & Offline Queue'}</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {smsList.length} {language === 'mr' ? 'संदेश' : 'messages'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-cream-200">
              <tr>
                <th className="p-3.5">{t.date}</th>
                <th className="p-3.5">{t.recipient}</th>
                <th className="p-3.5">{t.smsCategory}</th>
                <th className="p-3.5">मजकूर (Message)</th>
                <th className="p-3.5 text-center">{t.deliveryStatus}</th>
                <th className="p-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {smsList.map((sms) => (
                <tr key={sms.id} className="hover:bg-cream-50 transition-colors">
                  <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                    {new Date(sms.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{sms.recipientName || 'Recipient'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sms.recipientPhone}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="bg-cream-200 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {sms.category}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-xs truncate text-slate-700">
                    {sms.messageText}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    {getStatusBadge(sms.status)}
                    {sms.providerMessageId && (
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {sms.providerMessageId}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <a
                      href={generateNativeSmsUri(sms.recipientPhone, sms.messageText)}
                      className="p-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-slate-700 inline-flex items-center gap-1 font-bold text-[10px]"
                      title="Open in Phone SMS App"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{language === 'mr' ? 'ॲप उघडा' : 'Native SMS'}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
