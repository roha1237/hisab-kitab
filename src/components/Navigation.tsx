import React from 'react';
import {
  LayoutDashboard,
  Scissors,
  Sprout,
  BookOpen,
  BarChart3,
  Smartphone,
  Database,
  Settings,
  Info,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

export type NavTab =
  | 'dashboard'
  | 'salon'
  | 'agriculture'
  | 'udhaar'
  | 'reports'
  | 'android'
  | 'backup'
  | 'settings'
  | 'about';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentLang: Language;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  currentLang,
}) => {
  const t = translations[currentLang];

  const tabs: Array<{ id: NavTab; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'salon', label: t.navSalon, icon: Scissors },
    { id: 'agriculture', label: t.navAgriculture, icon: Sprout },
    { id: 'udhaar', label: t.navUdhaar, icon: BookOpen },
    { id: 'reports', label: t.navReports, icon: BarChart3 },
    { id: 'android', label: t.navAndroidCode, icon: Smartphone },
    { id: 'backup', label: t.navBackup, icon: Database },
    { id: 'settings', label: t.navSettings, icon: Settings },
    { id: 'about', label: t.navAbout, icon: Info },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
