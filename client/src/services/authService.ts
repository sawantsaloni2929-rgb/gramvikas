import { StoredAccount } from '../db/dexieDb';
import { getUsers, saveUser, generateId, saveCustomer } from '../db/dbOperations';
import { initialUsers } from '../db/initialData';

export interface UserProfile {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  village: string;
  district: string;
  taluka?: string;
  phone: string;
  preferredLanguage: 'mr' | 'en';
  role: 'shopkeeper' | 'customer' | 'admin';
}

const DEFAULT_USER: UserProfile = {
  id: 'user_suresh_patil',
  email: 'suresh@gramvikas.in',
  businessName: 'Shree Ganesh Krishi & Kirana Stores',
  ownerName: 'Suresh Tukaram Patil',
  village: 'Baramati Rural',
  taluka: 'Baramati',
  district: 'Pune',
  phone: '9822998877',
  preferredLanguage: 'mr',
  role: 'shopkeeper',
};

export const getStoredUser = (): UserProfile => {
  const json = localStorage.getItem('gv_current_user');
  if (json) {
    try {
      return JSON.parse(json);
    } catch {
      // fallback
    }
  }
  return DEFAULT_USER;
};

export const setStoredUser = (user: UserProfile): void => {
  localStorage.setItem('gv_current_user', JSON.stringify(user));
  localStorage.setItem('gv_user_id', user.id);
  localStorage.setItem('gv_business_name', user.businessName);
  localStorage.setItem('gv_owner_name', user.ownerName);
  localStorage.setItem('gv_owner_phone', user.phone);
  localStorage.setItem('gv_language', user.preferredLanguage);
  localStorage.setItem('gv_role', user.role);
};

export const loginUser = async (identifier: string, password: string): Promise<UserProfile> => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/[^0-9]/g, '');

  // 1. First, query all accounts from the local IndexedDB database
  const allAccounts = await getUsers();

  // 2. Find matching account by email OR phone
  const matched = allAccounts.find((acc) => {
    const accEmail = (acc.email || '').trim().toLowerCase();
    const accPhone = (acc.phone || '').replace(/[^0-9]/g, '');
    return accEmail === cleanId || (cleanPhone.length >= 7 && accPhone.endsWith(cleanPhone.slice(-10)));
  });

  if (!matched) {
    throw new Error(
      'वापरकर्ता सापडला नाही! कृपया आधी नवीन नोंदणी करा किंवा डेमो माहिती वापरा. / User not found! Please register first or use a demo account.'
    );
  }

  // 3. Verify password
  if (matched.password !== password) {
    throw new Error('चुकीचा पासवर्ड! कृपया पुन्हा तपासा. / Incorrect password! Please try again.');
  }

  // 4. Construct user profile & store active session
  const userProfile: UserProfile = {
    id: matched.id,
    email: matched.email,
    businessName: matched.businessName || `${matched.name}'s Business`,
    ownerName: matched.name,
    village: matched.village || 'Baramati Rural',
    district: matched.district || 'Pune',
    taluka: matched.taluka || '',
    phone: matched.phone,
    preferredLanguage: matched.preferredLanguage || 'mr',
    role: matched.role || 'shopkeeper',
  };

  setStoredUser(userProfile);
  return userProfile;
};

export const registerUser = async (formData: {
  email: string;
  phone: string;
  password: string;
  ownerName: string;
  businessName?: string;
  village: string;
  district: string;
  taluka?: string;
  role: 'shopkeeper' | 'customer' | 'admin';
  preferredLanguage?: 'mr' | 'en';
}): Promise<UserProfile> => {
  const cleanEmail = formData.email.trim();
  const cleanPhone = formData.phone.trim();
  const role = formData.role || 'shopkeeper';

  const newAccount: StoredAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    phone: cleanPhone,
    password: formData.password || '123456',
    name: formData.ownerName || formData.businessName || 'User',
    businessName: role === 'shopkeeper' ? (formData.businessName || `${formData.ownerName}'s Store`) : 'Customer Account',
    role,
    village: formData.village || 'Maharashtra Rural',
    district: formData.district || 'Pune',
    taluka: formData.taluka || '',
    preferredLanguage: formData.preferredLanguage || 'mr',
    createdAt: new Date().toISOString(),
  };

  // 1. Permanently persist in IndexedDB and localStorage
  await saveUser(newAccount);

  // 2. If it is a customer account, also register in the Customers Table so they appear in Khata!
  if (role === 'customer') {
    try {
      await saveCustomer({
        name: newAccount.name,
        phone: newAccount.phone,
        village: newAccount.village,
        district: newAccount.district,
        taluka: newAccount.taluka,
        totalPurchases: 0,
        outstandingBalance: 0,
      });
    } catch (e) {
      console.warn('Customer khata link note:', e);
    }
  }

  // 3. Set current active session
  const userProfile: UserProfile = {
    id: newAccount.id,
    email: newAccount.email,
    businessName: newAccount.businessName || newAccount.name,
    ownerName: newAccount.name,
    village: newAccount.village,
    district: newAccount.district,
    taluka: newAccount.taluka || '',
    phone: newAccount.phone,
    preferredLanguage: newAccount.preferredLanguage,
    role: newAccount.role,
  };

  setStoredUser(userProfile);
  return userProfile;
};

export const logoutUser = (): void => {
  localStorage.removeItem('gv_current_user');
  localStorage.removeItem('gv_user_id');
  localStorage.removeItem('gv_token');
  localStorage.removeItem('gv_business_name');
  localStorage.removeItem('gv_owner_name');
  localStorage.removeItem('gv_role');
};
