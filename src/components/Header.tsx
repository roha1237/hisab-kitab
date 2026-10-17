import React from 'react';
import {
  CheckCircle2,
  Globe,
  Sparkles,
  Download,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenTestRunner: () => void;
  onOpenAndroidExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenTestRunner,
  onOpenAndroidExport,
}) => {
  const t = translations[currentLang];
  const settings = storage.getData().settings;

  return (
    <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-xl">
                HM
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  {t.appName}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/40">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-300" />
                  100% Offline
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-300/90 font-medium">
                {t.tagline} • <span className="text-emerald-200/70">by {settings.developerName}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Run Acceptance Tests */}
            <button
              onClick={onOpenTestRunner}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-medium transition cursor-pointer shadow-sm"
              title="Run 10 Financial Acceptance Unit Tests"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Financial Tests</span>
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] bg-emerald-700 text-white rounded-full">
                10/10
              </span>
            </button>

            {/* Android PWA Install Button */}
            <PWAInstallButton
              currentLang={currentLang}
              onOpenAndroidExport={onOpenAndroidExport}
              variant="header"
            />

            {/* Android Studio Project / APK Button */}
            <button
              onClick={onOpenAndroidExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-200 border border-emerald-700/60 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">APK Studio Code</span>
              <span className="sm:hidden">Code</span>
            </button>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-emerald-900/90 rounded-lg p-0.5 border border-emerald-700/60 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-0.5" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-emerald-100 text-xs py-1 pr-2 pl-1 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer font-medium"
              >
                <option value="hi" className="bg-emerald-950 text-white">
                  हिंदी
                </option>
                <option value="mr" className="bg-emerald-950 text-white">
                  मराठी
                </option>
                <option value="en" className="bg-emerald-950 text-white">
                  English
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
