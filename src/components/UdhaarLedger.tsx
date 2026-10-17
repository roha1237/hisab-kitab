import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Wallet,
  ArrowDownLeft,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Phone,
  Calendar,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { Customer, Language, PaymentMethod, UdhaarPayment } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface UdhaarLedgerProps {
  currentLang: Language;
  onOpenPaymentModalWithCustomer?: (customer: Customer) => void;
}

export const UdhaarLedger: React.FC<UdhaarLedgerProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'pending' | 'cleared' | 'all'>('pending');

  // Collect Payment Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNote, setPayNote] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<UdhaarPayment | null>(null);

  // Reversal / Correction Modal State
  const [paymentToReverse, setPaymentToReverse] = useState<UdhaarPayment | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const customers = storage.getCustomers();
  const allPayments = storage.getUdhaarPayments();

  // Aggregate customers with calculations
  const customerListWithFin = customers.map((c) => {
    const fin = storage.getCustomerFinancials(c.id);
    return {
      customer: c,
      ...fin,
    };
  });

  // Filter
  const filteredList = customerListWithFin.filter((item) => {
    const matchesSearch =
      item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filterType === 'pending') return item.outstandingBalance > 0;
    if (filterType === 'cleared') return item.outstandingBalance === 0;
    return true;
  });

  const totalOutstandingReceivables = customerListWithFin.reduce(
    (sum, item) => sum + item.outstandingBalance,
    0
  );

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || payAmount === '' || Number(payAmount) <= 0) return;
    if (isSubmittingPay) return; // Prevent double tap!

    setIsSubmittingPay(true);

    const payment = storage.recordUdhaarPayment(
      selectedCustomer.id,
      selectedCustomer.name,
      Number(payAmount),
      payMethod,
      payNote
    );

    setPaymentReceipt(payment);
    setIsSubmittingPay(false);
    setPayAmount('');
    setPayNote('');
  };

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentToReverse || !reversalReason.trim()) return;

    storage.reverseUdhaarPayment(paymentToReverse.id, reversalReason.trim());
    setPaymentToReverse(null);
    setReversalReason('');
  };

  const generateWhatsAppReminder = (item: (typeof customerListWithFin)[0]) => {
    const message = `Namaste ${item.customer.name} ji! 😊\n\nHisab Master by Rohan se namaskar.\n\nAapke salon hisab ki kul pending baki rashi ₹${item.outstandingBalance} hai.\n(Kul bill: ₹${item.totalBilled}, Jama: ₹${item.totalPaid}).\n\nKripya jab suvidha ho, jama karein.\nAapke bharose ke liye dhanyavaad! 🙏\n- Hisab Master by Rohan`;

    const cleanPhone = item.customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      if (navigator.share) {
        navigator.share({ title: 'Payment Reminder', text: message }).catch(() => {});
      } else {
        navigator.clipboard.writeText(message);
        alert('Reminder message copied to clipboard!');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Receivables Summary Card */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
            {t.totalReceivables}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            ₹{totalOutstandingReceivables.toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-amber-200 mt-1">
            Across {customerListWithFin.filter((i) => i.outstandingBalance > 0).length} customers with pending balance
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/15">
          <BookOpen className="w-8 h-8 text-amber-200" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={t.searchUdhaar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.pendingCustomers}
          </button>
          <button
            onClick={() => setFilterType('cleared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'cleared'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.clearedCustomers}
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.allCustomers}
          </button>
        </div>
      </div>

      {/* Customer Udhaar Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.customer.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.customer.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {item.customer.phone || 'No mobile'}
                  </p>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    item.outstandingBalance > 0
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.outstandingBalance > 0
                    ? `Due: ₹${item.outstandingBalance.toLocaleString('en-IN')}`
                    : 'All Paid'}
                </span>
              </div>

              {/* Financial Box */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.totalBilled}</span>
                  <span className="font-bold text-slate-800">₹{item.totalBilled}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.totalPaid}</span>
                  <span className="font-bold text-emerald-700">₹{item.totalPaid}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.balanceDue}</span>
                  <span
                    className={`font-black ${
                      item.outstandingBalance > 0 ? 'text-amber-800' : 'text-slate-400'
                    }`}
                  >
                    ₹{item.outstandingBalance}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCustomer(item.customer);
                  setPayAmount(item.outstandingBalance > 0 ? item.outstandingBalance : '');
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{t.collectPayment}</span>
              </button>

              {item.outstandingBalance > 0 && (
                <button
                  onClick={() => generateWhatsAppReminder(item)}
                  title="Send WhatsApp payment reminder"
                  className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reminder</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment History & Reversal Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          {t.historyOfPayments} ({allPayments.length})
        </h3>

        {allPayments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No udhaar collections recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {allPayments.map((pay) => (
              <div
                key={pay.id}
                className={`py-3 flex items-center justify-between text-xs ${
                  pay.isReversal ? 'opacity-50 line-through' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{pay.customerName}</span>
                    {pay.isReversal && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full not-italic no-underline">
                        Reversed: {pay.reversalReason}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(pay.date).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • Mode: {pay.paymentMethod.toUpperCase()} {pay.note ? `• ${pay.note}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-emerald-700 text-sm">
                    +₹{pay.amount.toLocaleString('en-IN')}
                  </span>
                  {!pay.isReversal && (
                    <button
                      onClick={() => setPaymentToReverse(pay)}
                      title="Safely reverse or correct this payment"
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.reversePayment}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collect Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.collectPayment}
                </h3>
                <p className="text-xs text-slate-500">{selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setPaymentReceipt(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentReceipt ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">
                    ₹{paymentReceipt.amount.toLocaleString('en-IN')} Collected
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">{t.paymentSuccess}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold">{paymentReceipt.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">New Outstanding:</span>
                    <span className="font-bold text-amber-800">
                      ₹{storage.getCustomerFinancials(selectedCustomer.id).outstandingBalance}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setPaymentReceipt(null);
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.enterPaymentAmount} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    autoFocus
                    placeholder="e.g. 100"
                    value={payAmount}
                    onChange={(e) =>
                      setPayAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full text-base font-bold border border-slate-300 rounded-xl px-3 py-2 bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.paymentMethod}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'upi', 'other'] as PaymentMethod[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPayMethod(mode)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border cursor-pointer capitalize ${
                          payMethod === mode
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mode === 'cash' ? t.cash : mode === 'upi' ? t.upi : t.other}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.paymentNote}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared pending for haircut & shave"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
                  >
                    {t.confirm}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Safe Reversal Modal (Never delete silently!) */}
      {paymentToReverse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>{t.reversePayment}</span>
            </div>

            <p className="text-xs text-slate-600">
              You are correcting payment of{' '}
              <strong className="text-slate-900">
                ₹{paymentToReverse.amount}
              </strong>{' '}
              for <strong>{paymentToReverse.customerName}</strong>. This record will not be
              silently erased; it will be archived as reversed with your explanation.
            </p>

            <form onSubmit={handleConfirmReversal} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.reversalReason} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wrong amount entered / payment bounced"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentToReverse(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                >
                  {t.confirmReversal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
