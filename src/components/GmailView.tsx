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
import { playCutePop } from '../utils/sound';
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
} from 'lucide-react';
import gmailIcon from '../assets/images/strawberry_gmail_icon_1789301479320.jpg';

export const GmailView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
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

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setIsConnected(true);
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
        await loadEmails('label:INBOX');
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err.message || 'Could not connect to Google account');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    playCutePop();
    await logoutGoogle();
    setCurrentUser(null);
    setIsConnected(false);
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleSelectMessage = async (summary: GmailMessageSummary) => {
    playCutePop();
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
      await sendGmailMessage(toInput, subjectInput, bodyInput);
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

  return (
    <div className="space-y-5">
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
              {isConnected && (
                <span className="px-2 py-0.5 bg-[#e11d48] text-white text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Synced
                </span>
              )}
            </div>
            <p className="text-xs text-[#be123c] mt-0.5">
              Access your college announcements, professor notices, and send coursework queries 🍓
            </p>
          </div>
        </div>

        {/* Auth Controls */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 bg-white/90 px-3 py-1.5 rounded-xl border border-[#bfdbfe] shadow-2xs">
              <span className="text-xs text-[#1e3a8a] font-medium truncate max-w-[140px]">
                {currentUser?.email || 'Google Account'}
              </span>
              <button
                onClick={handleDisconnect}
                title="Sign out from Gmail"
                className="text-xs text-[#ef4444] hover:text-[#b91c1c] p-1 rounded-md hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-gradient-to-r from-[#2563eb] to-[#ec4899] hover:from-[#1d4ed8] hover:to-[#db2777] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Connecting...' : 'Connect Gmail'}</span>
            </button>
          )}

          {isConnected && (
            <button
              onClick={() => setIsComposing(true)}
              className="bg-gradient-to-r from-[#ec4899] to-[#f43f5e] hover:from-[#db2777] hover:to-[#e11d48] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Compose</span>
            </button>
          )}
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

      {/* When not connected view */}
      {!isConnected ? (
        <div className="bg-white/80 rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-[#cbd5e1] space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#f0f9ff] p-2 border border-[#bae6fd] shadow-sm flex items-center justify-center">
            <img
              src={gmailIcon}
              alt="Gmail Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
          <div>
            <h3 className="font-serif-title font-bold text-lg text-[#1e293b]">
              Connect Your Campus Gmail
            </h3>
            <p className="text-xs text-[#64748b] max-w-md mx-auto mt-1">
              Read important course updates, deadlines from professors, and send emails directly from your cute stationery dashboard.
            </p>
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        </div>
      ) : (
        /* Connected Mailbox Interface */
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
                📥 Inbox
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
                🎓 Campus / Course
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
                className="p-2 bg-white border border-[#cbd5e1] text-[#475569] hover:text-[#1e3a8a] rounded-xl hover:bg-slate-50 transition-colors shrink-0"
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
                  className="flex items-center space-x-1.5 text-xs font-bold text-[#3b82f6] hover:text-[#1d4ed8]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Inbox</span>
                </button>
                <span className="text-[11px] text-[#64748b]">
                  {selectedMessage.date}
                </span>
              </div>

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
                <button
                  onClick={() => {
                    setToInput(selectedMessage.from);
                    setSubjectInput(`Re: ${selectedMessage.subject}`);
                    setIsComposing(true);
                  }}
                  className="bg-[#2563eb] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-[#1d4ed8] transition-colors"
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
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`bg-white rounded-xl p-3.5 border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs hover:border-[#3b82f6]/40 ${
                      msg.isUnread
                        ? 'border-[#93c5fd] bg-[#f0f9ff]/40 font-semibold'
                        : 'border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          msg.isUnread ? 'bg-[#2563eb]' : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-[#0f172a] font-bold truncate">
                            {msg.from}
                          </span>
                          <span className="text-[10px] text-[#94a3b8] shrink-0">
                            {msg.date.split(' ').slice(1, 4).join(' ') || msg.date}
                          </span>
                        </div>
                        <p className="text-xs text-[#1e293b] font-medium truncate mt-0.5">
                          {msg.subject}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                          {msg.snippet}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#cbd5e1] shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
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
                className="text-[#94a3b8] hover:text-[#0f172a] text-sm"
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
                  Sent from your connected Google account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    To (Recipient):
                  </label>
                  <input
                    type="email"
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
                    placeholder="e.g., Question regarding Assignment 3..."
                    className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#3b82f6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">
                    Message:
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    placeholder="Dear Professor, I have a quick question about..."
                    className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#3b82f6] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-4 py-2 text-xs text-[#64748b] hover:text-[#0f172a] font-medium"
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
