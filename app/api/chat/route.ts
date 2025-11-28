// Edge runtime'ı kaldırdık, varsayılan Node.js kullanacak (Daha güvenli)
// export const runtime = 'edge'; 

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GOOGLE_API_KEY;

    // API Key kontrolü (Loglara da yazıyoruz)
    if (!apiKey) {
      console.error("HATA: API Key server tarafında bulunamadı!");
      return Response.json({ error: "Sunucuda API Anahtarı Eksik (Vercel Env Var)" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: lastUserMessage }]
        }
      ],
      systemInstruction: {
        parts: [{ text: "Sen Safa Gür'ün dijital ikizisin. Samimi, kısa ve net cevaplar ver. Emojiler kullan. Asla 'belgelerden okudum' deme." }]
      }
    };

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error("Google API Hatası:", JSON.stringify(errorData));
      // Gerçek Google hatasını frontend'e yolluyoruz
      throw new Error(errorData.error?.message || 'Google API Yanıt Vermedi');
    }

    const data = await googleResponse.json();
    const text = data.candidates[0].content.parts[0].text;

    return Response.json({ role: 'assistant', content: text });

  } catch (error: any) {
    console.error("Backend Genel Hata:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}