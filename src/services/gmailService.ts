import { getAccessToken } from './googleAuth';

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  isUnread?: boolean;
}

export interface GmailFullMessage extends GmailMessageSummary {
  body: string;
}

/**
 * List messages from user's Gmail inbox with query support
 */
export async function listGmailMessages(
  query: string = 'label:INBOX',
  maxResults: number = 15
): Promise<GmailMessageSummary[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not signed in to Google. Please sign in with Google to access your Gmail.');
  }

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Gmail messages (${res.status})`
    );
  }

  const data = await res.json();
  const messagesList = data.messages || [];

  // Fetch summary metadata for each message
  const detailedMessages = await Promise.all(
    messagesList.map(async (msg: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();
        const headers: GmailMessageHeader[] = msgData.payload?.headers || [];

        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const isUnread = (msgData.labelIds || []).includes('UNREAD');

        return {
          id: msgData.id,
          threadId: msgData.threadId,
          snippet: decodeHtmlEntities(msgData.snippet || ''),
          subject: getHeader('Subject') || '(No Subject)',
          from: getHeader('From') || 'Unknown Sender',
          date: getHeader('Date') || '',
          isUnread,
        } as GmailMessageSummary;
      } catch (err) {
        console.error('Error fetching message details:', err);
        return null;
      }
    })
  );

  return detailedMessages.filter((m): m is GmailMessageSummary => m !== null);
}

/**
 * Fetch complete message body
 */
export async function getGmailMessage(messageId: string): Promise<GmailFullMessage> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not signed in to Google.');
  }

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to retrieve email content');
  }

  const data = await res.json();
  const headers: GmailMessageHeader[] = data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // Parse body text from parts or body data
  let body = '';
  if (data.payload?.body?.data) {
    body = base64UrlDecode(data.payload.body.data);
  } else if (data.payload?.parts) {
    const textPart = data.payload.parts.find(
      (part: any) => part.mimeType === 'text/plain'
    );
    if (textPart?.body?.data) {
      body = base64UrlDecode(textPart.body.data);
    } else {
      const htmlPart = data.payload.parts.find(
        (part: any) => part.mimeType === 'text/html'
      );
      if (htmlPart?.body?.data) {
        body = base64UrlDecode(htmlPart.body.data);
      }
    }
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: decodeHtmlEntities(data.snippet || ''),
    subject: getHeader('Subject') || '(No Subject)',
    from: getHeader('From') || 'Unknown Sender',
    date: getHeader('Date') || '',
    isUnread: (data.labelIds || []).includes('UNREAD'),
    body: body || decodeHtmlEntities(data.snippet || 'No preview available'),
  };
}

/**
 * Send an email using user's authorized Gmail account
 */
export async function sendGmailMessage(to: string, subject: string, bodyText: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not signed in to Google. Please connect your account first.');
  }

  // Construct RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');

  // Base64URL encode the message
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to send email');
  }

  return await res.json();
}

// Utility helper to base64url decode
function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }
}

function decodeHtmlEntities(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent || text;
}
