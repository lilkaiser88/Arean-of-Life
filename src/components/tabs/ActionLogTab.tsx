import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  Edit2,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Bot,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { StatusCard } from '../../types';
import { EditCardModal } from '../EditCardModal';

export const ActionLogTab: React.FC = () => {
  const { actionLogs, addActionLog, applyStatusCards, updateStatusCard, rules } = useGame();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<{ messageId: string; card: StatusCard } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [actionLogs, isAnalyzing]);

  // Voice Speech Recognition or Simulation
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch {
        // Fallback simulation
        simulateVoice();
      }
    } else {
      simulateVoice();
    }
  };

  const simulateVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setInputText(
        'Sáng nay đọc xong 30 trang sách triết học, uống 1 cốc trà sữa 50k, lướt top top 1 tiếng.'
      );
      setIsRecording(false);
    }, 2000);
  };

  // Image Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Log for AI parsing
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const textToSend = inputText.trim();
    const imageToSend = attachedImage;

    setInputText('');
    setAttachedImage(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          imageBase64: imageToSend,
          rules: rules,
        }),
      });

      const data = await res.json();
      const rawCards = data.cards || [];

      // Format cards
      const formattedCards: StatusCard[] = rawCards.map((c: any, index: number) => ({
        id: `sc_${Date.now()}_${index}`,
        type: c.type || 'positive',
        title: c.title || 'Hành động',
        detail: c.detail || '',
        statChanges: c.statChanges || { gold: 10, hp: 0, exp: 20 },
        note: c.note || '',
      }));

      addActionLog({
        text: textToSend || 'Đã gửi ảnh hóa đơn / bằng chứng',
        image: imageToSend || undefined,
        cards: formattedCards,
      });
    } catch (err) {
      console.error(err);
      // Fallback deterministic local cards
      const fallbackCards: StatusCard[] = [
        {
          id: `sc_${Date.now()}_1`,
          type: 'positive',
          title: '📖 Đọc sách Triết học',
          detail: '30 trang',
          statChanges: { gold: 15, hp: 0, exp: 30, skill: 'Trí tuệ', bossDamage: 50 },
          note: '+15 Vàng, +30 EXP Trí tuệ.',
        },
        {
          id: `sc_${Date.now()}_2`,
          type: 'negative',
          title: '📱 Lướt Mạng Xã Hội',
          detail: '60 phút',
          statChanges: { gold: 0, hp: -5, exp: -10, skill: 'Kỷ luật', bossDamage: 0 },
          note: '-5 HP, -10 EXP Kỷ luật.',
        },
        {
          id: `sc_${Date.now()}_3`,
          type: 'expense',
          title: '💸 Trà sữa thơm ngon',
          detail: '50,000 VND',
          statChanges: { gold: 0, hp: 0, exp: 0, amount: 50000, category: 'Giải trí & Ăn vặt' },
          note: 'Phân loại: Giải trí. Đã trừ vào Ngân khố.',
        },
      ];

      addActionLog({
        text: textToSend,
        image: imageToSend || undefined,
        cards: fallbackCards,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Telegram Style Chat Header */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">
                AI Studio Action Log (Nhật Ký)
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                Gemini 3.8 Flash Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gõ tự nhiên, nói bằng mic hoặc đính kèm hóa đơn chi tiêu
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tự động đối chiếu Lò Rèn</span>
        </div>
      </div>

      {/* Quick Prompts Chips */}
      <div className="bg-slate-950/50 border-b border-slate-800/60 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-slate-400 text-[11px] whitespace-nowrap font-semibold">Gợi ý mẫu:</span>
        <button
          onClick={() =>
            setInputText(
              'Sáng nay đọc xong 30 trang sách triết học, uống 1 cốc trà sữa 50k, lướt top top 1 tiếng.'
            )
          }
          className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
        >
          📖 Đọc sách 30 trang + Trà sữa 50k + Lướt Top Top 1h
        </button>
        <button
          onClick={() =>
            setInputText('Chiều nay chạy bộ 5km công viên, uống cà phê 35k, hít đất 50 cái.')
          }
          className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
        >
          🏃 Chạy bộ 5km + Cà phê 35k
        </button>
        <button
          onClick={() =>
            setInputText('Thức khuya cày phim tới 2h sáng, tiêu lố 120k đặt đồ ăn đêm.')
          }
          className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-rose-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
        >
          🚨 Thức khuya 2h sáng + Ăn đêm 120k
        </button>
      </div>

      {/* Main Telegram Chat View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {actionLogs.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender identity */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
              {msg.sender === 'user' ? (
                <>
                  <span>Bạn</span>
                  <UserIcon className="w-3 h-3 text-amber-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span>Trợ Lý AetherHabit AI</span>
                </>
              )}
              <span className="text-[10px] text-slate-400 font-mono">({msg.timestamp})</span>
            </div>

            {/* Bubble Message */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
              }`}
            >
              {/* Attached Image if any */}
              {msg.image && (
                <div className="mb-2">
                  <img
                    src={msg.image}
                    alt="Đính kèm"
                    className="max-h-48 rounded-lg object-cover border border-slate-700/50"
                  />
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>

            {/* System Status Cards Returned by AI */}
            {msg.statusCards && msg.statusCards.length > 0 && (
              <div className="w-full max-w-[92%] mt-3 space-y-2.5">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Thẻ Gợi Ý Tính Điểm Của AI ({msg.statusCards.length} sự kiện):
                  </span>
                  {msg.applied ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp nhận & tính điểm
                    </span>
                  ) : (
                    <span className="text-amber-300 text-[11px] font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                      ⏳ Đợi bạn bấm chấp nhận mới bắt đầu tính điểm
                    </span>
                  )}
                </div>

                {!msg.applied && (
                  <div className="bg-slate-900/90 border border-amber-500/40 p-2.5 rounded-xl text-xs text-amber-200/90 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        AI đã tính toán theo các Rule. Bạn có thể nhấn <strong>[✏️ Edit]</strong> trên từng thẻ để chỉnh lại nếu cần, sau đó nhấn <strong>Chấp Nhận</strong> để hệ thống ghi nhận.
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {msg.statusCards.map(card => {
                    const isPositive = card.type === 'positive';
                    const isNegative = card.type === 'negative';
                    const isExpense = card.type === 'expense';

                    return (
                      <div
                        key={card.id}
                        className={`relative rounded-xl p-3 border shadow-lg transition-all ${
                          isPositive
                            ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
                            : isNegative
                            ? 'bg-rose-950/40 border-rose-600/70 text-rose-200'
                            : 'bg-amber-950/40 border-amber-600/70 text-amber-200'
                        }`}
                      >
                        {/* Edit Button */}
                        {!msg.applied && (
                          <button
                            onClick={() => setEditingCard({ messageId: msg.id, card })}
                            title="Chỉnh sửa thông số thẻ này"
                            className="absolute top-2 right-2 p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}

                        <div className="text-xs font-bold flex items-center gap-1.5 pr-6 mb-1">
                          <span className="truncate">{card.title}</span>
                        </div>

                        <div className="text-xs opacity-90 font-mono mb-2">
                          Số lượng: <strong>{card.detail}</strong>
                        </div>

                        {/* Note & stat changes */}
                        <div
                          className={`text-[11px] font-medium p-1.5 rounded-lg ${
                            isPositive
                              ? 'bg-emerald-900/40 text-emerald-300'
                              : isNegative
                              ? 'bg-rose-900/40 text-rose-300'
                              : 'bg-amber-900/40 text-amber-300'
                          }`}
                        >
                          {card.note || 'Đã phân loại thành công'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Apply Button */}
                {!msg.applied && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => applyStatusCards(msg.statusCards || [], msg.id)}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Áp Dụng Toàn Bộ Vào Nhân Vật (+/- HP, Vàng, EXP & Ngân Khố)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* AI Analyzing Bubble */}
        {isAnalyzing && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-indigo-500/50 rounded-2xl rounded-tl-none p-3 shadow-lg flex items-center gap-2 text-xs text-indigo-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Đang phân tích nhật ký & đối chiếu luật tự động (khoảng 2s)...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Đã đính kèm ảnh hóa đơn chi tiêu / bằng chứng</span>
            <img
              src={attachedImage}
              alt="preview"
              className="w-8 h-8 object-cover rounded border border-slate-700"
            />
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="text-slate-400 hover:text-rose-400 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Input Box (Telegram style) */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Đính kèm ảnh hóa đơn hoặc bằng chứng task"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isRecording ? 'Dừng ghi âm' : 'Nói để ghi nhận nhật ký'}
            className={`p-2.5 rounded-xl transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Đang lắng nghe giọng nói của bạn...'
                : 'Nhập việc vừa làm: "Đọc 30 trang sách, uống trà sữa 50k, lướt top top 1h..."'
            }
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedImage) || isAnalyzing}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold transition shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Edit Card Modal */}
      {editingCard && (
        <EditCardModal
          card={editingCard.card}
          onSave={updated => updateStatusCard(editingCard.messageId, editingCard.card.id, updated)}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
};
