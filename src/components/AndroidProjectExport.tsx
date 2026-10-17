import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
  Terminal,
  Play,
  Cpu,
  BookOpen,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  downloadAndroidProjectZip,
  getAndroidProjectFiles,
  AndroidFile,
} from '../services/androidProjectGenerator';

interface AndroidProjectExportProps {
  currentLang: Language;
}

export const AndroidProjectExport: React.FC<AndroidProjectExportProps> = ({
  currentLang,
}) => {
  const t = translations[currentLang];
  const files = getAndroidProjectFiles();
  const [selectedFileIndex, setSelectedFileIndex] = useState(3); // Default to Entities.kt
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeFile = files[selectedFileIndex] || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'HisabMaster_Android_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error creating zip: ' + (e as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-400 text-slate-950">
              Native Android Studio Project
            </span>
            <span className="text-xs text-emerald-300 font-mono">
              Kotlin 2.0 • Compose • Room 2.6 • MVVM
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            {t.androidTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Complete production-ready Android codebase optimized for devices with 4 GB RAM.
            Includes Room offline database, Jetpack Compose Material 3 UI, PDF engine, WhatsApp
            deep links, and passing JUnit tests.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-sm transition cursor-pointer shadow-lg flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Generating ZIP...' : t.downloadProjectZip}</span>
        </button>
      </div>

      {/* 3 Practical Ways to Install as Android App */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentLang === 'hi'
                ? 'फोन पर ऐप इंस्टॉल करने के 3 आसान तरीके'
                : currentLang === 'mr'
                ? 'फोनवर अॅप इन्स्टॉल करण्याचे ३ सोपे मार्ग'
                : '3 Easy Ways to Install on Your Android Phone'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentLang === 'hi'
                ? 'बिना किसी परेशानी के तुरंत अपने फोन में इंस्टॉल करें'
                : currentLang === 'mr'
                ? 'कोणत्याही अडथळ्याशिवाय त्वरित फोनमध्ये इन्स्टॉल करा'
                : 'Choose the method that works best for your workflow'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Method 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between space-y-3">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white uppercase tracking-wider mb-2">
                Fastest (1-Tap)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Direct Phone Install (WebAPK)</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Open this app URL in Google Chrome on your Android mobile. Tap the top header <strong>"Install App"</strong> button or tap Chrome menu (⋮) → <strong>"Install app"</strong>. It installs with its own app icon and runs full-screen completely offline!
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200/60">
              <span className="text-[11px] font-semibold text-emerald-800">
                ✓ No PC required • Works on all 4GB+ Android phones
              </span>
            </div>
          </div>

          {/* Method 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-white uppercase tracking-wider mb-2">
                Pure Native Code
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Android Studio (.APK)</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Download the Project ZIP above. Extract and open in Android Studio. Run <code>./gradlew assembleDebug</code> or select <strong>Build → Build APK(s)</strong>. Transfer <code>app-debug.apk</code> to your phone and install!
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700">
                ✓ Full Kotlin 2.0 • Jetpack Compose • Room DB
              </span>
            </div>
          </div>

          {/* Method 3 */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col justify-between space-y-3">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-700 text-white uppercase tracking-wider mb-2">
                Online APK Generator
              </span>
              <h4 className="font-bold text-slate-900 text-sm">1-Click APK via PWABuilder</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Visit <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-teal-800 font-bold underline">PWABuilder.com</a>, paste your app URL, and click <strong>"Generate Android Package (.apk)"</strong>. It bundles our PWA manifest into a signed Android APK ready to sideload.
              </p>
            </div>
            <div className="pt-2 border-t border-teal-200/60">
              <span className="text-[11px] font-semibold text-teal-800">
                ✓ Generates standalone .apk in 60 seconds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main File Explorer and Code Previewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Tree (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-600" />
              Project Files ({files.length})
            </h3>
            <span className="text-[11px] text-slate-400">Android Studio</span>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {files.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-md flex flex-col overflow-hidden">
          {/* Viewer Header */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-teal-400">
                {activeFile.path}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeFile.description}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
            <pre>
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* APK Build & Installation Guide Accordion */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-700" />
          {t.apkBuildInstructions}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Download & Extract</h4>
            <p className="text-slate-600">
              Click the "Download Android Studio Project (.ZIP)" button above and unzip the project
              folder on your machine.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Open in Android Studio</h4>
            <p className="text-slate-600">
              Open Android Studio (Ladybug or Koala), click <strong>Open</strong>, select the unzipped
              folder, and let Gradle sync complete.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Run Unit Tests</h4>
            <p className="text-slate-600">
              Right-click on <code>FinancialCalculationTest.kt</code> and select <strong>Run</strong>.
              All 10 accounting test cases will pass with green checks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-2">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Build & Install APK</h4>
            <p className="text-slate-600">
              Select <strong>Build &gt; Build APK(s)</strong> or run <code>./gradlew assembleDebug</code>.
              Connect your Android phone via USB to install directly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
