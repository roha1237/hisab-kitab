import React, { useRef } from 'react';
import {
  Printer,
  Share2,
  Download,
  X,
  CheckCircle,
  Scissors,
  Phone,
  Calendar,
  MessageSquare,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Bill, Language } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface InvoiceModalProps {
  bill: Bill;
  currentLang: Language;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  bill,
  currentLang,
  onClose,
}) => {
  const t = translations[currentLang];
  const settings = storage.getData().settings;
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Formatted WhatsApp message exactly as requested
  const generateWhatsAppMessage = () => {
    return (
`Namaste ${bill.customerName} ji! 😊

Thank you for visiting our salon.

Your bill amount is ₹${bill.totalAmount}.
Amount paid: ₹${bill.amountPaid}.
Pending balance: ₹${bill.outstandingBalance}.

${bill.outstandingBalance > 0 ? 'Jab aapko suvidha ho, kripya pending payment jama karein.\n' : ''}Aapke bharose aur support ke liye dhanyavaad! 🙏

We look forward to serving you again.
- Hisab Master by Rohan`
    );
  };

  const handleWhatsAppShare = () => {
    const message = generateWhatsAppMessage();
    const cleanPhone = (bill.customerPhone || '').replace(/[^0-9]/g, '');

    if (cleanPhone.length >= 10) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      // If phone is missing or invalid, open fallback share or copy
      if (navigator.share) {
        navigator
          .share({
            title: `Invoice ${bill.billNumber}`,
            text: message,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(message);
        alert(
          'Phone number is missing or invalid. Bill message copied to clipboard! You can paste it into any chat.'
        );
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    alert('Bill message copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Top Action Bar (Non-printable) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md">
              {bill.billNumber}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {t.viewInvoice}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Share prefilled message on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.whatsappShare}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.printOrSavePdf}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          ref={invoiceRef}
          className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white"
          id="printable-invoice"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.salonName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {settings.salonAddress} • Ph: {settings.salonPhone}
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  Powered by Hisab Master by Rohan (Har Hisab Ka Bharosa!)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 uppercase tracking-wider">
                INVOICE / RECEIPT
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                #{bill.billNumber}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(bill.date).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Customer Meta */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Billed To:</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {bill.customerName}
              </span>
              <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                {bill.customerPhone || 'Mobile not recorded'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-medium block">Payment Status:</span>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-black text-xs ${
                  bill.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : bill.paymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {bill.paymentStatus.toUpperCase()} ({bill.paymentMethod.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Services Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Service Details</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.serviceName}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{item.unitPrice}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{item.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Balances Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
            <div className="text-xs text-slate-500 max-w-sm space-y-1">
              <p className="font-semibold text-slate-700">Thank-you Note:</p>
              <p className="italic bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-amber-900">
                "{bill.thankYouMessage || settings.thankYouNote}"
              </p>
              {settings.salonUpiId && (
                <p className="text-[11px] text-slate-500 pt-1">
                  Pay via UPI:{' '}
                  <span className="font-mono font-bold text-slate-800">
                    {settings.salonUpiId}
                  </span>
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Grand Total:</span>
                <span className="font-black text-slate-900">
                  ₹{bill.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-black text-emerald-700">
                  ₹{bill.amountPaid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-base font-black border-t-2 border-slate-900">
                <span className="text-slate-800">Outstanding Balance:</span>
                <span
                  className={
                    bill.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }
                >
                  ₹{bill.outstandingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Hisab Master by Rohan Nakshine • Har Hisab Ka Bharosa! • Contact:{' '}
            {settings.developerEmail}
          </div>
        </div>

        {/* WhatsApp Message Preview & Copy (Non-printable) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 text-slate-600">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Customer WhatsApp message ready with dynamic bill data</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMessage}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
