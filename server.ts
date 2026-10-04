import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API: Parse user natural language action log
app.post('/api/ai/parse-log', async (req, res) => {
  try {
    const { message, imageBase64, rules } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    if (ai) {
      const activeRulesContext = Array.isArray(rules) && rules.length > 0
        ? `\nQuy tắc người dùng đã thiết lập (ưu tiên áp dụng nếu khớp):\n` +
          rules.filter((r: any) => r.enabled).map((r: any) => 
            `- Khi "${r.triggerKeyword}": ${r.actionType === 'add' ? '+' : '-'}${r.actionValue} ${r.actionTarget} (Kèm theo: ${r.subAction || 'không'})`
          ).join('\n')
        : '';

      const prompt = `Bạn là hệ thống AI Phân Tích Hành Động cho ứng dụng Habit Tracker & Gamification (AetherHabit).
Phân tích nhật ký hoạt động hoặc hóa đơn chi tiêu sau đây và phân loại thành danh sách các Thẻ Trạng Thái (Status Cards):
- "positive": Thói quen tích cực/học tập/rèn luyện (📖 Đọc sách, gym, chạy bộ, dậy sớm, thiền...). Thưởng Vàng và EXP theo 1 trong 5 thuộc tính: Trí tuệ, Thể lực, Tài chính, Kỷ luật, Sáng tạo. Tấn công quái Trì Hoãn.
- "negative": Thói quen tiêu cực/lãng phí thời gian (📱 lướt mạng xã hội quá đà, thức khuya, trì hoãn...). Trừ HP, trừ EXP Kỷ luật.
- "expense": Chi tiêu tài chính hoặc thu nhập (💸 mua trà sữa, mua sách, ăn uống, nhận lương...). Có số tiền (VND), phân loại ngân sách (Ăn uống, Giải trí, Học tập, Thiết yếu, Khác).

${activeRulesContext}

Nhật ký người dùng: "${message || ''}"

Trả về JSON danh sách các hành động theo schema:
[
  {
    "type": "positive" | "negative" | "expense",
    "title": "Tên ngắn gọn có icon (ví dụ: 📖 Đọc sách triết học, 📱 Lướt MXH, 💸 Trà sữa)",
    "detail": "Chi tiết số lượng (ví dụ: 30 trang, 60 phút, 50,000 VND)",
    "statChanges": {
      "gold": number (dương hoặc âm hoặc 0),
      "hp": number (dương hoặc âm hoặc 0),
      "exp": number (dương hoặc âm hoặc 0),
      "skill": "Trí tuệ" | "Thể lực" | "Tài chính" | "Kỷ luật" | "Sáng tạo",
      "amount": number (nếu là expense, số tiền VND, ví dụ: 50000),
      "category": string (nếu là expense, ví dụ: "Giải trí", "Ăn uống", "Học tập", "Thiết yếu", "Khác"),
      "bossDamage": number (sát thương lên boss nếu có)
    },
    "note": "Ghi chú ngắn gọn hoặc tác động"
  }
]`;

      const contents: any[] = [];
      if (imageBase64) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          },
        });
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                statChanges: {
                  type: Type.OBJECT,
                  properties: {
                    gold: { type: Type.NUMBER },
                    hp: { type: Type.NUMBER },
                    exp: { type: Type.NUMBER },
                    skill: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    category: { type: Type.STRING },
                    bossDamage: { type: Type.NUMBER },
                  },
                },
                note: { type: Type.STRING },
              },
              required: ['type', 'title', 'detail', 'statChanges'],
            },
          },
        },
      });

      const parsedCards = JSON.parse(response.text?.trim() || '[]');
      return res.json({ cards: parsedCards });
    }

    // Fallback if GEMINI_API_KEY is not configured
    const fallbackCards = generateDeterministicCards(message);
    return res.json({ cards: fallbackCards });
  } catch (err: any) {
    console.error('Error parsing log with AI:', err);
    // Return smart fallback instead of failing completely
    const fallbackCards = generateDeterministicCards(req.body.message || '');
    return res.json({ cards: fallbackCards, fallback: true });
  }
});

// Helper for deterministic card parsing
function generateDeterministicCards(text: string) {
  const lower = (text || '').toLowerCase();
  const cards: any[] = [];

  // Reading / Study
  if (lower.includes('đọc') || lower.includes('sách') || lower.includes('học') || lower.includes('research')) {
    const pageMatch = lower.match(/(\d+)\s*(trang|bài|chương)/);
    const count = pageMatch ? pageMatch[1] : '30';
    cards.push({
      type: 'positive',
      title: '📖 Đọc sách & Nghiên cứu',
      detail: `${count} trang`,
      statChanges: {
        gold: 15,
        hp: 0,
        exp: 30,
        skill: 'Trí tuệ',
        bossDamage: 50,
      },
      note: '+15 Vàng, +30 EXP Trí tuệ. Boss nhận 50 DMG.',
    });
  }

  // Social media / procrastination
  if (lower.includes('lướt') || lower.includes('top top') || lower.includes('tiktok') || lower.includes('facebook') || lower.includes('game') || lower.includes('trì hoãn')) {
    const timeMatch = lower.match(/(\d+)\s*(tiếng|phút|giờ)/);
    const duration = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : '60 phút';
    cards.push({
      type: 'negative',
      title: '📱 Lướt Mạng Xã Hội',
      detail: duration,
      statChanges: {
        gold: 0,
        hp: -5,
        exp: -10,
        skill: 'Kỷ luật',
        bossDamage: 0,
      },
      note: '-5 HP, -10 EXP Kỷ luật do xao nhãng.',
    });
  }

  // Expense
  if (lower.includes('trà sữa') || lower.includes('tiền') || lower.includes('k') || lower.includes('mua') || lower.includes('chi') || lower.includes('cà phê') || lower.includes('ăn')) {
    const amountMatch = lower.match(/(\d+)\s*(k|nghìn|ngàn|vnd|đ)/);
    let amount = 50000;
    if (amountMatch) {
      const num = parseInt(amountMatch[1], 10);
      amount = amountMatch[2] === 'k' || amountMatch[2] === 'nghìn' || amountMatch[2] === 'ngàn' ? num * 1000 : num;
    }
    cards.push({
      type: 'expense',
      title: lower.includes('trà sữa') ? '💸 Trà sữa thơm ngon' : '💸 Chi tiêu phát sinh',
      detail: `${amount.toLocaleString('vi-VN')} VND`,
      statChanges: {
        gold: 0,
        hp: 0,
        exp: 0,
        amount: amount,
        category: 'Giải trí',
      },
      note: 'Phân loại: Giải trí. Đã trừ vào Ngân khố.',
    });
  }

  // Sports / Exercise
  if (lower.includes('chạy') || lower.includes('gym') || lower.includes('thể dục') || lower.includes('hít đất')) {
    cards.push({
      type: 'positive',
      title: '🏃 Rèn Luyện Thể Lực',
      detail: 'Hoàn thành buổi tập',
      statChanges: {
        gold: 25,
        hp: 10,
        exp: 40,
        skill: 'Thể lực',
        bossDamage: 80,
      },
      note: '+25 Vàng, +10 HP, +40 EXP Thể lực. Đòn chí mạng lên Boss!',
    });
  }

  if (cards.length === 0) {
    cards.push({
      type: 'positive',
      title: '🎯 Hoàn thành mục tiêu nhật ký',
      detail: text || 'Nhiệm vụ cá nhân',
      statChanges: {
        gold: 10,
        hp: 0,
        exp: 20,
        skill: 'Kỷ luật',
        bossDamage: 30,
      },
      note: '+10 Vàng, +20 EXP Kỷ luật.',
    });
  }

  return cards;
}

// API: AI Suggest Points for Quest based on previous history
app.post('/api/ai/suggest-quest-points', async (req, res) => {
  try {
    const { title, category, previousQuests } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const historyContext = Array.isArray(previousQuests) && previousQuests.length > 0
      ? `Lịch sử các nhiệm vụ và điểm số trước đây của người dùng:\n` +
        previousQuests.slice(0, 10).map((q: any) => `- "${q.title}" (${q.category}): +${q.goldReward} Vàng, +${q.expReward} EXP, -${q.bossDamage || 50} HP Boss`).join('\n')
      : 'Người dùng chưa có nhiều lịch sử, hãy tham chiếu tiêu chuẩn (mỗi cấp cần 100 EXP, task nhẹ ~20-30 EXP, vừa ~40-60 EXP, nặng ~70-100 EXP; Vàng từ 15-50 Vàng).';

    if (ai) {
      const prompt = `Bạn là trợ lý đánh giá độ khó và cân bằng điểm thưởng (Gamification Balance) của AetherHabit.
Dựa vào lịch sử người dùng đã từng gán điểm cho các task trước đây:
${historyContext}

Hãy đưa ra đề xuất điểm số cho nhiệm vụ mới sau:
- Tên nhiệm vụ: "${title}"
- Thuộc tính: "${category || 'Trí tuệ'}"

Trả về JSON theo format:
{
  "goldReward": number (từ 10 đến 80),
  "expReward": number (từ 20 đến 100, lưu ý mỗi cấp tương ứng 100*Cấp),
  "bossDamage": number (từ 30 đến 150),
  "reasoning": "Giải thích ngắn gọn 1 câu vì sao đề xuất mức điểm này dựa trên độ khó và lịch sử trước đó."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goldReward: { type: Type.NUMBER },
              expReward: { type: Type.NUMBER },
              bossDamage: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: ['goldReward', 'expReward', 'bossDamage', 'reasoning'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json({
        goldReward: parsed.goldReward || 25,
        expReward: parsed.expReward || 35,
        bossDamage: parsed.bossDamage || 50,
        reasoning: parsed.reasoning || 'Đề xuất cân đối theo độ khó và dữ liệu task trước.',
      });
    }

    // Deterministic fallback based on history average
    let avgGold = 25;
    let avgExp = 35;
    if (Array.isArray(previousQuests) && previousQuests.length > 0) {
      const gSum = previousQuests.reduce((acc: number, q: any) => acc + (q.goldReward || 20), 0);
      const eSum = previousQuests.reduce((acc: number, q: any) => acc + (q.expReward || 30), 0);
      avgGold = Math.round(gSum / previousQuests.length);
      avgExp = Math.round(eSum / previousQuests.length);
    }
    return res.json({
      goldReward: avgGold,
      expReward: avgExp,
      bossDamage: Math.round(avgExp * 1.5),
      reasoning: `Dựa trên trung bình ${previousQuests?.length || 0} lần ghi điểm trước (${avgGold} Vàng, ${avgExp} EXP).`,
    });
  } catch (err) {
    console.error('Error suggesting points:', err);
    return res.json({
      goldReward: 25,
      expReward: 35,
      bossDamage: 50,
      reasoning: 'Mức điểm tiêu chuẩn cho nhiệm vụ hàng ngày.',
    });
  }
});

// API: Document Q&A & Flashcards in Tab 6 (Tàng Kinh Các)
app.post('/api/ai/doc-chat', async (req, res) => {
  try {
    const { docTitle, docContent, prompt } = req.body;

    if (ai) {
      const systemInstruction = `Bạn là trợ lý học tập tối cao trong Tàng Kinh Các của AetherHabit.
Tài liệu hiện tại: "${docTitle || 'Tài liệu kiến thức'}"
Nội dung tài liệu:
"""
${docContent || 'Nội dung sách học tập về thói quen, kỷ luật, tư duy phản biện, tâm lý học và quản lý tài chính cá nhân.'}
"""
Trả lời câu hỏi của người dùng một cách sắc bén, hỗ trợ tóm tắt hoặc sinh flashcard theo yêu cầu.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt || 'Tóm tắt nội dung chính và trích xuất 3 bài học thực hành.',
        config: { systemInstruction },
      });

      return res.json({ answer: response.text });
    }

    // Fallback response
    return res.json({
      answer: `[Tóm tắt từ Tàng Kinh Các]: Dựa trên tài liệu "${docTitle || 'Kỷ Luật Tự Thân'}":
1. Nguyên lý 20/80: Tập trung vào 20% thói quen cốt lõi mang lại 80% kết quả.
2. Vòng lặp thói quen: Gợi ý (Cue) -> Khao khát (Craving) -> Phản hồi (Response) -> Phần thưởng (Reward).
3. Thẻ Flashcard gợi ý:
   - Q: Làm sao để diệt thói quen xấu?
     A: Làm cho gợi ý trở nên vô hình, khó tiếp cận và phần thưởng mất đi sự hấp dẫn.
   - Q: Cách tích lũy EXP Trí Tuệ?
     A: Đọc sâu 30 phút mỗi ngày không xao nhãng.`,
    });
  } catch (err) {
    console.error('Error in doc-chat:', err);
    return res.json({
      answer: 'Không thể kết nối AI lúc này. Bạn vẫn có thể đọc và ôn tập flashcard tài liệu.',
    });
  }
});

// API: Smart Schedule Allocation for Tab 6
app.post('/api/ai/smart-schedule', async (req, res) => {
  try {
    const { docTitle, days } = req.body;

    if (ai) {
      const prompt = `Phân bổ lịch học thông minh cho tài liệu: "${docTitle}".
Tạo ra các khối thời gian (Time blocks) trong tuần tới (Thứ 2 đến Chủ Nhật).
Mỗi khối có:
- day: số từ 0 (Thứ 2) đến 6 (Chủ Nhật)
- startTime: chuỗi giờ (ví dụ: "08:00", "14:00", "20:00")
- durationHours: số giờ (ví dụ: 1 hoặc 1.5)
- title: Tên bài học / hoạt động (ví dụ: "Nghiên cứu Chương 1", "Tóm tắt & Flashcards")
- color: một trong các mã màu ("emerald", "indigo", "amber", "rose", "cyan")`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                startTime: { type: Type.STRING },
                durationHours: { type: Type.NUMBER },
                title: { type: Type.STRING },
                color: { type: Type.STRING },
              },
              required: ['day', 'startTime', 'durationHours', 'title', 'color'],
            },
          },
        },
      });

      const blocks = JSON.parse(response.text?.trim() || '[]');
      return res.json({ blocks });
    }

    // Fallback schedule blocks
    const fallbackBlocks = [
      { id: 'sb-1', day: 0, startTime: '08:00', durationHours: 1.5, title: `Đọc Ch.1-2: ${docTitle}`, color: 'emerald' },
      { id: 'sb-2', day: 1, startTime: '19:30', durationHours: 1.0, title: `Luyện bài tập & Note: ${docTitle}`, color: 'indigo' },
      { id: 'sb-3', day: 3, startTime: '07:30', durationHours: 1.5, title: `Đọc Ch.3-4 & Flashcards`, color: 'cyan' },
      { id: 'sb-4', day: 4, startTime: '20:00', durationHours: 1.0, title: `Thực hành tình huống thực tế`, color: 'amber' },
      { id: 'sb-5', day: 5, startTime: '09:00', durationHours: 2.0, title: `Tổng ôn & Đúc kết tài liệu`, color: 'rose' },
    ];
    return res.json({ blocks: fallbackBlocks });
  } catch (err) {
    console.error('Error generating schedule:', err);
    return res.json({
      blocks: [
        { id: 'sb-1', day: 1, startTime: '08:00', durationHours: 1.5, title: `Học ${req.body.docTitle || 'Tài liệu'}`, color: 'indigo' },
        { id: 'sb-2', day: 3, startTime: '14:00', durationHours: 1.0, title: `Ôn tập ${req.body.docTitle || 'Tài liệu'}`, color: 'emerald' },
      ],
    });
  }
});

// Vite Middleware mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
