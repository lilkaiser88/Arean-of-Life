import React from 'react';
import { useGame } from '../context/GameContext';
import {
  Heart,
  Coins,
  Gem,
  Volume2,
  VolumeX,
  Swords,
  Scroll,
  Hammer,
  ShoppingBag,
  Wallet,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  UserPlus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    soundEnabled,
    setSoundEnabled,
    ruleConflicts,
    quests,
    resetAllData,
    setIsOnboardingOpen,
  } = useGame();

  const overdueCount = quests.filter(q => q.isOverdue && !q.isCompleted).length;
  const uncompletedCount = quests.filter(q => !q.isCompleted).length;

  const tabs = [
    { id: 0, label: 'Tổng Hành Dinh', sub: 'Dashboard', icon: Swords, badge: overdueCount > 0 ? `${overdueCount} trễ` : `${uncompletedCount}` },
    { id: 1, label: 'Nhật Ký AI', sub: 'Action Log', icon: Scroll, badge: 'AI' },
    { id: 2, label: 'Lò Rèn Quy Tắc', sub: 'Rule Builder', icon: Hammer, badge: ruleConflicts.length > 0 ? '⚠️' : undefined },
    { id: 3, label: 'Trạm Đổi Thưởng', sub: 'Reward Shop', icon: ShoppingBag, badge: 'Gacha' },
    { id: 4, label: 'Quản Trị Ngân Khố', sub: 'Finance', icon: Wallet },
    { id: 5, label: 'Tàng Kinh Các & Lịch', sub: 'Knowledge & Calendar', icon: BookOpen, badge: 'Sync' },
  ];

  const hpPercent = Math.min(100, Math.max(0, (user.hp / user.maxHp) * 100));
  const expPercent = Math.min(100, Math.max(0, (user.exp / user.maxExp) * 100));

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner: Character HUD */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/80 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-xs px-1.5 py-0.5 rounded-md shadow">
              Lv.{user.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm md:text-base tracking-wide flex items-center gap-1.5">
                {user.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {user.age || 20} tuổi
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                {user.title}
              </span>
            </div>

            {/* EXP Bar: Lv.N requires N*100 EXP */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 md:w-36 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {user.exp}/{user.maxExp} EXP (Cấp {user.level})
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Vital Stats (HP, Gold, Diamonds) */}
        <div className="flex items-center gap-3 md:gap-5 flex-wrap">
          {/* Pulsing HP Bar */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-red-900/60 shadow-inner">
            <div className="relative flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur animate-ping pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="text-[11px] font-bold text-red-400">HP</span>
                <span className="text-[11px] font-mono font-bold text-slate-200">
                  {user.hp}/{user.maxHp}
                </span>
              </div>
              <div className="w-24 md:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-red-950">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-full transition-all duration-300 shadow-sm shadow-red-500/50"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gold (Vàng) */}
          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-600/40 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">Vàng</div>
              <div className="text-sm md:text-base font-black text-amber-300 font-mono">
                {user.gold.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Diamonds (Kim Cương) */}
          <div className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/40 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gem className="w-4 h-4 fill-cyan-400 text-cyan-400 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-400/80 tracking-wider">Kim Cương</div>
              <div className="text-sm md:text-base font-black text-cyan-300 font-mono">
                {user.diamonds.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Utility Buttons: Onboarding, Sound & Reset */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              title="Tạo nhân vật tân thủ mới (bắt đầu từ số 0)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tân Thủ 0</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Khôi phục toàn bộ và bắt đầu lại từ số 0?')) {
                  resetAllData();
                }
              }}
              title="Đặt lại dữ liệu từ số 0"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Tabs Navigation Bar */}
      <div className="border-t border-slate-800/80 bg-slate-900/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-2 flex items-center gap-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold rounded-t-lg transition-all duration-200 ${
                  isActive
                    ? 'text-amber-400 bg-slate-950 border-t-2 border-amber-500 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      tab.badge === '⚠️'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : tab.badge.includes('trễ')
                        ? 'bg-red-500 text-white font-black animate-pulse'
                        : isActive
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Warning Banner if logic conflict detected */}
      {ruleConflicts.length > 0 && activeTab !== 2 && (
        <div
          onClick={() => setActiveTab(2)}
          className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-rose-200 cursor-pointer hover:bg-rose-900/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span>
              Phát hiện <strong>{ruleConflicts.length} xung đột logic</strong> trong Lò Rèn Quy Tắc! Nhấp để kiểm tra và xử lý ngay.
            </span>
          </div>
          <span className="underline font-bold text-rose-300 text-[11px]">Đến Lò Rèn &rarr;</span>
        </div>
      )}
    </header>
  );
};
