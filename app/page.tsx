'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  // Mesajları ve Yazı Kutusunu (input) tutan hafıza
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 1. Kullanıcı mesajını ekrana ekle
    const userMessage = { id: Date.now(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Kutuyu temizle
    setInput('');
    setLoading(true);

    try {
      // 2. Backend'e gönder
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('Sunucu hatası');

      const data = await response.json();

      // 3. Gelen cevabı ekrana ekle
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.content }]);
      
    } catch (error) {
      alert("Mesaj gönderilemedi. Lütfen Vercel ayarlarından API KEY'in ekli olduğundan emin ol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="header">
        <div className="avatar-circle">SG</div>
        <div className="header-info">
          <h1>Safa Gür</h1>
          <div className="online-status">● Dijital İkiz (Online)</div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <strong>Merhaba! 👋</strong>
            <br />
            Ben Safa'nın yapay zeka ikiziyim. 
            <br />
            Deneyimlerim, projelerim veya hobilerim hakkında bana soru sorabilirsin! 🚀
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`message-row ${m.role === 'user' ? 'user' : 'ai'}`}>
            <div className={`bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
              <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
        
        {loading && (
           <div className="message-row ai">
             <div className="bubble ai" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
               Yazıyor... ✍️
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSend} className="input-form">
          <input
            className="text-input"
            value={input}
            placeholder="Safa'ya bir soru sor..."
            onChange={(e) => setInput(e.target.value)} 
            disabled={loading}
          />
          <button type="submit" className="send-button" disabled={!input.trim() || loading}>
            {loading ? '...' : 'Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}