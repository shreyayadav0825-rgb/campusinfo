import React, { useState, useEffect } from 'react';
import {
  listGmailMessages,
  getGmailMessage,
  sendGmailMessage,
  GmailMessageSummary,
  GmailFullMessage,
} from '../services/gmailService';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/googleAuth';
import { User } from 'firebase/auth';
import { playCutePop, playRedAlertSound, stopRedAlertSound } from '../utils/sound';
import { ClassClash } from '../types';
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Inbox,
  PenTool,
  Clock,
  User as UserIcon,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  LogOut,
  ShieldAlert,
  AlertOctagon,
  Volume2,
  ArrowRight,
  School,
  BellOff,
} from 'lucide-react';
import gmailIcon from '../assets/images/strawberry_gmail_icon_1789301479320.jpg';

export interface GmailViewProps {
  clashes?: ClassClash[];
  onOpenClash?: (clash: ClassClash) => void;
  onResolveClash?: (clashId: string) => void;
  onStopAlert?: () => void;
  onSimulateClash?: () => void;
  prefilledEmail?: { to: string; subject: string; body: string } | null;
  onClearPrefilledEmail?: () => void;
}

const DEMO_CAMPUS_EMAILS: GmailMessageSummary[] = [
  {
    id: 'campus-mail-1',
    threadId: 'th-1',
    snippet: 'Dear Students, Due to spectrometer calibration, Section B Makeup Lab is rescheduled to Wednesday at 3:00 PM - 4:30 PM in Sci-Lab 201...',
    subject: '🚨 URGENT: CHEM-204 Makeup Lab Rescheduled to Wednesday 3:00 PM',
    from: 'Prof. David Vance <vance.biochem@campus.edu>',
    date: 'Wednesday 9:15 AM',
    isUnread: true,
  },
  {
    id: 'campus-mail-2',
    threadId: 'th-2',
    snippet: 'Dear Class, Attendance at this Wednesday Midterm Review Class from 3:00 PM to 5:30 PM in Library Room 3B is mandatory for all students taking the midterm exam...',
    subject: 'HIST-110: Mandatory Midterm Review Class (Wednesday 3:00 PM - 5:30 PM)',
    from: 'History Dept <history-academics@campus.edu>',
    date: 'Wednesday 10:00 AM',
    isUnread: true,
  },
  {
    id: 'campus-mail-3',
    threadId: 'th-3',
    snippet: 'Reminder: Deadline to add or drop courses without transcript notation is this Friday at 5:00 PM. Please verify your portal.',
    subject: 'Fall 2026 Academic Calendar: Add/Drop Deadline Reminder',
    from: 'Registrar Office <registrar@campus.edu>',
    date: 'Monday 2:30 PM',
    isUnread: false,
  },
  {
    id: 'campus-mail-4',
    threadId: 'th-4',
    snippet: 'Your pre-ordered safety goggles and laboratory notebook are ready for collection at the campus student store.',
    subject: 'Lab Goggles and Chemistry Notebook Ready for Pickup',
    from: 'Campus Bookstore <supplies@campus.edu>',
    date: 'Tuesday 11:20 AM',
    isUnread: false,
  },
];

const DEMO_EMAIL_BODIES: Record<string, GmailFullMessage> = {
  'campus-mail-1': {
    id: 'campus-mail-1',
    threadId: 'th-1',
    subject: '🚨 URGENT: CHEM-204 Makeup Lab Rescheduled to Wednesday 3:00 PM',
    from: 'Prof. David Vance <vance.biochem@campus.edu>',
    date: 'Wednesday, Sep 16, 9:15 AM',
    snippet: 'Due to spectrometer calibration, Section B Makeup Lab is rescheduled to Wednesday at 3:00 PM - 4:30 PM in Sci-Lab 201...',
    body: `Dear CHEM-204 Students,

Due to unscheduled maintenance and spectrometer recalibration in Sci-Lab 201, Section B's Makeup Chemistry Lab has been moved to:

• Day: Wednesday
• Time: 3:00 PM - 4:30 PM
• Location: Science Building, Sci-Lab 201

Attendance is mandatory for all students who missed Lab #4. If you have an unavoidable academic conflict with another enrolled course, please notify me immediately so we can schedule an alternate lab window.

Best regards,
Prof. David Vance
Department of Biochemistry & Organic Chemistry
Campus Science Center, Room 402`,
    isUnread: true,
  },
  'campus-mail-2': {
    id: 'campus-mail-2',
    threadId: 'th-2',
    subject: 'HIST-110: Mandatory Midterm Review Class (Wednesday 3:00 PM - 5:30 PM)',
    from: 'History Dept <history-academics@campus.edu>',
    date: 'Wednesday, Sep 16, 10:00 AM',
    snippet: 'Attendance at this Wednesday Midterm Review Class from 3:00 PM to 5:30 PM in Library Room 3B is mandatory...',
    body: `Dear HIST-110 Class,

This is a mandatory reminder that our midterm review class is scheduled for:

• Day: Wednesday
• Time: 3:00 PM - 5:30 PM
• Location: Campus Library, Room 3B

We will review primary source interpretation and discuss the essay prompt rubric. Attendance will be recorded and counts towards class participation. Please bring your notes from Chapters 1-6.

Sincerely,
Dr. Eleanor Hughes
Department of History
Campus Hall 204`,
    isUnread: true,
  },
  'campus-mail-3': {
    id: 'campus-mail-3',
    threadId: 'th-3',
    subject: 'Fall 2026 Academic Calendar: Add/Drop Deadline Reminder',
    from: 'Registrar Office <registrar@campus.edu>',
    date: 'Monday, Sep 14, 2:30 PM',
    snippet: 'Reminder: Deadline to add or drop courses without transcript notation is this Friday at 5:00 PM.',
    body: `Notice to All Students:

Please be reminded of the following academic milestones for the current term:

- Friday 5:00 PM: Add/Drop deadline without 'W' grade.
- Ensure all prerequisite waivers are signed by your academic advisor.
- Check your degree audit report for any graduation discrepancies.

Office of the Registrar
Administration Building 101`,
    isUnread: false,
  },
  'campus-mail-4': {
    id: 'campus-mail-4',
    threadId: 'th-4',
    subject: 'Lab Goggles and Chemistry Notebook Ready for Pickup',
    from: 'Campus Bookstore <supplies@campus.edu>',
    date: 'Tuesday, Sep 15, 11:20 AM',
    snippet: 'Your pre-ordered safety goggles and laboratory notebook are ready for collection at the campus student store.',
    body: `Hello Student,

Your order #ORD-88219 containing:
1. ANSI Z87.1 Safety Splash Goggles
2. Duplicate Carbonless Laboratory Notebook (100 pgs)

is now ready for pickup at Customer Service Desk B during regular store hours (9:00 AM - 5:00 PM).

Campus Bookstore Team`,
    isUnread: false,
  },
};

export const GmailView: React.FC<GmailViewProps> = ({
  clashes = [],
  onOpenClash,
  onResolveClash,
  onStopAlert,
  onSimulateClash,
  prefilledEmail,
  onClearPrefilledEmail,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>(DEMO_CAMPUS_EMAILS);
  const [selectedMessage, setSelectedMessage] = useState<GmailFullMessage | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'unread' | 'campus'>('inbox');

  // Compose State
  const [isComposing, setIsComposing] = useState(false);
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Active clashes
  const activeClashes = clashes.filter((c) => !c.resolved);
  const relevantClash = activeClashes[0] || null;

  // Handle incoming prefilled email from RedAlertModal or App
  useEffect(() => {
    if (prefilledEmail) {
      setToInput(prefilledEmail.to);
      setSubjectInput(prefilledEmail.subject);
      setBodyInput(prefilledEmail.body);
      setIsComposing(true);
      if (onClearPrefilledEmail) onClearPrefilledEmail();
    }
  }, [prefilledEmail]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setIsConnected(true);
        setDemoMode(false);
        loadEmails('label:INBOX');
      },
      () => {
        setCurrentUser(null);
        setIsConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadEmails = async (query = 'label:INBOX') => {
    if (demoMode) {
      if (query === 'is:unread') {
        setMessages(DEMO_CAMPUS_EMAILS.filter((m) => m.isUnread));
      } else if (query.includes('university') || query.includes('course')) {
        setMessages(DEMO_CAMPUS_EMAILS.filter((m) => m.subject.includes('CHEM') || m.subject.includes('HIST')));
      } else {
        setMessages(DEMO_CAMPUS_EMAILS);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        setIsConnected(false);
        return;
      }
      const list = await listGmailMessages(query, 20);
      setMessages(list);
    } catch (err: any) {
      console.error('Error loading Gmail:', err);
      setError(err.message || 'Failed to fetch messages. Please re-authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      playCutePop();
      const authResult = await googleSignIn();
      if (authResult) {
        setCurrentUser(authResult.user);
        setIsConnected(true);
        setDemoMode(false);
        await loadEmails('label:INBOX');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    playCutePop();
    await logoutGoogle();
    setCurrentUser(null);
    setIsConnected(false);
    setDemoMode(true);
    setMessages(DEMO_CAMPUS_EMAILS);
    setSelectedMessage(null);
  };

  const handleSelectMessage = async (summary: GmailMessageSummary) => {
    playCutePop();
    if (demoMode || DEMO_EMAIL_BODIES[summary.id]) {
      const full = DEMO_EMAIL_BODIES[summary.id] || {
        id: summary.id,
        threadId: summary.threadId,
        subject: summary.subject,
        from: summary.from,
        to: 'student@campus.edu',
        date: summary.date,
        snippet: summary.snippet,
        body: summary.snippet,
        isUnread: false,
      };
      setSelectedMessage(full);
      return;
    }

    try {
      setLoadingDetail(true);
      setError(null);
      const full = await getGmailMessage(summary.id);
      setSelectedMessage(full);
    } catch (err: any) {
      setError(err.message || 'Failed to load email contents');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadEmails('label:INBOX');
      return;
    }
    loadEmails(searchQuery);
  };

  const handleFolderChange = (folder: 'inbox' | 'unread' | 'campus') => {
    setCurrentFolder(folder);
    setSelectedMessage(null);
    if (folder === 'inbox') {
      loadEmails('label:INBOX');
    } else if (folder === 'unread') {
      loadEmails('is:unread');
    } else if (folder === 'campus') {
      loadEmails('university OR campus OR professor OR assignment OR course OR exam');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toInput.trim() || !subjectInput.trim()) {
      setError('Please provide recipient email and subject.');
      return;
    }

    try {
      setSending(true);
      setError(null);
      if (isConnected) {
        await sendGmailMessage(toInput, subjectInput, bodyInput);
      } else {
        // Simulated local sending for demo mode
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setSendSuccess(true);
      playCutePop();
      setTimeout(() => {
        setSendSuccess(false);
        setIsComposing(false);
        setToInput('');
        setSubjectInput('');
        setBodyInput('');
        loadEmails('label:INBOX');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDraftClashReply = (targetMessage?: GmailMessageSummary | GmailFullMessage) => {
    playCutePop();
    const isVance = targetMessage?.from.includes('Vance') || targetMessage?.subject.includes('CHEM-204') || true;
    const recipient = isVance ? 'Prof. David Vance <vance.biochem@campus.edu>' : 'History Dept <history-academics@campus.edu>';
    const subject = isVance
      ? 'Academic Schedule Conflict: CHEM-204 Makeup Lab & HIST-110 Review'
      : 'Academic Schedule Conflict: HIST-110 Review & CHEM-204 Lab';
    const body = `Dear ${isVance ? 'Professor Vance' : 'History Department'},

I am writing regarding the newly scheduled ${isVance ? 'CHEM-204 Section B Makeup Lab' : 'HIST-110 Midterm Review Class'} on Wednesday at 3:00 PM.

Unfortunately, I have an unavoidable academic clash with ${isVance ? 'HIST-110 Mandatory Midterm Review Class (Wednesday 3:00 PM - 5:30 PM)' : 'CHEM-204 Section B Makeup Lab (Wednesday 3:00 PM - 4:30 PM)'}.

Both sessions require in-person attendance. Could you please advise if there is an alternate makeup slot or office hour window where I could complete this requirement?

Thank you very much for your understanding and guidance.

Sincerely,
[Your Name]
Student ID: #2026-CAMPUS`;

    setToInput(recipient);
    setSubjectInput(subject);
    setBodyInput(body);
    setIsComposing(true);
  };

  const isEmailClashing = (msg: { subject: string; from: string }) => {
    const s = msg.subject.toLowerCase();
    return s.includes('chem-204') || s.includes('hist-110') || s.includes('makeup lab');
  };

  return (
    <div className="space-y-4">
      {/* 🚨 RED ALERT: Class Clash Banner in Gmail */}
      {relevantClash && !relevantClash.resolved && (
        <div className="bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#b91c1c] text-white p-4 sm:p-5 rounded-2xl shadow-lg border-2 border-red-800 animate-in fade-in space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center animate-pulse shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white text-[#991b1b] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                    🚨 RED ALERT: CLASS CLASH DETECTED IN GMAIL
                  </span>
                  <span className="text-xs text-red-100 font-bold">
                    Schedule Conflict
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                  "{relevantClash.classA.className}" conflicts with "{relevantClash.classB.className}"
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => {
                  playRedAlertSound();
                }}
                title="Play Red Alert Sound"
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <Volume2 className="w-4 h-4" />
                <span>Alarm</span>
              </button>

              <button
                id="gmail-stop-alert-btn"
                onClick={() => {
                  playCutePop();
                  stopRedAlertSound();
                  if (onStopAlert) {
                    onStopAlert();
                  } else if (onResolveClash) {
                    onResolveClash(relevantClash.id);
                  }
                }}
                title="Stop Red Alert"
                className="bg-black/35 hover:bg-black/55 text-white border border-white/30 text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BellOff className="w-3.5 h-3.5 text-yellow-300" />
                <span>Stop Alert</span>
              </button>

              <button
                onClick={() => handleDraftClashReply()}
                className="bg-white hover:bg-red-50 text-[#b91c1c] text-xs font-bold px-3 py-2 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draft Email</span>
              </button>
              <button
                onClick={() => {
                  playCutePop();
                  if (onOpenClash) onOpenClash(relevantClash);
                }}
                className="bg-[#7f1d1d] hover:bg-[#991b1b] text-white border border-red-400 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Resolve Conflict</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-black/25 rounded-xl p-3 text-xs text-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-white/10">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>
                Overlap: <strong className="text-white">{relevantClash.overlapDescription}</strong> (Wednesday 3:00 PM)
              </span>
            </div>
            <span className="text-[11px] text-red-200 font-medium">
              Received via Campus Gmail notices from Prof. Vance & History Dept
            </span>
          </div>
        </div>
      )}

      {/* Header Banner with Cute Gmail Icon & Status */}
      <div className="bg-gradient-to-r from-[#fff1f2] via-[#ffe4e6] to-[#fef2f2] rounded-2xl p-4 sm:p-5 border border-[#fecdd3] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm border border-[#fecdd3] flex items-center justify-center shrink-0">
            <img
              src={gmailIcon}
              alt="Cute Strawberry Gmail Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif-title font-bold text-xl text-[#881337]">
                Campus Gmail Inbox
              </h2>
              {isConnected ? (
                <span className="px-2 py-0.5 bg-[#e11d48] text-white text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Google Synced
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-[#16a34a] text-white text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                  <School className="w-3 h-3" />
                  Campus Mailbox
                </span>
              )}
            </div>
            <p className="text-xs text-[#be123c] mt-0.5">
              College announcements, professor schedule updates, and class clash alerts 🍓
            </p>
          </div>
        </div>

        {/* Auth & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test Class Clash Alert Button */}
          <button
            onClick={() => {
              playRedAlertSound();
              if (onSimulateClash) onSimulateClash();
            }}
            className="bg-red-50 hover:bg-red-100 text-[#b91c1c] border-2 border-red-200 hover:border-red-400 px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Trigger or test Class Clash Red Alert"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>🚨 Test Clash Alert</span>
          </button>

          {isConnected ? (
            <div className="flex items-center space-x-2 bg-white/90 px-3 py-1.5 rounded-xl border border-[#bfdbfe] shadow-2xs">
              <span className="text-xs text-[#1e3a8a] font-medium truncate max-w-[140px]">
                {currentUser?.email || 'Google Account'}
              </span>
              <button
                onClick={handleDisconnect}
                title="Switch to Demo Mailbox"
                className="text-xs text-[#ef4444] hover:text-[#b91c1c] p-1 rounded-md hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-gradient-to-r from-[#2563eb] to-[#ec4899] hover:from-[#1d4ed8] hover:to-[#db2777] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? 'Connecting...' : 'Sign in Google'}</span>
            </button>
          )}

          <button
            onClick={() => {
              playCutePop();
              setIsComposing(true);
            }}
            className="bg-gradient-to-r from-[#ec4899] to-[#f43f5e] hover:from-[#db2777] hover:to-[#e11d48] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
            {error}
          </span>
          <button
            onClick={() => setError(null)}
            className="text-[#991b1b] font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connected or Demo Mailbox Interface */}
      <div className="space-y-4">
        {/* Controls Bar: Folders + Search + Refresh */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quick Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0] w-full sm:w-auto">
            <button
              onClick={() => handleFolderChange('inbox')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                currentFolder === 'inbox'
                  ? 'bg-white text-[#1e3a8a] shadow-2xs font-bold'
                  : 'text-[#64748b] hover:text-[#1e3a8a]'
              }`}
            >
              📥 Inbox ({messages.length})
            </button>
            <button
              onClick={() => handleFolderChange('unread')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                currentFolder === 'unread'
                  ? 'bg-white text-[#1e3a8a] shadow-2xs font-bold'
                  : 'text-[#64748b] hover:text-[#1e3a8a]'
              }`}
            >
              ✨ Unread
            </button>
            <button
              onClick={() => handleFolderChange('campus')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                currentFolder === 'campus'
                  ? 'bg-white text-[#1e3a8a] shadow-2xs font-bold'
                  : 'text-[#64748b] hover:text-[#1e3a8a]'
              }`}
            >
              🎓 Campus Notices
            </button>
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails..."
                className="w-full bg-white border border-[#cbd5e1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1e293b] focus:outline-hidden focus:ring-2 focus:ring-[#3b82f6]/40"
              />
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            <button
              onClick={() => loadEmails()}
              disabled={loading}
              title="Refresh messages"
              className="p-2 bg-white border border-[#cbd5e1] text-[#475569] hover:text-[#1e3a8a] rounded-xl hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Email Reader / Inbox View */}
        {selectedMessage ? (
          /* Detailed Email View */
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex items-center space-x-1.5 text-xs font-bold text-[#3b82f6] hover:text-[#1d4ed8] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Inbox</span>
              </button>
              <span className="text-[11px] text-[#64748b]">
                {selectedMessage.date}
              </span>
            </div>

            {/* 🚨 Clashing Email Warning Banner inside detail view */}
            {isEmailClashing(selectedMessage) && relevantClash && !relevantClash.resolved && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 text-xs text-[#991b1b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse shrink-0" />
                  <div>
                    <strong className="block text-red-900 font-bold">
                      🚨 Warning: Conflicting Class Notice!
                    </strong>
                    <span>
                      This class conflicts with {relevantClash.classB.className} (Wednesday 3:00 PM). Both sessions require in-person attendance.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDraftClashReply(selectedMessage)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 cursor-pointer shadow-2xs"
                >
                  Quick Reply to Professor
                </button>
              </div>
            )}

            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#0f172a]">
                {selectedMessage.subject}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-[#64748b] mt-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span className="font-medium text-[#334155]">From: {selectedMessage.from}</span>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0] text-xs leading-relaxed text-[#334155] whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
              {selectedMessage.body}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {isEmailClashing(selectedMessage) && (
                <button
                  onClick={() => handleDraftClashReply(selectedMessage)}
                  className="bg-[#b91c1c] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-[#991b1b] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Notify Professor of Clash</span>
                </button>
              )}
              <button
                onClick={() => {
                  setToInput(selectedMessage.from);
                  setSubjectInput(`Re: ${selectedMessage.subject}`);
                  setIsComposing(true);
                }}
                className="bg-[#2563eb] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-[#1d4ed8] transition-colors cursor-pointer"
              >
                Reply
              </button>
            </div>
          </div>
        ) : (
          /* Email List */
          <div className="space-y-2">
            {loading ? (
              <div className="bg-white/80 rounded-2xl p-10 text-center border border-[#e2e8f0]">
                <RefreshCw className="w-6 h-6 text-[#3b82f6] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#64748b]">Fetching messages from Gmail...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white/80 rounded-2xl p-8 text-center border-2 border-dashed border-[#e2e8f0]">
                <Inbox className="w-10 h-10 text-[#94a3b8] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#334155]">No messages found</p>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Your inbox is clean or no emails matched your search.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isClashing = isEmailClashing(msg);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`rounded-xl p-3.5 border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                      isClashing && relevantClash && !relevantClash.resolved
                        ? 'border-2 border-red-500 bg-[#fef2f2] text-[#991b1b]'
                        : msg.isUnread
                        ? 'border-[#93c5fd] bg-[#f0f9ff]/40 font-semibold'
                        : 'bg-white border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isClashing && relevantClash && !relevantClash.resolved
                            ? 'bg-red-600 animate-ping'
                            : msg.isUnread
                            ? 'bg-[#2563eb]'
                            : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold truncate">
                              {msg.from}
                            </span>
                            {isClashing && relevantClash && !relevantClash.resolved && (
                              <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 animate-pulse shadow-2xs flex items-center gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                🚨 RED ALERT: CLASH
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#94a3b8] shrink-0">
                            {msg.date.split(' ').slice(1, 4).join(' ') || msg.date}
                          </span>
                        </div>
                        <p className={`text-xs font-medium truncate mt-0.5 ${isClashing ? 'text-red-950 font-bold' : 'text-[#1e293b]'}`}>
                          {msg.subject}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                          {msg.snippet}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#cbd5e1] shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#fffdfa] rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-[#e2e8f0] shadow-xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f1f5f9]">
              <div className="flex items-center space-x-2.5">
                <img
                  src={gmailIcon}
                  alt="Gmail"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-contain p-0.5 bg-white border border-[#fecdd3]"
                />
                <h3 className="font-serif-title font-bold text-lg text-[#881337]">
                  New Campus Email
                </h3>
              </div>
              <button
                onClick={() => setIsComposing(false)}
                className="text-[#94a3b8] hover:text-[#0f172a] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sendSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#22c55e] mx-auto animate-bounce" />
                <p className="font-serif-title font-bold text-base text-[#15803d]">
                  Email Sent Successfully!
                </p>
                <p className="text-xs text-[#64748b]">
                  Sent notification to professor regarding your schedule.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    To (Recipient):
                  </label>
                  <input
                    type="text"
                    required
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    placeholder="professor@university.edu or classmate@campus.edu"
                    className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="e.g., Academic Conflict: CHEM-204 Makeup Lab"
                    className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Message:
                  </label>
                  <textarea
                    rows={7}
                    required
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    placeholder="Dear Professor, I am writing regarding an academic conflict..."
                    className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#3b82f6] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-4 py-2 text-xs text-[#64748b] hover:text-[#0f172a] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Sending...' : 'Send Email'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
