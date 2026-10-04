export interface UserStats {
  name: string;
  age: number;
  title: string;
  avatar: string;
  level: number;
  exp: number;
  maxExp: number; // Level 1 = 100, Level 2 = 200, Level 3 = 300 (Level N = N * 100)
  hp: number;
  maxHp: number;
  gold: number;
  diamonds: number;
  streak: number;
  lastActiveDate: string;
  isInitialized: boolean;
  skills: {
    triTue: number;      // Trí tuệ (Intellect)
    theLuc: number;      // Thể lực (Physical)
    taiChinh: number;    // Tài chính (Wealth)
    kyLuat: number;      // Kỷ luật (Discipline)
    sangTao: number;     // Sáng tạo (Creativity)
  };
}

export interface Boss {
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  level: number;
  avatar: string;
  description: string;
  // Daily damage calculation tracking:
  // Formula: totalDamage = baseScore * (1 + completedCount / 10)
  dailyCompletedCount: number;
  dailyBaseScore: number;
}

export interface Quest {
  id: string;
  title: string;
  category: 'Trí tuệ' | 'Thể lực' | 'Tài chính' | 'Kỷ luật' | 'Sáng tạo';
  scope?: 'daily' | 'weekly'; // Nhiệm vụ hàng ngày hoặc hàng tuần
  timeSlot: string; // e.g. "07:30 - 08:15" hoặc "Cả tuần"
  goldReward: number;
  expReward: number;
  bossDamage: number;
  isAiScheduled?: boolean;
  suggestedByAi?: boolean;
  aiReasoning?: string;
  isCompleted: boolean;
  isOverdue?: boolean;
  deadline?: string;
}

export interface StatusCard {
  id: string;
  type: 'positive' | 'negative' | 'expense';
  title: string;
  detail: string;
  statChanges: {
    gold: number;
    hp: number;
    exp: number;
    skill?: 'Trí tuệ' | 'Thể lực' | 'Tài chính' | 'Kỷ luật' | 'Sáng tạo';
    amount?: number;
    category?: string;
    bossDamage?: number;
  };
  note: string;
}

export interface ActionLogMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  image?: string;
  timestamp: string;
  statusCards?: StatusCard[];
  applied?: boolean; // Must wait for user to click accept before applying points!
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  triggerVariable: 'Hành động' | 'Chi tiêu' | 'Thời gian';
  triggerOperator: 'chứa từ khóa' | 'lớn hơn' | 'nhỏ hơn';
  triggerKeyword: string;
  conditionVariable?: 'Thời gian' | 'Chuỗi ngày' | 'Số tiền';
  conditionOperator?: 'nhỏ hơn' | 'lớn hơn' | 'bằng';
  conditionValue?: string;
  actionType: 'add' | 'subtract';
  actionValue: number;
  actionTarget: 'Vàng' | 'HP' | 'EXP Trí tuệ' | 'EXP Thể lực' | 'EXP Kỷ luật' | 'EXP Tài chính' | 'EXP Sáng tạo';
  subAction?: string;
}

export interface RuleConflict {
  rule1Id: string;
  rule1Name: string;
  rule2Id: string;
  rule2Name: string;
  reason: string;
}

export interface ShopItem {
  id: string;
  name: string;
  currency: 'gold' | 'diamond';
  basePrice: number;
  icon: string;
  description: string;
  purchasedCount: number;
  inflationRatePerPurchase: number;
  isSpecial?: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date: string;
  paymentMethod?: string;
  note?: string;
}

export interface DocumentFile {
  id: string;
  title: string;
  folder: string;
  size: string;
  pages: number;
  summary: string;
  content: string;
  isCustom?: boolean;
  flashcards?: { question: string; answer: string }[];
}

export interface CalendarTimeBlock {
  id: string;
  day: number; // 0 = Mon, ..., 6 = Sun
  startTime: string;
  durationHours: number;
  title: string;
  category: string;
  color: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'purple';
  docId?: string;
}
