import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserStats,
  Boss,
  Quest,
  StatusCard,
  ActionLogMessage,
  Rule,
  RuleConflict,
  ShopItem,
  BudgetCategory,
  Transaction,
  DocumentFile,
  CalendarTimeBlock,
} from '../types';
import { sound } from '../utils/sound';

interface GameContextType {
  user: UserStats;
  boss: Boss;
  quests: Quest[];
  actionLogs: ActionLogMessage[];
  rules: Rule[];
  ruleConflicts: RuleConflict[];
  shopItems: ShopItem[];
  budgetCategories: BudgetCategory[];
  transactions: Transaction[];
  documents: DocumentFile[];
  calendarBlocks: CalendarTimeBlock[];
  activeTab: number;
  soundEnabled: boolean;
  isOnboardingOpen: boolean;
  setActiveTab: (tab: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  // Character Creation / Onboarding
  initNewUser: (profile: { name: string; age: number; title: string; avatar: string }) => void;
  resetToNewbieZero: () => void;
  // Quests & Boss Actions
  completeQuest: (questId: string) => void;
  addQuest: (quest: Omit<Quest, 'id' | 'isCompleted'>) => void;
  damageBoss: (amount: number) => void;
  executeDailyBossStrike: () => { damage: number; count: number; multiplier: number };
  // Status Cards (AI Log)
  applyStatusCards: (cards: StatusCard[], messageId: string) => void;
  addActionLog: (msg: { text: string; image?: string; cards?: StatusCard[] }) => void;
  updateStatusCard: (messageId: string, cardId: string, updated: StatusCard) => void;
  // Rules
  toggleRule: (ruleId: string) => void;
  saveRule: (rule: Rule) => boolean;
  deleteRule: (ruleId: string) => void;
  // Shop & Gacha
  buyShopItem: (item: ShopItem) => { success: boolean; message: string };
  addShopItem: (item: Omit<ShopItem, 'id' | 'purchasedCount'>) => void;
  rollGacha: () => { reward: string; type: string; value?: number };
  // Finance
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  claimFinancialCovenant: () => { success: boolean; message: string };
  // Documents (Knowledge Base)
  addDocument: (doc: Omit<DocumentFile, 'id'>) => void;
  deleteDocument: (id: string) => void;
  // Calendar
  addCalendarBlock: (block: Omit<CalendarTimeBlock, 'id'>) => void;
  updateCalendarBlock: (id: string, updates: Partial<CalendarTimeBlock>) => void;
  deleteCalendarBlock: (id: string) => void;
  bulkAddCalendarBlocks: (blocks: Omit<CalendarTimeBlock, 'id'>[]) => void;
  triggerConfetti: () => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'aether_habit_state_v2';

// Tân thủ khởi tạo: TẤT CẢ ĐỀU BẮT ĐẦU TỪ SỐ 0
// Cấp 1 cần 100 EXP (Cấp N = N * 100 EXP)
const defaultNewbieUserStats: UserStats = {
  name: 'Tân Binh Aether',
  age: 20,
  title: 'Học Viên Sơ Cấp',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  level: 1,
  exp: 0,
  maxExp: 100, // Cấp 1 = 100 EXP
  hp: 100,
  maxHp: 100,
  gold: 0, // Bắt đầu từ 0
  diamonds: 0, // Bắt đầu từ 0
  streak: 0, // Bắt đầu từ 0
  lastActiveDate: new Date().toISOString().split('T')[0],
  isInitialized: false, // Sẽ hiển thị màn hình onboarding cho tân thủ
  skills: {
    triTue: 0,   // Bắt đầu từ 0
    theLuc: 0,   // Bắt đầu từ 0
    taiChinh: 0, // Bắt đầu từ 0
    kyLuat: 0,   // Bắt đầu từ 0
    sangTao: 0,  // Bắt đầu từ 0
  },
};

const initialBoss: Boss = {
  name: 'Bóng Ma Trì Hoãn',
  title: 'Chúa Tể Thời Gian Đánh Mất',
  hp: 1000,
  maxHp: 1000,
  level: 1,
  avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
  description: 'Sinh vật hấp thụ năng lượng từ những việc bạn trì hoãn. Tổng kết mỗi ngày: Sát thương = Tổng điểm * (1 + Số nhiệm vụ / 10)!',
  dailyCompletedCount: 0,
  dailyBaseScore: 0,
};

const initialQuests: Quest[] = [
  // Hàng ngày (Daily)
  {
    id: 'q1',
    title: 'Đọc 20 trang sách phát triển bản thân',
    category: 'Trí tuệ',
    scope: 'daily',
    timeSlot: '07:30 - 08:15',
    goldReward: 20,
    expReward: 30,
    bossDamage: 50,
    isAiScheduled: true,
    isCompleted: false,
    deadline: '09:00',
  },
  {
    id: 'q2',
    title: 'Rèn luyện thể lực: Chạy bộ hoặc hít đất',
    category: 'Thể lực',
    scope: 'daily',
    timeSlot: '17:30 - 18:30',
    goldReward: 25,
    expReward: 35,
    bossDamage: 60,
    isAiScheduled: false,
    isCompleted: false,
  },
  {
    id: 'q3',
    title: 'Ghi chép chi tiêu trong ngày vào Ngân Khố',
    category: 'Tài chính',
    scope: 'daily',
    timeSlot: '21:00 - 21:15',
    goldReward: 15,
    expReward: 25,
    bossDamage: 40,
    isAiScheduled: true,
    isCompleted: false,
  },
  {
    id: 'q4',
    title: 'Không dùng điện thoại 30 phút trước khi ngủ',
    category: 'Kỷ luật',
    scope: 'daily',
    timeSlot: '22:30 - 23:00',
    goldReward: 20,
    expReward: 30,
    bossDamage: 50,
    isAiScheduled: false,
    isCompleted: false,
  },
  // Hàng tuần (Weekly)
  {
    id: 'qw1',
    title: 'Viết nhật ký tổng kết tuần (Weekly Reflection & Review)',
    category: 'Kỷ luật',
    scope: 'weekly',
    timeSlot: 'Chủ Nhật, 20:00',
    goldReward: 80,
    expReward: 100,
    bossDamage: 180,
    isAiScheduled: false,
    isCompleted: false,
    deadline: 'Cuối tuần',
  },
  {
    id: 'qw2',
    title: 'Lập kế hoạch chiến lược & mục tiêu tuần mới (Weekly Plan)',
    category: 'Trí tuệ',
    scope: 'weekly',
    timeSlot: 'Chủ Nhật, 21:00',
    goldReward: 70,
    expReward: 90,
    bossDamage: 160,
    isAiScheduled: true,
    isCompleted: false,
    deadline: 'Cuối tuần',
  },
  {
    id: 'qw3',
    title: 'Đọc hết 1 chương sách chuyên sâu trong Tàng Kinh Các',
    category: 'Sáng tạo',
    scope: 'weekly',
    timeSlot: 'Cả tuần',
    goldReward: 60,
    expReward: 80,
    bossDamage: 140,
    isAiScheduled: false,
    isCompleted: false,
  },
];

const initialRules: Rule[] = [
  {
    id: 'r1',
    name: 'Rule Dậy Sớm & Khởi Động',
    enabled: true,
    triggerVariable: 'Hành động',
    triggerOperator: 'chứa từ khóa',
    triggerKeyword: 'dậy sớm, thức dậy, chạy bộ buổi sáng',
    conditionVariable: 'Thời gian',
    conditionOperator: 'nhỏ hơn',
    conditionValue: '07:00 AM',
    actionType: 'add',
    actionValue: 30,
    actionTarget: 'Vàng',
    subAction: 'Sinh ra 1 nhiệm vụ phụ: Uống 500ml nước ấm',
  },
  {
    id: 'r2',
    name: 'Rule Đọc Sách & Phát Triển Trí Tuệ',
    enabled: true,
    triggerVariable: 'Hành động',
    triggerOperator: 'chứa từ khóa',
    triggerKeyword: 'đọc sách, nghiên cứu, flashcard',
    conditionVariable: 'Chuỗi ngày',
    conditionOperator: 'lớn hơn',
    conditionValue: '1',
    actionType: 'add',
    actionValue: 25,
    actionTarget: 'EXP Trí tuệ',
    subAction: 'Cộng thêm 15 Vàng thưởng chuyên cần',
  },
  {
    id: 'r3',
    name: 'Rule Cấm Thức Khuya Lướt Mạng',
    enabled: true,
    triggerVariable: 'Hành động',
    triggerOperator: 'chứa từ khóa',
    triggerKeyword: 'lướt tiktok, top top, thức khuya, cày game',
    conditionVariable: 'Thời gian',
    conditionOperator: 'lớn hơn',
    conditionValue: '23:30',
    actionType: 'subtract',
    actionValue: 10,
    actionTarget: 'HP',
    subAction: 'Trừ 15 EXP Kỷ luật',
  },
  {
    id: 'r4',
    name: 'Rule Trà Sữa Tự Giác',
    enabled: true,
    triggerVariable: 'Chi tiêu',
    triggerOperator: 'chứa từ khóa',
    triggerKeyword: 'trà sữa, trà đào, nước ngọt',
    conditionVariable: 'Số tiền',
    conditionOperator: 'lớn hơn',
    conditionValue: '35000',
    actionType: 'subtract',
    actionValue: 15,
    actionTarget: 'Vàng',
    subAction: 'Ghi nhận vào danh mục Giải trí',
  },
];

const initialShopItems: ShopItem[] = [
  {
    id: 's1',
    name: 'Chơi Game 1 Giờ',
    currency: 'gold',
    basePrice: 50,
    icon: '🎮',
    description: 'Thoải mái quẩy game không vướng bận tội lỗi lương tâm.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0.1,
  },
  {
    id: 's2',
    name: 'Xem Youtube / Phim 30 Phút',
    currency: 'gold',
    basePrice: 30,
    icon: '🍿',
    description: 'Thưởng thức video yêu thích hoặc 1 tập anime.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0.08,
  },
  {
    id: 's3',
    name: 'Mua Snack / Đồ Ăn Vặt',
    currency: 'gold',
    basePrice: 40,
    icon: '🍟',
    description: 'Được phép nhâm nhi một gói snack khoai tây giòn rụm.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0.05,
  },
  {
    id: 's4',
    name: 'Ngủ Trưa Thư Giãn 45 Phút',
    currency: 'gold',
    basePrice: 25,
    icon: '🛋️',
    description: 'Nạp lại 100% năng lượng tỉnh táo cho buổi chiều.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0.05,
  },
  {
    id: 's5',
    name: 'Nghỉ Trọn 1 Ngày Không Task',
    currency: 'diamond',
    basePrice: 5,
    icon: '🏖️',
    description: 'Đặc quyền miễn dịch: Giữ nguyên Streak mà không cần làm task nào.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0,
    isSpecial: true,
  },
  {
    id: 's6',
    name: 'Ăn Tối Nhà Hàng Tự Thưởng',
    currency: 'diamond',
    basePrice: 10,
    icon: '🍷',
    description: 'Thưởng cho bản thân một bữa tối thịnh soạn tại nhà hàng ưa thích.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0,
    isSpecial: true,
  },
  {
    id: 's7',
    name: 'Mua Đồ Mới Mơ Ước',
    currency: 'diamond',
    basePrice: 15,
    icon: '👟',
    description: 'Phần thưởng tối thượng tích lũy từ chuỗi kỷ luật thép.',
    purchasedCount: 0,
    inflationRatePerPurchase: 0,
    isSpecial: true,
  },
];

const initialBudgetCategories: BudgetCategory[] = [
  {
    id: 'b1',
    name: 'Giải trí & Ăn vặt',
    limit: 500000,
    spent: 0,
    icon: '🎮',
    color: 'emerald',
  },
  {
    id: 'b2',
    name: 'Ăn uống hàng ngày',
    limit: 3000000,
    spent: 0,
    icon: '🍲',
    color: 'indigo',
  },
  {
    id: 'b3',
    name: 'Học tập & Sách vở',
    limit: 1000000,
    spent: 0,
    icon: '📚',
    color: 'cyan',
  },
  {
    id: 'b4',
    name: 'Thiết yếu & Sinh hoạt',
    limit: 3000000,
    spent: 0,
    icon: '🏠',
    color: 'amber',
  },
];

const initialDocuments: DocumentFile[] = [
  {
    id: 'doc1',
    title: 'Atomic Habits - Kỷ Luật Nguyên Tử.pdf',
    folder: 'Phát Triển Bản Thân',
    size: '4.2 MB',
    pages: 320,
    summary: 'Phương pháp xây dựng thói quen tốt và từ bỏ thói quen xấu với 4 quy luật hành vi đơn giản.',
    content: `Quy luật 1: Khiến nó rõ ràng (Make it obvious). Thiết kế môi trường để gợi ý hành động xuất hiện ngay trước mắt.
Quy luật 2: Khiến nó hấp dẫn (Make it attractive). Kết hợp việc bạn CẦN làm với việc bạn MUỐN làm (Temptation bundling).
Quy luật 3: Khiến nó dễ dàng (Make it easy). Quy tắc 2 phút: Bắt đầu thói quen mới chỉ trong 2 phút đầu tiên.
Quy luật 4: Khiến nó thỏa mãn (Make it satisfying). Thưởng ngay lập tức bằng hệ thống điểm Vàng và EXP để tạo dopamine tích cực.`,
    flashcards: [
      { question: 'Vòng lặp 4 bước của thói quen là gì?', answer: 'Gợi ý (Cue) -> Khao khát (Craving) -> Phản hồi (Response) -> Phần thưởng (Reward).' },
      { question: 'Quy tắc 2 phút trong Atomic Habits hoạt động ra sao?', answer: 'Khi bắt đầu thói quen mới, hãy thu nhỏ nó lại sao cho mất không quá 2 phút để hoàn thành (VD: đọc 1 trang sách, hít đất 5 cái).' },
    ]
  },
  {
    id: 'doc2',
    title: 'Tâm Lý Học Về Tiền - Morgan Housel.pdf',
    folder: 'Tài Chính Cá Nhân',
    size: '3.1 MB',
    pages: 256,
    summary: 'Cách suy nghĩ về của cải, lòng tham và hạnh phúc thông qua tâm lý học hành vi.',
    content: `Sự giàu có thực sự là những gì bạn không nhìn thấy: Những chiếc xe chưa mua, những chiếc đồng hồ chưa đeo.
Tiết kiệm tiền là tấm khiên bảo vệ sự tự do cá nhân trước những biến động bất ngờ của cuộc sống.
Chi tiêu ít hơn mức bạn kiếm được là siêu năng lực tài chính mạnh mẽ nhất.`,
    flashcards: [
      { question: 'Sự giàu có (Wealth) khác sự xa hoa (Richness) như thế nào?', answer: 'Người xa hoa chi nhiều tiền cho đồ dùng bề nổi. Người giàu có sở hữu tài sản chưa chi tiêu mang lại quyền tự do.' },
    ]
  }
];

const initialCalendarBlocks: CalendarTimeBlock[] = [
  { id: 'cb1', day: 0, startTime: '07:30', durationHours: 1.0, title: 'Đọc 20 trang Atomic Habits', category: 'Trí tuệ', color: 'emerald' },
  { id: 'cb2', day: 0, startTime: '17:30', durationHours: 1.0, title: 'Rèn luyện Thể Lực & Cardio', category: 'Thể lực', color: 'rose' },
  { id: 'cb3', day: 6, startTime: '20:00', durationHours: 1.5, title: 'Viết nhật ký tổng kết tuần & Lập plan mới', category: 'Kỷ luật', color: 'indigo' },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserStats>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : defaultNewbieUserStats;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    if (!saved) return true;
    const parsed = JSON.parse(saved);
    return !parsed.isInitialized;
  });

  const [boss, setBoss] = useState<Boss>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_boss`);
    return saved ? JSON.parse(saved) : initialBoss;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
    return saved ? JSON.parse(saved) : initialQuests;
  });

  const [actionLogs, setActionLogs] = useState<ActionLogMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : [];
  });

  const [rules, setRules] = useState<Rule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    return saved ? JSON.parse(saved) : initialRules;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shop`);
    return saved ? JSON.parse(saved) : initialShopItems;
  });

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_budget`);
    return saved ? JSON.parse(saved) : initialBudgetCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tx`);
    return saved ? JSON.parse(saved) : [];
  });

  const [documents, setDocuments] = useState<DocumentFile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_docs`);
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [calendarBlocks, setCalendarBlocks] = useState<CalendarTimeBlock[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_calendar`);
    return saved ? JSON.parse(saved) : initialCalendarBlocks;
  });

  const [activeTab, setActiveTab] = useState<number>(0);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sound.enabled = enabled;
  };

  // Rule conflicts
  const [ruleConflicts, setRuleConflicts] = useState<RuleConflict[]>([]);

  useEffect(() => {
    const conflicts: RuleConflict[] = [];
    const activeRules = rules.filter(r => r.enabled);

    for (let i = 0; i < activeRules.length; i++) {
      for (let j = i + 1; j < activeRules.length; j++) {
        const r1 = activeRules[i];
        const r2 = activeRules[j];

        const words1 = r1.triggerKeyword.toLowerCase().split(/[\s,]+/);
        const words2 = r2.triggerKeyword.toLowerCase().split(/[\s,]+/);
        const hasOverlap = words1.some(w => w.length > 2 && words2.includes(w));

        if (hasOverlap && r1.actionTarget === r2.actionTarget && r1.actionType !== r2.actionType) {
          conflicts.push({
            rule1Id: r1.id,
            rule1Name: r1.name,
            rule2Id: r2.id,
            rule2Name: r2.name,
            reason: `Quy tắc "${r1.name}" (${r1.actionType === 'add' ? 'Cộng' : 'Trừ'} ${r1.actionTarget}) và "${r2.name}" (${r2.actionType === 'add' ? 'Cộng' : 'Trừ'} ${r2.actionTarget}) có từ khóa trùng lặp nhưng tác động trái ngược nhau!`,
          });
        }
      }
    }
    setRuleConflicts(conflicts);
  }, [rules]);

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_boss`, JSON.stringify(boss));
  }, [boss]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(actionLogs));
  }, [actionLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rules`, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shop`, JSON.stringify(shopItems));
  }, [shopItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_budget`, JSON.stringify(budgetCategories));
  }, [budgetCategories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tx`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_docs`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_calendar`, JSON.stringify(calendarBlocks));
  }, [calendarBlocks]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  // Helper function for Level Calculation:
  // "Mỗi một cấp sẽ là 100 EXP, ví dụ cấp 1 là 100 EXP, cấp 2 là 200 EXP, tương tự cấp 3 là 300 EXP"
  // Formula: Level N needs N * 100 EXP to level up.
  const calculateLevelUp = (currentLv: number, currentExp: number, gainedExp: number) => {
    let lv = currentLv;
    let exp = currentExp + gainedExp;
    let maxExp = lv * 100;
    let bonusDiamonds = 0;
    let leveledUp = false;

    while (exp >= maxExp) {
      exp -= maxExp;
      lv += 1;
      maxExp = lv * 100;
      bonusDiamonds += 2;
      leveledUp = true;
    }

    return { lv, exp, maxExp, bonusDiamonds, leveledUp };
  };

  // Tân thủ tạo nhân vật mới: TẤT CẢ ĐỀU BẮT ĐẦU TỪ SỐ 0
  const initNewUser = (profile: { name: string; age: number; title: string; avatar: string }) => {
    const newUser: UserStats = {
      name: profile.name.trim() || 'Tân Binh Aether',
      age: profile.age || 18,
      title: profile.title.trim() || 'Học Viên Sơ Cấp',
      avatar: profile.avatar || defaultNewbieUserStats.avatar,
      level: 1, // Cấp 1
      exp: 0,   // 0 EXP
      maxExp: 100, // Cấp 1 = 100 EXP
      hp: 100,
      maxHp: 100,
      gold: 0,       // Bắt đầu từ 0
      diamonds: 0,   // Bắt đầu từ 0
      streak: 0,     // Bắt đầu từ 0
      lastActiveDate: new Date().toISOString().split('T')[0],
      isInitialized: true,
      skills: {
        triTue: 0,   // Bắt đầu từ 0
        theLuc: 0,   // Bắt đầu từ 0
        taiChinh: 0, // Bắt đầu từ 0
        kyLuat: 0,   // Bắt đầu từ 0
        sangTao: 0,  // Bắt đầu từ 0
      },
    };

    setUser(newUser);
    setIsOnboardingOpen(false);
    triggerConfetti();
    sound.playQuestComplete();
  };

  const resetToNewbieZero = () => {
    setUser(defaultNewbieUserStats);
    setIsOnboardingOpen(true);
  };

  // Direct Damage Boss
  const damageBoss = (amount: number) => {
    sound.playAttack();
    setBoss(prev => {
      const nextHp = Math.max(0, prev.hp - amount);
      if (nextHp === 0 && prev.hp > 0) {
        triggerConfetti();
        sound.playQuestComplete();
        setUser(u => ({
          ...u,
          diamonds: u.diamonds + 5,
          gold: u.gold + 100,
        }));
        return {
          ...prev,
          name: `Hắc Ma Trì Hoãn Cấp ${prev.level + 1}`,
          title: 'Ảo Ảnh Cám Dỗ Vô Tận',
          hp: 1000 + prev.level * 200,
          maxHp: 1000 + prev.level * 200,
          level: prev.level + 1,
          dailyCompletedCount: 0,
          dailyBaseScore: 0,
        };
      }
      return { ...prev, hp: nextHp };
    });
  };

  // Daily Boss Damage Calculation:
  // "máu của quái vật sẽ được tính mỗi ngày, tính tổng kết sau một ngày. Công thức sẽ bằng tổng điểm mỗi nhiệm vụ cộng lại nhân với (1 + số nhiệm vụ / 10). Tức là nhiệm vụ càng nhiều thì nhân máu trừ sẽ càng lớn hơn thay vì là cộng tổng như bình thường."
  const executeDailyBossStrike = () => {
    const count = boss.dailyCompletedCount;
    const baseScore = boss.dailyBaseScore;

    if (count === 0 || baseScore === 0) {
      sound.playWarning();
      return { damage: 0, count: 0, multiplier: 1 };
    }

    const multiplier = 1 + count / 10;
    const totalDamage = Math.round(baseScore * multiplier);

    damageBoss(totalDamage);
    triggerConfetti();
    sound.playQuestComplete();

    // Reset daily count after strike
    setBoss(prev => ({
      ...prev,
      dailyCompletedCount: 0,
      dailyBaseScore: 0,
    }));

    return { damage: totalDamage, count, multiplier };
  };

  const completeQuest = (questId: string) => {
    const q = quests.find(item => item.id === questId);
    if (!q || q.isCompleted) return;

    sound.playQuestComplete();
    triggerConfetti();

    // Tally into Daily Boss calculation pool:
    // Base score accumulates, and daily completed quests count increments!
    setBoss(prev => ({
      ...prev,
      dailyCompletedCount: prev.dailyCompletedCount + 1,
      dailyBaseScore: prev.dailyBaseScore + (q.bossDamage || 50),
    }));

    // Update quest state
    setQuests(prev =>
      prev.map(item => (item.id === questId ? { ...item, isCompleted: true } : item))
    );

    // Reward user stats & skill exp with Level N = N * 100 formula
    setUser(prev => {
      const { lv, exp, maxExp, bonusDiamonds, leveledUp } = calculateLevelUp(
        prev.level,
        prev.exp,
        q.expReward
      );

      if (leveledUp) {
        sound.playCoin();
        triggerConfetti();
      }

      const updatedSkills = { ...prev.skills };
      if (q.category === 'Trí tuệ') updatedSkills.triTue += q.expReward;
      if (q.category === 'Thể lực') updatedSkills.theLuc += q.expReward;
      if (q.category === 'Tài chính') updatedSkills.taiChinh += q.expReward;
      if (q.category === 'Kỷ luật') updatedSkills.kyLuat += q.expReward;
      if (q.category === 'Sáng tạo') updatedSkills.sangTao += q.expReward;

      return {
        ...prev,
        level: lv,
        exp,
        maxExp,
        gold: prev.gold + q.goldReward,
        diamonds: prev.diamonds + bonusDiamonds,
        skills: updatedSkills,
        streak: prev.streak === 0 ? 1 : prev.streak,
      };
    });
  };

  const addQuest = (newQuest: Omit<Quest, 'id' | 'isCompleted'>) => {
    const quest: Quest = {
      ...newQuest,
      id: `q_${Date.now()}`,
      isCompleted: false,
    };
    setQuests(prev => [quest, ...prev]);
    sound.playCoin();
  };

  // Nhật ký AI: Phải đợi người dùng ấn chấp nhận mới bắt đầu được tính!
  const applyStatusCards = (cards: StatusCard[], messageId: string) => {
    let deltaGold = 0;
    let deltaHp = 0;
    let deltaExp = 0;
    let bossDmg = 0;

    cards.forEach(card => {
      const { gold, hp, exp, skill, amount, category, bossDamage } = card.statChanges;
      if (gold) deltaGold += gold;
      if (hp) deltaHp += hp;
      if (exp) deltaExp += exp;
      if (bossDamage) bossDmg += bossDamage;

      if (card.type === 'expense' && amount) {
        addTransaction({
          title: card.title.replace('💸', '').trim(),
          amount: amount,
          type: 'expense',
          category: category || 'Giải trí & Ăn vặt',
        });
      }

      if (skill && exp) {
        setUser(u => {
          const updatedSkills = { ...u.skills };
          if (skill === 'Trí tuệ') updatedSkills.triTue = Math.max(0, updatedSkills.triTue + exp);
          if (skill === 'Thể lực') updatedSkills.theLuc = Math.max(0, updatedSkills.theLuc + exp);
          if (skill === 'Tài chính') updatedSkills.taiChinh = Math.max(0, updatedSkills.taiChinh + exp);
          if (skill === 'Kỷ luật') updatedSkills.kyLuat = Math.max(0, updatedSkills.kyLuat + exp);
          if (skill === 'Sáng tạo') updatedSkills.sangTao = Math.max(0, updatedSkills.sangTao + exp);
          return { ...u, skills: updatedSkills };
        });
      }
    });

    if (deltaHp < 0) {
      sound.playDamage();
    } else {
      sound.playCoin();
    }

    if (bossDmg > 0) {
      // Add to daily boss counter
      setBoss(b => ({
        ...b,
        dailyCompletedCount: b.dailyCompletedCount + 1,
        dailyBaseScore: b.dailyBaseScore + bossDmg,
      }));
    }

    // Update user stats with Level N = N * 100 formula
    setUser(prev => {
      const nextHp = Math.max(0, Math.min(prev.maxHp, prev.hp + deltaHp));
      const { lv, exp, maxExp, bonusDiamonds } = calculateLevelUp(
        prev.level,
        prev.exp,
        deltaExp
      );

      return {
        ...prev,
        hp: nextHp,
        gold: Math.max(0, prev.gold + deltaGold),
        diamonds: prev.diamonds + bonusDiamonds,
        exp,
        level: lv,
        maxExp,
      };
    });

    // Mark as applied
    setActionLogs(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, applied: true } : msg))
    );

    triggerConfetti();
  };

  const addActionLog = (msg: { text: string; image?: string; cards?: StatusCard[] }) => {
    const userMsg: ActionLogMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: msg.text,
      image: msg.image,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newLogs: ActionLogMessage[] = [userMsg];

    if (msg.cards && msg.cards.length > 0) {
      const sysMsg: ActionLogMessage = {
        id: `sys_${Date.now() + 1}`,
        sender: 'system',
        text: 'Hệ thống AI đã phân tích hành động dựa theo các quy tắc trong Lò Rèn. Vui lòng xem lại và bấm "Chấp nhận" để bắt đầu tính điểm:',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        statusCards: msg.cards,
        applied: false, // CHƯA TÍNH ĐIỂM KHI CHƯA CHẤP NHẬN
      };
      newLogs.push(sysMsg);
    }

    setActionLogs(prev => [...prev, ...newLogs]);
  };

  const updateStatusCard = (messageId: string, cardId: string, updated: StatusCard) => {
    setActionLogs(prev =>
      prev.map(msg => {
        if (msg.id !== messageId || !msg.statusCards) return msg;
        return {
          ...msg,
          statusCards: msg.statusCards.map(c => (c.id === cardId ? updated : c)),
        };
      })
    );
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const saveRule = (rule: Rule): boolean => {
    const otherActiveRules = rules.filter(r => r.enabled && r.id !== rule.id);
    const wordsNew = rule.triggerKeyword.toLowerCase().split(/[\s,]+/);

    for (const other of otherActiveRules) {
      const wordsOther = other.triggerKeyword.toLowerCase().split(/[\s,]+/);
      const hasOverlap = wordsNew.some(w => w.length > 2 && wordsOther.includes(w));
      if (hasOverlap && rule.actionTarget === other.actionTarget && rule.actionType !== other.actionType) {
        sound.playWarning();
        return false;
      }
    }

    setRules(prev => {
      const exists = prev.some(r => r.id === rule.id);
      if (exists) {
        return prev.map(r => (r.id === rule.id ? rule : r));
      }
      return [...prev, rule];
    });

    sound.playCoin();
    return true;
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const buyShopItem = (item: ShopItem): { success: boolean; message: string } => {
    const currentPrice =
      item.currency === 'gold'
        ? Math.round(item.basePrice * (1 + item.purchasedCount * item.inflationRatePerPurchase))
        : item.basePrice;

    if (item.currency === 'gold') {
      if (user.gold < currentPrice) {
        sound.playWarning();
        return { success: false, message: `Bạn cần thêm ${currentPrice - user.gold} Vàng để đổi vật phẩm này!` };
      }
      setUser(u => ({ ...u, gold: u.gold - currentPrice }));
    } else {
      if (user.diamonds < currentPrice) {
        sound.playWarning();
        return { success: false, message: `Bạn cần thêm ${currentPrice - user.diamonds} Kim Cương để kích hoạt đặc quyền này!` };
      }
      setUser(u => ({ ...u, diamonds: u.diamonds - currentPrice }));
    }

    setShopItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, purchasedCount: i.purchasedCount + 1 } : i))
    );

    sound.playCoin();
    triggerConfetti();
    return { success: true, message: `Chúc mừng! Đã đổi thành công "${item.name}". Hãy tận hưởng phần thưởng!` };
  };

  const addShopItem = (item: Omit<ShopItem, 'id' | 'purchasedCount'>) => {
    const newItem: ShopItem = {
      ...item,
      id: `shop_${Date.now()}`,
      purchasedCount: 0,
    };
    setShopItems(prev => [...prev, newItem]);
    sound.playCoin();
  };

  const rollGacha = (): { reward: string; type: string; value?: number } => {
    if (user.gold < 50) {
      sound.playWarning();
      return { reward: 'Không đủ Vàng (Cần 50 Vàng)!', type: 'error' };
    }

    setUser(u => ({ ...u, gold: u.gold - 50 }));
    sound.playGachaOpen();

    const rand = Math.random() * 100;
    if (rand < 2) {
      triggerConfetti();
      setUser(u => ({ ...u, diamonds: u.diamonds + 5, title: 'Huyền Thoại Vận May' }));
      return { reward: '🌟 SIÊU HIẾM! Bạn trúng 5 Kim Cương & Danh hiệu Hoàng Kim!', type: 'diamond', value: 5 };
    } else if (rand < 10) {
      triggerConfetti();
      setUser(u => ({ ...u, diamonds: u.diamonds + 1 }));
      return { reward: '💎 Chúc mừng! Bạn trúng 1 Kim Cương quý giá!', type: 'diamond', value: 1 };
    } else if (rand < 25) {
      setUser(u => ({ ...u, hp: Math.min(u.maxHp, u.hp + 30) }));
      return { reward: '🧪 Bạn nhận được Bình Thần Dược (+30 HP)!', type: 'hp', value: 30 };
    } else if (rand < 55) {
      setUser(u => ({ ...u, gold: u.gold + 80 }));
      return { reward: '🟡 Bạn trúng Hũ Vàng Lớn: Nhận lại 80 Vàng (+30 Vàng lời)!', type: 'gold', value: 80 };
    } else {
      setUser(u => {
        const { lv, exp, maxExp } = calculateLevelUp(u.level, u.exp, 40);
        return { ...u, exp, level: lv, maxExp };
      });
      return { reward: '✨ Bạn nhận được Cuộn Giấy Kinh Nghiệm (+40 EXP)!', type: 'exp', value: 40 };
    }
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      date: 'Hôm nay, ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (tx.type === 'expense') {
      setBudgetCategories(prev =>
        prev.map(cat => {
          if (cat.name === tx.category || tx.category.includes(cat.name)) {
            return { ...cat, spent: cat.spent + tx.amount };
          }
          return cat;
        })
      );
    }
  };

  const claimFinancialCovenant = (): { success: boolean; message: string } => {
    const isOverBudget = budgetCategories.some(cat => cat.spent > cat.limit);
    if (isOverBudget) {
      sound.playDamage();
      setUser(u => ({ ...u, hp: Math.max(0, u.hp - 25) }));
      return {
        success: false,
        message: '⚠️ Vi phạm Giao ước! Bạn đã chi tiêu vượt hạn mức ở ít nhất 1 danh mục. Bị trừ 25 HP!',
      };
    }

    sound.playQuestComplete();
    triggerConfetti();
    setUser(u => ({ ...u, diamonds: u.diamonds + 3, gold: u.gold + 50 }));
    return {
      success: true,
      message: '🎉 Hoàn thành Giao ước Tài chính xuất sắc! Bạn nhận được Rương Kim Cương (+3 💎, +50 🟡)!',
    };
  };

  // Add Custom Document to Knowledge Base (Tàng Kinh Các)
  const addDocument = (doc: Omit<DocumentFile, 'id'>) => {
    const newDoc: DocumentFile = {
      ...doc,
      id: `doc_${Date.now()}`,
      isCustom: true,
    };
    setDocuments(prev => [newDoc, ...prev]);
    sound.playCoin();
    triggerConfetti();
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addCalendarBlock = (block: Omit<CalendarTimeBlock, 'id'>) => {
    const newBlock: CalendarTimeBlock = {
      ...block,
      id: `cb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setCalendarBlocks(prev => [...prev, newBlock]);
    sound.playCoin();
  };

  const updateCalendarBlock = (id: string, updates: Partial<CalendarTimeBlock>) => {
    setCalendarBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteCalendarBlock = (id: string) => {
    setCalendarBlocks(prev => prev.filter(b => b.id !== id));
  };

  const bulkAddCalendarBlocks = (blocks: Omit<CalendarTimeBlock, 'id'>[]) => {
    const newBlocks = blocks.map((b, idx) => ({
      ...b,
      id: `cb_${Date.now()}_${idx}`,
    }));
    setCalendarBlocks(prev => [...prev, ...newBlocks]);
    triggerConfetti();
    sound.playQuestComplete();
  };

  const resetAllData = () => {
    localStorage.clear();
    setUser(defaultNewbieUserStats);
    setBoss(initialBoss);
    setQuests(initialQuests);
    setActionLogs([]);
    setRules(initialRules);
    setShopItems(initialShopItems);
    setBudgetCategories(initialBudgetCategories);
    setTransactions([]);
    setDocuments(initialDocuments);
    setCalendarBlocks(initialCalendarBlocks);
    setIsOnboardingOpen(true);
  };

  return (
    <GameContext.Provider
      value={{
        user,
        boss,
        quests,
        actionLogs,
        rules,
        ruleConflicts,
        shopItems,
        budgetCategories,
        transactions,
        documents,
        calendarBlocks,
        activeTab,
        soundEnabled,
        isOnboardingOpen,
        setActiveTab,
        setSoundEnabled,
        setIsOnboardingOpen,
        initNewUser,
        resetToNewbieZero,
        completeQuest,
        addQuest,
        damageBoss,
        executeDailyBossStrike,
        applyStatusCards,
        addActionLog,
        updateStatusCard,
        toggleRule,
        saveRule,
        deleteRule,
        buyShopItem,
        addShopItem,
        rollGacha,
        addTransaction,
        claimFinancialCovenant,
        addDocument,
        deleteDocument,
        addCalendarBlock,
        updateCalendarBlock,
        deleteCalendarBlock,
        bulkAddCalendarBlocks,
        triggerConfetti,
        resetAllData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
