import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, Play, Pause, RotateCcw, Heart, Coffee } from 'lucide-react';
import { playCutePop, playCuteChime } from '../utils/sound';

export type GinghamTheme = 'classic-red' | 'strawberry' | 'sage' | 'lavender';

interface AestheticHeaderProps {
  currentTheme: GinghamTheme;
  setTheme: (theme: GinghamTheme) => void;
}

export const AestheticHeader: React.FC<AestheticHeaderProps> = ({
  currentTheme,
  setTheme,
}) => {
  // Pomodoro Timer state
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playCuteChime();
      if (timerMode === 'study') {
        alert('🎉 Amazing focus session! Time for a cozy 5-minute break and a cup of tea! ☕');
        setTimerMode('break');
        setPomodoroSeconds(5 * 60);
      } else {
        alert('✨ Break finished! Ready to dive back in? 🍓');
        setTimerMode('study');
        setPomodoroSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds, timerMode]);

  const toggleTimer = () => {
    playCutePop();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    playCutePop();
    setIsTimerRunning(false);
    setPomodoroSeconds(timerMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full max-w-4xl mx-auto pt-4 pb-2 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & Aesthetic Title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-2xl bg-white/90 shadow-sm border border-[#e8d5c4] flex items-center justify-center text-lg ring-2 ring-white/80">
          🍓
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif-title font-bold text-lg sm:text-xl text-[#3d251a] tracking-tight">
              Campus Info
            </h1>
            <span className="font-handwriting text-sm sm:text-base text-[#b83838] font-bold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs border border-[#ecdcd1]">
              ♥ coquette stationery
            </span>
          </div>
          <p className="text-[11px] text-[#7d5e51] font-reading">
            Campus schedule & AI study companion
          </p>
        </div>
      </div>

      {/* Top right: Pomodoro Quick Timer & Tablecloth Theme Picker */}
      <div className="flex items-center space-x-2.5">
        {/* Pomodoro Timer Badge */}
        <div className="relative">
          <button
            onClick={() => {
              playCutePop();
              setShowTimerDropdown(!showTimerDropdown);
            }}
            className="flex items-center space-x-2 bg-white/90 hover:bg-white border border-[#ebdcd0] px-3 py-1.5 rounded-2xl shadow-xs transition-all cursor-pointer text-xs font-cute text-[#4b3327]"
          >
            <Timer className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-[#e0534b] animate-spin' : 'text-[#7d5e51]'}`} />
            <span className="font-bold">{formatTime(pomodoroSeconds)}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#fef2f2] text-[#991b1b] font-semibold">
              {timerMode === 'study' ? 'Focus' : 'Break'}
            </span>
          </button>

          {showTimerDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#fbf7ee] rounded-2xl p-3.5 border border-[#e5d8c8] paper-shadow z-40 text-xs font-cute text-[#4b3327]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ebdcd0]">
                <span className="font-bold">Pomodoro Clock</span>
                <button
                  onClick={() => setShowTimerDropdown(false)}
                  className="text-xs text-[#9d7e70] hover:text-[#4b3327]"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-2">
                <div className="text-2xl font-bold font-serif-title text-[#3b271d]">
                  {formatTime(pomodoroSeconds)}
                </div>
                <div className="text-[11px] text-[#8c6d5f] mt-0.5">
                  {timerMode === 'study' ? '📖 25m Focus Block' : '☕ 5m Tea Break'}
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={toggleTimer}
                  className="px-3 py-1.5 rounded-xl bg-[#b94747] text-white font-bold flex items-center space-x-1 hover:bg-[#a13b3b] cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="p-1.5 rounded-xl bg-white border border-[#dfcebf] hover:bg-[#faeee4] cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#694b3e]" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tablecloth Pattern Theme Selector */}
        <div className="flex items-center space-x-1 bg-white/90 p-1 rounded-2xl border border-[#ebdcd0] shadow-xs">
          {[
            { id: 'classic-red' as GinghamTheme, color: 'bg-[#c43836]', label: 'Classic Red' },
            { id: 'strawberry' as GinghamTheme, color: 'bg-[#f472b6]', label: 'Strawberry' },
            { id: 'sage' as GinghamTheme, color: 'bg-[#10b981]', label: 'Sage' },
            { id: 'lavender' as GinghamTheme, color: 'bg-[#8b5cf6]', label: 'Lavender' },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => {
                playCutePop();
                setTheme(th.id);
              }}
              title={`Tablecloth theme: ${th.label}`}
              className={`w-5 h-5 rounded-full ${th.color} transition-transform cursor-pointer border-2 ${
                currentTheme === th.id
                  ? 'scale-115 border-white ring-2 ring-[#422e23]/30'
                  : 'border-white/80 opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
};
