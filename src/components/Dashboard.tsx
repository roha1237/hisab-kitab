import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Wallet,
  Scissors,
  Sprout,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
  DollarSign,
  Filter,
} from 'lucide-react';
import { Language, BusinessType } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';
import { NavTab } from './Navigation';
import { PWAInstallButton } from './PWAInstallButton';

interface DashboardProps {
  currentLang: Language;
  onNavigate: (tab: NavTab) => void;
  onOpenNewBill: () => void;
  onOpenRecordPayment: () => void;
  onOpenAddExpense: () => void;
  onOpenNewCropSale: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentLang,
  onNavigate,
  onOpenNewBill,
  onOpenRecordPayment,
  onOpenAddExpense,
  onOpenNewCropSale,
}) => {
  const t = translations[currentLang];
  const [businessFilter, setBusinessFilter] = useState<BusinessType>('all');

  const stats = storage.getDashboardStats();
  const bills = storage.getBills();
  const cropSales = storage.getCropSales();
  const expenses = storage.getExpenses();
  const udhaarPayments = storage.getUdhaarPayments();

  // Filtered stats according to selected business filter
  let displayTodayIncome = stats.todayIncome;
  let displayTodayExpense = stats.todayExpenses;
  let displayMonthIncome = stats.monthlyIncome;
  let displayMonthExpense = stats.monthlyExpenses;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);

  if (businessFilter === 'salon') {
    const salonBillsToday = bills
      .filter((b) => b.date.startsWith(todayStr))
      .reduce((s, b) => s + (b.amountPaid || 0), 0);
    const salonUdhaarToday = udhaarPayments
      .filter((p) => !p.isReversal && p.date.startsWith(todayStr))
      .reduce((s, p) => s + (p.amount || 0), 0);
    displayTodayIncome = salonBillsToday + salonUdhaarToday;

    displayTodayExpense = expenses
      .filter((e) => e.businessType === 'salon' && e.date.startsWith(todayStr))
      .reduce((s, e) => s + (e.amount || 0), 0);

    const salonBillsMonth = bills
      .filter((b) => b.date.startsWith(monthStr))
      .reduce((s, b) => s + (b.amountPaid || 0), 0);
    const salonUdhaarMonth = udhaarPayments
      .filter((p) => !p.isReversal && p.date.startsWith(monthStr))
      .reduce((s, p) => s + (p.amount || 0), 0);
    displayMonthIncome = salonBillsMonth + salonUdhaarMonth;

    displayMonthExpense = expenses
      .filter((e) => e.businessType === 'salon' && e.date.startsWith(monthStr))
      .reduce((s, e) => s + (e.amount || 0), 0);
  } else if (businessFilter === 'agriculture') {
    displayTodayIncome = cropSales
      .filter((s) => s.date.startsWith(todayStr))
      .reduce((s, c) => s + (c.amountReceived || 0), 0);

    displayTodayExpense = expenses
      .filter((e) => e.businessType === 'agriculture' && e.date.startsWith(todayStr))
      .reduce((s, e) => s + (e.amount || 0), 0);

    displayMonthIncome = cropSales
      .filter((s) => s.date.startsWith(monthStr))
      .reduce((s, c) => s + (c.amountReceived || 0), 0);

    displayMonthExpense = expenses
      .filter((e) => e.businessType === 'agriculture' && e.date.startsWith(monthStr))
      .reduce((s, e) => s + (e.amount || 0), 0);
  }

  // Combined recent transactions list
  const recentItems: Array<{
    id: string;
    type: 'salon_bill' | 'udhaar_pay' | 'crop_sale' | 'expense';
    business: 'salon' | 'agriculture';
    title: string;
    sub: string;
    amount: number;
    isIncome: boolean;
    date: string;
  }> = [];

  bills.slice(0, 5).forEach((b) => {
    recentItems.push({
      id: b.id,
      type: 'salon_bill',
      business: 'salon',
      title: `${b.customerName} - ${b.billNumber}`,
      sub: `${b.items.map((i) => i.serviceName).join(', ')} • ${b.paymentStatus.toUpperCase()}`,
      amount: b.amountPaid,
      isIncome: true,
      date: b.date,
    });
  });

  cropSales.slice(0, 3).forEach((cs) => {
    recentItems.push({
      id: cs.id,
      type: 'crop_sale',
      business: 'agriculture',
      title: `${cs.cropName} Sale - ${cs.buyerName}`,
      sub: `${cs.quantity} ${cs.unit} @ ₹${cs.ratePerUnit}`,
      amount: cs.amountReceived,
      isIncome: true,
      date: cs.date,
    });
  });

  expenses.slice(0, 4).forEach((exp) => {
    recentItems.push({
      id: exp.id,
      type: 'expense',
      business: exp.businessType,
      title: exp.title,
      sub: `${exp.category} • ${exp.businessType === 'salon' ? 'Salon' : 'Agri'}`,
      amount: exp.amount,
      isIncome: false,
      date: exp.date,
    });
  });

  recentItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Android PWA Install Banner */}
      <PWAInstallButton
        currentLang={currentLang}
        onOpenAndroidExport={() => onNavigate('android')}
        variant="dashboard"
      />

      {/* Business Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span className="text-xs sm:text-sm font-semibold text-slate-700">{t.businessFilter}:</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setBusinessFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              businessFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setBusinessFilter('salon')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
              businessFilter === 'salon'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            {t.filterSalon}
          </button>
          <button
            onClick={() => setBusinessFilter('agriculture')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
              businessFilter === 'agriculture'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            {t.filterAgri}
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Income */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-4 sm:p-5 rounded-2xl border border-emerald-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">{t.todayIncome}</span>
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{displayTodayIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> {todayStr}
          </p>
        </div>

        {/* Today's Expenses */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white p-4 sm:p-5 rounded-2xl border border-rose-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">{t.todayExpenses}</span>
            <div className="p-2 bg-rose-100 rounded-xl text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{displayTodayExpense.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">Daily Outflow</p>
        </div>

        {/* Outstanding Udhaar */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 sm:p-5 rounded-2xl border border-amber-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">{t.totalUdhaar}</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-amber-900">
              ₹{stats.totalOutstandingUdhaar.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700 font-medium">Pending from customers & buyers</p>
        </div>

        {/* Current Month Net Profit / Recorded Net */}
        <div className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-white p-4 sm:p-5 rounded-2xl border border-teal-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-teal-800">{t.monthlyIncome}</span>
            <div className="p-2 bg-teal-100 rounded-xl text-teal-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{displayMonthIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-teal-700 font-medium">
            Month Expenses: ₹{displayMonthExpense.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <button
            onClick={onOpenNewBill}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-xs sm:text-sm transition cursor-pointer text-center"
          >
            <Scissors className="w-4 h-4 text-amber-600" />
            <span>{t.newSalonBill}</span>
          </button>

          <button
            onClick={onOpenRecordPayment}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold text-xs sm:text-sm transition cursor-pointer text-center"
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>{t.recordPayment}</span>
          </button>

          <button
            onClick={onOpenNewCropSale}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold text-xs sm:text-sm transition cursor-pointer text-center"
          >
            <Sprout className="w-4 h-4 text-teal-700" />
            <span>{t.newCropSale}</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-semibold text-xs sm:text-sm transition cursor-pointer text-center"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Salon Module Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.salonTitle}</h3>
                  <p className="text-xs text-slate-500">Haircut, Shaving, Billing & Expenses</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                {bills.length} Bills
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Total Revenue</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{stats.salonTotalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Active Customers</span>
                <span className="text-sm font-bold text-slate-900">{storage.getCustomers().length}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Custom pricing & WhatsApp invoices</span>
            <button
              onClick={() => onNavigate('salon')}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Open Salon <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Agriculture Module Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.agriTitle}</h3>
                  <p className="text-xs text-slate-500">Farms, Crops, Kharif/Rabi, Mandi Sales</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {storage.getFarms().length} Farms
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Crop Sales</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{stats.agriTotalSales.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Recorded Net Profit</span>
                <span className="text-sm font-bold text-emerald-700">
                  ₹{storage.getAgriFinancials().recordedProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Seeds, Fertilizers, Labour & Mandi</span>
            <button
              onClick={() => onNavigate('agriculture')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Open Agriculture <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            {t.recentTransactions}
          </h3>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            {t.viewDetails} →
          </button>
        </div>

        {recentItems.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">{t.noTransactionsYet}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentItems.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      item.business === 'salon'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.business === 'salon' ? (
                      <Scissors className="w-4 h-4" />
                    ) : (
                      <Sprout className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      item.isIncome ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {item.isIncome ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
