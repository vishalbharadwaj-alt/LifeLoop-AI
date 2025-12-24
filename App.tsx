
import React, { useState, useEffect } from 'react';
import HomeDashboard from './components/HomeDashboard';
import SafetyMap from './components/SafetyMap';
import ChatInterface from './components/ChatInterface';
import NutritionDashboard from './components/NutritionDashboard';
import InsightsScreen from './components/InsightsScreen';
import SettingsModal from './components/SettingsModal';
import LiveVoiceAssistant from './components/LiveVoiceAssistant';
import { AppTab, AccentColor, MessItem, WeatherData } from './types';
import { CURRENT_WEATHER } from './constants';
import { fetchLiveWeather } from './services/gemini';

const ACCENT_MAP: Record<AccentColor, string> = {
  blue: '59, 130, 246',
  emerald: '16, 185, 129',
  purple: '139, 92, 246',
  orange: '245, 158, 11',
  rose: '244, 63, 94'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Global context states
  const [loggedItems, setLoggedItems] = useState<MessItem[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1); // Cycle 1-7
  const [calorieGoal, setCalorieGoal] = useState<number>(2200);
  const [weather, setWeather] = useState<WeatherData>(CURRENT_WEATHER);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Sync accent color to CSS variables
  useEffect(() => {
    const rgb = ACCENT_MAP[accentColor];
    document.documentElement.style.setProperty('--accent', rgb);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${rgb}, 0.4)`);
  }, [accentColor]);

  // Initial Weather Sync
  useEffect(() => {
    const syncWeather = async () => {
      setIsWeatherLoading(true);
      const data = await fetchLiveWeather();
      if (data) setWeather(data);
      setIsWeatherLoading(false);
    };
    syncWeather();
    // Refresh weather every 15 minutes
    const interval = setInterval(syncWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogFood = (item: MessItem) => {
    setLoggedItems(prev => {
      const itemWithTime = { ...item, timestamp: item.timestamp || Date.now() };
      return [itemWithTime, ...prev];
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500`}>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] accent-bg-soft blur-[120px] rounded-full pointer-events-none opacity-40" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none opacity-20" />

      <div className="relative max-w-lg mx-auto min-h-screen flex flex-col pb-24">
        <header className="pt-8 px-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 accent-bg rounded-2xl flex items-center justify-center glow-accent transform rotate-3`}>
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">LifeLoop AI</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">ASU Growth Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black accent-text uppercase">Day {currentDay}/7</span>
               <div className="flex gap-0.5 mt-0.5">
                 {[1,2,3,4,5,6,7].map(d => ( d === currentDay ? (
                   <div key={d} onClick={() => setCurrentDay(d)} className="w-1.5 h-1.5 rounded-full cursor-pointer accent-bg" />
                 ) : (
                   <div key={d} onClick={() => setCurrentDay(d)} className="w-1.5 h-1.5 rounded-full cursor-pointer bg-slate-700" />
                 )))}
               </div>
            </div>
            <button onClick={() => setIsVoiceOpen(true)} className="w-10 h-10 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 accent-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 z-0 overflow-y-auto no-scrollbar">
          {activeTab === 'home' && (
            <HomeDashboard 
              onNavigate={setActiveTab} 
              loggedItems={loggedItems} 
              currentDay={currentDay} 
              calorieGoal={calorieGoal} 
              weather={weather}
              isWeatherLoading={isWeatherLoading}
            />
          )}
          {activeTab === 'safety' && <SafetyMap />}
          {activeTab === 'assistant' && <ChatInterface loggedItems={loggedItems} onLogFood={handleLogFood} currentDay={currentDay} weather={weather} />}
          {activeTab === 'health' && <NutritionDashboard loggedItems={loggedItems} onLogFood={handleLogFood} calorieGoal={calorieGoal} />}
          {activeTab === 'analysis' && <InsightsScreen loggedItems={loggedItems} currentDay={currentDay} calorieGoal={calorieGoal} />}
        </main>

        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900/80 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[2.5rem] px-2 py-2 flex items-center justify-around z-50">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon="🏠" label="Life" />
          <NavButton active={activeTab === 'safety'} onClick={() => setActiveTab('safety')} icon="📍" label="ASU" />
          <NavButton active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} icon="🧘" label="Reflect" />
          <NavButton active={activeTab === 'health'} onClick={() => setActiveTab('health')} icon="🥦" label="Health" />
          <NavButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon="📈" label="Loop" />
        </nav>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        calorieGoal={calorieGoal}
        setCalorieGoal={setCalorieGoal}
      />

      <LiveVoiceAssistant isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} weather={weather} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        ::-webkit-scrollbar { width: 0px; }
      `}} />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) => (
  <button onClick={onClick} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all duration-300 rounded-2xl ${active ? 'bg-white/5 scale-105' : 'opacity-40 grayscale'}`}>
    <span className="text-xl">{icon}</span>
    <span className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'accent-text' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default App;
