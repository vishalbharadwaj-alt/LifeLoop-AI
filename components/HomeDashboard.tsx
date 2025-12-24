
import React, { useMemo } from 'react';
import { AppTab, MessItem, WeatherData } from '../types';
import { CAMPUS_PINS } from '../constants';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  onNavigate: (tab: AppTab) => void;
  loggedItems: MessItem[];
  currentDay: number;
  calorieGoal: number;
  weather: WeatherData;
  isWeatherLoading: boolean;
}

const HomeDashboard: React.FC<Props> = ({ onNavigate, loggedItems, currentDay, calorieGoal, weather, isWeatherLoading }) => {
  
  const balanceMetrics = useMemo(() => {
    // 1. Health Score (Nutrition Alignment + Goal Progress)
    const today = new Date().toDateString();
    const todayLogs = loggedItems.filter(item => 
      item.timestamp && new Date(item.timestamp).toDateString() === today
    );

    const totalCals = todayLogs.reduce((acc, curr) => acc + curr.calories, 0);
    const avgJunk = todayLogs.length > 0 
      ? todayLogs.reduce((acc, curr) => acc + curr.junkScore, 0) / todayLogs.length 
      : 0;
    
    // Calorie target accuracy using dynamic calorieGoal
    const target = calorieGoal;
    const calAccuracy = target > 0 
      ? Math.max(0, 100 - (Math.abs(target - totalCals) / target * 100))
      : 0;
    const junkPenalty = avgJunk * 10;
    const healthScore = Math.max(0, (calAccuracy + (100 - junkPenalty)) / 2);

    // 2. Safety Score (Campus Risk Awareness)
    const activeRisks = CAMPUS_PINS.filter(p => p.severity === 'Danger' || p.severity === 'Warning').length;
    const safetyScore = Math.max(0, 100 - (activeRisks * 5)); // Higher weighting for safety awareness

    const totalBalance = Math.round((healthScore + safetyScore) / 2);

    return {
      total: totalBalance || 75, 
      health: Math.round(healthScore),
      safety: Math.round(safetyScore),
      logsCount: todayLogs.length,
      calories: totalCals
    };
  }, [loggedItems, calorieGoal]);

  const accentRGB = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '79, 70, 229';

  const balanceData = [
    { name: 'Wellness', value: balanceMetrics.health, color: `rgb(${accentRGB})` },
    { name: 'Safety', value: 'rgba(255, 255, 255, 0.05)' }
  ];

  const getWeatherEmoji = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain')) return '🌧️';
    if (c.includes('cloud')) return '☁️';
    if (c.includes('storm')) return '⛈️';
    if (c.includes('clear')) return '☀️';
    return '⛅';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Greeting & Loop Score */}
      <section className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tight">Hello Student</h2>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black accent-text uppercase tracking-[0.3em]">Your Daily Campus Loop</p>
          <p className="text-slate-500 text-sm font-medium">
            {currentDay === 7 
              ? "Weekly analysis is ready. Review your peak metrics." 
              : balanceMetrics.total > 80 ? "Your life loop is in harmony today." : "A few adjustments needed for peak loop."}
          </p>
        </div>
        
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Animated Glows */}
          <div className="absolute w-56 h-56 accent-bg-soft rounded-full animate-pulse blur-[100px]" />
          <div className="z-10 absolute flex flex-col items-center">
            <span className="text-6xl font-black text-white tracking-tighter">{balanceMetrics.total}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Balance Index</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={balanceData}
                innerRadius={90}
                outerRadius={110}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
                cornerRadius={12}
              >
                {balanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Hub */}
        <div className="flex gap-10 mt-2">
          <div className="text-center group cursor-pointer" onClick={() => onNavigate('health')}>
            <p className="accent-text font-black text-lg transition-transform group-hover:scale-110">{balanceMetrics.health}%</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Health Sync</p>
          </div>
          <div className="w-px h-8 bg-white/5 self-center" />
          <div className="text-center group cursor-pointer" onClick={() => onNavigate('safety')}>
            <p className="text-slate-300 font-black text-lg transition-transform group-hover:scale-110">{balanceMetrics.safety}%</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Safety Shield</p>
          </div>
        </div>
      </section>

      {/* Live Weather Card */}
      <section className="bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
           <span className="text-6xl">{getWeatherEmoji(weather.condition)}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Environment Live Sync</h3>
          {isWeatherLoading && <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin ml-1" />}
        </div>

        <div className="flex items-end justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black text-white">{weather.temp}°</span>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-200 leading-none">{weather.condition}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Mangaldoi Campus</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2 justify-end">
                 <span className="text-[10px] font-bold text-slate-500">HUMIDITY</span>
                 <span className="text-sm font-bold text-white">{weather.humidity}%</span>
               </div>
               <div className="flex items-center gap-2 justify-end">
                 <span className="text-[10px] font-bold text-slate-500">WIND</span>
                 <span className="text-sm font-bold text-white">{weather.windSpeed} km/h</span>
               </div>
             </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
             {weather.condition.toLowerCase().includes('rain') ? '⚠️ RAIN ALERT: PATHS MAY BE SLIPPERY' : '✓ CONDITIONS OPTIMAL FOR OUTDOOR STUDY'}
           </p>
           {weather.lastUpdated && (
             <span className="text-[8px] font-bold text-slate-700 uppercase">
               Last Sync: {new Date(weather.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
           )}
        </div>
      </section>

      {/* Safety Alert Ticker */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between p-5 bg-slate-900/50 border border-white/5 rounded-3xl backdrop-blur-md group hover:bg-slate-900/80 transition-all cursor-pointer" onClick={() => onNavigate('safety')}>
          <div className="flex items-center gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Safety Exposure</p>
              <p className="text-xs font-semibold text-slate-200">{CAMPUS_PINS.filter(p => p.severity === 'Danger').length} high risks active nearby</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-600 group-hover:accent-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('assistant')}
          className="p-8 accent-bg rounded-[3rem] text-left shadow-2xl glow-accent relative overflow-hidden group transition-all active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">🧘</div>
          <h3 className="text-xl font-black text-white mb-1 leading-tight tracking-tight">Reflect<br/>Loop</h3>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Campus Assistant</p>
        </button>
        <button 
          onClick={() => onNavigate('health')}
          className="p-8 bg-emerald-600 rounded-[3rem] text-left shadow-2xl shadow-emerald-900/40 relative overflow-hidden group transition-all active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">🥦</div>
          <h3 className="text-xl font-black text-white mb-1 leading-tight tracking-tight">Fuel<br/>Tracker</h3>
          <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">{balanceMetrics.logsCount} logs synced</p>
        </button>
      </div>

      {/* Emergency Quick Action */}
      <section className="bg-red-500/5 border border-red-500/20 p-6 rounded-[3rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-xl">🚨</div>
           <div>
             <h4 className="text-sm font-black text-red-400 uppercase tracking-widest">ASU Security SOS</h4>
             <p className="text-[10px] text-slate-500 font-bold">Immediate Assistance Hub</p>
           </div>
         </div>
         <div className="flex gap-2">
            <a href="tel:100" className="px-5 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Call</a>
         </div>
      </section>

    </div>
  );
};

export default HomeDashboard;
