import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Store,
  CheckCircle,
  Smartphone,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface SettingsScreenProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  const t = translations[currentLang];
  const settings = storage.getData().settings;

  const [salonName, setSalonName] = useState(settings.salonName);
  const [salonAddress, setSalonAddress] = useState(settings.salonAddress);
  const [salonPhone, setSalonPhone] = useState(settings.salonPhone);
  const [salonUpiId, setSalonUpiId] = useState(settings.salonUpiId || '');
  const [billPrefixSalon, setBillPrefixSalon] = useState(settings.billPrefixSalon);
  const [thankYouNote, setThankYouNote] = useState(settings.thankYouNote);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSettings({
      salonName: salonName.trim(),
      salonAddress: salonAddress.trim(),
      salonPhone: salonPhone.trim(),
      salonUpiId: salonUpiId.trim(),
      billPrefixSalon: billPrefixSalon.trim(),
      thankYouNote: thankYouNote.trim(),
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Toast */}
      {showSuccessToast && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl flex items-center gap-2 shadow-lg text-xs sm:text-sm font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{t.settingsSaved}</span>
        </div>
      )}

      {/* Language Selection Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {t.language}
            </h3>
            <p className="text-xs text-slate-500">
              Select your preferred language (Hindi, Marathi, or English)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              currentLang === 'hi'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-600/30'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-base font-bold">हिंदी</span>
            <span className={`text-[11px] ${currentLang === 'hi' ? 'text-emerald-200' : 'text-slate-400'}`}>
              Hindi
            </span>
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('mr')}
            className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              currentLang === 'mr'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-600/30'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-base font-bold">मराठी</span>
            <span className={`text-[11px] ${currentLang === 'mr' ? 'text-emerald-200' : 'text-slate-400'}`}>
              Marathi
            </span>
          </button>

          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              currentLang === 'en'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-600/30'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-base font-bold">English</span>
            <span className={`text-[11px] ${currentLang === 'en' ? 'text-emerald-200' : 'text-slate-400'}`}>
              Default
            </span>
          </button>
        </div>
      </div>

      {/* Business Details Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {t.salonDetails}
            </h3>
            <p className="text-xs text-slate-500">
              These details appear on your printed PDF invoices and receipts
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.salonName} *
            </label>
            <input
              type="text"
              required
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.salonAddress} *
            </label>
            <input
              type="text"
              required
              value={salonAddress}
              onChange={(e) => setSalonAddress(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t.salonPhone} *
              </label>
              <input
                type="tel"
                required
                value={salonPhone}
                onChange={(e) => setSalonPhone(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t.salonUpi}
              </label>
              <input
                type="text"
                placeholder="e.g. mobile@upi"
                value={salonUpiId}
                onChange={(e) => setSalonUpiId(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.billPrefix}
            </label>
            <input
              type="text"
              value={billPrefixSalon}
              onChange={(e) => setBillPrefixSalon(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t.thankYouText}
            </label>
            <textarea
              rows={2}
              value={thankYouNote}
              onChange={(e) => setThankYouNote(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t.saveSettings}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
