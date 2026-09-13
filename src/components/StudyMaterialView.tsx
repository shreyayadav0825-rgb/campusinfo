import React, { useState } from 'react';
import { Flashcard, StudyNote } from '../types';
import { playCutePop, playCuteChime, playCardFlip } from '../utils/sound';
import { RotateCw, CheckCircle2, XCircle, Plus, ChevronLeft, ChevronRight, BookOpen, Sparkles, Tag, StickyNote, HelpCircle } from 'lucide-react';

interface StudyMaterialViewProps {
  flashcards: Flashcard[];
  studyNotes: StudyNote[];
  onAddFlashcard: (card: Omit<Flashcard, 'id' | 'mastered'>) => void;
  onToggleMastery: (id: string) => void;
  onAddStudyNote: (note: Omit<StudyNote, 'id'>) => void;
}

export const StudyMaterialView: React.FC<StudyMaterialViewProps> = ({
  flashcards,
  studyNotes,
  onAddFlashcard,
  onToggleMastery,
  onAddStudyNote,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'notes'>('cards');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Modals
  const [showCardModal, setShowCardModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Flashcard Form
  const [cardSubject, setCardSubject] = useState('General');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');

  // Note Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('General');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('Study, Focus');

  const filteredCards = flashcards.filter(
    (c) => selectedSubject === 'all' || c.subject === selectedSubject
  );

  const subjects = ['all', ...Array.from(new Set(flashcards.map((c) => c.subject)))];

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];
  const masteredCount = flashcards.filter((c) => c.mastered).length;
  const masteryPercentage = flashcards.length
    ? Math.round((masteredCount / flashcards.length) * 100)
    : 0;

  const handleNext = () => {
    playCutePop();
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    playCutePop();
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(
      (prev) => (prev - 1 + filteredCards.length) % filteredCards.length
    );
  };

  const handleFlip = () => {
    playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    playCuteChime();
    onAddFlashcard({
      subject: cardSubject,
      question: question.trim(),
      answer: answer.trim(),
      hint: hint.trim() || undefined,
    });

    setQuestion('');
    setAnswer('');
    setHint('');
    setShowCardModal(false);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    playCuteChime();
    const colors = ['#fff7ed', '#ecfdf5', '#fdf2f8', '#faf5ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddStudyNote({
      title: noteTitle.trim(),
      subject: noteSubject,
      content: noteContent.trim(),
      tags: noteTags.split(',').map((t) => t.trim()).filter(Boolean),
      date: 'Sep 13, 2026',
      color: randomColor,
    });

    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation (Flashcards vs Study Notes) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ebdcd0]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              playCutePop();
              setActiveSubTab('cards');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-cute font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'cards'
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'bg-white/80 text-[#694b3e] hover:bg-[#faeee4] border border-[#e5d6c7]'
            }`}
          >
            <span>🎴 Active Flashcards</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {flashcards.length}
            </span>
          </button>

          <button
            onClick={() => {
              playCutePop();
              setActiveSubTab('notes');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-cute font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'notes'
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'bg-white/80 text-[#694b3e] hover:bg-[#faeee4] border border-[#e5d6c7]'
            }`}
          >
            <span>📝 Study Summaries</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {studyNotes.length}
            </span>
          </button>
        </div>

        {/* Action Button */}
        {activeSubTab === 'cards' ? (
          <button
            onClick={() => {
              playCutePop();
              setShowCardModal(true);
            }}
            className="flex items-center space-x-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3.5 py-2 rounded-xl text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Flashcard</span>
          </button>
        ) : (
          <button
            onClick={() => {
              playCutePop();
              setShowNoteModal(true);
            }}
            className="flex items-center space-x-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-3.5 py-2 rounded-xl text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        )}
      </div>

      {/* FLASHCARDS DECK VIEW */}
      {activeSubTab === 'cards' && (
        <div className="space-y-5">
          {/* Progress & Subject Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Subject Filters */}
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-cute">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    playCutePop();
                    setSelectedSubject(sub);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer capitalize ${
                    selectedSubject === sub
                      ? 'bg-[#7c3aed] text-white font-bold shadow-2xs'
                      : 'bg-white/90 text-[#694b3e] border border-[#dfd0c2] hover:bg-[#faeee4]'
                  }`}
                >
                  {sub === 'all' ? '🌈 All Subjects' : sub}
                </button>
              ))}
            </div>

            {/* Mastery Progress */}
            <div className="flex items-center space-x-2 bg-white/90 px-3 py-1.5 rounded-xl border border-[#ebdcd0] text-xs font-cute">
              <span className="text-[#694b3e]">Mastery Score:</span>
              <div className="w-20 bg-[#ede9fe] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#7c3aed] h-full transition-all duration-300"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
              <span className="font-bold text-[#7c3aed]">{masteryPercentage}%</span>
            </div>
          </div>

          {/* Interactive Flip Card Stage */}
          {filteredCards.length > 0 && currentCard ? (
            <div className="flex flex-col items-center max-w-xl mx-auto">
              <div
                onClick={handleFlip}
                className="w-full min-h-[260px] sm:min-h-[290px] bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#ebdcd0] hover:border-[#7c3aed] paper-shadow cursor-pointer transition-all duration-300 flex flex-col justify-between relative select-none group"
                style={{
                  backgroundImage: isFlipped
                    ? 'radial-gradient(#f5f3ff 1px, transparent 1px)'
                    : 'radial-gradient(#fdfbf7 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Washi tape header on card */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#c4b5fd]/80 rounded-xs -rotate-1 border-t border-b border-[#a78bfa]/60 shadow-2xs pointer-events-none" />

                {/* Card Top: Subject & Status */}
                <div className="flex items-center justify-between text-xs font-cute">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f5f3ff] text-[#6d28d9] font-bold border border-[#ddd6fe]">
                    {currentCard.subject}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-[#8c6d5f]">
                      {currentCardIndex + 1} / {filteredCards.length}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        currentCard.mastered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {currentCard.mastered ? '✓ Mastered' : 'Needs Review'}
                    </span>
                  </div>
                </div>

                {/* Card Body: Question or Answer */}
                <div className="my-auto py-4 text-center">
                  {!isFlipped ? (
                    <div>
                      <span className="text-[11px] font-cute uppercase tracking-wider text-[#9d7d6f] font-bold block mb-2">
                        Question
                      </span>
                      <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#3b271d] leading-relaxed">
                        {currentCard.question}
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] font-cute uppercase tracking-wider text-[#7c3aed] font-bold block mb-2">
                        Answer & Key Concept
                      </span>
                      <p className="font-reading text-sm sm:text-base text-[#3d271d] leading-relaxed whitespace-pre-wrap">
                        {currentCard.answer}
                      </p>
                    </div>
                  )}

                  {showHint && currentCard.hint && (
                    <div className="mt-3 p-2 bg-[#fefce8] border border-[#fef08a] rounded-xl text-xs text-[#854d0e] font-cute inline-block animate-fadeIn">
                      💡 Hint: {currentCard.hint}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Flip hint */}
                <div className="flex items-center justify-between text-xs text-[#9d7d6f] font-cute pt-2 border-t border-[#f0e3d6]">
                  {currentCard.hint ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCutePop();
                        setShowHint(!showHint);
                      }}
                      className="hover:text-[#b45309] flex items-center space-x-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide hint' : 'Show hint'}</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  <span className="flex items-center space-x-1 group-hover:text-[#7c3aed] transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click card to flip</span>
                  </span>
                </div>
              </div>

              {/* Controls: Prev / Mastered / Next */}
              <div className="flex items-center space-x-3 mt-4 w-full justify-between">
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#dfcebf] text-xs font-cute text-[#694b3e] hover:bg-[#faeee4] flex items-center space-x-1 shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      playCuteChime();
                      onToggleMastery(currentCard.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-cute font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 ${
                      currentCard.mastered
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentCard.mastered ? 'Mastered!' : 'Mark Mastered'}</span>
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#dfcebf] text-xs font-cute text-[#694b3e] hover:bg-[#faeee4] flex items-center space-x-1 shadow-2xs cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#9a7e70] font-cute">
              No flashcards found for this subject. Click "New Flashcard" to create one!
            </div>
          )}
        </div>
      )}

      {/* STUDY SUMMARIES & NOTES VIEW */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl p-5 border border-[#ebdcd0] paper-shadow relative flex flex-col justify-between transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: note.color }}
            >
              {/* Cute corner washi tape */}
              <div className="absolute -top-2 left-6 w-12 h-3.5 bg-[#fcd34d]/60 rounded-xs -rotate-2 border-t border-b border-[#f59e0b]/40 shadow-2xs" />

              <div>
                <div className="flex items-center justify-between text-xs font-cute text-[#7c5f52] mb-2">
                  <span className="font-bold text-[#8a3e35] uppercase tracking-wider text-[10px]">
                    {note.subject}
                  </span>
                  <span>{note.date}</span>
                </div>

                <h4 className="font-serif-title font-bold text-base text-[#3d271d] mb-2">
                  {note.title}
                </h4>

                <p className="font-reading text-xs sm:text-sm text-[#543b2f] leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#ebdcd0]/70 flex flex-wrap gap-1.5">
                {note.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-cute px-2 py-0.5 rounded-md bg-white/80 text-[#694b3e] border border-[#ebdcd0]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Flashcard Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-[#fbf7ee] rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#e5d8c8] paper-shadow relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebdcd0]">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎴</span>
                <h3 className="font-serif-title font-bold text-lg text-[#3d271d]">
                  New Flashcard
                </h3>
              </div>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-[#96796d] hover:text-[#5a3b2f] text-sm font-cute cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={cardSubject}
                  onChange={(e) => setCardSubject(e.target.value)}
                  placeholder="e.g., Biology, Chemistry, History"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-cute focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Front / Question
                </label>
                <textarea
                  rows={2}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="The concept or retrieval question..."
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#3b271d] font-reading focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Back / Answer
                </label>
                <textarea
                  rows={3}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="The clear explanation or key definition..."
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#3b271d] font-reading focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Optional Hint
                </label>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="e.g., Think of turbine energy"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#d8c5b6] text-xs font-cute text-[#684b3e] hover:bg-[#faefe5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Add Card ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Study Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-[#fbf7ee] rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#e5d8c8] paper-shadow relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebdcd0]">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📝</span>
                <h3 className="font-serif-title font-bold text-lg text-[#3d271d]">
                  New Study Summary
                </h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-[#96796d] hover:text-[#5a3b2f] text-sm font-cute cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g., Photosynthesis Calvin Cycle Steps"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#3b271d] font-reading focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  placeholder="e.g., Biology"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-cute focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Notes / Bullet Points
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Key concepts, definitions, bullet points..."
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#3b271d] font-reading focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  placeholder="Exam Prep, High Yield, Chapter 4"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#a78bfa] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#d8c5b6] text-xs font-cute text-[#684b3e] hover:bg-[#faefe5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Note ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
