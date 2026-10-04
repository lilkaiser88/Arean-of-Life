import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Sparkles,
  Shield,
  User,
  Heart,
  Coins,
  Gem,
  Flame,
  CheckCircle2,
} from 'lucide-react';

const avatarOptions = [
  { id: '1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', label: 'Tân Thủ Năng Động' },
  { id: '2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', label: 'Học Giả Trí Tuệ' },
  { id: '3', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80', label: 'Thợ Săn Kỷ Luật' },
  { id: '4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Chiến Binh Quyết Tâm' },
  { id: '5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', label: 'Nhà Sáng Tạo' },
  { id: '6', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Hiệp Sĩ Bền Bỉ' },
];

const titleOptions = [
  'Học Viên Sơ Cấp (Bắt đầu từ số 0)',
  'Tân Binh Kỷ Luật',
  'Kẻ Săn Mục Tiêu Mới',
  'Nhà Khám Phá Tiềm Năng',
];

export const NewPlayerOnboardingModal: React.FC = () => {
  const { isOnboardingOpen, initNewUser } = useGame();

  const [name, setName] = useState('');
  const [age, setAge] = useState(20);
  const [title, setTitle] = useState(titleOptions[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0].url);

  if (!isOnboardingOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initNewUser({
      name: name.trim() || 'Tân Binh Aether',
      age: Number(age) || 18,
      title: title || 'Học Viên Sơ Cấp',
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 w-full max-w-xl shadow-2xl shadow-amber-500/10 my-8 animate-fade-in">
        {/* Banner Header */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5" /> Khởi Tạo Nhân Vật Tân Thủ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
            Chào Mừng Đến Với AetherHabit
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Hành trình vạn dặm bắt đầu từ một bước chân. Bạn sẽ bắt đầu toàn bộ chỉ số từ <strong>con số 0</strong> và rèn luyện mỗi ngày để thăng cấp!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              1. Chọn Avatar Đại Diện
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {avatarOptions.map(av => {
                const isSelected = selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative rounded-xl overflow-hidden p-0.5 border-2 transition-all ${
                      isSelected
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                        : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-amber-300 fill-slate-950" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Age Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                2. Tên Nhân Vật / Người Dùng
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Alex Kỷ Luật, Thợ Săn Minh..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-colors"
                />
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                3. Tuổi
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                min={10}
                max={100}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Title / Archetype */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              4. Danh Hiệu Khởi Đầu
            </label>
            <select
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {titleOptions.map((t, idx) => (
                <option key={idx} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Stats Baseline (All Start at 0) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Bảng Chỉ Số Khởi Điểm (Bắt Đầu Từ 0):
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Cấp Độ</span>
                <strong className="text-amber-400 font-mono text-sm">Lv.1 (0/100 EXP)</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" /> Sinh Lực
                </span>
                <strong className="text-red-400 font-mono text-sm">100/100 HP</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Coins className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> Vàng
                </span>
                <strong className="text-amber-300 font-mono text-sm">0 🟡</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
                  <Gem className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" /> Kim Cương
                </span>
                <strong className="text-cyan-300 font-mono text-sm">0 💎</strong>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-slate-400 text-center flex items-center justify-center gap-3">
              <span>Chuỗi Kỷ Luật: <strong className="text-slate-200">0 Ngày</strong></span>
              <span>•</span>
              <span>5 Kỹ Năng Ngũ Hành: <strong className="text-slate-200">0 EXP</strong></span>
              <span>•</span>
              <span>Công Thức Lên Cấp: <strong className="text-amber-300">Cấp N = N * 100 EXP</strong></span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Khởi Tạo Nhân Vật & Bắt Đầu Hành Trình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
