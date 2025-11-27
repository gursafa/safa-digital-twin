import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// DİKKAT: 'edge' satırını sildik, varsayılan Node.js modunda çalışacak.
// export const runtime = 'edge'; 

const SYSTEM_INSTRUCTION = `
Sen Safa Gür'ün Dijital İkizisin.
Samimi, kısa ve net cevaplar ver. Emojiler kullan.
Asla teknik bir asistan gibi konuşma.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((m: Message) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = geminiModel.startChat({
      history: history,
    });

    const result = await chat.sendMessageStream(lastMessage.content);
    const stream = GoogleGenerativeAIStream(result);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("API Hatası:", error);
    return new Response(JSON.stringify({ error: "Backend hatası oluştu" }), { status: 500 });
  }
}