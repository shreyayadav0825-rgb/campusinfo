import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { playCutePop, playCuteChime } from '../utils/sound';
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/googleAuth';
import {
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from '../services/calendarService';
import { User } from 'firebase/auth';
import melodyCalIcon from '../assets/images/melody_cal_icon_1789294067193.jpg';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onMergeGoogleEvents: (gEvents: CalendarEvent[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEvent,
  onToggleEvent,
  onDeleteEvent,
  onMergeGoogleEvents,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-13');
  const [showAddModal, setShowAddModal] = useState(false);

  // Google Calendar Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Destructive Action Confirmation Modal State
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<CalendarEvent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [category, setCategory] = useState<CalendarEvent['category']>('study');
  const [notes, setNotes] = useState('');
  const [syncToGoogle, setSyncToGoogle] = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        syncFromGoogleCalendar();
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync / Fetch events from Google Calendar
  const syncFromGoogleCalendar = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      setIsSyncing(true);
      setSyncError(null);
      setSyncStatusMsg('Fetching Google Calendar events...');

      // September 2026 range (from start of month to end of month)
      const timeMin = new Date('2026-09-01T00:00:00Z').toISOString();
      const timeMax = new Date('2026-09-30T23:59:59Z').toISOString();

      const gEvents = await listGoogleCalendarEvents(timeMin, timeMax);

      // Convert Google Calendar items to our CalendarEvent schema
      const mappedEvents: CalendarEvent[] = gEvents.map((item) => {
        let date = '2026-09-13';
        let timeStr = 'All Day';

        if (item.start.dateTime) {
          const d = new Date(item.start.dateTime);
          date = d.toISOString().split('T')[0];
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (item.start.date) {
          date = item.start.date;
        }

        // Auto-assign cute color and category based on title keyword
        const lowerSummary = (item.summary || '').toLowerCase();
        let cat: CalendarEvent['category'] = 'study';
        let color = '#059669';

        if (lowerSummary.includes('exam') || lowerSummary.includes('test') || lowerSummary.includes('midterm')) {
          cat = 'exam';
          color = '#e0534b';
        } else if (lowerSummary.includes('assignment') || lowerSummary.includes('homework') || lowerSummary.includes('due') || lowerSummary.includes('project')) {
          cat = 'assignment';
          color = '#d97706';
        } else if (lowerSummary.includes('review') || lowerSummary.includes('prep') || lowerSummary.includes('quiz')) {
          cat = 'review';
          color = '#7c3aed';
        } else if (lowerSummary.includes('break') || lowerSummary.includes('coffee') || lowerSummary.includes('rest')) {
          cat = 'rest';
          color = '#db2777';
        }

        return {
          id: `gcal-${item.id}`,
          title: item.summary || 'Untitled Event',
          date,
          time: timeStr,
          category: cat,
          color,
          completed: false,
          notes: item.description || '',
          googleEventId: item.id,
          isGoogleCalendar: true,
          htmlLink: item.htmlLink,
        };
      });

      onMergeGoogleEvents(mappedEvents);
      setSyncStatusMsg(`Synced ${mappedEvents.length} events from Google Calendar! ✨`);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } catch (err: any) {
      console.error('Google Calendar Sync Error:', err);
      setSyncError(err.message || 'Failed to sync with Google Calendar.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      playCutePop();
      setIsSigningIn(true);
      setSyncError(null);
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        playCuteChime();
        await syncFromGoogleCalendar();
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setSyncError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    playCutePop();
    await logoutGoogle();
    setCurrentUser(null);
    setSyncStatusMsg('Disconnected from Google Calendar');
    setTimeout(() => setSyncStatusMsg(null), 3000);
  };

  // Calendar Days layout
  const totalDays = 30;
  const startDayOffset = 2; // Sept 1, 2026 is Tuesday
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getDayEvents = (dayNum: number) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateStr = `2026-09-${formattedDay}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleDayClick = (dayNum: number) => {
    playCutePop();
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    setSelectedDate(`2026-09-${formattedDay}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playCuteChime();
    const categoryColors = {
      exam: '#e0534b',
      assignment: '#d97706',
      study: '#059669',
      review: '#7c3aed',
      rest: '#db2777',
    };

    let googleEventId: string | undefined;
    let htmlLink: string | undefined;

    // If connected to Google Calendar and toggle checked, create on Google Calendar as well
    if (currentUser && syncToGoogle) {
      try {
        // Build ISO start & end dates
        const startIso = `${selectedDate}T10:00:00Z`;
        const endIso = `${selectedDate}T11:00:00Z`;
        const created = await createGoogleCalendarEvent({
          summary: title.trim(),
          description: notes.trim() || `Campus Info study session - Category: ${category}`,
          startDateTime: startIso,
          endDateTime: endIso,
        });
        googleEventId = created.id;
        htmlLink = created.htmlLink;
      } catch (err: any) {
        console.error('Failed to create on Google Calendar:', err);
      }
    }

    onAddEvent({
      title: title.trim(),
      date: selectedDate,
      time,
      category,
      color: categoryColors[category],
      completed: false,
      notes,
      googleEventId,
      isGoogleCalendar: !!googleEventId,
      htmlLink,
    });

    setTitle('');
    setNotes('');
    setShowAddModal(false);
  };

  // Trigger Destructive Deletion Confirmation
  const requestDeleteEvent = (ev: CalendarEvent) => {
    playCutePop();
    setConfirmDeleteTarget(ev);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteTarget) return;

    playCutePop();
    const target = confirmDeleteTarget;
    setConfirmDeleteTarget(null);

    // If it's a Google Calendar event, delete from Google Calendar
    if (target.googleEventId && currentUser) {
      try {
        await deleteGoogleCalendarEvent(target.googleEventId);
      } catch (err) {
        console.error('Failed to delete from Google Calendar:', err);
      }
    }

    onDeleteEvent(target.id);
  };

  const selectedDayEvents = events.filter((e) => e.date === selectedDate);
  const nextExam = events.find((e) => e.category === 'exam' && !e.completed);

  return (
    <div className="space-y-6">
      {/* Google Calendar Integration Status Banner */}
      <div className="bg-white/90 border border-[#ebdcd0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#ebdcd0] shadow-xs flex items-center justify-center p-2">
            {/* Google Calendar 4-color icon */}
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <rect x="3" y="4" width="18" height="18" rx="2" fill="#fff" />
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#4285F4" />
              <path d="M7 12h5v5H7z" fill="#34A853" />
              <path d="M14 12h3v5h-3z" fill="#FBBC05" />
              <path d="M3 6h18v3H3z" fill="#EA4335" />
            </svg>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-cute font-bold text-sm text-[#3b271d]">
                Google Calendar Integration
              </h3>
              {currentUser ? (
                <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="bg-[#fef2f2] text-[#991b1b] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7d5e51]">
              {currentUser
                ? `Syncing primary calendar events for ${currentUser.email || 'user'}`
                : 'Connect with permission to see and update your real Google Calendar events.'}
            </p>
          </div>
        </div>

        {/* Auth & Sync Action Controls */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <>
              <button
                onClick={() => {
                  playCutePop();
                  syncFromGoogleCalendar();
                }}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-cute font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                onClick={handleGoogleSignOut}
                className="p-1.5 rounded-xl border border-[#d8c3b4] text-[#6d4e41] hover:bg-[#faeee4] text-xs font-cute transition-colors cursor-pointer"
                title="Disconnect Google Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button bg-white hover:bg-[#f8f9fa] border border-[#dadce0] px-3 py-1.5 rounded-xl shadow-2xs text-xs font-cute font-bold text-[#3c4043] flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-2.5 text-xs text-[#065f46] font-cute flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#059669]" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {syncError && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-2.5 text-xs text-[#991b1b] font-cute flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#dc2626]" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Top Banner: Exam Countdown & Study Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Exam Countdown Card */}
        <div className="sm:col-span-2 bg-[#fdf1f1] border border-[#f5cfcf] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#e0534b] text-white flex items-center justify-center font-cute font-bold text-lg shadow-xs">
              🚨
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#b91c1c] uppercase tracking-wider">
                  Upcoming Exam / Milestone
                </span>
                <span className="bg-[#fee2e2] text-[#991b1b] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  5 Days Left
                </span>
              </div>
              <p className="font-cute font-bold text-sm text-[#451e19] mt-0.5">
                {nextExam ? nextExam.title : 'All major exams completed!'}
              </p>
              <p className="text-[11px] text-[#7f4a42]">
                {nextExam ? `Date: ${nextExam.date} • ${nextExam.time}` : 'Keep up the daily study sessions'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCutePop();
              setShowAddModal(true);
            }}
            className="hidden xs:flex items-center space-x-1.5 bg-[#b94747] hover:bg-[#a13b3b] text-white px-3 py-2 rounded-xl text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Study Streak Badge */}
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-3.5 sm:p-4 flex items-center space-x-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center text-xl shadow-xs">
            🔥
          </div>
          <div>
            <div className="flex items-center space-x-1 text-xs font-bold text-[#92400e]">
              <span>Campus Streak</span>
              <span>⭐</span>
            </div>
            <p className="font-cute font-bold text-base text-[#78350f]">
              5 Days in a Row!
            </p>
            <p className="text-[11px] text-[#a16207]">
              Steady focus builds great results
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Month Calendar on Left, Selected Date Agenda on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Month Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#ebdcd0] shadow-2xs">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0e3d6]">
            <div className="flex items-center space-x-2.5">
              <img
                src={melodyCalIcon}
                alt="My Melody Calendar"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-contain shadow-2xs border border-[#fbcfe8] p-0.5 bg-white"
              />
              <h2 className="font-serif-title font-bold text-lg text-[#3b271d]">
                September 2026
              </h2>
              <span className="font-handwriting text-sm text-[#b94747] font-bold">
                • academic calendar
              </span>
            </div>

            <div className="flex items-center space-x-1 text-xs text-[#705346] font-cute">
              <span className="px-2 py-0.5 rounded-md bg-[#f5ebe0]">Autumn Term</span>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-cute text-xs font-bold text-[#8a6a5d] mb-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="h-12 sm:h-14 rounded-xl opacity-20" />
            ))}

            {/* Days */}
            {daysArray.map((dayNum) => {
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const dateStr = `2026-09-${formattedDay}`;
              const dayEvents = getDayEvents(dayNum);
              const isSelected = selectedDate === dateStr;
              const isToday = dayNum === 13;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-12 sm:h-14 rounded-xl p-1 sm:p-1.5 flex flex-col justify-between text-left transition-all relative border cursor-pointer ${
                    isSelected
                      ? 'bg-[#b94747] text-white border-[#942c2c] shadow-sm scale-102 ring-2 ring-[#fca5a5]'
                      : isToday
                      ? 'bg-[#fff5f5] text-[#b94747] border-[#f87171] font-bold shadow-2xs'
                      : 'bg-white/90 hover:bg-[#faf0e6] text-[#4d362b] border-[#eee1d5]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-cute font-bold">{dayNum}</span>
                    {isToday && (
                      <span className="text-[9px] px-1 rounded-full bg-[#fee2e2] text-[#991b1b] font-cute">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Cute event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex items-center space-x-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: isSelected ? '#ffffff' : ev.color,
                          }}
                          title={ev.title}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] leading-none">+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda (5 cols) */}
        <div className="lg:col-span-5 bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#ebdcd0] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0e3d6]">
            <div>
              <h3 className="font-cute font-bold text-base text-[#3b271d] flex items-center space-x-1.5">
                <span>Agenda: {selectedDate}</span>
                <span className="text-xs font-normal text-[#8c6d5f]">
                  ({selectedDayEvents.length} items)
                </span>
              </h3>
              <p className="text-xs text-[#8c6d5f]">
                Schedule & deadlines for this date
              </p>
            </div>

            <button
              onClick={() => {
                playCutePop();
                setShowAddModal(true);
              }}
              className="p-1.5 rounded-xl bg-[#f4eae0] hover:bg-[#ebd8c7] text-[#6d4e41] border border-[#e2d0bf] transition-colors cursor-pointer flex items-center space-x-1 text-xs font-cute"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Agenda items list */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[360px] pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-10 text-[#a38b7e] font-cute space-y-2">
                <span className="text-3xl block">☕</span>
                <p className="text-xs font-bold">No tasks scheduled for this day.</p>
                <p className="text-[11px]">Click "Add" above to plan a study block or schedule an event!</p>
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                    ev.completed
                      ? 'bg-[#f4efe9]/60 border-[#e6d9cd] opacity-75'
                      : 'bg-white border-[#ebdcd0] shadow-2xs'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <button
                      onClick={() => {
                        playCutePop();
                        onToggleEvent(ev.id);
                      }}
                      className={`w-5 h-5 rounded-lg shrink-0 mt-0.5 flex items-center justify-center transition-colors border cursor-pointer ${
                        ev.completed
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-white border-[#d8c3b4] hover:border-[#b94747]'
                      }`}
                    >
                      {ev.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-xs font-cute font-bold truncate ${
                            ev.completed ? 'line-through text-[#8c7467]' : 'text-[#3b271d]'
                          }`}
                        >
                          {ev.title}
                        </span>

                        {ev.isGoogleCalendar && (
                          <span
                            className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-md font-bold flex items-center space-x-0.5 border border-blue-200 shrink-0"
                            title="Synced with Google Calendar"
                          >
                            <span>GCal</span>
                          </span>
                        )}
                      </div>

                      {ev.notes && (
                        <p className="text-[11px] text-[#7f6356] mt-0.5 leading-snug">
                          {ev.notes}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 mt-1 text-[10px] text-[#9b7e72]">
                        {ev.time && (
                          <span className="flex items-center space-x-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{ev.time}</span>
                          </span>
                        )}
                        <span
                          className="px-1.5 py-0.2 rounded-full uppercase font-bold text-[9px]"
                          style={{
                            backgroundColor: `${ev.color}20`,
                            color: ev.color,
                          }}
                        >
                          {ev.category}
                        </span>

                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 ml-1"
                            title="Open in Google Calendar"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => requestDeleteEvent(ev)}
                    className="text-[#b59d91] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog for Destructive Deletion */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="bg-[#fbf7ee] rounded-2xl max-w-sm w-full p-5 sm:p-6 border border-[#e5d8c8] paper-shadow relative animate-fadeIn">
            <div className="flex items-center space-x-2.5 mb-3 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="font-serif-title font-bold text-base text-[#3d271d]">
                Confirm Event Deletion
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-[#5c4033] font-reading leading-relaxed mb-4">
              Are you sure you want to delete event{' '}
              <strong className="text-[#991b1b]">"{confirmDeleteTarget.title}"</strong> on{' '}
              {confirmDeleteTarget.date}?
              {confirmDeleteTarget.isGoogleCalendar && (
                <span className="block mt-1 text-[11px] text-[#b91c1c] font-bold">
                  ⚠️ This will also remove the event from your Google Calendar account.
                </span>
              )}
            </p>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#d8c5b6] text-xs font-cute text-[#684b3e] hover:bg-[#faefe5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-[#fbf7ee] rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#e5d8c8] paper-shadow relative">
            {/* Cute header washi tape */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#f3b5ad]/90 rounded-xs -rotate-1 border-t border-b border-[#dd948a]/80 shadow-xs" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebdcd0]">
              <div className="flex items-center space-x-2.5">
                <img
                  src={melodyCalIcon}
                  alt="My Melody Calendar Icon"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-contain border border-[#fbcfe8] p-0.5 bg-white shadow-2xs"
                />
                <h3 className="font-serif-title font-bold text-lg text-[#3d271d]">
                  Add Campus Event
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#96796d] hover:text-[#5a3b2f] text-sm font-cute cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Task / Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chemistry Midterm or Campus Lecture"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#3b271d] font-reading focus:ring-2 focus:ring-[#e2736e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#e2736e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#e2736e] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-cute">
                  {[
                    { id: 'exam', label: '🚨 Exam' },
                    { id: 'assignment', label: '📝 Assignment' },
                    { id: 'study', label: '📖 Study' },
                    { id: 'review', label: '🔍 Review' },
                    { id: 'rest', label: '☕ Rest & Tea' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#b94747] text-white font-bold border-[#942c2c] shadow-2xs'
                          : 'bg-white border-[#dfd0c2] text-[#694d40] hover:bg-[#faeee4]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Notes / Goals
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Location, syllabus chapters, study notes..."
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#e2736e] focus:outline-none"
                />
              </div>

              {/* Google Calendar sync toggle */}
              {currentUser && (
                <div className="bg-[#f0f9ff] border border-[#bae6fd] p-2.5 rounded-xl flex items-center justify-between text-xs font-cute">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🗓️</span>
                    <span className="text-[#0369a1] font-bold">Add to Google Calendar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncToGoogle}
                    onChange={(e) => setSyncToGoogle(e.target.checked)}
                    className="w-4 h-4 accent-[#0284c7] cursor-pointer"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#d8c5b6] text-xs font-cute text-[#684b3e] hover:bg-[#faefe5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#b94747] hover:bg-[#a13b3b] text-white text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Event ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
