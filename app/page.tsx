'use client';

import { useChat } from 'ai/react'; // <-- İŞTE ÇÖZÜM BURADA
import { useEffect, useRef, useState } from 'react';

export default function Chat() {
  const { messages, append } = useChat({
    onError: (error) => {
        console.error("Chat Hatası:", error);
        alert("Bir hata oluştu. Lütfen sayfayı yenileyip tekrar dene.");
    }
  });
  
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await append({
        role: 'user',
        content: text,
      });
      setText('');
    } catch (err: any) {
      console.error(err);
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
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSend} className="input-form">
          <input
            className="text-input"
            value={text}
            placeholder="Safa'ya bir soru sor..."
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="send-button" disabled={!text.trim()}>
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}