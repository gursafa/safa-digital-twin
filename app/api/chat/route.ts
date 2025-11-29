// En güvenli Node.js modu
export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "API Key bulunamadı" }, { status: 500 });
    }

    // DÜZELTME: 'v1beta' yerine 'v1' (Kararlı Sürüm) kullanıyoruz.
    // Model olarak 'gemini-1.5-flash' bu kapıda kesinlikle vardır.
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // System Prompt'u yine mesaj gibi gizleyerek yolluyoruz (En garantisi)
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: "Sen Safa Gür'ün dijital ikizisin. Samimi, kısa ve net cevaplar ver. Emojiler kullan. Asla 'belgelerden okudum' deme. Türkçe konuş. Şimdi sana soracağım soruya bu karakterle cevap ver." }]
        },
        {
          role: "model",
          parts: [{ text: "Anlaşıldı! Ben Safa'nın dijital ikiziyim. Sorularını bekliyorum! 🚀" }]
        },
        {
          role: "user",
          parts: [{ text: lastUserMessage }]
        }
      ]
    };

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error("Google API Hatası:", JSON.stringify(errorData));
      
      // Eğer yine 404 alırsak hatayı net görelim
      throw new Error(errorData.error?.message || `API Hatası: ${googleResponse.status}`);
    }

    const data = await googleResponse.json();
    
    // Cevabı güvenli al
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap üretilemedi.";

    return Response.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error("Backend Genel Hata:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}