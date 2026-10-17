import React, { useState } from 'react';
import {
  Scissors,
  UserPlus,
  Search,
  Plus,
  Trash2,
  FileText,
  Share2,
  Settings as SettingsIcon,
  Receipt,
  DollarSign,
  Clock,
  Phone,
  CheckCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import {
  Bill,
  BillItem,
  Customer,
  Language,
  PaymentMethod,
  SalonService,
} from '../types';
import { translations } from '../i18n/translations';
import { storage } from '../services/storage';

interface SalonModuleProps {
  currentLang: Language;
  onViewInvoice: (bill: Bill) => void;
  openBillingDefault?: boolean;
}

export const SalonModule: React.FC<SalonModuleProps> = ({
  currentLang,
  onViewInvoice,
  openBillingDefault = false,
}) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<
    'billing' | 'customers' | 'history' | 'services' | 'expenses'
  >(openBillingDefault ? 'billing' : 'billing');

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Billing Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [billingItems, setBillingItems] = useState<
    Array<{
      serviceId?: string;
      serviceName: string;
      unitPrice: number;
      quantity: number;
    }>
  >([
    { serviceId: 'srv_1', serviceName: 'Haircut', unitPrice: 100, quantity: 1 },
  ]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState<number | ''>('');
  const [amountPaidInput, setAmountPaidInput] = useState<number | ''>(100);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [billNotes, setBillNotes] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const [createdBill, setCreatedBill] = useState<Bill | null>(null);

  // Services Configuration State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');
  const [newServiceCategory, setNewServiceCategory] = useState('Hair');

  // Salon Expenses State
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('Blades & Shaving');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expNotes, setExpNotes] = useState('');

  const customers = storage.getCustomers();
  const services = storage.getServices();
  const bills = storage.getBills();
  const salonExpenses = storage.getExpenses('salon');

  // Filtered customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  // Bill totals calculation
  const totalBilledAmount = billingItems.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
    0
  );
  const currentPaid = amountPaidInput === '' ? 0 : Number(amountPaidInput);
  const currentBalance = Math.max(0, totalBilledAmount - currentPaid);

  const handleAddBillingItem = (srv: SalonService) => {
    const existing = billingItems.find((i) => i.serviceId === srv.id);
    if (existing) {
      setBillingItems(
        billingItems.map((i) =>
          i.serviceId === srv.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setBillingItems([
        ...billingItems,
        {
          serviceId: srv.id,
          serviceName: srv.defaultName,
          unitPrice: srv.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleAddCustomBillingItem = () => {
    if (!customServiceName || !customServicePrice) return;
    setBillingItems([
      ...billingItems,
      {
        serviceName: customServiceName.trim(),
        unitPrice: Number(customServicePrice),
        quantity: 1,
      },
    ]);
    setCustomServiceName('');
    setCustomServicePrice('');
  };

  const handleRemoveBillingItem = (index: number) => {
    setBillingItems(billingItems.filter((_, idx) => idx !== index));
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBill) return; // Prevent double-tap
    if (billingItems.length === 0) {
      alert('Please add at least one service item to the bill.');
      return;
    }

    let customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) {
      if (!custName.trim()) {
        alert('Please select or enter customer name.');
        return;
      }
      customer = storage.addCustomer(custName.trim(), custPhone.trim());
    }

    setIsSubmittingBill(true);

    const items: BillItem[] = billingItems.map((item, idx) => ({
      id: 'bi_' + Date.now() + '_' + idx,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    }));

    const paymentStatus =
      currentBalance === 0 ? 'paid' : currentPaid > 0 ? 'partial' : 'unpaid';

    const newBill = storage.createBill({
      businessType: 'salon',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items,
      totalAmount: totalBilledAmount,
      amountPaid: currentPaid,
      outstandingBalance: currentBalance,
      paymentMethod,
      paymentStatus,
      notes: billNotes,
      thankYouMessage:
        currentBalance > 0
          ? 'Jab aapko suvidha ho, kripya pending payment jama karein. Aapke bharose aur support ke liye dhanyavaad!'
          : 'Thank you for your visit! Har Hisab Ka Bharosa! - Hisab Master by Rohan',
    });

    setCreatedBill(newBill);
    setIsSubmittingBill(false);

    // Reset form
    setBillingItems([
      { serviceId: 'srv_1', serviceName: 'Haircut', unitPrice: 100, quantity: 1 },
    ]);
    setAmountPaidInput(100);
    setBillNotes('');
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    if (editingCustomer) {
      storage.updateCustomer(editingCustomer.id, custName, custPhone, custNotes);
      setEditingCustomer(null);
    } else {
      storage.addCustomer(custName, custPhone, custNotes);
    }

    setCustName('');
    setCustPhone('');
    setCustNotes('');
    setShowAddCustomerModal(false);
  };

  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || newServicePrice === '') return;
    storage.addService(newServiceName, Number(newServicePrice), newServiceCategory);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleAddSalonExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount === '') return;
    storage.addExpense('salon', expCategory, expTitle, Number(expAmount), expNotes);
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'billing'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{t.billingTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{t.customersTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.billHistoryTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>{t.servicesTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{t.salonExpensesTab}</span>
        </button>
      </div>

      {/* SUCCESS MODAL FOR CREATED BILL */}
      {createdBill && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                {t.billGeneratedSuccess} ({createdBill.billNumber})
              </h4>
              <p className="text-xs text-emerald-800">
                Customer: {createdBill.customerName} • Total: ₹{createdBill.totalAmount} • Paid: ₹{createdBill.amountPaid} • Pending: ₹{createdBill.outstandingBalance}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onViewInvoice(createdBill)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              {t.viewInvoice}
            </button>
            <button
              onClick={() => setCreatedBill(null)}
              className="px-3 py-2 bg-white border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-100 transition cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* 1. BILLING TAB */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Selector & Quick Add (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer Picker */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                {t.selectCustomer}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">
                    Existing Customer
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) {
                        setCustName(c.name);
                        setCustPhone(c.phone);
                      }
                    }}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Choose Existing Customer --</option>
                    {customers.map((c) => {
                      const fin = storage.getCustomerFinancials(c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : ''} - Udhaar: ₹{fin.outstandingBalance}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">
                    Or Walk-in / New Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="max-w-xs">
                <label className="text-xs text-slate-500 font-medium block mb-1">
                  Mobile Number (Optional for WhatsApp Bill)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Quick Service Palette */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-600" />
                  {t.selectServices}
                </h3>
                <span className="text-xs text-slate-400">Click to add to bill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {services.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleAddBillingItem(srv)}
                    className="p-3 rounded-xl border border-amber-200/70 bg-amber-50/50 hover:bg-amber-100/70 text-left transition cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {srv.defaultName}
                    </span>
                    <span className="text-sm font-black text-amber-800 mt-2">
                      ₹{srv.price}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Item Row */}
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.customItem}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Custom service name"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    className="flex-1 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={customServicePrice}
                    onChange={(e) =>
                      setCustomServicePrice(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    className="w-24 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBillingItem}
                    className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Receipt & Calculation Summary (Right Column) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  {t.billSummary}
                </h3>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                  {storage.generateBillNumber()}
                </span>
              </div>

              {/* Items List */}
              <div className="mt-3 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                {billingItems.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No items selected. Click services on the left to add.
                  </p>
                ) : (
                  billingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <span className="font-semibold text-slate-800 block">
                          {item.serviceName}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ₹{item.unitPrice} × {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          ₹{item.unitPrice * item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBillingItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Financial Calculations Box */}
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">{t.subtotal}:</span>
                  <span className="font-black text-slate-900">
                    ₹{totalBilledAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {t.paidAmount}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalBilledAmount}
                    value={amountPaidInput}
                    onChange={(e) =>
                      setAmountPaidInput(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    className="w-full text-sm font-bold border border-slate-300 rounded-xl px-3 py-2 bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setAmountPaidInput(totalBilledAmount)}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Full Paid (₹{totalBilledAmount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaidInput(0)}
                      className="text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Unpaid / Full Udhaar
                    </button>
                  </div>
                </div>

                {/* Outstanding balance indicator */}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-600 font-semibold">{t.balanceDue}:</span>
                  <span
                    className={`font-black ${
                      currentBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ₹{currentBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.paymentMethod}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['cash', 'upi', 'other'] as PaymentMethod[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMethod(mode)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer capitalize ${
                          paymentMethod === mode
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mode === 'cash' ? t.cash : mode === 'upi' ? t.upi : t.other}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                disabled={isSubmittingBill}
                onClick={handleCreateBill}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t.saveAndGenerateBill}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={t.searchCustomer}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setCustName('');
                setCustPhone('');
                setCustNotes('');
                setShowAddCustomerModal(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer w-full sm:w-auto justify-center"
            >
              <UserPlus className="w-4 h-4" />
              {t.addCustomer}
            </button>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCustomers.map((cust) => {
              const fin = storage.getCustomerFinancials(cust.id);
              return (
                <div
                  key={cust.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{cust.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {cust.phone || 'No phone'}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          fin.outstandingBalance > 0
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {fin.outstandingBalance > 0
                          ? `Udhaar: ₹${fin.outstandingBalance}`
                          : 'Clear'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Total Billed</span>
                        <span className="font-bold text-slate-800">
                          ₹{fin.totalBilled}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total Paid</span>
                        <span className="font-bold text-emerald-700">
                          ₹{fin.totalPaid}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCustomerId(cust.id);
                        setCustName(cust.name);
                        setCustPhone(cust.phone);
                        setActiveTab('billing');
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                    >
                      + New Bill
                    </button>
                    <button
                      onClick={() => {
                        setEditingCustomer(cust);
                        setCustName(cust.name);
                        setCustPhone(cust.phone);
                        setCustNotes(cust.notes || '');
                        setShowAddCustomerModal(true);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {t.edit}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BILL HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              {t.billHistoryTab} ({bills.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t.billNumber}</th>
                  <th className="py-3 px-4">{t.customerName}</th>
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.subtotal}</th>
                  <th className="py-3 px-4">{t.paidAmount}</th>
                  <th className="py-3 px-4">{t.balanceDue}</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {bill.billNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {bill.customerName}
                      {bill.customerPhone && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {bill.customerPhone}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(bill.date).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{bill.totalAmount}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ₹{bill.amountPaid}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-800">
                      ₹{bill.outstandingBalance}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                          bill.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.paymentStatus === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {bill.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewInvoice(bill)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SERVICES & RATES CONFIGURATION TAB */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Service Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              {t.addCustomService}
            </h3>
            <form onSubmit={handleAddNewService} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.serviceName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beard Color, Hair Spa"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.price}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 150"
                  value={newServicePrice}
                  onChange={(e) =>
                    setNewServicePrice(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="Hair">Hair</option>
                  <option value="Beard">Beard</option>
                  <option value="Face">Face / Skin</option>
                  <option value="Color">Color / Dye</option>
                  <option value="Massage">Massage</option>
                  <option value="General">General</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
              >
                Save Service Rate
              </button>
            </form>
          </div>

          {/* Current Services Catalog */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-600" />
              {t.configureServices}
            </h3>
            <p className="text-xs text-slate-500">
              Rates can be customized at any time. Prices apply to new bills.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {srv.defaultName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Category: {srv.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-800">
                      ₹{srv.price}
                    </span>
                    <button
                      onClick={() => {
                        const newPriceStr = prompt(
                          `Update price for ${srv.defaultName}:`,
                          String(srv.price)
                        );
                        if (newPriceStr !== null) {
                          const p = parseFloat(newPriceStr);
                          if (!isNaN(p) && p >= 0) {
                            storage.updateService(srv.id, srv.defaultName, p);
                          }
                        }
                      }}
                      className="text-xs font-semibold text-amber-700 hover:underline p-1 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SALON EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Expense Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-600" />
              Add Salon Expense
            </h3>
            <form onSubmit={handleAddSalonExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Expense Category
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="Blades & Shaving">Blades & Shaving (ब्लेड)</option>
                  <option value="Products & Creams">Cosmetics & Creams (क्रीम व तेल)</option>
                  <option value="Electricity & Rent">Electricity & Rent (दुकान किराया व बिल)</option>
                  <option value="Staff Wages">Staff / Assistant Wage (कारीगर मजुरी)</option>
                  <option value="Tea & Refreshments">Tea & Water (चाय व नाश्ता)</option>
                  <option value="Maintenance">Shop Maintenance (दुरुस्ती)</option>
                  <option value="Miscellaneous">Other Miscellaneous (अन्य)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 boxes laser blades"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 250"
                  value={expAmount}
                  onChange={(e) =>
                    setExpAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Purchased from wholesale depot"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition"
              >
                Record Expense
              </button>
            </form>
          </div>

          {/* Expenses History */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Salon Expenses Log ({salonExpenses.length})
              </h3>
              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                Total: ₹
                {salonExpenses
                  .reduce((sum, e) => sum + e.amount, 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {salonExpenses.map((exp) => (
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

      {/* Add / Edit Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              {editingCustomer ? t.editCustomer : t.addCustomer}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.customerPhone}
                </label>
                <input
                  type="tel"
                  placeholder="10 digit phone number"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferences, area, etc."
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
