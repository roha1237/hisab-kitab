import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface BackupRestoreProps {
  currentLang: Language;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleExport = () => {
    try {
      const json = storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `Hisab_Master_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `${t.backupSuccess} (File saved to your downloads / storage)`,
      });
    } catch (e) {
      setStatusMessage({
        type: 'error',
        text: 'Error exporting backup: ' + (e as Error).message,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setStatusMessage({ type: 'error', text: 'Empty backup file.' });
        return;
      }

      const confirmed = window.confirm(
        'Warning: Restoring from this file will overwrite existing records with the backup. Do you want to proceed?'
      );

      if (!confirmed) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const result = storage.importBackup(content);
      if (result.success) {
        setStatusMessage({ type: 'success', text: t.restoreSuccess });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (
      window.confirm(
        'Load demonstration data for Hisab Master by Rohan (sample customers, bills, crops, and expenses)?'
      )
    ) {
      storage.resetToSample();
      setStatusMessage({
        type: 'success',
        text: 'Sample data restored successfully!',
      });
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'ARE YOU SURE? This will erase all local transactions and customers. Make sure to download a backup first!'
      )
    ) {
      storage.clearAll();
      setStatusMessage({
        type: 'success',
        text: 'All records cleared. Fresh new database created.',
      });
    }
  };

  const data = storage.getData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.backupTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.backupDesc}</p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Database Inventory Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block">Customers</span>
            <span className="text-base font-black text-slate-900">
              {data.customers.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block">Bills Saved</span>
            <span className="text-base font-black text-slate-900">
              {data.bills.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block">Expenses Logged</span>
            <span className="text-base font-black text-slate-900">
              {data.expenses.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block">Farms & Crops</span>
            <span className="text-base font-black text-slate-900">
              {data.farms.length} / {data.crops.length}
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Restore Action Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>Export Database</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Exports your complete salon transactions, customer balances, agriculture crops,
              expenses, and settings as a standard versioned JSON file.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{t.createBackup}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Upload className="w-4 h-4" />
              <span>Restore Database</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Select a previously downloaded backup JSON file to restore all your business data.
              Validates schema integrity before applying changes.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{t.restoreBackup}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demonstration & Reset Actions */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-slate-900 block">Demonstration & Maintenance:</span>
          <span className="text-slate-500">
            Reset to sample data for testing, or clear all records for a brand new shop setup.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleResetSample}
            className="flex-1 sm:flex-initial px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetSampleData}</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearAllData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
