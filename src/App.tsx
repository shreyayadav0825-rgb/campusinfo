import React, { useState, useEffect } from 'react';
import { ActiveTab, CalendarEvent, Flashcard, StudyNote, ResourceItem, TodoItem } from './types';
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_FLASHCARDS,
  INITIAL_STUDY_NOTES,
  INITIAL_RESOURCES,
  INITIAL_TODOS,
  INITIAL_NOTION_PAGES,
  INITIAL_WHATSAPP_CHATS,
} from './data/initialData';
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
import melodyCalIcon from './assets/images/melody_cal_icon_1789294067193.jpg';
import todoIcon from './assets/images/todo_icon_1789300346730.jpg';
import gmailIcon from './assets/images/strawberry_gmail_icon_1789301479320.jpg';
import notionIcon from './assets/images/notion_icon_1789302061804.jpg';
import whatsappIcon from './assets/images/whatsapp_icon_1789302930853.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
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

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem('aesthetic_events', JSON.stringify(events));
  }, [events]);

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
        return '🍓';
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
        return '🌿';
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
        />
      </nav>

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
            <GmailView />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppView
              initialChats={INITIAL_WHATSAPP_CHATS}
              onAddTodo={handleAddTodo}
              onAddCalendarEvent={handleAddEvent}
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
