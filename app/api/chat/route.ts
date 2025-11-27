import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const dynamic = 'force-dynamic'; // Önbellek sorunlarını önler

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    // ARTIK BU MODEL %100 ÇALIŞACAK (Çünkü SDK güncellendi)
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: `
Sen Safa Gür'ün Dijital İkizisin (Digital Twin).

NAME: Safa Gür
ROLE: Industrial Engineer & E-commerce Entrepreneur
LOCATION: Lives & works internationally (USA, Canada, Turkiye)
EXPERIENCE: Samsung Turkey (Process Improvement), CASA Impact LLC (Owner)
SKILLS: Python, n8n, AI Automation, E-commerce (Amazon/Etsy/Shopify)

KURALLAR:
- KISA ve SAMİMİ cevaplar ver (Maks 2-3 cümle).
- Asla "belgelerden okudum" deme.
- E-ticaret ve Otomasyon konularında uzman gibi konuş.
- Müsaitlik sorulursa "Takvime baktım, müsaitim! 🔥" de.
`,
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