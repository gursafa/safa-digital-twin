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

    // PENCERE DEĞİŞİKLİĞİ 1: Modeli 'gemini-pro' yapıyoruz. (Dünyanın en yaygın modeli)
    // Bu modelin 'bulunamama' ihtimali neredeyse sıfırdır.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    // PENCERE DEĞİŞİKLİĞİ 2: 'systemInstruction' parametresini sildik.
    // Çünkü bazı modeller/bölgeler bu parametreyi görünce "Ben bunu tanımıyorum" diyip 404 veriyor.
    // Onun yerine talimatı, sanki bir önceki konuşmaymış gibi (history) ekliyoruz.
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
      throw new Error(errorData.error?.message || 'Google API Yanıt Vermedi');
    }

    const data = await googleResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap alınamadı.";

    return Response.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error("Backend Genel Hata:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}