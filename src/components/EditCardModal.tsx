import React, { useState } from 'react';
import { StatusCard } from '../types';
import { X, Check } from 'lucide-react';

interface EditCardModalProps {
  card: StatusCard;
  onSave: (updated: StatusCard) => void;
  onClose: () => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({ card, onSave, onClose }) => {
  const [title, setTitle] = useState(card.title);
  const [detail, setDetail] = useState(card.detail);
  const [gold, setGold] = useState(card.statChanges.gold || 0);
  const [hp, setHp] = useState(card.statChanges.hp || 0);
  const [exp, setExp] = useState(card.statChanges.exp || 0);
  const [skill, setSkill] = useState<StatusCard['statChanges']['skill']>(card.statChanges.skill || 'Kỷ luật');
  const [amount, setAmount] = useState(card.statChanges.amount || 0);
  const [category, setCategory] = useState(card.statChanges.category || 'Giải trí & Ăn vặt');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...card,
      title,
      detail,
      statChanges: {
        ...card.statChanges,
        gold,
        hp,
        exp,
        skill,
        amount: card.type === 'expense' ? amount : undefined,
        category: card.type === 'expense' ? category : undefined,
      },
      note: `${gold !== 0 ? (gold > 0 ? `+${gold} Vàng, ` : `${gold} Vàng, `) : ''}${hp !== 0 ? (hp > 0 ? `+${hp} HP, ` : `${hp} HP, `) : ''}${exp !== 0 ? `+${exp} EXP ${skill}` : ''}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>✏️</span> Chỉnh Sửa Thẻ Trạng Thái AI Nhận Diện
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Tên hành động</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Chi tiết số lượng</label>
            <input
              type="text"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="VD: 30 trang, 60 phút, 50,000 VND"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Vàng (+/-)</label>
              <input
                type="number"
                value={gold}
                onChange={e => setGold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">HP (+/-)</label>
              <input
                type="number"
                value={hp}
                onChange={e => setHp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">EXP (+/-)</label>
              <input
                type="number"
                value={exp}
                onChange={e => setExp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Kỹ năng nhận EXP</label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value as StatusCard['statChanges']['skill'])}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Trí tuệ">🧠 Trí tuệ</option>
              <option value="Thể lực">⚡ Thể lực</option>
              <option value="Tài chính">💰 Tài chính</option>
              <option value="Kỷ luật">🛡️ Kỷ luật</option>
              <option value="Sáng tạo">✨ Sáng tạo</option>
            </select>
          </div>

          {card.type === 'expense' && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Số tiền (VND)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phân loại chi tiêu</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Giải trí & Ăn vặt">Giải trí & Ăn vặt</option>
                  <option value="Ăn uống hàng ngày">Ăn uống hàng ngày</option>
                  <option value="Học tập & Sách vở">Học tập & Sách vở</option>
                  <option value="Thiết yếu & Sinh hoạt">Thiết yếu & Sinh hoạt</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
