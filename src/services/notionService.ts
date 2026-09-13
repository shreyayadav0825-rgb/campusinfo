import { NotionPageItem } from '../types';

export interface NotionSearchResponse {
  results: any[];
  next_cursor?: string;
  has_more?: boolean;
}

/**
 * Searches Notion pages and databases
 */
export async function searchNotionPages(
  query: string = '',
  apiKey?: string
): Promise<NotionPageItem[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const storedToken = apiKey || localStorage.getItem('notion_api_token') || '';
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const res = await fetch('/api/notion/search', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Notion API failed with status ${res.status}`);
  }

  const data: NotionSearchResponse = await res.json();

  return (data.results || []).map((item: any) => {
    // Extract title from page properties or database title
    let title = 'Untitled';
    if (item.properties) {
      // Find title property
      for (const key of Object.keys(item.properties)) {
        const prop = item.properties[key];
        if (prop.type === 'title' && prop.title && prop.title.length > 0) {
          title = prop.title.map((t: any) => t.plain_text).join('');
          break;
        }
      }
    } else if (item.title && Array.isArray(item.title)) {
      title = item.title.map((t: any) => t.plain_text).join('');
    }

    let icon = '📄';
    if (item.icon) {
      if (item.icon.type === 'emoji') {
        icon = item.icon.emoji;
      } else if (item.icon.type === 'external') {
        icon = item.icon.external.url;
      }
    }

    return {
      id: item.id,
      title: title || 'Untitled Note',
      url: item.url || `https://www.notion.so/${item.id.replace(/-/g, '')}`,
      icon,
      lastEditedTime: item.last_edited_time ? new Date(item.last_edited_time).toLocaleDateString() : 'Recent',
      parentType: item.parent?.type || 'workspace',
      snippet: item.object === 'database' ? 'Notion Database' : 'Notion Page',
    };
  });
}

/**
 * Creates a quick page or note in Notion
 */
export async function createNotionPage(
  title: string,
  content?: string,
  parentId?: string,
  apiKey?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const storedToken = apiKey || localStorage.getItem('notion_api_token') || '';
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const res = await fetch('/api/notion/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title,
      content,
      parentId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create page in Notion');
  }

  return await res.json();
}
