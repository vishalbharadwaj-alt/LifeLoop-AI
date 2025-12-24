
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/gemini';
import { Mood, ChatMessage } from '../types';

interface Props {
  currentMood: Mood;
}

const ReflectScreen: React.FC<Props> = ({ currentMood }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        parts: [{ text: "Hello. I can feel you're in a reflective space today. How has your energy been feeling over the last few hours?" }]
      }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, parts: m.parts }));
    // Updated to correctly handle the object returned by sendMessageToGemini
    const result = await sendMessageToGemini(history, input, { mood: currentMood });
    
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.text }] }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1 scroll-smooth" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-[1.8rem] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200 shadow-lg' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-soft'
            }`}>
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 px-5 py-3 rounded-[1.8rem] rounded-bl-none shadow-soft flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Reflect here..."
          className="w-full bg-white border border-slate-100 rounded-[2rem] px-6 py-4 pr-16 shadow-soft focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 transition-all active:scale-90"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ReflectScreen;
