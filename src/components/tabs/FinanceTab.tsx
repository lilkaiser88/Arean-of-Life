import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Plus,
  Coins,
  Gem,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

const dailyTemplates = [
  { label: '🍜 Ăn sáng', amount: 35000, category: 'Ăn uống hàng ngày' },
  { label: '☕ Cà phê', amount: 30000, category: 'Ăn uống hàng ngày' },
  { label: '🍱 Cơm trưa', amount: 50000, category: 'Ăn uống hàng ngày' },
  { label: '🧋 Trà sữa', amount: 45000, category: 'Giải trí & Ăn vặt' },
  { label: '🛒 Siêu thị / Tạp hóa', amount: 150000, category: 'Thiết yếu & Sinh hoạt' },
  { label: '⛽ Đổ xăng', amount: 50000, category: 'Thiết yếu & Sinh hoạt' },
  { label: '📚 Sách & Học tập', amount: 120000, category: 'Học tập & Sách vở' },
  { label: '🎮 Game / Giải trí', amount: 60000, category: 'Giải trí & Ăn vặt' },
];

export const FinanceTab: React.FC = () => {
  const {
    budgetCategories,
    transactions,
    addTransaction,
    claimFinancialCovenant,
  } = useGame();

  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState(50000);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState('Ăn uống hàng ngày');
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản / MoMo');
  const [txNote, setTxNote] = useState('');
  const [covenantResult, setCovenantResult] = useState<{ message: string; isError?: boolean } | null>(null);
  const [quickAddSuccess, setQuickAddSuccess] = useState<string | null>(null);

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Monthly savings target (10,000,000 VND)
  const savingsTarget = 10000000;
  const savingsProgress = Math.min(100, Math.max(0, Math.round((balance / savingsTarget) * 100)));

  // Today's total expense calculation for daily reconciliation
  const todayTransactions = transactions.filter(t => t.date.includes('Hôm nay'));
  const todayTotalSpent = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Safe daily benchmark = sum of limits / 30
  const totalMonthlyLimit = budgetCategories.reduce((acc, b) => acc + b.limit, 0);
  const safeDailyBudget = Math.round(totalMonthlyLimit / 30);
  const isDailyOverspent = todayTotalSpent > safeDailyBudget;

  const handleApplyTemplate = (tpl: typeof dailyTemplates[0]) => {
    setTxTitle(tpl.label);
    setTxAmount(tpl.amount);
    setTxCategory(tpl.category);
    setTxType('expense');
  };

  const handleQuickAddTemplateDirect = (tpl: typeof dailyTemplates[0]) => {
    addTransaction({
      title: tpl.label,
      amount: tpl.amount,
      type: 'expense',
      category: tpl.category,
      paymentMethod: 'Chuyển khoản / Ví điện tử',
      note: 'Nhập nhanh theo biểu mẫu mẫu',
    });
    setQuickAddSuccess(`Đã ghi nhanh: ${tpl.label} (-${tpl.amount.toLocaleString('vi-VN')} VND)`);
    setTimeout(() => setQuickAddSuccess(null), 3000);
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || txAmount <= 0) return;

    addTransaction({
      title: txTitle.trim(),
      amount: Number(txAmount),
      type: txType,
      category: txCategory,
      paymentMethod,
      note: txNote.trim(),
    });

    setTxTitle('');
    setTxNote('');
    setShowAddTxModal(false);
    setQuickAddSuccess(`Đã lưu giao dịch: ${txTitle} (${txAmount.toLocaleString('vi-VN')} VND)`);
    setTimeout(() => setQuickAddSuccess(null), 3000);
  };

  const handleClaimCovenant = () => {
    const res = claimFinancialCovenant();
    setCovenantResult({ message: res.message, isError: !res.success });
    setTimeout(() => setCovenantResult(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {quickAddSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{quickAddSuccess}</span>
        </div>
      )}

      {/* Top Banner & Summary Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              Quản Trị Ngân Khố & Tài Nguyên (Finance Manager)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhập liệu chi tiêu hàng ngày theo mẫu chuẩn để kết toán chi tiêu chính xác
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddTxModal(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Biểu Mẫu Chi Tiêu Nâng Cao</span>
            </button>
          </div>
        </div>

        {/* 3 Vital Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {/* Income */}
          <div className="bg-slate-950/80 border border-emerald-900/40 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider">
                Tổng Thu Tháng
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-300 font-mono">
                +{totalIncome.toLocaleString('vi-VN')} VND
              </div>
            </div>
          </div>

          {/* Expense */}
          <div className="bg-slate-950/80 border border-rose-900/40 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-rose-400/80 uppercase tracking-wider">
                Tổng Chi Tháng
              </div>
              <div className="text-base sm:text-lg font-black text-rose-300 font-mono">
                -{totalExpense.toLocaleString('vi-VN')} VND
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-slate-950/80 border border-indigo-900/40 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-indigo-300/80 uppercase tracking-wider">
                Số Dư Hiện Tại
              </div>
              <div className="text-base sm:text-lg font-black text-cyan-300 font-mono">
                {balance.toLocaleString('vi-VN')} VND
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK DAILY EXPENSE TEMPLATE SECTION (Mục nhập dữ liệu chi tiêu hàng ngày theo mẫu) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Mẫu Nhập Chi Tiêu Nhanh Hàng Ngày (1-Click Templates)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Bấm chọn mẫu để lưu ngay hoặc tùy chỉnh
          </span>
        </div>

        {/* Quick Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {dailyTemplates.map((tpl, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 p-3 rounded-xl flex flex-col justify-between transition-all group hover:bg-slate-850"
            >
              <div>
                <span className="font-bold text-xs text-slate-200 block truncate group-hover:text-amber-300">
                  {tpl.label}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 mt-1 block">
                  {tpl.amount.toLocaleString('vi-VN')} VND
                </span>
                <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                  {tpl.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => handleQuickAddTemplateDirect(tpl)}
                  className="flex-1 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-[10px] transition-colors"
                >
                  + Ghi Ngay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyTemplate(tpl);
                    setShowAddTxModal(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px]"
                >
                  Sửa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DAILY RECONCILIATION SUMMARY (Kết Toán Chi Tiêu Hôm Nay) */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs mt-2">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="font-bold text-slate-200">
                Kết Toán Chi Tiêu Hôm Nay:
              </div>
              <div className="text-[11px] text-slate-400">
                Đã tiêu hôm nay: <strong className="text-slate-100 font-mono">{todayTotalSpent.toLocaleString('vi-VN')} VND</strong> / Định mức an toàn: <span className="font-mono">{safeDailyBudget.toLocaleString('vi-VN')} VND/ngày</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                isDailyOverspent
                  ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500'
              }`}
            >
              {isDailyOverspent ? '⚠️ Vượt Định Mức Ngày' : '✓ An Toàn Trong Định Mức'}
            </span>
            <button
              onClick={() => setShowAddTxModal(true)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              + Nhập Khoản Khác
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column: Budget Bars vs Financial Covenant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* BUDGET BARS (Thanh Ngân Sách Tự Đổi Màu) - col-span-7 */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📊</span> Thanh Ngân Sách Phân Loại (Budget Bars)
              </h3>
              <p className="text-xs text-slate-400">
                Thanh chuyển sang <strong>Đỏ Rực</strong> nếu chi tiêu vượt hạn mức!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {budgetCategories.map(cat => {
              const isOverBudget = cat.spent > cat.limit;
              const percent = Math.min(100, Math.round((cat.spent / cat.limit) * 100));
              const remaining = cat.limit - cat.spent;

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOverBudget
                      ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-bold text-xs text-slate-200">{cat.name}</span>
                      {isOverBudget && (
                        <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-1.5 py-0.2 rounded animate-pulse flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" /> VƯỢT HẠN MỨC!
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono font-bold">
                      <span className={isOverBudget ? 'text-rose-400 font-black' : 'text-slate-200'}>
                        {cat.spent.toLocaleString('vi-VN')}
                      </span>{' '}
                      <span className="text-slate-400 font-normal">
                        / {cat.limit.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Color Shift */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-750">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isOverBudget
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-md shadow-red-500 animate-pulse'
                          : percent > 80
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, (cat.spent / cat.limit) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Tiến độ: {percent}%</span>
                    <span>
                      {isOverBudget ? (
                        <strong className="text-rose-400">
                          Bội chi {(Math.abs(remaining)).toLocaleString('vi-VN')} VND
                        </strong>
                      ) : (
                        <span>Còn lại {remaining.toLocaleString('vi-VN')} VND</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FINANCIAL COVENANT (Hệ Thống Phạt / Thưởng Kép) - col-span-5 */}
        <div className="lg:col-span-5 space-y-5">
          {/* Covenant Parchment Card */}
          <div className="relative bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-2xl p-5 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-black text-sm text-slate-100 uppercase tracking-wide">
                  Giao Ước Tài Chính Tối Cao
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cơ chế ràng buộc sinh tử: Giữ kỷ luật nhận Kim Cương, vi phạm cắn HP
                </p>
              </div>
            </div>

            {/* Savings Covenant Progress */}
            <div className="bg-slate-950/80 border border-indigo-900/60 p-4 rounded-xl space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Mục Tiêu Tiết Kiệm Tháng</span>
                <span className="font-mono text-cyan-300 font-bold">{savingsProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Hiện có: {balance.toLocaleString('vi-VN')} VND</span>
                <span>Mục tiêu: {savingsTarget.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>

            {/* Covenant Terms */}
            <div className="space-y-2 text-xs text-slate-300 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2">
                <Gem className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Phần Thưởng:</strong> Giữ trọn hạn mức ngân sách & đạt chỉ tiêu tiết kiệm
                  &rarr; <strong>Rương Kim Cương (+3 💎, +50 🟡)</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2 text-rose-300">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Hình Phạt Kép:</strong> Vượt hạn mức bất kỳ danh mục &rarr;{' '}
                  <strong>Cắn trực tiếp -25 HP</strong> vào thanh máu người chơi!
                </span>
              </div>
            </div>

            {/* Claim / Audit Covenant Button */}
            <button
              onClick={handleClaimCovenant}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nghiệm Thu & Kiểm Tra Giao Ước</span>
            </button>

            {covenantResult && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-bold animate-fade-in ${
                  covenantResult.isError
                    ? 'bg-rose-950/90 border border-rose-500 text-rose-200'
                    : 'bg-emerald-950/90 border border-emerald-500 text-emerald-200'
                }`}
              >
                {covenantResult.message}
              </div>
            )}
          </div>

          {/* Recent Synced Transactions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Lịch Sử Giao Dịch Gần Đây ({transactions.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Chưa có giao dịch nào được ghi nhận.
                </div>
              ) : (
                transactions.slice(0, 8).map(tx => (
                  <div
                    key={tx.id}
                    className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{tx.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-indigo-400">{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        {tx.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400/80">{tx.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className={`font-mono font-bold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {tx.amount.toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Biểu Mẫu Nhập Chi Tiêu Nâng Cao */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl my-6">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Biểu Mẫu Ghi Nhận Thu / Chi
            </h3>

            <form onSubmit={handleCreateTx} className="space-y-3.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    txType === 'expense'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Khoản Chi (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    txType === 'income'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Khoản Thu (+)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tên món chi tiêu / thu nhập
                </label>
                <input
                  type="text"
                  value={txTitle}
                  onChange={e => setTxTitle(e.target.value)}
                  placeholder="VD: Cơm trưa văn phòng, Tiền điện nước, Đổ xăng..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={e => setTxAmount(Number(e.target.value))}
                  min={1000}
                  step={1000}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Danh mục ngân sách
                  </label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Ăn uống hàng ngày">Ăn uống hàng ngày</option>
                    <option value="Giải trí & Ăn vặt">Giải trí & Ăn vặt</option>
                    <option value="Học tập & Sách vở">Học tập & Sách vở</option>
                    <option value="Thiết yếu & Sinh hoạt">Thiết yếu & Sinh hoạt</option>
                    <option value="Thu nhập chính">Thu nhập chính / Lương</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Phương thức
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Chuyển khoản / MoMo">Chuyển khoản / MoMo</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Thẻ tín dụng / Thẻ ATM">Thẻ tín dụng / Thẻ ATM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Ghi chú chi tiết (nếu có)
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={e => setTxNote(e.target.value)}
                  placeholder="Ghi chú thêm..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Lưu Khoản Chi Tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
