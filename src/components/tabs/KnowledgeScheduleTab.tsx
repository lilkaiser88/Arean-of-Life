import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Folder,
  FileText,
  MessageSquare,
  Sparkles,
  Calendar,
  Send,
  Loader2,
  Clock,
  ChevronRight,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { DocumentFile, CalendarTimeBlock } from '../../types';

export const KnowledgeScheduleTab: React.FC = () => {
  const {
    documents,
    calendarBlocks,
    bulkAddCalendarBlocks,
    updateCalendarBlock,
    deleteCalendarBlock,
    addDocument,
    deleteDocument,
  } = useGame();

  const [selectedDoc, setSelectedDoc] = useState<DocumentFile>(documents[0] || {
    id: 'doc_empty',
    title: 'Chưa có tài liệu',
    folder: 'Chung',
    size: '0 KB',
    pages: 0,
    summary: 'Hãy thêm tài liệu đầu tiên của bạn vào Tàng Kinh Các!',
    content: 'Chưa có nội dung.',
  });

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Xin chào! Tôi là trợ lý chuyên sâu cho tài liệu "${documents[0]?.title || 'Tàng Kinh Các'}". Bạn muốn tóm tắt, tạo flashcard câu hỏi hay xếp lịch học?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAllocatingSchedule, setIsAllocatingSchedule] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'flashcards' | 'content'>('chat');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Add Document Modal States
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocFolder, setNewDocFolder] = useState('Phát Triển Bản Thân');
  const [newDocPages, setNewDocPages] = useState(100);
  const [newDocSummary, setNewDocSummary] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [customFlashcardQ, setCustomFlashcardQ] = useState('');
  const [customFlashcardA, setCustomFlashcardA] = useState('');
  const [newFlashcards, setNewFlashcards] = useState<{ question: string; answer: string }[]>([]);

  // Drag and drop state for Calendar time blocks
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const daysOfWeek = [
    { id: 0, label: 'Thứ 2' },
    { id: 1, label: 'Thứ 3' },
    { id: 2, label: 'Thứ 4' },
    { id: 3, label: 'Thứ 5' },
    { id: 4, label: 'Thứ 6' },
    { id: 5, label: 'Thứ 7' },
    { id: 6, label: 'Chủ Nhật' },
  ];

  const timeSlots = ['07:00', '09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];

  const handleSelectDoc = (doc: DocumentFile) => {
    setSelectedDoc(doc);
    setChatMessages([
      {
        sender: 'ai',
        text: `Đã mở tài liệu "${doc.title}". Bạn muốn nghiên cứu nội dung nào hoặc phân bổ lịch học tuần tới?`,
      },
    ]);
  };

  const handleAddFlashcardToNewDoc = () => {
    if (!customFlashcardQ.trim() || !customFlashcardA.trim()) return;
    setNewFlashcards(prev => [
      ...prev,
      { question: customFlashcardQ.trim(), answer: customFlashcardA.trim() },
    ]);
    setCustomFlashcardQ('');
    setCustomFlashcardA('');
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const createdDoc: Omit<DocumentFile, 'id'> = {
      title: newDocTitle.trim().endsWith('.pdf') ? newDocTitle.trim() : `${newDocTitle.trim()}.pdf`,
      folder: newDocFolder || 'Tài Liệu Cá Nhân',
      size: `${(newDocContent.length / 1024).toFixed(1)} KB`,
      pages: Number(newDocPages) || 50,
      summary: newDocSummary.trim() || 'Tài liệu do người dùng lưu trữ để học tập và rèn luyện.',
      content: newDocContent.trim(),
      flashcards: newFlashcards.length > 0 ? newFlashcards : [
        {
          question: `Trọng tâm chính của tài liệu ${newDocTitle} là gì?`,
          answer: newDocSummary.trim() || 'Nắm vững các nguyên lý then chốt và áp dụng vào hành động.',
        },
      ],
      isCustom: true,
    };

    addDocument(createdDoc);
    setNewDocTitle('');
    setNewDocSummary('');
    setNewDocContent('');
    setNewFlashcards([]);
    setShowAddDocModal(false);

    setSyncToast(`Đã thêm thành công tài liệu: "${createdDoc.title}" vào Tàng Kinh Các!`);
    setTimeout(() => setSyncToast(null), 4000);
  };

  const handleSendChat = async (presetPrompt?: string) => {
    const promptToSend = presetPrompt || chatInput.trim();
    if (!promptToSend || isChatLoading) return;

    if (!presetPrompt) setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: promptToSend }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/doc-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: selectedDoc.title,
          docContent: selectedDoc.content,
          prompt: promptToSend,
        }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.answer }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `[Tóm tắt tài liệu]: Dựa vào nội dung "${selectedDoc.title}", hãy chú ý vào các nguyên lý cốt lõi, thói quen vi mô và loại bỏ xao nhãng để đạt hiệu suất tối đa.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Trigger Smart Schedule Allocation (time blocks fall onto the calendar)
  const handleAutoAllocate = async () => {
    setIsAllocatingSchedule(true);
    setSyncToast(`AI đang phân bổ lịch học cho: ${selectedDoc.title}...`);

    try {
      const res = await fetch('/api/ai/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: selectedDoc.title,
          days: 7,
        }),
      });

      const data = await res.json();
      const rawBlocks = data.blocks || [];

      setTimeout(() => {
        const mappedBlocks = rawBlocks.map((b: any) => ({
          day: typeof b.day === 'number' ? b.day : Math.floor(Math.random() * 6),
          startTime: b.startTime || '08:00',
          durationHours: b.durationHours || 1.5,
          title: b.title || `Học: ${selectedDoc.title}`,
          category: 'Trí tuệ',
          color: (b.color as any) || 'indigo',
          docId: selectedDoc.id,
        }));

        bulkAddCalendarBlocks(mappedBlocks);
        setIsAllocatingSchedule(false);
        setSyncToast('✨ Đã tự động phân bổ khối thời gian vào Lịch & Đồng bộ Database!');
        setTimeout(() => setSyncToast(null), 4000);
      }, 1000);
    } catch {
      setIsAllocatingSchedule(false);
      setSyncToast('Lỗi khi phân bổ lịch. Vui lòng thử lại!');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (id: string) => {
    setDraggedBlockId(id);
  };

  const handleDropOnSlot = (day: number, time: string) => {
    if (!draggedBlockId) return;

    updateCalendarBlock(draggedBlockId, {
      day,
      startTime: time,
    });

    setDraggedBlockId(null);
    setSyncToast(`Đã dời lịch sang ${daysOfWeek[day].label} lúc ${time} (Đã đồng bộ DB thời gian thực)`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50';
      case 'indigo':
        return 'bg-indigo-950/90 border-indigo-500/80 text-indigo-200 shadow-indigo-950/50';
      case 'cyan':
        return 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200 shadow-cyan-950/50';
      case 'rose':
        return 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-950/50';
      case 'amber':
        return 'bg-amber-950/90 border-amber-500/80 text-amber-200 shadow-amber-950/50';
      default:
        return 'bg-purple-950/90 border-purple-500/80 text-purple-200 shadow-purple-950/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification for Real-Time Sync */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500 text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Split View: Left (Knowledge Base Drive & File Chat) | Right (Smart Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Kho Tài Liệu (Knowledge Base & Chat) - col-span-5 */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
          {/* Header with Add Document Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Tàng Kinh Các (Knowledge Base)
              </h2>
              <p className="text-[11px] text-slate-400">
                Lưu trữ tài liệu cá nhân & Trợ lý học tập tương tác
              </p>
            </div>

            <button
              onClick={() => setShowAddDocModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Tài Liệu</span>
            </button>
          </div>

          {/* Drive Folders / Files Carousel */}
          <div className="py-2.5 border-b border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-amber-400" /> Kho Tài Liệu Của Bạn ({documents.length}):
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {documents.filter(d => d.isCustom).length} Tự thêm
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {documents.map(doc => {
                const isSelected = doc.id === selectedDoc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left whitespace-nowrap text-xs transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/80 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div className="max-w-[130px] truncate">
                      <div className="font-bold truncate flex items-center gap-1">
                        <span>{doc.title}</span>
                        {doc.isCustom && (
                          <span className="text-[9px] px-1 rounded bg-indigo-900 text-cyan-300">
                            Của tôi
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{doc.pages} trang • {doc.size}</div>
                    </div>

                    {/* Delete button for custom document */}
                    {doc.isCustom && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Xóa tài liệu "${doc.title}"?`)) {
                            deleteDocument(doc.id);
                            if (selectedDoc.id === doc.id) {
                              setSelectedDoc(documents[0]);
                            }
                          }
                        }}
                        title="Xóa tài liệu này"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-tabs for the selected Document: Chat / Flashcards / Content */}
          <div className="flex items-center justify-between pt-2 pb-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveSubTab('chat')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeSubTab === 'chat'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chat Với File
              </button>
              <button
                onClick={() => setActiveSubTab('flashcards')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeSubTab === 'flashcards'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Flashcards ({selectedDoc.flashcards?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab('content')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeSubTab === 'content'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nội Dung
              </button>
            </div>

            {/* Quick Button to allocate schedule */}
            <button
              onClick={handleAutoAllocate}
              disabled={isAllocatingSchedule}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Xếp Lịch Ngay</span>
            </button>
          </div>

          {/* SubTab Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeSubTab === 'chat' && (
              <div className="flex flex-col h-full justify-between">
                {/* Chat Log */}
                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`text-xs p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-xs text-indigo-300 p-2 bg-slate-950/60 rounded-xl">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Trợ lý đang đọc và trích xuất từ tài liệu...</span>
                    </div>
                  )}
                </div>

                {/* Prompt Suggestions */}
                <div className="pt-2">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    <button
                      onClick={() => handleSendChat('Tóm tắt ý tưởng cốt lõi và bài học thực hành cho tôi')}
                      className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
                    >
                      📖 Tóm tắt cốt lõi
                    </button>
                    <button
                      onClick={() => handleSendChat('Trích xuất các định nghĩa quan trọng thành flashcard')}
                      className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
                    >
                      ⚡ Trích xuất Flashcards
                    </button>
                    <button
                      onClick={() => handleSendChat('Xếp lịch cho tôi học hết tài liệu này trong tuần tới')}
                      className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap"
                    >
                      📅 Lập kế hoạch 7 ngày
                    </button>
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                      placeholder="Hỏi về tài liệu này..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleSendChat()}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'flashcards' && (
              <div className="space-y-2.5">
                {selectedDoc.flashcards?.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Chưa có Flashcard nào cho tài liệu này. Hãy hỏi Trợ lý AI để tự sinh flashcard!
                  </div>
                ) : (
                  selectedDoc.flashcards?.map((fc, i) => (
                    <div
                      key={i}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5 shadow-md"
                    >
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        Q{i + 1}: {fc.question}
                      </div>
                      <div className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                        {fc.answer}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSubTab === 'content' && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {selectedDoc.content}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Bản Đồ Chiến Dịch (Smart Calendar) - col-span-7 */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
          {/* Calendar Header with Auto-Allocate CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Bản Đồ Chiến Dịch (Smart Schedule Grid)
              </h2>
              <p className="text-[11px] text-slate-400">
                Kéo thả các khối để dời lịch - Dữ liệu tự động đồng bộ thời gian thực
              </p>
            </div>

            <button
              onClick={handleAutoAllocate}
              disabled={isAllocatingSchedule}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition"
            >
              {isAllocatingSchedule ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>✨ [Tự Động Phân Bổ]</span>
            </button>
          </div>

          {/* Calendar Weekly Grid */}
          <div className="flex-1 overflow-x-auto mt-3">
            <div className="min-w-[550px] h-full flex flex-col">
              {/* Day Header Row */}
              <div className="grid grid-cols-7 gap-1.5 pb-2 border-b border-slate-800">
                {daysOfWeek.map(d => (
                  <div key={d.id} className="text-center">
                    <span className="text-xs font-bold text-slate-300 block">{d.label}</span>
                    <span className="text-[10px] text-slate-500">
                      {calendarBlocks.filter(b => b.day === d.id).length} Khối
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Slots Rows */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pt-2">
                {timeSlots.map(time => (
                  <div key={time} className="grid grid-cols-7 gap-1.5 min-h-[64px]">
                    {daysOfWeek.map(day => {
                      const blocksInSlot = calendarBlocks.filter(
                        b => b.day === day.id && b.startTime.startsWith(time.split(':')[0])
                      );

                      return (
                        <div
                          key={day.id}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDropOnSlot(day.id, time)}
                          className={`rounded-xl border p-1 flex flex-col justify-start gap-1 transition-colors ${
                            blocksInSlot.length > 0
                              ? 'bg-slate-950/60 border-slate-800'
                              : 'bg-slate-950/30 border-slate-855 hover:border-slate-700/80 hover:bg-slate-850/40'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-slate-400 pl-0.5">
                            {time}
                          </span>

                          {/* Time Blocks */}
                          {blocksInSlot.map(block => (
                            <div
                              key={block.id}
                              draggable
                              onDragStart={() => handleDragStart(block.id)}
                              className={`p-1.5 rounded-lg border text-[11px] font-semibold cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02] shadow-md animate-fade-in ${getColorClasses(
                                block.color
                              )}`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono mb-0.5 opacity-80">
                                <span>{block.startTime}</span>
                                <span>{block.durationHours}h</span>
                              </div>
                              <div className="line-clamp-2 leading-tight">{block.title}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Thêm Tài Liệu Mới Vào Tàng Kinh Các */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-lg shadow-2xl my-6">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              Thêm Tài Liệu Mới Vào Tàng Kinh Các
            </h3>

            <form onSubmit={handleCreateDocument} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  1. Tên Tài Liệu / Tên Sách
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  placeholder="Ví dụ: Kỷ Luật Tự Thân, Tâm Lý Học Thành Công..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    2. Thư mục lưu trữ
                  </label>
                  <input
                    type="text"
                    value={newDocFolder}
                    onChange={e => setNewDocFolder(e.target.value)}
                    placeholder="VD: Phát Triển Bản Thân, Tài Chính..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    3. Số trang ước tính
                  </label>
                  <input
                    type="number"
                    value={newDocPages}
                    onChange={e => setNewDocPages(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  4. Tóm tắt ngắn gọn
                </label>
                <input
                  type="text"
                  value={newDocSummary}
                  onChange={e => setNewDocSummary(e.target.value)}
                  placeholder="Mô tả ngắn về giá trị của tài liệu..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  5. Nội dung tài liệu (Paste ghi chú, trích đoạn, tóm tắt sách)
                </label>
                <textarea
                  value={newDocContent}
                  onChange={e => setNewDocContent(e.target.value)}
                  placeholder="Dán nội dung sách, bài viết hoặc tài liệu học tập của bạn vào đây..."
                  rows={5}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Flashcards section */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  6. Thêm Flashcard câu hỏi ôn tập (Tùy chọn)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customFlashcardQ}
                    onChange={e => setCustomFlashcardQ(e.target.value)}
                    placeholder="Câu hỏi (Q)..."
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    value={customFlashcardA}
                    onChange={e => setCustomFlashcardA(e.target.value)}
                    placeholder="Đáp án (A)..."
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddFlashcardToNewDoc}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300"
                  >
                    + Thêm Thẻ ({newFlashcards.length} đã tạo)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Lưu Vào Tàng Kinh Các
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
