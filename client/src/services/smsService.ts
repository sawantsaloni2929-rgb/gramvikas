import { db, SmsRecord } from '../db/dexieDb';
import { generateId } from '../db/dbOperations';
import { checkBackendHealth } from './connectivity';

export interface SendSmsResult {
  success: boolean;
  smsRecord: SmsRecord;
  mode: 'online_gateway' | 'offline_queued' | 'native_fallback';
  message: string;
}

export const generateNativeSmsUri = (phone: string, text: string): string => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
};

export const formatPaymentReminderText = (
  customerName: string,
  amount: number,
  dueDate: string,
  businessName: string,
  lang: 'en' | 'mr' = 'mr'
): string => {
  if (lang === 'mr') {
    return `ग्रामविकास स्मरणपत्र: नमस्कार ${customerName} जी, ${businessName} कडे आपली ₹${amount} उधारी येणे बाकी आहे. देय तारीख: ${dueDate}. कृपया सोयीनुसार जमा करावी ही नम्र विनंती.`;
  }
  return `GramVikas Reminder: Dear ${customerName}, an outstanding balance of Rs. ${amount} is due on ${dueDate} at ${businessName}. Please settle at your convenience.`;
};

export const formatLowStockAlertText = (
  productName: string,
  currentStock: number,
  unit: string,
  threshold: number,
  lang: 'en' | 'mr' = 'mr'
): string => {
  if (lang === 'mr') {
    return `ग्रामविकास अलर्ट: आपल्या दुकानातील '${productName}' चा साठा कमी झाला आहे. शिल्लक: ${currentStock} ${unit} (किमान मर्यादा: ${threshold}). कृपया लवकर खरेदी करावी.`;
  }
  return `GramVikas Alert: Your stock of ${productName} is running low. Current stock: ${currentStock} ${unit}(s) (Min threshold: ${threshold}). Please restock soon.`;
};

export const formatOrderUpdateText = (
  invoiceNumber: string,
  customerName: string,
  amount: number,
  businessName: string,
  lang: 'en' | 'mr' = 'mr'
): string => {
  if (lang === 'mr') {
    return `ग्रामविकास पावती: धन्यवाद ${customerName} जी! ${businessName} कडून आपले बिल क्र. ${invoiceNumber} (रक्कम ₹${amount}) यशस्वीरीत्या नोंदवले आहे.`;
  }
  return `GramVikas Receipt: Thank you ${customerName}! Your invoice ${invoiceNumber} of Rs. ${amount} has been recorded at ${businessName}.`;
};

export const dispatchSms = async (params: {
  recipientPhone: string;
  recipientName: string;
  messageText: string;
  category: SmsRecord['category'];
  isTest?: boolean;
}): Promise<SendSmsResult> => {
  const isOnline = await checkBackendHealth();
  const userId = localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil';
  const now = new Date().toISOString();

  // Basic mobile number validation
  const cleanPhone = params.recipientPhone.replace(/[^0-9+]/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Invalid mobile number. Must contain at least 10 digits.');
  }

  // Duplicate suppression: avoid sending same message to same recipient on the same day
  const today = now.split('T')[0];
  const duplicate = await db.smsQueue
    .where('recipientPhone')
    .equals(cleanPhone)
    .filter((s) => s.category === params.category && s.createdAt.startsWith(today))
    .first();

  if (duplicate && !params.isTest) {
    return {
      success: true,
      smsRecord: duplicate,
      mode: 'offline_queued',
      message: 'A similar notification was already scheduled/sent for this recipient today. Duplicate suppressed.',
    };
  }

  if (isOnline) {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: cleanPhone,
          messageText: params.messageText,
          category: params.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const record: SmsRecord = {
          id: data.smsId || generateId('sms'),
          category: params.category,
          recipientPhone: cleanPhone,
          recipientName: params.recipientName,
          messageText: params.messageText,
          status: 'sent',
          deliveryProvider: 'MSG91',
          providerMessageId: data.providerId || 'MSG91-SIM-OK',
          sentAt: data.sentAt || now,
          createdAt: now,
          isTest: params.isTest,
          syncStatus: 'synced',
          userId,
        };

        await db.smsQueue.add(record);
        return {
          success: true,
          smsRecord: record,
          mode: 'online_gateway',
          message: 'SMS sent successfully via MSG91 Gateway!',
        };
      }
    } catch (err) {
      console.warn('[SMS Service] Online send failed, falling back to offline queue:', err);
    }
  }

  // Offline / Gateway Fallback: save to Dexie queue
  const offlineRecord: SmsRecord = {
    id: generateId('sms_off'),
    category: params.category,
    recipientPhone: cleanPhone,
    recipientName: params.recipientName,
    messageText: params.messageText,
    status: 'offline_queued',
    deliveryProvider: 'Native_SMS_Fallback',
    createdAt: now,
    isTest: params.isTest,
    syncStatus: 'pending',
    userId,
  };

  await db.smsQueue.add(offlineRecord);

  return {
    success: true,
    smsRecord: offlineRecord,
    mode: 'offline_queued',
    message: 'Device is offline. SMS saved in offline queue and will automatically send when connected, or you can open Phone SMS App directly.',
  };
};
