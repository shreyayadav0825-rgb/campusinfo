import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Copy, Check, BookPlus, RefreshCw, Lightbulb, Coffee, BookOpen } from 'lucide-react';
import { ChatMessage, Flashcard } from '../types';
import { playCutePop, playCuteChime } from '../utils/sound';

interface ChatbotViewProps {
  onAddFlashcard?: (card: Omit<Flashcard, 'id' | 'mastered'>) => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ onAddFlashcard }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'berry',
      text: "🍓 **Hi friend! I'm Berry, your aesthetic study buddy!**\n\nI can explain complicated concepts simply, quiz you before exams, craft high-yield flashcards, or coach you through a cozy 25-minute Pomodoro focus block. What are we studying together today? ✨",
      timestamp: 'Just now',
      mode: 'general',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'general' | 'explain' | 'quiz' | 'pomodoro' | 'flashcards'>('general');
  const [subject, setSubject] = useState('General Studies');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedCardId, setAddedCardId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { label: '🍓 Explain Active Recall', text: 'Can you explain active recall and the best way to practice it during exam week?', mode: 'explain' as const },
    { label: '🌸 Quiz Me on Biology', text: 'Quiz me with 3 high-yield questions on cellular respiration!', mode: 'quiz' as const },
    { label: '☕ 25-Min Study Plan', text: 'Help me set up a 25-minute Pomodoro study sprint for a heavy reading assignment.', mode: 'pomodoro' as const },
    { label: '📝 Make Flashcards', text: 'Create 2 flashcards summarizing the difference between mitosis and meiosis.', mode: 'flashcards' as const },
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    playCutePop();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
          mode: activeMode,
          subject,
        }),
      });

      const data = await response.json();
      playCuteChime();

      const berryReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'berry',
        text: data.reply || "You're doing amazing! Let's keep exploring this topic together. 🍓",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };

      setMessages((prev) => [...prev, berryReply]);
    } catch (err) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'berry',
        text: `🌸 **Gentle study note:** Remember to break "${textToSend}" into 3 simple parts! Make sure to take regular sips of water and test yourself without looking at notes. You've got this! ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playCutePop();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAddCard = (msg: ChatMessage) => {
    if (!onAddFlashcard) return;
    playCutePop();
    setAddedCardId(msg.id);

    // Extract basic question & answer
    const lines = msg.text.split('\n').filter((l) => l.trim().length > 0);
    const question = lines[0]?.replace(/^[*#\s]+/, '').slice(0, 100) || 'Study Question';
    const answer = lines.slice(1).join('\n').replace(/^[*#\s]+/, '') || msg.text;

    onAddFlashcard({
      subject,
      question: `Key Concept: ${question}`,
      answer: answer.slice(0, 280),
      hint: 'Derived with Berry AI Study Buddy',
    });

    setTimeout(() => setAddedCardId(null), 2500);
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[75vh]">
      {/* Berry Header / Controls */}
      <div className="pb-3 border-b border-[#ebdcd0] flex flex-wrap items-center justify-between gap-2.5">
        {/* Mascot badge */}
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff6b81] to-[#ffa4b6] flex items-center justify-center text-white shadow-sm ring-2 ring-[#ffe4e6]">
              <span className="text-xl">🐰</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-[9px] text-white">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-cute font-bold text-base text-[#3d251a]">
                Berry Study Companion
              </h2>
              <span className="bg-[#fee2e2] text-[#991b1b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                AI Buddy
              </span>
            </div>
            <p className="text-xs text-[#8c6d5f] flex items-center space-x-1">
              <span>Ready for active recall & explanations</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Online</span>
            </p>
          </div>
        </div>

        {/* Subject & Mode Selection */}
        <div className="flex items-center space-x-2">
          <select
            id="subject-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-xs bg-white/90 border border-[#e5d4c5] rounded-xl px-2.5 py-1.5 text-[#543b2f] font-cute focus:outline-none focus:ring-2 focus:ring-[#fca5a5]"
          >
            <option value="General Studies">📚 General Studies</option>
            <option value="Biology">🧬 Biology</option>
            <option value="Calculus & Math">📐 Calculus & Math</option>
            <option value="Literature">📖 Literature</option>
            <option value="Psychology">🧠 Psychology</option>
            <option value="Chemistry">⚗️ Chemistry</option>
            <option value="History">🏛️ History</option>
          </select>
        </div>
      </div>

      {/* Mode pills */}
      <div className="py-2.5 flex items-center space-x-1.5 overflow-x-auto text-xs font-cute border-b border-[#f0e3d6]">
        <span className="text-[#8c6e61] text-[11px] font-medium shrink-0 mr-1">Study Mode:</span>
        {[
          { id: 'general', label: '✨ Friendly Chat' },
          { id: 'explain', label: '🍓 Explain Simply' },
          { id: 'quiz', label: '🌸 Quiz Me' },
          { id: 'pomodoro', label: '☕ Focus Sprint' },
          { id: 'flashcards', label: '📝 Card Generator' },
        ].map((m) => (
          <button
            key={m.id}
            id={`mode-${m.id}`}
            onClick={() => {
              playCutePop();
              setActiveMode(m.id as any);
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeMode === m.id
                ? 'bg-[#b94747] text-white shadow-xs font-semibold'
                : 'bg-white/80 text-[#694b3e] hover:bg-[#faeee4] border border-[#e8d7c9]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isBerry = msg.sender === 'berry';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                isBerry ? 'justify-start' : 'justify-end'
              }`}
            >
              {isBerry && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b81] to-[#ffa4b6] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-[#ffd4dc]">
                  <span className="text-sm">🐰</span>
                </div>
              )}

              <div
                className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-reading transition-all ${
                  isBerry
                    ? 'bg-white/95 text-[#3b271d] rounded-tl-xs shadow-xs border border-[#ecdcd1]'
                    : 'bg-[#b94747] text-white rounded-tr-xs shadow-sm'
                }`}
                style={
                  isBerry
                    ? {
                        backgroundImage:
                          'linear-gradient(to bottom, rgba(254, 242, 242, 0.4), transparent)',
                      }
                    : undefined
                }
              >
                {/* Washi tape on user or berry message */}
                {isBerry && (
                  <div className="absolute -top-1.5 left-4 w-8 h-2.5 bg-[#fcd34d]/60 rounded-xs -rotate-2 border-t border-b border-[#f59e0b]/40 shadow-2xs pointer-events-none" />
                )}

                {/* Message Body with clean formatting */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.text.split('\n\n').map((para, pIdx) => {
                    // Quick bold parser for aesthetic readability
                    const formatted = para.replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong>$1</strong>'
                    );
                    return (
                      <p
                        key={pIdx}
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                    );
                  })}
                </div>

                {/* Message Footer: timestamp + actions */}
                <div
                  className={`mt-2.5 pt-2 flex items-center justify-between text-[10px] ${
                    isBerry ? 'border-t border-[#f0e3d6] text-[#9b7e72]' : 'text-rose-100'
                  }`}
                >
                  <span className="font-cute">{msg.timestamp}</span>

                  {isBerry && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-[#5a3b2e] flex items-center space-x-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onAddFlashcard && (
                        <button
                          onClick={() => handleQuickAddCard(msg)}
                          className="hover:text-[#b94747] flex items-center space-x-1 cursor-pointer font-medium"
                          title="Save as study flashcard"
                        >
                          {addedCardId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-purple-600" />
                              <span className="text-purple-600 font-bold">Saved to Cards!</span>
                            </>
                          ) : (
                            <>
                              <BookPlus className="w-3 h-3" />
                              <span>+ Card</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!isBerry && (
                <div className="w-8 h-8 rounded-xl bg-[#684131] flex items-center justify-center text-white shrink-0 shadow-xs font-cute font-bold text-xs">
                  ME
                </div>
              )}
            </div>
          );
        })}

        {/* Loading typing indicator */}
        {loading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b81] to-[#ffa4b6] flex items-center justify-center text-white shrink-0 shadow-xs">
              <span className="text-sm">🐰</span>
            </div>
            <div className="bg-white/95 rounded-2xl rounded-tl-xs p-3.5 border border-[#ecdcd1] shadow-xs flex items-center space-x-2 text-xs text-[#8c6d5f] font-cute">
              <span className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#f87171] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#fb923c] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>Berry is crafting your study notes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="pt-2 pb-1 flex items-center space-x-1.5 overflow-x-auto text-[11px] font-cute">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveMode(p.mode);
              handleSend(p.text);
            }}
            className="px-2.5 py-1 rounded-full bg-[#f4eae0] hover:bg-[#eddcca] text-[#6d4f42] border border-[#e2d0bf] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            id="chat-input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Berry about ${subject}, request a quiz or study plan...`}
            disabled={loading}
            className="w-full bg-white/95 border border-[#dfcebf] rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-[#3b271d] font-reading placeholder:text-[#a1897d] focus:outline-none focus:ring-2 focus:ring-[#e2736e] focus:border-transparent shadow-xs transition-all"
          />

          <button
            id="send-chat-btn"
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 rounded-xl bg-[#b94747] hover:bg-[#a13b3b] disabled:bg-[#d8b8b0] text-white transition-all shadow-xs cursor-pointer flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
