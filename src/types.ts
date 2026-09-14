export type ActiveTab = 'chat' | 'calendar' | 'todo' | 'gmail' | 'whatsapp' | 'notion' | 'resources' | 'study';

export interface WhatsAppPollOption {
  id: string;
  text: string;
  votes: number;
  voters?: string[];
}

export interface WhatsAppPoll {
  id: string;
  question: string;
  options: WhatsAppPollOption[];
  totalVotes: number;
  isClosed?: boolean;
  createdAt?: string;
  creatorName?: string;
  userVotedOptionId?: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: string;
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isImportant?: boolean;
  priority?: 'urgent' | 'action_required' | 'info';
  deadlineMentioned?: string;
  actionItem?: string;
  poll?: WhatsAppPoll;
}

export type WhatsAppGroupCategory = 'class' | 'club' | 'general';

export interface WhatsAppChat {
  id: string;
  chatName: string;
  type: 'group' | 'direct';
  category?: WhatsAppGroupCategory;
  courseCode?: string;
  clubRole?: string;
  avatar?: string;
  unreadCount: number;
  lastMessageTime: string;
  description?: string;
  messages: WhatsAppMessage[];
}

export interface ScheduledClass {
  id: string;
  source: 'whatsapp_summary' | 'whatsapp_chat' | 'gmail' | 'calendar';
  sourceTitle: string; // e.g., "BioChem 204 Lab Squad" or "Prof. Vance (Gmail)"
  className: string; // e.g., "CHEM-204 Makeup Lab"
  courseCode?: string;
  instructorOrSender?: string;
  dayOrDate: string; // e.g. "Wednesday" or "2026-09-16"
  startTime: string; // e.g. "03:00 PM"
  endTime: string; // e.g. "04:30 PM"
  locationOrRoom?: string; // e.g. "Sci-Lab 201"
  snippet: string; // Context text
  chatId?: string;
  emailId?: string;
}

export interface ClassClash {
  id: string;
  classA: ScheduledClass;
  classB: ScheduledClass;
  overlapDescription: string;
  severity: 'critical' | 'high';
  detectedAt: string;
  source: 'whatsapp' | 'gmail' | 'cross_service';
  resolved?: boolean;
}

export interface PollSummaryItem {
  id?: string;
  question: string;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  breakdown: { option: string; votes: number; percentage: number; voters?: string[] }[];
  status: 'active' | 'closed';
  consensus: string;
  userVote?: string;
}

export interface WhatsAppSummary {
  chatId: string;
  overview: string;
  urgentAlerts: string[];
  actionItems: string[];
  deadlines: string[];
  generatedAt: string;
  clashesDetected?: ClassClash[];
  activePolls?: PollSummaryItem[];
}

export interface NotionPageItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  lastEditedTime: string;
  parentType: 'workspace' | 'page_id' | 'database_id';
  snippet?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category: 'academic' | 'campus' | 'personal' | 'urgent';
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'berry';
  text: string;
  timestamp: string;
  mode?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: 'exam' | 'assignment' | 'study' | 'review' | 'rest';
  color: string;
  completed?: boolean;
  notes?: string;
  googleEventId?: string;
  isGoogleCalendar?: boolean;
  htmlLink?: string;
}

export interface Flashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  hint?: string;
  mastered: boolean;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  date: string;
  color: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: 'cheatsheets' | 'tools' | 'academic' | 'templates';
  url: string;
  iconName: string;
  isFavorite?: boolean;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  type: 'rain' | 'lofi' | 'cafe' | 'fire' | 'birds';
}
