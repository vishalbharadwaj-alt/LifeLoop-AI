
import React from 'react';
import { AccentColor } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  calorieGoal: number;
  setCalorieGoal: (val: number) => void;
}

const ACCENT_OPTIONS: { label: string; value: AccentColor; colorClass: string }[] = [
  { label: 'Blue', value: 'blue', colorClass: 'bg-blue-600' },
  { label: 'Green', value: 'emerald', colorClass: 'bg-emerald-600' },
  { label: 'Purple', value: 'purple', colorClass: 'bg-purple-600' },
  { label: 'Orange', value: 'orange', colorClass: 'bg-orange-600' },
  { label: 'Rose', value: 'rose', colorClass: 'bg-rose-600' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
  accentColor,
  setAccentColor,
  calorieGoal,
  setCalorieGoal,
}) => {
  if (!isOpen) return null;

  const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    if (val <= 20000) {
      setCalorieGoal(val);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appearance</h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-white text-slate-600 shadow-sm'}`}>
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Night Mode</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'accent-bg' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Goal Calories Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Intake Target</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Daily Calorie Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={calorieGoal}
                  onChange={handleCalorieChange}
                  max={20000}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 accent-ring transition-all"
                  placeholder="e.g. 2200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">kcal</span>
              </div>
              <p className="mt-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest">Safe range: 0 - 20,000 kcal</p>
            </div>
          </section>

          {/* Accent Color Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Theme Accent</h3>
            <div className="grid grid-cols-5 gap-2">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAccentColor(opt.value)}
                  className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                    accentColor === opt.value 
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg shadow-sm ${opt.colorClass} group-hover:scale-110 transition-transform`} />
                  <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 accent-bg text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg glow-accent"
        >
          Confirm Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
