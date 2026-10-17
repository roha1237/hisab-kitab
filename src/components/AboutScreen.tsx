import React from 'react';
import {
  ShieldCheck,
  Mail,
  User,
  Heart,
  Smartphone,
  Scissors,
  Sprout,
  BookOpen,
  FileText,
  Lock,
  Database,
  CheckCircle,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface AboutScreenProps {
  currentLang: Language;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const settings = storage.getData().settings;

  const handleOpenEmail = () => {
    window.open(`mailto:${settings.developerEmail}?subject=Hisab%20Master%20Inquiry`, '_blank');
  };

  const features = [
    {
      icon: Scissors,
      title: 'Salon Management & Billing',
      desc: 'Quick service selection (Haircut, Beard, Color, Facial), custom pricing, instant bill calculation, and professional PDF receipt generation.',
    },
    {
      icon: Sprout,
      title: 'Agriculture & Farm Management',
      desc: 'Field records, crop seasons (Kharif, Rabi, Zaid), crop-wise expenses (seeds, fertilizers, diesel, labour), Mandi sales, and net profit calculations.',
    },
    {
      icon: BookOpen,
      title: 'Customer Udhaar Ledger',
      desc: 'Transparent debtor tracking, partial payments, receipts, payment reversal workflow, and WhatsApp reminders with prefilled messages.',
    },
    {
      icon: Database,
      title: '100% Offline Room/Local Storage',
      desc: 'All records remain safely inside your device storage. Fully functional without an active internet connection.',
    },
    {
      icon: Smartphone,
      title: 'Native Android Studio Codebase',
      desc: 'Exportable Kotlin, Jetpack Compose, Material 3, and Room project ready to build and run on any Android phone (including 4 GB RAM models).',
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* App Identity Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg">
          HM
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t.appName}</h2>
          <p className="text-emerald-300 font-semibold text-sm sm:text-base mt-1">
            "{t.tagline}"
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800/80 text-emerald-200 border border-emerald-700/50">
            {t.appVersion}
          </span>
        </div>
      </div>

      {/* Developer & Creator Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.createdBy}</h3>
            <p className="text-xs text-slate-500">Sole Developer & Architect</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-400 text-xs block">Developer Name:</span>
              <span className="font-bold text-slate-900 text-sm">{settings.developerName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Developer Email:</span>
              {/* Email displayed clearly as text and clickable */}
              <a
                href={`mailto:${settings.developerEmail}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenEmail();
                }}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 cursor-pointer text-sm"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>{settings.developerEmail}</span>
              </a>
            </div>
          </div>

          <button
            onClick={handleOpenEmail}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Mail className="w-4 h-4" />
            <span>{t.emailDeveloper}</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-800">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">{t.privacyTitle}</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t.privacyDesc}
        </p>

        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
          <span className="font-bold block">Important Data Safety Note:</span>
          <p>
            Because this application works 100% offline without uploading your records to any
            cloud servers, your data is stored directly in your phone storage. If you change your
            phone or uninstall the app, data could be lost unless you download a backup file using the{' '}
            <strong>Backup &amp; Restore</strong> screen.
          </p>
        </div>
      </div>

      {/* Core Features List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">{t.featuresList}</h3>
        <div className="grid grid-cols-1 gap-3">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-700 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Acknowledgement */}
      <div className="text-center text-xs text-slate-400 py-4 flex items-center justify-center gap-1">
        <span>Crafted with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>for Indian small business owners and farmers by Rohan Nakshine</span>
      </div>
    </div>
  );
};
