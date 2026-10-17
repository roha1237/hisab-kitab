export type Language = 'en' | 'hi' | 'mr';

export type BusinessType = 'all' | 'salon' | 'agriculture';

export type PaymentMethod = 'cash' | 'upi' | 'other';

export type BillPaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface SalonService {
  id: string;
  nameKey: string;
  defaultName: string;
  price: number;
  category?: string;
  isCustom?: boolean;
}

export interface BillItem {
  id: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  businessType: 'salon';
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: BillPaymentStatus;
  date: string; // ISO string
  notes?: string;
  thankYouMessage?: string;
}

export interface UdhaarPayment {
  id: string;
  customerId: string;
  customerName: string;
  billId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  note?: string;
  isReversal?: boolean;
  reversalReason?: string;
}

export interface Expense {
  id: string;
  businessType: 'salon' | 'agriculture';
  category: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  farmId?: string;
  cropId?: string;
}

export interface Farm {
  id: string;
  name: string;
  area: number;
  areaUnit: 'acre' | 'hectare' | 'bigha' | 'guntha';
  location: string;
  notes?: string;
}

export interface Crop {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Annual';
  year: number;
  sowingDate?: string;
  harvestDate?: string;
  areaAllocated: number;
  areaUnit: string;
  status: 'sown' | 'growing' | 'harvested' | 'sold';
}

export interface CropSale {
  id: string;
  cropId: string;
  cropName: string;
  buyerName: string;
  buyerPhone?: string;
  quantity: number;
  unit: 'quintal' | 'kg' | 'ton' | 'bag';
  ratePerUnit: number;
  totalSaleAmount: number;
  amountReceived: number;
  outstandingBalance: number;
  date: string;
  notes?: string;
}

export interface BusinessSettings {
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonUpiId?: string;
  billPrefixSalon: string;
  developerName: string;
  developerEmail: string;
  currencySymbol: string;
  thankYouNote: string;
}

export interface AppStateData {
  version: number;
  language: Language;
  settings: BusinessSettings;
  customers: Customer[];
  salonServices: SalonService[];
  bills: Bill[];
  udhaarPayments: UdhaarPayment[];
  expenses: Expense[];
  farms: Farm[];
  crops: Crop[];
  cropSales: CropSale[];
}
