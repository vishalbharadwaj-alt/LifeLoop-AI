
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { HOSTEL_MESS_MENU } from '../constants';
import { MessItem } from '../types';

const MASTER_FOOD_ITEMS: MessItem[] = [
  { id: 'ext1', name: 'Fresh Apple', calories: 95, protein: 1, carbs: 25, fats: 0, junkScore: 0 },
  { id: 'ext2', name: 'Greek Yogurt', calories: 150, protein: 12, carbs: 15, fats: 4, junkScore: 1 },
  { id: 'ext3', name: 'Almonds (Handful)', calories: 160, protein: 6, carbs: 6, fats: 14, junkScore: 0 },
  { id: 'ext4', name: 'Energy Drink', calories: 140, protein: 0, carbs: 36, fats: 0, junkScore: 7 },
  { id: 'ext5', name: 'Instant Noodles', calories: 380, protein: 7, carbs: 55, fats: 14, junkScore: 9 },
  { id: 'ext6', name: 'Protein Bar', calories: 210, protein: 20, carbs: 25, fats: 7, junkScore: 3 },
];

interface NutritionDashboardProps {
  loggedItems: MessItem[];
  onLogFood: (item: MessItem) => void;
  calorieGoal: number;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ loggedItems, onLogFood, calorieGoal }) => {
  const [eatenIds, setEatenIds] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleItem = (item: MessItem) => {
    const next = new Set(eatenIds);
    if (next.has(item.id)) {
      next.delete(item.id);
    } else {
      next.add(item.id);
      onLogFood(item);
    }
    setEatenIds(next);
  };

  const accentRGB = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '79, 70, 229';

  const allVisibleItems = [...HOSTEL_MESS_MENU, ...loggedItems.filter(li => !HOSTEL_MESS_MENU.find(m => m.id === li.id))];
  
  const totals = allVisibleItems
    .filter(item => eatenIds.has(item.id) || loggedItems.find(li => li.id === item.id))
    .reduce((acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      avgJunk: acc.avgJunk + item.junkScore,
      count: acc.count + 1
    }), { calories: 0, protein: 0, avgJunk: 0, count: 0 });

  const finalJunkScore = totals.count > 0 ? Math.round(totals.avgJunk / totals.count) : 0;

  const data = [
    { name: 'Consumed', value: totals.calories },
    { name: 'Remaining', value: Math.max(calorieGoal - totals.calories, 0) }
  ];

  const filteredSearch = MASTER_FOOD_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-black text-white">Hostel Health</h2>
        <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
          Sync Active
        </div>
      </div>

      <section className="bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex items-center gap-8">
        <div className="w-28 h-28 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={10}>
                <Cell fill={`rgb(${accentRGB})`} />
                <Cell fill="#1e293b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Day</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-4xl font-black text-white leading-none mb-1">{totals.calories}</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kcal Eaten / {calorieGoal}</p>
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-sm font-black accent-text">{totals.protein}g</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Protein</p>
            </div>
            <div>
              <p className={`text-sm font-black ${finalJunkScore > 5 ? 'text-rose-500' : 'text-amber-400'}`}>{finalJunkScore}/10</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Junk Score</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Today's Mess Menu</h3>
        <div className="grid grid-cols-1 gap-3">
          {HOSTEL_MESS_MENU.map(item => {
            const isLogged = eatenIds.has(item.id) || loggedItems.find(li => li.id === item.id);
            return (
              <button key={item.id} onClick={() => toggleItem(item)} className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all ${isLogged ? 'accent-bg-soft accent-border-soft' : 'bg-slate-900 border-white/5'}`}>
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${isLogged ? 'accent-bg accent-border-soft shadow-inner' : 'bg-slate-800 border-white/10'}`}>
                    {isLogged ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <span className="text-xs opacity-40">🍽️</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">{item.calories} kcal</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {loggedItems.length > 0 && (
        <section className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Logged via Assistant</h3>
          <div className="grid grid-cols-1 gap-3">
            {loggedItems.filter(li => !HOSTEL_MESS_MENU.find(m => m.id === li.id)).map(item => (
              <div key={item.id} className="w-full flex items-center justify-between p-5 rounded-[2rem] border accent-bg-soft accent-border-soft">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center border accent-bg accent-border-soft">
                    <span className="text-xs">✨</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">
                      {item.calories} kcal • {item.protein}g P
                      {item.carbs !== undefined && ` • ${item.carbs}g C`}
                      {item.fats !== undefined && ` • ${item.fats}g F`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button onClick={() => setShowSearch(true)} className="w-full py-5 bg-slate-800/50 border border-white/5 rounded-[2.2rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] active:scale-[0.98] transition-all">
        Log something else
      </button>

      {showSearch && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-10">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSearch(false)} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-[3rem] p-8 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-20 flex flex-col max-h-[70vh]">
            <input autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search food database..." className="w-full bg-slate-800 border border-white/10 rounded-[1.5rem] px-6 py-4 text-sm text-white mb-6 outline-none accent-ring focus:ring-2" />
            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
              {filteredSearch.map(item => (
                <button key={item.id} onClick={() => { toggleItem(item); setShowSearch(false); }} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:accent-border-soft transition-all text-left group">
                  <div>
                    <p className="text-sm font-bold text-white group-hover:accent-text transition-colors">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.calories} kcal</p>
                  </div>
                  <div className="w-8 h-8 rounded-full accent-bg text-white flex items-center justify-center glow-accent">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboard;
