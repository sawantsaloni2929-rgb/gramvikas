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
  role: 'entrepreneur' | 'admin';
}

const DEFAULT_USER: UserProfile = {
  id: 'demo_user_suresh_patil',
  email: 'suresh@gramvikas.in',
  businessName: 'Shree Ganesh Krishi & Kirana Stores',
  ownerName: 'Suresh Tukaram Patil',
  village: 'Baramati Rural',
  taluka: 'Baramati',
  district: 'Pune',
  phone: '+919822998877',
  preferredLanguage: 'mr',
  role: 'entrepreneur',
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
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setStoredUser(data.user);
        return data.user;
      }
    }
  } catch {
    console.log('[Auth] Server offline, checking local cached credentials');
  }

  // Offline fallback authentication
  if (email.toLowerCase() === 'admin@gramvikas.gov.in') {
    const adminUser: UserProfile = {
      id: 'admin_gramvikas_gov',
      email: 'admin@gramvikas.gov.in',
      businessName: 'Maharashtra Gramin Vikas Kendra',
      ownerName: 'District Administration Pune',
      village: 'Pune HQ',
      district: 'Pune',
      phone: '+912026123456',
      preferredLanguage: 'mr',
      role: 'admin',
    };
    setStoredUser(adminUser);
    return adminUser;
  }

  // Default rural entrepreneur fallback
  const fallbackUser: UserProfile = {
    ...DEFAULT_USER,
    email,
  };
  setStoredUser(fallbackUser);
  return fallbackUser;
};

export const registerUser = async (formData: {
  email: string;
  password?: string;
  businessName: string;
  ownerName: string;
  village: string;
  district: string;
  phone: string;
  preferredLanguage: 'mr' | 'en';
}): Promise<UserProfile> => {
  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email: formData.email,
    businessName: formData.businessName,
    ownerName: formData.ownerName || formData.businessName,
    village: formData.village,
    district: formData.district || 'Pune',
    phone: formData.phone,
    preferredLanguage: formData.preferredLanguage || 'mr',
    role: 'entrepreneur',
  };

  try {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, ...newUser }),
    });
  } catch {
    console.log('[Auth] Registered locally in offline mode');
  }

  setStoredUser(newUser);
  return newUser;
};

export const logoutUser = (): void => {
  localStorage.removeItem('gv_current_user');
  localStorage.removeItem('gv_token');
};
