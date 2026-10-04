import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Hammer,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowRight,
  GitBranch,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Rule } from '../../types';

export const RuleBuilderTab: React.FC = () => {
  const { rules, ruleConflicts, toggleRule, saveRule, deleteRule } = useGame();

  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [editingRule, setEditingRule] = useState<Rule>(() => {
    return (
      rules[0] || {
        id: `r_${Date.now()}`,
        name: 'Rule Mới Tự Định Nghĩa',
        enabled: true,
        triggerVariable: 'Hành động',
        triggerOperator: 'chứa từ khóa',
        triggerKeyword: 'chạy bộ, thể thao',
        conditionVariable: 'Thời gian',
        conditionOperator: 'nhỏ hơn',
        conditionValue: '07:00 AM',
        actionType: 'add',
        actionValue: 50,
        actionTarget: 'Vàng',
        subAction: 'Sinh ra 1 nhiệm vụ phụ: Uống nước khoáng',
      }
    );
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When clicking on a rule in sidebar
  const handleSelectRule = (rule: Rule) => {
    setSelectedRuleId(rule.id);
    setEditingRule({ ...rule });
    setValidationError(null);
    setSuccessMessage(null);
  };

  const handleAddNewRule = () => {
    const newId = `r_${Date.now()}`;
    const newR: Rule = {
      id: newId,
      name: `Quy Tắc Mới #${rules.length + 1}`,
      enabled: true,
      triggerVariable: 'Hành động',
      triggerOperator: 'chứa từ khóa',
      triggerKeyword: 'viết nhật ký, thiền định',
      conditionVariable: 'Thời gian',
      conditionOperator: 'nhỏ hơn',
      conditionValue: '22:00',
      actionType: 'add',
      actionValue: 25,
      actionTarget: 'Vàng',
      subAction: 'Cộng 30 EXP Kỷ luật',
    };
    setSelectedRuleId(newId);
    setEditingRule(newR);
    setValidationError(null);
    setSuccessMessage(null);
  };

  const handleSave = () => {
    setValidationError(null);
    setSuccessMessage(null);

    // Conflict Check
    const activeConflicts = ruleConflicts.filter(
      c => c.rule1Id === editingRule.id || c.rule2Id === editingRule.id
    );

    // Also check on the fly against other rules
    const otherRules = rules.filter(r => r.enabled && r.id !== editingRule.id);
    const wordsNew = editingRule.triggerKeyword.toLowerCase().split(/[\s,]+/);

    let conflictFound: string | null = null;
    for (const other of otherRules) {
      const wordsOther = other.triggerKeyword.toLowerCase().split(/[\s,]+/);
      const hasOverlap = wordsNew.some(w => w.length > 2 && wordsOther.includes(w));
      if (
        hasOverlap &&
        editingRule.actionTarget === other.actionTarget &&
        editingRule.actionType !== other.actionType
      ) {
        conflictFound = `⚠️ Xung đột logic ở "${editingRule.name}" và "${other.name}". Một quy tắc Cộng và một quy tắc Trừ ${editingRule.actionTarget} cho cùng một hành vi! Vui lòng kiểm tra lại!`;
        break;
      }
    }

    if (conflictFound) {
      setValidationError(conflictFound);
      return;
    }

    const saved = saveRule(editingRule);
    if (!saved) {
      setValidationError('Không thể lưu quy tắc do xung đột logic phát sinh!');
    } else {
      setSuccessMessage('Đã lưu quy tắc vào Lò Rèn thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Lò Rèn Quy Tắc (Rule Builder)
            </h2>
            <p className="text-xs text-slate-400">
              Thiết lập logic NẾU ... VÀ ... THÌ ... - Bạn nắm toàn quyền kiểm soát thưởng phạt
            </p>
          </div>
        </div>

        <button
          onClick={handleAddNewRule}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Rèn Quy Tắc Mới</span>
        </button>
      </div>

      {/* Main Area: Left Sidebar (List) + Right Canvas (No-Code Blocks) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR: List of Rules (col-span-4) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Danh Sách Quy Tắc ({rules.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {rules.filter(r => r.enabled).length} Đang kích hoạt
            </span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {rules.map(rule => {
              const isSelected = rule.id === selectedRuleId;
              const hasConflict = ruleConflicts.some(
                c => c.rule1Id === rule.id || c.rule2Id === rule.id
              );

              return (
                <div
                  key={rule.id}
                  onClick={() => handleSelectRule(rule)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {rule.name}
                        </span>
                        {hasConflict && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/50 px-1.5 py-0.2 rounded font-bold animate-pulse">
                            Xung Đột
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        Nếu "{rule.triggerKeyword}" &rarr;{' '}
                        <strong className={rule.actionType === 'add' ? 'text-emerald-400' : 'text-rose-400'}>
                          {rule.actionType === 'add' ? '+' : '-'}{rule.actionValue} {rule.actionTarget}
                        </strong>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        toggleRule(rule.id);
                      }}
                      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        rule.enabled ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-slate-950 w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CANVAS: No-Code Visual Logic Builder (col-span-8) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          {/* Header of Canvas */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-amber-400" />
              <div>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="bg-transparent font-bold text-base text-slate-100 border-b border-slate-700 focus:border-amber-500 focus:outline-none px-1"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nhấp vào tên quy tắc để đổi tên
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => deleteRule(editingRule.id)}
                title="Xóa quy tắc này"
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Block 1: Khối NẾU (Trigger) */}
          <div className="relative bg-slate-950/80 border-2 border-indigo-500/50 rounded-2xl p-4 shadow-md">
            <div className="absolute -top-3 left-4 bg-indigo-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Zap className="w-3 h-3" /> Khối NẾU (Trigger)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  1. Biến số kích hoạt
                </label>
                <select
                  value={editingRule.triggerVariable}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      triggerVariable: e.target.value as Rule['triggerVariable'],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hành động">Hành động (Action)</option>
                  <option value="Chi tiêu">Chi tiêu (Expense)</option>
                  <option value="Thời gian">Thời gian (Time)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  2. Toán tử so sánh
                </label>
                <select
                  value={editingRule.triggerOperator}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      triggerOperator: e.target.value as Rule['triggerOperator'],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="chứa từ khóa">chứa từ khóa</option>
                  <option value="lớn hơn">lớn hơn</option>
                  <option value="nhỏ hơn">nhỏ hơn</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  3. Từ khóa nhận diện
                </label>
                <input
                  type="text"
                  value={editingRule.triggerKeyword}
                  onChange={e =>
                    setEditingRule({ ...editingRule, triggerKeyword: e.target.value })
                  }
                  placeholder="VD: Chạy bộ, Gym, Thể thao"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-2 text-slate-600">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>

          {/* Visual Block 2: Khối VÀ (Condition) */}
          <div className="relative bg-slate-950/80 border-2 border-cyan-500/50 rounded-2xl p-4 shadow-md">
            <div className="absolute -top-3 left-4 bg-cyan-600 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Sliders className="w-3 h-3" /> Khối VÀ (Condition)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Điều kiện phụ
                </label>
                <select
                  value={editingRule.conditionVariable || 'Thời gian'}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      conditionVariable: e.target.value as Rule['conditionVariable'],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Thời gian">Thời gian trong ngày</option>
                  <option value="Chuỗi ngày">Chuỗi ngày liên tiếp (Streak)</option>
                  <option value="Số tiền">Số tiền giao dịch</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Toán tử
                </label>
                <select
                  value={editingRule.conditionOperator || 'nhỏ hơn'}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      conditionOperator: e.target.value as Rule['conditionOperator'],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="nhỏ hơn">nhỏ hơn (&lt;)</option>
                  <option value="lớn hơn">lớn hơn (&gt;)</option>
                  <option value="bằng">bằng (=)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Giá trị điều kiện
                </label>
                <input
                  type="text"
                  value={editingRule.conditionValue || '07:00 AM'}
                  onChange={e =>
                    setEditingRule({ ...editingRule, conditionValue: e.target.value })
                  }
                  placeholder="VD: 07:00 AM hoặc 3 ngày"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-2 text-slate-600">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>

          {/* Visual Block 3: Khối THÌ (Action) */}
          <div className="relative bg-slate-950/80 border-2 border-amber-500/50 rounded-2xl p-4 shadow-md">
            <div className="absolute -top-3 left-4 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3" /> Khối THÌ (Action)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Tác động
                </label>
                <select
                  value={editingRule.actionType}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      actionType: e.target.value as Rule['actionType'],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="add">🟢 Cộng (+) Phần thưởng</option>
                  <option value="subtract">🔴 Trừ (-) Phạt</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={editingRule.actionValue}
                  onChange={e =>
                    setEditingRule({ ...editingRule, actionValue: Number(e.target.value) })
                  }
                  min={1}
                  max={500}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Loại tài nguyên
                </label>
                <select
                  value={editingRule.actionTarget}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      actionTarget: e.target.value as Rule['actionTarget'],
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Vàng">🟡 Vàng</option>
                  <option value="HP">❤️ Máu (HP)</option>
                  <option value="EXP Trí tuệ">🧠 EXP Trí tuệ</option>
                  <option value="EXP Thể lực">⚡ EXP Thể lực</option>
                  <option value="EXP Kỷ luật">🛡️ EXP Kỷ luật</option>
                  <option value="EXP Tài chính">💰 EXP Tài chính</option>
                  <option value="EXP Sáng tạo">✨ EXP Sáng tạo</option>
                </select>
              </div>
            </div>

            {/* Sub-action */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Hành động phụ kèm theo (Sub-action)
              </label>
              <input
                type="text"
                value={editingRule.subAction || ''}
                onChange={e =>
                  setEditingRule({ ...editingRule, subAction: e.target.value })
                }
                placeholder="Ví dụ: Sinh ra 1 nhiệm vụ phụ: Tắm nước lạnh & Uống nước ấm"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Validation & Conflict Warnings Box */}
          {validationError && (
            <div className="bg-rose-950/80 border border-rose-600 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200 animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">LỖI XUNG ĐỘT LOGIC:</strong>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-950/80 border border-emerald-600 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Tất cả các nhật ký ở Tab 2 sẽ tự động tuân thủ logic này.
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Lưu Quy Tắc Vào Lò Rèn</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
