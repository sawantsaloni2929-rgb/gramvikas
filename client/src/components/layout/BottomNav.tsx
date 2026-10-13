import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { LayoutDashboard, ShoppingCart, Package, Users, Truck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { to: '/orders', label: t.orders, icon: Truck },
    { to: '/sales', label: t.sales, icon: ShoppingCart },
    { to: '/products', label: t.products, icon: Package },
    { to: '/customer-portal', label: t.customerPortal, icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 md:hidden shadow-lg safe-bottom">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
                  isActive
                    ? 'text-forest-700 bg-forest-50/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[60px] text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
