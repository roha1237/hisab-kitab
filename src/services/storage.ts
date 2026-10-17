import {
  AppStateData,
  Bill,
  Crop,
  CropSale,
  Customer,
  Expense,
  Farm,
  Language,
  SalonService,
  UdhaarPayment,
} from '../types';

const STORAGE_KEY = 'hisab_master_rohan_db_v1';

export const DEFAULT_SERVICES: SalonService[] = [
  { id: 'srv_1', nameKey: 'haircut', defaultName: 'Haircut (हेयरकट / कटिंग)', price: 100, category: 'Hair' },
  { id: 'srv_2', nameKey: 'beard', defaultName: 'Beard Trim / Shave (दाढ़ी / शेविंग)', price: 60, category: 'Beard' },
  { id: 'srv_3', nameKey: 'hair_wash', defaultName: 'Hair Wash (हेयर वॉश)', price: 50, category: 'Hair' },
  { id: 'srv_4', nameKey: 'hair_color', defaultName: 'Hair Color / Dye (हेयर कलर)', price: 250, category: 'Color' },
  { id: 'srv_5', nameKey: 'facial', defaultName: 'Facial & Cleanup (फेशियल)', price: 400, category: 'Face' },
  { id: 'srv_6', nameKey: 'head_massage', defaultName: 'Head Oil Massage (सिर मालिश)', price: 80, category: 'Massage' },
];

export const INITIAL_SETTINGS = {
  salonName: 'Royal Men Salon & Spa',
  salonAddress: 'Station Road, Near Bus Stand, Maharashtra',
  salonPhone: '9876543210',
  salonUpiId: 'rohannakshine@upi',
  billPrefixSalon: 'HM-SAL',
  developerName: 'Rohan Nakshine',
  developerEmail: 'rohannakshine7@gmail.com',
  currencySymbol: '₹',
  thankYouNote: 'Thank you for visiting! Please visit us again. - Hisab Master by Rohan',
};

// Initial realistic seed data so the user can immediately test calculations and reports
const INITIAL_DATA: AppStateData = {
  version: 1,
  language: 'hi',
  settings: INITIAL_SETTINGS,
  customers: [
    { id: 'c_1', name: 'Rahul Sharma (राहुल शर्मा)', phone: '9822012345', notes: 'Regular weekly customer', createdAt: '2026-10-01T10:00:00Z' },
    { id: 'c_2', name: 'Amol Deshmukh (अमोल देशमुख)', phone: '9822054321', notes: 'Farmer & Shopkeeper', createdAt: '2026-10-03T11:30:00Z' },
    { id: 'c_3', name: 'Vikas Patil (विकास पाटील)', phone: '9890123456', notes: 'College student', createdAt: '2026-10-05T14:15:00Z' },
    { id: 'c_4', name: 'Sachin Shinde (सचिन शिंदे)', phone: '9765432109', notes: 'Local business owner', createdAt: '2026-10-07T09:45:00Z' },
  ],
  salonServices: DEFAULT_SERVICES,
  bills: [
    {
      id: 'b_1',
      billNumber: 'HM-SAL-101',
      businessType: 'salon',
      customerId: 'c_1',
      customerName: 'Rahul Sharma (राहुल शर्मा)',
      customerPhone: '9822012345',
      items: [
        { id: 'bi_1', serviceId: 'srv_1', serviceName: 'Haircut', quantity: 1, unitPrice: 100, totalPrice: 100 },
        { id: 'bi_2', serviceId: 'srv_2', serviceName: 'Beard Trim / Shave', quantity: 1, unitPrice: 40, totalPrice: 40 },
      ],
      totalAmount: 140,
      amountPaid: 0,
      outstandingBalance: 140,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      date: '2026-10-14T08:30:00Z',
      thankYouMessage: 'Jab aapko suvidha ho, kripya pending payment jama karein. Aapke bharose aur support ke liye dhanyavaad!',
    },
    {
      id: 'b_2',
      billNumber: 'HM-SAL-102',
      businessType: 'salon',
      customerId: 'c_2',
      customerName: 'Amol Deshmukh (अमोल देशमुख)',
      customerPhone: '9822054321',
      items: [
        { id: 'bi_3', serviceId: 'srv_1', serviceName: 'Haircut', quantity: 1, unitPrice: 100, totalPrice: 100 },
        { id: 'bi_4', serviceId: 'srv_6', serviceName: 'Head Oil Massage', quantity: 1, unitPrice: 80, totalPrice: 80 },
      ],
      totalAmount: 180,
      amountPaid: 100,
      outstandingBalance: 80,
      paymentMethod: 'upi',
      paymentStatus: 'partial',
      date: '2026-10-14T09:15:00Z',
    },
    {
      id: 'b_3',
      billNumber: 'HM-SAL-103',
      businessType: 'salon',
      customerId: 'c_3',
      customerName: 'Vikas Patil (विकास पाटील)',
      customerPhone: '9890123456',
      items: [
        { id: 'bi_5', serviceId: 'srv_1', serviceName: 'Haircut', quantity: 1, unitPrice: 100, totalPrice: 100 },
      ],
      totalAmount: 100,
      amountPaid: 100,
      outstandingBalance: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      date: '2026-10-14T10:00:00Z',
    },
  ],
  udhaarPayments: [],
  expenses: [
    {
      id: 'exp_1',
      businessType: 'salon',
      category: 'Blades & Products',
      title: 'Shaving Blades & Dettol (ब्लेड्स व डेटॉल)',
      amount: 320,
      date: '2026-10-14T07:45:00Z',
      notes: 'Weekly stock purchase',
    },
    {
      id: 'exp_2',
      businessType: 'salon',
      category: 'Refreshments',
      title: 'Tea and drinking water (चाय व पाणी)',
      amount: 80,
      date: '2026-10-14T08:00:00Z',
    },
    {
      id: 'exp_3',
      businessType: 'agriculture',
      category: 'Fertilizers',
      title: 'DAP & Urea Fertilizer (डीएपी व यूरिया खत)',
      amount: 2400,
      date: '2026-10-10T11:00:00Z',
      farmId: 'farm_1',
      cropId: 'crop_1',
      notes: 'Purchase for Soybean crop',
    },
    {
      id: 'exp_4',
      businessType: 'agriculture',
      category: 'Labour',
      title: 'Weeding labour 4 persons (निंदणी मजुरी)',
      amount: 1600,
      date: '2026-10-12T17:00:00Z',
      farmId: 'farm_1',
      cropId: 'crop_1',
    },
  ],
  farms: [
    {
      id: 'farm_1',
      name: 'Shivneri Farm (शिवनेरी मळा)',
      area: 5.5,
      areaUnit: 'acre',
      location: 'Wadgaon Road, Gat No. 42',
      notes: 'Well irrigation with electric motor available',
    },
  ],
  crops: [
    {
      id: 'crop_1',
      farmId: 'farm_1',
      farmName: 'Shivneri Farm (शिवनेरी मळा)',
      name: 'Soybean (सोयाबीन - JS 335)',
      season: 'Kharif',
      year: 2026,
      sowingDate: '2026-06-25',
      harvestDate: '2026-10-08',
      areaAllocated: 5.5,
      areaUnit: 'acre',
      status: 'harvested',
    },
    {
      id: 'crop_2',
      farmId: 'farm_1',
      farmName: 'Shivneri Farm (शिवनेरी मळा)',
      name: 'Wheat (गहू - लोकवन)',
      season: 'Rabi',
      year: 2026,
      sowingDate: '2026-11-01',
      areaAllocated: 4.0,
      areaUnit: 'acre',
      status: 'sown',
    },
  ],
  cropSales: [
    {
      id: 'cs_1',
      cropId: 'crop_1',
      cropName: 'Soybean (सोयाबीन)',
      buyerName: 'Kailas Vyapari (कैलास व्यापारी - कृषी उत्पन्न बाजार समिती)',
      buyerPhone: '9822998877',
      quantity: 24,
      unit: 'quintal',
      ratePerUnit: 4850,
      totalSaleAmount: 116400,
      amountReceived: 90000,
      outstandingBalance: 26400,
      date: '2026-10-12T16:00:00Z',
      notes: 'Remaining 26,400 to be paid on Friday',
    },
  ],
};

class StorageService {
  private data: AppStateData;
  private listeners: Array<() => void> = [];

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AppStateData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version) {
          // Merge with any new default keys safely
          return {
            ...INITIAL_DATA,
            ...parsed,
            settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return INITIAL_DATA;
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getData(): AppStateData {
    return this.data;
  }

  public getLanguage(): Language {
    return this.data.language || 'hi';
  }

  public setLanguage(lang: Language): void {
    this.data.language = lang;
    this.saveData();
  }

  public updateSettings(settings: Partial<AppStateData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public addCustomer(name: string, phone: string, notes?: string): Customer {
    const customer: Customer = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    this.data.customers.push(customer);
    this.saveData();
    return customer;
  }

  public updateCustomer(id: string, name: string, phone: string, notes?: string): void {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.customers[idx] = {
        ...this.data.customers[idx],
        name: name.trim(),
        phone: phone.trim(),
        notes: notes?.trim(),
      };
      this.saveData();
    }
  }

  // --- Services ---
  public getServices(): SalonService[] {
    return this.data.salonServices;
  }

  public addService(name: string, price: number, category = 'General'): SalonService {
    const service: SalonService = {
      id: 'srv_' + Date.now(),
      nameKey: 'custom_' + Date.now(),
      defaultName: name.trim(),
      price: Math.max(0, price),
      category,
      isCustom: true,
    };
    this.data.salonServices.push(service);
    this.saveData();
    return service;
  }

  public updateService(id: string, name: string, price: number): void {
    const idx = this.data.salonServices.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.salonServices[idx] = {
        ...this.data.salonServices[idx],
        defaultName: name.trim(),
        price: Math.max(0, price),
      };
      this.saveData();
    }
  }

  // --- Bills ---
  public getBills(): Bill[] {
    return [...this.data.bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public generateBillNumber(): string {
    const count = this.data.bills.length + 1;
    const prefix = this.data.settings.billPrefixSalon || 'HM-SAL';
    const year = new Date().getFullYear();
    const padded = String(count).padStart(3, '0');
    return `${prefix}-${year}-${padded}`;
  }

  public createBill(billData: Omit<Bill, 'id' | 'billNumber' | 'date'>): Bill {
    const bill: Bill = {
      ...billData,
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      billNumber: this.generateBillNumber(),
      date: new Date().toISOString(),
    };
    this.data.bills.push(bill);
    this.saveData();
    return bill;
  }

  // --- Customer Udhaar & Balances ---
  /**
   * Calculation:
   * Outstanding balance = Total billed amount - Total payments received
   * Unpaid bills add to the outstanding balance. Direct payments against udhaar subtract from it.
   */
  public getCustomerFinancials(customerId: string): {
    totalBilled: number;
    totalBillPaid: number;
    totalUdhaarPaid: number;
    totalPaid: number;
    outstandingBalance: number;
  } {
    const customerBills = this.data.bills.filter((b) => b.customerId === customerId);
    const totalBilled = customerBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalBillPaid = customerBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    // Payments recorded through Udhaar Ledger (excluding active reversals)
    const udhaarPayments = this.data.udhaarPayments.filter(
      (p) => p.customerId === customerId && !p.isReversal
    );
    const totalUdhaarPaid = udhaarPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPaid = totalBillPaid + totalUdhaarPaid;
    const outstandingBalance = Math.max(0, totalBilled - totalPaid);

    return {
      totalBilled,
      totalBillPaid,
      totalUdhaarPaid,
      totalPaid,
      outstandingBalance,
    };
  }

  public recordUdhaarPayment(
    customerId: string,
    customerName: string,
    amount: number,
    paymentMethod: 'cash' | 'upi' | 'other' = 'cash',
    note?: string
  ): UdhaarPayment {
    const payment: UdhaarPayment = {
      id: 'up_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      customerId,
      customerName,
      amount: Math.max(0, amount),
      paymentMethod,
      date: new Date().toISOString(),
      note: note?.trim(),
      isReversal: false,
    };
    this.data.udhaarPayments.push(payment);
    this.saveData();
    return payment;
  }

  /**
   * Reversal / Correction workflow:
   * Never delete a payment silently. Mark with isReversal: true and store reversal reason.
   */
  public reverseUdhaarPayment(paymentId: string, reason: string): boolean {
    const idx = this.data.udhaarPayments.findIndex((p) => p.id === paymentId);
    if (idx !== -1) {
      this.data.udhaarPayments[idx] = {
        ...this.data.udhaarPayments[idx],
        isReversal: true,
        reversalReason: reason.trim(),
      };
      this.saveData();
      return true;
    }
    return false;
  }

  public getUdhaarPayments(customerId?: string): UdhaarPayment[] {
    let list = this.data.udhaarPayments;
    if (customerId) {
      list = list.filter((p) => p.customerId === customerId);
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // --- Expenses ---
  public getExpenses(businessType?: 'salon' | 'agriculture'): Expense[] {
    let list = this.data.expenses;
    if (businessType) {
      list = list.filter((e) => e.businessType === businessType);
    }
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addExpense(
    businessType: 'salon' | 'agriculture',
    category: string,
    title: string,
    amount: number,
    notes?: string,
    farmId?: string,
    cropId?: string
  ): Expense {
    const expense: Expense = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      businessType,
      category: category.trim(),
      title: title.trim(),
      amount: Math.max(0, amount),
      date: new Date().toISOString(),
      notes: notes?.trim(),
      farmId,
      cropId,
    };
    this.data.expenses.push(expense);
    this.saveData();
    return expense;
  }

  public deleteExpense(id: string): void {
    this.data.expenses = this.data.expenses.filter((e) => e.id !== id);
    this.saveData();
  }

  // --- Agriculture: Farms, Crops, Sales ---
  public getFarms(): Farm[] {
    return this.data.farms;
  }

  public addFarm(name: string, area: number, areaUnit: Farm['areaUnit'], location: string, notes?: string): Farm {
    const farm: Farm = {
      id: 'farm_' + Date.now(),
      name: name.trim(),
      area: Math.max(0, area),
      areaUnit,
      location: location.trim(),
      notes: notes?.trim(),
    };
    this.data.farms.push(farm);
    this.saveData();
    return farm;
  }

  public getCrops(): Crop[] {
    return this.data.crops;
  }

  public addCrop(
    farmId: string,
    farmName: string,
    name: string,
    season: Crop['season'],
    year: number,
    areaAllocated: number,
    areaUnit: string,
    sowingDate?: string,
    harvestDate?: string
  ): Crop {
    const crop: Crop = {
      id: 'crop_' + Date.now(),
      farmId,
      farmName,
      name: name.trim(),
      season,
      year,
      areaAllocated,
      areaUnit,
      sowingDate,
      harvestDate,
      status: 'sown',
    };
    this.data.crops.push(crop);
    this.saveData();
    return crop;
  }

  public getCropSales(): CropSale[] {
    return [...this.data.cropSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addCropSale(saleData: Omit<CropSale, 'id' | 'date'>): CropSale {
    const sale: CropSale = {
      ...saleData,
      id: 'cs_' + Date.now(),
      date: new Date().toISOString(),
    };
    this.data.cropSales.push(sale);
    this.saveData();
    return sale;
  }

  /**
   * Agriculture Profit Calculation:
   * Agriculture Profit = Crop sales income - Recorded crop expenses
   */
  public getAgriFinancials(cropId?: string): {
    totalSalesIncome: number;
    totalAmountReceived: number;
    totalPendingReceivable: number;
    totalCropExpenses: number;
    recordedProfit: number;
  } {
    let sales = this.data.cropSales;
    let expenses = this.data.expenses.filter((e) => e.businessType === 'agriculture');

    if (cropId) {
      sales = sales.filter((s) => s.cropId === cropId);
      expenses = expenses.filter((e) => e.cropId === cropId);
    }

    const totalSalesIncome = sales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    const totalAmountReceived = sales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
    const totalPendingReceivable = sales.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
    const totalCropExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const recordedProfit = totalSalesIncome - totalCropExpenses;

    return {
      totalSalesIncome,
      totalAmountReceived,
      totalPendingReceivable,
      totalCropExpenses,
      recordedProfit,
    };
  }

  // --- Consolidated & Dashboard Statistics ---
  public getDashboardStats(): {
    todayIncome: number;
    todayExpenses: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalOutstandingUdhaar: number;
    salonTotalRevenue: number;
    agriTotalSales: number;
    netProfit: number;
  } {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonthStr = now.toISOString().slice(0, 7);

    // Salon Cash collected today: Bill amounts collected today + Udhaar payments today
    const salonBillsToday = this.data.bills.filter((b) => b.date.startsWith(todayStr));
    const salonBillPaidToday = salonBillsToday.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const udhaarPaidToday = this.data.udhaarPayments
      .filter((p) => !p.isReversal && p.date.startsWith(todayStr))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const agriSalesToday = this.data.cropSales
      .filter((s) => s.date.startsWith(todayStr))
      .reduce((sum, s) => sum + (s.amountReceived || 0), 0);

    const todayIncome = salonBillPaidToday + udhaarPaidToday + agriSalesToday;

    // Expenses today
    const todayExpenses = this.data.expenses
      .filter((e) => e.date.startsWith(todayStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Monthly Income
    const salonBillPaidMonth = this.data.bills
      .filter((b) => b.date.startsWith(currentMonthStr))
      .reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const udhaarPaidMonth = this.data.udhaarPayments
      .filter((p) => !p.isReversal && p.date.startsWith(currentMonthStr))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const agriSalesMonth = this.data.cropSales
      .filter((s) => s.date.startsWith(currentMonthStr))
      .reduce((sum, s) => sum + (s.amountReceived || 0), 0);

    const monthlyIncome = salonBillPaidMonth + udhaarPaidMonth + agriSalesMonth;

    // Monthly Expenses
    const monthlyExpenses = this.data.expenses
      .filter((e) => e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Total Outstanding Udhaar (Salon customers + Mandi buyers)
    let customerUdhaarTotal = 0;
    this.data.customers.forEach((c) => {
      customerUdhaarTotal += this.getCustomerFinancials(c.id).outstandingBalance;
    });

    const mandiUdhaarTotal = this.data.cropSales.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
    const totalOutstandingUdhaar = customerUdhaarTotal + mandiUdhaarTotal;

    // All-time Totals
    const salonTotalRevenue =
      this.data.bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0) +
      this.data.udhaarPayments.filter((p) => !p.isReversal).reduce((sum, p) => sum + (p.amount || 0), 0);
    const agriTotalSales = this.data.cropSales.reduce((sum, s) => sum + (s.totalSaleAmount || 0), 0);
    const totalExpenses = this.data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = salonTotalRevenue + agriTotalSales - totalExpenses;

    return {
      todayIncome,
      todayExpenses,
      monthlyIncome,
      monthlyExpenses,
      totalOutstandingUdhaar,
      salonTotalRevenue,
      agriTotalSales,
      netProfit,
    };
  }

  // --- Backup & Restore ---
  public exportBackup(): string {
    const backupObj = {
      exportDate: new Date().toISOString(),
      app: 'Hisab Master by Rohan',
      author: 'Rohan Nakshine (rohannakshine7@gmail.com)',
      version: 1,
      data: this.data,
    };
    return JSON.stringify(backupObj, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.data || typeof parsed.data !== 'object') {
        return { success: false, message: 'Invalid backup format. Missing root data object.' };
      }
      const importedData = parsed.data;
      if (!Array.isArray(importedData.customers) || !Array.isArray(importedData.bills)) {
        return { success: false, message: 'Invalid backup structure. Required entities not found.' };
      }

      this.data = {
        ...INITIAL_DATA,
        ...importedData,
        settings: { ...INITIAL_SETTINGS, ...(importedData.settings || {}) },
      };
      this.saveData();
      return { success: true, message: 'Database restored successfully!' };
    } catch (e) {
      return { success: false, message: 'Error parsing JSON backup file: ' + (e as Error).message };
    }
  }

  public resetToSample(): void {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveData();
  }

  public clearAll(): void {
    this.data = {
      version: 1,
      language: this.data.language,
      settings: INITIAL_SETTINGS,
      customers: [],
      salonServices: DEFAULT_SERVICES,
      bills: [],
      udhaarPayments: [],
      expenses: [],
      farms: [],
      crops: [],
      cropSales: [],
    };
    this.saveData();
  }
}

export const storage = new StorageService();
