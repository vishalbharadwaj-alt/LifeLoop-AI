
import React from 'react';
import { DAILY_TASKS } from '../constants';

const PlannerScreen: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Your Routine</h2>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Energy-Aware</div>
      </div>

      <div className="space-y-4">
        {DAILY_TASKS.map(task => (
          <div key={task.id} className={`group flex items-center gap-4 p-5 bg-white rounded-[2rem] border transition-all ${task.completed ? 'opacity-50 border-transparent bg-slate-50' : 'border-slate-100 shadow-soft'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'}`}>
              {task.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono">{task.time}</p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
              task.energy === 'High' ? 'bg-amber-100 text-amber-700' : 
              task.energy === 'Medium' ? 'bg-indigo-100 text-indigo-700' : 
              'bg-emerald-100 text-emerald-700'
            }`}>
              {task.energy} Energy
            </span>
          </div>
        ))}
      </div>

      <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">✨</span>
          <h3 className="font-bold text-lg">AI Suggestion</h3>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed mb-4">
          Based on your "Reflective" mood, I've moved your High Energy tasks to tomorrow morning. Use tonight for creative journaling.
        </p>
        <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/30 transition-colors">Apply Optimization</button>
      </div>
    </div>
  );
};

export default PlannerScreen;
