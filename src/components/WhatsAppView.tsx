import React, { useState, useEffect, useRef } from 'react';
import {
  WhatsAppChat,
  WhatsAppMessage,
  WhatsAppSummary,
  WhatsAppGroupCategory,
  TodoItem,
  CalendarEvent,
} from '../types';
import { summarizeWhatsAppChat, parseWhatsAppExport } from '../services/whatsappService';
import { playCutePop } from '../utils/sound';
import {
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckSquare,
  Calendar as CalendarIcon,
  Clock,
  Send,
  Upload,
  RefreshCw,
  Search,
  Users,
  User,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  FileText,
  Bookmark,
  CheckCircle2,
  GraduationCap,
  Sparkle,
  X,
  PlusCircle,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import whatsappIcon from '../assets/images/whatsapp_icon_1789302930853.jpg';

interface WhatsAppViewProps {
  initialChats: WhatsAppChat[];
  onAddTodo?: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onAddCalendarEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
}

type ModalMode = 'class' | 'club' | null;

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  initialChats,
  onAddTodo,
  onAddCalendarEvent,
}) => {
  const [chats, setChats] = useState<WhatsAppChat[]>(() => {
    const saved = localStorage.getItem('aesthetic_whatsapp_chats');
    return saved ? JSON.parse(saved) : initialChats;
  });

  const [selectedChatId, setSelectedChatId] = useState<string>(
    chats[0]?.id || 'wa-chat-1'
  );

  const [summaries, setSummaries] = useState<Record<string, WhatsAppSummary>>(() => {
    const saved = localStorage.getItem('aesthetic_whatsapp_summaries');
    return saved ? JSON.parse(saved) : {};
  });

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'class' | 'club'>('all');
  const [summarizing, setSummarizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  // Add Group Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [groupName, setGroupName] = useState('');
  const [groupCodeOrRole, setGroupCodeOrRole] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupIcon, setGroupIcon] = useState('');
  const [initialAnnouncement, setInitialAnnouncement] = useState('');
  const [modalImportText, setModalImportText] = useState('');

  // File import ref for uploading export
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileImportCategory, setFileImportCategory] = useState<WhatsAppGroupCategory>('general');

  const selectedChat = chats.find((c) => c.id === selectedChatId) || chats[0];
  const activeSummary = selectedChat ? summaries[selectedChat.id] : null;

  useEffect(() => {
    localStorage.setItem('aesthetic_whatsapp_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('aesthetic_whatsapp_summaries', JSON.stringify(summaries));
  }, [summaries]);

  // Trigger automatic initial summary for the selected chat if not already generated
  useEffect(() => {
    if (selectedChat && !summaries[selectedChat.id] && selectedChat.messages.length > 0) {
      handleGenerateSummary(selectedChat);
    }
  }, [selectedChatId]);

  const handleGenerateSummary = async (chatToSummarize = selectedChat) => {
    if (!chatToSummarize) return;
    playCutePop();
    setSummarizing(true);

    try {
      const summary = await summarizeWhatsAppChat(chatToSummarize);
      setSummaries((prev) => ({
        ...prev,
        [chatToSummarize.id]: summary,
      }));
    } catch (err: any) {
      console.warn('AI summary error, creating structured fallback:', err);
      // Fallback extraction of important messages
      const urgentMsgs = chatToSummarize.messages.filter(
        (m) => m.isImportant || m.priority === 'urgent'
      );
      const fallbackSummary: WhatsAppSummary = {
        chatId: chatToSummarize.id,
        overview: `Summary of discussion in ${chatToSummarize.chatName}. Members discussed essential notifications, schedule updates, and upcoming deliverables.`,
        urgentAlerts:
          urgentMsgs.length > 0
            ? urgentMsgs.slice(0, 2).map((m) => m.text)
            : ['Check group pinned messages for recent announcements'],
        actionItems: [
          'Verify group submission or meeting attendance before deadline',
          'Review notes and lecture/event slides',
        ],
        deadlines: ['Upcoming assignment or committee milestone this week'],
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSummaries((prev) => ({
        ...prev,
        [chatToSummarize.id]: fallbackSummary,
      }));
    } finally {
      setSummarizing(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChat) return;

    playCutePop();
    const cleanText = newMessageText.trim();
    const lower = cleanText.toLowerCase();
    const isUrgent =
      lower.includes('due') ||
      lower.includes('deadline') ||
      lower.includes('urgent') ||
      lower.includes('exam') ||
      lower.includes('submit') ||
      lower.includes('meeting') ||
      lower.includes('asap');

    const newMsg: WhatsAppMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'me',
      senderName: 'You',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isImportant: isUrgent,
      priority: isUrgent ? 'urgent' : undefined,
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              lastMessageTime: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setNewMessageText('');
  };

  const handleOpenModal = (mode: ModalMode) => {
    playCutePop();
    setModalMode(mode);
    setGroupName('');
    setGroupCodeOrRole('');
    setGroupDescription('');
    setGroupIcon(mode === 'class' ? '📖' : '🌱');
    setInitialAnnouncement('');
    setModalImportText('');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !modalMode) return;

    playCutePop();
    const isClass = modalMode === 'class';
    const cleanName = groupName.trim();
    const newChatId = `wa-group-${Date.now()}`;

    // Generate initial starter messages
    const starterMessages: WhatsAppMessage[] = [];

    // Optional user announcement or default greeting
    if (initialAnnouncement.trim()) {
      const lower = initialAnnouncement.toLowerCase();
      const isUrgent =
        lower.includes('due') ||
        lower.includes('deadline') ||
        lower.includes('urgent') ||
        lower.includes('exam') ||
        lower.includes('meeting');

      starterMessages.push({
        id: `msg-start-${Date.now()}-1`,
        sender: 'group-lead',
        senderName: isClass ? 'Course TA / Rep' : 'Club Lead',
        text: initialAnnouncement.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isImportant: isUrgent,
        priority: isUrgent ? 'urgent' : 'info',
      });
    } else {
      starterMessages.push({
        id: `msg-start-${Date.now()}-1`,
        sender: 'system',
        senderName: 'Group Admin',
        text: isClass
          ? `Welcome to the official ${cleanName} class study squad! Post syllabus queries, lecture doubts, and homework discussions here.`
          : `Welcome to the ${cleanName} WhatsApp community! Stay tuned for event agendas, club meetings, and workshop signups.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isImportant: false,
      });
    }

    // If user provided raw chat export text inside the modal
    if (modalImportText.trim()) {
      const parsed = parseWhatsAppExport(
        `${cleanName}.txt`,
        modalImportText,
        modalMode,
        {
          courseCode: isClass ? groupCodeOrRole : undefined,
          clubRole: !isClass ? groupCodeOrRole : undefined,
          customName: cleanName,
        }
      );
      if (parsed.messages.length > 0) {
        starterMessages.push(...parsed.messages);
      }
    }

    const newChat: WhatsAppChat = {
      id: newChatId,
      chatName: cleanName,
      type: 'group',
      category: modalMode,
      courseCode: isClass ? groupCodeOrRole.trim() : undefined,
      clubRole: !isClass ? groupCodeOrRole.trim() : undefined,
      avatar: groupIcon.trim() || (isClass ? '📖' : '🌱'),
      unreadCount: starterMessages.filter((m) => m.isImportant).length,
      lastMessageTime: 'Just now',
      description:
        groupDescription.trim() ||
        (isClass
          ? `Class group for ${groupCodeOrRole || cleanName}`
          : `Society circle for ${groupCodeOrRole || cleanName}`),
      messages: starterMessages,
    };

    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    setModalMode(null);

    // Run AI summarization on the new group
    handleGenerateSummary(newChat);
  };

  const handleTriggerFileInput = (category: WhatsAppGroupCategory) => {
    setFileImportCategory(category);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playCutePop();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsedChat = parseWhatsAppExport(file.name, content, fileImportCategory);
        setChats((prev) => [parsedChat, ...prev]);
        setSelectedChatId(parsedChat.id);
        handleGenerateSummary(parsedChat);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Convert an extracted action item into an app To-Do task
  const handleTransferToTodo = (actionText: string) => {
    playCutePop();
    if (onAddTodo) {
      onAddTodo({
        title: actionText,
        completed: false,
        priority: 'high',
        category: selectedChat?.category === 'club' ? 'personal' : 'academic',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        notes: `Extracted from WhatsApp: ${selectedChat?.chatName}`,
      });
      setCopiedAction(actionText);
      setTimeout(() => setCopiedAction(null), 2000);
    }
  };

  // Filter chats by category
  const filteredChats = chats.filter((chat) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'class') return chat.category === 'class';
    if (categoryFilter === 'club') return chat.category === 'club';
    return true;
  });

  const filteredMessages = selectedChat
    ? selectedChat.messages.filter((m) => {
        const matchesSearch =
          m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesImportance = showOnlyImportant ? m.isImportant : true;
        return matchesSearch && matchesImportance;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt"
        className="hidden"
      />

      {/* WhatsApp Header Banner with 2 Dedicated Add Options */}
      <div className="bg-gradient-to-r from-[#f0fdf4] via-[#ecfdf5] to-[#f7fee7] rounded-2xl p-4 sm:p-5 border border-[#bbf7d0] shadow-2xs flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 w-full xl:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm border border-[#86efac] flex items-center justify-center shrink-0">
            <img
              src={whatsappIcon}
              alt="Cute WhatsApp Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif-title font-bold text-xl text-[#14532d]">
                WhatsApp Campus Circles
              </h2>
              <span className="px-2 py-0.5 bg-[#16a34a] text-white text-[10px] font-bold rounded-full inline-flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5" />
                AI Summarizer Active
              </span>
            </div>
            <p className="text-xs text-[#15803d] mt-0.5">
              Organize your academic courses and extracurricular club groups with automated AI message distillation.
            </p>
          </div>
        </div>

        {/* Action Controls: Distinct Options to Add Class Group vs Club/Society Group */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
          {/* Option 1: Add Class Group */}
          <button
            onClick={() => handleOpenModal('class')}
            className="bg-white hover:bg-emerald-50 text-[#166534] border-2 border-[#86efac] hover:border-[#16a34a] px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Add a new course or lecture study group"
          >
            <GraduationCap className="w-4 h-4 text-[#16a34a]" />
            <span>+ Add Class Group</span>
          </button>

          {/* Option 2: Add Club & Society Group */}
          <button
            onClick={() => handleOpenModal('club')}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="Add a student society, sports team, or campus club"
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>+ Add Club & Society</span>
          </button>

          {/* Direct WhatsApp Web Link */}
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Open WhatsApp Web in new tab"
            className="p-2 bg-white border border-[#bbf7d0] text-[#166534] hover:text-[#14532d] rounded-xl hover:bg-emerald-50 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Chat Channels List & Filter Tabs */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl p-3.5 border border-[#dcfce7] shadow-2xs">
            {/* Header & Category Filters */}
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#16a34a]" />
                Groups ({filteredChats.length})
              </h3>

              {/* Quick File Import Dropdown */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleTriggerFileInput('class')}
                  title="Import .txt into Class group"
                  className="p-1 rounded-md text-[10px] text-[#166534] hover:bg-emerald-50 border border-[#bbf7d0] font-semibold"
                >
                  📥 Class .txt
                </button>
                <button
                  onClick={() => handleTriggerFileInput('club')}
                  title="Import .txt into Club group"
                  className="p-1 rounded-md text-[10px] text-[#166534] hover:bg-emerald-50 border border-[#bbf7d0] font-semibold"
                >
                  📥 Club .txt
                </button>
              </div>
            </div>

            {/* Category Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#f0fdf4] rounded-xl mb-3 border border-[#dcfce7]">
              <button
                onClick={() => {
                  playCutePop();
                  setCategoryFilter('all');
                }}
                className={`text-[11px] font-bold py-1 px-2 rounded-lg transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-white text-[#14532d] shadow-2xs'
                    : 'text-[#166534] hover:text-[#14532d]'
                }`}
              >
                All Groups
              </button>
              <button
                onClick={() => {
                  playCutePop();
                  setCategoryFilter('class');
                }}
                className={`text-[11px] font-bold py-1 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  categoryFilter === 'class'
                    ? 'bg-white text-[#14532d] shadow-2xs'
                    : 'text-[#166534] hover:text-[#14532d]'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                Classes
              </button>
              <button
                onClick={() => {
                  playCutePop();
                  setCategoryFilter('club');
                }}
                className={`text-[11px] font-bold py-1 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  categoryFilter === 'club'
                    ? 'bg-white text-[#14532d] shadow-2xs'
                    : 'text-[#166534] hover:text-[#14532d]'
                }`}
              >
                <Sparkle className="w-3 h-3" />
                Clubs
              </button>
            </div>

            {/* Chats List */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="text-center py-6 px-3">
                  <p className="text-xs text-[#64748b] font-medium">
                    No {categoryFilter === 'class' ? 'class' : 'club'} groups found yet.
                  </p>
                  <button
                    onClick={() => handleOpenModal(categoryFilter === 'class' ? 'class' : 'club')}
                    className="mt-2 text-xs font-bold text-[#16a34a] hover:underline"
                  >
                    + Create one now
                  </button>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isSelected = chat.id === selectedChatId;
                  const importantCount = chat.messages.filter((m) => m.isImportant).length;
                  const isClass = chat.category === 'class';
                  const isClub = chat.category === 'club';

                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        playCutePop();
                        setSelectedChatId(chat.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#ecfdf5] border border-[#86efac] text-[#065f46] shadow-2xs'
                          : 'hover:bg-[#f0fdf4] text-[#334155] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-lg shrink-0 p-1.5 rounded-lg bg-white shadow-2xs border border-[#dcfce7]">
                          {chat.avatar || (isClass ? '📖' : isClub ? '🌱' : '💬')}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold truncate">
                              {chat.chatName}
                            </h4>
                            {isClass && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#e0f2fe] text-[#0369a1] font-semibold shrink-0">
                                {chat.courseCode || 'Class'}
                              </span>
                            )}
                            {isClub && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#fef3c7] text-[#92400e] font-semibold shrink-0">
                                Club
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#64748b] truncate mt-0.5">
                            {chat.messages[chat.messages.length - 1]?.text || 'No messages'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 space-y-1">
                        <span className="text-[9px] text-[#94a3b8]">
                          {chat.lastMessageTime}
                        </span>
                        {importantCount > 0 && (
                          <span className="px-1.5 py-0.2 bg-[#ef4444] text-white text-[9px] font-bold rounded-full">
                            {importantCount} alert{importantCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Creator Triggers Card */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOpenModal('class')}
              className="p-3 bg-white rounded-xl border border-[#bbf7d0] hover:border-[#16a34a] hover:bg-emerald-50/50 transition-all text-left group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center space-x-1.5 text-[#166534] font-bold text-xs mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#16a34a] group-hover:scale-110 transition-transform" />
                <span>Class Group</span>
              </div>
              <p className="text-[10px] text-[#64748b] leading-tight">
                Labs, lectures, and midterm study circles.
              </p>
            </button>

            <button
              onClick={() => handleOpenModal('club')}
              className="p-3 bg-white rounded-xl border border-[#bbf7d0] hover:border-[#16a34a] hover:bg-emerald-50/50 transition-all text-left group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center space-x-1.5 text-[#166534] font-bold text-xs mb-1">
                <Sparkle className="w-3.5 h-3.5 text-[#16a34a] group-hover:scale-110 transition-transform" />
                <span>Club Group</span>
              </div>
              <p className="text-[10px] text-[#64748b] leading-tight">
                Societies, teams, and social chapters.
              </p>
            </button>
          </div>
        </div>

        {/* Right Column: Chat Feed & AI Summary Deck */}
        <div className="lg:col-span-8 space-y-4">
          {/* AI SUMMARY BRIEFING DECK */}
          {selectedChat && (
            <div className="bg-gradient-to-b from-[#f7fee7] to-[#f0fdf4] rounded-2xl p-4 sm:p-5 border-2 border-[#86efac] shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#bbf7d0]">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-[#86efac] flex items-center justify-center p-1">
                    <Sparkles className="w-4 h-4 text-[#16a34a]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif-title font-bold text-sm text-[#14532d]">
                        AI Important Message Summary
                      </h3>
                      {selectedChat.category === 'class' && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#0284c7] text-white font-bold rounded-full">
                          Class Focus
                        </span>
                      )}
                      {selectedChat.category === 'club' && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#d97706] text-white font-bold rounded-full">
                          Society Focus
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#166534]">
                      {activeSummary?.generatedAt
                        ? `Updated at ${activeSummary.generatedAt}`
                        : 'Instant Campus Analysis'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateSummary(selectedChat)}
                  disabled={summarizing}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#15803d] hover:text-[#14532d] bg-white px-2.5 py-1 rounded-lg border border-[#bbf7d0] shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${summarizing ? 'animate-spin' : ''}`} />
                  <span>Refresh AI Brief</span>
                </button>
              </div>

              {summarizing ? (
                <div className="py-6 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#16a34a] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#14532d]">
                    Distilling important messages with Gemini...
                  </p>
                  <p className="text-[11px] text-[#15803d]">
                    Scanning {selectedChat.chatName} for deadlines, urgent announcements, and tasks.
                  </p>
                </div>
              ) : activeSummary ? (
                <div className="space-y-3.5">
                  {/* Overview statement */}
                  <p className="text-xs text-[#14532d] leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-[#bbf7d0]/60">
                    {activeSummary.overview}
                  </p>

                  {/* 3 Bento Metric Blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Urgent Alerts */}
                    <div className="bg-white rounded-xl p-3 border border-[#fecaca] shadow-2xs">
                      <div className="flex items-center space-x-1.5 text-[#b91c1c] font-bold text-xs mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                        <span>Urgent Alerts</span>
                      </div>
                      {activeSummary.urgentAlerts.length > 0 ? (
                        <ul className="space-y-1">
                          {activeSummary.urgentAlerts.map((alert, i) => (
                            <li key={i} className="text-[11px] text-[#7f1d1d] leading-snug">
                              • {alert}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-[#9ca3af]">No urgent alerts detected.</p>
                      )}
                    </div>

                    {/* Action Items */}
                    <div className="bg-white rounded-xl p-3 border border-[#fed7aa] shadow-2xs">
                      <div className="flex items-center space-x-1.5 text-[#c2410c] font-bold text-xs mb-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-[#f97316]" />
                        <span>Action Items</span>
                      </div>
                      {activeSummary.actionItems.length > 0 ? (
                        <div className="space-y-1.5">
                          {activeSummary.actionItems.map((action, i) => (
                            <div
                              key={i}
                              className="text-[11px] text-[#7c2d12] flex items-start justify-between gap-1"
                            >
                              <span>• {action}</span>
                              {onAddTodo && (
                                <button
                                  onClick={() => handleTransferToTodo(action)}
                                  title="Add to your Campus To-Do List"
                                  className="text-[9px] bg-[#ffedd5] text-[#9a3412] px-1.5 py-0.5 rounded-md hover:bg-[#fed7aa] shrink-0 font-bold cursor-pointer"
                                >
                                  {copiedAction === action ? '✓ Added' : '+ To-Do'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#9ca3af]">No action items pending.</p>
                      )}
                    </div>

                    {/* Deadlines Mentioned */}
                    <div className="bg-white rounded-xl p-3 border border-[#bbf7d0] shadow-2xs">
                      <div className="flex items-center space-x-1.5 text-[#15803d] font-bold text-xs mb-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span>Deadlines</span>
                      </div>
                      {activeSummary.deadlines.length > 0 ? (
                        <ul className="space-y-1">
                          {activeSummary.deadlines.map((dl, i) => (
                            <li key={i} className="text-[11px] text-[#14532d] leading-snug">
                              • {dl}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-[#9ca3af]">No specific deadlines mentioned.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ACTIVE CHAT FEED */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs flex flex-col h-[480px]">
            {/* Chat Feed Header */}
            <div className="p-3.5 border-b border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-2xl">{selectedChat?.avatar || '💬'}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#0f172a] truncate">
                      {selectedChat?.chatName}
                    </h4>
                    {selectedChat?.courseCode && (
                      <span className="text-[9px] bg-[#e0f2fe] text-[#0369a1] px-1.5 py-0.2 rounded-md font-semibold">
                        {selectedChat.courseCode}
                      </span>
                    )}
                    {selectedChat?.clubRole && (
                      <span className="text-[9px] bg-[#fef3c7] text-[#92400e] px-1.5 py-0.2 rounded-md font-semibold">
                        {selectedChat.clubRole}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#64748b] truncate">
                    {selectedChat?.description || 'Active WhatsApp channel'}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setShowOnlyImportant(!showOnlyImportant)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    showOnlyImportant
                      ? 'bg-[#ef4444] text-white'
                      : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Important Only</span>
                </button>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chat..."
                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg pl-6 pr-2.5 py-1 text-xs text-[#0f172a] focus:outline-hidden focus:ring-1 focus:ring-[#16a34a] w-32 sm:w-40"
                  />
                  <Search className="w-3 h-3 text-[#94a3b8] absolute left-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]/50">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <MessageSquare className="w-8 h-8 text-[#cbd5e1] mb-1.5" />
                  <p className="text-xs font-bold text-[#64748b]">No messages match criteria</p>
                  <p className="text-[11px] text-[#94a3b8]">
                    Try toggling off &quot;Important Only&quot; or clearing your search.
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs relative ${
                          isMe
                            ? 'bg-[#dcfce7] text-[#14532d] rounded-tr-xs border border-[#86efac]/70'
                            : msg.isImportant
                            ? 'bg-[#fef2f2] text-[#7f1d1d] rounded-tl-xs border border-[#fca5a5]'
                            : 'bg-white text-[#1e293b] rounded-tl-xs border border-[#e2e8f0]'
                        }`}
                      >
                        {!isMe && (
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-[11px] text-[#0f172a]">
                              {msg.senderName}
                            </span>
                            {msg.priority && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                                  msg.priority === 'urgent'
                                    ? 'bg-[#ef4444] text-white'
                                    : msg.priority === 'action_required'
                                    ? 'bg-[#f97316] text-white'
                                    : 'bg-[#3b82f6] text-white'
                                }`}
                              >
                                {msg.priority === 'urgent'
                                  ? 'Urgent'
                                  : msg.priority === 'action_required'
                                  ? 'Action'
                                  : 'Notice'}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Action buttons if action item or deadline detected */}
                        {(msg.actionItem || msg.deadlineMentioned) && (
                          <div className="mt-2 pt-1.5 border-t border-black/10 flex items-center justify-between gap-2">
                            {msg.deadlineMentioned && (
                              <span className="text-[10px] font-semibold flex items-center gap-1 text-[#b91c1c]">
                                <Clock className="w-3 h-3" />
                                {msg.deadlineMentioned}
                              </span>
                            )}
                            {msg.actionItem && onAddTodo && (
                              <button
                                onClick={() => handleTransferToTodo(msg.actionItem!)}
                                className="text-[10px] bg-white/80 hover:bg-white text-[#0f172a] px-2 py-0.5 rounded-md font-bold shadow-2xs flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                Save as Task
                              </button>
                            )}
                          </div>
                        )}

                        <span
                          className={`block text-[9px] mt-1.5 text-right ${
                            isMe ? 'text-[#166534]/70' : 'text-[#94a3b8]'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Send Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-[#f1f5f9] bg-white rounded-b-2xl flex items-center space-x-2"
            >
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={
                  selectedChat?.category === 'class'
                    ? 'Post homework question, lab result, or exam doubt...'
                    : selectedChat?.category === 'club'
                    ? 'Coordinate club meetup, gear pickup, or event details...'
                    : 'Reply to WhatsApp circle...'
                }
                className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
              />
              <button
                type="submit"
                className="bg-[#16a34a] hover:bg-[#15803d] text-white p-2 rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL DIALOG: ADD CLASS GROUP / ADD CLUB & SOCIETY GROUP */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#bbf7d0] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                    modalMode === 'class'
                      ? 'bg-[#e0f2fe] text-[#0284c7]'
                      : 'bg-[#fef3c7] text-[#b45309]'
                  }`}
                >
                  {modalMode === 'class' ? <GraduationCap className="w-5 h-5" /> : <Sparkle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-base text-[#0f172a]">
                    {modalMode === 'class' ? 'Add Class Study Group' : 'Add Club & Society Group'}
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    {modalMode === 'class'
                      ? 'Organize coursework, labs, syllabus notes, and problem sets.'
                      : 'Keep track of student society meetups, budgets, and campus events.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalMode(null)}
                className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-lg hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  {modalMode === 'class' ? 'Class / Subject Group Name' : 'Club / Society Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={
                    modalMode === 'class'
                      ? 'e.g. Organic Chemistry II Study Squad'
                      : 'e.g. Robotics & AI Builders Society'
                  }
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              {/* Course Code or Committee / Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    {modalMode === 'class' ? 'Course Code' : 'Your Role / Division'}
                  </label>
                  <input
                    type="text"
                    value={groupCodeOrRole}
                    onChange={(e) => setGroupCodeOrRole(e.target.value)}
                    placeholder={modalMode === 'class' ? 'e.g. CHEM-220' : 'e.g. Events Committee'}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
                  />
                </div>

                {/* Emoji / Icon */}
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    Badge Emoji
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      maxLength={2}
                      value={groupIcon}
                      onChange={(e) => setGroupIcon(e.target.value)}
                      placeholder={modalMode === 'class' ? '📖' : '🌱'}
                      className="w-12 text-center bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-2 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
                    />
                    <div className="flex space-x-1">
                      {(modalMode === 'class'
                        ? ['📖', '🧪', '📐', '💻']
                        : ['🌱', '🎭', '⚽', '🎨']
                      ).map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setGroupIcon(emo)}
                          className="p-1.5 text-xs hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Description / Study Objective
                </label>
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder={
                    modalMode === 'class'
                      ? 'e.g. Weekly problem set solutions and midterms review.'
                      : 'e.g. General body meetings, fall hackathon team, and outreach.'
                  }
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              {/* Initial Announcement or Pinned Note */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  First Pinned Announcement / Reminder
                </label>
                <textarea
                  rows={2}
                  value={initialAnnouncement}
                  onChange={(e) => setInitialAnnouncement(e.target.value)}
                  placeholder={
                    modalMode === 'class'
                      ? 'e.g. ⚠️ Chapter 3 lab report due this Thursday at 11:59 PM on Canvas!'
                      : 'e.g. 📢 General society meeting this Wednesday 6 PM in Student Center 204.'
                  }
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-2.5 text-xs text-[#0f172a] focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
                />
              </div>

              {/* Optional: Paste exported chat text */}
              <div className="pt-1">
                <details className="text-[11px] text-[#64748b]">
                  <summary className="cursor-pointer font-bold text-[#166534] hover:underline">
                    Optional: Paste existing WhatsApp transcript (.txt)
                  </summary>
                  <textarea
                    rows={3}
                    value={modalImportText}
                    onChange={(e) => setModalImportText(e.target.value)}
                    placeholder="Paste exported WhatsApp chat logs here to auto-import prior discussion..."
                    className="w-full mt-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-2 text-[10px] text-[#0f172a] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#16a34a]"
                  />
                </details>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#16a34a] hover:bg-[#15803d] rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>
                    Create {modalMode === 'class' ? 'Class Group' : 'Club Group'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
