/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, Bill, Customer } from './types';
import { storage } from './services/storage';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { SalonModule } from './components/SalonModule';
import { AgricultureModule } from './components/AgricultureModule';
import { UdhaarLedger } from './components/UdhaarLedger';
import { ReportsModule } from './components/ReportsModule';
import { AndroidProjectExport } from './components/AndroidProjectExport';
import { BackupRestore } from './components/BackupRestore';
import { SettingsScreen } from './components/SettingsScreen';
import { AboutScreen } from './components/AboutScreen';
import { InvoiceModal } from './components/InvoiceModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { FloatingActionButton } from './components/FloatingActionButton';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentLang, setCurrentLang] = useState<Language>(storage.getLanguage());
  const [selectedInvoiceBill, setSelectedInvoiceBill] = useState<Bill | null>(null);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [, setForceUpdate] = useState(0);

  // Subscribe to reactive storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setForceUpdate((prev) => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  const handleLanguageChange = (lang: Language) => {
    storage.setLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenAndroidExport={() => setCurrentTab('android')}
      />

      {/* Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentLang={currentLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            currentLang={currentLang}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenNewBill={() => setCurrentTab('salon')}
            onOpenRecordPayment={() => setCurrentTab('udhaar')}
            onOpenAddExpense={() => setCurrentTab('salon')}
            onOpenNewCropSale={() => setCurrentTab('agriculture')}
          />
        )}

        {currentTab === 'salon' && (
          <SalonModule
            currentLang={currentLang}
            onViewInvoice={(bill) => setSelectedInvoiceBill(bill)}
          />
        )}

        {currentTab === 'agriculture' && (
          <AgricultureModule currentLang={currentLang} />
        )}

        {currentTab === 'udhaar' && (
          <UdhaarLedger currentLang={currentLang} />
        )}

        {currentTab === 'reports' && (
          <ReportsModule currentLang={currentLang} />
        )}

        {currentTab === 'android' && (
          <AndroidProjectExport currentLang={currentLang} />
        )}

        {currentTab === 'backup' && (
          <BackupRestore currentLang={currentLang} />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
          />
        )}

        {currentTab === 'about' && (
          <AboutScreen currentLang={currentLang} />
        )}
      </main>

      {/* Invoice Modal Preview */}
      {selectedInvoiceBill && (
        <InvoiceModal
          bill={selectedInvoiceBill}
          currentLang={currentLang}
          onClose={() => setSelectedInvoiceBill(null)}
        />
      )}

      {/* Unit Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />
      {/* Floating Action Button (FAB) - Available regardless of current tab */}
      <FloatingActionButton
        currentLang={currentLang}
        onOpenNewBill={() => setCurrentTab('salon')}
      />
    </div>
  );
}
