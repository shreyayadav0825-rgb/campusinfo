import React, { useState, useEffect } from 'react';
import { ActiveTab, CalendarEvent, Flashcard, StudyNote, ResourceItem, TodoItem, ClassClash } from './types';
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_FLASHCARDS,
  INITIAL_STUDY_NOTES,
  INITIAL_RESOURCES,
  INITIAL_TODOS,
  INITIAL_NOTION_PAGES,
  INITIAL_WHATSAPP_CHATS,
} from './data/initialData';
import { DEFAULT_CAMPUS_CLASHES } from './services/classClashService';
import { AestheticNav } from './components/AestheticNav';
import { NotepadCanvas } from './components/NotepadCanvas';
import { AestheticHeader, GinghamTheme } from './components/AestheticHeader';
import { ChatbotView } from './components/ChatbotView';
import { CalendarView } from './components/CalendarView';
import { TodoListView } from './components/TodoListView';
import { GmailView } from './components/GmailView';
import { WhatsAppView } from './components/WhatsAppView';
import { NotionView } from './components/NotionView';
import { ResourcesView } from './components/ResourcesView';
import { StudyMaterialView } from './components/StudyMaterialView';
import { RedAlertBanner } from './components/RedAlertBanner';
import { RedAlertModal } from './components/RedAlertModal';
import { playCutePop, playRedAlertSound, stopRedAlertSound, resumeRedAlertSound } from './utils/sound';
import { ShieldAlert, BellOff, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import melodyCalIcon from './assets/images/melody_cal_icon_1789294067193.jpg';
import todoIcon from './assets/images/todo_icon_1789300346730.jpg';
import gmailIcon from './assets/images/strawberry_gmail_icon_1789301479320.jpg';
import notionIcon from './assets/images/notion_icon_1789302061804.jpg';
import whatsappIcon from './assets/images/whatsapp_icon_1789302930853.jpg';
import booksResourcesIcon from './assets/images/books_resources_icon_1789391402505.jpg';
import aiRobotIcon from './assets/images/ai_robot_avatar_icon_1789391582140.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('whatsapp');
  const [currentTheme, setTheme] = useState<GinghamTheme>('classic-red');

  // Application Data State
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('aesthetic_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('aesthetic_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('aesthetic_flashcards');
    return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
  });

  const [studyNotes, setStudyNotes] = useState<StudyNote[]>(() => {
    const saved = localStorage.getItem('aesthetic_notes');
    return saved ? JSON.parse(saved) : INITIAL_STUDY_NOTES;
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('aesthetic_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  // 🚨 Academic Class Clash State & Management
  const [clashes, setClashes] = useState<ClassClash[]>(() => {
    const saved = localStorage.getItem('academic_clashes');
    return saved ? JSON.parse(saved) : DEFAULT_CAMPUS_CLASHES;
  });

  // 🛑 Option to stop/silence the Red Alert
  const [isAlertStopped, setIsAlertStopped] = useState<boolean>(() => {
    return localStorage.getItem('academic_red_alert_stopped') === 'true';
  });

  const [activeModalClash, setActiveModalClash] = useState<ClassClash | null>(null);
  const [prefilledEmail, setPrefilledEmail] = useState<{ to: string; subject: string; body: string } | null>(null);

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem('aesthetic_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('academic_clashes', JSON.stringify(clashes));
  }, [clashes]);

  useEffect(() => {
    localStorage.setItem('academic_red_alert_stopped', String(isAlertStopped));
    if (isAlertStopped) {
      stopRedAlertSound();
    }
  }, [isAlertStopped]);

  useEffect(() => {
    localStorage.setItem('aesthetic_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem('aesthetic_notes', JSON.stringify(studyNotes));
  }, [studyNotes]);

  useEffect(() => {
    localStorage.setItem('aesthetic_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('aesthetic_todos', JSON.stringify(todos));
  }, [todos]);

  // Red Alert triggers ONLY when two class timings in WhatsApp or Gmail clash and alert is NOT stopped
  const unresolvedClashes = clashes.filter((c) => !c.resolved);
  const activeClashes = isAlertStopped ? [] : unresolvedClashes;
  const hasClashWhatsApp = !isAlertStopped && activeClashes.some((c) => c.source === 'whatsapp' || c.source === 'cross_service');
  const hasClashGmail = !isAlertStopped && activeClashes.some((c) => c.source === 'gmail' || c.source === 'cross_service');

  // Clash & Alert Handlers
  const handleStopRedAlert = () => {
    playCutePop();
    stopRedAlertSound();
    setIsAlertStopped(true);
  };

  const handleResumeRedAlert = () => {
    playCutePop();
    resumeRedAlertSound();
    setIsAlertStopped(false);
  };

  const handleSetNonClashingTimings = () => {
    playCutePop();
    stopRedAlertSound();
    // Timing separation: CHEM-204 is Wed 10:00 AM - 11:30 AM, HIST-110 is Wed 3:00 PM - 5:30 PM.
    // No timing overlap! Alert is strictly NOT triggered.
    setClashes([]);
  };

  const handleSetClashingTimings = () => {
    playCutePop();
    setIsAlertStopped(false);
    resumeRedAlertSound();
    setClashes(DEFAULT_CAMPUS_CLASHES.map((c) => ({ ...c, resolved: false })));
    playRedAlertSound();
  };

  const handleOpenClash = (clash: ClassClash) => {
    setActiveModalClash(clash);
  };

  const handleResolveClash = (clashId: string) => {
    playCutePop();
    setClashes((prev) =>
      prev.map((c) => (c.id === clashId ? { ...c, resolved: true } : c))
    );
    if (activeModalClash?.id === clashId) {
      setActiveModalClash(null);
    }
  };

  const handleDismissClash = (clashId: string) => {
    playCutePop();
    setClashes((prev) => prev.filter((c) => c.id !== clashId));
    if (activeModalClash?.id === clashId) {
      setActiveModalClash(null);
    }
  };

  const handleSimulateNewClash = () => {
    handleSetClashingTimings();
  };

  const handleEmailProfessorFromClash = (clash: ClassClash) => {
    playCutePop();
    setPrefilledEmail({
      to: 'Prof. David Vance <vance.biochem@campus.edu>',
      subject: `Academic Schedule Conflict: ${clash.classA.className} & ${clash.classB.className}`,
      body: `Dear Professor Vance,

I am writing regarding the newly rescheduled ${clash.classA.className} on ${clash.classA.dayOrDate} from ${clash.classA.startTime} to ${clash.classA.endTime}.

Unfortunately, I have an unavoidable academic conflict with my other enrolled course:
• Conflicting Class: ${clash.classB.className}
• Schedule: ${clash.classB.startTime} - ${clash.classB.endTime} (${clash.classB.locationOrRoom || 'Campus Classroom'})

Both sessions require mandatory in-person attendance. Could I please arrange to complete the laboratory session during an alternate makeup section or during office hours?

Thank you very much for your understanding and guidance.

Sincerely,
[Your Name]
Student ID: #2026-CAMPUS`,
    });
    setActiveTab('gmail');
    setActiveModalClash(null);
  };

  // Handlers for To-Do List
  const handleAddTodo = (newTodo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const item: TodoItem = {
      ...newTodo,
      id: `td-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTodos((prev) => [item, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers for Calendar
  const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: `ev-${Date.now()}`,
    };
    setEvents((prev) => [event, ...prev]);
  };

  const handleToggleEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleMergeGoogleEvents = (gEvents: CalendarEvent[]) => {
    setEvents((prev) => {
      // Remove any existing Google Calendar events and replace with fresh fetched list
      const nonGoogleEvents = prev.filter((e) => !e.isGoogleCalendar);
      return [...gEvents, ...nonGoogleEvents];
    });
  };

  // Handlers for Flashcards
  const handleAddFlashcard = (card: Omit<Flashcard, 'id' | 'mastered'>) => {
    const newCard: Flashcard = {
      ...card,
      id: `fc-${Date.now()}`,
      mastered: false,
    };
    setFlashcards((prev) => [newCard, ...prev]);
  };

  const handleToggleMastery = (id: string) => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
    );
  };

  // Handlers for Study Notes
  const handleAddStudyNote = (note: Omit<StudyNote, 'id'>) => {
    const newNote: StudyNote = {
      ...note,
      id: `note-${Date.now()}`,
    };
    setStudyNotes((prev) => [newNote, ...prev]);
  };

  // Handlers for Resources
  const handleAddResource = (item: Omit<ResourceItem, 'id'>) => {
    const newRes: ResourceItem = {
      ...item,
      id: `res-${Date.now()}`,
    };
    setResources((prev) => [newRes, ...prev]);
  };

  const handleToggleFavoriteResource = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  // Dynamic Gingham Background Style matching the user's uploaded image
  const getGinghamStyle = () => {
    const colorMap: Record<GinghamTheme, { color: string; rgb: string }> = {
      'classic-red': { color: '#f7eee2', rgb: '194, 53, 53' }, // Exact match of user image!
      strawberry: { color: '#fff0f3', rgb: '244, 114, 182' },
      sage: { color: '#f0fdf4', rgb: '16, 185, 129' },
      lavender: { color: '#faf5ff', rgb: '139, 92, 246' },
    };

    const current = colorMap[currentTheme] || colorMap['classic-red'];

    return {
      backgroundColor: current.color,
      backgroundImage: `
        linear-gradient(90deg, rgba(${current.rgb}, 0.48) 50%, transparent 50%),
        linear-gradient(rgba(${current.rgb}, 0.48) 50%, transparent 50%),
        radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '36px 36px, 36px 36px, 12px 12px',
    };
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat':
        return 'AI Study Companion';
      case 'calendar':
        return 'Study Schedule & Due Dates';
      case 'todo':
        return 'Daily Task & Assignment Checklist';
      case 'gmail':
        return 'Campus Gmail & Email Updates';
      case 'whatsapp':
        return 'WhatsApp Campus Circles & AI Summary';
      case 'notion':
        return 'Notion Workspace & Campus Notes';
      case 'resources':
        return 'Resource Vault & Tools';
      case 'study':
        return 'Flashcards & Study Material';
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#fff0f2] border border-[#fecdd3] p-0.5 -mt-1 shadow-2xs">
            <img
              src={aiRobotIcon}
              alt="AI Chatbot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'calendar':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#fff0f3] border border-[#fecdd3] p-0.5 -mt-1 shadow-2xs">
            <img
              src={melodyCalIcon}
              alt="My Melody Calendar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'todo':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#fff7ed] border border-[#fed7aa] p-0.5 -mt-1 shadow-2xs">
            <img
              src={todoIcon}
              alt="To-Do List"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'gmail':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#fff0f3] border border-[#fecdd3] p-0.5 -mt-1 shadow-2xs">
            <img
              src={gmailIcon}
              alt="Gmail"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#f0fdf4] border border-[#86efac] p-0.5 -mt-1 shadow-2xs">
            <img
              src={whatsappIcon}
              alt="WhatsApp"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'notion':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#fafaf9] border border-[#d6d3d1] p-0.5 -mt-1 shadow-2xs">
            <img
              src={notionIcon}
              alt="Notion"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'resources':
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#e0f2fe] border border-[#bae6fd] p-0.5 -mt-1 shadow-2xs">
            <img
              src={booksResourcesIcon}
              alt="Resources"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xs"
            />
          </span>
        );
      case 'study':
        return '🎴';
    }
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-500 flex flex-col justify-between"
      style={getGinghamStyle()}
    >
      {/* Top Header */}
      <AestheticHeader currentTheme={currentTheme} setTheme={setTheme} />

      {/* Cute Navigation Tabs with Aesthetic Icons */}
      <nav className="my-2">
        <AestheticNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          eventCount={events.filter((e) => !e.completed).length}
          cardCount={flashcards.length}
          todoCount={todos.filter((t) => !t.completed).length}
          hasClashWhatsApp={hasClashWhatsApp}
          hasClashGmail={hasClashGmail}
        />
      </nav>

      {/* 🛡️ Red Alert Controller & Clash Status Bar */}
      <div className="max-w-4xl mx-auto w-full px-3 mb-2">
        <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-2.5 sm:px-4 sm:py-2 border border-[#fecdd3] shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {isAlertStopped ? (
              <span className="flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-2xs">
                <BellOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Red Alert Stopped & Silenced</span>
              </span>
            ) : unresolvedClashes.length > 0 ? (
              <span className="flex items-center gap-1.5 text-red-800 font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse shrink-0" />
                <span>Red Alert Active: Class Timing Clash (Wed 3:00 PM)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Schedule Clear: No Class Timings Clash</span>
              </span>
            )}

            <span className="text-[#64748b] hidden md:inline text-[11px]">
              Only alerts when two class timings in WhatsApp or Gmail clash.
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Stop / Resume Alert Button */}
            {isAlertStopped ? (
              <button
                id="btn-resume-alert"
                onClick={handleResumeRedAlert}
                title="Resume monitoring for class timing clashes"
                className="px-2.5 py-1 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resume Alert</span>
              </button>
            ) : unresolvedClashes.length > 0 ? (
              <button
                id="btn-stop-alert-global"
                onClick={handleStopRedAlert}
                title="Stop and silence the Red Alert"
                className="px-2.5 py-1 rounded-lg bg-[#fef2f2] hover:bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <BellOff className="w-3 h-3 text-red-600" />
                <span>Stop Red Alert</span>
              </button>
            ) : null}

            {/* Quick Timing Switchers to test the 'only alert when timings clash' requirement */}
            {unresolvedClashes.length > 0 ? (
              <button
                onClick={handleSetNonClashingTimings}
                title="Switch classes to non-overlapping times (Wed 10:00 AM vs Wed 3:00 PM)"
                className="px-2 py-1 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1] text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Set Non-Clashing Times</span>
              </button>
            ) : (
              <button
                onClick={handleSetClashingTimings}
                title="Simulate class timings clashing on Wednesday at 3:00 PM"
                className="px-2 py-1 rounded-lg bg-[#fef2f2] hover:bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span>Test Clashing Timings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🚨 Global RED ALERT Banner when clashes are detected */}
      {activeClashes.length > 0 && (
        <div className="max-w-4xl mx-auto w-full px-3 mb-2">
          <RedAlertBanner
            clashes={activeClashes}
            onOpenClash={handleOpenClash}
            onResolveClash={handleResolveClash}
            onDismiss={handleDismissClash}
            onStopAlert={handleStopRedAlert}
            onNavigateToSource={(source) => {
              if (source === 'gmail') setActiveTab('gmail');
              else if (source === 'whatsapp') setActiveTab('whatsapp');
            }}
          />
        </div>
      )}

      {/* 🚨 Detailed Clash Resolution Modal */}
      {activeModalClash && (
        <RedAlertModal
          clash={activeModalClash}
          isOpen={!!activeModalClash}
          onClose={() => setActiveModalClash(null)}
          onResolve={handleResolveClash}
          onStopAlert={handleStopRedAlert}
          onOpenEmailReply={(recipient, subject, bodyText) => {
            setPrefilledEmail({ to: recipient, subject, body: bodyText });
            setActiveTab('gmail');
            setActiveModalClash(null);
          }}
        />
      )}

      {/* Central Stationery Paper Card (Matching User Image) */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6">
        <NotepadCanvas
          activeTabTitle={getTabTitle()}
          activeTabIcon={getTabIcon()}
        >
          {activeTab === 'chat' && (
            <ChatbotView onAddFlashcard={handleAddFlashcard} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={events}
              onAddEvent={handleAddEvent}
              onToggleEvent={handleToggleEvent}
              onDeleteEvent={handleDeleteEvent}
              onMergeGoogleEvents={handleMergeGoogleEvents}
            />
          )}

          {activeTab === 'todo' && (
            <TodoListView
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          )}

          {activeTab === 'gmail' && (
            <GmailView
              clashes={activeClashes}
              onOpenClash={handleOpenClash}
              onResolveClash={handleResolveClash}
              onStopAlert={handleStopRedAlert}
              onSimulateClash={handleSetClashingTimings}
              prefilledEmail={prefilledEmail}
              onClearPrefilledEmail={() => setPrefilledEmail(null)}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppView
              initialChats={INITIAL_WHATSAPP_CHATS}
              onAddTodo={handleAddTodo}
              onAddCalendarEvent={handleAddEvent}
              clashes={activeClashes}
              onOpenClash={handleOpenClash}
              onResolveClash={handleResolveClash}
              onStopAlert={handleStopRedAlert}
              onSimulateClash={handleSetClashingTimings}
            />
          )}

          {activeTab === 'notion' && (
            <NotionView initialPages={INITIAL_NOTION_PAGES} />
          )}

          {activeTab === 'resources' && (
            <ResourcesView
              resources={resources}
              onAddResource={handleAddResource}
              onToggleFavorite={handleToggleFavoriteResource}
            />
          )}

          {activeTab === 'study' && (
            <StudyMaterialView
              flashcards={flashcards}
              studyNotes={studyNotes}
              onAddFlashcard={handleAddFlashcard}
              onToggleMastery={handleToggleMastery}
              onAddStudyNote={handleAddStudyNote}
            />
          )}
        </NotepadCanvas>
      </main>

      {/* Footer bar */}
      <footer className="py-2.5 text-center text-xs font-cute text-[#684a3c] bg-white/70 backdrop-blur-xs border-t border-[#e2d2c1]">
        <p>
          Campus Info • Academic schedule & AI companion workspace
        </p>
      </footer>
    </div>
  );
}
