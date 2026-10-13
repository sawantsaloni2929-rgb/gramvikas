import { db } from '../db/dexieDb';

export const exportSalesToCSV = async (): Promise<void> => {
  const sales = await db.sales.toArray();
  const headers = ['InvoiceNumber', 'Date', 'CustomerName', 'Phone', 'PaymentMethod', 'Subtotal', 'Discount', 'TotalAmount', 'PaidAmount', 'BalanceDue', 'ItemsCount'];
  
  const rows = sales.map((s) => [
    s.invoiceNumber,
    s.transactionDate,
    `"${s.customerName.replace(/"/g, '""')}"`,
    s.customerPhone || '',
    s.paymentMethod,
    s.subtotal,
    s.discount,
    s.totalAmount,
    s.paidAmount,
    s.balanceAmount,
    s.items.length,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `GramVikas_Sales_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const exportProductsToCSV = async (): Promise<void> => {
  const products = await db.products.toArray();
  const headers = ['SKU', 'Name', 'NameMarathi', 'Category', 'Unit', 'CostPrice', 'SellingPrice', 'CurrentStock', 'MinAlertThreshold'];

  const rows = products.map((p) => [
    p.sku,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${(p.nameMr || '').replace(/"/g, '""')}"`,
    p.category,
    p.unit,
    p.costPrice,
    p.sellingPrice,
    p.currentStock,
    p.minStockThreshold,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `GramVikas_Inventory_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const exportCustomersToCSV = async (): Promise<void> => {
  const customers = await db.customers.toArray();
  const headers = ['Name', 'Phone', 'Village', 'District', 'TotalPurchases', 'OutstandingBalance', 'DueDate'];

  const rows = customers.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    c.phone,
    `"${c.village.replace(/"/g, '""')}"`,
    c.district || '',
    c.totalPurchases,
    c.outstandingBalance,
    c.paymentDueDate || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, `GramVikas_Customer_Khata_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const downloadFullDatabaseJSON = async (): Promise<void> => {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    businessName: localStorage.getItem('gv_business_name') || 'GramVikas Enterprise',
    products: await db.products.toArray(),
    sales: await db.sales.toArray(),
    expenses: await db.expenses.toArray(),
    customers: await db.customers.toArray(),
    payments: await db.payments.toArray(),
    smsQueue: await db.smsQueue.toArray(),
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  downloadBlob(jsonStr, `GramVikas_Complete_Backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

export const restoreDatabaseFromJSON = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.products || !data.sales) {
      throw new Error('Invalid GramVikas backup format. Missing core business tables.');
    }

    await db.transaction('rw', [
      db.products,
      db.sales,
      db.expenses,
      db.customers,
      db.payments,
      db.smsQueue,
    ], async () => {
      if (Array.isArray(data.products)) {
        for (const p of data.products) await db.products.put(p);
      }
      if (Array.isArray(data.sales)) {
        for (const s of data.sales) await db.sales.put(s);
      }
      if (Array.isArray(data.expenses)) {
        for (const e of data.expenses) await db.expenses.put(e);
      }
      if (Array.isArray(data.customers)) {
        for (const c of data.customers) await db.customers.put(c);
      }
      if (Array.isArray(data.payments)) {
        for (const p of data.payments) await db.payments.put(p);
      }
      if (Array.isArray(data.smsQueue)) {
        for (const sms of data.smsQueue) await db.smsQueue.put(sms);
      }
    });

    window.dispatchEvent(new CustomEvent('gramvikas:data_changed'));
    return {
      success: true,
      message: 'Backup successfully restored! Local database updated.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Restore failed: ${err.message}`,
    };
  }
};

const downloadBlob = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
