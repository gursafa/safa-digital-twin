import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash', // Yeni SDK ile bu kesin çalışır
        systemInstruction: "Sen Safa Gür'ün dijital ikizisin. Samimi, kısa ve net cevaplar ver.",
    });

    const result = await model.generateContent(lastUserMessage);
    const response = await result.response;
    const text = response.text();

    return Response.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error("Backend Hatası:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}