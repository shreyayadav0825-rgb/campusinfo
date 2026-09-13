import React, { useState } from 'react';
import { Sparkles, Pin, Coffee, Maximize2, Minimize2, Heart } from 'lucide-react';
import { playCutePop } from '../utils/sound';

interface NotepadCanvasProps {
  children: React.ReactNode;
  activeTabTitle: string;
  activeTabIcon?: React.ReactNode;
}

export const NotepadCanvas: React.FC<NotepadCanvasProps> = ({
  children,
  activeTabTitle,
  activeTabIcon,
}) => {
  const [isStraight, setIsStraight] = useState(false);
  const [placedStickers, setPlacedStickers] = useState<string[]>([
    '🍓', '✨', '📝', '☕'
  ]);

  const toggleTilt = () => {
    playCutePop();
    setIsStraight(!isStraight);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-4 transition-all duration-300">
      {/* Central Cream Paper Stationery Card */}
      <div
        className={`relative bg-[#fbf7ee] rounded-xl sm:rounded-2xl transition-transform duration-500 ease-out paper-shadow border border-[#e5d8c8] ${
          isStraight ? 'rotate-0' : '-rotate-1 sm:-rotate-1.5'
        }`}
        style={{
          backgroundImage: `
            radial-gradient(#e5d9ca 0.75px, transparent 0.75px),
            linear-gradient(to bottom, transparent 96%, rgba(210, 185, 160, 0.15) 100%)
          `,
          backgroundSize: '24px 24px, 100% 28px',
        }}
      >
        {/* Torn Kraft Paper Heart - Top Left (Matching the user's uploaded image) */}
        <div
          className="absolute -top-5 -left-4 sm:-top-7 sm:-left-6 w-16 sm:w-20 h-16 sm:h-20 pointer-events-none z-20 transition-transform hover:scale-105"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(50, 20, 15, 0.25))' }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-12"
            fill="none"
          >
            {/* Realistic torn kraft paper textured heart */}
            <path
              d="M 50 85 
                 C 42 75, 20 56, 12 40 
                 C 4 24, 16 10, 32 10 
                 C 42 10, 48 18, 50 24 
                 C 52 18, 58 10, 68 10 
                 C 84 10, 96 24, 88 40 
                 C 80 56, 58 75, 50 85 Z"
              fill="#cbb399"
              stroke="#b19678"
              strokeWidth="1.5"
              strokeDasharray="2,1"
            />
            {/* Paper fiber highlights */}
            <path
              d="M 28 22 C 34 16, 44 20, 48 27"
              stroke="#f1e5d7"
              strokeWidth="1.2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 50 82 C 45 74, 25 57, 18 43"
              stroke="#9d7f62"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Realistic Metal Paperclip - Top Right (Matching the user's uploaded image) */}
        <div
          className="absolute -top-3 right-6 sm:right-10 w-6 sm:w-7 h-16 sm:h-18 pointer-events-none z-20"
          style={{ filter: 'drop-shadow(2px 4px 5px rgba(20, 10, 10, 0.35))' }}
        >
          <svg viewBox="0 0 24 72" className="w-full h-full" fill="none">
            {/* Outer paperclip loop */}
            <path
              d="M 7 14 L 7 56 C 7 62 17 62 17 56 L 17 8 C 17 2 3 2 3 8 L 3 50 C 3 67 21 67 21 50 L 21 16"
              stroke="#4a4d53"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Metallic shine highlight */}
            <path
              d="M 8 16 L 8 54 C 8 58 16 58 16 54 L 16 10"
              stroke="#9ea2a9"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Torn Kraft Paper Heart - Bottom Right (Matching the user's uploaded image) */}
        <div
          className="absolute -bottom-5 -right-4 sm:-bottom-7 sm:-right-6 w-16 sm:w-20 h-16 sm:h-20 pointer-events-none z-20 transition-transform hover:scale-105"
          style={{ filter: 'drop-shadow(0 5px 7px rgba(50, 20, 15, 0.25))' }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform rotate-12"
            fill="none"
          >
            <path
              d="M 50 85 
                 C 42 75, 20 56, 12 40 
                 C 4 24, 16 10, 32 10 
                 C 42 10, 48 18, 50 24 
                 C 52 18, 58 10, 68 10 
                 C 84 10, 96 24, 88 40 
                 C 80 56, 58 75, 50 85 Z"
              fill="#cbb399"
              stroke="#b19678"
              strokeWidth="1.5"
              strokeDasharray="2,1"
            />
            <path
              d="M 30 25 C 38 18, 45 22, 48 28"
              stroke="#f1e5d7"
              strokeWidth="1.2"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Stationery Header Bar */}
        <div className="pt-6 sm:pt-8 px-5 sm:px-8 pb-3 border-b border-[#ebdcd0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl">{activeTabIcon || '📖'}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif-title font-bold text-xl sm:text-2xl text-[#3d271d] tracking-tight">
                  {activeTabTitle}
                </h1>
                <span className="font-handwriting text-lg text-[#b85d53] font-bold">
                  • study journal
                </span>
              </div>
              <p className="font-reading text-xs text-[#826558]">
                Cozy focus desk • Autumn term 2026
              </p>
            </div>
          </div>

          {/* Quick aesthetic controls (straighten view, cute date chip) */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#f2e7db] px-2.5 py-1 rounded-full text-xs font-cute text-[#684b3e] border border-[#e2d2c1]">
              <span>📅</span>
              <span>Sep 13, 2026</span>
            </div>

            <button
              onClick={toggleTilt}
              title={isStraight ? "Aesthetic tilt view" : "Straighten paper"}
              className="p-1.5 rounded-lg bg-[#f0e3d5] hover:bg-[#e7d5c4] text-[#5a3e31] transition-colors text-xs flex items-center space-x-1 border border-[#debfae] cursor-pointer"
            >
              {isStraight ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline text-[11px] font-cute">Tilt</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline text-[11px] font-cute">Straighten</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-7 min-h-[520px]">
          {children}
        </div>

        {/* Cute Paper Footer with Quote & Motivational Sticker */}
        <div className="px-6 py-3.5 bg-[#f6eee3]/80 rounded-b-xl sm:rounded-b-2xl border-t border-[#ebdcd0] flex flex-wrap items-center justify-between text-xs text-[#8c6d5f] gap-2">
          <div className="flex items-center space-x-2 font-handwriting text-base sm:text-lg text-[#a85045]">
            <span>❝</span>
            <span>Small steps every day bring big magic. You're doing wonderful!</span>
            <span>❞</span>
          </div>

          <div className="flex items-center space-x-1.5">
            {placedStickers.map((stk, i) => (
              <span
                key={i}
                className="inline-block transform hover:scale-125 transition-transform cursor-pointer select-none"
                onClick={playCutePop}
              >
                {stk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
