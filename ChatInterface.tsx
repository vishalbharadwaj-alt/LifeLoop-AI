
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/gemini';
import { ChatMessage, MessItem, WeatherData } from '../types';

interface ChatInterfaceProps {
  onLogFood: (item: MessItem) => void;
  loggedItems: MessItem[];
  currentDay: number;
  weather: WeatherData;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogFood, loggedItems, currentDay, weather }) => {
  const [messages, setMessages] = useState<(ChatMessage & { feedback?: 'up' | 'down' | 'none' })[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        parts: [{ text: `### INITIALIZING LIFE-SYNC VISION v4.5\n---\nHello student. Forensic nutrition reporting and safety analysis protocols are active. Tell me what you consumed for a complete health & safety report.` }],
        feedback: 'none'
      }]);
    }
  }, [currentDay]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, feedback: type } : msg));
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage & { feedback: 'none' } = { role: 'user', parts: [{ text }], feedback: 'none' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, parts: m.parts }));
    const result = await sendMessageToGemini(history, text, { 
      loggedItems,
      currentDay,
      weather
    });
    
    if (result.functionCalls) {
      for (const fc of result.functionCalls) {
        if (fc.name === 'logFood') {
          const { foodName, calories, protein, carbs, fats, junkScore } = fc.args as any;
          onLogFood({
            id: `ai-${Date.now()}-${Math.random()}`,
            name: foodName,
            calories,
            protein,
            carbs,
            fats,
            junkScore,
            timestamp: Date.now()
          });
        }
      }
    }

    setMessages(prev => [...prev, { 
      role: 'model', 
      parts: [{ text: result.text || "Report generated. View metrics above." }],
      groundingLinks: result.groundingLinks,
      feedback: 'none'
    }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] animate-in fade-in duration-1000">
      <div className="flex-1 overflow-y-auto space-y-12 pb-10 pr-1 no-scrollbar scroll-smooth" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] px-7 py-7 rounded-[2.5rem] text-sm leading-relaxed relative ${
              msg.role === 'user' 
                ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 rounded-br-none shadow-xl' 
                : 'text-slate-200 rounded-bl-none border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-inner'
            }`}>
              {msg.parts.map((part, partIdx) => {
                const content = part.text || "";
                if (!content && partIdx === 0 && msg.role === 'model') return <p key={partIdx} className="italic opacity-50">Querying database...</p>;
                
                return (
                  <div key={partIdx} className="space-y-6">
                    {content.length > 0 && (
                      <div className="whitespace-pre-wrap font-medium">
                        {content.split('\n').map((line, lIdx) => {
                          if (line.startsWith('# ')) return <h1 key={`h1-${lIdx}`} className="text-2xl font-black accent-text uppercase tracking-tighter mb-6 mt-4">{line.substring(2)}</h1>;
                          if (line.startsWith('### ')) return <h3 key={`h3-${lIdx}`} className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent)] opacity-90 mt-10 mb-6 border-b border-white/10 pb-3">{line.substring(4)}</h3>;
                          if (line.startsWith('---')) return <hr key={`hr-${lIdx}`} className="border-white/10 my-8" />;
                          
                          // HUD Metrics
                          if (line.startsWith('**')) {
                            const cleanLine = line.replace(/\*\*/g, '');
                            if (cleanLine.includes(':')) {
                                const [key, val] = cleanLine.split(':');
                                return (
                                    <div key={`hud-${lIdx}`} className="flex justify-between items-center py-2.5 px-4 bg-white/5 rounded-xl mb-2 border-l-4 border-[var(--accent)] transition-all hover:bg-white/10">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{key.trim()}</span>
                                        <span className="text-xs font-black text-white">{val.trim()}</span>
                                    </div>
                                );
                            }
                            return <p key={`bold-${lIdx}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-8">{cleanLine}</p>;
                          }

                          // List items
                          if (line.startsWith('- ')) return (
                            <div key={`li-${lIdx}`} className="flex gap-4 mb-4 ml-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0 shadow-[0_0_8px_var(--accent-glow)]" />
                              <p className="flex-1 text-slate-300 leading-relaxed text-[13px]">{line.substring(2)}</p>
                            </div>
                          );
                          
                          // Regular text
                          return line.trim() ? <p key={`p-${lIdx}`} className="mb-4 text-slate-400 opacity-95 leading-relaxed text-[13px]">{line}</p> : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-2.5 h-2.5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM16.243 17.243a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414z" /></svg>
                    Verified Knowledge Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingLinks.map((link, lIdx) => (
                      <a 
                        key={lIdx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-[var(--accent)]/20 border border-white/10 rounded-full text-[10px] font-bold text-slate-300 transition-all active:scale-95 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] group-hover:animate-ping" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {msg.role === 'model' && (
                <div className="absolute -bottom-10 left-8 right-8 flex justify-between items-center bg-slate-900/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Helpful?</span>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleFeedback(i, 'up')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${msg.feedback === 'up' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-transparent border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        <span className="text-[9px] font-black uppercase">Yes</span>
                      </button>
                      <button 
                        onClick={() => handleFeedback(i, 'down')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${msg.feedback === 'down' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-transparent border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m7-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                        <span className="text-[9px] font-black uppercase">No</span>
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex flex-col items-center gap-4 min-w-[220px] py-6 bg-slate-950/40 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                <div className="relative w-12 h-12">
                   <div className="absolute inset-0 border-[3px] border-slate-800 rounded-full" />
                   <div className="absolute inset-0 border-[3px] border-[var(--accent)] rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Analyzing Metabolism...</p>
             </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mt-6">
        {['I had sushi', 'I ate an apple', 'Pasta for lunch', 'What else can I know?', 'Campus Security'].map(chip => (
          <button 
            key={chip}
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap px-6 py-4 bg-slate-900/80 border border-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-lg"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="relative flex items-center gap-4 glass-card rounded-[3rem] p-3 border border-white/10 shadow-2xl z-30 mb-2 mt-2">
        <div className="w-12 h-12 ml-2 rounded-full flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/10 text-[var(--accent)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </div>

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="I had pasta for lunch..."
          className="flex-1 bg-transparent border-none py-4 px-2 text-[15px] text-white focus:outline-none placeholder:text-slate-600 font-medium"
        />

        <button 
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-14 h-14 flex-shrink-0 accent-bg text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-10 shadow-[0_0_20px_var(--accent-glow)]"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
