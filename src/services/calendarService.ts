import { getAccessToken } from './googleAuth';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetch calendar events within a time range from Google Calendar primary calendar
 */
export async function listGoogleCalendarEvents(
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token available. Please sign in with Google.');
  }

  const params = new URLSearchParams({
    calendarId: 'primary',
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });

  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Calendar API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new event on the user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(eventData: {
  summary: string;
  description?: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
}): Promise<GoogleCalendarEvent> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token available. Please sign in with Google.');
  }

  const body = {
    summary: eventData.summary,
    description: eventData.description,
    start: {
      dateTime: eventData.startDateTime,
    },
    end: {
      dateTime: eventData.endDateTime,
    },
  };

  const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create Google Calendar event: ${errorBody}`);
  }

  return await response.json();
}

/**
 * Delete an event from Google Calendar (MUST be preceded by user confirmation)
 */
export async function deleteGoogleCalendarEvent(eventId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token available. Please sign in with Google.');
  }

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete Google Calendar event: ${errorBody}`);
  }
}
