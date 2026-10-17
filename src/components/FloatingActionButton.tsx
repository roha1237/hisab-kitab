import React, { useState } from 'react';
import {
  Plus,
  X,
  Scissors,
  Receipt,
  TrendingDown,
  Sprout,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { Language, Crop } from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface FloatingActionButtonProps {
  currentLang: Language;
  onOpenNewBill: () => void;
  onOpenNewExpense?: () => void;
  onOpenNewCrop?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  currentLang,
  onOpenNewBill,
}) => {
  const t = translations[currentLang];
  const [isOpen, setIsOpen] = useState(false);

  // Quick Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseBusinessType, setExpenseBusinessType] = useState<'salon' | 'agriculture'>('salon');
  const [expenseCategory, setExpenseCategory] = useState('Blades & Products');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Quick Crop Modal State
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [cropName, setCropName] = useState('');
  const [cropSeason, setCropSeason] = useState<Crop['season']>('Kharif');
  const [cropYear, setCropYear] = useState<number>(new Date().getFullYear());
  const [cropArea, setCropArea] = useState<number | ''>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const farms = storage.getFarms();

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || expenseAmount === '') return;

    storage.addExpense(
      expenseBusinessType,
      expenseCategory,
      expenseTitle.trim(),
      Number(expenseAmount),
      expenseNotes.trim() || undefined
    );

    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
    setShowExpenseModal(false);
    setIsOpen(false);

    setToastMessage(`Expense of ₹${Number(expenseAmount)} recorded successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    const farm = farms.find((f) => f.id === selectedFarmId) || farms[0];
    const farmId = farm ? farm.id : 'farm_default';
    const farmName = farm ? farm.name : 'Main Field';
    const area = cropArea === '' ? (farm ? farm.area : 2.5) : Number(cropArea);
    const unit = farm ? farm.areaUnit : 'acre';

    storage.addCrop(
      farmId,
      farmName,
      cropName.trim(),
      cropSeason,
      cropYear,
      area,
      unit
    );

    setCropName('');
    setCropArea('');
    setShowCropModal(false);
    setIsOpen(false);

    setToastMessage(`Crop "${cropName.trim()}" added successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold border border-emerald-600 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dimmed backdrop when speed-dial is expanded */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-2xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Speed Dial Actions Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none print:hidden">
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Action 1: New Salon Bill */}
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200">
                {t.newSalonBill}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenNewBill();
                }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white/50"
                title={t.newSalonBill}
              >
                <Scissors className="w-5 h-5" />
              </button>
            </div>

            {/* Action 2: New Expense */}
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200">
                {t.addExpense}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowExpenseModal(true);
                }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white/50"
                title={t.addExpense}
              >
                <TrendingDown className="w-5 h-5" />
              </button>
            </div>

            {/* Action 3: New Crop Entry */}
            <div className="flex items-center gap-2">
              <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200">
                {t.addCrop}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowCropModal(true);
                }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white/50"
                title={t.addCrop}
              >
                <Sprout className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Primary Main Floating Action Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Quick Action Menu"
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isOpen
              ? 'bg-slate-900 text-white rotate-45 ring-4 ring-slate-800/50'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white ring-4 ring-emerald-500/30'
          }`}
        >
          {isOpen ? (
            <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
          ) : (
            <Plus className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
        </button>
      </div>

      {/* QUICK EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <TrendingDown className="w-5 h-5" />
                <span>{t.addExpense}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddExpense} className="space-y-3">
              {/* Business Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Business Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseBusinessType('salon');
                      setExpenseCategory('Blades & Products');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      expenseBusinessType === 'salon'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Salon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExpenseBusinessType('agriculture');
                      setExpenseCategory('Fertilizers');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      expenseBusinessType === 'agriculture'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Agriculture</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  {expenseBusinessType === 'salon' ? (
                    <>
                      <option value="Blades & Products">Blades & Creams (ब्लेड्स व क्रीम)</option>
                      <option value="Electricity & Rent">Electricity & Rent (दुकान किराया व बिल)</option>
                      <option value="Staff Wages">Staff Wages (कारीगर मजुरी)</option>
                      <option value="Tea & Snacks">Tea & Water (चाय व नाश्ता)</option>
                      <option value="Maintenance">Shop Maintenance (दुरुस्ती)</option>
                      <option value="Miscellaneous">Other Miscellaneous (अन्य)</option>
                    </>
                  ) : (
                    <>
                      <option value="Fertilizers">Fertilizers & Urea (खते व औषधे)</option>
                      <option value="Seeds">Seeds (बियाणे / बीज)</option>
                      <option value="Pesticides">Pesticides & Spray (कीटनाशक फवारणी)</option>
                      <option value="Labour">Labour (मजुरी / मजदूरी)</option>
                      <option value="Irrigation & Diesel">Irrigation & Diesel (डिझेल व पाणी)</option>
                      <option value="Tractor Hire">Tractor & Equipment (ट्रॅक्टर भाडे)</option>
                      <option value="Miscellaneous">Other Agri Expense (इतर शेती खर्च)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Description / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    expenseBusinessType === 'salon'
                      ? 'e.g. 5 packets blades & Dettol'
                      : 'e.g. 2 bags Urea, 3 days weeding labour'
                  }
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 350"
                  value={expenseAmount}
                  onChange={(e) =>
                    setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full text-sm font-bold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional remarks"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CROP ENTRY MODAL */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>{t.addCrop}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCrop} className="space-y-3">
              {farms.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Farm / Field
                  </label>
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.area} {f.areaUnit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.cropName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soybean, Cotton, Wheat, Sugarcane"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.season}
                  </label>
                  <select
                    value={cropSeason}
                    onChange={(e) => setCropSeason(e.target.value as any)}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="Kharif">{t.kharif}</option>
                    <option value="Rabi">{t.rabi}</option>
                    <option value="Zaid">{t.zaid}</option>
                    <option value="Annual">{t.annual}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={cropYear}
                    onChange={(e) => setCropYear(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Area Allocated (Acres)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 3.5"
                  value={cropArea}
                  onChange={(e) =>
                    setCropArea(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition shadow-xs"
                >
                  Save Crop Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
