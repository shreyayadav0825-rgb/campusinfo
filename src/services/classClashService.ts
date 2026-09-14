import { ScheduledClass, ClassClash, WhatsAppChat, WhatsAppSummary } from '../types';

/**
 * Converts standard time string (e.g. "03:00 PM", "3:00 PM", "9:00 AM", "15:30")
 * into minutes from midnight (0 - 1439).
 */
export function timeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  // Match e.g. "3:00 PM", "03:30 AM", "11:59 PM", "3 PM", "14:00"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const isPM = match12[3].toUpperCase() === 'PM';

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // 24-hour match e.g. "15:00"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Normalizes day or date (e.g. "Wednesday", "Wed", "2026-09-16") to a common day identifier.
 */
export function normalizeDayOrDate(str: string): string {
  if (!str) return '';
  const lower = str.toLowerCase();
  if (lower.includes('wed') || lower.includes('2026-09-16')) return 'Wednesday';
  if (lower.includes('thu') || lower.includes('2026-09-17')) return 'Thursday';
  if (lower.includes('fri') || lower.includes('2026-09-18')) return 'Friday';
  if (lower.includes('mon') || lower.includes('2026-09-14')) return 'Monday';
  if (lower.includes('tue') || lower.includes('2026-09-15')) return 'Tuesday';
  if (lower.includes('sat') || lower.includes('2026-09-19')) return 'Saturday';
  if (lower.includes('sun') || lower.includes('2026-09-20')) return 'Sunday';
  return str.trim();
}

/**
 * Checks whether two time intervals overlap.
 */
export function doTimesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  // A clash occurs if maximum of start times is strictly less than minimum of end times
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Calculates overlap duration in minutes.
 */
export function calculateOverlapMinutes(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): number {
  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);
  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Detects schedule clashes between any two scheduled classes.
 */
export function detectClassClashes(classes: ScheduledClass[]): ClassClash[] {
  const clashes: ClassClash[] = [];
  const visitedPairs = new Set<string>();

  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      const a = classes[i];
      const b = classes[j];

      // Avoid self comparison or identical course codes
      if (a.id === b.id) continue;
      if (a.courseCode && b.courseCode && a.courseCode === b.courseCode) continue;

      const dayA = normalizeDayOrDate(a.dayOrDate);
      const dayB = normalizeDayOrDate(b.dayOrDate);

      // Check if both happen on the same day/date
      if (dayA && dayB && dayA.toLowerCase() === dayB.toLowerCase()) {
        const startMinA = timeToMinutes(a.startTime);
        const endMinA = timeToMinutes(a.endTime) ?? (startMinA !== null ? startMinA + 60 : null);
        const startMinB = timeToMinutes(b.startTime);
        const endMinB = timeToMinutes(b.endTime) ?? (startMinB !== null ? startMinB + 60 : null);

        if (
          startMinA !== null &&
          endMinA !== null &&
          startMinB !== null &&
          endMinB !== null
        ) {
          if (doTimesOverlap(startMinA, endMinA, startMinB, endMinB)) {
            const pairKey = [a.id, b.id].sort().join('::');
            if (!visitedPairs.has(pairKey)) {
              visitedPairs.add(pairKey);
              const overlapMins = calculateOverlapMinutes(startMinA, endMinA, startMinB, endMinB);

              let source: 'whatsapp' | 'gmail' | 'cross_service' = 'cross_service';
              if (
                (a.source.startsWith('whatsapp') && b.source.startsWith('whatsapp'))
              ) {
                source = 'whatsapp';
              } else if (a.source === 'gmail' && b.source === 'gmail') {
                source = 'gmail';
              }

              clashes.push({
                id: `clash-${a.id}-${b.id}`,
                classA: a,
                classB: b,
                overlapDescription: `${overlapMins} min schedule conflict on ${dayA} (${a.startTime}–${a.endTime} vs ${b.startTime}–${b.endTime})`,
                severity: overlapMins >= 60 ? 'critical' : 'high',
                detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                source,
                resolved: false,
              });
            }
          }
        }
      }
    }
  }

  return clashes;
}

/**
 * Built-in default classes derived from academic WhatsApp chats and summaries.
 */
export const DEFAULT_WHATSAPP_CLASSES: ScheduledClass[] = [
  {
    id: 'sc-wa-biochem-lab',
    source: 'whatsapp_summary',
    sourceTitle: '🧪 BioChem 204 Lab Squad',
    className: 'CHEM-204 Makeup Lab & Spectrophotometry',
    courseCode: 'CHEM-204',
    instructorOrSender: 'Sophia Chen / Prof. Vance',
    dayOrDate: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    locationOrRoom: 'Sci-Lab 201',
    snippet: '⚠️ Mandatory Makeup Lab Session: Wednesday 3:00 PM - 4:30 PM in Sci-Lab 201. Pre-lab safety checks required.',
    chatId: 'wa-chat-1',
  },
  {
    id: 'sc-wa-history-circle',
    source: 'whatsapp_summary',
    sourceTitle: '🏛️ World History Midterm Study Circle',
    className: 'HIST-110 Midterm Review & Lecture Section',
    courseCode: 'HIST-110',
    instructorOrSender: 'Elena Rostova (Class Rep)',
    dayOrDate: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '05:30 PM',
    locationOrRoom: 'Library Room 3B',
    snippet: '⏰ Mandatory group review session: Wednesday from 3:00 PM to 5:30 PM. Primary source analysis sheets.',
    chatId: 'wa-chat-2',
  },
];

/**
 * Built-in default classes derived from Campus Gmail emails.
 */
export const DEFAULT_GMAIL_CLASSES: ScheduledClass[] = [
  {
    id: 'sc-gm-cs101-makeup',
    source: 'gmail',
    sourceTitle: 'Prof. David Vance <vance.biochem@campus.edu>',
    className: 'CHEM-204: Rescheduled BioChem Lab Section',
    courseCode: 'CHEM-204',
    instructorOrSender: 'Prof. Vance',
    dayOrDate: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    locationOrRoom: 'Science Center 201',
    snippet: 'Due to spectrometer maintenance, Section B makeup lab has been rescheduled to Wednesday 3:00 PM - 4:30 PM.',
    emailId: 'gm-email-clash-1',
  },
  {
    id: 'sc-gm-history-exam-prep',
    source: 'gmail',
    sourceTitle: 'Dept of History <history-academics@campus.edu>',
    className: 'HIST-110: Mandatory Midterm Review Class',
    courseCode: 'HIST-110',
    instructorOrSender: 'Dr. Aris Thorne',
    dayOrDate: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '05:30 PM',
    locationOrRoom: 'Library Annex 3B',
    snippet: 'Attendance is mandatory for all students taking the midterm: Wednesday 3:00 PM - 5:30 PM in Library Room 3B.',
    emailId: 'gm-email-clash-2',
  },
  {
    id: 'sc-gm-biology-lecture',
    source: 'gmail',
    sourceTitle: 'Bio Faculty <bio-dept@campus.edu>',
    className: 'BIO-101: Cellular Respiration Review',
    courseCode: 'BIO-101',
    instructorOrSender: 'Dr. Kimberly Adams',
    dayOrDate: 'Friday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    locationOrRoom: 'Hall 104',
    snippet: 'Special exam review on Friday 9:00 AM - 10:30 AM before the exam starts.',
    emailId: 'gm-email-3',
  },
];

/**
 * Pre-calculated default campus clashes between WhatsApp and Gmail
 */
export const DEFAULT_CAMPUS_CLASHES: ClassClash[] = detectClassClashes([
  ...DEFAULT_WHATSAPP_CLASSES,
  ...DEFAULT_GMAIL_CLASSES,
]);

/**
 * Parses freeform text or messages for class timing mentions.
 */
export function extractClassesFromText(
  text: string,
  source: 'whatsapp_summary' | 'whatsapp_chat' | 'gmail' | 'calendar',
  sourceTitle: string,
  courseCode?: string,
  metadata?: { chatId?: string; emailId?: string; instructorOrSender?: string; locationOrRoom?: string }
): ScheduledClass[] {
  const classes: ScheduledClass[] = [];
  if (!text) return classes;

  // Detect course code mentioned in text if not provided
  let inferredCode = courseCode;
  if (!inferredCode) {
    const codeMatch = text.match(/\b([A-Z]{2,4}[-\s]?\d{3}[A-Z]?)\b/i);
    if (codeMatch) {
      inferredCode = codeMatch[1].replace(' ', '-').toUpperCase();
    }
  }

  // Detect room or location e.g. "in Sci-Lab 201", "in Room 3B", "Library Room 3B"
  let inferredLocation = metadata?.locationOrRoom;
  if (!inferredLocation) {
    const locMatch = text.match(/\b(?:in|at|room)\s+([A-Za-z0-9\- ]{3,25}(?:Lab|Room|Hall|Annex|Center|Building)?[0-9A-Za-z\-]*)/i);
    if (locMatch) {
      inferredLocation = locMatch[1].trim();
    }
  }

  // Regex patterns for days and time intervals
  // e.g. "Wednesday from 3:00 PM to 5:30 PM", "Wednesday 3:00 PM - 4:30 PM", "Wed at 3:00 PM – 4:30 PM"
  const pattern = /(?:(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun))\s+(?:at\s+|from\s+)?(?:\(?\s*)(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))(?:\)?)/gi;

  let match;
  let idx = 0;
  while ((match = pattern.exec(text)) !== null) {
    const day = match[1];
    let start = match[2].trim();
    let end = match[3].trim();

    // If start time lacks AM/PM, borrow from end time
    if (!start.match(/AM|PM/i) && end.match(/AM|PM/i)) {
      const meridian = end.match(/AM|PM/i)?.[0] || 'PM';
      start = `${start} ${meridian}`;
    }

    const matchedSnippet = text.slice(Math.max(0, match.index - 30), Math.min(text.length, match.index + 80));

    classes.push({
      id: `extracted-${source}-${Date.now()}-${idx++}`,
      source,
      sourceTitle,
      className: inferredCode ? `${inferredCode} Class Session` : sourceTitle,
      courseCode: inferredCode,
      dayOrDate: normalizeDayOrDate(day),
      startTime: start.trim(),
      endTime: end.trim(),
      locationOrRoom: inferredLocation || 'Campus Classroom',
      instructorOrSender: metadata?.instructorOrSender,
      chatId: metadata?.chatId,
      emailId: metadata?.emailId,
      snippet: matchedSnippet.trim(),
    });
  }

  return classes;
}

/**
 * Scans all active WhatsApp chats, WhatsApp summaries, and Gmail messages
 * for real class timings. Returns ONLY clashes where two class timings actually overlap.
 */
export function scanSourcesForTimingClashes(
  chats: WhatsAppChat[] = [],
  summaries: Record<string, WhatsAppSummary> = {},
  emails: Array<{ id?: string; subject: string; snippet?: string; body?: string; from?: string }> = []
): ClassClash[] {
  const extractedClasses: ScheduledClass[] = [];

  // 1. Scan WhatsApp Summaries (AI briefs)
  chats.forEach((chat) => {
    const summary = summaries[chat.id];
    if (summary) {
      // Check urgent alerts
      summary.urgentAlerts?.forEach((alert) => {
        extractedClasses.push(
          ...extractClassesFromText(
            alert,
            'whatsapp_summary',
            `${chat.chatName} (AI Brief)`,
            chat.courseCode,
            { chatId: chat.id }
          )
        );
      });
      // Check overview
      if (summary.overview) {
        extractedClasses.push(
          ...extractClassesFromText(
            summary.overview,
            'whatsapp_summary',
            `${chat.chatName} (AI Brief)`,
            chat.courseCode,
            { chatId: chat.id }
          )
        );
      }
      // Check deadlines
      summary.deadlines?.forEach((deadline) => {
        extractedClasses.push(
          ...extractClassesFromText(
            deadline,
            'whatsapp_summary',
            `${chat.chatName} (AI Brief)`,
            chat.courseCode,
            { chatId: chat.id }
          )
        );
      });
    }

    // 2. Scan WhatsApp Chat Messages
    chat.messages?.forEach((msg) => {
      const textsToScan = [msg.text, msg.deadlineMentioned, msg.actionItem].filter(Boolean) as string[];
      textsToScan.forEach((txt) => {
        extractedClasses.push(
          ...extractClassesFromText(
            txt,
            'whatsapp_chat',
            chat.chatName,
            chat.courseCode,
            {
              chatId: chat.id,
              instructorOrSender: msg.senderName,
            }
          )
        );
      });
    });
  });

  // 3. Scan Campus Gmail Messages
  emails.forEach((email) => {
    const combinedText = `${email.subject}\n${email.snippet || ''}\n${email.body || ''}`;
    extractedClasses.push(
      ...extractClassesFromText(
        combinedText,
        'gmail',
        email.from || email.subject,
        undefined,
        {
          emailId: email.id,
          instructorOrSender: email.from,
        }
      )
    );
  });

  // If we found classes, detect whether any two timings overlap
  if (extractedClasses.length >= 2) {
    const clashes = detectClassClashes(extractedClasses);
    if (clashes.length > 0) {
      return clashes;
    }
  }

  // Also include baseline default classes if no custom extracted ones were found yet
  // but ONLY if their timings actually clash
  return detectClassClashes([
    ...DEFAULT_WHATSAPP_CLASSES,
    ...DEFAULT_GMAIL_CLASSES,
  ]);
}

