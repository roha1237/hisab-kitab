import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  AlertCircle,
  MapPin,
  DollarSign,
  Trash2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  Crop,
  CropSale,
  Expense,
  Farm,
  Language,
} from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface AgricultureModuleProps {
  currentLang: Language;
  openCropSaleDefault?: boolean;
}

export const AgricultureModule: React.FC<AgricultureModuleProps> = ({
  currentLang,
  openCropSaleDefault = false,
}) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<
    'farms' | 'crops' | 'expenses' | 'sales' | 'profit'
  >(openCropSaleDefault ? 'sales' : 'profit');

  // Farm Form
  const [farmName, setFarmName] = useState('');
  const [farmArea, setFarmArea] = useState<number | ''>('');
  const [farmAreaUnit, setFarmAreaUnit] = useState<Farm['areaUnit']>('acre');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmNotes, setFarmNotes] = useState('');

  // Crop Form
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [cropName, setCropName] = useState('');
  const [cropSeason, setCropSeason] = useState<Crop['season']>('Kharif');
  const [cropYear, setCropYear] = useState<number>(new Date().getFullYear());
  const [cropArea, setCropArea] = useState<number | ''>('');
  const [cropSowingDate, setCropSowingDate] = useState('');
  const [cropHarvestDate, setCropHarvestDate] = useState('');

  // Crop Expense Form
  const [expCropId, setExpCropId] = useState('');
  const [expCategory, setExpCategory] = useState('Fertilizers');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expNotes, setExpNotes] = useState('');

  // Crop Sale Form
  const [saleCropId, setSaleCropId] = useState('');
  const [saleBuyerName, setSaleBuyerName] = useState('');
  const [saleBuyerPhone, setSaleBuyerPhone] = useState('');
  const [saleQuantity, setSaleQuantity] = useState<number | ''>('');
  const [saleUnit, setSaleUnit] = useState<CropSale['unit']>('quintal');
  const [saleRate, setSaleRate] = useState<number | ''>('');
  const [saleReceived, setSaleReceived] = useState<number | ''>('');
  const [saleNotes, setSaleNotes] = useState('');

  const farms = storage.getFarms();
  const crops = storage.getCrops();
  const cropSales = storage.getCropSales();
  const agriExpenses = storage.getExpenses('agriculture');
  const financials = storage.getAgriFinancials();

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim() || farmArea === '') return;
    storage.addFarm(farmName, Number(farmArea), farmAreaUnit, farmLocation, farmNotes);
    setFarmName('');
    setFarmArea('');
    setFarmLocation('');
    setFarmNotes('');
    setActiveTab('farms');
  };

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim() || !selectedFarmId) {
      alert('Please select a farm and enter crop name');
      return;
    }
    const farm = farms.find((f) => f.id === selectedFarmId);
    storage.addCrop(
      selectedFarmId,
      farm ? farm.name : 'Main Farm',
      cropName,
      cropSeason,
      cropYear,
      cropArea === '' ? (farm ? farm.area : 1) : Number(cropArea),
      farm ? farm.areaUnit : 'acre',
      cropSowingDate,
      cropHarvestDate
    );
    setCropName('');
    setCropArea('');
    setCropSowingDate('');
    setCropHarvestDate('');
    setActiveTab('crops');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount === '') return;
    const crop = crops.find((c) => c.id === expCropId);
    storage.addExpense(
      'agriculture',
      expCategory,
      expTitle,
      Number(expAmount),
      expNotes,
      crop ? crop.farmId : undefined,
      expCropId || undefined
    );
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleBuyerName.trim() || saleQuantity === '' || saleRate === '') return;

    const crop = crops.find((c) => c.id === saleCropId);
    const totalAmount = Number(saleQuantity) * Number(saleRate);
    const received = saleReceived === '' ? totalAmount : Number(saleReceived);
    const pending = Math.max(0, totalAmount - received);

    storage.addCropSale({
      cropId: saleCropId || 'generic_crop',
      cropName: crop ? crop.name : 'General Crop Harvest',
      buyerName: saleBuyerName.trim(),
      buyerPhone: saleBuyerPhone.trim(),
      quantity: Number(saleQuantity),
      unit: saleUnit,
      ratePerUnit: Number(saleRate),
      totalSaleAmount: totalAmount,
      amountReceived: received,
      outstandingBalance: pending,
      notes: saleNotes,
    });

    setSaleBuyerName('');
    setSaleBuyerPhone('');
    setSaleQuantity('');
    setSaleRate('');
    setSaleReceived('');
    setSaleNotes('');
    setActiveTab('profit');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'profit'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{t.agriProfitTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{t.cropSalesTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{t.agriExpensesTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('crops')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'crops'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>{t.cropsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('farms')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'farms'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t.farmsTab}</span>
        </button>
      </div>

      {/* 1. PROFIT & LOSS OVERVIEW */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          {/* Main Profit Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Recorded Net Agriculture Profit
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">
                  ₹{financials.recordedProfit.toLocaleString('en-IN')}
                </h2>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/15">
                <Scale className="w-6 h-6 text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
              <div className="bg-white/10 p-3 rounded-xl">
                <span className="text-emerald-200 block">Total Sales Income</span>
                <span className="text-base font-black text-white mt-0.5 block">
                  ₹{financials.totalSalesIncome.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-200/80">
                  Received: ₹{financials.totalAmountReceived.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl">
                <span className="text-rose-200 block">Total Recorded Expenses</span>
                <span className="text-base font-black text-white mt-0.5 block">
                  ₹{financials.totalCropExpenses.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-rose-200/80">
                  Seeds, Fertilizer, Labour, Diesel
                </span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl">
                <span className="text-amber-200 block">Pending Mandi Udhaar</span>
                <span className="text-base font-black text-white mt-0.5 block">
                  ₹{financials.totalPendingReceivable.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-200/80">
                  From traders / commission agents
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-200/80 italic flex items-center gap-1.5 pt-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {t.agriProfitEstimateNote}
            </p>
          </div>

          {/* Breakdown By Crop */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Crop-wise Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crops.map((crop) => {
                const cropSalesList = cropSales.filter((s) => s.cropId === crop.id);
                const cropSalesTotal = cropSalesList.reduce(
                  (sum, s) => sum + s.totalSaleAmount,
                  0
                );
                const cropExpensesList = agriExpenses.filter((e) => e.cropId === crop.id);
                const cropExpensesTotal = cropExpensesList.reduce(
                  (sum, e) => sum + e.amount,
                  0
                );
                const cropNet = cropSalesTotal - cropExpensesTotal;

                return (
                  <div
                    key={crop.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{crop.name}</h4>
                        <p className="text-xs text-slate-500">
                          {crop.season} {crop.year} • {crop.areaAllocated} {crop.areaUnit} ({crop.farmName})
                        </p>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          cropNet >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Net: ₹{cropNet.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block">Sales Total</span>
                        <span className="font-bold text-slate-800">
                          ₹{cropSalesTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block">Expenses</span>
                        <span className="font-bold text-rose-600">
                          ₹{cropExpensesTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. CROP SALES TAB */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sale Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              {t.recordCropSale}
            </h3>

            <form onSubmit={handleAddSale} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Harvested Crop
                </label>
                <select
                  value={saleCropId}
                  onChange={(e) => setSaleCropId(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">-- Choose Crop --</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.season} {c.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.buyerName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kailas Vyapari (APMC Mandi)"
                  value={saleBuyerName}
                  onChange={(e) => setSaleBuyerName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.buyerPhone}
                </label>
                <input
                  type="tel"
                  placeholder="Mobile number of buyer"
                  value={saleBuyerPhone}
                  onChange={(e) => setSaleBuyerPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.saleQuantity} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 24"
                    value={saleQuantity}
                    onChange={(e) =>
                      setSaleQuantity(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.areaUnit}
                  </label>
                  <select
                    value={saleUnit}
                    onChange={(e) => setSaleUnit(e.target.value as any)}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="quintal">{t.quintal}</option>
                    <option value="kg">{t.kg}</option>
                    <option value="ton">{t.ton}</option>
                    <option value="bag">{t.bag}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.ratePerUnit} *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Rate ₹ per quintal / unit"
                  value={saleRate}
                  onChange={(e) =>
                    setSaleRate(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Total Calculation Display */}
              {saleQuantity && saleRate && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex justify-between font-bold text-emerald-950">
                    <span>Total Sale Value:</span>
                    <span>₹{(Number(saleQuantity) * Number(saleRate)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter cash / UPI received"
                  value={saleReceived}
                  onChange={(e) =>
                    setSaleReceived(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
              >
                Save Crop Sale Record
              </button>
            </form>
          </div>

          {/* Sales History List */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Crop Sales Ledger ({cropSales.length})
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {cropSales.map((sale) => (
                <div key={sale.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {sale.cropName} - {sale.buyerName}
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {sale.quantity} {sale.unit} @ ₹{sale.ratePerUnit}/{sale.unit} •{' '}
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-black text-slate-900 text-sm block">
                      Total: ₹{sale.totalSaleAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Received: ₹{sale.amountReceived.toLocaleString('en-IN')}
                    </span>
                    {sale.outstandingBalance > 0 && (
                      <span className="text-[11px] text-amber-800 font-bold block">
                        Buyer Udhaar: ₹{sale.outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CROP EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Add Crop Expense
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tag to Crop (Optional)
                </label>
                <select
                  value={expCropId}
                  onChange={(e) => setExpCropId(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">-- General Agriculture --</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.season})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.expenseCategory}
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="Seeds">{t.seeds}</option>
                  <option value="Fertilizers">{t.fertilizers}</option>
                  <option value="Pesticides">{t.pesticides}</option>
                  <option value="Labour">{t.labour}</option>
                  <option value="Irrigation & Diesel">{t.irrigationDiesel}</option>
                  <option value="Tractor Hire">{t.tractorEquipment}</option>
                  <option value="Miscellaneous">{t.miscExpense}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Description / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 bags Urea, 3 days weeding labour"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1800"
                  value={expAmount}
                  onChange={(e) =>
                    setExpAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
              >
                Record Agri Expense
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Agriculture Expenses ({agriExpenses.length})
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {agriExpenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{exp.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {exp.category} • {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-rose-600 text-sm">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete expense "${exp.title}"?`)) {
                          storage.deleteExpense(exp.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CROPS & SEASONS TAB */}
      {activeTab === 'crops' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" />
              {t.addCrop}
            </h3>

            <form onSubmit={handleAddCrop} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Farm / Field *
                </label>
                <select
                  required
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="">-- Choose Farm --</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.area} {f.areaUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.cropName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton, Soybean, Wheat"
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
                  Area Allocated (in Acres/Units)
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

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
              >
                Save Crop Record
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Registered Crops ({crops.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {crops.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {c.season}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Farm: {c.farmName} • {c.areaAllocated} {c.areaUnit}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Status: <span className="font-semibold capitalize text-slate-700">{c.status}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. FARMS & FIELDS TAB */}
      {activeTab === 'farms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {t.addFarm}
            </h3>

            <form onSubmit={handleAddFarm} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.farmName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shivneri Farm, North Gat"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.farmArea} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 5.5"
                    value={farmArea}
                    onChange={(e) =>
                      setFarmArea(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.areaUnit}
                  </label>
                  <select
                    value={farmAreaUnit}
                    onChange={(e) => setFarmAreaUnit(e.target.value as any)}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  >
                    <option value="acre">{t.acre}</option>
                    <option value="hectare">{t.hectare}</option>
                    <option value="bigha">{t.bigha}</option>
                    <option value="guntha">{t.guntha}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.location}
                </label>
                <input
                  type="text"
                  placeholder="Village / Gat number"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
              >
                Save Farm Record
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Registered Farms & Fields ({farms.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {farms.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{f.name}</h4>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {f.area} {f.areaUnit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {f.location || 'Location not specified'}
                  </p>
                  {f.notes && <p className="text-[11px] text-slate-400">{f.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
