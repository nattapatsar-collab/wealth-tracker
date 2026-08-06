// app.js
// Main controller for Wealth Tracker

// Safe Lucide mockup in case of CDN block/offline mode
if (typeof lucide === "undefined") {
  window.lucide = {
    createIcons: () => console.warn("Lucide icons failed to load.")
  };
}

// --- CONSTANTS & DATA SEEDING ---
const SEED_TRANSACTIONS = [
  { id: "06229d993", date: "5/17/2026", type: "Income", platform: "TTB", total: 210.00, category: "รายได้จากการทำงาน", location: "Sita Villa", remark: "" },
  { id: "e44cf993", date: "5/30/2026", type: "Income", platform: "TTB", total: 420.00, category: "รายได้จากการทำงาน", location: "Sita Villa", remark: "" },
  { id: "b5a6da02", date: "5/31/2026", type: "Income", platform: "TTB", total: 420.00, category: "รายได้จากการทำงาน", location: "Sita Villa", remark: "Villa Commission" },
  { id: "91734688", date: "6/1/2026", type: "Income", platform: "TTB", total: 210.00, category: "รายได้จากการทำงาน", location: "Sita Villa", remark: "Villa Commission" },
  { id: "9922ae79", date: "6/1/2026", type: "Expense", platform: "Make", total: 70.00, category: "อาหารและเครื่องดื่ม", location: "ร้านตามสั่งตลาดพนม", remark: "" },
  { id: "8fe25043", date: "6/1/2026", type: "Expense", platform: "Make", total: 50.00, category: "อาหารและเครื่องดื่ม", location: "ร้านผลไม้พนม", remark: "" },
  { id: "a9684598", date: "6/1/2026", type: "Expense", platform: "Cr. So Fast", total: 64.30, category: "ความบันเทิงและสื่อดิจิทัล", location: "STEAM", remark: "" },
  { id: "266456b8", date: "6/2/2026", type: "Expense", platform: "Tiktok Paylater", total: 247.80, category: "อาหารและเครื่องดื่ม", location: "Tiktok", remark: "" }
];

// --- APP GLOBAL STATE ---
let transactions = [];
let filteredTransactions = [];
let currentPage = 1;
let itemsPerPage = 25;
let isApiMode = false;
let monthlyChart = null;
let categoryChart = null;
let locationChart = null;
let chartMonthlyData = {};
let activeRuleFilter = "";     // Interactive dashboard 50/30/20 rule filter
let activeBudgetTab = "active"; // "active", "all", "needs", "wants"

// --- OCR LEARNING DICTIONARY GLOBAL STATE ---
let ocrCorrections = {
  merchants: {},
  categories: {},
  notes: {}
};
window.lastOcrAttempt = null;

const THAI_OCR_PRESETS = {
  merchants: {
    // Convenience Stores & Supermarkets
    "7-eleven": "7-Eleven",
    "7 eleven": "7-Eleven",
    "เซเว่น อีเลฟเว่น": "7-Eleven",
    "เซเว่น": "7-Eleven",
    "cp all": "7-Eleven",
    "cpall": "7-Eleven",
    "lotus": "Lotus's",
    "lotus's": "Lotus's",
    "โลตัส": "Lotus's",
    "เอก-ชัย": "Lotus's",
    "big c": "Big C",
    "bigc": "Big C",
    "บิ๊กซี": "Big C",
    "cj express": "CJ Express",
    "cj supermark": "CJ Express",
    "ซีเจ": "CJ Express",
    "tops": "Tops Supermarket",
    "ท็อปส์": "Tops Supermarket",
    "makro": "Makro",
    "แม็คโคร": "Makro",
    "cpaxtra": "Makro",
    "cp axtra": "Makro",
    "family mart": "FamilyMart",
    "familymart": "FamilyMart",
    "แฟมิลี่มาร์ท": "FamilyMart",
    "lawson": "Lawson 108",
    "lawson 108": "Lawson 108",
    
    // Food & Beverage
    "cafe amazon": "Café Amazon",
    "คาเฟ่ อเมซอน": "Café Amazon",
    "amazon": "Café Amazon",
    "starbucks": "Starbucks",
    "สตาร์บัคส์": "Starbucks",
    "ชาบู ชาบู นางใน": "ชาบู ชาบู นางใน",
    "นางใน": "ชาบู ชาบู นางใน",
    "สุกี้ตี๋น้อย": "สุกี้ตี๋น้อย",
    "suki teenoi": "สุกี้ตี๋น้อย",
    "ตี๋น้อย": "สุกี้ตี๋น้อย",
    "kfc": "KFC",
    "เคเอฟซี": "KFC",
    "mcdonald's": "McDonald's",
    "mcdonalds": "McDonald's",
    "mcdonald": "McDonald's",
    "แมคโดนัลด์": "McDonald's",
    "swensen's": "Swensen's",
    "swensens": "Swensen's",
    "สเวนเซ่นส์": "Swensen's",
    "dairy queen": "Dairy Queen",
    "แดรี่ควีน": "Dairy Queen",
    "pizza hut": "Pizza Hut",
    "the pizza company": "The Pizza Company",
    "shabushi": "Shabushi",
    "ชาบูชิ": "Shabushi",
    "bar b q plaza": "Bar B Q Plaza",
    "บาร์บีคิวพลาซ่า": "Bar B Q Plaza",
    "บาบีก้อน": "Bar B Q Plaza",
    "bonchon": "Bonchon",
    "บอนชอน": "Bonchon",
    "yayoi": "Yayoi",
    "ยาโยอิ": "Yayoi",
    "hachiban": "Hachiban Ramen",
    "ฮะจิบัง": "Hachiban Ramen",
    
    // E-Commerce & Shopping
    "shopee": "Shopee",
    "shopeepay": "ShopeePay",
    "lazada": "Lazada",
    "ลาซาด้า": "Lazada",
    "tiktok shop": "Tiktok Shop",
    "tiktokshop": "Tiktok Shop",
    
    // Transport & Travel
    "grab": "Grab",
    "grabtaxi": "Grab",
    "grabcar": "Grab",
    "grabfood": "Grab",
    "bolt": "Bolt",
    "line man": "Line Man",
    "lineman": "Line Man",
    "foodpanda": "Foodpanda",
    "bts": "BTS Skytrain",
    "mrt": "MRT Subway",
    "การทางพิเศษ": "ค่าทางด่วน",
    "ทางด่วน": "ค่าทางด่วน",
    "ปตท": "ปตท (PTT)",
    "ptt": "ปตท (PTT)",
    "bangchak": "บางจาก (Bangchak)",
    "บางจาก": "บางจาก (Bangchak)",
    "shell": "เชลล์ (Shell)",
    "caltex": "คาลเท็กซ์ (Caltex)",
    
    // Delivery & Post
    "flash express": "Flash Express",
    "flashespress": "Flash Express",
    "kerry": "Kerry Express",
    "j&t": "J&T Express",
    "ไปรษณีย์ไทย": "ไปรษณีย์ไทย",
    "thailand post": "ไปรษณีย์ไทย",
    
    // Telecom
    "ais": "AIS",
    "advanced info": "AIS",
    "true": "True",
    "truemove": "True",
    "dtac": "dtac"
  },
  categories: {
    // Food & Beverage
    "7-eleven": "อาหารและเครื่องดื่ม",
    "7 eleven": "อาหารและเครื่องดื่ม",
    "เซเว่น อีเลฟเว่น": "อาหารและเครื่องดื่ม",
    "เซเว่น": "อาหารและเครื่องดื่ม",
    "cp all": "อาหารและเครื่องดื่ม",
    "cpall": "อาหารและเครื่องดื่ม",
    "cafe amazon": "อาหารและเครื่องดื่ม",
    "คาเฟ่ อเมซอน": "อาหารและเครื่องดื่ม",
    "amazon": "อาหารและเครื่องดื่ม",
    "starbucks": "อาหารและเครื่องดื่ม",
    "สตาร์บัคส์": "อาหารและเครื่องดื่ม",
    "ชาบู ชาบู นางใน": "อาหารและเครื่องดื่ม",
    "นางใน": "อาหารและเครื่องดื่ม",
    "สุกี้ตี๋น้อย": "อาหารและเครื่องดื่ม",
    "suki teenoi": "อาหารและเครื่องดื่ม",
    "ตี๋น้อย": "อาหารและเครื่องดื่ม",
    "kfc": "อาหารและเครื่องดื่ม",
    "เคเอฟซี": "อาหารและเครื่องดื่ม",
    "mcdonald's": "อาหารและเครื่องดื่ม",
    "mcdonalds": "อาหารและเครื่องดื่ม",
    "mcdonald": "อาหารและเครื่องดื่ม",
    "แมคโดนัลด์": "อาหารและเครื่องดื่ม",
    "swensen's": "อาหารและเครื่องดื่ม",
    "swensens": "อาหารและเครื่องดื่ม",
    "สเวนเซ่นส์": "อาหารและเครื่องดื่ม",
    "dairy queen": "อาหารและเครื่องดื่ม",
    "แดรี่ควีน": "อาหารและเครื่องดื่ม",
    "pizza hut": "อาหารและเครื่องดื่ม",
    "the pizza company": "อาหารและเครื่องดื่ม",
    "shabushi": "อาหารและเครื่องดื่ม",
    "ชาบูชิ": "อาหารและเครื่องดื่ม",
    "bar b q plaza": "อาหารและเครื่องดื่ม",
    "บาร์บีคิวพลาซ่า": "อาหารและเครื่องดื่ม",
    "บาบีก้อน": "อาหารและเครื่องดื่ม",
    "bonchon": "อาหารและเครื่องดื่ม",
    "บอนชอน": "อาหารและเครื่องดื่ม",
    "yayoi": "อาหารและเครื่องดื่ม",
    "ยาโยอิ": "อาหารและเครื่องดื่ม",
    "hachiban": "อาหารและเครื่องดื่ม",
    "ฮะจิบัง": "อาหารและเครื่องดื่ม",
    "foodpanda": "อาหารและเครื่องดื่ม",
    "grabfood": "อาหารและเครื่องดื่ม",
    "lineman": "อาหารและเครื่องดื่ม",
    "line man": "อาหารและเครื่องดื่ม",
    
    // Transport & Vehicles
    "bts": "ค่าเดินทางและยานพาหนะ",
    "mrt": "ค่าเดินทางและยานพาหนะ",
    "grab": "ค่าเดินทางและยานพาหนะ",
    "grabtaxi": "ค่าเดินทางและยานพาหนะ",
    "grabcar": "ค่าเดินทางและยานพาหนะ",
    "bolt": "ค่าเดินทางและยานพาหนะ",
    "การทางพิเศษ": "ค่าเดินทางและยานพาหนะ",
    "ทางด่วน": "ค่าเดินทางและยานพาหนะ",
    "ปตท": "ค่าเดินทางและยานพาหนะ",
    "ptt": "ค่าเดินทางและยานพาหนะ",
    "bangchak": "ค่าเดินทางและยานพาหนะ",
    "บางจาก": "ค่าเดินทางและยานพาหนะ",
    "shell": "ค่าเดินทางและยานพาหนะ",
    "caltex": "ค่าเดินทางและยานพาหนะ",
    
    // Telecom
    "ais": "ค่าบริการเครือข่ายสื่อสาร",
    "advanced info": "ค่าบริการเครือข่ายสื่อสาร",
    "true": "ค่าบริการเครือข่ายสื่อสาร",
    "truemove": "ค่าบริการเครือข่ายสื่อสาร",
    "dtac": "ค่าบริการเครือข่ายสื่อสาร",
    
    // Shopping / Fashion
    "shopee": "สินค้าอุปโภคและแฟชั่น",
    "shopeepay": "สินค้าอุปโภคและแฟชั่น",
    "lazada": "สินค้าอุปโภคและแฟชั่น",
    "ลาซาด้า": "สินค้าอุปโภคและแฟชั่น",
    "tiktok shop": "สินค้าอุปโภคและแฟชั่น",
    "tiktokshop": "สินค้าอุปโภคและแฟชั่น",
    "lotus": "สินค้าอุปโภคและแฟชั่น",
    "lotus's": "สินค้าอุปโภคและแฟชั่น",
    "โลตัส": "สินค้าอุปโภคและแฟชั่น",
    "big c": "สินค้าอุปโภคและแฟชั่น",
    "บิ๊กซี": "สินค้าอุปโภคและแฟชั่น",
    "cj express": "สินค้าอุปโภคและแฟชั่น",
    "ซีเจ": "สินค้าอุปโภคและแฟชั่น",
    "tops": "สินค้าอุปโภคและแฟชั่น",
    "ท็อปส์": "สินค้าอุปโภคและแฟชั่น",
    "makro": "สินค้าอุปโภคและแฟชั่น",
    "แม็คโคร": "สินค้าอุปโภคและแฟชั่น",
    
    // Delivery & Post
    "flash express": "บริการจัดส่งและบรรจุภัณฑ์",
    "flashespress": "บริการจัดส่งและบรรจุภัณฑ์",
    "kerry": "บริการจัดส่งและบรรจุภัณฑ์",
    "j&t": "บริการจัดส่งและบรรจุภัณฑ์",
    "ไปรษณีย์ไทย": "บริการจัดส่งและบรรจุภัณฑ์",
    "thailand post": "บริการจัดส่งและบรรจุภัณฑ์"
  }
};

// Helper to determine rule group of a category dynamically
function getCategoryRuleGroup(catName) {
  const budget = BUDGET_LIMITS.find(b => b.name === catName);
  if (budget) return budget.ruleGroup;
  
  // Fallback defaults if category is not in the custom budget limits list
  if (catName === "การลงทุนและเงินออม") return "Savings";
  const needsCategories = [
    "อาหารและเครื่องดื่ม", 
    "ที่พักและสาธารณูปโภค", 
    "ค่าบริการเครือข่ายสื่อสาร", 
    "ค่าเดินทางและยานพาหนะ", 
    "สุขภาพและเวชภัณฑ์", 
    "สุขภาพและอนามัย", 
    "การศึกษาและพัฒนาตนเอง", 
    "ค่าใช้จ่ายสัตว์เลี้ยง", 
    "ต้นทุนและค่าใช้จ่ายทางธุรกิจ", 
    "ภาระหนี้สิน"
  ];
  const wantsCategories = [
    "การออกกำลังกายและสันทนาการ", 
    "ความบันเทิงและสื่อดิจิทัล", 
    "ช้อปปิ้งและของใช้", 
    "สินค้าอุปโภคและแฟชั่น", 
    "การเดินทางท่องเที่ยว", 
    "บริการจัดส่งและบรรจุภัณฑ์", 
    "การทำบุญและบริจาค", 
    "เบ็ดเตล็ดและอื่น ๆ", 
    "หมวดหมู่อื่น ๆ"
  ];
  if (needsCategories.includes(catName)) return "Needs";
  if (wantsCategories.includes(catName)) return "Wants";
  return "Wants"; // Default fallback
}


// Savings Goal Global State (Multiple Goals Support)
function loadSavingsGoals() {
  const defaultGoals = [
    {
      id: "sg-default-1",
      name: "ท่องเที่ยวต่างประเทศ",
      target: 25000,
      current: 0,
      targetMonth: "2026-10",
      allocationPercent: 100
    }
  ];
  
  const stored = localStorage.getItem("wt_savings_goals");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored savings goals", e);
    }
  }
  
  // Migration logic from old wt_savings_goal (single goal)
  const oldStored = localStorage.getItem("wt_savings_goal");
  if (oldStored) {
    try {
      const oldGoal = JSON.parse(oldStored);
      const migrated = [{
        id: "sg-" + generateId(),
        name: oldGoal.name || "ท่องเที่ยวต่างประเทศ",
        target: parseFloat(oldGoal.target) || 25000,
        current: parseFloat(oldGoal.current) || 0,
        targetMonth: oldGoal.targetMonth || "2026-10",
        allocationPercent: parseInt(oldGoal.allocationPercent) || 100
      }];
      localStorage.setItem("wt_savings_goals", JSON.stringify(migrated));
      localStorage.removeItem("wt_savings_goal");
      return migrated;
    } catch (e) {
      console.error("Error migrating old savings goal", e);
    }
  }
  
  return defaultGoals;
}
let savingsGoals = loadSavingsGoals();

function saveSavingsGoals() {
  localStorage.setItem("wt_savings_goals", JSON.stringify(savingsGoals));
}

// Debts & Liabilities Global State
function loadDebts() {
  const defaultDebts = [
    { id: "debt-ttb", name: "บัตรเครดิต TTB", balance: 10000.00, payment: 2000.00 },
    { id: "debt-house", name: "ผ่อนบ้าน", balance: 2500000.00, payment: 12000.00 }
  ];
  const stored = localStorage.getItem("wt_debts");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored debts", e);
    }
  }
  return defaultDebts;
}
let debts = loadDebts();

function saveDebts() {
  localStorage.setItem("wt_debts", JSON.stringify(debts));
}



// --- UTILITY FUNCTIONS ---

// Formats a Date object to Gregorian YYYY-MM-DD
function toGregorianISODate(date) {
  const y = date.getFullYear();
  const GregorianYear = y > 2400 ? y - 543 : y;
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${GregorianYear}-${m}-${d}`;
}

// Calculates calendar months difference between current date and target month string YYYY-MM
function calculateRemainingMonths(targetMonthStr) {
  if (!targetMonthStr) return 1;
  const [targetYear, targetMonth] = targetMonthStr.split("-").map(Number);
  
  const now = new Date();
  let currentYear = now.getFullYear();
  if (currentYear > 2400) currentYear -= 543;
  const currentMonth = now.getMonth() + 1;
  
  const yearDiff = targetYear - currentYear;
  const monthDiff = targetMonth - currentMonth;
  const remaining = yearDiff * 12 + monthDiff;
  
  return remaining > 0 ? remaining : 1;
}

// Parses mixed format dates dynamically into ISO format YYYY-MM-DD
function parseCustomDate(dateStr) {
  if (!dateStr) return "";
  dateStr = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return dateStr;
  
  let p1 = parseInt(parts[0], 10);
  let p2 = parseInt(parts[1], 10);
  let yr = parseInt(parts[2], 10);
  if (yr < 100) yr += 2000;
  if (yr > 2400) yr -= 543; // Enforce Gregorian calendar year conversion from Buddhist Era (BE)
  
  let day, month;
  if (p1 > 12) {
    day = p1;
    month = p2;
  } else if (p2 > 12) {
    day = p2;
    month = p1;
  } else {
    // Both parts are <= 12
    // If we're looking at 2026:
    // May records have 5 (either p1 or p2)
    // June records have 6 (either p1 or p2)
    if (p2 === 5) {
      month = 5;
      day = p1;
    } else if (p1 === 5) {
      month = 5;
      day = p2;
    } else if (p1 === 6) {
      month = 6;
      day = p2;
    } else if (p2 === 6) {
      month = 6;
      day = p1;
    } else {
      // Fallback
      day = p1;
      month = p2;
    }
  }
  
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yr}-${mm}-${dd}`;
}

// Formats number into Thai Baht currency presentation
function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB"
  }).format(value);
}

// Generates a short random ID
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Theme management (Default to pure light mode)
function initTheme() {
  document.documentElement.setAttribute("data-theme", "light");
  localStorage.setItem("wt_theme", "light");
  updateThemeIcon();
}

function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const themeBtn = document.getElementById("btn-toggle-theme");
  if (currentTheme === "light") {
    themeBtn.innerHTML = '<i data-lucide="moon"></i>';
  } else {
    themeBtn.innerHTML = '<i data-lucide="sun"></i>';
  }
  lucide.createIcons();
}

// Show popup success or error banner
function showStatus(text, type = "success") {
  const banner = document.getElementById("status-banner");
  const bannerText = document.getElementById("status-text");
  const bannerIcon = document.getElementById("status-icon");
  
  banner.className = `status-banner ${type}`;
  bannerText.innerText = text;
  
  // Set appropriate icon
  let iconName = "info";
  if (type === "success") iconName = "check-circle";
  if (type === "error") iconName = "alert-triangle";
  if (type === "warning") iconName = "alert-circle";
  
  bannerIcon.setAttribute("data-lucide", iconName);
  lucide.createIcons();
  
  banner.style.display = "flex";
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    banner.style.display = "none";
  }, 5000);
}

// --- SLIP OCR AUTO-FILL ENGINE (TESSERACT.JS) ---

// Normalize Thai OCR characters that are commonly misread by Tesseract (e.g. SARA AM variations)
function normalizeThaiOcrText(text) {
  if (!text) return "";
  // 1. Normalize SARA AM (ํา [U+0E34 + U+0E4D] -> ำ [U+0E35])
  let normalized = text.replace(/\u0E34\u0E4D/g, '\u0E35');
  normalized = normalized.replace(/ํา/g, 'ำ');
  // 2. Clean up common visual symbols that are artifacts
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Remove zero-width spaces
  return normalized;
}

// Edit Distance (Levenshtein Distance)
function editDistance(s1, s2) {
  s1 = (s1 || "").toLowerCase();
  s2 = (s2 || "").toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

// String similarity based on edit distance (0.0 to 1.0)
function getSimilarity(s1, s2) {
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length < s2.length ? s1 : s2;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

// Clean up amounts that have OCR noise (e.g. '|39.O0' -> '139.00')
function cleanOcrAmountText(amtStr) {
  if (!amtStr) return "";
  let cleaned = amtStr.trim();
  cleaned = cleaned.replace(/o/gi, '0'); // replace letter O/o with number 0
  cleaned = cleaned.replace(/i|l|\|/gi, '1'); // replace i, l, | with 1
  cleaned = cleaned.replace(/s|S/g, '5'); // replace s with 5
  cleaned = cleaned.replace(/b|B/g, '8'); // replace b with 8
  cleaned = cleaned.replace(/g|q/gi, '9'); // replace g, q with 9
  // Keep only numbers, dot, and minus (and strip spaces)
  cleaned = cleaned.replace(/\s/g, '');
  cleaned = cleaned.replace(/[^0-9\.\-]/g, '');
  return cleaned;
}

// Clean up year string with OCR noise (e.g. '256ง' -> '2569')
function cleanOcrYearText(yearStr) {
  if (!yearStr) return "";
  let cleaned = yearStr.trim();
  cleaned = cleaned.replace(/ง/g, '9'); // Thai letter Ngor Ngu looks like 9
  cleaned = cleaned.replace(/ถ/g, '0'); // Thai letter Thor Thung looks like 0
  cleaned = cleaned.replace(/o|O/gi, '0');
  cleaned = cleaned.replace(/l|i|I/g, '1');
  cleaned = cleaned.replace(/q|g/gi, '9');
  cleaned = cleaned.replace(/s|S/g, '5');
  cleaned = cleaned.replace(/b|B/g, '8');
  cleaned = cleaned.replace(/[^0-9]/g, '');
  return cleaned;
}

// Map Thai months to numeric values
function getThaiMonthNumber(monthStr) {
  if (!monthStr) return null;
  const clean = monthStr.replace(/[\s\.]/g, "").trim();
  
  const mapping = {
    "มค": 1, "มกราคม": 1, "มกรา": 1,
    "กพ": 2, "กุมภาพันธ์": 2, "กุมภา": 2,
    "มีค": 3, "มีนาคม": 3, "มีนา": 3,
    "เมย": 4, "เมษายน": 4, "เมษา": 4,
    "พค": 5, "พฤษภาคม": 5, "พฤษภา": 5,
    "มิย": 6, "มิถุนายน": 6, "มิถุนา": 6,
    "กค": 7, "กรกฎาคม": 7, "กรกฎา": 7,
    "สค": 8, "สิงหาคม": 8, "สิงหา": 8,
    "กย": 9, "กันยายน": 9, "กันยา": 9,
    "ตค": 10, "ตุลาคม": 10, "ตุลา": 10,
    "พย": 11, "พฤศจิกายน": 11, "พฤศจิกา": 11,
    "ธค": 12, "ธันวาคม": 12, "ธันวา": 12
  };
  
  for (const key in mapping) {
    if (clean === key || clean.includes(key)) {
      return mapping[key];
    }
  }
  return null;
}

// Fuzzy check Month names in Thai
function getFuzzyThaiMonth(monthStr) {
  if (!monthStr) return null;
  const clean = monthStr.replace(/[\s\.]/g, "").trim();
  
  // Try exact mapping first
  const exactNum = getThaiMonthNumber(clean);
  if (exactNum) return exactNum;
  
  // Abbreviations map
  const abbreviations = {
    "มค": 1, "กพ": 2, "มีค": 3, "เมย": 4, "พค": 5, "มิย": 6,
    "กค": 7, "สค": 8, "กย": 9, "ตค": 10, "พย": 11, "ธค": 12
  };
  
  let bestMonth = null;
  let maxSimilarity = 0;
  
  for (const abbrev in abbreviations) {
    const sim = getSimilarity(clean, abbrev);
    if (sim > 0.5 && sim > maxSimilarity) {
      maxSimilarity = sim;
      bestMonth = abbreviations[abbrev];
    }
  }
  
  return bestMonth;
}

const ENG_MONTHS_MAP = {
  "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
  "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
};

function getMonthNumber(monthStr) {
  if (!monthStr) return null;
  const clean = monthStr.toLowerCase().replace(/[\s\.]/g, "").trim();
  
  const thaiNum = getFuzzyThaiMonth(monthStr);
  if (thaiNum) return thaiNum;
  
  for (const key in ENG_MONTHS_MAP) {
    if (clean.startsWith(key)) {
      return ENG_MONTHS_MAP[key];
    }
  }
  return null;
}

// Extract Date in YYYY-MM-DD format
function extractSlipDate(text) {
  // Pattern 1: dd MMM yyyy (e.g. 06 มิ.ย. 2569 or 06 Jun 2026)
  const textDateRegex = /(\d{1,2})\s*([ก-ฮa-zA-Z\.]+)\s*([0-9ก-ฮa-zA-Z]{4})/g;
  let match;
  while ((match = textDateRegex.exec(text)) !== null) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2];
    const rawYear = match[3];
    const cleanedYearStr = cleanOcrYearText(rawYear);
    let year = parseInt(cleanedYearStr, 10);
    
    const monthNum = getMonthNumber(monthStr);
    if (monthNum && day >= 1 && day <= 31 && year > 1000) {
      if (year > 2500) year -= 543;
      const mm = String(monthNum).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    }
  }
  
  // Pattern 2: dd/mm/yyyy
  const numericDateRegex = /(\d{1,2})[-/](\d{1,2})[-/]([0-9ก-ฮa-zA-Z]{4})/g;
  while ((match = numericDateRegex.exec(text)) !== null) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const rawYear = match[3];
    const cleanedYearStr = cleanOcrYearText(rawYear);
    let year = parseInt(cleanedYearStr, 10);
    
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year > 1000) {
      if (year > 2500) year -= 543;
      const mm = String(month).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    }
  }
  
  // Pattern 3: yyyy-mm-dd
  const ymdDateRegex = /([0-9ก-ฮa-zA-Z]{4})[-/](\d{1,2})[-/](\d{1,2})/g;
  while ((match = ymdDateRegex.exec(text)) !== null) {
    const rawYear = match[1];
    const cleanedYearStr = cleanOcrYearText(rawYear);
    let year = parseInt(cleanedYearStr, 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year > 1000) {
      if (year > 2500) year -= 543;
      const mm = String(month).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return `${year}-${mm}-${dd}`;
    }
  }
  
  return null;
}

// Extract decimal amount
function extractSlipAmount(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  const amountKeywords = [
    "จำนวนเงินที่ชำระ", "จำนวนเงิน", "ยอดชำระ", "ยอดเงิน", "ชำระ", "amount", "total", "บาท", "baht",
    "ยอดเงินโอน", "จำนวนเงินโอน", "ยอดโอน", "ยอดสุทธิ", "ยอดเงินสุทธิ", "สุทธิ", 
    "payment amount", "transferred amount", "net amount", "transfer amount", "pay amount", "value", "price"
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (amountKeywords.some(keyword => line.includes(keyword))) {
      for (let j = i; j <= Math.min(i + 2, lines.length - 1); j++) {
        const cleanedLine = cleanOcrAmountText(lines[j]);
        
        // Try decimal first
        const decMatch = cleanedLine.match(/(\d+\.\d{2})/);
        if (decMatch) {
          const val = parseFloat(decMatch[1]);
          if (val > 0) return val;
        }
        
        // Try integer
        const intMatch = cleanedLine.match(/(\d+)/);
        if (intMatch) {
          const val = parseFloat(intMatch[1]);
          if (val > 0 && val < 1000000 && val !== 2568 && val !== 2569 && val !== 2026) return val;
        }
      }
    }
  }
  
  // Fallback 1: get first non-zero decimal
  for (let i = 0; i < lines.length; i++) {
    const cleanedLine = cleanOcrAmountText(lines[i]);
    const decMatch = cleanedLine.match(/(\d+\.\d{2})/);
    if (decMatch) {
      const val = parseFloat(decMatch[1]);
      if (val > 0) return val;
    }
  }
  
  // Fallback 2: search for any number followed by "บาท"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("บาท") || line.includes("baht")) {
      const cleanedLine = cleanOcrAmountText(lines[i]);
      const numMatch = cleanedLine.match(/(\d+(?:\.\d{2})?)/);
      if (numMatch) {
        const val = parseFloat(numMatch[1]);
        if (val > 0 && val !== 2568 && val !== 2569 && val !== 2026) return val;
      }
    }
  }
  
  return null;
}

// Helper to detect if a parsed merchant string is junk / bank details
function isJunkMerchant(candidate) {
  if (!candidate) return true;
  const trimmed = candidate.trim();
  if (trimmed.length <= 2) return true;
  if (["↓", "⬇", "⬇️", "v", "V", "|", "+", "->", "=>"].includes(trimmed)) return true;
  if (trimmed.match(/^[x\d\-\*\s]{5,}$/i)) return true;
  
  const lowerCand = trimmed.toLowerCase();
  const junkKeywords = [
    "kbank", "scb", "ธนาคาร", "k plus", "krungthai", "ttb", "gsb", "krungsri", "bbl", 
    "bangkok bank", "uob", "ghb", "baac", "cimb", "lhb", "kkp", "tmb", "thanachart", "kasikorn",
    "กรุงไทย", "กรุงเทพ", "กรุงศรี", "ไทยพาณิชย์", "ออมสิน", "ทีทีบี", "ยูโอบี", "ธอส", "ธกส",
    "ออมทรัพย์", "กระแสรายวัน", "เลขที่บัญชี", "บัญชี", "promptpay", "พร้อมเพย์", "no.", "account", 
    "เลขที่", "โอนจาก", "โอนเข้า", "จากบัญชี", "สำเร็จ", "successful"
  ];
  return junkKeywords.some(kw => lowerCand.includes(kw));
}

// Extract platform
function extractSlipPlatform(text) {
  const lower = text.toLowerCase();
  if (lower.includes("make by kbank") || lower.includes("make")) {
    return "Make";
  }
  if (lower.includes("kplus") || lower.includes("k-plus") || lower.includes("kbank") || lower.includes("kasikorn")) {
    return "K-Plus";
  }
  if (lower.includes("scb") || lower.includes("ไทยพาณิชย์")) {
    return "SCB";
  }
  if (lower.includes("ttb") || lower.includes("ทีทีบี") || lower.includes("tmb") || lower.includes("ธนชาต")) {
    return "TTB";
  }
  if (lower.includes("krungthai") || lower.includes("ktb") || lower.includes("กรุงไทย")) {
    return "Krungthai";
  }
  if (lower.includes("gsb") || lower.includes("ออมสิน") || lower.includes("mymo")) {
    return "GSB";
  }
  if (lower.includes("เป๋าตัง") || lower.includes("paotang") || lower.includes("g-wallet") || lower.includes("g wallet")) {
    return "เป๋าตัง";
  }
  if (lower.includes("truemoney") || lower.includes("true wallet") || lower.includes("ทรูมันนี่") || lower.includes("วอลเล็ท")) {
    return "TrueMoney";
  }
  if (lower.includes("rabbit") || lower.includes("line pay")) {
    return "Rabbit Line Pay";
  }
  if (lower.includes("shopeepay") || lower.includes("shopee pay")) {
    return "ShopeePay";
  }
  if (lower.includes("krungsri") || lower.includes("bay") || lower.includes("กรุงศรี")) {
    return "Krungsri";
  }
  if (lower.includes("bangkok bank") || lower.includes("bbl") || lower.includes("กรุงเทพ") || lower.includes("บัวหลวง")) {
    return "Bangkok Bank";
  }
  if (lower.includes("uob") || lower.includes("ยูโอบี")) {
    return "UOB";
  }
  if (lower.includes("ghb") || lower.includes("gh bank") || lower.includes("ธอส")) {
    return "GH Bank";
  }
  if (lower.includes("baac") || lower.includes("ธกส") || lower.includes("ธ.ก.ส")) {
    return "BAAC";
  }
  if (lower.includes("cimb") || lower.includes("ซีไอเอ็มบี")) {
    return "CIMB Thai";
  }
  if (lower.includes("lhb") || lower.includes("lh bank") || lower.includes("แอล เอช")) {
    return "LH Bank";
  }
  if (lower.includes("kkp") || lower.includes("kiatnakin") || lower.includes("เกียรตินาคิน")) {
    return "KKP";
  }
  if (lower.includes("grabpay") || lower.includes("grab pay") || lower.includes("แกร็บเพย์")) {
    return "GrabPay";
  }
  if (lower.includes("dolfin") || lower.includes("ดอลฟิน")) {
    return "Dolfin Wallet";
  }
  return "Make"; // Default fallback
}

// Extract merchant/recipient (location)
function extractSlipMerchant(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const arrowIndicators = [
    "↓", "⬇", "⬇️", "→", "->", 
    "ไปยัง", "โอนไปยัง", "โอนให้", "ชำระให้", "ชำระเงินให้", "ชำระสินค้า", "ส่งให้",
    "ผู้รับโอน", "ผู้รับเงิน", "บัญชีผู้รับเงิน", "เข้าบัญชี", "รับเงินโดย", "ผู้รับชำระ",
    "ผู้รับ", "ชื่อผู้รับ", "บัญชีผู้รับ", 
    "to:", "to ", "receiver", "recipient", "beneficiary", "payee", "pay to"
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if any indicator matches this line
    const matchedInd = arrowIndicators.find(ind => line.toLowerCase().includes(ind));
    if (matchedInd) {
      // 1. Try to extract from the same line after the indicator
      const idx = line.toLowerCase().indexOf(matchedInd);
      const afterInd = line.substring(idx + matchedInd.length).replace(/[:\-]/g, "").trim();
      
      if (!isJunkMerchant(afterInd)) {
        return afterInd;
      }
      
      // 2. Fallback to the next 3 lines
      for (let j = i + 1; j <= Math.min(i + 3, lines.length - 1); j++) {
        const candidate = lines[j].trim();
        if (!isJunkMerchant(candidate)) {
          return candidate;
        }
      }
    }
  }
  
  // Fallback for Paotang G-Wallet
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("g-wallet") || line.includes("gwallet")) {
      for (let j = i + 1; j <= Math.min(i + 3, lines.length - 1); j++) {
        const candidate = lines[j].trim();
        if (!isJunkMerchant(candidate)) {
          return candidate;
        }
      }
    }
  }
  
  // General Fallback
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("ชำระสินค้า") || line.includes("ร้านค้า") || line.includes("ไปยัง")) {
      const cleaned = lines[i].replace(/ชำระสินค้า|ร้านค้า:|ร้านค้า|ไปยัง/g, "").trim();
      if (!isJunkMerchant(cleaned)) return cleaned;
      if (i < lines.length - 1 && !isJunkMerchant(lines[i+1])) return lines[i+1];
    }
  }
  
  return "";
}

// Extract note (remark)
function extractSlipNote(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const metaKeywords = ["เลขที่รายการ", "รหัสร้านค้า", "รหัสธุรกรรม", "transaction id", "ref no", "ref. no", "หมายเลขรายการ", "รหัสอ้างอิง"];
  
  let lastMetaIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (metaKeywords.some(keyword => line.includes(keyword))) {
      lastMetaIndex = i;
    }
  }
  
  if (lastMetaIndex !== -1 && lastMetaIndex < lines.length - 1) {
    for (let i = lastMetaIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (metaKeywords.some(keyword => line.toLowerCase().includes(keyword))) continue;
      if (line.match(/^[a-z0-9\s:-]+$/i) && line.length > 10) continue;
      if (line.includes("สแกนเพื่อตรวจสอบ") || line.includes("ตรวจสอบ")) continue;
      return line;
    }
  }
  
  // Fallback "บันทึกช่วยจำ"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes("บันทึกช่วยจำ") || line.includes("บันทึก:")) {
      const cleaned = lines[i].replace(/บันทึกช่วยจำ:|บันทึกช่วยจำ|บันทึก:/g, "").trim();
      if (cleaned.length > 0) return cleaned;
      if (i < lines.length - 1) return lines[i+1];
    }
  }
  
  // Fallback last lines
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes("สแกนเพื่อตรวจสอบ") || line.includes("ตรวจสอบ") || line.includes("wealth tracker") || line.includes("d1")) continue;
    if (metaKeywords.some(keyword => line.toLowerCase().includes(keyword))) continue;
    if (line.match(/^[a-z0-9\s:-]+$/i) && line.length > 10) continue;
    if (line.length > 2) return line;
  }
  
  return "";
}

// Load corrections from LocalStorage
function loadOcrCorrections() {
  try {
    const saved = localStorage.getItem("wealth_tracker_ocr_corrections");
    if (saved) {
      ocrCorrections = JSON.parse(saved);
      if (!ocrCorrections.merchants) ocrCorrections.merchants = {};
      if (!ocrCorrections.categories) ocrCorrections.categories = {};
      if (!ocrCorrections.notes) ocrCorrections.notes = {};
    }
  } catch (e) {
    console.error("Failed to load OCR corrections:", e);
  }
}

// Save corrections to LocalStorage
function saveOcrCorrections() {
  try {
    localStorage.setItem("wealth_tracker_ocr_corrections", JSON.stringify(ocrCorrections));
  } catch (e) {
    console.error("Failed to save OCR corrections:", e);
  }
}

// Learn from user adjustments when saving transaction
function learnOcrCorrection(formTxn) {
  if (!window.lastOcrAttempt || !window.lastOcrAttempt.parsed) return;
  
  const parsed = window.lastOcrAttempt.parsed;
  let learned = false;
  
  // 1. Learn Merchant Name Correction
  const parsedLoc = (parsed.location || "").trim();
  const formLoc = (formTxn.location || "").trim();
  if (parsedLoc && formLoc && parsedLoc.toLowerCase() !== formLoc.toLowerCase()) {
    ocrCorrections.merchants[parsedLoc.toLowerCase()] = formLoc;
    learned = true;
    console.log(`OCR Learned Merchant Mapping: "${parsedLoc.toLowerCase()}" -> "${formLoc}"`);
  }
  
  // 2. Learn Note/Remark Correction
  const parsedRem = (parsed.remark || "").trim();
  const formRem = (formTxn.remark || "").trim();
  if (parsedRem && formRem && parsedRem.toLowerCase() !== formRem.toLowerCase()) {
    ocrCorrections.notes[parsedRem.toLowerCase()] = formRem;
    learned = true;
    console.log(`OCR Learned Note Mapping: "${parsedRem.toLowerCase()}" -> "${formRem}"`);
  }
  
  // 3. Learn Category Mapping (based on final merchant name or note/remark)
  const finalLocKey = formLoc.toLowerCase();
  const finalRemKey = formRem.toLowerCase();
  const formCat = (formTxn.category || "").trim();
  const parsedCat = (parsed.category || "").trim();
  
  if (formCat && formCat !== parsedCat) {
    if (finalLocKey) {
      ocrCorrections.categories[finalLocKey] = formCat;
      learned = true;
      console.log(`OCR Learned Merchant-Category Mapping: "${finalLocKey}" -> "${formCat}"`);
    }
    if (finalRemKey) {
      ocrCorrections.categories[finalRemKey] = formCat;
      learned = true;
      console.log(`OCR Learned Note-Category Mapping: "${finalRemKey}" -> "${formCat}"`);
    }
  }
  
  if (learned) {
    saveOcrCorrections();
  }
  
  // Clear the attempt cache
  window.lastOcrAttempt = null;
}

// Load Presets dictionary into LocalStorage
function loadOcrPresets() {
  loadOcrCorrections();
  
  let addedMerchants = 0;
  let addedCategories = 0;
  
  // Merge merchants
  for (const key in THAI_OCR_PRESETS.merchants) {
    if (!ocrCorrections.merchants[key]) {
      ocrCorrections.merchants[key] = THAI_OCR_PRESETS.merchants[key];
      addedMerchants++;
    }
  }
  
  // Merge categories
  for (const key in THAI_OCR_PRESETS.categories) {
    if (!ocrCorrections.categories[key]) {
      ocrCorrections.categories[key] = THAI_OCR_PRESETS.categories[key];
      addedCategories++;
    }
  }
  
  if (addedMerchants > 0 || addedCategories > 0) {
    saveOcrCorrections();
    renderOcrDictionary();
    showStatus(`โหลดพรีเซ็ตร้านค้า ${addedMerchants} รายการ และหมวดหมู่ ${addedCategories} รายการสำเร็จ!`, "success");
  } else {
    showStatus("มีข้อมูลพรีเซ็ตอยู่แล้วในคลังเรียนรู้ของคุณ", "info");
  }
}

// Initialize OCR Dictionary Modal & Form Controls
function initOcrDictionaryModal() {
  const modal = document.getElementById("ocr-dictionary-modal");
  const openBtn = document.getElementById("btn-manage-ocr-dictionary");
  const closeBtn = document.getElementById("btn-close-ocr-modal");
  
  if (!modal || !openBtn || !closeBtn) return;
  
  openBtn.addEventListener("click", () => {
    renderOcrDictionary();
    modal.classList.add("active");
  });
  
  const closeModalFunc = () => {
    modal.classList.remove("active");
  };
  
  closeBtn.addEventListener("click", closeModalFunc);
  
  // Load Presets button click handler
  const loadPresetsBtn = document.getElementById("btn-load-ocr-presets");
  if (loadPresetsBtn) {
    loadPresetsBtn.addEventListener("click", () => {
      loadOcrPresets();
    });
  }
  
  // Type change listener to toggle inputs
  const typeSelect = document.getElementById("dict-add-type");
  const valContainer = document.getElementById("dict-val-container");
  
  typeSelect.addEventListener("change", () => {
    if (typeSelect.value === "merchant") {
      valContainer.innerHTML = `
        <label class="form-label" style="font-size: 0.75rem; margin-bottom: 4px;">คำที่ถูกต้อง</label>
        <input type="text" id="dict-add-val-text" class="form-input" style="padding: 6px 10px; font-size: 0.8rem; border-radius: 8px;" placeholder="เช่น 7-Eleven">
      `;
    } else {
      // Load active categories list dynamically
      const categoriesList = BUDGET_LIMITS.map(b => b.name);
      let catOptions = categoriesList.map(c => `<option value="${c}">${c}</option>`).join("");
      valContainer.innerHTML = `
        <label class="form-label" style="font-size: 0.75rem; margin-bottom: 4px;">เลือกหมวดหมู่</label>
        <select id="dict-add-val-select" class="form-input" style="padding: 6px 10px; font-size: 0.8rem; border-radius: 8px; background: var(--bg-gradient-start); color: var(--text-primary); border: 1px solid var(--glass-border);">
          ${catOptions}
        </select>
      `;
    }
  });
  
  // Add button click handler
  document.getElementById("btn-dict-add-save").addEventListener("click", () => {
    const type = typeSelect.value;
    const key = document.getElementById("dict-add-key").value.trim().toLowerCase();
    
    if (!key) {
      showStatus("กรุณากรอกคีย์เวิร์ด", "error");
      return;
    }
    
    let val = "";
    if (type === "merchant") {
      val = document.getElementById("dict-add-val-text").value.trim();
    } else {
      val = document.getElementById("dict-add-val-select").value;
    }
    
    if (!val) {
      showStatus("กรุณากรอกหรือเลือกค่าผลลัพธ์", "error");
      return;
    }
    
    loadOcrCorrections();
    if (type === "merchant") {
      ocrCorrections.merchants[key] = val;
    } else {
      ocrCorrections.categories[key] = val;
    }
    
    saveOcrCorrections();
    renderOcrDictionary();
    showStatus("บันทึกข้อมูลการเรียนรู้สำเร็จ", "success");
    
    // Clear key input
    document.getElementById("dict-add-key").value = "";
  });
}

function renderOcrDictionary() {
  loadOcrCorrections();
  
  const merchantContainer = document.getElementById("dict-list-merchants");
  const categoryContainer = document.getElementById("dict-list-categories");
  
  if (!merchantContainer || !categoryContainer) return;
  
  merchantContainer.innerHTML = "";
  categoryContainer.innerHTML = "";
  
  // Render merchants dictionary
  const merchantKeys = Object.keys(ocrCorrections.merchants);
  if (merchantKeys.length === 0) {
    merchantContainer.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); padding: 4px;">ไม่มีข้อมูลการจับคู่ชื่อร้านค้า</div>`;
  } else {
    merchantKeys.forEach(k => {
      const row = document.createElement("div");
      row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px 10px; font-size: 0.78rem;";
      row.innerHTML = `
        <div>
          <span style="color: var(--color-expense); font-family: monospace;">"${k}"</span>
          <span style="color: var(--text-muted); margin: 0 4px;">&rarr;</span>
          <strong style="color: var(--color-income);">${ocrCorrections.merchants[k]}</strong>
        </div>
        <button class="action-btn delete-btn" style="padding: 4px; border-radius: 50%;" onclick="deleteOcrDictItem('merchant', '${k}')">
          <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
        </button>
      `;
      merchantContainer.appendChild(row);
    });
  }
  
  // Render categories dictionary
  const categoryKeys = Object.keys(ocrCorrections.categories);
  if (categoryKeys.length === 0) {
    categoryContainer.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); padding: 4px;">ไม่มีข้อมูลการกำหนดหมวดหมู่</div>`;
  } else {
    categoryKeys.forEach(k => {
      const row = document.createElement("div");
      row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 8px; padding: 6px 10px; font-size: 0.78rem;";
      row.innerHTML = `
        <div>
          <span style="color: var(--text-secondary); font-family: monospace;">"${k}"</span>
          <span style="color: var(--text-muted); margin: 0 4px;">&rarr;</span>
          <span class="type-tag" style="background: rgba(255,255,255,0.05); color: var(--text-primary); font-weight: 600; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px;">${ocrCorrections.categories[k]}</span>
        </div>
        <button class="action-btn delete-btn" style="padding: 4px; border-radius: 50%;" onclick="deleteOcrDictItem('category', '${k}')">
          <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
        </button>
      `;
      categoryContainer.appendChild(row);
    });
  }
  
  lucide.createIcons();
}

// Global delete function
window.deleteOcrDictItem = function(type, key) {
  loadOcrCorrections();
  if (type === "merchant") {
    delete ocrCorrections.merchants[key];
  } else {
    delete ocrCorrections.categories[key];
  }
  saveOcrCorrections();
  renderOcrDictionary();
  showStatus("ลบประวัติการเรียนรู้แล้ว", "success");
};

function parseSlipText(text) {
  loadOcrCorrections();
  
  // Normalize Thai Unicode and spelling glitches (e.g. SARA AM issues)
  text = normalizeThaiOcrText(text);
  
  // Normalize spacing in numbers generated by OCR (e.g., "139 . 00" -> "139.00", "1 , 239" -> "1,239")
  if (text) {
    text = text.replace(/(\d+)\s*\.\s*(\d{2})\b/g, '$1.$2');
    text = text.replace(/(\d+)\s*,\s*(\d{3})/g, '$1,$2');
  }
  
  const platformVal = extractSlipPlatform(text);
  const platformKey = platformVal.toLowerCase().replace(/[\s\.\-_]/g, "");
  
  // Load learned templates from LocalStorage
  const storedTemplates = localStorage.getItem("wealth_tracker_learned_templates");
  let learnedTemplates = {};
  if (storedTemplates) {
    try {
      learnedTemplates = JSON.parse(storedTemplates);
    } catch (e) {
      console.error("Error parsing stored learned templates", e);
    }
  }

  const matchedTemplate = learnedTemplates[platformKey];
  let dateVal = null;
  let totalVal = null;
  let locationVal = null;
  let remarkVal = null;
  let parsedByTemplate = false;

  if (matchedTemplate) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let anchorIdx = -1;
    const lowerAnchor = matchedTemplate.anchorWord.toLowerCase();
    
    // 1. Try exact match first
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lowerAnchor)) {
        anchorIdx = i;
        break;
      }
    }
    
    // 2. If no exact match, try fuzzy matching (Levenshtein similarity >= 70%)
    if (anchorIdx === -1) {
      let bestSim = 0;
      for (let i = 0; i < lines.length; i++) {
        const sim = getSimilarity(lines[i], matchedTemplate.anchorWord);
        if (sim >= 0.70 && sim > bestSim) {
          bestSim = sim;
          anchorIdx = i;
        }
      }
      if (anchorIdx !== -1) {
        console.log(`OCR matched anchor "${matchedTemplate.anchorWord}" fuzzily with "${lines[anchorIdx]}" (Similarity: ${Math.round(bestSim * 100)}%)`);
      }
    }

    if (anchorIdx !== -1) {
      console.log(`OCR parsing via learned template for "${matchedTemplate.platformName}" (Anchor L-${anchorIdx})`);
      
      const getLineAtOffset = (offset) => {
        if (offset === null) return "";
        const idx = anchorIdx + offset;
        if (idx >= 0 && idx < lines.length) return lines[idx];
        return "";
      };

      const rawDate = getLineAtOffset(matchedTemplate.dateOffset);
      const rawAmount = getLineAtOffset(matchedTemplate.amountOffset);
      const rawMerchant = getLineAtOffset(matchedTemplate.merchantOffset);
      const rawRemark = getLineAtOffset(matchedTemplate.remarkOffset);

      // Extract and clean values using existing helper functions or general fallbacks
      dateVal = rawDate ? (extractSlipDate(rawDate) || extractSlipDate(text)) : extractSlipDate(text);
      totalVal = rawAmount ? (extractSlipAmount(rawAmount) || extractSlipAmount(text)) : extractSlipAmount(text);
      locationVal = rawMerchant ? rawMerchant.replace(/[:\-↓⬇➡️→]/g, "").trim() : extractSlipMerchant(text);
      remarkVal = rawRemark ? rawRemark.trim() : extractSlipNote(text);
      parsedByTemplate = true;
      
      showStatus(`สแกนสลิปด้วยแพทเทิร์นเรียนรู้ (${matchedTemplate.platformName})`, "success");
    }
  }

  // Fallback to standard heuristics if template not matched or not found
  if (!parsedByTemplate) {
    dateVal = extractSlipDate(text);
    totalVal = extractSlipAmount(text);
    locationVal = extractSlipMerchant(text);
    remarkVal = extractSlipNote(text);
  }
  
  // Apply learned corrections
  const cleanLoc = (locationVal || "").toLowerCase().trim();
  if (cleanLoc && ocrCorrections.merchants[cleanLoc]) {
    console.log(`OCR Applied learned Merchant mapping: "${locationVal}" -> "${ocrCorrections.merchants[cleanLoc]}"`);
    locationVal = ocrCorrections.merchants[cleanLoc];
  }
  
  const cleanRem = (remarkVal || "").toLowerCase().trim();
  if (cleanRem && ocrCorrections.notes[cleanRem]) {
    console.log(`OCR Applied learned Note mapping: "${remarkVal}" -> "${ocrCorrections.notes[cleanRem]}"`);
    remarkVal = ocrCorrections.notes[cleanRem];
  }
  
  return {
    date: dateVal,
    total: totalVal,
    platform: platformVal,
    location: locationVal,
    remark: remarkVal
  };
}

// Predict category and fuzzy match against BUDGET_LIMITS
function predictCategoryFromNote(note, merchant) {
  loadOcrCorrections();
  
  const cleanNote = (note || "").toLowerCase().trim();
  const cleanMerchant = (merchant || "").toLowerCase().trim();
  
  // Try to match learned category rules first
  if (cleanMerchant && ocrCorrections.categories[cleanMerchant]) {
    console.log(`OCR Applied learned Category mapping (merchant): "${merchant}" -> "${ocrCorrections.categories[cleanMerchant]}"`);
    return ocrCorrections.categories[cleanMerchant];
  }
  if (cleanNote && ocrCorrections.categories[cleanNote]) {
    console.log(`OCR Applied learned Category mapping (note): "${note}" -> "${ocrCorrections.categories[cleanNote]}"`);
    return ocrCorrections.categories[cleanNote];
  }
  
  const combined = `${cleanNote} ${cleanMerchant}`;
  
  const categoryKeywords = {
    "อาหารและเครื่องดื่ม": ["ข้าว", "ตามสั่ง", "ก๋วยเตี๋ยว", "สะดวกซื้อ", "น้ำดื่ม", "เมล็ดกาแฟ", "กาแฟ", "คาเฟ่", "อาหารสด", "ชาบู", "หมูกระทะ", "suki", "สุกี้", "shabu", "บุฟเฟต์", "กิน", "sizzler", "kfc", "mcdonald", "อาหาร", "เครื่องดื่ม", "7-11"],
    "ค่าเดินทางและยานพาหนะ": ["น้ำมัน", "ดีเซล", "แก๊สโซฮอล์", "ชาร์จไฟ", "ev", "bts", "mrt", "รถไฟฟ้า", "รถทัวร์", "รถตู้", "grab", "bolt", "ทางด่วน", "จอดรถ", "ประกันรถ", "น้ำมันเครื่อง", "เช็คระยะ", "รถเมล์", "วิน", "แท็กซี่", "taxi"],
    "การออกกำลังกายและสันทนาการ": ["ฟิตเนส", "ยิม", "fitness", "เทรนเนอร์", "เวย์โปรตีน", "pre-workout", "อาหารคลีน", "เล่นเวท", "อุปกรณ์กีฬา", "ดำน้ำ", "กีฬา"],
    "ค่าบริการเครือข่ายสื่อสาร": ["เน็ตบ้าน", "เน็ตมือถือ", "ซิมเน็ต", "ซิมเทพ", "wifi", "3bb", "ais", "true", "dtac", "อินเทอร์เน็ต", "เน็ต"],
    "ค่าใช้จ่ายสัตว์เลี้ยง": ["สัตวแพทย์", "สัตว์เลี้ยง", "สุนัข", "แมว", "รพ.สัตว์", "คลินิกสัตว์", "ยาสัตว์", "วัคซีนสัตว์", "เห็บหมัด", "พยาธิหนอนหัวใจ", "อาหารสุนัข", "อาหารแมว", "ทรายแมว", "แผ่นรองฉี่", "ตัดขน", "กรูมมิ่ง", "พริกไทย", "รักษาพริกไทย"],
    "สุขภาพและเวชภัณฑ์": ["ยาสามัญ", "พารา", "ยาแก้ไอ", "ยาแก้แพ้", "ยาปฏิชีวนะ", "หน้ากากอนามัย", "atk", "พลาสเตอร์", "วิตามิน", "อาหารเสริม", "ตรวจสุขภาพ", "รักษาพยาบาล", "ยา", "โรงพยาบาล", "หาหมอ"],
    "ความบันเทิงและสื่อดิจิทัล": ["เติมเงินเกม", "กาชา", "dragon raja", "netflix", "youtube premium", "disney+", "spotify", "apple music", "steam", "app store", "play store", "ตั๋วหนัง", "คอนเสิร์ต", "บาร์", "เกม", "สตรีมมิ่ง"],
    "การเดินทางท่องเที่ยว": ["โรงแรม", "รีสอร์ต", "เครื่องบิน", "ตู้นอน", "เช่ารถ", "แพ็กเกจทริป", "เดินป่า", "เชียงดาว", "ทริป", "trip", "อุทยาน", "เอาท์ดอร์", "travel", "ท่องเที่ยว"],
    "สินค้าอุปโภคและแฟชั่น": ["เสื้อ", "กางเกง", "รองเท้า", "เสื้อผ้า", "ครีมบำรุง", "น้ำหอม", "ของใช้ส่วนตัว", "แต่งห้อง", "แก็ดเจ็ต", "dji", "tapo", "wiz", "สมาร์ทโฮม", "shopee", "lazada", "ช้อปปิ้ง", "shopping", "แว่น", "แว่นตา", "แว่นกันแดด", "ไอที"],
    "บริการจัดส่งและบรรจุภัณฑ์": ["flash express", "kerry", "j&t", "ไปรษณีย์", "ซองเอกสาร", "กล่องพัสดุ", "บับเบิ้ล", "เทปกาว", "grabexpress", "lalamove", "ส่งของ", "พัสดุ", "ขนส่ง"],
    "การทำบุญและบริจาค": ["ผ้าป่า", "กฐิน", "งานบวช", "งานแต่ง", "หยอดตู้", "บริจาค", "มูลนิธิ", "สังฆทาน", "ตักบาตร", "ทำบุญ", "งานแต่ง", "งานบุญ"],
    "ต้นทุนและค่าใช้จ่ายทางธุรกิจ": ["agoda", "booking", "booking.com", "airbnb", "คอมมิชชัน", "เอเจนซี่", "โปรโมท", "วิลล่า", "sita", "sea & mountain", "โฆษณาที่พัก", "ota", "คอม", "commission"],
    "การลงทุนและเงินออม": ["กองทุน", "rmf", "ssf", "thaiesg", "หุ้น", "คริปโต", "crypto", "btc", "eth", "ฝากประจำ", "ดอกเบี้ย", "pvd", "ปาล์ม", "สวนปาล์ม", "แคมป์ปิ้ง", "ลงทุน", "ออมเงิน"],
    "รายได้จากการทำงาน": ["เงินเดือน", "โบนัส", "รับจ้าง", "lqa", "tester", "เทสเตอร์", "รีวิว", "กำไร", "ธุรกิจ", "com villa", "commission", "ทำงาน"],
    "รายได้วิชาการและงานสอน": ["สอนพิเศษ", "สอนภาษา", "ติวเตอร์", "ติว", "วิทยากร", "คอร์สเรียน", "เอกสารการสอน", "สอนหนังสือ", "บรรยาย", "สอน"],
    "สวัสดิการและเงินชดเชย": ["เงินชดเชย", "ประกันสังคม", "ม.33", "ว่างงาน", "เยียวยา", "อุดหนุน", "รัฐบาล", "ชดเชย"],
    "เบ็ดเตล็ดและอื่น ๆ": ["งานศพ", "ของขวัญ", "จับฉลาก", "เศษสตางค์", "ซ่อมแซม", "คอนโด", "ค่าเช่า", "ประปา", "ค่าน้ำ", "ค่าไฟ", "ไฟฟ้า", "ดอกเบี้ย", "ค่าธรรมเนียม", "ภาษี", "ฉุกเฉิน", "ปรับปรุงยอด"]
  };
  
  let predicted = null;
  for (const cat in categoryKeywords) {
    const keywords = categoryKeywords[cat];
    if (keywords.some(kw => combined.includes(kw))) {
      predicted = cat;
      break;
    }
  }
  
  if (!predicted) predicted = "เบ็ดเตล็ดและอื่น ๆ";
  
  const activeCategories = BUDGET_LIMITS.map(b => b.name);
  if (activeCategories.includes(predicted)) return predicted;
  
  for (const active of activeCategories) {
    const aClean = active.replace(/ค่า/g, "").trim();
    const pClean = predicted.replace(/ค่า/g, "").trim();
    if (aClean.includes(pClean) || pClean.includes(aClean)) {
      return active;
    }
  }
  
  if (predicted === "สินค้าอุปโภคและแฟชั่น" && activeCategories.includes("เบ็ดเตล็ดและอื่น ๆ")) return "เบ็ดเตล็ดและอื่น ๆ";
  if (activeCategories.includes("เบ็ดเตล็ดและอื่น ๆ")) return "เบ็ดเตล็ดและอื่น ๆ";
  if (activeCategories.length > 0) return activeCategories[0];
  return predicted;
}

// Initialize Slip Upload OCR listeners
function initSlipUploadOCR() {
  const btnTrigger = document.getElementById("btn-trigger-slip-upload");
  const fileInput = document.getElementById("input-slip-file");
  const progressContainer = document.getElementById("slip-progress-bar-container");
  const progressFill = document.getElementById("slip-progress-bar-fill");
  const statusText = document.getElementById("slip-upload-status");
  
  if (!btnTrigger || !fileInput) return;
  
  btnTrigger.addEventListener("click", () => {
    fileInput.click();
  });
  
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Check if Tesseract is available
    if (typeof Tesseract === "undefined") {
      showStatus("ระบบไม่สามารถเปิดบริการสแกนสลิปได้ เนื่องจาก Tesseract library ไม่โหลด", "error");
      statusText.style.display = "block";
      statusText.innerText = "ข้อผิดพลาด: Tesseract.js ไม่ทำงาน";
      statusText.className = "slip-status-text error";
      return;
    }
    
    // UI Loading state
    btnTrigger.disabled = true;
    btnTrigger.innerHTML = '<i data-lucide="loader" class="spin"></i> <span>กำลังสแกนรูปภาพ...</span>';
    lucide.createIcons();
    
    if (progressContainer) progressContainer.style.display = "block";
    if (progressFill) progressFill.style.width = "0%";
    
    statusText.style.display = "block";
    statusText.innerText = "กำลังประมวลผลรูปภาพ (0%)...";
    statusText.className = "slip-status-text";
    
    Tesseract.recognize(
      file,
      'tha+eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(m.progress * 100);
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (statusText) statusText.innerText = `กำลังประมวลผลรูปภาพ (${pct}%)...`;
          }
        }
      }
    ).then(({ data: { text } }) => {
      const parsed = parseSlipText(text);
      console.log("OCR parsed data:", parsed);
      
      // Auto-fill values
      if (parsed.date) document.getElementById("form-date").value = parsed.date;
      if (parsed.total) document.getElementById("form-total").value = parsed.total;
      if (parsed.platform) document.getElementById("form-platform").value = parsed.platform;
      if (parsed.location) document.getElementById("form-location").value = parsed.location;
      if (parsed.remark) document.getElementById("form-remark").value = parsed.remark;
      
      // Predict category
      const predictedCategory = predictCategoryFromNote(parsed.remark, parsed.location);
      document.getElementById("form-category").value = predictedCategory;
      
      // Save raw OCR output and parsing results for learning feedback loop
      window.lastOcrAttempt = {
        rawText: text,
        parsed: {
          date: parsed.date,
          total: parsed.total,
          platform: parsed.platform,
          location: parsed.location,
          remark: parsed.remark,
          category: predictedCategory
        }
      };
      
      // Slips are normally expenses
      setFormSwitch("Expense");
      closeAllSuggestions();
      
      // Reset UI elements
      btnTrigger.disabled = false;
      btnTrigger.innerHTML = '<i data-lucide="upload-cloud"></i> <span>อัปโหลดรูปภาพสลิป (รองรับ MAKE)</span>';
      lucide.createIcons();
      if (progressContainer) progressContainer.style.display = "none";
      
      statusText.innerText = "สแกนสำเร็จ และกรอกข้อมูลอัตโนมัติเรียบร้อยแล้ว!";
      statusText.className = "slip-status-text success";
      
      showStatus("สแกนและสกัดข้อมูลจากสลิปเรียบร้อยแล้ว", "success");
      
      // Reset file input value to allow scan the same file again if needed
      fileInput.value = "";
    }).catch(err => {
      console.error("Tesseract error:", err);
      
      btnTrigger.disabled = false;
      btnTrigger.innerHTML = '<i data-lucide="upload-cloud"></i> <span>อัปโหลดรูปภาพสลิป (รองรับ MAKE)</span>';
      lucide.createIcons();
      if (progressContainer) progressContainer.style.display = "none";
      
      statusText.innerText = "สแกนล้มเหลว กรุณาลองอีกครั้ง หรือกรอกข้อมูลด้วยตัวเอง";
      statusText.className = "slip-status-text error";
      
      showStatus("การสแกนสลิปล้มเหลว", "error");
      
      fileInput.value = "";
    });
  });
}

// --- DATABASE OPERATIONS (DUAL MODE) ---

// A safe JSON fetch wrapper that parses HTTP texts first to avoid JSON parse crashes
async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`Failed to parse JSON response from ${url}. Raw response:`, text);
      return { ok: false, status: res.status, error: `เซิร์ฟเวอร์ตอบกลับรูปแบบไม่ถูกต้อง (HTTP ${res.status})` };
    }
    
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`Network fetch error on ${url}:`, err);
    return { ok: false, status: 0, error: err.message || "การเชื่อมต่อเครือข่ายล้มเหลว" };
  }
}

// Verify if backend Cloudflare Page functions are responsive
let apiErrorDetail = "";
async function getAdminPassword() {
  let pwd = sessionStorage.getItem("wt_admin_password");
  if (!pwd) {
    pwd = prompt("กรุณากรอกรหัสผ่านผู้ดูแลระบบ (Admin Password) เพื่อดำเนินการ:");
    if (pwd !== null) {
      pwd = pwd.trim();
      sessionStorage.setItem("wt_admin_password", pwd);
    }
  }
  return pwd;
}

async function checkApiMode() {
  if (window.location.protocol === "file:") {
    isApiMode = false;
    return;
  }
  const res = await safeFetchJson("/api/transactions?limit=1");
  isApiMode = res.ok;
  if (!res.ok) {
    apiErrorDetail = res.error || "Unknown API check failure";
    console.warn("API check failed. Cloudflare Functions or D1 is not responding correctly:", apiErrorDetail);
  }
}

// Load transactions list
async function loadTransactions() {
  const modeBadge = document.getElementById("mode-badge");
  const modeText = document.getElementById("mode-text");
  
  if (isApiMode) {
    modeBadge.className = "type-tag income";
    modeText.innerText = "Cloudflare D1 SQL";
    try {
      const res = await safeFetchJson("/api/transactions");
      if (res.ok) {
        transactions = res.data.map(t => ({
          ...t,
          date: parseCustomDate(t.date)
        }));
      } else {
        throw new Error(res.error || "Failed to load D1 transactions");
      }
    } catch (e) {
      console.error(e);
      showStatus(`ดึงข้อมูลจาก Cloudflare D1 ล้มเหลว (${e.message}) พยายามสลับไปโหมด LocalStorage...`, "warning");
      loadLocalStorageTransactions();
    }
  } else {
    modeBadge.className = "type-tag expense";
    modeBadge.style.backgroundColor = "rgba(244, 63, 94, 0.1)";
    modeBadge.style.color = "var(--color-expense)";
    
    if (window.location.protocol !== "file:") {
      modeText.innerText = "Cloudflare API Error";
      showStatus(`ระบบหลังบ้าน Cloudflare ขัดข้อง: ${apiErrorDetail} (อาจยังไม่ได้ผูก D1 หรือกด Retry Deploy ในหน้าเว็บ Cloudflare)`, "error");
    } else {
      modeText.innerText = "Offline LocalStorage";
    }
    loadLocalStorageTransactions();
  }
  
  // Force parse all dates to YYYY-MM-DD to protect against legacy formats in D1 database or LocalStorage
  transactions = transactions.map(t => ({
    ...t,
    date: parseCustomDate(t.date)
  }));
  
  // Migrate old category names to the new taxonomy on-the-fly
  const CATEGORY_MIGRATION_MAP = {
    "ค่าอาหาร": "อาหารและเครื่องดื่ม",
    "อาหาร": "อาหารและเครื่องดื่ม",
    "ความบันเทิง": "ความบันเทิงและสื่อดิจิทัล",
    "ความบันเทิงและสันทนาการ": "ความบันเทิงและสื่อดิจิทัล",
    "ค่าท่องเที่ยว": "การเดินทางท่องเที่ยว",
    "ค่ายิม": "การออกกำลังกายและสันทนาการ",
    "การออกกำลังกายและฟิตเนส": "การออกกำลังกายและสันทนาการ",
    "ค่าเดินทาง": "ค่าเดินทางและยานพาหนะ",
    "ค่าสอนพิเศษ": "รายได้วิชาการและงานสอน",
    "รายได้จากการสอนพิเศษ": "รายได้วิชาการและงานสอน",
    "ค่าเงินว่างงาน": "สวัสดิการและเงินชดเชย",
    "ทำบุญ": "การทำบุญและบริจาค",
    "ค่าอินเตอร์เน็ต": "ค่าบริการเครือข่ายสื่อสาร",
    "ค่าบริการอินเทอร์เน็ต": "ค่าบริการเครือข่ายสื่อสาร",
    "ค่าส่งของ": "บริการจัดส่งและบรรจุภัณฑ์",
    "การบริการจัดส่งและบรรจุภัณฑ์": "บริการจัดส่งและบรรจุภัณฑ์",
    "ช้อปปิ้ง": "สินค้าอุปโภคและแฟชั่น",
    "ค่ารักษาพริกไทย": "ค่าใช้จ่ายสัตว์เลี้ยง",
    "ค่ายา": "สุขภาพและเวชภัณฑ์",
    "อื่นๆ": "เบ็ดเตล็ดและอื่น ๆ"
  };

  let hasCategoryChanges = false;
  transactions = transactions.map(t => {
    if (t.category === "ค่า Com Villa" || t.category === "ค่าใช้จ่ายทางธุรกิจ (วิลล่า)") {
      t.category = t.type === "Income" ? "รายได้จากการทำงาน" : "ต้นทุนและค่าใช้จ่ายทางธุรกิจ";
      hasCategoryChanges = true;
    } else if (CATEGORY_MIGRATION_MAP[t.category]) {
      t.category = CATEGORY_MIGRATION_MAP[t.category];
      hasCategoryChanges = true;
    }
    return t;
  });
  if (hasCategoryChanges && !isApiMode) {
    localStorage.setItem("wealth_tracker_transactions", JSON.stringify(transactions));
  }
  
  // Ensure date sorting: newest first, then by update order
  transactions.sort((a, b) => {
    const dDiff = b.date.localeCompare(a.date);
    if (dDiff !== 0) return dDiff;
    return (b.updated_at || 0) - (a.updated_at || 0);
  });
  
  buildFilters();
  applyFilters();
}

function loadLocalStorageTransactions() {
  let stored = localStorage.getItem("wealth_tracker_transactions");
  if (!stored) {
    // If opening for first time, initialize with parsed seed data
    const formattedSeed = SEED_TRANSACTIONS.map(t => ({
      ...t,
      date: parseCustomDate(t.date),
      updated_at: Date.now()
    }));
    localStorage.setItem("wealth_tracker_transactions", JSON.stringify(formattedSeed));
    transactions = formattedSeed;
  } else {
    transactions = JSON.parse(stored);
  }
}

// Insert or edit a transaction record
async function saveTransaction(transactionData) {
  const isEditing = !!transactionData.id;
  transactionData.updated_at = Date.now();
  
  if (!transactionData.id) {
    transactionData.id = generateId();
  }
  
  const password = await getAdminPassword();
  if (password === null || password === "") {
    showStatus("ยกเลิกการบันทึกข้อมูลเนื่องจากไม่ได้ระบุรหัสผ่าน", "error");
    return false;
  }
  
  if (isApiMode) {
    try {
      const method = isEditing ? "PUT" : "POST";
      const res = await safeFetchJson("/api/transactions", {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Password": password
        },
        body: JSON.stringify(transactionData)
      });
      
      if (res.status === 401) {
        sessionStorage.removeItem("wt_admin_password");
        showStatus("รหัสผ่านไม่ถูกต้อง", "error");
        return false;
      }
      
      if (res.ok) {
        showStatus(isEditing ? "แก้ไขรายการในฐานข้อมูลเสร็จเรียบร้อย" : "เพิ่มรายการใหม่ในฐานข้อมูลเสร็จเรียบร้อย", "success");
      } else {
        throw new Error(res.data?.error || res.error || "D1 save failed");
      }
    } catch (e) {
      console.error(e);
      showStatus(`บันทึกลง D1 ล้มเหลว! ${e.message}`, "error");
      return false;
    }
  } else {
    // LocalStorage Mode passcode check
    if (password !== "20147") {
      sessionStorage.removeItem("wt_admin_password");
      showStatus("รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นสำหรับ Local คือ 20147)", "error");
      return false;
    }
    
    // LocalStorage CRUD logic
    if (isEditing) {
      const idx = transactions.findIndex(t => t.id === transactionData.id);
      if (idx !== -1) transactions[idx] = transactionData;
    } else {
      transactions.unshift(transactionData);
    }
    localStorage.setItem("wealth_tracker_transactions", JSON.stringify(transactions));
    showStatus(isEditing ? "แก้ไขข้อมูลในบราวเซอร์สำเร็จ" : "บันทึกข้อมูลรายการใหม่ลงบราวเซอร์สำเร็จ", "success");
  }
  
  await loadTransactions();
  return true;
}

// Delete a transaction record
async function deleteTransaction(id) {
  if (!id) return;
  
  const password = await getAdminPassword();
  if (password === null || password === "") {
    showStatus("ยกเลิกการลบข้อมูลเนื่องจากไม่ได้ระบุรหัสผ่าน", "error");
    return false;
  }
  
  if (isApiMode) {
    try {
      const res = await safeFetchJson(`/api/transactions?id=${id}`, {
        method: "DELETE",
        headers: {
          "X-Admin-Password": password
        }
      });
      
      if (res.status === 401) {
        sessionStorage.removeItem("wt_admin_password");
        showStatus("รหัสผ่านไม่ถูกต้อง", "error");
        return false;
      }
      
      if (res.ok) {
        showStatus("ลบรายการออกจากฐานข้อมูลแล้ว", "success");
      } else {
        throw new Error(res.data?.error || res.error || "D1 delete failed");
      }
    } catch (e) {
      console.error(e);
      showStatus(`ไม่สามารถลบรายการออกจาก D1 ได้: ${e.message}`, "error");
      return false;
    }
  } else {
    // LocalStorage Mode passcode check
    if (password !== "20147") {
      sessionStorage.removeItem("wt_admin_password");
      showStatus("รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นสำหรับ Local คือ 20147)", "error");
      return false;
    }
    
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("wealth_tracker_transactions", JSON.stringify(transactions));
    showStatus("ลบรายการออกจากบราวเซอร์แล้ว", "success");
  }
  
  await loadTransactions();
  return true;
}

// Delete a single transaction without triggering reload (used for bulk operation)
async function deleteTransactionSingle(id, password) {
  if (isApiMode) {
    const res = await safeFetchJson(`/api/transactions?id=${id}`, {
      method: "DELETE",
      headers: {
        "X-Admin-Password": password
      }
    });
    
    if (res.status === 401) {
      sessionStorage.removeItem("wt_admin_password");
      throw new Error("UNAUTHORIZED");
    }
    
    if (!res.ok) {
      throw new Error(res.data?.error || res.error || "D1 delete failed");
    }
  } else {
    // LocalStorage Mode passcode check
    if (password !== "20147") {
      sessionStorage.removeItem("wt_admin_password");
      throw new Error("UNAUTHORIZED");
    }
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("wealth_tracker_transactions", JSON.stringify(transactions));
  }
}

// Bulk delete all transactions in sequence or parallel
async function bulkDeleteTransactions(ids) {
  const password = await getAdminPassword();
  if (password === null || password === "") {
    showStatus("ยกเลิกการลบข้อมูลเนื่องจากไม่ได้ระบุรหัสผ่าน", "error");
    return;
  }
  
  showStatus(`กำลังดำเนินการลบทั้งหมด ${ids.length} รายการ...`, "warning");
  
  try {
    if (isApiMode) {
      // Execute parallel calls
      const promises = ids.map(id => deleteTransactionSingle(id, password));
      await Promise.all(promises);
    } else {
      // LocalStorage mode single filter delete
      if (password !== "20147") {
        sessionStorage.removeItem("wt_admin_password");
        showStatus("รหัสผ่านไม่ถูกต้อง", "error");
        return;
      }
      transactions = transactions.filter(t => !ids.includes(t.id));
      localStorage.setItem("wealth_tracker_transactions", JSON.stringify(transactions));
    }
    showStatus(`ลบข้อมูลสำเร็จทั้งหมด ${ids.length} รายการ`, "success");
  } catch (e) {
    console.error(e);
    if (e.message === "UNAUTHORIZED") {
      showStatus("รหัสผ่านไม่ถูกต้อง", "error");
    } else {
      showStatus(`เกิดข้อผิดพลาดในการลบ: ${e.message}`, "error");
    }
  }
  
  // Uncheck header checkbox
  const checkAll = document.getElementById("check-all");
  if (checkAll) checkAll.checked = false;
  
  await loadTransactions();
}

// Update the visibility and label of the bulk delete button
function updateBulkDeleteButtonState() {
  const checkedBoxes = document.querySelectorAll(".txn-checkbox:checked");
  const count = checkedBoxes.length;
  const bulkBtn = document.getElementById("btn-bulk-delete");
  const countSpan = document.getElementById("bulk-delete-count");
  
  if (bulkBtn && countSpan) {
    if (count > 0) {
      bulkBtn.style.display = "inline-flex";
      countSpan.innerText = count;
    } else {
      bulkBtn.style.display = "none";
    }
  }
}



// --- FILTER & DATA BINDINGS ENGINE ---

// Build filters options dropdowns dynamically based on database entries
function buildFilters() {
  const typeFilter = document.getElementById("filter-type");
  const catFilter = document.getElementById("filter-category");
  const platFilter = document.getElementById("filter-platform");
  
  const selectedCat = catFilter.value;
  const selectedPlat = platFilter.value;
  
  // Default fallback lists for form dropdowns & recommendations
  const defaultPlatforms = ["Make", "TTB", "Cr. So Fast", "Tiktok Paylater", "K-Plus", "SCB", "Krungsri", "Bangkok Bank", "ShopeePay", "TrueMoney", "เงินสด"];
  const defaultCategories = [
    "อาหารและเครื่องดื่ม", "ค่าเดินทางและยานพาหนะ", "ที่พักและสาธารณูปโภค", 
    "การลงทุนและเงินออม", "ช้อปปิ้งและของใช้", "ความบันเทิงและสื่อดิจิทัล", 
    "สุขภาพและอนามัย", "การศึกษาและพัฒนาตนเอง", "ภาระหนี้สิน",
    "รายได้จากการทำงาน", "เงินเดือน", "โบนัส", "ดอกเบี้ยและปันผล", "ธุรกิจส่วนตัว", "หมวดหมู่อื่น ๆ"
  ];
  const defaultLocations = ["7-Eleven", "Lotus's", "Big C", "CJ Express", "Sita Villa", "STEAM", "Grab", "Shopee", "Lazada", "ร้านตามสั่ง", "ร้านผลไม้"];

  // Calculate usage frequency from transaction history
  const platformCounts = {};
  const categoryCounts = {};
  const locationCounts = {};

  transactions.forEach(t => {
    if (t.platform) platformCounts[t.platform] = (platformCounts[t.platform] || 0) + 1;
    if (t.category) categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    if (t.location) locationCounts[t.location] = (locationCounts[t.location] || 0) + 1;
  });

  const sortByFrequency = (arr, countsMap) => {
    return arr.sort((a, b) => {
      const countA = countsMap[a] || 0;
      const countB = countsMap[b] || 0;
      if (countB !== countA) {
        return countB - countA; // Higher count first
      }
      return a.localeCompare(b, "th");
    });
  };

  // Extract and sort unique categories, platforms, and locations by usage frequency
  const rawCategories = [...new Set([...defaultCategories, ...(typeof BUDGET_LIMITS !== "undefined" && BUDGET_LIMITS ? BUDGET_LIMITS.map(b => b.name) : []), ...transactions.map(t => t.category).filter(Boolean)])];
  const categories = sortByFrequency(rawCategories, categoryCounts);

  const rawPlatforms = [...new Set([...defaultPlatforms, ...transactions.map(t => t.platform).filter(Boolean)])];
  const platforms = sortByFrequency(rawPlatforms, platformCounts);

  const rawLocations = [...new Set([...defaultLocations, ...transactions.map(t => t.location).filter(Boolean)])];
  const locations = sortByFrequency(rawLocations, locationCounts);
  
  // Populate category options filter
  catFilter.innerHTML = '<option value="">หมวดหมู่ทั้งหมด</option>';
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    const cnt = categoryCounts[c] || 0;
    opt.innerText = cnt > 0 ? `${c} (${cnt})` : c;
    if (c === selectedCat) opt.selected = true;
    catFilter.appendChild(opt);
  });
  
  // Populate platform options filter
  platFilter.innerHTML = '<option value="">ทุกแพลตฟอร์ม</option>';
  platforms.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    const cnt = platformCounts[p] || 0;
    opt.innerText = cnt > 0 ? `${p} (${cnt})` : p;
    if (p === selectedPlat) opt.selected = true;
    platFilter.appendChild(opt);
  });
  
  // Build autocompletion lists and counts for form entry
  window.autocompleteLists = {
    platform: platforms,
    category: categories,
    location: locations
  };
  window.autocompleteCounts = {
    platform: platformCounts,
    category: categoryCounts,
    location: locationCounts
  };
}

// Calculate date range for current calendar month
function getDefaultMonthRange() {
  const now = new Date();
  let year = now.getFullYear();
  if (year > 2400) year -= 543; // Enforce Gregorian calendar year conversion from Buddhist Era (BE)
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

// Render the comparison table of all months represented in the database
// Monthly Overview Table has been removed.

// Filter dataset on client side
function applyFilters() {
  const searchVal = document.getElementById("filter-search").value.toLowerCase().trim();
  const typeVal = document.getElementById("filter-type").value;
  const catVal = document.getElementById("filter-category").value;
  const platVal = document.getElementById("filter-platform").value;
  const startVal = document.getElementById("filter-start-date").value;
  const endVal = document.getElementById("filter-end-date").value;
  
  filteredTransactions = transactions.filter(t => {
    if (typeVal && t.type !== typeVal) return false;
    if (catVal) {
      if (catVal === "เบ็ดเตล็ดและอื่น ๆ") {
        if (t.type !== "Expense") return false;
        const isDefined = BUDGET_LIMITS.some(b => b.name !== "เบ็ดเตล็ดและอื่น ๆ" && b.name === t.category);
        if (isDefined) return false;
      } else {
        if (t.category !== catVal) return false;
      }
    }
    if (platVal && t.platform !== platVal) return false;
    
    // Interactive dashboard filters
    if (activeRuleFilter) {
      if (t.type === "Income") return false;
      const rule = getCategoryRuleGroup(t.category);
      if (rule !== activeRuleFilter) return false;
    }
    
    if (startVal && t.date < startVal) return false;
    if (endVal && t.date > endVal) return false;
    
    if (searchVal) {
      const matchSearch = 
        t.category.toLowerCase().includes(searchVal) ||
        (t.location && t.location.toLowerCase().includes(searchVal)) ||
        (t.remark && t.remark.toLowerCase().includes(searchVal)) ||
        t.platform.toLowerCase().includes(searchVal);
      if (!matchSearch) return false;
    }
    
    return true;
  });
  
  // Sort client-side
  const sortVal = document.getElementById("filter-sort")?.value || "newest";
  filteredTransactions.sort((a, b) => {
    if (sortVal === "newest") {
      const dDiff = b.date.localeCompare(a.date);
      if (dDiff !== 0) return dDiff;
      return (b.updated_at || 0) - (a.updated_at || 0);
    } else if (sortVal === "oldest") {
      const dDiff = a.date.localeCompare(b.date);
      if (dDiff !== 0) return dDiff;
      return (a.updated_at || 0) - (b.updated_at || 0);
    } else if (sortVal === "amount-desc") {
      return b.total - a.total;
    } else if (sortVal === "amount-asc") {
      return a.total - b.total;
    }
    return 0;
  });
  
  currentPage = 1;
  updateKPIs();
  renderCharts();
  renderBudgetControl();
  renderSavingsGoal();
  renderFinancialRule();
  renderLiabilities();
  renderTransactionsTable();
}

// Reset filters back to default
function resetFilters() {
  document.getElementById("filter-search").value = "";
  document.getElementById("filter-type").value = "";
  document.getElementById("filter-category").value = "";
  document.getElementById("filter-platform").value = "";
  
  activeRuleFilter = "";
  document.querySelectorAll(".rule-row").forEach(el => el.classList.remove("active"));
  
  const { startDate, endDate } = getDefaultMonthRange();
  document.getElementById("filter-start-date").value = startDate;
  document.getElementById("filter-end-date").value = endDate;
  
  const sortDropdown = document.getElementById("filter-sort");
  if (sortDropdown) sortDropdown.value = "newest";
  
  const pageSizeDropdown = document.getElementById("filter-page-size");
  if (pageSizeDropdown) pageSizeDropdown.value = "25";
  itemsPerPage = 25;
  
  // Set Month range tab to active
  const timeButtons = document.querySelectorAll(".time-tab-btn");
  timeButtons.forEach(b => {
    if (b.getAttribute("data-range") === "month") {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  applyFilters();
}

// --- KPI DISPLAY RENDERING ---
function updateKPIs() {
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  let fixedCostsSum = 0;
  
  filteredTransactions.forEach(t => {
    const total = parseFloat(t.total) || 0;
    if (t.type === "Income") {
      totalIncome += total;
      incomeCount++;
    } else {
      totalExpense += total;
      expenseCount++;
      // Check if item is marked as Fixed Cost in Remark or Category
      if (t.remark?.toLowerCase().includes("fixed cost") || t.category === "ค่าอินเตอร์เน็ต") {
        fixedCostsSum += total;
      }
    }
  });
  
  const netBalance = totalIncome - totalExpense;
  
  // Calculate savings rate
  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = (netBalance / totalIncome) * 100;
  }
  
  // Update elements
  document.getElementById("kpi-total-income").innerText = formatCurrency(totalIncome);
  document.getElementById("kpi-income-sub").innerText = `${incomeCount} รายการ`;
  
  document.getElementById("kpi-total-expense").innerText = formatCurrency(totalExpense);
  document.getElementById("kpi-expense-sub").innerText = `${expenseCount} รายการ`;
  
  const balanceEl = document.getElementById("kpi-net-balance");
  balanceEl.innerText = formatCurrency(netBalance);
  if (netBalance >= 0) {
    balanceEl.style.color = "var(--color-income)";
  } else {
    balanceEl.style.color = "var(--color-expense)";
  }
  
  const percentIncome = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(0) : 0;
  document.getElementById("kpi-balance-sub").innerText = netBalance >= 0 
    ? `คงเหลือสุทธิเป็นบวก คิดเป็น ${percentIncome}% ของรายได้ / รายรับ` 
    : `ยอดใช้จ่ายเกินรายได้ / รายรับอยู่ ${formatCurrency(Math.abs(netBalance))}`;
    
  document.getElementById("kpi-savings-rate").innerText = `${savingsRate.toFixed(1)}%`;
  document.getElementById("kpi-savings-sub").innerText = `ค่าใช้จ่ายคงที่ (Fixed Cost): ${formatCurrency(fixedCostsSum)}`;
}

// Budget limits configured by user (v2 array-based schema)
function loadBudgetLimits() {
  const defaults = [
    { id: "b-investment", name: "การลงทุนและเงินออม", limit: 5000.00, type: "variable", ruleGroup: "Savings" },
    { id: "b-food-drink", name: "อาหารและเครื่องดื่ม", limit: 6000.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-housing", name: "ที่พักและสาธารณูปโภค", limit: 3000.00, type: "fixed", ruleGroup: "Needs" },
    { id: "b-telecom", name: "ค่าบริการเครือข่ายสื่อสาร", limit: 700.00, type: "fixed", ruleGroup: "Needs" },
    { id: "b-travel-vehicle", name: "ค่าเดินทางและยานพาหนะ", limit: 2000.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-shopping", name: "ช้อปปิ้งและของใช้", limit: 1500.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-goods-fashion", name: "สินค้าอุปโภคและแฟชั่น", limit: 2000.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-entertainment", name: "ความบันเทิงและสื่อดิจิทัล", limit: 2000.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-health", name: "สุขภาพและเวชภัณฑ์", limit: 1000.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-health-hygiene", name: "สุขภาพและอนามัย", limit: 1000.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-exercise", name: "การออกกำลังกายและสันทนาการ", limit: 1500.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-traveling", name: "การเดินทางท่องเที่ยว", limit: 3000.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-education", name: "การศึกษาและพัฒนาตนเอง", limit: 1500.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-pet", name: "ค่าใช้จ่ายสัตว์เลี้ยง", limit: 1500.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-shipping", name: "บริการจัดส่งและบรรจุภัณฑ์", limit: 500.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-donation", name: "การทำบุญและบริจาค", limit: 500.00, type: "variable", ruleGroup: "Wants" },
    { id: "b-business", name: "ต้นทุนและค่าใช้จ่ายทางธุรกิจ", limit: 5000.00, type: "variable", ruleGroup: "Needs" },
    { id: "b-debt", name: "ภาระหนี้สิน", limit: 3000.00, type: "fixed", ruleGroup: "Needs" },
    { id: "b-others-v2", name: "เบ็ดเตล็ดและอื่น ๆ", limit: 1000.00, type: "variable", ruleGroup: "Wants" }
  ];
  
  const stored = localStorage.getItem("wt_budget_limits_v2");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Force migration if old category structure is detected
      if (parsed.some(b => b.name === "ค่าอาหาร" || b.name === "ค่ายิม" || b.name === "ค่าเดินทาง" || b.name === "อื่นๆ" || b.name === "ค่าบริการอินเทอร์เน็ต" || b.name === "ความบันเทิงและสันทนาการ" || b.name === "การออกกำลังกายและฟิตเนส" || b.name === "ค่าใช้จ่ายทางธุรกิจ (วิลล่า)" || b.name === "การบริการจัดส่งและบรรจุภัณฑ์")) {
        console.log("Migrating budget limits to the new category structure...");
        localStorage.setItem("wt_budget_limits_v2", JSON.stringify(defaults));
        return defaults;
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing stored budget limits v2", e);
    }
  }
  
  return defaults;
}

let BUDGET_LIMITS = loadBudgetLimits();

// --- BUDGET CONTROL PANEL & BREAKDOWN ---
function renderBudgetControl() {
  const listContainer = document.getElementById("budget-breakdown-list");
  if (!listContainer) return;
  
  const budgetSpent = {};
  BUDGET_LIMITS.forEach(b => {
    budgetSpent[b.name] = 0;
  });
  
  // Ensure we have a fallback for items not matching any categories
  let hasOthersCategory = BUDGET_LIMITS.some(b => b.name === "เบ็ดเตล็ดและอื่น ๆ");
  if (!hasOthersCategory) {
    budgetSpent["เบ็ดเตล็ดและอื่น ๆ"] = 0;
  }
  
  // Sum expenses for current filtered transactions
  let totalSpent = 0;
  filteredTransactions.forEach(t => {
    if (t.type !== "Expense") return;
    const amt = parseFloat(t.total) || 0;
    totalSpent += amt;
    if (budgetSpent.hasOwnProperty(t.category)) {
      budgetSpent[t.category] += amt;
    } else {
      budgetSpent["เบ็ดเตล็ดและอื่น ๆ"] += amt;
    }
  });

  // Calculate totalDays and elapsedDays in the filtered range
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startVal = document.getElementById("filter-start-date")?.value;
  const endVal = document.getElementById("filter-end-date")?.value;
  
  let totalDays = 30;
  let elapsedDays = 1;
  let periodDaysInMonth = 30;
  
  if (startVal && endVal) {
    const sDate = new Date(startVal);
    const eDate = new Date(endVal);
    
    // Total days in period
    const diffTime = Math.abs(eDate - sDate);
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Determine days in sDate's month
    periodDaysInMonth = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0).getDate();
    
    // Elapsed days in period
    if (sDate > todayDate) {
      elapsedDays = 0;
    } else {
      const effectiveEnd = (eDate < todayDate) ? eDate : todayDate;
      const elapsedDiffTime = Math.abs(effectiveEnd - sDate);
      elapsedDays = Math.ceil(elapsedDiffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  } else {
    // Fallback: Current month info
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    totalDays = totalDaysInMonth;
    periodDaysInMonth = totalDaysInMonth;
    elapsedDays = now.getDate();
  }

  // Base daily limits (derived dynamically from custom user budget limits)
  const baseDailyLimits = {};
  const scaledLimits = {};
  let totalLimit = 0;
  
  BUDGET_LIMITS.forEach(b => {
    const divisor = periodDaysInMonth || 30;
    baseDailyLimits[b.name] = b.limit / divisor;
    scaledLimits[b.name] = baseDailyLimits[b.name] * totalDays;
    totalLimit += scaledLimits[b.name];
  });
  
  if (!budgetSpent.hasOwnProperty("เบ็ดเตล็ดและอื่น ๆ") && !BUDGET_LIMITS.some(b => b.name === "เบ็ดเตล็ดและอื่น ๆ")) {
    scaledLimits["เบ็ดเตล็ดและอื่น ๆ"] = 0;
    baseDailyLimits["เบ็ดเตล็ดและอื่น ๆ"] = 0;
  }

  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  
  const totalTextEl = document.getElementById("budget-total-text");
  const totalFillEl = document.getElementById("budget-total-fill");
  const totalStatusEl = document.getElementById("budget-total-status");
  const totalPercentEl = document.getElementById("budget-total-percent");
  
  if (totalTextEl) totalTextEl.innerText = `${formatCurrency(totalSpent)} / ${formatCurrency(totalLimit)}`;
  if (totalPercentEl) totalPercentEl.innerText = `${totalPercent.toFixed(0)}%`;
  
  if (totalFillEl) {
    totalFillEl.style.width = `${Math.min(totalPercent, 100)}%`;
    if (totalSpent > totalLimit) {
      totalFillEl.style.backgroundColor = "var(--color-expense)"; // Over budget color
    } else if (totalPercent >= 75) {
      totalFillEl.style.backgroundColor = "#f97316"; // Warning color
    } else {
      totalFillEl.style.backgroundColor = "var(--color-income)"; // Normal color
    }
  }
  
  const remainingDays = Math.max(totalDays - elapsedDays, 0);
  let dailyAvgText = "";
  if (totalSpent < totalLimit && remainingDays > 0) {
    const remainingBudget = totalLimit - totalSpent;
    const dailyAvg = remainingBudget / remainingDays;
    dailyAvgText = ` (เฉลี่ยวันละ ฿${dailyAvg.toLocaleString("th-TH", {maximumFractionDigits: 2})})`;
  }
  
  if (totalStatusEl) {
    if (totalSpent <= totalLimit) {
      totalStatusEl.innerText = `คงเหลือ ฿${(totalLimit - totalSpent).toLocaleString("th-TH", {minimumFractionDigits: 2})}${dailyAvgText}`;
      totalStatusEl.style.color = "var(--color-income)";
    } else {
      totalStatusEl.innerText = `เกินงบ ฿${(totalSpent - totalLimit).toLocaleString("th-TH", {minimumFractionDigits: 2})}`;
      totalStatusEl.style.color = "var(--color-expense)";
    }
  }

  // End-of-month expense projection and risk analysis calculation
  const projectionValEl = document.getElementById("budget-projection-value");
  const riskBadgeEl = document.getElementById("budget-risk-level-badge");
  const riskDescEl = document.getElementById("budget-risk-desc");
  
  if (projectionValEl) {
    const dailyAvgSpent = elapsedDays > 0 ? totalSpent / elapsedDays : 0;
    const projectedSpent = dailyAvgSpent * totalDays;
    
    let projectionText = formatCurrency(projectedSpent);
    if (projectedSpent > totalLimit) {
      const overAmount = projectedSpent - totalLimit;
      projectionText += ` (คาดว่าจะเกินงบ ฿${Math.round(overAmount).toLocaleString()})`;
      projectionValEl.style.color = "var(--color-expense)";
    } else {
      const savedAmount = totalLimit - projectedSpent;
      projectionText += ` (คาดว่าจะประหยัดได้ ฿${Math.round(savedAmount).toLocaleString()})`;
      projectionValEl.style.color = "var(--color-income)";
    }
    projectionValEl.innerText = projectionText;

    // Risk analysis update
    if (riskBadgeEl && riskDescEl) {
      let riskLevel = "ต่ำ";
      let riskClass = "income";
      let riskDesc = "";
      
      if (totalSpent > totalLimit) {
        riskLevel = "สูงมาก (เกินงบแล้ว)";
        riskClass = "expense";
        const overAmt = totalSpent - totalLimit;
        riskDesc = `ยอดใช้จ่ายจริงของคุณเกินงบประมาณที่ตั้งไว้ไปแล้วเป็นจำนวน ฿${Math.round(overAmt).toLocaleString()} แนะนำให้งดใช้จ่ายฟุ่มเฟือยทันทีเพื่อจำกัดความสูญเสียทางบัญชี`;
      } else if (projectedSpent > totalLimit) {
        riskLevel = "สูง (คาดว่าจะเกินงบ)";
        riskClass = "expense";
        const overAmt = projectedSpent - totalLimit;
        const percentOver = ((projectedSpent / totalLimit) - 1) * 100;
        riskDesc = `หากยังใช้จ่ายเฉลี่ยเท่าเดิม คาดว่าจะเกินงบไปประมาณ ฿${Math.round(overAmt).toLocaleString()} (${percentOver.toFixed(0)}%) เมื่อสิ้นสุดช่วงเวลา แนะนำให้ควบคุมการซื้อหมวดหมู่ Wants ด่วน`;
      } else if (projectedSpent >= 0.9 * totalLimit) {
        riskLevel = "ปานกลาง (ค่อนข้างสูง)";
        riskClass = "warning";
        const remainingForecast = totalLimit - projectedSpent;
        riskDesc = `อัตราใช้เงินเฉลี่ยค่อนข้างสูง คาดว่าจะเหลืองบใช้ได้จริงเพียง ฿${Math.round(remainingForecast).toLocaleString()} เมื่อสิ้นสุดช่วงเวลา ควรเริ่มประหยัดระมัดระวังก่อนที่จะสายเกินไป`;
      } else {
        riskLevel = "ต่ำ (ปลอดภัย)";
        riskClass = "income";
        const savedAmt = totalLimit - projectedSpent;
        riskDesc = `ยอดเยี่ยม! วินัยการเงินและอัตราการใช้จ่ายอยู่ในเกณฑ์ที่ดีมาก คาดว่าคุณจะสามารถออมหรือประหยัดงบได้ ฿${Math.round(savedAmt).toLocaleString()} รักษาวินัยที่ดีเช่นนี้ต่อไปครับ`;
      }
      
      riskBadgeEl.innerText = riskLevel;
      riskBadgeEl.className = `type-badge ${riskClass}`;
      if (riskClass === "warning") {
        riskBadgeEl.style.background = "rgba(249, 115, 22, 0.15)";
        riskBadgeEl.style.color = "#f97316";
        riskBadgeEl.style.border = "1px solid rgba(249, 115, 22, 0.25)";
      } else {
        riskBadgeEl.style.background = ""; 
        riskBadgeEl.style.color = "";
        riskBadgeEl.style.border = "";
      }
      riskDescEl.innerText = riskDesc;
    }
  }
  
  // Render details for each budget category
  listContainer.innerHTML = "";
  
  // Extract variable categories from BUDGET_LIMITS
  const variableCategories = BUDGET_LIMITS.filter(b => b.type === "variable");
  
  // If there's spent in "เบ็ดเตล็ดและอื่น ๆ" and it's not a defined category, add it as a variable category row
  if (budgetSpent["เบ็ดเตล็ดและอื่น ๆ"] > 0 && !variableCategories.some(b => b.name === "เบ็ดเตล็ดและอื่น ๆ")) {
    variableCategories.push({ name: "เบ็ดเตล็ดและอื่น ๆ", limit: 0, type: "variable", ruleGroup: "Wants" });
  }
  
  // Filter variable categories based on selected budget tab
  let displayedCategories = [...variableCategories];
  if (activeBudgetTab === "active") {
    displayedCategories = variableCategories.filter(v => (budgetSpent[v.name] || 0) > 0);
  } else if (activeBudgetTab === "needs") {
    displayedCategories = variableCategories.filter(v => v.ruleGroup === "Needs");
  } else if (activeBudgetTab === "wants") {
    displayedCategories = variableCategories.filter(v => v.ruleGroup === "Wants");
  }

  // Sort categories: active ones (spent > 0) first, then alphabetical
  displayedCategories.sort((a, b) => {
    const spentA = budgetSpent[a.name] || 0;
    const spentB = budgetSpent[b.name] || 0;
    if (spentA > 0 && spentB === 0) return -1;
    if (spentA === 0 && spentB > 0) return 1;
    return a.name.localeCompare(b.name, "th");
  });

  if (displayedCategories.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="padding: 24px; text-align: center;">
        <i data-lucide="pie-chart" size="24" style="margin-bottom: 8px; color: var(--text-muted);"></i>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">ไม่พบข้อมูลหมวดหมู่ในกลุ่มนี้</p>
      </div>`;
    lucide.createIcons();
    return;
  }
  
  // Precalculate deficits and positive remaining budgets for deficit distribution
  let totalDeficit = 0;
  let totalPositiveRemaining = 0;
  displayedCategories.forEach(v => {
    const spent = budgetSpent[v.name] || 0;
    const limit = scaledLimits[v.name] || 0;
    const diff = limit - spent;
    if (diff < 0) {
      totalDeficit += Math.abs(diff);
    } else {
      totalPositiveRemaining += diff;
    }
  });
  
  displayedCategories.forEach((catObj, index) => {
    const cat = catObj.name;
    const spent = budgetSpent[cat] || 0;
    const limit = scaledLimits[cat] || 0;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    const dailyLimit = baseDailyLimits[cat] || 0;
    
    let barColor = "var(--color-income)";
    if (spent > limit) {
      barColor = "var(--color-expense)";
    } else if (percent >= 75) {
      barColor = "#f97316";
    }
    
    let statusText = spent > limit
      ? `เกินงบ ฿${(spent - limit).toLocaleString("th-TH", {minimumFractionDigits: 2})}`
      : `คงเหลือ ฿${(limit - spent).toLocaleString("th-TH", {minimumFractionDigits: 2})}`;
      
    const remainingLimit = limit - spent;
    let deficitShare = 0;
    let adjustedRemaining = 0;
    
    if (remainingLimit < 0) {
      adjustedRemaining = 0;
    } else {
      if (totalDeficit > 0) {
        deficitShare = totalPositiveRemaining > 0 ? (remainingLimit / totalPositiveRemaining) * totalDeficit : 0;
        adjustedRemaining = Math.max(0, remainingLimit - deficitShare);
      } else {
        adjustedRemaining = remainingLimit;
      }
    }
    
    const allowedDailyAvgRemaining = remainingDays > 0 ? adjustedRemaining / remainingDays : adjustedRemaining;
    
    // Pace Badge
    const dailyAvgSpent = elapsedDays > 0 ? spent / elapsedDays : 0;
    let paceBadgeHtml = "";
    if (spent > 0 && dailyLimit > 0) {
      if (dailyAvgSpent > dailyLimit) {
        paceBadgeHtml = `<span class="pace-badge danger" title="ใช้เงินเร็วกว่างบเฉลี่ยต่อวัน">⚠️ เกินเฉลี่ยต่อวัน</span>`;
      } else if (dailyAvgSpent > 0.8 * dailyLimit) {
        paceBadgeHtml = `<span class="pace-badge warning" title="ใกล้เต็มเกณฑ์เฉลี่ยต่อวัน">🔔 ใกล้ลิมิตวัน</span>`;
      } else {
        paceBadgeHtml = `<span class="pace-badge success" title="ใช้เงินอยู่ในเกณฑ์แผนเฉลี่ยต่อวัน">✅ ตามแผน</span>`;
      }
    }
    
    const wrapper = document.createElement("div");
    wrapper.className = "budget-category-wrapper";
    wrapper.style.cssText = "display: flex; flex-direction: column; width: 100%; align-items: stretch; text-align: left !important;";
    
    const isFilteredCategory = document.getElementById("filter-category").value === cat;
    const activeClass = isFilteredCategory ? "active" : "";
    
    const ruleGroup = catObj.ruleGroup || getCategoryRuleGroup(cat);
    let ruleGroupText = "ทั่วไป";
    if (ruleGroup === "Needs") ruleGroupText = "จำเป็น (Needs)";
    else if (ruleGroup === "Wants") ruleGroupText = "ทั่วไป (Wants)";
    else if (ruleGroup === "Savings") ruleGroupText = "เงินออม (Savings)";

    wrapper.innerHTML = `
      <div class="breakdown-item ${activeClass}" data-category="${cat}" style="cursor: pointer; padding: 14px 16px; border-radius: 12px; transition: all 0.2s; display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: stretch; text-align: left !important;">
        <!-- Row 1: Name and Amount -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left !important;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; justify-content: flex-start !important; text-align: left !important;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${barColor}; flex-shrink: 0;"></span>
            <strong class="breakdown-item-title" style="font-size: 0.92rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left !important;">${cat}</strong>
          </div>
          <div style="font-size: 0.88rem; flex-shrink: 0; font-weight: 700; text-align: right !important;">
            <span class="breakdown-item-title">${formatCurrency(spent).replace("฿", "")}</span>
            <span class="breakdown-item-sub" style="font-size: 0.8rem; font-weight: 600;"> / ฿${formatCurrency(limit).replace("฿", "")}</span>
          </div>
        </div>

        <!-- Row 2: Pace Badge / Category group and Percentage -->
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 22px; text-align: left !important;">
          <div style="display: flex; align-items: center; min-width: 0; flex: 1; justify-content: flex-start !important; text-align: left !important;">
            ${paceBadgeHtml ? `<div style="text-align: left !important; display: flex; justify-content: flex-start !important;">${paceBadgeHtml}</div>` : `<span class="breakdown-item-sub" style="font-size: 0.78rem; font-weight: 600; text-align: left !important;">${ruleGroupText}</span>`}
          </div>
          <div style="font-size: 0.88rem; font-weight: 700; color: ${spent > limit ? '#ef4444' : 'var(--text-primary)'}; flex-shrink: 0; text-align: right !important;">
            ${percent.toFixed(0)}%
          </div>
        </div>

        <!-- Row 3: Progress Bar -->
        <div class="breakdown-bar-bg" style="height: 8px; border-radius: 4px; overflow: hidden; width: 100%; margin-top: 2px;">
          <div class="breakdown-bar-fill" style="width: 0%; background: ${barColor}; height: 100%; transition: width 0.8s ease-out;"></div>
        </div>
      </div>
      
      <!-- Collapsible Detail Panel (Always Displayed by Default) -->
      <div class="breakdown-detail-panel active" id="detail-panel-${index}" style="margin-top: 10px; margin-bottom: 8px; width: 100%;">
        <div class="detail-math-box" style="padding: 14px 16px; border-radius: 12px; font-size: 0.82rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed var(--glass-border); padding-bottom: 8px;">
            <span class="${spent > limit ? 'math-highlight-red' : 'math-highlight-green'}" style="font-weight: 700; font-size: 0.9rem;">${statusText}</span>
            <span class="math-subtext" style="font-size: 0.82rem;">เฉลี่ยใช้ได้: <strong class="math-highlight-blue" style="font-size: 0.88rem;">฿${allowedDailyAvgRemaining.toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2})}/วัน</strong></span>
          </div>
          <div style="margin-top: 8px; font-size: 0.82rem; line-height: 1.65;">
            <strong style="font-size: 0.86rem; display: block; margin-bottom: 6px;">📊 รายละเอียดการคำนวณ:</strong>
            <div class="math-subtext" style="display: flex; flex-direction: column; gap: 4px;">
              <div>• งบสำหรับช่วงเวลา: <strong>฿${limit.toLocaleString("th-TH", {minimumFractionDigits: 2})}</strong></div>
              <div>• ใช้จ่ายแล้ว: <strong>฿${spent.toLocaleString("th-TH", {minimumFractionDigits: 2})}</strong></div>
              ${spent > limit 
                ? `<div>• <span class="math-highlight-red">ยอดเกินงบประมาณ: ฿${(spent - limit).toLocaleString("th-TH", {minimumFractionDigits: 2})}</span></div>`
                : `<div>• ยอดคงเหลือเบื้องต้น: <strong>฿${remainingLimit.toLocaleString("th-TH", {minimumFractionDigits: 2})}</strong></div>
                   <div>• หักสัดส่วนชดเชยหมวดที่เกิน: <strong>-฿${deficitShare.toLocaleString("th-TH", {minimumFractionDigits: 2})}</strong></div>
                   <div>• ยอดคงเหลือที่ใช้ได้จริง: <strong class="math-highlight-green" style="font-size: 0.92rem;">฿${adjustedRemaining.toLocaleString("th-TH", {minimumFractionDigits: 2})}</strong></div>`
              }
              <div>• วันคงเหลือในรอบ: <strong>${remainingDays} วัน</strong> (เฉลี่ยงบตั้งต้น ฿${dailyLimit.toLocaleString("th-TH", {maximumFractionDigits: 2})}/วัน)</div>
            </div>
          </div>
        </div>
        <div class="detail-txns-title" style="font-size: 0.82rem; font-weight: 700; margin-top: 12px; margin-bottom: 8px;">🧾 รายการล่าสุดในหมวดหมู่นี้:</div>
        <div class="detail-txns-list" id="detail-txns-${index}" style="display: flex; flex-direction: column; gap: 6px;">
          <!-- Loaded dynamically -->
        </div>
      </div>
    `;
    
    listContainer.appendChild(wrapper);
    
    // Animate progress bar in next tick
    setTimeout(() => {
      const fillBar = wrapper.querySelector(".breakdown-bar-fill");
      if (fillBar) fillBar.style.width = `${Math.min(percent, 100)}%`;
    }, 50);
    
    // Load sub-transactions
    const detailTxnContainer = wrapper.querySelector(`#detail-txns-${index}`);
    const catTxns = transactions.filter(t => t.type === "Expense" && t.category === cat).slice(0, 5);
    if (catTxns.length === 0) {
      detailTxnContainer.innerHTML = `<div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); padding: 8px;">ไม่มีรายการใช้จ่ายในหมวดหมู่นี้</div>`;
    } else {
      catTxns.forEach(t => {
        const item = document.createElement("div");
        item.className = "detail-txn-item";
        const [yr, mm, dd] = t.date.split("-");
        const shortDate = `${parseInt(dd, 10)}/${parseInt(mm, 10)}`;
        item.innerHTML = `
          <span>${shortDate} | ${t.location || 'ทั่วไป'} ${t.remark ? `(${t.remark})` : ''}</span>
          <strong style="color: var(--color-expense);">-฿${t.total.toLocaleString("th-TH", {minimumFractionDigits: 2})}</strong>
        `;
        detailTxnContainer.appendChild(item);
      });
    }
    
    // Toggle Collapse Handler
    const breakdownItem = wrapper.querySelector(".breakdown-item");
    const detailPanel = wrapper.querySelector(".breakdown-detail-panel");
    
    breakdownItem.addEventListener("click", () => {
      const isCurrentlyActive = breakdownItem.classList.contains("active");
      
      // Toggle active classes on breakdown items and details
      document.querySelectorAll(".breakdown-item").forEach(item => {
        if (item !== breakdownItem) item.classList.remove("active");
      });
      document.querySelectorAll(".breakdown-detail-panel").forEach(panel => {
        if (panel !== detailPanel) panel.classList.remove("active");
      });
      
      if (isCurrentlyActive) {
        breakdownItem.classList.remove("active");
        detailPanel.classList.remove("active");
        
        document.getElementById("filter-category").value = "";
        applyFilters();
      } else {
        breakdownItem.classList.add("active");
        detailPanel.classList.add("active");
        
        document.getElementById("filter-category").value = cat;
        
        activeRuleFilter = "";
        document.querySelectorAll(".rule-row").forEach(el => el.classList.remove("active"));
        
        applyFilters();
      }
    });
  });
}

// --- BUDGET SETTINGS PANEL ENGINE ---
function initBudgetSettings() {
  const toggleBtn = document.getElementById("btn-toggle-budget-settings");
  const modal = document.getElementById("budget-modal");
  const form = document.getElementById("budget-settings-form");
  const cancelBtn = document.getElementById("btn-cancel-budget");
  const closeBtn = document.getElementById("btn-close-budget-modal");
  const addRowBtn = document.getElementById("btn-add-budget-row");
  
  if (!toggleBtn || !modal || !form || !cancelBtn || !addRowBtn || !closeBtn) return;

  // Open settings modal
  toggleBtn.addEventListener("click", () => {
    renderBudgetsEditorList();
    modal.classList.add("active");
  });

  // Close settings modal
  const closeModalFunc = () => {
    modal.classList.remove("active");
  };

  cancelBtn.addEventListener("click", closeModalFunc);
  closeBtn.addEventListener("click", closeModalFunc);

  // Add new budget row
  addRowBtn.addEventListener("click", () => {
    const container = document.getElementById("budget-categories-editor-list");
    if (container) {
      addBudgetEditorRow(container);
    }
  });

  // Submit and save custom budgets
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const container = document.getElementById("budget-categories-editor-list");
    const rows = container.querySelectorAll(".budget-editor-row");
    
    const newLimits = [];
    let hasError = false;
    
    rows.forEach(row => {
      const id = row.getAttribute("data-id");
      const name = row.querySelector(".editor-cat-name").value.trim();
      const limit = parseFloat(row.querySelector(".editor-cat-limit").value);
      const type = row.querySelector(".editor-cat-type").value;
      const ruleGroup = row.querySelector(".editor-cat-rule").value;
      
      if (!name || isNaN(limit) || limit < 0) {
        hasError = true;
        return;
      }
      
      newLimits.push({ id, name, limit, type, ruleGroup });
    });
    
    if (hasError) {
      showStatus("กรุณากรอกข้อมูลหมวดหมู่และงบประมาณให้ครบถ้วนถูกต้อง", "error");
      return;
    }
    
    // Save to global state and LocalStorage
    saveBudgetLimits(newLimits);
    closeModalFunc();
    
    // Rerender budgets and dashboard metrics
    renderBudgetControl();
    renderFinancialRule();
    showStatus("บันทึกการตั้งค่างบประมาณใหม่สำเร็จ", "success");
  });
}

function renderBudgetsEditorList() {
  const container = document.getElementById("budget-categories-editor-list");
  if (!container) return;
  container.innerHTML = "";
  
  BUDGET_LIMITS.forEach(b => {
    addBudgetEditorRow(container, b);
  });
  
  calculateEditorTotal();
}

function addBudgetEditorRow(container, data = { id: "", name: "อาหารและเครื่องดื่ม", limit: 0, type: "variable", ruleGroup: "Needs" }) {
  if (!data.name) {
    data.name = "อาหารและเครื่องดื่ม";
  }
  const rowId = data.id || "b-" + generateId();
  const div = document.createElement("div");
  div.className = "budget-editor-row";
  div.setAttribute("data-id", rowId);
  
  const masterDefaultCategories = [
    "การลงทุนและเงินออม",
    "อาหารและเครื่องดื่ม",
    "ที่พักและสาธารณูปโภค",
    "ค่าบริการเครือข่ายสื่อสาร",
    "ค่าเดินทางและยานพาหนะ",
    "ช้อปปิ้งและของใช้",
    "สินค้าอุปโภคและแฟชั่น",
    "ความบันเทิงและสื่อดิจิทัล",
    "สุขภาพและเวชภัณฑ์",
    "สุขภาพและอนามัย",
    "การออกกำลังกายและสันทนาการ",
    "การเดินทางท่องเที่ยว",
    "การศึกษาและพัฒนาตนเอง",
    "ค่าใช้จ่ายสัตว์เลี้ยง",
    "บริการจัดส่งและบรรจุภัณฑ์",
    "การทำบุญและบริจาค",
    "ต้นทุนและค่าใช้จ่ายทางธุรกิจ",
    "ภาระหนี้สิน",
    "เบ็ดเตล็ดและอื่น ๆ",
    "หมวดหมู่อื่น ๆ"
  ];

  const currentBudgetNames = (typeof BUDGET_LIMITS !== "undefined" && BUDGET_LIMITS) ? BUDGET_LIMITS.map(b => b.name) : [];
  const txnCatNames = (typeof transactions !== "undefined" && transactions) ? transactions.map(t => t.category).filter(Boolean) : [];

  const categoriesList = [...new Set([
    ...masterDefaultCategories,
    ...currentBudgetNames,
    ...txnCatNames,
    ...(data.name ? [data.name] : [])
  ])].sort((a, b) => a.localeCompare(b, "th"));

  let catOptionsHtml = "";
  categoriesList.forEach(cat => {
    const isSelected = data.name === cat ? "selected" : "";
    catOptionsHtml += `<option value="${cat}" ${isSelected}>${cat}</option>`;
  });

  const categoryDefaults = {
    "การลงทุนและเงินออม": { type: "variable", ruleGroup: "Savings" },
    "อาหารและเครื่องดื่ม": { type: "variable", ruleGroup: "Needs" },
    "ที่พักและสาธารณูปโภค": { type: "fixed", ruleGroup: "Needs" },
    "ค่าบริการเครือข่ายสื่อสาร": { type: "fixed", ruleGroup: "Needs" },
    "ค่าเดินทางและยานพาหนะ": { type: "variable", ruleGroup: "Needs" },
    "ช้อปปิ้งและของใช้": { type: "variable", ruleGroup: "Wants" },
    "สินค้าอุปโภคและแฟชั่น": { type: "variable", ruleGroup: "Wants" },
    "ความบันเทิงและสื่อดิจิทัล": { type: "variable", ruleGroup: "Wants" },
    "สุขภาพและเวชภัณฑ์": { type: "variable", ruleGroup: "Needs" },
    "สุขภาพและอนามัย": { type: "variable", ruleGroup: "Needs" },
    "การออกกำลังกายและสันทนาการ": { type: "variable", ruleGroup: "Wants" },
    "การเดินทางท่องเที่ยว": { type: "variable", ruleGroup: "Wants" },
    "การศึกษาและพัฒนาตนเอง": { type: "variable", ruleGroup: "Needs" },
    "ค่าใช้จ่ายสัตว์เลี้ยง": { type: "variable", ruleGroup: "Needs" },
    "บริการจัดส่งและบรรจุภัณฑ์": { type: "variable", ruleGroup: "Wants" },
    "การทำบุญและบริจาค": { type: "variable", ruleGroup: "Wants" },
    "ต้นทุนและค่าใช้จ่ายทางธุรกิจ": { type: "variable", ruleGroup: "Needs" },
    "ภาระหนี้สิน": { type: "fixed", ruleGroup: "Needs" },
    "เบ็ดเตล็ดและอื่น ๆ": { type: "variable", ruleGroup: "Wants" },
    "หมวดหมู่อื่น ๆ": { type: "variable", ruleGroup: "Wants" }
  };

  div.innerHTML = `
    <select class="form-input editor-cat-name" required style="padding: 6px 12px; font-size: 0.8rem; cursor: pointer; color: var(--text-primary); background: var(--bg-gradient-start); width: 100%;">
      ${catOptionsHtml}
    </select>
    <input type="number" class="form-input editor-cat-limit" placeholder="งบ (บาท)" value="${data.limit}" required min="0" style="padding: 6px 8px; font-size: 0.8rem; width: 100%;">
    <select class="form-input editor-cat-type" style="padding: 6px 16px 6px 6px; font-size: 0.75rem; cursor: pointer; color: var(--text-primary); background: var(--bg-gradient-start); width: 100%;">
      <option value="variable" ${data.type === "variable" ? "selected" : ""}>ผันแปร</option>
      <option value="fixed" ${data.type === "fixed" ? "selected" : ""}>คงที่</option>
    </select>
    <select class="form-input editor-cat-rule" style="padding: 6px 16px 6px 6px; font-size: 0.75rem; cursor: pointer; color: var(--text-primary); background: var(--bg-gradient-start); width: 100%;">
      <option value="Needs" ${data.ruleGroup === "Needs" ? "selected" : ""}>Needs</option>
      <option value="Wants" ${data.ruleGroup === "Wants" ? "selected" : ""}>Wants</option>
      <option value="Savings" ${data.ruleGroup === "Savings" ? "selected" : ""}>Savings</option>
    </select>
    <button type="button" class="action-btn delete-btn btn-remove-budget-row" style="padding: 6px; background: rgba(239, 68, 68, 0.1); border-radius: 6px; color: var(--color-expense); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="ลบหมวดหมู่">
      <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
    </button>
  `;
  
  // Auto-fill type and ruleGroup on category select change
  const catSelect = div.querySelector(".editor-cat-name");
  catSelect.addEventListener("change", (e) => {
    const selectedCat = e.target.value;
    const defaults = categoryDefaults[selectedCat];
    if (defaults) {
      div.querySelector(".editor-cat-type").value = defaults.type;
      div.querySelector(".editor-cat-rule").value = defaults.ruleGroup;
    }
  });

  // Bind input listeners to recalculate total dynamically
  div.querySelector(".editor-cat-limit").addEventListener("input", calculateEditorTotal);
  
  // Bind remove row
  div.querySelector(".btn-remove-budget-row").addEventListener("click", () => {
    div.remove();
    calculateEditorTotal();
  });
  
  container.appendChild(div);
  lucide.createIcons();
}

function calculateEditorTotal() {
  const container = document.getElementById("budget-categories-editor-list");
  if (!container) return;
  const limits = container.querySelectorAll(".editor-cat-limit");
  let sum = 0;
  limits.forEach(input => {
    sum += parseFloat(input.value) || 0;
  });
  document.getElementById("label-calc-total-budget").innerText = formatCurrency(sum);
}

function saveBudgetLimits(limits) {
  localStorage.setItem("wt_budget_limits_v2", JSON.stringify(limits));
  BUDGET_LIMITS = limits;
}

// --- SAVINGS GOAL PLANNER ENGINE ---
function renderSavingsGoal() {
  const displayPanel = document.getElementById("savings-display-panel");
  const settingsPanel = document.getElementById("savings-settings-panel");
  const toggleBtn = document.getElementById("btn-toggle-savings-settings");
  
  if (!displayPanel || !settingsPanel || !toggleBtn) return;
  
  displayPanel.innerHTML = "";
  
  if (savingsGoals.length === 0) {
    displayPanel.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 24px 12px; background: rgba(255, 255, 255, 0.01); border: 1px solid var(--glass-border); border-radius: 12px;">
        ไม่มีเป้าหมายการออมเงิน
      </div>
    `;
    return;
  }
  
  // Sum net balance for the current month as actual current month's savings
  const now = new Date();
  let currentYear = now.getFullYear();
  if (currentYear > 2400) currentYear -= 543;
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;
  
  transactions.forEach(t => {
    if (t.date && t.date.substring(0, 7) === currentMonthKey) {
      const amt = parseFloat(t.total) || 0;
      if (t.type === "Income") {
        currentMonthIncome += amt;
      } else {
        currentMonthExpense += amt;
      }
    }
  });
  
  const currentMonthSavingsActual = Math.max(0, currentMonthIncome - currentMonthExpense);
  
  savingsGoals.forEach(g => {
    const targetAmount = parseFloat(g.target) || 0;
    const currentSavings = parseFloat(g.current) || 0;
    const allocation = parseFloat(g.allocationPercent) || 0;
    
    const remainingMonths = calculateRemainingMonths(g.targetMonth);
    const targetDateObj = new Date(g.targetMonth + "-01");
    const thShortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const targetFormatted = `${thShortMonths[targetDateObj.getMonth()]} ${targetDateObj.getFullYear() > 2400 ? targetDateObj.getFullYear() : targetDateObj.getFullYear() + 543}`;
    
    const allocatedCurrentMonthSavings = currentMonthSavingsActual * (allocation / 100);
    const accumulatedSavings = currentSavings + allocatedCurrentMonthSavings;
    const progressPercent = targetAmount > 0 ? (accumulatedSavings / targetAmount) * 100 : 0;
    const missingAmount = Math.max(0, targetAmount - accumulatedSavings);
    
    // Monthly milestone required
    const requiredMonthly = remainingMonths > 0 ? Math.max(0, targetAmount - currentSavings) / remainingMonths : 0;
    
    // Status check
    let statusBadgeHtml = "";
    let statusColor = "var(--text-secondary)";
    if (allocatedCurrentMonthSavings >= requiredMonthly && requiredMonthly > 0) {
      statusColor = "var(--color-income)";
      statusBadgeHtml = `<span class="type-tag income" style="font-size: 0.7rem; padding: 2px 6px;">🎉 ออมสำเร็จ!</span>`;
    } else {
      const shortAmount = requiredMonthly - allocatedCurrentMonthSavings;
      statusBadgeHtml = `<span class="type-tag expense" style="font-size: 0.7rem; padding: 2px 6px;">⏳ ขาดอีก ${formatCurrency(shortAmount).replace(".00", "")}</span>`;
    }
    
    const goalItem = document.createElement("div");
    goalItem.className = "savings-goal-item";
    goalItem.style.cssText = "background: rgba(255, 255, 255, 0.01); border: 1px solid var(--glass-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; transition: all 0.2s;";
    
    goalItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <div style="display: flex; flex-direction: column; gap: 2px; flex: 1;">
          <strong style="font-size: 1rem; color: var(--text-primary);">${g.name}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">ถึง ${targetFormatted} (เหลืออีก ${remainingMonths} เดือน)</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          <button class="action-btn edit-btn" title="แก้ไขเป้าหมาย" onclick="editSavingsGoal('${g.id}')" style="padding: 4px; border-radius: 50%;">
            <i data-lucide="edit-3" size="14"></i>
          </button>
          <button class="action-btn delete-btn" title="ลบเป้าหมาย" onclick="deleteSavingsGoal('${g.id}')" style="padding: 4px; border-radius: 50%;">
            <i data-lucide="trash-2" size="14"></i>
          </button>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
        <span style="color: var(--text-secondary);">ความคืบหน้าสะสม</span>
        <strong>${formatCurrency(accumulatedSavings)} / ${formatCurrency(targetAmount)}</strong>
      </div>

      <!-- Savings Accumulation Bar -->
      <div class="breakdown-bar-bg" style="height: 10px;">
        <div class="breakdown-bar-fill" style="width: ${Math.min(progressPercent, 100)}%; background: var(--color-secondary); height: 100%; transition: width 0.3s;"></div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: -4px;">
        <span>${missingAmount > 0 ? `ขาดอีก ${formatCurrency(missingAmount)}` : "สำเร็จตามเป้าสะสมแล้ว!"}</span>
        <span style="font-weight: 600;">${progressPercent.toFixed(0)}%</span>
      </div>

      <div style="border-top: 1px dashed var(--glass-border); padding-top: 10px; margin-top: 2px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
          <span style="color: var(--text-secondary);">เป้าออมเดือนนี้ (สัดส่วน ${allocation}%)</span>
          <strong>${formatCurrency(requiredMonthly)} / เดือน</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
          <span style="color: var(--text-secondary);">ยอดออมจัดสรรแล้วเดือนนี้:</span>
          <strong>${formatCurrency(allocatedCurrentMonthSavings)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; margin-top: 2px;">
          <span style="font-weight: 600; color: ${statusColor};">สถานะความสำเร็จ:</span>
          ${statusBadgeHtml}
        </div>
      </div>
    `;
    
    displayPanel.appendChild(goalItem);
  });
  
  lucide.createIcons();
}

let editingSavingsGoalId = null;

window.editSavingsGoal = function(id) {
  const goal = savingsGoals.find(g => g.id === id);
  if (!goal) return;
  
  editingSavingsGoalId = id;
  
  const panel = document.getElementById("savings-settings-panel");
  panel.style.display = "block";
  
  document.getElementById("input-savings-name").value = goal.name;
  document.getElementById("input-savings-target").value = goal.target;
  document.getElementById("input-savings-current").value = goal.current;
  document.getElementById("input-savings-date").value = goal.targetMonth;
  document.getElementById("input-savings-allocation").value = goal.allocationPercent;
  
  const title = panel.querySelector("h4");
  if (title) title.innerText = "แก้ไขเป้าหมายการออมเงิน";
  const submitBtn = document.getElementById("btn-save-savings");
  if (submitBtn) submitBtn.innerText = "บันทึกการแก้ไข";
  
  panel.scrollIntoView({ behavior: 'smooth' });
};

window.deleteSavingsGoal = function(id) {
  const goal = savingsGoals.find(g => g.id === id);
  if (!goal) return;
  
  if (confirm(`คุณต้องการลบเป้าหมายการออมเงิน "${goal.name}" ใช่หรือไม่?`)) {
    savingsGoals = savingsGoals.filter(g => g.id !== id);
    saveSavingsGoals();
    renderSavingsGoal();
    showStatus("ลบเป้าหมายการออมเงินสำเร็จ", "success");
  }
};

// Bind Savings Goal settings actions
function initSavingsGoalSettings() {
  const toggleBtn = document.getElementById("btn-toggle-savings-settings");
  const panel = document.getElementById("savings-settings-panel");
  const form = document.getElementById("savings-settings-form");
  const cancelBtn = document.getElementById("btn-cancel-savings");
  
  if (!toggleBtn || !panel || !form || !cancelBtn) return;
  
  toggleBtn.addEventListener("click", () => {
    if (panel.style.display === "none") {
      editingSavingsGoalId = null;
      document.getElementById("input-savings-name").value = "";
      document.getElementById("input-savings-target").value = "";
      document.getElementById("input-savings-current").value = "0";
      document.getElementById("input-savings-date").value = "";
      
      // Calculate remaining percentage left to assign
      let totalAssigned = 0;
      savingsGoals.forEach(g => {
        totalAssigned += g.allocationPercent;
      });
      const remainingPercent = Math.max(0, 100 - totalAssigned);
      document.getElementById("input-savings-allocation").value = remainingPercent;
      
      const title = panel.querySelector("h4");
      if (title) title.innerText = "เพิ่มเป้าหมายการออมเงินใหม่";
      const submitBtn = document.getElementById("btn-save-savings");
      if (submitBtn) submitBtn.innerText = "บันทึก";
      panel.style.display = "block";
    } else {
      panel.style.display = "none";
    }
  });
  
  cancelBtn.addEventListener("click", () => {
    editingSavingsGoalId = null;
    panel.style.display = "none";
  });
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("input-savings-name").value.trim();
    const target = parseFloat(document.getElementById("input-savings-target").value);
    const current = parseFloat(document.getElementById("input-savings-current").value);
    const dateVal = document.getElementById("input-savings-date").value;
    const allocation = parseInt(document.getElementById("input-savings-allocation").value);
    
    if (!name || isNaN(target) || isNaN(current) || !dateVal || isNaN(allocation)) {
      showStatus("กรุณากรอกข้อมูลเป้าหมายการออมให้ถูกต้อง", "error");
      return;
    }
    
    // Check allocation sum validation
    let totalAllocationOfOthers = 0;
    savingsGoals.forEach(g => {
      if (g.id !== editingSavingsGoalId) {
        totalAllocationOfOthers += g.allocationPercent;
      }
    });
    
    if (totalAllocationOfOthers + allocation > 100) {
      showStatus(`ผลรวมส่วนแบ่งของทุกแผนต้องไม่เกิน 100% (ขณะนี้ส่วนแบ่งแผนอื่นๆ รวมกันได้ ${totalAllocationOfOthers}% ส่วนแบ่งแผนนี้กรอกได้ไม่เกิน ${100 - totalAllocationOfOthers}%)`, "error");
      return;
    }
    
    if (editingSavingsGoalId) {
      const idx = savingsGoals.findIndex(g => g.id === editingSavingsGoalId);
      if (idx !== -1) {
        savingsGoals[idx] = {
          id: editingSavingsGoalId,
          name: name,
          target: target,
          current: current,
          targetMonth: dateVal,
          allocationPercent: allocation
        };
        showStatus("แก้ไขเป้าหมายการออมเงินสำเร็จ", "success");
      }
      editingSavingsGoalId = null;
    } else {
      const newGoal = {
        id: "sg-" + generateId(),
        name: name,
        target: target,
        current: current,
        targetMonth: dateVal,
        allocationPercent: allocation
      };
      savingsGoals.push(newGoal);
      showStatus("เพิ่มเป้าหมายการออมเงินใหม่สำเร็จ", "success");
    }
    
    saveSavingsGoals();
    panel.style.display = "none";
    
    renderSavingsGoal();
  });
}

// --- 50/30/20 BUDGET RULE ANALYSIS ENGINE ---
function renderFinancialRule() {
  const needsText = document.getElementById("rule-needs-text");
  const wantsText = document.getElementById("rule-wants-text");
  const savingsText = document.getElementById("rule-savings-text");
  const adviceEl = document.getElementById("rule-advice-box");
  
  if (!needsText || !wantsText || !savingsText || !adviceEl) return;
  
  // Get active month's income and expense categorization
  const now = new Date();
  let currentYear = now.getFullYear();
  if (currentYear > 2400) currentYear -= 543;
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let totalIncome = 0;
  let spentNeeds = 0;
  let spentWants = 0;
  
  transactions.forEach(t => {
    if (t.date && t.date.substring(0, 7) === currentMonthKey) {
      const amt = parseFloat(t.total) || 0;
      if (t.type === "Income") {
        totalIncome += amt;
      } else {
        const cat = t.category;
        const isFixed = t.remark?.toLowerCase().includes("fixed cost");
        const ruleGroup = getCategoryRuleGroup(cat);
        
        if (ruleGroup === "Needs" || isFixed) {
          spentNeeds += amt;
        } else if (ruleGroup === "Wants") {
          spentWants += amt;
        } else if (ruleGroup === "Savings") {
          // Savings categories transactions are excluded from spentNeeds/spentWants
          // which automatically counts them towards actualSavings.
        } else {
          spentWants += amt;
        }
      }
    }
  });
  
  // Savings = Income - Needs - Wants (Actual savings)
  const actualSavings = Math.max(0, totalIncome - spentNeeds - spentWants);
  
  // Percentages calculated out of total income
  const needsPercent = totalIncome > 0 ? (spentNeeds / totalIncome) * 100 : 0;
  const wantsPercent = totalIncome > 0 ? (spentWants / totalIncome) * 100 : 0;
  const savingsPercent = totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0;
  
  // Update texts
  needsText.innerText = `${needsPercent.toFixed(0)}% (${formatCurrency(spentNeeds).replace(".00", "")})`;
  wantsText.innerText = `${wantsPercent.toFixed(0)}% (${formatCurrency(spentWants).replace(".00", "")})`;
  savingsText.innerText = `${savingsPercent.toFixed(0)}% (${formatCurrency(actualSavings).replace(".00", "")})`;
  
  // Update progress bar widths
  document.getElementById("rule-needs-fill").style.width = `${Math.min(needsPercent * 2, 100)}%`; 
  document.getElementById("rule-wants-fill").style.width = `${Math.min(wantsPercent * 3.33, 100)}%`;
  document.getElementById("rule-savings-fill").style.width = `${Math.min(savingsPercent * 5, 100)}%`;
  
  // Adjust progress bar colors dynamically if they exceed targets
  if (needsPercent > 50) {
    document.getElementById("rule-needs-fill").style.backgroundColor = "var(--color-expense)";
  } else {
    document.getElementById("rule-needs-fill").style.backgroundColor = "var(--color-primary)";
  }
  
  if (wantsPercent > 30) {
    document.getElementById("rule-wants-fill").style.backgroundColor = "var(--color-expense)";
  } else {
    document.getElementById("rule-wants-fill").style.backgroundColor = "#f59e0b";
  }
  
  // Highlight active rule filter row
  document.querySelectorAll(".rule-row").forEach(row => {
    const rule = row.getAttribute("data-rule");
    if (activeRuleFilter === rule) {
      row.classList.add("active");
    } else {
      row.classList.remove("active");
    }
  });
  
  // Financial advice engine
  let advice = "";
  if (totalIncome === 0) {
    advice = "💡 ยังไม่มีข้อมูลรายได้ / รายรับในเดือนนี้ เริ่มบันทึกรายได้ / รายรับเพื่อให้ระบบวิเคราะห์กฎ 50/30/20";
  } else if (needsPercent > 50 && wantsPercent > 30) {
    advice = "⚠️ คุณใช้เงินเกินเป้าหมายทั้งส่วนจำเป็น (Needs > 50%) และความบันเทิง (Wants > 30%) ส่งผลให้เงินออมน้อยกว่าเกณฑ์ แนะนำลดค่าใช้จ่ายฟุ่มเฟือยด่วน!";
  } else if (needsPercent > 50) {
    advice = "💡 ค่าใช้จ่ายจำเป็น (Needs) สูงเกิน 50% แนะนำให้ลองตรวจสอบ Fixed Cost เช่น ค่าแพ็คเกจเน็ตหรือค่ายิมว่าสามารถปรับลดลงเพื่อเพิ่มเงินออมได้หรือไม่";
  } else if (wantsPercent > 30) {
    advice = "💡 ค่าใช้จ่ายตามใจตนเอง (Wants) สูงเกิน 30% แนะนำให้ลองลดค่าความบันเทิงหรือช้อปปิ้ง เพื่อผันเงินกลับเข้าสู่ส่วนของเงินออมเพื่อการลงทุน";
  } else if (savingsPercent < 20) {
    advice = "💡 ยอดเงินออมจริงต่ำกว่า 20% พยายามลดค่าใช้จ่ายที่ไม่จำเป็นลงอีกนิด เพื่อสร้างวินัยการออมและเงินสำรองฉุกเฉินให้มั่นคงขึ้น";
  } else {
    advice = "🎉 ยอดเยี่ยมมาก! การจัดสรรเงินของคุณอยู่ในเกณฑ์ดีเยี่ยม สามารถออมได้มากกว่า 20% ตามแผน รักษาวินัยการเงินนี้ไว้ต่อไปครับ";
  }
  
  adviceEl.innerText = advice;
}

// --- LIABILITIES & DEBT TRACKER ENGINE ---
function getCrDebts() {
  const crDebts = [];
  const now = new Date();
  let currentYear = now.getFullYear();
  if (currentYear > 2400) currentYear -= 543;
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const crPlatforms = [...new Set(transactions.map(t => t.platform).filter(p => p && p.trim().toLowerCase().startsWith("cr.")))];
  
  crPlatforms.forEach(p => {
    let balance = 0;
    let payment = 0;
    
    transactions.forEach(t => {
      if (t.platform === p) {
        const amt = parseFloat(t.total) || 0;
        if (t.type === "Expense") {
          balance += amt;
          if (t.date && t.date.substring(0, 7) === currentMonthKey) {
            payment += amt;
          }
        } else if (t.type === "Income") {
          balance -= amt;
        }
      }
      if (t.linkDebtId === `cr-platform-${p}`) {
        const amt = parseFloat(t.total) || 0;
        if (t.type === "Expense") {
          balance -= amt;
        }
      }
    });
    
    balance = Math.max(0, balance);
    
    if (balance > 0 || payment > 0) {
      crDebts.push({
        id: `cr-platform-${p}`,
        name: p,
        balance: balance,
        payment: payment,
        isAuto: true
      });
    }
  });
  
  return crDebts;
}

function populateDebtDropdown() {
  const dropdown = document.getElementById("form-link-debt");
  if (!dropdown) return;
  dropdown.innerHTML = "";
  
  const crDebts = getCrDebts();
  const allDebts = [...debts, ...crDebts];
  
  if (allDebts.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.innerText = "ไม่พบข้อมูลหนี้สินในระบบ";
    opt.disabled = true;
    opt.selected = true;
    dropdown.appendChild(opt);
    return;
  }
  
  allDebts.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.innerText = `${d.name} (คงเหลือ ฿${d.balance.toLocaleString("th-TH", {minimumFractionDigits: 2})})`;
    dropdown.appendChild(opt);
  });
}

function renderLiabilities() {
  const totalBalanceText = document.getElementById("dsr-total-balance-text");
  const totalPaymentText = document.getElementById("dsr-total-payment-text");
  const percentageText = document.getElementById("dsr-percentage-text");
  const gaugeFill = document.getElementById("dsr-gauge-fill");
  const alertBadge = document.getElementById("dsr-alert-badge");
  const listContainer = document.getElementById("debts-list-container");
  
  if (!totalBalanceText || !totalPaymentText || !percentageText || !gaugeFill || !alertBadge || !listContainer) return;
  
  const now = new Date();
  let currentYear = now.getFullYear();
  if (currentYear > 2400) currentYear -= 543;
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const crDebts = getCrDebts();
  
  let totalBalance = 0;
  let totalPayment = 0;
  debts.forEach(d => {
    totalBalance += parseFloat(d.balance) || 0;
    totalPayment += parseFloat(d.payment) || 0;
  });

  crDebts.forEach(d => {
    totalBalance += d.balance;
    totalPayment += d.payment;
  });
  
  // Calculate current month's income
  let currentMonthIncome = 0;
  transactions.forEach(t => {
    if (t.date && t.date.substring(0, 7) === currentMonthKey) {
      const amt = parseFloat(t.total) || 0;
      if (t.type === "Income") {
        currentMonthIncome += amt;
      }
    }
  });
  
  let dsr = 0;
  if (currentMonthIncome > 0) {
    dsr = (totalPayment / currentMonthIncome) * 100;
  }
  
  totalBalanceText.innerText = formatCurrency(totalBalance);
  totalPaymentText.innerText = formatCurrency(totalPayment) + " / เดือน";
  percentageText.innerText = `${dsr.toFixed(1)}%`;
  
  gaugeFill.style.width = `${Math.min(dsr, 100)}%`;
  
  if (dsr <= 30) {
    gaugeFill.style.backgroundColor = "var(--color-income)";
    alertBadge.className = "type-tag income";
    alertBadge.innerHTML = `<i data-lucide="check-circle" size="12"></i> ปลอดภัย (DSR <= 30%)`;
  } else if (dsr <= 40) {
    gaugeFill.style.backgroundColor = "#eab308";
    alertBadge.className = "type-tag warning";
    alertBadge.innerHTML = `<i data-lucide="alert-circle" size="12"></i> เฝ้าระวัง (DSR 30% - 40%)`;
  } else {
    gaugeFill.style.backgroundColor = "var(--color-expense)";
    alertBadge.className = "type-tag expense";
    alertBadge.innerHTML = `<i data-lucide="alert-triangle" size="12"></i> อันตราย! (DSR > 40%)`;
  }
  
  listContainer.innerHTML = "";
  const allDebtsToRender = [...debts, ...crDebts];
  if (allDebtsToRender.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 12px;">
        ไม่มีหนี้สินค้างชำระ
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  allDebtsToRender.forEach(d => {
    const item = document.createElement("div");
    item.className = "debt-item";
    item.style.cssText = "background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;";
    
    let actionHtml = "";
    if (d.isAuto) {
      actionHtml = `
        <div style="display: flex; align-items: center; gap: 4px;">
          <span class="type-tag income" style="font-size: 0.7rem; padding: 2px 6px; background: rgba(16, 185, 129, 0.1); color: var(--color-income); border: 1px solid rgba(16, 185, 129, 0.2); user-select: none;">Auto (Cr.)</span>
        </div>
      `;
    } else {
      actionHtml = `
        <div style="display: flex; gap: 4px;">
          <button class="action-btn edit-btn" title="แก้ไขหนี้สิน" onclick="editDebt('${d.id}')">
            <i data-lucide="edit-3" size="14"></i>
          </button>
          <button class="action-btn delete-btn" title="ลบหนี้สิน" onclick="deleteDebt('${d.id}')">
            <i data-lucide="trash-2" size="14"></i>
          </button>
        </div>
      `;
    }
    
    item.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${d.name}</span>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">
          ยอดค้าง: ฿${d.balance.toLocaleString("th-TH", {minimumFractionDigits: 2})} | ผ่อน: ฿${d.payment.toLocaleString("th-TH", {minimumFractionDigits: 2})}/เดือน
        </span>
      </div>
      ${actionHtml}
    `;
    listContainer.appendChild(item);
  });
  
  lucide.createIcons();
}

window.deleteDebt = function(id) {
  const debt = debts.find(d => d.id === id);
  if (!debt) return;
  if (confirm(`คุณต้องการลบข้อมูลหนี้สิน "${debt.name}" ใช่หรือไม่?`)) {
    debts = debts.filter(d => d.id !== id);
    saveDebts();
    renderLiabilities();
    populateDebtDropdown();
    showStatus("ลบข้อมูลหนี้สินสำเร็จ", "success");
  }
};

let editingDebtId = null;

window.editDebt = function(id) {
  const debt = debts.find(d => d.id === id);
  if (!debt) return;
  
  editingDebtId = id;
  
  const panel = document.getElementById("debt-settings-panel");
  panel.style.display = "block";
  
  document.getElementById("input-debt-name").value = debt.name;
  document.getElementById("input-debt-balance").value = debt.balance;
  document.getElementById("input-debt-payment").value = debt.payment;
  
  const title = panel.querySelector("h4");
  if (title) title.innerText = "แก้ไขข้อมูลหนี้สิน";
  const submitBtn = document.getElementById("btn-save-debt");
  if (submitBtn) submitBtn.innerText = "บันทึกการแก้ไข";
};

function initLiabilities() {
  const toggleBtn = document.getElementById("btn-toggle-debt-settings");
  const panel = document.getElementById("debt-settings-panel");
  const form = document.getElementById("debt-settings-form");
  const cancelBtn = document.getElementById("btn-cancel-debt");
  
  if (!toggleBtn || !panel || !form || !cancelBtn) return;
  
  toggleBtn.addEventListener("click", () => {
    if (panel.style.display === "none") {
      editingDebtId = null;
      document.getElementById("input-debt-name").value = "";
      document.getElementById("input-debt-balance").value = "";
      document.getElementById("input-debt-payment").value = "";
      
      const title = panel.querySelector("h4");
      if (title) title.innerText = "เพิ่มข้อมูลหนี้สินใหม่";
      const submitBtn = document.getElementById("btn-save-debt");
      if (submitBtn) submitBtn.innerText = "บันทึก";
      panel.style.display = "block";
    } else {
      panel.style.display = "none";
    }
  });
  
  cancelBtn.addEventListener("click", () => {
    editingDebtId = null;
    document.getElementById("input-debt-name").value = "";
    document.getElementById("input-debt-balance").value = "";
    document.getElementById("input-debt-payment").value = "";
    
    const title = panel.querySelector("h4");
    if (title) title.innerText = "เพิ่มข้อมูลหนี้สินใหม่";
    const submitBtn = document.getElementById("btn-save-debt");
    if (submitBtn) submitBtn.innerText = "บันทึก";
    panel.style.display = "none";
  });
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("input-debt-name").value.trim();
    const balance = parseFloat(document.getElementById("input-debt-balance").value);
    const payment = parseFloat(document.getElementById("input-debt-payment").value);
    
    if (!name || isNaN(balance) || isNaN(payment)) {
      showStatus("กรุณากรอกข้อมูลหนี้สินให้ถูกต้อง", "error");
      return;
    }
    
    if (editingDebtId) {
      const idx = debts.findIndex(d => d.id === editingDebtId);
      if (idx !== -1) {
        debts[idx].name = name;
        debts[idx].balance = balance;
        debts[idx].payment = payment;
        showStatus("แก้ไขข้อมูลหนี้สินสำเร็จ", "success");
      }
      editingDebtId = null;
    } else {
      const newDebt = {
        id: "debt-" + generateId(),
        name: name,
        balance: balance,
        payment: payment
      };
      debts.push(newDebt);
      showStatus("เพิ่มหนี้สินสำเร็จ", "success");
    }
    
    saveDebts();
    
    document.getElementById("input-debt-name").value = "";
    document.getElementById("input-debt-balance").value = "";
    document.getElementById("input-debt-payment").value = "";
    
    const title = panel.querySelector("h4");
    if (title) title.innerText = "เพิ่มข้อมูลหนี้สินใหม่";
    const submitBtn = document.getElementById("btn-save-debt");
    if (submitBtn) submitBtn.innerText = "บันทึก";
    
    panel.style.display = "none";
    
    renderLiabilities();
    populateDebtDropdown();
  });
}

function initModalSubtype() {
  const switchDirect = document.getElementById("form-switch-subtype-direct");
  const switchDebt = document.getElementById("form-switch-subtype-debt");
  const subtypeField = document.getElementById("form-expense-subtype");
  const debtGroup = document.getElementById("form-debt-select-group");
  
  if (!switchDirect || !switchDebt || !subtypeField || !debtGroup) return;
  
  switchDirect.addEventListener("click", () => {
    subtypeField.value = "direct";
    switchDirect.classList.add("active");
    switchDebt.classList.remove("active");
    debtGroup.style.display = "none";
  });
  
  switchDebt.addEventListener("click", () => {
    subtypeField.value = "debt";
    switchDebt.classList.add("active");
    switchDirect.classList.remove("active");
    debtGroup.style.display = "block";
    populateDebtDropdown();
  });
}

// --- TREND COMPARISON ENGINE ---
function populateTrendSelectors(labels) {
  const primarySelect = document.getElementById("trend-primary-month");
  const refSelect = document.getElementById("trend-reference-month");
  if (!primarySelect || !refSelect) return;

  // Save current selections to restore them if possible
  const prevPrimary = primarySelect.value;
  const prevRef = refSelect.value;

  // Clear existing options
  primarySelect.innerHTML = "";
  refSelect.innerHTML = "";

  if (labels.length === 0) {
    primarySelect.innerHTML = '<option value="">ไม่พบประวัติรายการในระบบ</option>';
    refSelect.innerHTML = '<option value="">ไม่พบประวัติรายการในระบบ</option>';
    primarySelect.disabled = true;
    refSelect.disabled = true;
    return;
  }

  primarySelect.disabled = false;
  refSelect.disabled = false;

  // Sort labels chronologically descending (newest first)
  const sortedMonths = [...labels].reverse();
  const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  // Populate primary select (only months)
  sortedMonths.forEach(mKey => {
    const [yr, mo] = mKey.split("-");
    const mName = thMonths[parseInt(mo, 10) - 1];
    const displayStr = `${mName} ${yr.substring(2)}`;

    const optPrimary = document.createElement("option");
    optPrimary.value = mKey;
    optPrimary.innerText = displayStr;
    primarySelect.appendChild(optPrimary);
  });

  // Populate reference select (special historical option + individual months)
  const optHistAvg = document.createElement("option");
  optHistAvg.value = "historical-average";
  optHistAvg.innerText = "ค่าเฉลี่ยเดือนที่ผ่านมาทั้งหมด";
  refSelect.appendChild(optHistAvg);

  sortedMonths.forEach(mKey => {
    const [yr, mo] = mKey.split("-");
    const mName = thMonths[parseInt(mo, 10) - 1];
    const displayStr = `${mName} ${yr.substring(2)}`;

    const optRef = document.createElement("option");
    optRef.value = mKey;
    optRef.innerText = displayStr;
    refSelect.appendChild(optRef);
  });

  // Default selections
  const now = new Date();
  let currentYear = now.getFullYear();
  if (currentYear > 2400) currentYear -= 543;
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let selectedPrimary = sortedMonths[0]; // default to newest
  if (prevPrimary && sortedMonths.includes(prevPrimary)) {
    selectedPrimary = prevPrimary;
  } else if (sortedMonths.includes(currentMonthKey)) {
    selectedPrimary = currentMonthKey;
  }
  primarySelect.value = selectedPrimary;

  // Reference month default: "historical-average"
  let selectedRef = "historical-average";
  if (prevRef && (prevRef === "historical-average" || sortedMonths.includes(prevRef))) {
    selectedRef = prevRef;
  }
  refSelect.value = selectedRef;
}

function updateTrendComparison() {
  const container = document.getElementById("trend-cards-container");
  const primarySelect = document.getElementById("trend-primary-month");
  const refSelect = document.getElementById("trend-reference-month");
  if (!container || !primarySelect || !refSelect) return;

  const primaryKey = primarySelect.value;
  const refKey = refSelect.value;

  if (!primaryKey || !refKey) {
    container.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); padding: 12px 16px; border-radius: 8px; color: var(--text-muted); font-size: 0.85rem; width: 100%;">
        กรุณาเลือกเดือนเพื่อคำนวณแนวโน้ม
      </div>
    `;
    return;
  }

  if (primaryKey === refKey) {
    container.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); padding: 12px 16px; border-radius: 8px; color: var(--text-muted); font-size: 0.85rem; width: 100%;">
        กรุณาเลือกเดือนเปรียบเทียบที่แตกต่างกันเพื่อดูความเปลี่ยนแปลง
      </div>
    `;
    return;
  }

  const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const getMonthName = (key) => {
    const [yr, mo] = key.split("-");
    const mName = thMonths[parseInt(mo, 10) - 1];
    return `${mName} ${yr.substring(2)}`;
  };

  const primaryData = chartMonthlyData[primaryKey] || { income: 0, expense: 0 };
  
  let prevIncome = 0;
  let prevExpense = 0;
  let refName = "";

  if (refKey === "historical-average") {
    // Calculate average of all historical months preceding the primary month
    const labels = Object.keys(chartMonthlyData);
    const primaryIdx = labels.indexOf(primaryKey);
    const olderMonths = primaryIdx > 0 ? labels.slice(0, primaryIdx) : [];

    if (olderMonths.length === 0) {
      container.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); padding: 12px 16px; border-radius: 8px; color: var(--text-muted); font-size: 0.85rem; width: 100%;">
          ไม่มีข้อมูลของเดือนก่อนหน้าเพื่อคำนวณค่าเฉลี่ยประวัติศาสตร์
        </div>
      `;
      return;
    }

    let sumIncome = 0;
    let sumExpense = 0;
    olderMonths.forEach(m => {
      sumIncome += chartMonthlyData[m].income;
      sumExpense += chartMonthlyData[m].expense;
    });

    prevIncome = sumIncome / olderMonths.length;
    prevExpense = sumExpense / olderMonths.length;
    refName = "ค่าเฉลี่ยเดือนที่ผ่านมา";
  } else {
    const refData = chartMonthlyData[refKey] || { income: 0, expense: 0 };
    prevIncome = refData.income;
    prevExpense = refData.expense;
    refName = getMonthName(refKey);
  }

  const latestIncome = primaryData.income;
  const latestExpense = primaryData.expense;

  const incomeDiff = latestIncome - prevIncome;
  let incomePercent = 0;
  if (prevIncome > 0) {
    incomePercent = (incomeDiff / prevIncome) * 100;
  } else if (incomeDiff > 0) {
    incomePercent = 100;
  }

  const expenseDiff = latestExpense - prevExpense;
  let expensePercent = 0;
  if (prevExpense > 0) {
    expensePercent = (expenseDiff / prevExpense) * 100;
  } else if (expenseDiff > 0) {
    expensePercent = 100;
  }

  const formatDiff = (diff) => {
    const sign = diff >= 0 ? "+" : "-";
    return `${sign}฿${Math.abs(Math.round(diff)).toLocaleString()}`;
  };

  const formatPercent = (percent) => {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  const incColor = incomeDiff >= 0 ? "var(--color-income)" : "var(--color-expense)";
  const expColor = expenseDiff > 0 ? "var(--color-expense)" : "var(--color-income)";

  const primaryMonthName = getMonthName(primaryKey);

  container.innerHTML = `
    <div class="trend-card" style="flex: 1; min-width: 200px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); padding: 14px 18px; border-radius: 12px; display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">แนวโน้มรายได้ / รายรับ (${primaryMonthName})</span>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: ${incomeDiff >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'}; display: flex; align-items: center; justify-content: center;">
          <i data-lucide="${incomeDiff >= 0 ? 'trending-up' : 'trending-down'}" style="color: ${incColor}; width: 16px; height: 16px;"></i>
        </div>
      </div>
      <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
        <span style="font-size: 1.25rem; font-weight: 700; color: ${incColor};">${formatPercent(incomePercent)}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">${formatDiff(incomeDiff)}</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">
        เทียบกับ (${refName})
      </div>
    </div>
    
    <div class="trend-card" style="flex: 1; min-width: 200px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); padding: 14px 18px; border-radius: 12px; display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">แนวโน้มค่าใช้จ่าย (${primaryMonthName})</span>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: ${expenseDiff > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; display: flex; align-items: center; justify-content: center;">
          <i data-lucide="${expenseDiff > 0 ? 'trending-up' : 'trending-down'}" style="color: ${expColor}; width: 16px; height: 16px;"></i>
        </div>
      </div>
      <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px;">
        <span style="font-size: 1.25rem; font-weight: 700; color: ${expColor};">${formatPercent(expensePercent)}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">${formatDiff(expenseDiff)}</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">
        เทียบกับ (${refName})
      </div>
    </div>
  `;
  // Re-trigger lucide icons since we added new icon elements dynamically
  lucide.createIcons();
}

// --- DYNAMIC DATA VISUALIZATION (CHART.JS) ---
function renderCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded. Skipping chart rendering.");
    return;
  }
  const ctx = document.getElementById("monthlyChart").getContext("2d");
  
  // Destroy existing chart if it exists
  if (monthlyChart) {
    monthlyChart.destroy();
  }
  
  // Calculate sums by Month and Type (use full transactions list to show all months)
  const monthlyData = {};
  
  // Sort oldest first for time sequence plotting
  const chronologicalTxns = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  
  chronologicalTxns.forEach(t => {
    if (!t.date) return;
    const monthKey = t.date.substring(0, 7); // "YYYY-MM"
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    const val = parseFloat(t.total) || 0;
    if (t.type === "Income") {
      monthlyData[monthKey].income += val;
    } else {
      monthlyData[monthKey].expense += val;
    }
  });
  
  const labels = Object.keys(monthlyData);
  
  if (labels.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  
  // Map monthly data labels into Thai presentation names
  const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const displayLabels = labels.map(key => {
    const [yr, mo] = key.split("-");
    const mName = thMonths[parseInt(mo, 10) - 1];
    return `${mName} ${yr.substring(2)}`;
  });
  
  const incomes = labels.map(k => monthlyData[k].income);
  const expenses = labels.map(k => monthlyData[k].expense);
  
  // Styles based on theme (light/dark)
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.05)";
  const textColor = isDark ? "#94a3b8" : "#475569";
  
  // Save computed monthly aggregates to global state for comparison selectors
  chartMonthlyData = monthlyData;

  // Populate trend selectors and trigger rendering of trend cards
  populateTrendSelectors(labels);
  updateTrendComparison();

  // Custom Datalabels plugin to draw values on top of bars
  const datalabelsPlugin = {
    id: 'customDatalabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = 'bold 9px "Outfit", "Noto Sans Thai", sans-serif';
      
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (meta.hidden) return;
        
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          if (val > 0) {
            const formattedVal = "฿" + Math.round(val).toLocaleString();
            ctx.fillStyle = isDark ? '#cbd5e1' : '#1e293b';
            ctx.fillText(formattedVal, bar.x, bar.y - 4);
          }
        });
      });
      ctx.restore();
    }
  };
  
  // Chart.js initialization
  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: displayLabels,
      datasets: [
        {
          label: "รายได้ / รายรับ (Income)",
          data: incomes,
          backgroundColor: isDark ? "rgba(16, 185, 129, 0.7)" : "rgba(5, 150, 105, 0.85)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: "ค่าใช้จ่าย (Expenses)",
          data: expenses,
          backgroundColor: isDark ? "rgba(244, 63, 94, 0.7)" : "rgba(225, 29, 72, 0.85)",
          borderColor: "rgba(244, 63, 94, 1)",
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          const clickedMonthKey = labels[index];
          const [yr, mo] = clickedMonthKey.split("-");
          const yrNum = parseInt(yr, 10);
          const moNum = parseInt(mo, 10);
          const lastDay = new Date(yrNum, moNum, 0).getDate();
          
          const targetStart = `${clickedMonthKey}-01`;
          const targetEnd = `${clickedMonthKey}-${String(lastDay).padStart(2, "0")}`;

          const currentStart = document.getElementById("filter-start-date").value;
          const currentEnd = document.getElementById("filter-end-date").value;

          if (currentStart === targetStart && currentEnd === targetEnd) {
            resetFilters();
            showStatus("ยกเลิกการเลือกเดือน แสดงข้อมูลทั้งหมดแล้ว", "info");
          } else {
            document.getElementById("filter-start-date").value = targetStart;
            document.getElementById("filter-end-date").value = targetEnd;
            document.querySelectorAll(".time-tab-btn").forEach(b => b.classList.remove("active"));
            applyFilters();
            showStatus(`กรองแสดงเฉพาะข้อมูลเดือน ${displayLabels[index]}`, "success");
          }
        }
      },
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = (chartElement && chartElement.length > 0) ? 'pointer' : 'default';
      },
      layout: {
        padding: {
          top: 24
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: "'Outfit', 'Noto Sans Thai'" } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "'Outfit', 'Noto Sans Thai'" },
            callback: function(value) { return "฿" + value.toLocaleString(); }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: isDark ? "#f8fafc" : "#0f172a",
            font: { family: "'Outfit', 'Noto Sans Thai'", size: 12 }
          }
        },
        tooltip: {
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
          titleColor: isDark ? "#fff" : "#000",
          bodyColor: isDark ? "#fff" : "#000",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          callbacks: {
            label: function(context) {
              return " " + context.dataset.label.split(" ")[0] + ": " + formatCurrency(context.raw);
            }
          }
        }
      }
    },
    plugins: [datalabelsPlugin]
  });

  // --- 2. Category Breakdown Chart (Doughnut Chart) ---
  const categoryCanvas = document.getElementById("categoryChart");
  if (categoryCanvas) {
    if (categoryChart) categoryChart.destroy();
    
    const catSums = {};
    let totalExpenseSum = 0;
    
    filteredTransactions.forEach(t => {
      if (t.type !== "Expense") return;
      const cat = t.category || "เบ็ดเตล็ดและอื่น ๆ";
      const amt = parseFloat(t.total) || 0;
      catSums[cat] = (catSums[cat] || 0) + amt;
      totalExpenseSum += amt;
    });

    const sortedCats = Object.keys(catSums).sort((a, b) => catSums[b] - catSums[a]);
    const catLabels = sortedCats;
    const catData = sortedCats.map(c => catSums[c]);

    const palette = [
      "#38bdf8", "#818cf8", "#f43f5e", "#fbbf24", "#34d399",
      "#a78bfa", "#fb923c", "#2dd4bf", "#f472b6", "#a3e635", "#cbd5e1"
    ];

    const ctxCat = categoryCanvas.getContext("2d");
    if (catLabels.length === 0) {
      ctxCat.clearRect(0, 0, ctxCat.canvas.width, ctxCat.canvas.height);
    } else {
      categoryChart = new Chart(ctxCat, {
        type: "doughnut",
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: palette.slice(0, catLabels.length),
            borderColor: isDark ? "#0f172a" : "#ffffff",
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (event, elements) => {
            if (elements && elements.length > 0) {
              const index = elements[0].index;
              const clickedCat = catLabels[index];
              const currentCat = document.getElementById("filter-category").value;

              if (currentCat === clickedCat) {
                document.getElementById("filter-category").value = "";
                applyFilters();
                showStatus("ยกเลิกการเลือกหมวดหมู่ แสดงข้อมูลทั้งหมดแล้ว", "info");
              } else {
                document.getElementById("filter-category").value = clickedCat;
                activeRuleFilter = "";
                document.querySelectorAll(".rule-row").forEach(el => el.classList.remove("active"));
                applyFilters();
                showStatus(`กรองแสดงเฉพาะหมวดหมู่ "${clickedCat}"`, "success");
              }
            }
          },
          onHover: (event, chartElement) => {
            event.native.target.style.cursor = (chartElement && chartElement.length > 0) ? 'pointer' : 'default';
          },
          plugins: {
            legend: {
              display: true,
              position: "right",
              labels: {
                color: isDark ? "#f8fafc" : "#0f172a",
                font: { family: "'Outfit', 'Noto Sans Thai'", size: 11 },
                boxWidth: 12,
                padding: 10,
                generateLabels: function(chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const val = data.datasets[0].data[i];
                      const pct = totalExpenseSum > 0 ? ((val / totalExpenseSum) * 100).toFixed(0) : 0;
                      const formattedBaht = "฿" + Math.round(val).toLocaleString();
                      return {
                        text: `${label}: ${formattedBaht} (${pct}%)`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor,
                        lineWidth: 1,
                        hidden: isNaN(data.datasets[0].data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            tooltip: {
              backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
              titleColor: isDark ? "#fff" : "#000",
              bodyColor: isDark ? "#fff" : "#000",
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  const pct = totalExpenseSum > 0 ? ((val / totalExpenseSum) * 100).toFixed(1) : 0;
                  return ` ${context.label}: ฿${val.toLocaleString("th-TH", {minimumFractionDigits: 2})} (${pct}%)`;
                }
              }
            }
          },
          cutout: "60%"
        }
      });
    }
  }

  // --- 3. Location / Merchant Breakdown Chart (Horizontal Bar Chart) ---
  const locationCanvas = document.getElementById("locationChart");
  if (locationCanvas) {
    if (locationChart) locationChart.destroy();

    const locSums = {};
    filteredTransactions.forEach(t => {
      if (t.type !== "Expense") return;
      const loc = (t.location && t.location.trim()) ? t.location.trim() : "ทั่วไป/ไม่ระบุ";
      const amt = parseFloat(t.total) || 0;
      locSums[loc] = (locSums[loc] || 0) + amt;
    });

    const sortedLocs = Object.keys(locSums).sort((a, b) => locSums[b] - locSums[a]).slice(0, 8); // Top 8 locations
    const locLabels = sortedLocs;
    const locData = sortedLocs.map(l => locSums[l]);

    const ctxLoc = locationCanvas.getContext("2d");
    if (locLabels.length === 0) {
      ctxLoc.clearRect(0, 0, ctxLoc.canvas.width, ctxLoc.canvas.height);
    } else {
      const datalabelsLocPlugin = {
        id: 'customDatalabelsLoc',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
          const isDark = document.documentElement.getAttribute("data-theme") === "dark";
          ctx.save();
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 10px "Outfit", "Noto Sans Thai", sans-serif';

          const meta = chart.getDatasetMeta(0);
          meta.data.forEach((bar, index) => {
            const val = locData[index];
            if (val > 0) {
              const formattedVal = " ฿" + Math.round(val).toLocaleString();
              ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
              ctx.fillText(formattedVal, bar.x + 6, bar.y);
            }
          });
          ctx.restore();
        }
      };

      locationChart = new Chart(ctxLoc, {
        type: "bar",
        data: {
          labels: locLabels,
          datasets: [{
            label: "ยอดใช้จ่าย (฿)",
            data: locData,
            backgroundColor: isDark ? "rgba(245, 158, 11, 0.75)" : "rgba(217, 119, 6, 0.85)",
            borderColor: "#f59e0b",
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          onClick: (event, elements) => {
            if (elements && elements.length > 0) {
              const index = elements[0].index;
              const clickedLoc = locLabels[index];
              const currentSearch = document.getElementById("filter-search").value.trim();

              const searchTarget = (clickedLoc === "ทั่วไป/ไม่ระบุ") ? "" : clickedLoc;
              if (currentSearch === searchTarget && searchTarget !== "") {
                document.getElementById("filter-search").value = "";
                applyFilters();
                showStatus("ยกเลิกการกรองสถานที่/ผู้รับเงิน แสดงข้อมูลทั้งหมดแล้ว", "info");
              } else {
                document.getElementById("filter-search").value = searchTarget;
                applyFilters();
                showStatus(`กรองแสดงเฉพาะสถานที่/ผู้รับเงิน "${clickedLoc}"`, "success");
              }
            }
          },
          onHover: (event, chartElement) => {
            event.native.target.style.cursor = (chartElement && chartElement.length > 0) ? 'pointer' : 'default';
          },
          layout: {
            padding: {
              right: 60
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: "'Outfit', 'Noto Sans Thai'" },
                callback: function(value) { return "฿" + value.toLocaleString(); }
              }
            },
            y: {
              grid: { display: false },
              ticks: {
                color: isDark ? "#f8fafc" : "#0f172a",
                font: { family: "'Outfit', 'Noto Sans Thai'", size: 11, weight: 'bold' }
              }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
              titleColor: isDark ? "#fff" : "#000",
              bodyColor: isDark ? "#fff" : "#000",
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              callbacks: {
                label: function(context) {
                  return ` ยอดใช้จ่าย: ฿${parseFloat(context.raw).toLocaleString("th-TH", {minimumFractionDigits: 2})}`;
                }
              }
            }
          }
        },
        plugins: [datalabelsLocPlugin]
      });
    }
  }
}

// --- TRANSACTIONS LIST / TABLE CONTROLLER ---
function renderTransactionsTable() {
  const tbody = document.getElementById("transactions-body");
  
  // Reset header checkbox and bulk delete button
  const checkAll = document.getElementById("check-all");
  if (checkAll) checkAll.checked = false;
  updateBulkDeleteButtonState();
  
  if (filteredTransactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <i data-lucide="inbox" size="32"></i>
            <p>ไม่พบประวัติรายการในระบบ</p>
          </div>
        </td>
      </tr>`;
    document.getElementById("pagination-info").innerText = "แสดงรายการ 0 - 0 จากทั้งหมด 0 รายการ";
    document.getElementById("btn-prev-page").disabled = true;
    document.getElementById("btn-next-page").disabled = true;
    lucide.createIcons();
    return;
  }
  
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Clamp page bounds
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const pageItems = filteredTransactions.slice(startIndex, endIndex);
  
  tbody.innerHTML = "";
  
  pageItems.forEach(t => {
    const tr = document.createElement("tr");
    
    // Format presentation date (e.g. 2026-05-02 -> 02/05/2026)
    const [yr, mm, dd] = t.date.split("-");
    const displayDate = `${parseInt(dd, 10)}/${parseInt(mm, 10)}/${yr}`;
    
    const isIncome = t.type === "Income";
    const typeClass = isIncome ? "income" : "expense";
    const typeText = isIncome ? "รายได้ / รายรับ" : "ค่าใช้จ่าย";
    
    // Amount formatting with symbol prefix
    const amtPrefix = isIncome ? "+ " : "- ";
    const amtClass = isIncome ? "income" : "expense";
    
    const amountDisplay = t.total === 0 ? "-" : `${amtPrefix}${formatCurrency(t.total).replace("฿", "")}`;
    const amountClassAttr = t.total === 0 ? "amount-text" : `amount-text ${amtClass}`;
    
    tr.innerHTML = `
      <td style="text-align: center;">
        <input type="checkbox" class="txn-checkbox" data-id="${t.id}" style="cursor: pointer; transform: scale(1.1);">
      </td>
      <td>${displayDate}</td>
      <td>
        <span class="type-badge ${typeClass}">
          <i data-lucide="${isIncome ? "arrow-up-right" : "arrow-down-left"}" size="12"></i>
          ${typeText}
        </span>
      </td>
      <td><span class="platform-tag">${t.platform}</span></td>
      <td class="${amountClassAttr}">${amountDisplay}</td>
      <td><strong>${t.category}</strong></td>
      <td>${t.location || '<span style="color:var(--text-muted); font-style:italic;">-</span>'}</td>
      <td>
        <span style="font-size:0.85rem; color:var(--text-secondary);">
          ${t.remark || ''}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn edit-btn" title="แก้ไขข้อมูล" onclick="openEditModal('${t.id}')">
            <i data-lucide="edit-3" size="16"></i>
          </button>
          <button class="action-btn delete-btn" title="ลบรายการ" onclick="confirmDelete('${t.id}', '${t.category}', ${t.total})">
            <i data-lucide="trash-2" size="16"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Update pagination info text and button triggers
  if (itemsPerPage >= 999999) {
    document.getElementById("pagination-info").innerText = `แสดงทั้งหมด ${totalItems} รายการ`;
  } else {
    document.getElementById("pagination-info").innerText = `แสดงรายการ ${startIndex + 1} - ${endIndex} จากทั้งหมด ${totalItems} รายการ`;
  }
  document.getElementById("btn-prev-page").disabled = currentPage === 1;
  document.getElementById("btn-next-page").disabled = currentPage === totalPages || totalPages === 0;
  
  lucide.createIcons();
}

// --- MODAL DIALOG ENGINE ---

function openAddModal() {
  document.getElementById("modal-title").innerText = "บันทึกรายการใหม่";
  document.getElementById("form-id").value = "";
  
  // Reset Slip Upload Panel state
  const slipStatus = document.getElementById("slip-upload-status");
  const slipProgress = document.getElementById("slip-progress-bar-container");
  const slipProgressFill = document.getElementById("slip-progress-bar-fill");
  const slipInput = document.getElementById("input-slip-file");
  if (slipStatus) {
    slipStatus.style.display = "none";
    slipStatus.innerText = "";
    slipStatus.className = "slip-status-text";
  }
  if (slipProgress) slipProgress.style.display = "none";
  if (slipProgressFill) slipProgressFill.style.width = "0%";
  if (slipInput) slipInput.value = "";
  
  // Preset default form values
  const today = new Date();
  const tzOffset = today.getTimezoneOffset() * 60000; // local time zone offset
  const localISODate = (new Date(today - tzOffset)).toISOString().split("T")[0];
  
  document.getElementById("form-date").value = localISODate;
  document.getElementById("form-total").value = "";
  document.getElementById("form-platform").value = "";
  document.getElementById("form-category").value = "";
  document.getElementById("form-location").value = "";
  document.getElementById("form-remark").value = "";
  
  // Reset subtype switches
  const subtypeField = document.getElementById("form-expense-subtype");
  if (subtypeField) subtypeField.value = "direct";
  const switchDirect = document.getElementById("form-switch-subtype-direct");
  const switchDebt = document.getElementById("form-switch-subtype-debt");
  if (switchDirect) switchDirect.classList.add("active");
  if (switchDebt) switchDebt.classList.remove("active");
  const debtGroup = document.getElementById("form-debt-select-group");
  if (debtGroup) debtGroup.style.display = "none";
  
  // Reset form switch type
  setFormSwitch("Expense");
  
  document.getElementById("txn-modal").classList.add("active");
}

window.openEditModal = function(id) {
  const txn = transactions.find(t => t.id === id);
  if (!txn) return;
  
  // Reset Slip Upload Panel state
  const slipStatus = document.getElementById("slip-upload-status");
  const slipProgress = document.getElementById("slip-progress-bar-container");
  const slipProgressFill = document.getElementById("slip-progress-bar-fill");
  const slipInput = document.getElementById("input-slip-file");
  if (slipStatus) {
    slipStatus.style.display = "none";
    slipStatus.innerText = "";
    slipStatus.className = "slip-status-text";
  }
  if (slipProgress) slipProgress.style.display = "none";
  if (slipProgressFill) slipProgressFill.style.width = "0%";
  if (slipInput) slipInput.value = "";
  
  document.getElementById("modal-title").innerText = "แก้ไขข้อมูล";
  document.getElementById("form-id").value = txn.id;
  document.getElementById("form-date").value = txn.date;
  document.getElementById("form-total").value = txn.total;
  document.getElementById("form-platform").value = txn.platform;
  document.getElementById("form-category").value = txn.category;
  document.getElementById("form-location").value = txn.location || "";
  document.getElementById("form-remark").value = txn.remark || "";
  
  // Load subtype and debt linkage
  const subtypeField = document.getElementById("form-expense-subtype");
  const subtype = txn.subtype || "direct";
  if (subtypeField) subtypeField.value = subtype;
  
  const switchDirect = document.getElementById("form-switch-subtype-direct");
  const switchDebt = document.getElementById("form-switch-subtype-debt");
  
  if (subtype === "debt") {
    if (switchDebt) switchDebt.classList.add("active");
    if (switchDirect) switchDirect.classList.remove("active");
    const debtGroup = document.getElementById("form-debt-select-group");
    if (debtGroup) debtGroup.style.display = "block";
    populateDebtDropdown();
    const linkDebtSelect = document.getElementById("form-link-debt");
    if (linkDebtSelect && txn.linkDebtId) {
      linkDebtSelect.value = txn.linkDebtId;
    }
  } else {
    if (switchDirect) switchDirect.classList.add("active");
    if (switchDebt) switchDebt.classList.remove("active");
    const debtGroup = document.getElementById("form-debt-select-group");
    if (debtGroup) debtGroup.style.display = "none";
  }
  
  setFormSwitch(txn.type);
  
  document.getElementById("txn-modal").classList.add("active");
};

function closeModal() {
  document.getElementById("txn-modal").classList.remove("active");
  // Hide suggestion list boxes if open
  closeAllSuggestions();
}

function setFormSwitch(type) {
  const expenseBtn = document.getElementById("form-switch-expense");
  const incomeBtn = document.getElementById("form-switch-income");
  const typeField = document.getElementById("form-type");
  const subtypeGroup = document.getElementById("form-expense-type-group");
  const debtGroup = document.getElementById("form-debt-select-group");
  const subtypeField = document.getElementById("form-expense-subtype");
  
  typeField.value = type;
  
  if (type === "Expense") {
    expenseBtn.classList.add("active");
    incomeBtn.classList.remove("active");
    if (subtypeGroup) subtypeGroup.style.display = "block";
    if (debtGroup && subtypeField && subtypeField.value === "debt") {
      debtGroup.style.display = "block";
      populateDebtDropdown();
    } else if (debtGroup) {
      debtGroup.style.display = "none";
    }
  } else {
    incomeBtn.classList.add("active");
    expenseBtn.classList.remove("active");
    if (subtypeGroup) subtypeGroup.style.display = "none";
    if (debtGroup) debtGroup.style.display = "none";
  }
}

// User Action verification popups
window.confirmDelete = function(id, category, amount) {
  const formattedText = `คุณแน่ใจหรือไม่ที่จะต้องการลบรายการ:\n"${category}" จำนวน ${formatCurrency(amount)}?`;
  if (confirm(formattedText)) {
    deleteTransaction(id);
  }
};

// --- FORM AUTOLOAD & AUTOCOMPLETE ENGINE ---
function initAutocomplete() {
  const fields = ["platform", "category", "location"];
  
  fields.forEach(field => {
    const input = document.getElementById(`form-${field}`);
    const list = document.getElementById(`suggestions-${field}`);
    const wrapper = input ? input.closest(".autocomplete-wrapper") : null;
    if (!input || !list) return;

    const renderList = (filterText = "") => {
      const val = filterText.trim().toLowerCase();
      let suggestions = window.autocompleteLists ? (window.autocompleteLists[field] || []) : [];

      // Smart category prioritization based on selected transaction type (Income vs Expense)
      if (field === "category") {
        const formType = document.getElementById("form-type")?.value || "Expense";
        const incomeCategories = ["รายได้จากการทำงาน", "เงินเดือน", "โบนัส", "ดอกเบี้ยและปันผล", "ธุรกิจส่วนตัว", "รายได้อื่น ๆ"];
        const incSet = new Set(incomeCategories);
        if (formType === "Income") {
          const incList = suggestions.filter(s => incSet.has(s));
          const otherList = suggestions.filter(s => !incSet.has(s));
          suggestions = [...incList, ...otherList];
        } else {
          const expList = suggestions.filter(s => !incSet.has(s));
          const incList = suggestions.filter(s => incSet.has(s));
          suggestions = [...expList, ...incList];
        }
      }

      const matches = val 
        ? suggestions.filter(s => s.toLowerCase().includes(val))
        : suggestions;
      
      if (matches.length === 0) {
        list.classList.remove("active");
        if (wrapper) wrapper.classList.remove("open");
        return;
      }
      
      list.innerHTML = "";
      const countsMap = window.autocompleteCounts ? (window.autocompleteCounts[field] || {}) : {};
      
      matches.forEach(m => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        if (input.value.trim().toLowerCase() === m.toLowerCase()) {
          item.classList.add("selected");
        }
        const count = countsMap[m] || 0;
        const countBadge = count > 0 
          ? `<span style="font-size:0.75rem; opacity:0.55; font-weight:normal; margin-left: 8px;">(${count} ครั้ง)</span>` 
          : "";
        item.innerHTML = `<span>${m}</span>${countBadge}`;
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
        });
        item.addEventListener("click", () => {
          input.value = m;
          list.classList.remove("active");
          if (wrapper) wrapper.classList.remove("open");
        });
        list.appendChild(item);
      });
      
      list.classList.add("active");
      if (wrapper) wrapper.classList.add("open");
    };
    
    // Show dropdown options on focus or click (even if empty!)
    input.addEventListener("focus", () => renderList(input.value));
    input.addEventListener("click", () => renderList(input.value));
    
    // Filter on typing
    input.addEventListener("input", function() {
      renderList(this.value);
    });
    
    // Hide list on clicking outside field
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !list.contains(e.target) && (!wrapper || !wrapper.contains(e.target))) {
        list.classList.remove("active");
        if (wrapper) wrapper.classList.remove("open");
      }
    });
  });
}

function closeAllSuggestions() {
  ["platform", "category", "location"].forEach(f => {
    const list = document.getElementById(`suggestions-${f}`);
    const input = document.getElementById(`form-${f}`);
    const wrapper = input ? input.closest(".autocomplete-wrapper") : null;
    if (list) list.classList.remove("active");
    if (wrapper) wrapper.classList.remove("open");
  });
}

// Export parsed filters dataset as CSV downloaded file
function exportCSV() {
  if (filteredTransactions.length === 0) return;
  
  const headers = ["ID", "Date", "Type", "Platform", "Total (Baht)", "Category", "Location", "Remark"];
  const csvRows = [headers.join(",")];
  
  filteredTransactions.forEach(t => {
    const [yr, mm, dd] = t.date.split("-");
    // Format back to D/M/YYYY for localized excel export compatibility
    const formattedDate = `${parseInt(dd, 10)}/${parseInt(mm, 10)}/${yr}`;
    
    // Clean string values from double quotes
    const escape = (val) => {
      if (val === null || val === undefined) return "";
      const text = val.toString().replace(/"/g, '""');
      return text.includes(",") || text.includes("\n") || text.includes('"') ? `"${text}"` : text;
    };
    
    const row = [
      escape(t.id),
      escape(formattedDate),
      escape(t.type),
      escape(t.platform),
      escape(t.total.toFixed(2)),
      escape(t.category),
      escape(t.location),
      escape(t.remark)
    ];
    csvRows.push(row.join(","));
  });
  
  const csvString = "\ufeff" + csvRows.join("\n"); // Include BOM for proper Thai characters Excel support
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `wealth_tracker_export_${today}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- EXCEL TEMPLATE & BULK IMPORT/EDIT ENGINE ---
let parsedImportRows = [];

// Download Excel Template for preparing or bulk editing transactions
function downloadExcelTemplate() {
  const sampleHeaders = ["ID", "Date", "Type", "Platform", "Total", "Category", "Location", "Remark"];
  const sampleData = [
    ["", "2026-07-29", "Expense", "Make", 150.00, "อาหารและเครื่องดื่ม", "7-Eleven", "ตัวอย่างเพิ่มรายการใหม่ (ปล่อย ID ว่างไว้)"],
    ["", "2026-07-29", "Income", "TTB", 15000.00, "เงินเดือน", "บริษัท", "ตัวอย่างเพิ่มรายรับใหม่"],
    ["06229d993", "2026-05-17", "Income", "TTB", 250.00, "รายได้จากการทำงาน", "Sita Villa", "ตัวอย่างแก้ไขรายการเดิม (ใส่ ID เดิมจากระบบ)"]
  ];

  // Extract all available types, platforms, categories, and locations in system
  const typesList = ["Expense", "Income"];
  
  const defaultPlatforms = ["Make", "TTB", "Cr. So Fast", "Tiktok Paylater", "K-Plus", "SCB", "Krungsri", "Bangkok Bank", "ShopeePay", "TrueMoney", "เงินสด"];
  const existingPlatforms = transactions ? transactions.map(t => t.platform).filter(Boolean) : [];
  const platformsList = [...new Set([...defaultPlatforms, ...existingPlatforms])].sort((a, b) => a.localeCompare(b, "th"));
  
  const defaultCategories = [
    "อาหารและเครื่องดื่ม", "ค่าเดินทางและยานพาหนะ", "ที่พักและสาธารณูปโภค", 
    "การลงทุนและเงินออม", "ช้อปปิ้งและของใช้", "ความบันเทิงและสื่อดิจิทัล", 
    "สุขภาพและอนามัย", "การศึกษาและพัฒนาตนเอง", "ภาระหนี้สิน",
    "รายได้จากการทำงาน", "เงินเดือน", "โบนัส", "ดอกเบี้ยและปันผล", "ธุรกิจส่วนตัว", "หมวดหมู่อื่น ๆ"
  ];
  const budgetCategories = (typeof BUDGET_LIMITS !== "undefined" && BUDGET_LIMITS) ? BUDGET_LIMITS.map(b => b.name) : [];
  const existingCategories = transactions ? transactions.map(t => t.category).filter(Boolean) : [];
  const categoriesList = [...new Set([...defaultCategories, ...budgetCategories, ...existingCategories])].sort((a, b) => a.localeCompare(b, "th"));

  const defaultLocations = ["7-Eleven", "Lotus's", "Big C", "CJ Express", "Sita Villa", "STEAM", "Grab", "Shopee", "Lazada", "ร้านตามสั่ง", "ร้านผลไม้"];
  const existingLocations = transactions ? transactions.map(t => t.location).filter(Boolean) : [];
  const locationsList = [...new Set([...defaultLocations, ...existingLocations])].sort((a, b) => a.localeCompare(b, "th"));

  if (typeof XLSX !== "undefined") {
    try {
      const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, ...sampleData]);
      ws['!cols'] = [
        { wch: 14 }, // ID
        { wch: 12 }, // Date
        { wch: 12 }, // Type
        { wch: 16 }, // Platform
        { wch: 12 }, // Total
        { wch: 26 }, // Category
        { wch: 20 }, // Location
        { wch: 45 }  // Remark
      ];

      // Add Data Validation dropdowns for cells C2:C500, D2:D500, F2:F500, G2:G500
      ws['!dataValidation'] = [
        {
          sqref: "C2:C500",
          type: "list",
          operator: "equal",
          formula1: `Lists!$A$2:$A$${typesList.length + 1}`,
          allowBlank: true,
          showDropDown: true
        },
        {
          sqref: "D2:D500",
          type: "list",
          operator: "equal",
          formula1: `Lists!$B$2:$B$${platformsList.length + 1}`,
          allowBlank: true,
          showDropDown: true
        },
        {
          sqref: "F2:F500",
          type: "list",
          operator: "equal",
          formula1: `Lists!$C$2:$C$${categoriesList.length + 1}`,
          allowBlank: true,
          showDropDown: true
        },
        {
          sqref: "G2:G500",
          type: "list",
          operator: "equal",
          formula1: `Lists!$D$2:$D$${locationsList.length + 1}`,
          allowBlank: true,
          showDropDown: true
        }
      ];

      // Create "Lists" Reference Sheet containing all valid options
      const maxRows = Math.max(typesList.length, platformsList.length, categoriesList.length, locationsList.length);
      const listsAOA = [["Type", "Platform", "Category", "Location"]];
      for (let i = 0; i < maxRows; i++) {
        listsAOA.push([
          typesList[i] || "",
          platformsList[i] || "",
          categoriesList[i] || "",
          locationsList[i] || ""
        ]);
      }
      const wsLists = XLSX.utils.aoa_to_sheet(listsAOA);
      wsLists['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 30 },
        { wch: 25 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.utils.book_append_sheet(wb, wsLists, "Lists");
      XLSX.writeFile(wb, "wealth_tracker_template.xlsx");
      showStatus("ดาวน์โหลดไฟล์ Template Excel พร้อม Dropdown Data Validation เรียบร้อยแล้ว", "success");
      return;
    } catch (e) {
      console.warn("SheetJS download failed, falling back to CSV export:", e);
    }
  }

  // Fallback to CSV template if SheetJS is offline
  const csvRows = [sampleHeaders.join(",")];
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const text = val.toString().replace(/"/g, '""');
    return text.includes(",") || text.includes("\n") || text.includes('"') ? `"${text}"` : text;
  };
  sampleData.forEach(row => {
    csvRows.push(row.map(escape).join(","));
  });

  const csvString = "\ufeff" + csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "wealth_tracker_template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showStatus("ดาวน์โหลดไฟล์ Template CSV เรียบร้อยแล้ว", "success");
}

// Normalize Excel/CSV Date string to YYYY-MM-DD
function normalizeImportDate(rawVal) {
  if (!rawVal) return "";
  if (rawVal instanceof Date && !isNaN(rawVal)) {
    const y = rawVal.getFullYear();
    const m = String(rawVal.getMonth() + 1).padStart(2, "0");
    const d = String(rawVal.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof rawVal === "number" && rawVal > 10000 && rawVal < 100000) {
    // Excel Serial Date Number
    const dateObj = new Date(Math.round((rawVal - 25569) * 86400 * 1000));
    if (!isNaN(dateObj)) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const str = String(rawVal).trim();
  if (!str) return "";
  return parseCustomDate(str);
}

// Process uploaded Excel / CSV file
function handleExcelFileUpload(file) {
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function (e) {
    let rows = [];
    
    if (typeof XLSX !== "undefined") {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      } catch (err) {
        console.error("XLSX parsing error:", err);
      }
    }
    
    // Fallback simple CSV parser if XLSX failed or returned no rows
    if (!rows || rows.length === 0) {
      const textDecoder = new TextDecoder("utf-8");
      let textContent = textDecoder.decode(e.target.result);
      if (textContent.charCodeAt(0) === 0xFEFF) {
        textContent = textContent.slice(1);
      }
      const lines = textContent.split(/\r?\n/);
      rows = lines.map(line => {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      });
    }
    
    if (!rows || rows.length < 2) {
      showStatus("ไม่พบข้อมูลในไฟล์ หรือไฟล์ไม่มีแถวรายการ", "error");
      return;
    }
    
    // Find header row (first non-empty row)
    let headerIdx = 0;
    while (headerIdx < rows.length && (!rows[headerIdx] || rows[headerIdx].every(c => String(c).trim() === ""))) {
      headerIdx++;
    }
    
    if (headerIdx >= rows.length) {
      showStatus("ไม่พบแถวหัวข้อในไฟล์ที่อัปโหลด", "error");
      return;
    }
    
    const headers = rows[headerIdx].map(h => String(h).trim().toLowerCase());
    
    // Map headers to indexes
    const findColIndex = (keywords) => {
      return headers.findIndex(h => keywords.some(kw => h.includes(kw)));
    };
    
    const idIdx = findColIndex(["id", "ไอดี", "รหัส"]);
    const dateIdx = findColIndex(["date", "วันที่"]);
    const typeIdx = findColIndex(["type", "ประเภท"]);
    const platformIdx = findColIndex(["platform", "แพลตฟอร์ม", "บัญชี", "ช่องทาง"]);
    const totalIdx = findColIndex(["total", "จำนวนเงิน", "ยอดเงิน", "จำนวน", "amount"]);
    const categoryIdx = findColIndex(["category", "หมวดหมู่"]);
    const locationIdx = findColIndex(["location", "สถานที่", "ร้านค้า"]);
    const remarkIdx = findColIndex(["remark", "หมายเหตุ", "บันทึก"]);
    
    parsedImportRows = [];
    let newCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    
    // Process data rows
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.every(c => String(c).trim() === "")) continue;
      
      const rawId = idIdx !== -1 ? String(r[idIdx] || "").trim() : "";
      const rawDate = dateIdx !== -1 ? r[dateIdx] : "";
      const rawType = typeIdx !== -1 ? String(r[typeIdx] || "").trim() : "";
      const rawPlatform = platformIdx !== -1 ? String(r[platformIdx] || "").trim() : "";
      const rawTotal = totalIdx !== -1 ? String(r[totalIdx] || "").replace(/,/g, "").trim() : "0";
      const rawCategory = categoryIdx !== -1 ? String(r[categoryIdx] || "").trim() : "";
      const rawLocation = locationIdx !== -1 ? String(r[locationIdx] || "").trim() : "";
      const rawRemark = remarkIdx !== -1 ? String(r[remarkIdx] || "").trim() : "";
      
      const normDate = normalizeImportDate(rawDate);
      const parsedTotal = parseFloat(rawTotal);
      
      let normType = "";
      const lowerType = rawType.toLowerCase();
      if (lowerType.includes("income") || lowerType.includes("รายรับ") || lowerType.includes("รายได้")) {
        normType = "Income";
      } else if (lowerType.includes("expense") || lowerType.includes("รายจ่าย") || lowerType.includes("ค่าใช้จ่าย")) {
        normType = "Expense";
      }
      
      // Determine Status
      let status = "new";
      let statusText = "เพิ่มใหม่";
      let isError = false;
      
      if (!normDate || !normType || !rawPlatform || isNaN(parsedTotal) || parsedTotal <= 0 || !rawCategory) {
        status = "error";
        statusText = "ข้อมูลไม่ครบ";
        isError = true;
        errorCount++;
      } else {
        if (rawId) {
          const exists = transactions.some(t => t.id === rawId);
          if (exists) {
            status = "update";
            statusText = "แก้ไขเดิม";
            updateCount++;
          } else {
            status = "new";
            statusText = "เพิ่มใหม่";
            newCount++;
          }
        } else {
          status = "new";
          statusText = "เพิ่มใหม่";
          newCount++;
        }
      }
      
      parsedImportRows.push({
        id: rawId,
        date: normDate,
        type: normType,
        platform: rawPlatform,
        total: isNaN(parsedTotal) ? 0 : parsedTotal,
        category: rawCategory,
        location: rawLocation,
        remark: rawRemark,
        status: status,
        statusText: statusText,
        isError: isError
      });
    }
    
    if (parsedImportRows.length === 0) {
      showStatus("ไม่พบแถวข้อมูลที่สามารถนำเข้าได้", "error");
      return;
    }
    
    // Update Preview UI
    const tbody = document.getElementById("import-preview-tbody");
    const previewSection = document.getElementById("import-preview-section");
    const confirmBtn = document.getElementById("btn-confirm-import");
    
    tbody.innerHTML = "";
    parsedImportRows.forEach(row => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--glass-border)";
      if (row.isError) tr.style.background = "rgba(244, 63, 94, 0.08)";
      
      let badgeHtml = "";
      if (row.status === "new") badgeHtml = `<span class="type-badge income">เพิ่มใหม่</span>`;
      else if (row.status === "update") badgeHtml = `<span class="type-badge balance">แก้ไขเดิม</span>`;
      else badgeHtml = `<span class="type-badge expense">ข้อมูลไม่ครบ</span>`;
      
      tr.innerHTML = `
        <td style="padding: 8px 10px;">${badgeHtml}</td>
        <td style="padding: 8px 10px; font-family: monospace; font-size: 0.75rem; color: var(--text-secondary);">${row.id || '<em style="opacity:0.5;">อัตโนมัติ</em>'}</td>
        <td style="padding: 8px 10px;">${row.date || '<span style="color:var(--color-expense);">ไม่ถูกต้อง</span>'}</td>
        <td style="padding: 8px 10px;">${row.type === 'Income' ? 'รายรับ' : (row.type === 'Expense' ? 'รายจ่าย' : '<span style="color:var(--color-expense);">ไม่ระบุ</span>')}</td>
        <td style="padding: 8px 10px;">${row.platform || '<span style="color:var(--color-expense);">-</span>'}</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 600;">${row.total ? formatCurrency(row.total) : '0.00'}</td>
        <td style="padding: 8px 10px;">${row.category || '<span style="color:var(--color-expense);">-</span>'}</td>
        <td style="padding: 8px 10px; color: var(--text-secondary);">${row.location || '-'}</td>
        <td style="padding: 8px 10px; color: var(--text-secondary);">${row.remark || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
    
    document.getElementById("import-total-count").innerText = parsedImportRows.length;
    document.getElementById("import-new-count").innerText = `เพิ่มใหม่ ${newCount}`;
    document.getElementById("import-update-count").innerText = `แก้ไข ${updateCount}`;
    
    const errBadge = document.getElementById("import-error-count");
    if (errorCount > 0) {
      errBadge.innerText = `ข้อผิดพลาด ${errorCount}`;
      errBadge.style.display = "inline-flex";
    } else {
      errBadge.style.display = "none";
    }
    
    previewSection.style.display = "flex";
    
    const validCount = newCount + updateCount;
    if (validCount > 0) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `<i data-lucide="check-circle" size="16"></i> ยืนยันนำเข้าข้อมูล (${validCount} รายการ)`;
    } else {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i data-lucide="check-circle" size="16"></i> ไม่มีรายการที่พร้อมนำเข้า`;
    }
    lucide.createIcons();
  };
  
  reader.readAsArrayBuffer(file);
}

// Bulk Save parsed rows to system
async function processBulkImport() {
  const validRows = parsedImportRows.filter(r => !r.isError);
  if (validRows.length === 0) return;
  
  const password = await getAdminPassword();
  if (password === null || password === "") {
    showStatus("ยกเลิกการนำเข้าข้อมูลเนื่องจากไม่ได้ระบุรหัสผ่าน", "error");
    return;
  }
  
  showStatus(`กำลังประมวลผลนำเข้าข้อมูล ${validRows.length} รายการ...`, "warning");
  
  let newAddedCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  
  if (isApiMode) {
    for (const item of validRows) {
      const isEditing = item.status === "update";
      const payload = {
        id: item.id || undefined,
        date: item.date,
        type: item.type,
        platform: item.platform,
        total: item.total,
        category: item.category,
        location: item.location,
        remark: item.remark
      };
      
      try {
        const method = isEditing ? "PUT" : "POST";
        const res = await safeFetchJson("/api/transactions", {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Password": password
          },
          body: JSON.stringify(payload)
        });
        
        if (res.status === 401) {
          sessionStorage.removeItem("wt_admin_password");
          showStatus("รหัสผ่านไม่ถูกต้อง", "error");
          return;
        }
        
        if (res.ok) {
          if (isEditing) updatedCount++;
          else newAddedCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        console.error("Bulk import item error:", err);
        failedCount++;
      }
    }
  } else {
    // LocalStorage mode passcode check
    if (password !== "20147") {
      sessionStorage.removeItem("wt_admin_password");
      showStatus("รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นสำหรับ Local คือ 20147)", "error");
      return;
    }
    
    validRows.forEach(item => {
      const now = Date.now();
      if (item.status === "update" && item.id) {
        const idx = transactions.findIndex(t => t.id === item.id);
        if (idx !== -1) {
          transactions[idx] = {
            id: item.id,
            date: item.date,
            type: item.type,
            platform: item.platform,
            total: item.total,
            category: item.category,
            location: item.location,
            remark: item.remark,
            updated_at: now
          };
          updatedCount++;
        } else {
          transactions.unshift({
            id: item.id || generateId(),
            date: item.date,
            type: item.type,
            platform: item.platform,
            total: item.total,
            category: item.category,
            location: item.location,
            remark: item.remark,
            updated_at: now
          });
          newAddedCount++;
        }
      } else {
        transactions.unshift({
          id: generateId(),
          date: item.date,
          type: item.type,
          platform: item.platform,
          total: item.total,
          category: item.category,
          location: item.location,
          remark: item.remark,
          updated_at: now
        });
        newAddedCount++;
      }
    });
    
    localStorage.setItem("wealth_tracker_transactions", JSON.stringify(transactions));
  }
  
  await loadTransactions();
  
  // Close modal
  const modal = document.getElementById("excel-import-modal");
  if (modal) modal.classList.remove("active");
  
  let msg = `นำเข้าข้อมูลสำเร็จ! `;
  if (newAddedCount > 0) msg += `เพิ่มใหม่ ${newAddedCount} รายการ `;
  if (updatedCount > 0) msg += `แก้ไขเดิม ${updatedCount} รายการ `;
  if (failedCount > 0) msg += `(ล้มเหลว ${failedCount} รายการ)`;
  
  showStatus(msg, failedCount > 0 ? "warning" : "success");
}

// Initialize Excel Import Modal Events
function initExcelImportEngine() {
  const modal = document.getElementById("excel-import-modal");
  const openBtn = document.getElementById("btn-import-excel");
  const downloadBtn = document.getElementById("btn-download-template");
  const modalDownloadBtn = document.getElementById("btn-modal-download-template");
  const closeBtn = document.getElementById("btn-close-import-modal");
  const cancelBtn = document.getElementById("btn-cancel-import");
  const confirmBtn = document.getElementById("btn-confirm-import");
  
  const dropzone = document.getElementById("excel-dropzone");
  const fileInput = document.getElementById("excel-file-input");
  const previewSection = document.getElementById("import-preview-section");

  if (downloadBtn) downloadBtn.addEventListener("click", downloadExcelTemplate);
  if (modalDownloadBtn) modalDownloadBtn.addEventListener("click", downloadExcelTemplate);

  const openModal = () => {
    parsedImportRows = [];
    if (previewSection) previewSection.style.display = "none";
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i data-lucide="check-circle" size="16"></i> ยืนยันนำเข้าข้อมูล`;
    }
    if (fileInput) fileInput.value = "";
    if (modal) modal.classList.add("active");
    lucide.createIcons();
  };

  const closeModal = () => {
    if (modal) modal.classList.remove("active");
  };

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Dropzone events
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleExcelFileUpload(e.target.files[0]);
      }
    });

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleExcelFileUpload(e.dataTransfer.files[0]);
      }
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", processBulkImport);
  }
}

// --- SETUP EVENT LISTENERS ON PAGE LOAD ---
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  
  // Set default calendar month dates on page load
  const { startDate, endDate } = getDefaultMonthRange();
  document.getElementById("filter-start-date").value = startDate;
  document.getElementById("filter-end-date").value = endDate;
  
  // Bind Mode and check API backend responsiveness
  await checkApiMode();
  await loadTransactions();
  initAutocomplete();

  // Trend selectors change handlers
  const trendPrimarySelect = document.getElementById("trend-primary-month");
  const trendRefSelect = document.getElementById("trend-reference-month");
  if (trendPrimarySelect && trendRefSelect) {
    trendPrimarySelect.addEventListener("change", () => {
      const selectedPrimary = trendPrimarySelect.value;
      if (trendRefSelect.value !== "historical-average") {
        const options = Array.from(trendPrimarySelect.options).map(opt => opt.value);
        const idx = options.indexOf(selectedPrimary);
        // Auto-select preceding month (next index in reverse chronological order)
        const nextVal = options[idx + 1] || options[idx] || "";
        if (nextVal) {
          trendRefSelect.value = nextVal;
        }
      }
      updateTrendComparison();
    });

    trendRefSelect.addEventListener("change", () => {
      updateTrendComparison();
    });
  }

  // Predefined Time Range Selector Tab Handlers
  const timeButtons = document.querySelectorAll(".time-tab-btn");
  timeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      timeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const range = btn.getAttribute("data-range");
      const today = new Date();
      const GregorianYear = today.getFullYear() > 2400 ? today.getFullYear() - 543 : today.getFullYear();
      const currentMonth = today.getMonth();
      
      let startStr = "";
      let endStr = "";
      
      if (range === "today") {
        startStr = toGregorianISODate(today);
        endStr = toGregorianISODate(today);
      } else if (range === "week") {
        const clone = new Date(today.getTime());
        const day = clone.getDay();
        const diffToMonday = clone.getDate() - (day === 0 ? 6 : day - 1);
        const monday = new Date(clone.setDate(diffToMonday));
        const sunday = new Date(monday.getTime());
        sunday.setDate(monday.getDate() + 6);
        
        startStr = toGregorianISODate(monday);
        endStr = toGregorianISODate(sunday);
      } else if (range === "month") {
        const lastDay = new Date(GregorianYear, currentMonth + 1, 0).getDate();
        startStr = `${GregorianYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
        endStr = `${GregorianYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else if (range === "3months") {
        const startMonthDate = new Date(GregorianYear, currentMonth - 2, 1);
        const lastDay = new Date(GregorianYear, currentMonth + 1, 0).getDate();
        startStr = toGregorianISODate(startMonthDate);
        endStr = `${GregorianYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else if (range === "6months") {
        const startMonthDate = new Date(GregorianYear, currentMonth - 5, 1);
        const lastDay = new Date(GregorianYear, currentMonth + 1, 0).getDate();
        startStr = toGregorianISODate(startMonthDate);
        endStr = `${GregorianYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else if (range === "1year") {
        const startMonthDate = new Date(GregorianYear, currentMonth - 11, 1);
        const lastDay = new Date(GregorianYear, currentMonth + 1, 0).getDate();
        startStr = toGregorianISODate(startMonthDate);
        endStr = `${GregorianYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else if (range === "all") {
        startStr = "";
        endStr = "";
      }
      
      document.getElementById("filter-start-date").value = startStr;
      document.getElementById("filter-end-date").value = endStr;
      applyFilters();
    });
  });

  // If start/end date inputs change manually, clear predefined time tabs selection
  const clearTimeTabActiveState = () => {
    timeButtons.forEach(b => b.classList.remove("active"));
  };
  document.getElementById("filter-start-date").addEventListener("input", clearTimeTabActiveState);
  document.getElementById("filter-end-date").addEventListener("input", clearTimeTabActiveState);
  
  // Theme Toggle
  document.getElementById("btn-toggle-theme").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("wt_theme", next);
    updateThemeIcon();
    
    // Redraw chart to update grids and labels colors
    renderCharts();
  });
  
  // Filters listeners
  document.getElementById("filter-search").addEventListener("input", applyFilters);
  document.getElementById("filter-type").addEventListener("change", applyFilters);
  document.getElementById("filter-category").addEventListener("change", applyFilters);
  document.getElementById("filter-platform").addEventListener("change", applyFilters);
  document.getElementById("filter-sort").addEventListener("change", applyFilters);
  document.getElementById("filter-start-date").addEventListener("change", applyFilters);
  document.getElementById("filter-end-date").addEventListener("change", applyFilters);
  
  const pageSizeSelect = document.getElementById("filter-page-size");
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "all") {
        itemsPerPage = 999999;
      } else {
        itemsPerPage = parseInt(val, 10) || 25;
      }
      currentPage = 1;
      renderTransactionsTable();
    });
  }
  
  document.getElementById("btn-reset-filters").addEventListener("click", resetFilters);
  
  // Event delegation for row checkboxes
  document.getElementById("transactions-table").addEventListener("change", (e) => {
    if (e.target.classList.contains("txn-checkbox")) {
      updateBulkDeleteButtonState();
      
      // Update check-all checkbox state
      const totalCheckboxes = document.querySelectorAll(".txn-checkbox").length;
      const checkedCheckboxes = document.querySelectorAll(".txn-checkbox:checked").length;
      const checkAll = document.getElementById("check-all");
      if (checkAll) {
        checkAll.checked = (totalCheckboxes === checkedCheckboxes && totalCheckboxes > 0);
      }
    }
  });
  
  // Select All Checkbox
  document.getElementById("check-all").addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    document.querySelectorAll(".txn-checkbox").forEach(cb => {
      cb.checked = isChecked;
    });
    updateBulkDeleteButtonState();
  });
  
  // Bulk Delete Button Click
  document.getElementById("btn-bulk-delete").addEventListener("click", async () => {
    const checkedBoxes = document.querySelectorAll(".txn-checkbox:checked");
    const ids = Array.from(checkedBoxes).map(cb => cb.getAttribute("data-id"));
    if (ids.length === 0) return;
    
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการที่เลือกทั้งหมดจำนวน ${ids.length} รายการ?`)) {
      await bulkDeleteTransactions(ids);
    }
  });
  
  // Export CSV
  document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
  
  // Modal buttons
  document.getElementById("btn-new-transaction").addEventListener("click", openAddModal);
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("btn-cancel-form").addEventListener("click", closeModal);
  
  // Switch Expense / Income inside form
  document.getElementById("form-switch-expense").addEventListener("click", () => setFormSwitch("Expense"));
  document.getElementById("form-switch-income").addEventListener("click", () => setFormSwitch("Income"));
  
  // Pagination controls
  document.getElementById("btn-prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTransactionsTable();
    }
  });
  document.getElementById("btn-next-page").addEventListener("click", () => {
    currentPage++;
    renderTransactionsTable();
  });
  
  // Handle form submission
  document.getElementById("txn-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const typeVal = document.getElementById("form-type").value;
    const subtypeVal = document.getElementById("form-expense-subtype")?.value || "direct";
    const linkDebtIdVal = document.getElementById("form-link-debt")?.value || "";
    
    let remark = document.getElementById("form-remark").value.trim();
    if (typeVal === "Expense" && subtypeVal === "debt" && linkDebtIdVal && !remark) {
      const debt = debts.find(d => d.id === linkDebtIdVal);
      if (debt) {
        remark = `ชำระหนี้สิน: ${debt.name}`;
      } else if (linkDebtIdVal.startsWith("cr-platform-")) {
        const platformName = linkDebtIdVal.replace("cr-platform-", "");
        remark = `ชำระหนี้สิน: ${platformName}`;
      }
    }
    
    let parsedTotal = evaluateAmountInput(true);
    if (parsedTotal === null || isNaN(parsedTotal)) {
      parsedTotal = parseFloat(document.getElementById("form-total").value.replace(/,/g, ""));
    }

    const txnData = {
      id: document.getElementById("form-id").value || undefined,
      date: document.getElementById("form-date").value,
      type: typeVal,
      platform: document.getElementById("form-platform").value.trim(),
      total: parsedTotal,
      category: document.getElementById("form-category").value.trim(),
      location: document.getElementById("form-location").value.trim(),
      remark: remark,
      subtype: typeVal === "Expense" ? subtypeVal : "direct",
      linkDebtId: (typeVal === "Expense" && subtypeVal === "debt") ? linkDebtIdVal : ""
    };
    
    if (!txnData.date || !txnData.platform || isNaN(txnData.total) || !txnData.category) {
      showStatus("กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน", "error");
      return;
    }
    
    const success = await saveTransaction(txnData);
    if (success) {
      // Run OCR learning hook to record any manual corrections
      learnOcrCorrection(txnData);
      
      // If it is a debt repayment, deduct from the selected debt
      if (!txnData.id && txnData.type === "Expense" && txnData.subtype === "debt" && txnData.linkDebtId) {
        const debt = debts.find(d => d.id === txnData.linkDebtId);
        if (debt) {
          debt.balance = Math.max(0, debt.balance - txnData.total);
          saveDebts();
          renderLiabilities();
          showStatus(`บันทึกรายการสำเร็จ และหักยอดค้างของ ${debt.name} ออกแล้ว`, "success");
        } else if (txnData.linkDebtId.startsWith("cr-platform-")) {
          const platformName = txnData.linkDebtId.replace("cr-platform-", "");
          renderLiabilities();
          showStatus(`บันทึกรายการสำเร็จ และหักยอดค้างของ ${platformName} ออกแล้ว`, "success");
        }
      }
      closeModal();
    }
  });
  
  // rule-row click handlers for 50/30/20 card interactive filtering
  document.querySelectorAll(".rule-row").forEach(row => {
    row.addEventListener("click", () => {
      const rule = row.getAttribute("data-rule");
      const isCurrentlyActive = row.classList.contains("active");
      
      // Clear active classes from all rule-rows
      document.querySelectorAll(".rule-row").forEach(el => el.classList.remove("active"));
      
      if (isCurrentlyActive) {
        activeRuleFilter = "";
      } else {
        activeRuleFilter = rule;
        row.classList.add("active");
        
        // Reset category filter and highlights
        document.getElementById("filter-category").value = "";
        document.querySelectorAll(".breakdown-item").forEach(el => el.classList.remove("active"));
      }
      
      applyFilters();
    });
  });

  // Bind Budget Tabs Click Handlers
  document.querySelectorAll(".budget-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".budget-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeBudgetTab = btn.getAttribute("data-tab");
      renderBudgetControl();
    });
  });

  // Initialize Budget, Savings, Liabilities setup and calculations
  initBudgetSettings();
  initSavingsGoalSettings();
  initLiabilities();
  initModalSubtype();
  initSlipUploadOCR();
  initOcrDictionaryModal();
  initExcelImportEngine();
  renderSavingsGoal();
  renderFinancialRule();
  renderLiabilities();

  // Line Summary Modal and Copy Engine
  const lineSummaryModal = document.getElementById("line-summary-modal");
  const btnCopyLineSummary = document.getElementById("btn-copy-line-summary");
  const btnCloseLineModal = document.getElementById("btn-close-line-modal");
  const btnCopyLineModal = document.getElementById("btn-copy-line-modal");
  const previewTextarea = document.getElementById("line-summary-preview");
  
  // Tabs
  const tabExpense = document.getElementById("summary-tab-expense");
  const tabIncome = document.getElementById("summary-tab-income");
  const tabBoth = document.getElementById("summary-tab-both");
  
  let currentSummaryMode = "expense"; // "expense", "income", "both"
  
  // Category Emoji Maps
  const categoryEmojis = {
    // Expense Categories
    "การลงทุนและเงินออม": "💰",
    "อาหารและเครื่องดื่ม": "🍔",
    "ค่าบริการเครือข่ายสื่อสาร": "📶",
    "ค่าเดินทางและยานพาหนะ": "🚗",
    "ค่าใช้จ่ายสัตว์เลี้ยง": "🐾",
    "สุขภาพและเวชภัณฑ์": "🏥",
    "การออกกำลังกายและสันทนาการ": "🏃",
    "ความบันเทิงและสื่อดิจิทัล": "🎬",
    "สินค้าอุปโภคและแฟชั่น": "🛍️",
    "การเดินทางท่องเที่ยว": "✈️",
    "บริการจัดส่งและบรรจุภัณฑ์": "📦",
    "การทำบุญและบริจาค": "🎗️",
    "ต้นทุนและค่าใช้จ่ายทางธุรกิจ": "💼",
    "เบ็ดเตล็ดและอื่น ๆ": "🌀",
    
    // Income Categories
    "เงินเดือน": "💵",
    "ธุรกิจ": "📈",
    "โบนัส": "✨",
    "รายรับอื่นๆ": "🪙"
  };

  function getCategoryEmoji(catName) {
    if (categoryEmojis[catName]) return categoryEmojis[catName];
    const lower = catName.toLowerCase();
    if (lower.includes("กิน") || lower.includes("อาหาร") || lower.includes("ข้าว") || lower.includes("น้ำ") || lower.includes("ชา")) return "🍔";
    if (lower.includes("เดินทาง") || lower.includes("รถ") || lower.includes("น้ำมัน") || lower.includes("บีทีเอส") || lower.includes("mrt")) return "🚗";
    if (lower.includes("เงินเดือน") || lower.includes("salary")) return "💵";
    if (lower.includes("ลงทุน") || lower.includes("ออม") || lower.includes("หุ้น") || lower.includes("คริปโต")) return "💰";
    if (lower.includes("สัตว์") || lower.includes("แมว") || lower.includes("หมา") || lower.includes("อาหารสัตว์")) return "🐾";
    if (lower.includes("เน็ต") || lower.includes("โทรศัพท์") || lower.includes("สื่อสาร") || lower.includes("wifi")) return "📶";
    if (lower.includes("ยา") || lower.includes("หมอ") || lower.includes("โรงพยาบาล") || lower.includes("คลินิก")) return "🏥";
    if (lower.includes("เที่ยว") || lower.includes("ทริป") || lower.includes("เครื่องบิน") || lower.includes("โรงแรม")) return "✈️";
    if (lower.includes("งาน") || lower.includes("ธุรกิจ") || lower.includes("ค้าขาย") || lower.includes("ทุน")) return "💼";
    return "📝";
  }

  function getBillingDaysInfo() {
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startVal = document.getElementById("filter-start-date")?.value;
    const endVal = document.getElementById("filter-end-date")?.value;
    
    let totalDays = 30;
    let elapsedDays = 1;
    
    if (startVal && endVal) {
      const sDate = new Date(startVal);
      const eDate = new Date(endVal);
      const diffTime = Math.abs(eDate - sDate);
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (sDate > todayDate) {
        elapsedDays = 0;
      } else {
        const effectiveEnd = (eDate < todayDate) ? eDate : todayDate;
        const elapsedDiffTime = Math.abs(effectiveEnd - sDate);
        elapsedDays = Math.ceil(elapsedDiffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    } else {
      const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      totalDays = totalDaysInMonth;
      elapsedDays = now.getDate();
    }
    
    return { totalDays, elapsedDays };
  }

  function getBillingTotalBudgetLimit(totalDays, periodDaysInMonth = 30) {
    let totalLimit = 0;
    const divisor = periodDaysInMonth || 30;
    BUDGET_LIMITS.forEach(b => {
      const baseDailyLimit = b.limit / divisor;
      const scaledLimit = baseDailyLimit * totalDays;
      totalLimit += scaledLimit;
    });
    return totalLimit;
  }

  function appendBudgetRiskAnalysis(totalSpent, totalLimit, elapsedDays, totalDays) {
    if (totalLimit <= 0) return "";
    
    const dailyAvgSpent = elapsedDays > 0 ? totalSpent / elapsedDays : 0;
    const projectedSpent = dailyAvgSpent * totalDays;
    
    let text = `\n------------------------\n`;
    text += `🔮 คาดการณ์ & วิเคราะห์ความเสี่ยง:\n`;
    text += `📈 ยอดประมาณการสิ้นสุดช่วงเวลา: ${formatCurrency(projectedSpent)}\n`;
    
    if (totalSpent > totalLimit) {
      const overAmt = totalSpent - totalLimit;
      text += `🚨 ความเสี่ยง: 🔴 สูงมาก (เกินงบแล้ว ฿${Math.round(overAmt).toLocaleString()})`;
    } else if (projectedSpent > totalLimit) {
      const overAmt = projectedSpent - totalLimit;
      text += `🚨 ความเสี่ยง: 🔴 สูง (คาดว่าจะเกินงบ ฿${Math.round(overAmt).toLocaleString()})`;
    } else if (projectedSpent >= 0.9 * totalLimit) {
      const leftAmt = totalLimit - projectedSpent;
      text += `🚨 ความเสี่ยง: 🟠 ปานกลาง (คาดว่างบจะเหลือ ฿${Math.round(leftAmt).toLocaleString()})`;
    } else {
      const savedAmt = totalLimit - projectedSpent;
      text += `🚨 ความเสี่ยง: 🟢 ต่ำ (คาดว่าจะประหยัดได้ ฿${Math.round(savedAmt).toLocaleString()})`;
    }
    return text;
  }

  function generateSummaryText(mode) {
    const activeTab = document.querySelector(".time-tab-btn.active");
    const rangeText = activeTab ? activeTab.textContent.trim() : "ช่วงเวลาที่เลือก";
    
    const expenses = filteredTransactions.filter(t => t.type === "Expense");
    const incomes = filteredTransactions.filter(t => t.type === "Income");
    
    let text = "";
    
    if (mode === "expense") {
      if (expenses.length === 0) {
        return `📊 สรุปค่าใช้จ่าย (${rangeText})\n------------------------\nไม่มีรายการค่าใช้จ่ายในช่วงเวลานี้\n------------------------\n💰 รวมทั้งหมด: ฿0.00`;
      }
      
      const categorySpent = {};
      let totalSpent = 0;
      expenses.forEach(t => {
        const amt = parseFloat(t.total) || 0;
        totalSpent += amt;
        const cat = t.category || "เบ็ดเตล็ดและอื่น ๆ";
        categorySpent[cat] = (categorySpent[cat] || 0) + amt;
      });
      
      const sorted = Object.keys(categorySpent).sort((a, b) => categorySpent[b] - categorySpent[a]);
      
      text += `📊 สรุปค่าใช้จ่าย (${rangeText})\n`;
      text += `------------------------\n`;
      sorted.forEach(cat => {
        text += `${getCategoryEmoji(cat)} ${cat}: ${formatCurrency(categorySpent[cat])}\n`;
      });
      text += `------------------------\n`;
      text += `💰 รวมทั้งหมด: ${formatCurrency(totalSpent)}`;
      
      // Append risk analysis
      const daysInfo = getBillingDaysInfo();
      const totalLimit = getBillingTotalBudgetLimit(daysInfo.totalDays);
      text += appendBudgetRiskAnalysis(totalSpent, totalLimit, daysInfo.elapsedDays, daysInfo.totalDays);
      
    } else if (mode === "income") {
      if (incomes.length === 0) {
        return `📊 สรุปรายรับ (${rangeText})\n------------------------\nไม่มีรายการรายรับในช่วงเวลานี้\n------------------------\n💰 รวมทั้งหมด: ฿0.00`;
      }
      
      const categoryEarned = {};
      let totalEarned = 0;
      incomes.forEach(t => {
        const amt = parseFloat(t.total) || 0;
        totalEarned += amt;
        const cat = t.category || "รายรับอื่นๆ";
        categoryEarned[cat] = (categoryEarned[cat] || 0) + amt;
      });
      
      const sorted = Object.keys(categoryEarned).sort((a, b) => categoryEarned[b] - categoryEarned[a]);
      
      text += `📊 สรุปรายรับ (${rangeText})\n`;
      text += `------------------------\n`;
      sorted.forEach(cat => {
        text += `${getCategoryEmoji(cat)} ${cat}: ${formatCurrency(categoryEarned[cat])}\n`;
      });
      text += `------------------------\n`;
      text += `💰 รวมทั้งหมด: ${formatCurrency(totalEarned)}`;
      
    } else if (mode === "both") {
      const categorySpent = {};
      let totalSpent = 0;
      expenses.forEach(t => {
        const amt = parseFloat(t.total) || 0;
        totalSpent += amt;
        const cat = t.category || "เบ็ดเตล็ดและอื่น ๆ";
        categorySpent[cat] = (categorySpent[cat] || 0) + amt;
      });
      
      const categoryEarned = {};
      let totalEarned = 0;
      incomes.forEach(t => {
        const amt = parseFloat(t.total) || 0;
        totalEarned += amt;
        const cat = t.category || "รายรับอื่นๆ";
        categoryEarned[cat] = (categoryEarned[cat] || 0) + amt;
      });
      
      const sortedIncomes = Object.keys(categoryEarned).sort((a, b) => categoryEarned[b] - categoryEarned[a]);
      const sortedExpenses = Object.keys(categorySpent).sort((a, b) => categorySpent[b] - categorySpent[a]);
      const netBalance = totalEarned - totalSpent;
      
      text += `📊 สรุปรายรับ-รายจ่าย (${rangeText})\n`;
      text += `------------------------\n`;
      text += `🟢 รายรับ:\n`;
      if (incomes.length === 0) {
        text += `ไม่มีรายการรายรับ\n`;
      } else {
        sortedIncomes.forEach(cat => {
          text += `${getCategoryEmoji(cat)} ${cat}: ${formatCurrency(categoryEarned[cat])}\n`;
        });
      }
      
      text += `------------------------\n`;
      text += `🔴 รายจ่าย:\n`;
      if (expenses.length === 0) {
        text += `ไม่มีรายการค่าใช้จ่าย\n`;
      } else {
        sortedExpenses.forEach(cat => {
          text += `${getCategoryEmoji(cat)} ${cat}: ${formatCurrency(categorySpent[cat])}\n`;
        });
      }
      
      text += `------------------------\n`;
      text += `💵 สรุปยอดเงิน:\n`;
      text += `🟢 รวมรายรับ: ${formatCurrency(totalEarned)}\n`;
      text += `🔴 รวมรายจ่าย: ${formatCurrency(totalSpent)}\n`;
      text += `✨ คงเหลือสุทธิ: ${formatCurrency(netBalance)}`;
      
      // Append risk analysis
      const daysInfo = getBillingDaysInfo();
      const totalLimit = getBillingTotalBudgetLimit(daysInfo.totalDays);
      text += appendBudgetRiskAnalysis(totalSpent, totalLimit, daysInfo.elapsedDays, daysInfo.totalDays);
    }
    
    return text;
  }

  function updateLineSummaryPreview() {
    if (previewTextarea) {
      previewTextarea.value = generateSummaryText(currentSummaryMode);
    }
  }

  function switchSummaryTab(mode) {
    currentSummaryMode = mode;
    
    // Update active classes
    [tabExpense, tabIncome, tabBoth].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    
    if (mode === "expense" && tabExpense) tabExpense.classList.add("active");
    if (mode === "income" && tabIncome) tabIncome.classList.add("active");
    if (mode === "both" && tabBoth) tabBoth.classList.add("active");
    
    updateLineSummaryPreview();
  }

  if (btnCopyLineSummary && lineSummaryModal) {
    btnCopyLineSummary.addEventListener("click", () => {
      // Check if there are any transactions at all to warn user early
      if (filteredTransactions.length === 0) {
        showStatus("ไม่พบรายการธุรกรรมในช่วงเวลานี้", "warning");
        return;
      }
      
      // Default to expense tab and open modal
      switchSummaryTab("expense");
      lineSummaryModal.classList.add("active");
    });
  }

  const closeLineModalFunc = () => {
    if (lineSummaryModal) lineSummaryModal.classList.remove("active");
  };

  if (btnCloseLineModal) {
    btnCloseLineModal.addEventListener("click", closeLineModalFunc);
  }

  // Bind tab click events
  if (tabExpense) tabExpense.addEventListener("click", () => switchSummaryTab("expense"));
  if (tabIncome) tabIncome.addEventListener("click", () => switchSummaryTab("income"));
  if (tabBoth) tabBoth.addEventListener("click", () => switchSummaryTab("both"));

  // Copy click event
  if (btnCopyLineModal && previewTextarea) {
    btnCopyLineModal.addEventListener("click", () => {
      const textToCopy = previewTextarea.value;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            showStatus("คัดลอกสรุปสั้นสำเร็จ! ส่งต่อใน Line ได้เลย", "success");
            closeLineModalFunc();
          })
          .catch(err => {
            console.error("Failed to copy using clipboard API: ", err);
            fallbackCopyText(textToCopy);
          });
      } else {
        fallbackCopyText(textToCopy);
      }
    });
  }

  // Click outside to close modal
  if (lineSummaryModal) {
    lineSummaryModal.addEventListener("click", (e) => {
      if (e.target === lineSummaryModal) {
        closeLineModalFunc();
      }
    });
  }

  function fallbackCopyText(text) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";  // avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        showStatus("คัดลอกสรุปสั้นสำเร็จ! ส่งต่อใน Line ได้เลย", "success");
        closeLineModalFunc();
      } else {
        showStatus("ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาลองอีกครั้ง", "error");
      }
    } catch (err) {
      console.error("Fallback copy failed: ", err);
      showStatus("ไม่สามารถคัดลอกอัตโนมัติได้", "error");
    }
  }
  
  // --- CHART IMAGE SUMMARY GENERATOR & MODAL ---
  function generateCompositeChartImage() {
    const canvas1 = document.getElementById("monthlyChart");
    const canvas2 = document.getElementById("categoryChart");
    const canvas3 = document.getElementById("locationChart");

    const compCanvas = document.createElement("canvas");
    compCanvas.width = 1200;
    compCanvas.height = 1020;
    const ctx = compCanvas.getContext("2d");

    // Pure White clean background for maximum contrast & readability
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 1020);

    // Header Banner Box (Navy Blue Gradient)
    const headerGrad = ctx.createLinearGradient(0, 0, 1200, 0);
    headerGrad.addColorStop(0, "#0f172a");
    headerGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, 1200, 115);

    // Header Title
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 28px 'Outfit', 'Noto Sans Thai', sans-serif";
    ctx.fillText("Wealth Tracker — สรุปรายงานกราฟการเงิน", 40, 50);

    // Date range & KPI Summary Subheader
    const startVal = document.getElementById("filter-start-date")?.value || "";
    const endVal = document.getElementById("filter-end-date")?.value || "";
    const rangeText = (startVal && endVal) ? `ช่วงเวลา: ${startVal} ถึง ${endVal}` : "ช่วงเวลาทั้งหมด";

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 15px 'Outfit', 'Noto Sans Thai', sans-serif";
    ctx.fillText(rangeText, 40, 85);

    // Helper function to draw rounded card with border
    function drawCard(x, y, w, h, title) {
      ctx.save();
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.5;
      
      const r = 14;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px 'Outfit', 'Noto Sans Thai', sans-serif";
      ctx.fillText(title, x + 20, y + 36);
      ctx.restore();
    }

    // 1. Card 1: Monthly Chart (Top area)
    drawCard(30, 135, 1140, 420, "📊 รายรับ - รายจ่าย รายเดือน (Monthly Income & Expenses)");
    if (canvas1) {
      ctx.drawImage(canvas1, 45, 180, 1110, 360);
    }

    // 2. Card 2: Category Chart (Bottom left)
    drawCard(30, 575, 555, 420, "🍕 สัดส่วนค่าใช้จ่ายตามหมวดหมู่ (บาท & %)");
    if (canvas2) {
      ctx.drawImage(canvas2, 45, 620, 525, 360);
    }

    // 3. Card 3: Location Chart (Bottom right)
    drawCard(615, 575, 555, 420, "🏪 ยอดใช้จ่ายแยกตามสถานที่ / ผู้รับเงิน (บาท)");
    if (canvas3) {
      ctx.drawImage(canvas3, 630, 620, 525, 360);
    }

    return compCanvas.toDataURL("image/png");
  }

  function openChartImageModal() {
    const modal = document.getElementById("chart-image-modal");
    const imgPreview = document.getElementById("chart-summary-img-preview");
    const directLink = document.getElementById("chart-image-direct-link");
    const downloadBtn = document.getElementById("btn-download-chart-image");

    if (!modal) return;

    try {
      const dataUrl = generateCompositeChartImage();
      if (imgPreview) imgPreview.src = dataUrl;
      if (directLink) directLink.href = dataUrl;
      if (downloadBtn) downloadBtn.href = dataUrl;

      modal.classList.add("active");
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error("Error generating chart image:", e);
      showStatus("เกิดข้อผิดพลาดในการสร้างรูปภาพกราฟ", "error");
    }
  }

  function closeChartImageModal() {
    const modal = document.getElementById("chart-image-modal");
    if (modal) modal.classList.remove("active");
  }

  const btnOpenChartImage = document.getElementById("btn-open-chart-image-modal");
  const btnCloseChartImage = document.getElementById("btn-close-chart-image-modal");
  const btnCopyChartImageLink = document.getElementById("btn-copy-chart-image-link");
  const modalChartImage = document.getElementById("chart-image-modal");

  if (btnOpenChartImage) {
    btnOpenChartImage.addEventListener("click", openChartImageModal);
  }
  if (btnCloseChartImage) {
    btnCloseChartImage.addEventListener("click", closeChartImageModal);
  }
  if (modalChartImage) {
    modalChartImage.addEventListener("click", (e) => {
      if (e.target === modalChartImage) closeChartImageModal();
    });
  }

  if (btnCopyChartImageLink) {
    btnCopyChartImageLink.addEventListener("click", () => {
      const imgPreview = document.getElementById("chart-summary-img-preview");
      if (imgPreview && imgPreview.src) {
        const linkUrl = imgPreview.src;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(linkUrl)
            .then(() => showStatus("คัดลอกลิงก์รูปภาพสรุปสำเร็จ!", "success"))
            .catch(() => fallbackCopyText(linkUrl));
        } else {
          fallbackCopyText(linkUrl);
        }
      }
    });
  }

  // --- AMOUNT CALCULATOR ENGINE ---
  function safeEvaluateMath(expr) {
    if (!expr || typeof expr !== "string") return null;
    let cleaned = expr.replace(/,/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/x/gi, "*").trim();
    if (!cleaned) return null;
    if (!/^[0-9+\-*/.() \t]+$/.test(cleaned)) return null;
    try {
      const func = new Function(`"use strict"; return (${cleaned});`);
      const val = func();
      if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
        return val;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function evaluateAmountInput(forceApply = false) {
    const input = document.getElementById("form-total");
    const preview = document.getElementById("calc-live-preview");
    const popSub = document.getElementById("calc-display-sub");
    if (!input) return null;

    let valStr = input.value.trim();
    if (!valStr) {
      if (preview) preview.style.display = "none";
      if (popSub) popSub.innerText = "";
      return null;
    }

    const evaluated = safeEvaluateMath(valStr);
    if (evaluated !== null && !isNaN(evaluated)) {
      const formatted = (Math.round(evaluated * 100) / 100).toFixed(2);
      if (preview) {
        preview.innerText = `= ฿${parseFloat(formatted).toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        preview.style.display = "inline-block";
      }
      if (popSub) {
        popSub.innerText = `= ฿${parseFloat(formatted).toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      }
      if (forceApply) {
        input.value = formatted;
        if (preview) preview.style.display = "none";
      }
      return parseFloat(formatted);
    } else {
      const num = parseFloat(valStr.replace(/,/g, ""));
      if (!isNaN(num)) {
        if (preview) preview.style.display = "none";
        if (popSub) popSub.innerText = `= ฿${num.toLocaleString("th-TH", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        return num;
      } else {
        if (preview) {
          preview.innerText = "สูตรไม่ถูกต้อง";
          preview.style.display = "inline-block";
        }
        if (popSub) popSub.innerText = "สูตรไม่ถูกต้อง";
        return null;
      }
    }
  }

  // Global handle for evaluateAmountInput
  window.evaluateAmountInput = evaluateAmountInput;

  const inputFormTotal = document.getElementById("form-total");
  const btnToggleCalc = document.getElementById("btn-toggle-calc");
  const calcPopover = document.getElementById("calc-popover");
  const btnApplyCalc = document.getElementById("btn-apply-calc");

  if (inputFormTotal) {
    inputFormTotal.addEventListener("input", () => evaluateAmountInput(false));
    inputFormTotal.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        evaluateAmountInput(true);
        if (calcPopover) calcPopover.style.display = "none";
      }
    });
    inputFormTotal.addEventListener("blur", () => {
      setTimeout(() => {
        if (document.activeElement && (document.activeElement.classList.contains("calc-btn") || document.activeElement.id === "btn-apply-calc")) return;
        evaluateAmountInput(true);
      }, 150);
    });
  }

  if (btnToggleCalc && calcPopover) {
    btnToggleCalc.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = calcPopover.style.display === "block";
      calcPopover.style.display = isVisible ? "none" : "block";
      if (!isVisible && inputFormTotal) {
        evaluateAmountInput(false);
        inputFormTotal.focus();
      }
    });
  }

  if (btnApplyCalc) {
    btnApplyCalc.addEventListener("click", () => {
      evaluateAmountInput(true);
      if (calcPopover) calcPopover.style.display = "none";
    });
  }

  // Keypad Buttons Click Handler
  document.querySelectorAll(".calc-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!inputFormTotal) return;
      const key = btn.getAttribute("data-calc");
      
      if (key === "C") {
        inputFormTotal.value = "";
      } else if (key === "DEL") {
        inputFormTotal.value = inputFormTotal.value.slice(0, -1);
      } else if (key === "=") {
        evaluateAmountInput(true);
        return;
      } else {
        inputFormTotal.value += key;
      }
      evaluateAmountInput(false);
      inputFormTotal.focus();
    });
  });

  // Close calc popover when clicking outside
  document.addEventListener("click", (e) => {
    if (calcPopover && calcPopover.style.display === "block") {
      if (!calcPopover.contains(e.target) && e.target !== btnToggleCalc && !btnToggleCalc.contains(e.target)) {
        calcPopover.style.display = "none";
      }
    }
  });

  // Initialize Lucide icons on page load completion
  lucide.createIcons();
});

