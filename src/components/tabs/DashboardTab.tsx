import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { RadarChart } from '../RadarChart';
import {
  Flame,
  Plus,
  Clock,
  Coins,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sword,
  ShieldAlert,
  Trophy,
  Loader2,
  Calendar,
  Zap,
} from 'lucide-react';
import { Quest } from '../../types';

export const DashboardTab: React.FC = () => {
  const {
    user,
    boss,
    quests,
    completeQuest,
    addQuest,
    damageBoss,
    executeDailyBossStrike,
  } = useGame();

  const [questScopeTab, setQuestScopeTab] = useState<'daily' | 'weekly'>('daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Quest['category']>('Trí tuệ');
  const [newScope, setNewScope] = useState<'daily' | 'weekly'>('daily');
  const [newTimeSlot, setNewTimeSlot] = useState('14:00 - 15:00');
  const [newGoldReward, setNewGoldReward] = useState(25);
  const [newExpReward, setNewExpReward] = useState(30);

  // AI Point Suggestion states
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    goldReward: number;
    expReward: number;
    bossDamage: number;
    reasoning: string;
  } | null>(null);

  const [dailyStrikeResult, setDailyStrikeResult] = useState<{
    damage: number;
    count: number;
    multiplier: number;
  } | null>(null);

  const bossHpPercent = Math.min(100, Math.max(0, (boss.hp / boss.maxHp) * 100));

  // Filter quests by daily or weekly
  const displayedQuests = quests.filter(q => (q.scope || 'daily') === questScopeTab);
  const dailyQuests = quests.filter(q => (q.scope || 'daily') === 'daily');
  const weeklyQuests = quests.filter(q => q.scope === 'weekly');

  // AI Suggest Points Handler
  const handleRequestAiPoints = async () => {
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên việc cần làm trước để AI có thể phân tích độ khó!');
      return;
    }

    setIsAiSuggesting(true);
    setAiSuggestion(null);

    try {
      const res = await fetch('/api/ai/suggest-quest-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          previousQuests: quests.slice(0, 10),
        }),
      });

      const data = await res.json();
      setAiSuggestion(data);
    } catch {
      setAiSuggestion({
        goldReward: 25,
        expReward: 35,
        bossDamage: 50,
        reasoning: 'Gợi ý cân bằng theo mức chuẩn trung bình các lần trước.',
      });
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setNewGoldReward(aiSuggestion.goldReward);
    setNewExpReward(aiSuggestion.expReward);
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addQuest({
      title: newTitle.trim(),
      category: newCategory,
      scope: newScope,
      timeSlot: newTimeSlot,
      goldReward: Number(newGoldReward) || 20,
      expReward: Number(newExpReward) || 30,
      bossDamage: Math.round(Number(newExpReward) * 1.5) || 50,
      isAiScheduled: false,
      suggestedByAi: !!aiSuggestion,
      aiReasoning: aiSuggestion?.reasoning,
    });

    setNewTitle('');
    setAiSuggestion(null);
    setShowAddModal(false);
  };

  const handleExecuteDailyStrike = () => {
    const res = executeDailyBossStrike();
    setDailyStrikeResult(res);
    setTimeout(() => setDailyStrikeResult(null), 5000);
  };

  // Live Daily Multiplier calculation
  // Formula: baseScore * (1 + completedCount / 10)
  const currentCount = boss.dailyCompletedCount;
  const currentBase = boss.dailyBaseScore;
  const currentMultiplier = (1 + currentCount / 10).toFixed(1);
  const potentialDamage = Math.round(currentBase * (1 + currentCount / 10));

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="space-y-6">
      {/* 3-Column Grid Layout: Radar Skill Tree | Today's Quests | Boss Hunt & Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Skill Tree (Cây Kỹ Năng - Biểu đồ Radar) - col-span-4 */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>🕸️</span> Cây Kỹ Năng Ngũ Hành
              </h2>
              <p className="text-xs text-slate-400">Biểu đồ mạng nhện 5 cánh tiến trình thực tế</p>
            </div>
            <span className="text-[11px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full">
              Hệ thống EXP
            </span>
          </div>

          <RadarChart skills={user.skills} />

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
            <div className="text-xs text-slate-400 mb-1">
              Điểm tổng hợp tiềm năng nhân vật
            </div>
            <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-300 to-cyan-400">
              {(
                user.skills.triTue +
                user.skills.theLuc +
                user.skills.taiChinh +
                user.skills.kyLuat +
                user.skills.sangTao
              ).toLocaleString('vi-VN')}{' '}
              EXP TỔNG
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Quy tắc thăng cấp: Cấp N cần <strong>N × 100 EXP</strong>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Quests (Hàng Ngày & Hàng Tuần) - col-span-5 */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col min-h-[520px]">
          {/* Header & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setQuestScopeTab('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  questScopeTab === 'daily'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hôm Nay ({dailyQuests.filter(q => q.isCompleted).length}/{dailyQuests.length})
              </button>
              <button
                onClick={() => setQuestScopeTab('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  questScopeTab === 'weekly'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Hàng Tuần ({weeklyQuests.filter(q => q.isCompleted).length}/{weeklyQuests.length})
              </button>
            </div>

            <button
              onClick={() => {
                setNewScope(questScopeTab);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Task</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {questScopeTab === 'daily'
              ? 'Hoàn thành task hôm nay để nhân hệ số sát thương hạ gục quái vật Trì Hoãn'
              : 'Nhiệm vụ tuần: Viết nhật ký tổng kết tuần, lập chiến lược plan mới, đọc sâu tài liệu'}
          </p>

          {/* Quest Cards Checklist */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {displayedQuests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                Chưa có nhiệm vụ nào trong mục này. Hãy bấm "Thêm Task" để tạo mới!
              </div>
            ) : (
              displayedQuests.map(quest => {
                const isOverdue = quest.isOverdue && !quest.isCompleted;

                return (
                  <div
                    key={quest.id}
                    className={`relative group rounded-xl p-3.5 border transition-all duration-200 ${
                      quest.isCompleted
                        ? 'bg-slate-950/40 border-emerald-900/50 opacity-60'
                        : isOverdue
                        ? 'bg-rose-950/30 border-rose-500/80 animate-pulse text-rose-200 shadow-md shadow-rose-950/40'
                        : 'bg-slate-850/90 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Completion Checkbox */}
                      <button
                        onClick={() => completeQuest(quest.id)}
                        disabled={quest.isCompleted}
                        className={`mt-0.5 transition-transform active:scale-90 ${
                          quest.isCompleted
                            ? 'text-emerald-400 cursor-default'
                            : isOverdue
                            ? 'text-rose-400 hover:text-rose-300'
                            : 'text-slate-500 hover:text-amber-400'
                        }`}
                      >
                        {quest.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm leading-snug ${
                              quest.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                            }`}
                          >
                            {quest.title}
                          </span>

                          {/* AI Scheduled Badge */}
                          {quest.isAiScheduled && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
                              <Sparkles className="w-2.5 h-2.5" />
                              ✨ AI
                            </span>
                          )}

                          {quest.scope === 'weekly' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                              Tuần
                            </span>
                          )}

                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-500 animate-bounce">
                              <AlertCircle className="w-2.5 h-2.5" />
                              QUÁ HẠN
                            </span>
                          )}
                        </div>

                        {/* Meta info: Time, Rewards */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {quest.timeSlot}
                          </span>

                          <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                            <Coins className="w-3.5 h-3.5 fill-amber-400" />
                            +{quest.goldReward} Vàng
                          </span>

                          <span className="text-indigo-400 font-mono text-[11px]">
                            +{quest.expReward} EXP {quest.category}
                          </span>

                          <span className="text-rose-400 font-mono text-[11px] flex items-center gap-0.5">
                            <Sword className="w-3 h-3" />
                            +{quest.bossDamage} Điểm Boss
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Boss Battle & Daily Strike Formula - col-span-3 */}
        <div className="lg:col-span-3 space-y-5">
          {/* Boss Demon Card */}
          <div className="relative bg-gradient-to-b from-slate-900 to-rose-950/40 border border-rose-900/50 rounded-2xl p-4 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-600/30 text-rose-300 font-bold text-[10px] uppercase px-2.5 py-1 rounded-bl-xl border-l border-b border-rose-500/40">
              Boss Thế Giới
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <img
                  src={boss.avatar}
                  alt={boss.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-rose-500/60 shadow-lg shadow-rose-950"
                />
                <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                  Lv.{boss.level}
                </span>
              </div>
              <div>
                <h3 className="font-black text-rose-200 text-sm">{boss.name}</h3>
                <p className="text-[11px] text-rose-400/80">{boss.title}</p>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  Đại diện cho "Sự Trì Hoãn"
                </div>
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5" /> HP Boss
                </span>
                <span className="font-mono font-bold text-slate-200 text-xs">
                  {boss.hp} / {boss.maxHp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-rose-950 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-700 via-red-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>

            {/* Daily Damage Multiplier Box (Công thức: Tổng điểm * (1 + Số task / 10)) */}
            <div className="bg-slate-950/80 border border-rose-900/60 rounded-xl p-3 mb-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Tổng Kết Cuối Ngày:
                </span>
                <span className="text-amber-400 font-mono">Hệ số x{currentMultiplier}</span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Đã xong hôm nay: <strong className="text-slate-200">{currentCount} task</strong></div>
                <div>Điểm cơ bản: <strong className="text-slate-200">{currentBase} pts</strong></div>
                <div className="text-rose-300 font-semibold pt-1 border-t border-slate-800">
                  Công thức: {currentBase} × (1 + {currentCount}/10) = <strong>{potentialDamage} HP</strong>
                </div>
              </div>
            </div>

            {/* Daily Boss Strike Button */}
            <button
              onClick={handleExecuteDailyStrike}
              disabled={currentCount === 0}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white text-xs font-black transition shadow-lg shadow-rose-950 active:scale-95 mb-2"
            >
              <Sword className="w-4 h-4" />
              <span>⚔️ Tổng Kết Ngày & Đánh Boss ({potentialDamage} HP)</span>
            </button>

            {dailyStrikeResult && (
              <div className="p-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-[11px] font-bold text-center animate-fade-in mb-2">
                🎉 Đã giáng đòn chí mạng {dailyStrikeResult.damage} HP lên Boss! (Hệ số x{dailyStrikeResult.multiplier})
              </div>
            )}

            <button
              onClick={() => damageBoss(25)}
              className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[11px] transition"
            >
              Đòn đánh thường nhanh (-25 HP)
            </button>
          </div>

          {/* Streak Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Chuỗi Kỷ Luật
                  </div>
                  <div className="text-base font-black text-amber-300 flex items-center gap-1">
                    🔥 {user.streak} Ngày liên tiếp
                  </div>
                </div>
              </div>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            {/* Weekly Days Heat Grid */}
            <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-slate-800">
              {daysOfWeek.map((day, idx) => {
                const isDayPassed = user.streak > 0 && idx < user.streak;
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">{day}</span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isDayPassed
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                          : 'bg-slate-800/60 text-slate-500 border border-slate-750'
                      }`}
                    >
                      {isDayPassed ? '✓' : '•'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Thêm Task Mới (Có AI Đề Xuất Điểm Dựa Trên Lịch Sử) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-lg shadow-2xl my-6">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Thêm Nhiệm Vụ Mới
            </h3>

            <form onSubmit={handleCreateQuest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1. Tên việc cần làm
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Đọc 20 trang sách triết học, Chạy bộ 5km..."
                    required
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  {/* AI Suggest Points Button */}
                  <button
                    type="button"
                    onClick={handleRequestAiPoints}
                    disabled={isAiSuggesting || !newTitle.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 whitespace-nowrap transition"
                  >
                    {isAiSuggesting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>✨ AI Gợi Ý Điểm</span>
                  </button>
                </div>
              </div>

              {/* AI Suggestion Box */}
              {aiSuggestion && (
                <div className="bg-indigo-950/70 border border-indigo-500/60 rounded-xl p-3 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Gợi Ý Điểm Từ AI (Dựa trên lịch sử):
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyAiSuggestion}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] shadow transition active:scale-95"
                    >
                      ✓ Chấp Nhận Gợi Ý Này
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-200">
                    <span className="text-amber-400">+{aiSuggestion.goldReward} Vàng</span>
                    <span>•</span>
                    <span className="text-indigo-300">+{aiSuggestion.expReward} EXP</span>
                    <span>•</span>
                    <span className="text-rose-400">+{aiSuggestion.bossDamage} Điểm Boss</span>
                  </div>

                  <p className="text-[11px] text-slate-300 italic leading-snug">
                    "{aiSuggestion.reasoning}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    2. Phân loại nhiệm vụ
                  </label>
                  <select
                    value={newScope}
                    onChange={e => setNewScope(e.target.value as 'daily' | 'weekly')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="daily">Hàng ngày (Daily Quest)</option>
                    <option value="weekly">Hàng tuần (Weekly Review/Plan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    3. Thuộc tính kỹ năng
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as Quest['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Trí tuệ">🧠 Trí tuệ</option>
                    <option value="Thể lực">⚡ Thể lực</option>
                    <option value="Tài chính">💰 Tài chính</option>
                    <option value="Kỷ luật">🛡️ Kỷ luật</option>
                    <option value="Sáng tạo">✨ Sáng tạo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  4. Khung giờ dự kiến
                </label>
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={e => setNewTimeSlot(e.target.value)}
                  placeholder="VD: 07:00 - 08:00 hoặc Cả tuần"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Point settings (Manual or Auto filled by AI) */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Thưởng Vàng (🟡)
                  </label>
                  <input
                    type="number"
                    value={newGoldReward}
                    onChange={e => setNewGoldReward(Number(e.target.value))}
                    min={5}
                    max={200}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Thưởng EXP
                  </label>
                  <input
                    type="number"
                    value={newExpReward}
                    onChange={e => setNewExpReward(Number(e.target.value))}
                    min={5}
                    max={200}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Tạo Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
