import { WhatsAppChat, WhatsAppSummary, WhatsAppMessage } from '../types';

/**
 * Summarizes a WhatsApp chat using the backend Gemini AI endpoint
 */
export async function summarizeWhatsAppChat(
  chat: WhatsAppChat
): Promise<WhatsAppSummary> {
  const res = await fetch('/api/whatsapp/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatName: chat.chatName,
      messages: chat.messages,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Summary request failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    chatId: chat.id,
    overview: data.overview || 'Summary unavailable.',
    urgentAlerts: data.urgentAlerts || [],
    actionItems: data.actionItems || [],
    deadlines: data.deadlines || [],
    activePolls: data.activePolls || [],
    generatedAt: data.generatedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Parses exported .txt chat files from WhatsApp (e.g. "WhatsApp Chat with BioChem 204.txt")
 */
export function parseWhatsAppExport(
  fileName: string,
  text: string,
  category: 'class' | 'club' | 'general' = 'general',
  metadata?: { courseCode?: string; clubRole?: string; customName?: string }
): WhatsAppChat {
  const lines = text.split('\n');
  const messages: WhatsAppMessage[] = [];
  const defaultName = fileName.replace(/^WhatsApp Chat with\s+/i, '').replace(/\.txt$/i, '') || 'Imported WhatsApp Chat';
  const cleanName = metadata?.customName?.trim() || defaultName;

  // Common WhatsApp regex patterns:
  // [13/09/2026, 10:15:30] Sophia Chen: message
  // 9/13/26, 10:15 AM - Sophia Chen: message
  const standardRegex = /(?:\[?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}[,\s]+[\d: ]+(?:[APap][Mm])?)\]?(?:\s*-\s*|\s+))([^:]+):\s*(.*)/;

  let currentMsg: WhatsAppMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(standardRegex);
    if (match) {
      const [, timestamp, senderName, content] = match;
      const cleanSender = senderName.trim();
      const cleanContent = content.trim();

      // Heuristic for importance
      const lower = cleanContent.toLowerCase();
      const isUrgent =
        lower.includes('due') ||
        lower.includes('deadline') ||
        lower.includes('urgent') ||
        lower.includes('important') ||
        lower.includes('exam') ||
        lower.includes('test') ||
        lower.includes('meeting') ||
        lower.includes('submit') ||
        lower.includes('⚠️') ||
        lower.includes('📌');

      let priority: 'urgent' | 'action_required' | 'info' | undefined = undefined;
      if (lower.includes('urgent') || lower.includes('⚠️') || lower.includes('asap')) {
        priority = 'urgent';
      } else if (lower.includes('submit') || lower.includes('review') || lower.includes('bring') || lower.includes('hw')) {
        priority = 'action_required';
      } else if (isUrgent) {
        priority = 'info';
      }

      currentMsg = {
        id: `msg-import-${Date.now()}-${i}`,
        sender: cleanSender.toLowerCase().replace(/\s+/g, '-'),
        senderName: cleanSender,
        text: cleanContent,
        timestamp: timestamp.trim(),
        isImportant: isUrgent,
        priority,
      };
      messages.push(currentMsg);
    } else if (currentMsg) {
      // Append multi-line messages
      currentMsg.text += `\n${line}`;
    }
  }

  // Fallback if formatting doesn't strictly match standard export
  if (messages.length === 0 && text.trim().length > 0) {
    const rawParagraphs = text.split('\n\n').filter((p) => p.trim().length > 0);
    rawParagraphs.forEach((para, idx) => {
      messages.push({
        id: `msg-raw-${Date.now()}-${idx}`,
        sender: 'group-member',
        senderName: `Member ${idx + 1}`,
        text: para.trim(),
        timestamp: 'Imported',
        isImportant: para.toLowerCase().includes('due') || para.toLowerCase().includes('exam'),
      });
    });
  }

  const avatarIcon = category === 'class' ? '📖' : category === 'club' ? '🌿' : '💬';

  return {
    id: `wa-import-${Date.now()}`,
    chatName: cleanName,
    type: 'group',
    category,
    courseCode: metadata?.courseCode,
    clubRole: metadata?.clubRole,
    avatar: avatarIcon,
    unreadCount: messages.filter((m) => m.isImportant).length,
    lastMessageTime: 'Just now',
    description: metadata?.courseCode
      ? `Class study group for ${metadata.courseCode}. Imported from ${fileName}.`
      : metadata?.clubRole
      ? `Club group (${metadata.clubRole}). Imported from ${fileName}.`
      : `Imported from ${fileName} with ${messages.length} messages.`,
    messages,
  };
}
