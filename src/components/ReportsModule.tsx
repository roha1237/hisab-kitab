import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Mail,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { BusinessType, Language } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface ReportsModuleProps {
  currentLang: Language;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [businessFilter, setBusinessFilter] = useState<BusinessType>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const bills = storage.getBills();
  const expenses = storage.getExpenses();
  const udhaarPayments = storage.getUdhaarPayments();
  const cropSales = storage.getCropSales();
  const settings = storage.getData().settings;

  // Date filtering logic
  const now = new Date();
  let filterStartDate: Date;

  if (timeFilter === 'today') {
    filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (timeFilter === 'week') {
    filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeFilter === 'month') {
    filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    filterStartDate = customStart ? new Date(customStart) : new Date(0);
  }

  const filterEndDate =
    timeFilter === 'custom' && customEnd
      ? new Date(new Date(customEnd).getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Filtered data items
  const filteredBills = bills.filter((b) => {
    if (businessFilter === 'agriculture') return false;
    const d = new Date(b.date);
    return d >= filterStartDate && d <= filterEndDate;
  });

  const filteredUdhaarPayments = udhaarPayments.filter((p) => {
    if (businessFilter === 'agriculture') return false;
    if (p.isReversal) return false;
    const d = new Date(p.date);
    return d >= filterStartDate && d <= filterEndDate;
  });

  const filteredCropSales = cropSales.filter((s) => {
    if (businessFilter === 'salon') return false;
    const d = new Date(s.date);
    return d >= filterStartDate && d <= filterEndDate;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (businessFilter !== 'all' && e.businessType !== businessFilter) return false;
    const d = new Date(e.date);
    return d >= filterStartDate && d <= filterEndDate;
  });

  // Calculations (strict no double counting)
  // 1. Total Invoiced/Sales value
  const totalSalonBilled = filteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalAgriSales = filteredCropSales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
  const totalBusinessVolume = totalSalonBilled + totalAgriSales;

  // 2. Actual Cash Collected (Excludes unpaid bills!)
  const salonBillPaid = filteredBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const salonUdhaarCollected = filteredUdhaarPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const agriCashReceived = filteredCropSales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
  const totalCashCollected = salonBillPaid + salonUdhaarCollected + agriCashReceived;

  // 3. Expenses
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // 4. Net Profit
  // Net Recorded Profit = Total Revenue (Billed + Sales) - Total Expenses
  const netRecordedProfit = totalBusinessVolume - totalExpensesAmount;

  // 5. Outstanding Receivables
  const pendingSalonBills = filteredBills.reduce((sum, b) => sum + (b.outstandingBalance || 0), 0);
  const pendingMandiSales = filteredCropSales.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  const totalOutstandingPeriod = pendingSalonBills + pendingMandiSales;

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['Type', 'Identifier/Customer', 'Date', 'Amount (₹)', 'Status/Category', 'Business'];
    const rows: string[][] = [];

    filteredBills.forEach((b) => {
      rows.push([
        'Salon Bill',
        `"${b.customerName} (${b.billNumber})"`,
        b.date.slice(0, 10),
        String(b.totalAmount),
        b.paymentStatus,
        'Salon',
      ]);
    });

    filteredCropSales.forEach((s) => {
      rows.push([
        'Crop Sale',
        `"${s.cropName} - ${s.buyerName}"`,
        s.date.slice(0, 10),
        String(s.totalSaleAmount),
        `Recv: ${s.amountReceived}, Pend: ${s.outstandingBalance}`,
        'Agriculture',
      ]);
    });

    filteredExpenses.forEach((e) => {
      rows.push([
        'Expense',
        `"${e.title}"`,
        e.date.slice(0, 10),
        `-${e.amount}`,
        e.category,
        e.businessType,
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hisab_Master_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gmail / Email Report Trigger
  const handleEmailReport = () => {
    const subject = encodeURIComponent(`Hisab Master Financial Report - ${new Date().toLocaleDateString()}`);
    const body = encodeURIComponent(
`Hisab Master by Rohan (Har Hisab Ka Bharosa!)
Financial Summary Report
Date: ${new Date().toLocaleDateString()}
Filter: ${timeFilter.toUpperCase()} | Business: ${businessFilter.toUpperCase()}

========================================
EXECUTIVE SUMMARY:
- Total Business Volume (Billed): ₹${totalBusinessVolume.toLocaleString('en-IN')}
- Actual Cash Collected: ₹${totalCashCollected.toLocaleString('en-IN')}
- Total Recorded Expenses: ₹${totalExpensesAmount.toLocaleString('en-IN')}
- Recorded Net Profit: ₹${netRecordedProfit.toLocaleString('en-IN')}
- Outstanding Receivables: ₹${totalOutstandingPeriod.toLocaleString('en-IN')}

========================================
BREAKDOWN:
Salon Bills: ${filteredBills.length}
Crop Sales: ${filteredCropSales.length}
Recorded Expenses: ${filteredExpenses.length}

Generated by Hisab Master by Rohan
Developer: Rohan Nakshine (rohannakshine7@gmail.com)
`
    );

    window.open(`mailto:${settings.developerEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">{t.reportsTitle}</h2>
          </div>

          {/* Business Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setBusinessFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                businessFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setBusinessFilter('salon')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                businessFilter === 'salon'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterSalon}
            </button>
            <button
              onClick={() => setBusinessFilter('agriculture')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                businessFilter === 'agriculture'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAgri}
            </button>
          </div>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.filterToday}
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeFilter === 'week'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.filterWeek}
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.filterMonth}
            </button>
            <button
              onClick={() => setTimeFilter('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeFilter === 'custom'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.filterCustom}
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.exportCsv}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.printReport}</span>
            </button>

            <button
              onClick={handleEmailReport}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.emailReport}</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {timeFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>{t.startDate}:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 bg-white"
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>{t.endDate}:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Billed / Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Invoiced / Sales</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            ₹{totalBusinessVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Salon + Agri turnover</span>
        </div>

        {/* Cash Collected (Excludes Unpaid) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 block">{t.cashCollected}</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
            ₹{totalCashCollected.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Directly in hand / bank</span>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 block">Recorded Expenses</span>
          <span className="text-xl sm:text-2xl font-black text-rose-700 mt-1 block">
            ₹{totalExpensesAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-rose-500 mt-1 block">
            {filteredExpenses.length} expense entries
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">{t.netProfit}</span>
          <span
            className={`text-xl sm:text-2xl font-black mt-1 block ${
              netRecordedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            ₹{netRecordedProfit.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Turnover minus expenses</span>
        </div>
      </div>

      {/* Note on Separation */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>{t.separateBusinessNote}</span>
      </div>

      {/* Detailed Transaction Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Accounting Ledger Entries ({filteredBills.length + filteredCropSales.length + filteredExpenses.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Inflow / Outflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(b.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-800">Salon</td>
                  <td className="py-3 px-4 text-slate-800">
                    Bill #{b.billNumber} - {b.customerName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Bill ({b.paymentStatus})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700">
                    +₹{b.amountPaid} <span className="text-[11px] text-slate-400 font-normal">/ ₹{b.totalAmount}</span>
                  </td>
                </tr>
              ))}

              {filteredCropSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(s.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-800">Agriculture</td>
                  <td className="py-3 px-4 text-slate-800">
                    Sale: {s.cropName} to {s.buyerName} ({s.quantity} {s.unit})
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      Crop Sale
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700">
                    +₹{s.amountReceived} <span className="text-[11px] text-slate-400 font-normal">/ ₹{s.totalSaleAmount}</span>
                  </td>
                </tr>
              ))}

              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold capitalize text-slate-700">
                    {e.businessType}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {e.title} ({e.category})
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                      Expense
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-rose-600">
                    -₹{e.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
