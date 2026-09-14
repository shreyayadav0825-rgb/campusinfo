import React from 'react';
import { ActiveTab } from '../types';
import { playCutePop } from '../utils/sound';
import { Sparkles, Calendar, BookMarked, FolderGit2, Bot, Heart, Coffee, BookOpen } from 'lucide-react';
import melodyCalIcon from '../assets/images/melody_cal_icon_1789294067193.jpg';
import todoIcon from '../assets/images/todo_icon_1789300346730.jpg';
import gmailIcon from '../assets/images/strawberry_gmail_icon_1789301479320.jpg';
import notionIcon from '../assets/images/notion_icon_1789302061804.jpg';
import whatsappIcon from '../assets/images/whatsapp_icon_1789302930853.jpg';
import booksResourcesIcon from '../assets/images/books_resources_icon_1789391402505.jpg';
import aiRobotIcon from '../assets/images/ai_robot_avatar_icon_1789391582140.jpg';
import studyMaterialIcon from '../assets/images/study_material_book_1789391807999.jpg';

interface AestheticNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  eventCount?: number;
  cardCount?: number;
  todoCount?: number;
  hasClashWhatsApp?: boolean;
  hasClashGmail?: boolean;
}

export const AestheticNav: React.FC<AestheticNavProps> = ({
  activeTab,
  setActiveTab,
  eventCount = 0,
  cardCount = 0,
  todoCount = 0,
  hasClashWhatsApp = false,
  hasClashGmail = false,
}) => {
  const tabs = [
    {
      id: 'chat' as ActiveTab,
      label: 'AI Chatbot',
      subtitle: 'Study Buddy',
      badge: 'Berry AI',
      color: 'from-[#ff758c] to-[#ff7eb3]',
      activeBg: 'bg-[#fff0f2] border-[#f87171] text-[#991b1b]',
      hoverBg: 'hover:bg-[#fff5f5]',
      accentColor: '#ef4444',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-[#ffe4e6] bg-[#fff0f3] flex items-center justify-center p-0.5">
            <img
              src={aiRobotIcon}
              alt="AI Chatbot Robot Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ec4899] text-[9px] font-bold text-white shadow-xs">
            ✨
          </span>
        </div>
      ),
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      subtitle: 'Planner & Due',
      badge: eventCount > 0 ? `${eventCount} items` : 'Schedule',
      color: 'from-[#f59e0b] to-[#fbbf24]',
      activeBg: 'bg-[#fffbeb] border-[#f59e0b] text-[#92400e]',
      hoverBg: 'hover:bg-[#fefce8]',
      accentColor: '#f59e0b',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-[#fecdd3] bg-[#fff0f3] flex items-center justify-center p-0.5">
            <img
              src={melodyCalIcon}
              alt="My Melody Calendar Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f43f5e] text-[9px] font-bold text-white shadow-xs">
            ♥
          </span>
        </div>
      ),
    },
    {
      id: 'todo' as ActiveTab,
      label: 'To-Do List',
      subtitle: 'Daily Tasks',
      badge: todoCount > 0 ? `${todoCount} tasks` : 'Checklist',
      color: 'from-[#f97316] to-[#fb923c]',
      activeBg: 'bg-[#fff7ed] border-[#f97316] text-[#9a3412]',
      hoverBg: 'hover:bg-[#fffaf5]',
      accentColor: '#f97316',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-[#fed7aa] bg-[#fff7ed] flex items-center justify-center p-0.5">
            <img
              src={todoIcon}
              alt="To-Do List Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-bold text-white shadow-xs">
            ✓
          </span>
        </div>
      ),
    },
    {
      id: 'gmail' as ActiveTab,
      label: 'Gmail',
      subtitle: hasClashGmail ? '🚨 Clash Alert' : 'Campus Inbox',
      badge: hasClashGmail ? '🚨 RED ALERT' : 'Mail',
      color: hasClashGmail ? 'from-[#dc2626] to-[#ef4444]' : 'from-[#f43f5e] to-[#fb7185]',
      activeBg: hasClashGmail ? 'bg-[#fef2f2] border-[#dc2626] text-[#991b1b]' : 'bg-[#fff1f2] border-[#f43f5e] text-[#9f1239]',
      hoverBg: 'hover:bg-[#fff5f6]',
      accentColor: hasClashGmail ? '#dc2626' : '#f43f5e',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className={`w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ${hasClashGmail ? 'ring-red-400 animate-pulse' : 'ring-[#fecdd3]'} bg-[#fff0f3] flex items-center justify-center p-0.5`}>
            <img
              src={gmailIcon}
              alt="Gmail Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full ${hasClashGmail ? 'bg-red-600 animate-ping' : 'bg-[#f43f5e]'} text-[9px] font-bold text-white shadow-xs`}>
            {hasClashGmail ? '!' : '✉'}
          </span>
        </div>
      ),
    },
    {
      id: 'whatsapp' as ActiveTab,
      label: 'WhatsApp',
      subtitle: hasClashWhatsApp ? '🚨 Clash Alert' : 'Squad & Circles',
      badge: hasClashWhatsApp ? '🚨 RED ALERT' : 'AI Brief',
      color: hasClashWhatsApp ? 'from-[#dc2626] to-[#ef4444]' : 'from-[#16a34a] to-[#22c55e]',
      activeBg: hasClashWhatsApp ? 'bg-[#fef2f2] border-[#dc2626] text-[#991b1b]' : 'bg-[#f0fdf4] border-[#16a34a] text-[#14532d]',
      hoverBg: 'hover:bg-[#f7fee7]',
      accentColor: hasClashWhatsApp ? '#dc2626' : '#16a34a',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className={`w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ${hasClashWhatsApp ? 'ring-red-400 animate-pulse' : 'ring-[#86efac]'} bg-[#f0fdf4] flex items-center justify-center p-0.5`}>
            <img
              src={whatsappIcon}
              alt="WhatsApp Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full ${hasClashWhatsApp ? 'bg-red-600 animate-ping' : 'bg-[#16a34a]'} text-[9px] font-bold text-white shadow-xs`}>
            {hasClashWhatsApp ? '!' : '💬'}
          </span>
        </div>
      ),
    },
    {
      id: 'notion' as ActiveTab,
      label: 'Notion',
      subtitle: 'Workspace Hub',
      badge: 'Notes',
      color: 'from-[#292524] to-[#57534e]',
      activeBg: 'bg-[#f5f5f4] border-[#292524] text-[#1c1917]',
      hoverBg: 'hover:bg-[#fafaf9]',
      accentColor: '#292524',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-[#d6d3d1] bg-[#fafaf9] flex items-center justify-center p-0.5">
            <img
              src={notionIcon}
              alt="Notion Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#292524] text-[9px] font-bold text-white shadow-xs">
            N
          </span>
        </div>
      ),
    },
    {
      id: 'resources' as ActiveTab,
      label: 'Resources',
      subtitle: 'Links & Tools',
      badge: 'Library',
      color: 'from-[#0ea5e9] to-[#38bdf8]',
      activeBg: 'bg-[#f0f9ff] border-[#0ea5e9] text-[#0369a1]',
      hoverBg: 'hover:bg-[#f0fdf4]',
      accentColor: '#0ea5e9',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-[#bae6fd] bg-[#e0f2fe] flex items-center justify-center p-0.5">
            <img
              src={booksResourcesIcon}
              alt="Resources Books Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ec4899] text-[9px] font-bold text-white shadow-xs">
            ♥
          </span>
        </div>
      ),
    },
    {
      id: 'study' as ActiveTab,
      label: 'Study Material',
      subtitle: 'Cards & Notes',
      badge: cardCount > 0 ? `${cardCount} cards` : 'Notes',
      color: 'from-[#8b5cf6] to-[#a78bfa]',
      activeBg: 'bg-[#faf5ff] border-[#8b5cf6] text-[#5b21b6]',
      hoverBg: 'hover:bg-[#fdf4ff]',
      accentColor: '#8b5cf6',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-[#ddd6fe] bg-[#f5f3ff] flex items-center justify-center p-0.5">
            <img
              src={studyMaterialIcon}
              alt="Study Material Floral Book Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8b5cf6] text-[9px] font-bold text-white shadow-xs">
            🌸
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2">
      {/* Navigation tabs styled as cute aesthetic stationery bookmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => {
                playCutePop();
                setActiveTab(tab.id);
              }}
              className={`group relative text-left rounded-2xl p-2.5 sm:p-3 border-2 transition-all duration-200 cursor-pointer select-none flex items-center space-x-3 ${
                isActive
                  ? `${tab.activeBg} shadow-md scale-[1.02] ring-2 ring-white`
                  : `bg-white/80 border-[#ecdcd1] text-[#6b4e41] ${tab.hoverBg} hover:scale-[1.01] shadow-xs`
              }`}
            >
              {/* Cute Washi tape effect on top of active tab */}
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#f3b5ad]/80 rounded-xs -rotate-2 border-dashed border-t border-b border-[#dd948a]/60 shadow-xs pointer-events-none" />
              )}

              {/* Aesthetic Icon */}
              <div className="shrink-0 transition-transform group-hover:scale-105">
                {tab.icon}
              </div>

              {/* Title & subtitle */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-cute font-bold text-xs sm:text-sm truncate">
                    {tab.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[11px] text-[#8b6f63] truncate hidden xs:inline">
                    {tab.subtitle}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/90 font-semibold shadow-2xs'
                        : 'bg-[#f4eae1] text-[#7d5f52]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
              </div>

              {/* Active cute heart indicator */}
              {isActive && (
                <div className="absolute top-1.5 right-2 text-xs animate-pulse">
                  🍓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
