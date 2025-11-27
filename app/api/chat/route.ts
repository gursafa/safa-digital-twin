import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key'i alıyoruz
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Mesajı al
    const { messages } = await req.json();
    
    // Son kullanıcı mesajını yakala
    const lastUserMessage = messages[messages.length - 1].content;

    // Gemini Modelini Hazırla
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: "Sen Safa Gür'ün dijital ikizisin. Samimi, kısa ve net cevaplar ver. Emojiler kullan.",
    });

    // Cevabı Üret (Akış/Stream yok, direkt cevap var)
    const result = await model.generateContent(lastUserMessage);
    const response = await result.response;
    const text = response.text();

    // Cevabı basit JSON olarak frontend'e yolla
    return Response.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error("Backend Hatası:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}