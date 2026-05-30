import { FarmState } from '../types';

export const INITIAL_FARM_STATE: FarmState = {
  poultryBatches: [
    {
      id: "p-batch-1",
      name: "Batch Cobb-500-A",
      arrivalDate: "2026-05-01",
      totalChicks: 1500,
      breed: "Cobb 500",
      supplier: "Siddharth Hatchery, Butwal",
      initialCost: 120000, // Rs. 1,20,000
      daysActive: 28,
      status: "active",
      dailyLogs: [
        {
          id: "p-log-1",
          date: "2026-05-15",
          feedUsedKg: 120,
          waterUsageLiters: 450,
          medicineUsed: "Vitamin B-Complex",
          mortalityCount: 2,
          averageWeightG: 650,
          temperatureC: 31,
          vaccinated: true,
          vaccineName: "Newcastle (F1) Vaccine"
        },
        {
          id: "p-log-2",
          date: "2026-05-22",
          feedUsedKg: 155,
          waterUsageLiters: 580,
          medicineUsed: "None",
          mortalityCount: 1,
          averageWeightG: 1250,
          temperatureC: 29,
          vaccinated: false
        },
        {
          id: "p-log-3",
          date: "2026-05-28",
          feedUsedKg: 180,
          waterUsageLiters: 650,
          medicineUsed: "Calcium Boost",
          mortalityCount: 3,
          averageWeightG: 1780,
          temperatureC: 28,
          vaccinated: true,
          vaccineName: "Gumboro Booster"
        }
      ],
      sales: []
    },
    {
      id: "p-batch-2",
      name: "Cobb-Spring-Batch",
      arrivalDate: "2026-03-10",
      totalChicks: 1000,
      breed: "Cobb 500",
      supplier: "Valley Poultry, Kathmandu",
      initialCost: 80000,
      daysActive: 42,
      status: "sold",
      dailyLogs: [],
      sales: [
        {
          id: "p-sale-1",
          date: "2026-04-22",
          quantitySold: 980,
          totalWeightKg: 2156,
          pricePerKg: 310, // Rs. 310 per kg
          buyerName: "Golden Fresh Meat Suppliers, Sunsari",
          buyerPhone: "+977-9855012345",
          totalRevenue: 668360 // Rs. 6,68,360
        }
      ]
    }
  ],
  fishPonds: [
    {
      id: "pond-1",
      pondNumber: "Pond #1",
      pondSizeSqFt: 3500,
      fishType: "Tilapia (तिलापिया)",
      stockingDate: "2026-02-15",
      quantityStocked: 2500,
      status: "active",
      waterLogs: [
        {
          id: "w-log-1",
          date: "2026-05-20",
          phLevel: 7.2,
          temperatureC: 24,
          oxygenLevelDOmgl: 6.5,
          waterChangeDone: true,
          feedQuantityKg: 15,
          mortalityCount: 4
        },
        {
          id: "w-log-2",
          date: "2026-05-28",
          phLevel: 7.4,
          temperatureC: 25,
          oxygenLevelDOmgl: 5.8,
          waterChangeDone: false,
          feedQuantityKg: 18,
          mortalityCount: 1
        }
      ],
      harvests: []
    },
    {
      id: "pond-2",
      pondNumber: "Pond #2 - Breeding",
      pondSizeSqFt: 2000,
      fishType: "Carp (रहु / नैनी)",
      stockingDate: "2025-11-10",
      quantityStocked: 1500,
      status: "harvested",
      waterLogs: [],
      harvests: [
        {
          id: "harv-1",
          date: "2026-05-02",
          weightHarvestedKg: 920,
          pricePerKg: 380, // Rs. 380 per kg
          totalRevenue: 349600, // Rs. 3,49,600
          buyerName: "Sunsari Fish Wholesalers",
          buyerPhone: "+977-9845098765"
        }
      ]
    }
  ],
  goats: [
    {
      id: "goat-1",
      tagNo: "SG-Boer-001",
      breed: "Pure Boer (बोयर)",
      gender: "Female",
      ageMonths: 24,
      weightKg: 52,
      healthStatus: "Healthy",
      photoUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=200",
      matingDate: "2026-01-10",
      pregnancyStatus: "Pregnant",
      expectedDeliveryDate: "2026-06-10",
      kidsBornCount: 0,
      vaccines: ["PPR Vaccine", "FMD Vaccine"],
      dewormingDates: ["2026-03-15", "2026-05-10"],
      illnessHistory: []
    },
    {
      id: "goat-2",
      tagNo: "SG-Boer-Buck-02",
      breed: "Pure Boer Stud (बोयर बोका)",
      gender: "Male",
      ageMonths: 18,
      weightKg: 75,
      healthStatus: "Healthy",
      photoUrl: "https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&q=80&w=200",
      matingDate: undefined,
      pregnancyStatus: "Not Mated",
      vaccines: ["PPR Vaccine", "FMD Vaccine", "ET Vaccine"],
      dewormingDates: ["2026-04-01"],
      illnessHistory: [
        {
          date: "2026-04-12",
          illness: "Minor hoof infection",
          medicine: "Zinc sulphate wash + Terramycin spray"
        }
      ]
    },
    {
      id: "goat-3",
      tagNo: "SG-Khari-098",
      breed: "Khari (स्थानीय खरी)",
      gender: "Female",
      ageMonths: 14,
      weightKg: 28,
      healthStatus: "Under Treatment",
      photoUrl: "https://images.unsplash.com/photo-1543431057-040285514f09?auto=format&fit=crop&q=80&w=200",
      matingDate: "2026-04-20",
      pregnancyStatus: "Pregnant",
      expectedDeliveryDate: "2026-09-15",
      kidsBornCount: 0,
      vaccines: ["PPR Vaccine"],
      dewormingDates: ["2026-04-20"],
      illnessHistory: [
        {
          date: "2026-05-25",
          illness: "Mild fever & runny nose",
          medicine: "Enrofloxacin injection"
        }
      ]
    }
  ],
  pigeons: [
    {
      id: "pig-1",
      breed: "Fantail (लक्का)",
      pairId: "Pair-F01",
      eggProduction: 24,
      hatchRatePercent: 90,
      healthStatus: "Healthy",
      eggsLaidCount: 2,
      hatchDate: "2026-06-05",
      babyPigeonsCount: 3,
      vaccines: ["Pox Vaccine"]
    },
    {
      id: "pig-2",
      breed: "Gola / Local (गोला)",
      pairId: "Pair-G12",
      eggProduction: 36,
      hatchRatePercent: 80,
      healthStatus: "Healthy",
      eggsLaidCount: 4,
      hatchDate: "2026-05-28",
      babyPigeonsCount: 6,
      vaccines: ["Pox Vaccine"]
    }
  ],
  inventory: [
    {
      id: "inv-1",
      category: "feed",
      name: "Broiler Starter Feed (B1)",
      currentStock: 45, // sacks
      unit: "Sacks (50kg)",
      supplier: "Nimbuwa Feed Mills, Nawalparasi",
      purchaseCost: 3400, // Rs. 3,400 per sack
      reorderPoint: 15
    },
    {
      id: "inv-2",
      category: "feed",
      name: "Floating Fish Feed (Premium)",
      currentStock: 12, // sacks
      unit: "Sacks (25kg)",
      supplier: "Siddhartha Feed, Bhairahawa",
      purchaseCost: 2600,
      reorderPoint: 15 // triggered alert!
    },
    {
      id: "inv-3",
      category: "medicine",
      name: "Deworming Tablets (Albendazole)",
      currentStock: 120, // bolus
      unit: "Bolus",
      expiryDate: "2026-12-30",
      supplier: "Sano Agro-Vet, Sunsari",
      purchaseCost: 35,
      reorderPoint: 20
    },
    {
      id: "inv-4",
      category: "medicine",
      name: "PPR Goat Vaccine (100 doses)",
      currentStock: 2, // vials
      unit: "Vials",
      expiryDate: "2026-08-15",
      supplier: "AgroVet Hub, Sunsari",
      purchaseCost: 650,
      reorderPoint: 1
    },
    {
      id: "inv-5",
      category: "equipment",
      name: "Automatic Poultry Feeders",
      currentStock: 60,
      unit: "Pieces",
      supplier: "Nepal Agritech, Kathmandu",
      purchaseCost: 450,
      reorderPoint: 5
    }
  ],
  finances: [
    {
      id: "tr-1",
      date: "2026-05-01",
      type: "expense",
      amount: 45000,
      category: "feed",
      description: "Purchased 15 sacks of Broiler Starter Feed"
    },
    {
      id: "tr-2",
      date: "2026-05-02",
      type: "income",
      amount: 349600,
      category: "fish",
      description: "Pond #2 Carp harvest sale - 920 kg sold to Sunsari Fish Wholesalers"
    },
    {
      id: "tr-3",
      date: "2026-05-10",
      type: "expense",
      amount: 15000,
      category: "labor",
      description: "Weekly labor advance payment for part-time workers"
    },
    {
      id: "tr-4",
      date: "2026-05-22",
      type: "income",
      amount: 45000,
      category: "goat",
      description: "Sold Boer cross goat buck to Ram Bahadur Karki"
    },
    {
      id: "tr-5",
      date: "2026-05-24",
      type: "expense",
      amount: 6200,
      category: "electricity",
      description: "Pond aeration pump & broiler coop electricity bill for April"
    },
    {
      id: "tr-6",
      date: "2026-05-26",
      type: "income",
      amount: 12000,
      category: "pigeon",
      description: "Sold 4 pairs of premium Fantail squabs to Hetauda Pigeon Enthusiasts"
    }
  ],
  workers: [
    {
      id: "wrk-1",
      name: "Ramesh Thapa",
      phoneNumber: "+977-9845123456",
      salary: 22000,
      assignedTasks: ["Feed Broiler Batch Cobb-500-A", "Vaccinate Goats SG-Boer-001"],
      attendance: [
        { date: "2026-05-28", status: "Present", checkIn: "06:30 AM", checkOut: "05:30 PM" },
        { date: "2026-05-29", status: "Present", checkIn: "06:45 AM", checkOut: "04:30 PM" }
      ],
      role: "Manager"
    },
    {
      id: "wrk-2",
      name: "Sunita Shrestha",
      phoneNumber: "+977-9812987654",
      salary: 16000,
      assignedTasks: ["Clean Fish Pond #1 water filters", "Log Daily Water pH"],
      attendance: [
        { date: "2026-05-28", status: "Present", checkIn: "07:00 AM", checkOut: "05:00 PM" },
        { date: "2026-05-29", status: "Present", checkIn: "07:05 AM", checkOut: "05:00 PM" }
      ],
      role: "Worker"
    },
    {
      id: "wrk-3",
      name: "Hari Magar",
      phoneNumber: "+977-9803112233",
      salary: 15000,
      assignedTasks: ["Clean Poultry Coop B-1", "Pigeon Egg Collection"],
      attendance: [
        { date: "2026-05-28", status: "Absent" },
        { date: "2026-05-29", status: "On Leave" }
      ],
      role: "Worker"
    }
  ],
  reminders: [
    {
      id: "rem-1",
      title: "Gumboro Booster Vaccine for Batch Cobb-500-A",
      date: "2026-05-30",
      time: "08:00 AM",
      category: "poultry",
      type: "vaccination",
      completed: false,
      notes: "Ensure water line is clean and vaccine is stored in icebox before mixing."
    },
    {
      id: "rem-2",
      title: "Pond #1 Partial Water Replacement",
      date: "2026-05-31",
      time: "03:00 PM",
      category: "fish",
      type: "water_change",
      completed: false,
      notes: "Replace 20% water from bottom drain to control high ammonia levels."
    },
    {
      id: "rem-3",
      title: "Deworming vaccination for Boer Buck",
      date: "2026-06-01",
      time: "09:30 AM",
      category: "goat",
      type: "medicine",
      completed: false,
      notes: "Use Dewormer concentrate bolus mixed with grass feed."
    },
    {
      id: "rem-4",
      title: "Low stock alert: Float Fish Feed sacks low",
      date: "2026-05-29",
      time: "10:00 AM",
      category: "inventory",
      type: "inventory_low",
      completed: false,
      notes: "Order 30 sacks of Floating feed soon to avoid growth stalling."
    }
  ],
  orders: [
    {
      id: "ord-1",
      customerName: "Kishor Khadka (New Gorkha Restaurant)",
      phoneNumber: "+977-9845011223",
      address: "Inarwa, Sunsari",
      sector: "poultry",
      productOrdered: "Live Broiler Chickens",
      quantityOrdered: "350 kg",
      totalCost: 108500, // Rs 1,08,500
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
      orderDate: "2026-05-28"
    },
    {
      id: "ord-2",
      customerName: "Radha Devi Bhandari",
      phoneNumber: "+977-9856033445",
      address: "Itahari, Sunsari",
      sector: "goat",
      productOrdered: "Boer Cross Goat Buck (Live)",
      quantityOrdered: "1 Goat (35kg)",
      totalCost: 20000,
      paymentStatus: "Paid",
      deliveryStatus: "Delivered",
      orderDate: "2026-05-25"
    }
  ],
  currentUserType: "owner",
  currentLanguage: "en"
};

export function loadFarmState(): FarmState {
  try {
    const data = localStorage.getItem('saroja_farm_state_v1');
    if (data) {
      const parsed = JSON.parse(data);
      // Fallback for role or lang if they were not stored properly
      if (!parsed.currentUserType) parsed.currentUserType = 'owner';
      if (!parsed.currentLanguage) parsed.currentLanguage = 'en';
      return parsed;
    }
  } catch (e) {
    console.error("Local storage read error, defaulting:", e);
  }
  return INITIAL_FARM_STATE;
}

export function saveFarmState(state: FarmState) {
  try {
    localStorage.setItem('saroja_farm_state_v1', JSON.stringify(state));
  } catch (e) {
    console.error("Local storage writing failed:", e);
  }
}
