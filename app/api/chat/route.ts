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

    // DÜZELTME: En kararlı, sürüm numaralı ismi kullanıyoruz.
    // 'latest' veya sadece 'flash' bazen beta süreçlerinde değişebiliyor.
    // 'gemini-1.5-flash-001' ise sabitlenmiş, güvenli sürümdür.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: lastUserMessage }]
        }
      ],
      systemInstruction: {
        parts: [{ text: "Sen Safa Gür'ün dijital ikizisin. Samimi, kısa ve net cevaplar ver. Emojiler kullan. Asla 'belgelerden okudum' deme. Türkçe konuş." }]
      }
    };

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error("Google API Hatası Detaylı:", JSON.stringify(errorData));
      throw new Error(errorData.error?.message || 'Google API Hatası');
    }

    const data = await googleResponse.json();
    
    // Cevap yapısını güvenli şekilde alıyoruz
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap oluşturulamadı.";

    return Response.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error("Backend Genel Hata:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}