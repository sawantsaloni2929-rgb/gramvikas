import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { getStoredUser } from '../../services/authService';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const user = getStoredUser();

  const navItems = [
    { to: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { to: '/customer-portal', label: t.customerPortal, icon: Users },
    { to: '/orders', label: t.orders, icon: Truck },
    { to: '/sales', label: t.sales, icon: ShoppingCart },
    { to: '/products', label: t.products, icon: Package },
    { to: '/customers', label: t.customers, icon: Users },
    { to: '/expenses', label: t.expenses, icon: Receipt },
    { to: '/payments', label: t.payments, icon: CreditCard },
    { to: '/insights', label: t.insights, icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white border-r border-cream-200 hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-57px)]">
      <div className="p-4 flex-1 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-3 mb-2">
          {user.businessName}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-cream-100 hover:text-forest-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Offline Guarantee Footer */}
      <div className="p-4 border-t border-cream-200 bg-cream-50/70 text-xs text-earth-800">
        <div className="flex items-center gap-2 font-bold text-forest-900 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>100% Offline Ready</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          All records save locally in IndexedDB first, then sync to cloud safely.
        </p>
      </div>
    </aside>
  );
};
