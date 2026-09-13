import React, { useState, useEffect } from 'react';
import { NotionPageItem } from '../types';
import { searchNotionPages, createNotionPage } from '../services/notionService';
import { playCutePop } from '../utils/sound';
import {
  BookOpen,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Key,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
  Sparkles,
  Layers,
  Clock,
  ArrowUpRight,
  Settings,
} from 'lucide-react';
import notionIcon from '../assets/images/notion_icon_1789302061804.jpg';

interface NotionViewProps {
  initialPages: NotionPageItem[];
}

export const NotionView: React.FC<NotionViewProps> = ({ initialPages }) => {
  const [pages, setPages] = useState<NotionPageItem[]>(() => {
    const saved = localStorage.getItem('aesthetic_notion_pages');
    return saved ? JSON.parse(saved) : initialPages;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('notion_api_token') || '');
  const [isTokenConfigured, setIsTokenConfigured] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempToken, setTempToken] = useState('');

  // Quick page creation state
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Check if server or local token exists
    fetch('/api/notion/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.configured || apiToken) {
          setIsTokenConfigured(true);
        }
      })
      .catch(() => {});
  }, [apiToken]);

  useEffect(() => {
    localStorage.setItem('aesthetic_notion_pages', JSON.stringify(pages));
  }, [pages]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playCutePop();
    try {
      setLoading(true);
      setError(null);
      const results = await searchNotionPages(searchQuery, apiToken);
      if (results && results.length > 0) {
        setPages(results);
      } else {
        // Fallback filter on current pages if no live workspace access
        const filtered = initialPages.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setPages(filtered);
      }
    } catch (err: any) {
      console.warn('Live Notion API query error, falling back to cached stationery list:', err);
      const filtered = initialPages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setPages(filtered);
      if (apiToken) {
        setError(err.message || 'Could not query live Notion workspace. Check your integration token.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    playCutePop();
    const token = tempToken.trim();
    if (token) {
      localStorage.setItem('notion_api_token', token);
      setApiToken(token);
      setIsTokenConfigured(true);
      setShowTokenModal(false);
      handleSearch();
    } else {
      localStorage.removeItem('notion_api_token');
      setApiToken('');
      setIsTokenConfigured(false);
      setShowTokenModal(false);
    }
  };

  const handleCreateNewPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    playCutePop();
    setCreating(true);
    setError(null);

    try {
      if (isTokenConfigured) {
        await createNotionPage(newTitle, newContent, undefined, apiToken);
      }
      
      // Also add to local stationery notes deck
      const newPageItem: NotionPageItem = {
        id: `notion-user-${Date.now()}`,
        title: newTitle.trim(),
        url: 'https://www.notion.so',
        icon: '📝',
        lastEditedTime: 'Just now',
        parentType: 'workspace',
        snippet: newContent.trim() || 'Created from Campus Info stationery workspace.',
      };

      setPages((prev) => [newPageItem, ...prev]);
      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setIsCreatingPage(false);
        setNewTitle('');
        setNewContent('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to sync note to Notion. Added to local campus hub.');
      const newPageItem: NotionPageItem = {
        id: `notion-user-${Date.now()}`,
        title: newTitle.trim(),
        url: 'https://www.notion.so',
        icon: '📝',
        lastEditedTime: 'Just now',
        parentType: 'workspace',
        snippet: newContent.trim() || 'Created from Campus Info stationery workspace.',
      };
      setPages((prev) => [newPageItem, ...prev]);
      setIsCreatingPage(false);
      setNewTitle('');
      setNewContent('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notion App Banner */}
      <div className="bg-gradient-to-r from-[#fafaf9] via-[#f5f5f4] to-[#ede9fe] rounded-2xl p-4 sm:p-5 border border-[#e7e5e4] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm border border-[#d6d3d1] flex items-center justify-center shrink-0">
            <img
              src={notionIcon}
              alt="Notion Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif-title font-bold text-xl text-[#292524]">
                Notion Workspace Hub
              </h2>
              {isTokenConfigured ? (
                <span className="px-2 py-0.5 bg-[#10b981] text-white text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-[#78716c] text-white text-[10px] font-bold rounded-full">
                  Campus Binder Mode
                </span>
              )}
            </div>
            <p className="text-xs text-[#57534e] mt-0.5">
              Sync your lecture notebooks, reading outlines, and database pages directly with Notion.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setTempToken(apiToken);
              setShowTokenModal(true);
            }}
            title="Configure Notion API Token"
            className="p-2 bg-white border border-[#d6d3d1] text-[#57534e] hover:text-[#1c1917] rounded-xl hover:bg-stone-50 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <Key className="w-3.5 h-3.5 text-[#78716c]" />
            <span>{isTokenConfigured ? 'Token Set' : 'Connect Notion'}</span>
          </button>

          <button
            onClick={() => setIsCreatingPage(true)}
            className="bg-gradient-to-r from-[#292524] to-[#44403c] hover:from-[#1c1917] hover:to-[#292524] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>

          <a
            href="https://www.notion.so"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Notion in new tab"
            className="p-2 bg-white border border-[#d6d3d1] text-[#57534e] hover:text-[#1c1917] rounded-xl hover:bg-stone-50 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syllabus, notes, databases..."
            className="w-full bg-white border border-[#d6d3d1] rounded-xl pl-8 pr-3 py-2 text-xs text-[#292524] focus:outline-hidden focus:ring-2 focus:ring-[#78716c]/40 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-[#a8a29e] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center space-x-2 text-xs font-medium text-[#78716c] w-full sm:w-auto justify-between sm:justify-end">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {pages.length} Pages & Databases
          </span>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            title="Refresh list"
            className="p-1.5 bg-white border border-[#d6d3d1] rounded-lg hover:bg-stone-50 text-[#57534e] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {pages.map((item) => (
          <div
            key={item.id}
            id={`notion-card-${item.id}`}
            className="bg-white rounded-xl p-4 border border-[#e7e5e4] shadow-2xs hover:shadow-xs hover:border-[#a8a29e] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-xl shrink-0 p-1 rounded-lg bg-[#fafaf9] border border-[#f5f5f4] flex items-center justify-center">
                    {item.icon || '📄'}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#1c1917] truncate font-serif-title">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-[#78716c] uppercase tracking-wider font-semibold">
                      {item.snippet?.includes('Database') ? 'Database' : 'Page'}
                    </span>
                  </div>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#a8a29e] hover:text-[#1c1917] p-1 rounded-md hover:bg-stone-50 transition-colors"
                  title="Open in Notion"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {item.snippet && (
                <p className="text-xs text-[#57534e] mt-2.5 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f5f5f4] text-[11px] text-[#a8a29e]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {item.lastEditedTime}
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#44403c] font-semibold hover:underline inline-flex items-center gap-0.5 group-hover:text-[#1c1917]"
              >
                <span>Read note</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Guide Box */}
      {!isTokenConfigured && (
        <div className="bg-[#fffdfa] rounded-2xl p-4 sm:p-5 border border-[#e7e5e4] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#f5f5f4] text-[#292524] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#292524] uppercase tracking-wider">
                Live Notion Workspace Sync
              </h4>
              <p className="text-xs text-[#57534e] mt-1">
                Want to search live pages from your Notion team or student workspace? Create an internal integration token at{' '}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-[#292524]"
                >
                  notion.so/my-integrations
                </a>{' '}
                and click &quot;Connect Notion&quot;.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTempToken(apiToken);
              setShowTokenModal(true);
            }}
            className="bg-[#292524] hover:bg-[#1c1917] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
          >
            Enter Token
          </button>
        </div>
      )}

      {/* Create New Page Modal */}
      {isCreatingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#e7e5e4] shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f5f5f4]">
              <div className="flex items-center space-x-2.5">
                <img
                  src={notionIcon}
                  alt="Notion"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-contain p-0.5 bg-white border border-[#d6d3d1]"
                />
                <h3 className="font-serif-title font-bold text-lg text-[#1c1917]">
                  New Campus Note
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingPage(false)}
                className="text-[#a8a29e] hover:text-[#1c1917] text-sm"
              >
                ✕
              </button>
            </div>

            {createSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto animate-bounce" />
                <p className="font-serif-title font-bold text-base text-[#1c1917]">
                  Note Created!
                </p>
                <p className="text-xs text-[#78716c]">Added to your campus notebook deck.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateNewPage} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#44403c] mb-1">
                    Page Title:
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Organic Chem Exam Review, History Timeline..."
                    className="w-full bg-[#fafaf9] border border-[#d6d3d1] rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-hidden focus:ring-2 focus:ring-[#78716c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44403c] mb-1">
                    Outline / Content:
                  </label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Key concepts, bullet points, discussion topics..."
                    className="w-full bg-[#fafaf9] border border-[#d6d3d1] rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-hidden focus:ring-2 focus:ring-[#78716c] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPage(false)}
                    className="px-3 py-1.5 text-xs text-[#78716c] hover:text-[#1c1917] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-[#292524] hover:bg-[#1c1917] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{creating ? 'Saving...' : 'Save Note'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notion API Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#e7e5e4] shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f5f5f4]">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#292524]" />
                <h3 className="font-serif-title font-bold text-lg text-[#1c1917]">
                  Notion Integration Token
                </h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-[#a8a29e] hover:text-[#1c1917] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-3.5">
              <p className="text-xs text-[#57534e] leading-relaxed">
                Connect your workspace via an <strong>Internal Integration Token</strong> (starts with <code>secret_...</code>).
              </p>

              <div>
                <label className="block text-xs font-bold text-[#44403c] mb-1">
                  Internal Integration Secret:
                </label>
                <input
                  type="password"
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  placeholder="secret_..."
                  className="w-full bg-[#fafaf9] border border-[#d6d3d1] rounded-xl px-3 py-2 text-xs text-[#1c1917] focus:outline-hidden focus:ring-2 focus:ring-[#78716c]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {apiToken && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('notion_api_token');
                      setApiToken('');
                      setIsTokenConfigured(false);
                      setShowTokenModal(false);
                    }}
                    className="text-xs text-[#ef4444] hover:underline font-semibold"
                  >
                    Disconnect Token
                  </button>
                )}

                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-3 py-1.5 text-xs text-[#78716c] hover:text-[#1c1917] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#292524] hover:bg-[#1c1917] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Save & Sync
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
