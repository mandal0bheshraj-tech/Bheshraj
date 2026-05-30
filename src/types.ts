export type UserType = 'owner' | 'manager' | 'worker';

export interface PoultryBatch {
  id: string;
  name: string;
  arrivalDate: string;
  totalChicks: number;
  breed: string;
  supplier: string;
  initialCost: number;
  daysActive: number;
  status: 'active' | 'sold';
  dailyLogs: DailyPoultryEntry[];
  sales: PoultrySale[];
}

export interface DailyPoultryEntry {
  id: string;
  date: string;
  feedUsedKg: number;
  waterUsageLiters: number;
  medicineUsed: string;
  mortalityCount: number;
  averageWeightG: number;
  temperatureC: number;
  vaccinated: boolean;
  vaccineName?: string;
}

export interface PoultrySale {
  id: string;
  date: string;
  quantitySold: number;
  totalWeightKg: number;
  pricePerKg: number;
  buyerName: string;
  buyerPhone: string;
  totalRevenue: number;
}

export interface FishPond {
  id: string;
  pondNumber: string;
  pondSizeSqFt: number;
  fishType: string;
  stockingDate: string;
  quantityStocked: number;
  status: 'active' | 'harvested';
  waterLogs: WaterQualityLog[];
  harvests: FishHarvest[];
}

export interface WaterQualityLog {
  id: string;
  date: string;
  phLevel: number;
  temperatureC: number;
  oxygenLevelDOmgl: number;
  waterChangeDone: boolean;
  feedQuantityKg: number;
  mortalityCount: number;
}

export interface FishHarvest {
  id: string;
  date: string;
  weightHarvestedKg: number;
  pricePerKg: number;
  totalRevenue: number;
  buyerName: string;
  buyerPhone: string;
}

export interface GoatRecord {
  id: string;
  tagNo: string;
  breed: string;
  gender: 'Male' | 'Female';
  ageMonths: number;
  weightKg: number;
  healthStatus: 'Healthy' | 'Sick' | 'Under Treatment';
  photoUrl: string;
  matingDate?: string;
  pregnancyStatus?: 'Not Mated' | 'Pregnant' | 'Expected Delivery' | 'Unknown';
  expectedDeliveryDate?: string;
  kidsBornCount?: number;
  vaccines: string[];
  dewormingDates: string[];
  illnessHistory: { date: string; illness: string; medicine: string }[];
}

export interface PigeonRecord {
  id: string;
  breed: string;
  pairId: string;
  eggProduction: number;
  hatchRatePercent: number;
  healthStatus: 'Healthy' | 'Sick' | 'Recovered';
  eggsLaidCount: number;
  hatchDate?: string;
  babyPigeonsCount: number;
  vaccines: string[];
}

export interface InventoryItem {
  id: string;
  category: 'feed' | 'medicine' | 'equipment';
  name: string;
  currentStock: number;
  unit: string;
  expiryDate?: string;
  supplier: string;
  purchaseCost: number;
  reorderPoint: number;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: 'poultry' | 'fish' | 'goat' | 'pigeon' | 'labor' | 'feed' | 'medicine' | 'electricity' | 'transport' | 'other';
  description: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phoneNumber: string;
  salary: number;
  assignedTasks: string[];
  attendance: WorkerAttendance[];
  role: 'Manager' | 'Worker';
}

export interface WorkerAttendance {
  date: string;
  status: 'Present' | 'Absent' | 'On Leave';
  checkIn?: string;
  checkOut?: string;
}

export interface FarmReminder {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'poultry' | 'fish' | 'goat' | 'pigeon' | 'general' | 'inventory';
  type: 'vaccination' | 'feeding' | 'medicine' | 'water_change' | 'egg_collection' | 'sales_payment' | 'inventory_low';
  completed: boolean;
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  sector: 'poultry' | 'fish' | 'goat' | 'pigeon';
  productOrdered: string;
  quantityOrdered: string; // e.g., "50 kg", "2 Goats"
  totalCost: number;
  paymentStatus: 'Paid' | 'Pending';
  deliveryStatus: 'Shipped' | 'Pending' | 'Delivered';
  orderDate: string;
}

export interface LinkedBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  linkedDate: string;
  verified: boolean;
  balance: number;
}

export interface FarmState {
  poultryBatches: PoultryBatch[];
  fishPonds: FishPond[];
  goats: GoatRecord[];
  pigeons: PigeonRecord[];
  inventory: InventoryItem[];
  finances: FinancialRecord[];
  workers: WorkerProfile[];
  reminders: FarmReminder[];
  orders: CustomerOrder[];
  currentUserType: UserType;
  currentLanguage: 'en' | 'ne';
  linkedBanks?: LinkedBankAccount[];
}
