import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

// API Key kontrolü
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Edge runtime kullanımı (Daha hızlıdır)
export const runtime = 'edge';

const SYSTEM_INSTRUCTION = `
Sen Safa Gür'ün Dijital İkizisin.
Samimi, kısa ve net cevaplar ver. Emojiler kullan.
Asla teknik bir asistan gibi konuşma.
`;

export async function POST(req: Request) {
  // Gelen mesajları al
  const { messages } = await req.json();

  // Modeli hazırla
  const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  // Sohbet geçmişini formatla (Son mesaj hariç eskiler)
  const lastMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1).map((m: Message) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  // Sohbeti başlat
  const chat = geminiModel.startChat({
    history: history,
  });

  // Akış (Stream) başlat
  const result = await chat.sendMessageStream(lastMessage.content);
  
  // Google formatını Vercel formatına çevir
  const stream = GoogleGenerativeAIStream(result);

  // Yanıtı döndür
  return new StreamingTextResponse(stream);
}