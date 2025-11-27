import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key kontrolü
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// --- SENİN SYSTEM PROMPT'UN ---
const SYSTEM_INSTRUCTION = `
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
`;

export async function POST(req: Request) {
  try {
    // Frontend'den gelen mesajları al
    const { messages } = await req.json();
    
    // Son kullanıcı mesajını yakala
    // (Basit modda tüm geçmişi değil, son soruyu gönderiyoruz, daha hızlıdır)
    const lastUserMessage = messages[messages.length - 1].content;

    // Gemini Modelini Hazırla
    // NOT: package.json'da sürümü yükselttiğimiz için artık 'gemini-1.5-flash' çalışır.
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Cevabı Üret
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