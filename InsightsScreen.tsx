
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, Cell } from 'recharts';
import { MessItem } from '../types';

interface InsightsScreenProps {
  loggedItems: MessItem[];
  currentDay: number;
  calorieGoal: number;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ loggedItems, currentDay, calorieGoal }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Derive dynamic chart data from loggedItems
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    
    // Group logs by day of week
    const grouped = days.map(day => ({ day, cal: 0, junk: 0, protein: 0 }));
    
    loggedItems.forEach(item => {
      const date = item.timestamp ? new Date(item.timestamp) : now;
      const dayName = days[date.getDay()];
      const dayData = grouped.find(d => d.day === dayName);
      if (dayData) {
        dayData.cal += item.calories;
        dayData.junk += item.junkScore;
        dayData.protein += item.protein;
      }
    });

    return grouped;
  }, [loggedItems]);

  // Specific 1-day metrics for "Today"
  const todayMetrics = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayLogs = loggedItems.filter(item => 
      item.timestamp && new Date(item.timestamp).toDateString() === todayStr
    );

    const totalCals = todayLogs.reduce((acc, curr) => acc + curr.calories, 0);
    const totalProtein = todayLogs.reduce((acc, curr) => acc + curr.protein, 0);
    const avgJunk = todayLogs.length > 0 
      ? todayLogs.reduce((acc, curr) => acc + curr.junkScore, 0) / todayLogs.length 
      : 0;

    return {
      calories: totalCals,
      protein: totalProtein,
      junk: Math.round(avgJunk),
      target: calorieGoal
    };
  }, [loggedItems, calorieGoal]);

  const handleShare = async () => {
    setIsSharing(true);
    const summary = `LiveLoop Daily Report:
• Today's Intake: ${todayMetrics.calories} / ${todayMetrics.target} kcal
• Protein: ${todayMetrics.protein}g
• Junk Friction: ${todayMetrics.junk}/10
Syncing ASU loop progress.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'LiveLoop ASU Daily Analysis', text: summary, url: window.location.origin });
        setShareFeedback("Analysis shared!");
      } else {
        await navigator.clipboard.writeText(summary);
        setShareFeedback("Copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setShareFeedback("Failed to share.");
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <div className="flex justify-between items-start px-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-white">Daily Analysis</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Day {currentDay} Summary</p>
        </div>
      </div>

      {/* Dynamic Daily Calorie Breakdown */}
      <section className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <div className="w-32 h-32 border-[12px] border-indigo-500 rounded-full" />
        </div>
        
        <div className="flex justify-between items-end mb-8 px-2 relative z-10">
          <div>
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Today's Cycle</h3>
            <p className="text-lg font-bold text-white">1-Day Total Intake</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-white">{todayMetrics.calories}</p>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">kcal / {todayMetrics.target}</p>
          </div>
        </div>

        {/* Progress Bar for Today */}
        <div className="px-2 mb-10">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000" 
              style={{ width: `${todayMetrics.target > 0 ? Math.min((todayMetrics.calories / todayMetrics.target) * 100, 100) : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">0 kcal</span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Goal: {todayMetrics.target}</span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)', radius: 10}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: 'none'}} />
              <Bar dataKey="cal" fill="url(#barGrad)" radius={[10, 10, 10, 10]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Junk Friction Chart */}
      <section className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Health Friction</h3>
            <p className="text-lg font-bold text-white">Today's Junk Impact</p>
          </div>
          <div className="text-right text-rose-400">
            <p className="text-2xl font-black">{todayMetrics.junk}/10</p>
            <p className="text-[8px] font-bold uppercase tracking-widest">Active Score</p>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} />
              <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: 'none'}} />
              <Area type="monotone" dataKey="junk" stroke="#f43f5e" strokeWidth={4} fill="url(#areaGrad)" dot={{fill: '#f43f5e', r: 4}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Status Insights */}
      <section className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">⚡</div>
          <div>
            <h4 className="font-black text-xl leading-tight">Daily Loop Status</h4>
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Current Intake: {todayMetrics.calories} kcal</p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10">
            <p className="text-sm font-medium leading-relaxed">
              {todayMetrics.calories > 0 
                ? `You have reached ${todayMetrics.target > 0 ? Math.round((todayMetrics.calories/todayMetrics.target)*100) : 0}% of your daily intake limit. Ensure your remaining ${Math.max(todayMetrics.target - todayMetrics.calories, 0)} kcal come from balanced ASU mess options.`
                : "No data synced for today. Log your mess breakfast or an external snack to start your daily analysis loop."}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className={`w-full mt-8 py-4 ${shareFeedback ? 'bg-emerald-500' : 'bg-white'} ${shareFeedback ? 'text-white' : 'text-indigo-600'} rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl`}
        >
          {shareFeedback || "Export Daily Log"}
        </button>
      </section>
    </div>
  );
};

export default InsightsScreen;
