import { db, SyncEvent } from '../db/dexieDb';
import { checkBackendHealth } from './connectivity';
import { generateId } from '../db/dbOperations';

export interface SyncResult {
  success: boolean;
  pushedCount: number;
  serverTimestamp?: string;
  message: string;
  error?: string;
}

export const syncWithServer = async (): Promise<SyncResult> => {
  const isOnline = await checkBackendHealth();
  if (!isOnline) {
    return {
      success: false,
      pushedCount: 0,
      message: 'Internet or server connection unavailable. Changes remain stored safely offline.',
    };
  }

  try {
    // 1. Gather all pending records
    const pendingProducts = await db.products.where('syncStatus').equals('pending').toArray();
    const pendingSales = await db.sales.where('syncStatus').equals('pending').toArray();
    const pendingExpenses = await db.expenses.where('syncStatus').equals('pending').toArray();
    const pendingCustomers = await db.customers.where('syncStatus').equals('pending').toArray();
    const pendingPayments = await db.payments.where('syncStatus').equals('pending').toArray();
    const pendingSms = await db.smsQueue.where('status').equals('offline_queued').toArray();

    const totalToPush =
      pendingProducts.length +
      pendingSales.length +
      pendingExpenses.length +
      pendingCustomers.length +
      pendingPayments.length;

    const payload = {
      userId: localStorage.getItem('gv_user_id') || 'demo_user_suresh_patil',
      syncClientTimestamp: new Date().toISOString(),
      products: pendingProducts,
      sales: pendingSales,
      expenses: pendingExpenses,
      customers: pendingCustomers,
      payments: pendingPayments,
    };

    // 2. Transmit batch to Java backend
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // 3. Mark successfully synchronized records in Dexie
    await db.transaction('rw', [
      db.products,
      db.sales,
      db.expenses,
      db.customers,
      db.payments,
      db.smsQueue,
      db.syncEvents,
    ], async () => {
      for (const p of pendingProducts) {
        p.syncStatus = 'synced';
        await db.products.put(p);
      }
      for (const s of pendingSales) {
        s.syncStatus = 'synced';
        await db.sales.put(s);
      }
      for (const e of pendingExpenses) {
        e.syncStatus = 'synced';
        await db.expenses.put(e);
      }
      for (const c of pendingCustomers) {
        c.syncStatus = 'synced';
        await db.customers.put(c);
      }
      for (const pay of pendingPayments) {
        pay.syncStatus = 'synced';
        await db.payments.put(pay);
      }

      // 4. Also process queued offline SMS messages
      for (const sms of pendingSms) {
        try {
          const smsRes = await fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientPhone: sms.recipientPhone,
              messageText: sms.messageText,
              category: sms.category,
            }),
          });
          if (smsRes.ok) {
            const smsData = await smsRes.json();
            sms.status = 'sent';
            sms.providerMessageId = smsData.providerId;
            sms.sentAt = smsData.sentAt || new Date().toISOString();
            sms.syncStatus = 'synced';
            await db.smsQueue.put(sms);
          }
        } catch (err) {
          console.warn('[Sync] Failed sending queued SMS:', sms.id, err);
        }
      }

      // 5. Record sync event audit log
      const syncEvent: SyncEvent = {
        id: generateId('syncevt'),
        timestamp: new Date().toISOString(),
        itemsPushed: totalToPush + pendingSms.length,
        itemsPulled: 0,
        status: 'success',
        details: `Batch synchronization completed successfully (${totalToPush} records + ${pendingSms.length} SMS dispatched)`,
      };
      await db.syncEvents.add(syncEvent);
    });

    localStorage.setItem('gv_last_sync_time', new Date().toISOString());
    window.dispatchEvent(new CustomEvent('gramvikas:data_changed'));

    return {
      success: true,
      pushedCount: totalToPush + pendingSms.length,
      serverTimestamp: data.serverTimestamp,
      message: `Synchronization completed. ${totalToPush + pendingSms.length} records updated on cloud.`,
    };
  } catch (err: any) {
    console.error('[GramVikas Sync Error]', err);
    return {
      success: false,
      pushedCount: 0,
      message: 'Failed to synchronize with server. Please retry later.',
      error: err.message,
    };
  }
};
