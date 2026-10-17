import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface PWAInstallButtonProps {
  currentLang: Language;
  onOpenAndroidExport?: () => void;
  variant?: 'header' | 'banner' | 'dashboard';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  currentLang,
  onOpenAndroidExport,
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install, deferredPrompt } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const t = translations[currentLang];

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const outcome = await install();
      if (!outcome) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  // If already running as an installed standalone app, show small active badge or nothing
  if (isInstalled && variant === 'header') {
    return (
      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-800/90 text-emerald-200 border border-emerald-600/40">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
        <span>App Installed</span>
      </span>
    );
  }

  return (
    <>
      {/* Header Button Variant */}
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-bold transition cursor-pointer shadow-md active:scale-95 animate-pulse hover:animate-none"
          title="Install as Android App on your phone"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-950" />
          <span>Install App</span>
        </button>
      )}

      {/* Dashboard Top Banner Variant */}
      {variant === 'dashboard' && !isInstalled && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-700/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              HM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {currentLang === 'hi'
                    ? 'अपने एंड्रॉइड फोन में ऐप इंस्टॉल करें'
                    : currentLang === 'mr'
                    ? 'आपल्या अँड्रॉइड फोनवर अॅप इन्स्टॉल करा'
                    : 'Install as Android App on your Phone'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-400 text-slate-950">
                  APK / PWA
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {currentLang === 'hi'
                  ? 'होम स्क्रीन पर जोड़ें, बिना इंटरनेट पूरा ऑफलाइन चलाएं!'
                  : currentLang === 'mr'
                  ? 'होम स्क्रीनवर जोडा, विना इंटरनेट पूर्ण ऑफलाइन चालवा!'
                  : 'Add to home screen, works 100% offline like a native APK!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleInstallClick}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {currentLang === 'hi'
                  ? 'अभी इंस्टॉल करें'
                  : currentLang === 'mr'
                  ? 'आत्ताच इन्स्टॉल करा'
                  : 'Install Now'}
              </span>
            </button>
            {onOpenAndroidExport && (
              <button
                onClick={onOpenAndroidExport}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer"
              >
                APK Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* Installation Instruction Modal for Android & iOS */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentLang === 'hi'
                      ? 'एंड्रॉइड फोन में कैसे इंस्टॉल करें?'
                      : currentLang === 'mr'
                      ? 'अँड्रॉइड फोनवर कसे इन्स्टॉल करावे?'
                      : 'How to Install on Android Phone'}
                  </h3>
                  <p className="text-xs text-slate-500">Hisab Master by Rohan (v1.0.0)</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Methods */}
            <div className="space-y-3 text-xs sm:text-sm">
              {/* Method 1: Chrome Add to Home Screen (Instant APK) */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>
                    {currentLang === 'hi'
                      ? 'तरीका 1: क्रोम ब्राउज़र से तुरंत इंस्टॉल (सबसे आसान)'
                      : currentLang === 'mr'
                      ? 'पद्धत 1: Chrome ब्राउझरवरून थेट इन्स्टॉल (सर्वात सोपे)'
                      : 'Method 1: Direct 1-Tap Browser Install (Recommended)'}
                  </span>
                </span>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {currentLang === 'hi'
                    ? '1. अपने फोन के Chrome ब्राउज़र के ऊपर कोने में 3 डॉट्स (⋮) पर क्लिक करें।\n2. "Install app" (ऐप इंस्टॉल करें) या "Add to Home screen" चुनें।\n3. फोन की होम स्क्रीन पर Hisab Master का असली ऐप आइकन बन जाएगा!'
                    : currentLang === 'mr'
                    ? '1. आपल्या फोनच्या Chrome ब्राउझरमध्ये उजव्या कोपऱ्यात 3 डॉट्स (⋮) वर टॅप करा.\n2. "Install app" किंवा "Add to Home screen" (होम स्क्रीनवर जोडा) निवडा.\n3. फोनच्या स्क्रीनवर Hisab Master चे स्वतंत्र अॅप तयार होईल!'
                    : '1. In Chrome on your phone, tap the three dots (⋮) in the top-right corner.\n2. Tap "Install app" or "Add to Home screen".\n3. The app will be installed with full offline capability and its own home screen icon!'}
                </p>
              </div>

              {/* Method 2: Native Android Studio APK */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>
                    {currentLang === 'hi'
                      ? 'तरीका 2: नेटिव्ह एंड्रॉइड स्टूडियो APK (.apk)'
                      : currentLang === 'mr'
                      ? 'पद्धत 2: नेटिव्ह अँड्रॉइड स्टुडिओ APK (.apk)'
                      : 'Method 2: Native Android Studio APK (.apk)'}
                  </span>
                </span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {currentLang === 'hi'
                    ? 'हमने संपूर्ण Kotlin + Jetpack Compose + Room Database प्रोजेक्ट कोड तैयार किया है। "Android APK Code" टैब से प्रोजेक्ट ZIP डाउनलोड करके Android Studio में `./gradlew assembleDebug` चलाकर असली APK बना सकते हैं।'
                    : currentLang === 'mr'
                    ? 'आम्ही पूर्ण Kotlin + Jetpack Compose + Room Database कोड तयार केला आहे. "Android APK Code" टॅबमधून संपूर्ण प्रोजेक्ट ZIP डाउनलोड करा आणि APK तयार करा.'
                    : 'We provided the complete native Kotlin, Jetpack Compose, Material 3, and Room DB project code. Download the project ZIP from the "Android APK" tab to compile with `./gradlew assembleDebug`.'}
                </p>
                {onOpenAndroidExport && (
                  <button
                    onClick={() => {
                      setShowInstallGuide(false);
                      onOpenAndroidExport();
                    }}
                    className="mt-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-800"
                  >
                    Open Android APK Section →
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
