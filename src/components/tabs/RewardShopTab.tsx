import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  ShoppingBag,
  Coins,
  Gem,
  Sparkles,
  Gift,
  Plus,
  Flame,
  Check,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { ShopItem } from '../../types';

export const RewardShopTab: React.FC = () => {
  const { user, shopItems, buyShopItem, addShopItem, rollGacha } = useGame();

  const [activeCategory, setActiveCategory] = useState<'all' | 'gold' | 'diamond' | 'gacha'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Gacha states
  const [isGachaRolling, setIsGachaRolling] = useState(false);
  const [gachaResult, setGachaResult] = useState<{ reward: string; type: string } | null>(null);

  // New item form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemCurrency, setNewItemCurrency] = useState<'gold' | 'diamond'>('gold');
  const [newItemPrice, setNewItemPrice] = useState(100);
  const [newItemIcon, setNewItemIcon] = useState('🎁');
  const [newItemDesc, setNewItemDesc] = useState('');

  const handleBuy = (item: ShopItem) => {
    const result = buyShopItem(item);
    setToastMessage({ text: result.message, isError: !result.success });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRollGacha = () => {
    if (user.gold < 50) {
      setToastMessage({ text: 'Bạn không đủ Vàng để mở rương! (Cần 50 🟡)', isError: true });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsGachaRolling(true);
    setGachaResult(null);

    setTimeout(() => {
      const res = rollGacha();
      setIsGachaRolling(false);
      setGachaResult(res);
      setToastMessage({ text: res.reward, isError: res.type === 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addShopItem({
      name: newItemName.trim(),
      currency: newItemCurrency,
      basePrice: Number(newItemPrice) || 50,
      icon: newItemIcon || '🎁',
      description: newItemDesc.trim() || 'Phần thưởng tự do bạn thiết lập.',
      inflationRatePerPurchase: newItemCurrency === 'gold' ? 0.08 : 0,
      isSpecial: newItemCurrency === 'diamond',
    });

    setNewItemName('');
    setNewItemDesc('');
    setShowAddModal(false);
  };

  const goldItems = shopItems.filter(i => i.currency === 'gold');
  const diamondItems = shopItems.filter(i => i.currency === 'diamond');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toastMessage.isError
              ? 'bg-rose-950 border-rose-500 text-rose-200'
              : 'bg-emerald-950 border-emerald-500 text-emerald-200'
          }`}
        >
          <span>{toastMessage.isError ? '⚠️' : '🎉'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Shop Hero Banner */}
      <div className="relative bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="text-lg font-bold text-slate-100">
                Trạm Đổi Thưởng Cá Nhân (Reward Shop)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Nơi biến kỷ luật thành phần thưởng thực tế. Hệ thống tích hợp cơ chế lạm phát tự động
              để ngăn việc lạm dụng phần thưởng giải trí.
            </p>
          </div>

          {/* User Currency Balances & Add Item */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-amber-500/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-mono font-black text-amber-300 text-sm">
                {user.gold.toLocaleString('vi-VN')} 🟡
              </span>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
              <Gem className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span className="font-mono font-black text-cyan-300 text-sm">
                {user.diamonds.toLocaleString('vi-VN')} 💎
              </span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Món Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tất Cả ({shopItems.length})
          </button>
          <button
            onClick={() => setActiveCategory('gold')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeCategory === 'gold'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🟡 Khu Vàng ({goldItems.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('diamond')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeCategory === 'diamond'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>💎 Đặc Quyền Kim Cương ({diamondItems.length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('gacha')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeCategory === 'gacha'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🎲 Máy Quay Gacha</span>
          </button>
        </div>
      </div>

      {/* GACHA TREASURE CHEST SECTION */}
      {(activeCategory === 'all' || activeCategory === 'gacha') && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-700/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/40">
                <Sparkles className="w-3 h-3" /> Vòng Quay Vận May
              </div>
              <h3 className="text-lg font-black text-slate-100">
                Rương Kho Báu Thần Bí (Gacha Roll)
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Tốn <strong>50 Vàng</strong> cho mỗi lần mở. Thử vận may để nhận Kim Cương, Bình Phục
                Hồi HP hoặc Danh hiệu Huyền Thoại!
              </p>

              {/* Drop Rates Breakdown Table */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  45%: +40 EXP
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-amber-300">
                  30%: Hũ Vàng 80 🟡 (+30 lời)
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-rose-300">
                  15%: Bình HP (+30)
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                  8%: 1 💎
                </span>
                <span className="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500 font-bold">
                  2%: 🌟 5 💎 + Danh Hiệu
                </span>
              </div>
            </div>

            {/* Interactive Chest Animation & Button */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`text-6xl transition-transform duration-300 select-none cursor-pointer ${
                  isGachaRolling ? 'animate-bounce scale-125' : 'hover:scale-110'
                }`}
                onClick={handleRollGacha}
              >
                {isGachaRolling ? '✨🎁✨' : '📦'}
              </div>

              {gachaResult && (
                <div className="text-center font-bold text-xs text-amber-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/50 shadow animate-fade-in">
                  {gachaResult.reward}
                </div>
              )}

              <button
                onClick={handleRollGacha}
                disabled={isGachaRolling}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Coins className="w-4 h-4 fill-slate-950" />
                <span>Mở Rương (Tốn 50 Vàng)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOLD SHOP (Giải trí hàng ngày kèm Lạm phát) */}
      {(activeCategory === 'all' || activeCategory === 'gold') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Khu Mua Sắm Bằng Vàng (Giải Trí Hàng Ngày)
            </h3>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Cơ chế lạm phát động khi mua nhiều lần
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goldItems.map(item => {
              const currentPrice = Math.round(
                item.basePrice * (1 + item.purchasedCount * item.inflationRatePerPurchase)
              );
              const inflationPercent = Math.round(
                item.purchasedCount * item.inflationRatePerPurchase * 100
              );

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl p-2 rounded-xl bg-slate-800/80 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-lg">
                        {currentPrice} 🟡
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 mt-3 group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={user.gold < currentPrice}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Đổi Thưởng ({currentPrice} Vàng)</span>
                    </button>

                    {/* Inflation notice */}
                    <div className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                      Giá gốc {item.basePrice} 🟡. Bạn đã mua <strong>{item.purchasedCount} lần</strong> tuần này.{' '}
                      {inflationPercent > 0 ? (
                        <span className="text-amber-400 font-bold">
                          Mức lạm phát: +{inflationPercent}%
                        </span>
                      ) : (
                        <span className="text-emerald-400">Chưa lạm phát</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DIAMOND SHOP (Đặc quyền lớn với viền phát sáng) */}
      {(activeCategory === 'all' || activeCategory === 'diamond') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Gem className="w-4 h-4" /> Khu Mua Sắm Bằng Kim Cương (Đặc Quyền Lớn)
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">
              ✨ Viền phát sáng hào quang đặc biệt
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {diamondItems.map(item => (
              <div
                key={item.id}
                className="relative rounded-2xl p-5 bg-gradient-to-b from-slate-900 to-cyan-950/30 border-2 border-cyan-400/60 shadow-xl shadow-cyan-500/10 flex flex-col justify-between group overflow-hidden"
              >
                {/* Glowing neon aura */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all duration-500" />

                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 shadow-inner group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-900/80 border border-cyan-400 px-2.5 py-1 rounded-xl shadow-md">
                      {item.basePrice} 💎
                    </span>
                  </div>

                  <h4 className="font-black text-base text-slate-100 mt-4 group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-cyan-900/50">
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={user.diamonds < item.basePrice}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 disabled:hover:from-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Gem className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Kích Hoạt Đặc Quyền ({item.basePrice} 💎)</span>
                  </button>

                  <div className="text-[10px] text-cyan-400 text-center mt-2 font-semibold">
                    Đặc quyền cao cấp không bị áp dụng lạm phát
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Thêm Món Mới Tự Chế */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              Tạo Phần Thưởng Tự Chế Mới
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tên phần thưởng</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="VD: Đi massage, Mua cuốn sách mới..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Loại tiền tệ</label>
                  <select
                    value={newItemCurrency}
                    onChange={e => setNewItemCurrency(e.target.value as 'gold' | 'diamond')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="gold">🟡 Vàng (Hàng ngày)</option>
                    <option value="diamond">💎 Kim Cương (Đặc quyền lớn)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Giá bán cơ sở</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Biểu tượng Icon (Emoji)</label>
                <input
                  type="text"
                  value={newItemIcon}
                  onChange={e => setNewItemIcon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mô tả phần thưởng</label>
                <textarea
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  placeholder="Quy định sử dụng phần thưởng..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
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
                  Tạo Món Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
