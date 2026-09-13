import React, { useState } from 'react';
import { TodoItem } from '../types';
import { playCutePop } from '../utils/sound';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Check,
  Tag,
  Filter,
} from 'lucide-react';
import todoIcon from '../assets/images/todo_icon_1789300346730.jpg';

interface TodoListViewProps {
  todos: TodoItem[];
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TodoItem['category']>('academic');
  const [newPriority, setNewPriority] = useState<TodoItem['priority']>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-09-15');

  const filteredTodos = todos.filter((item) => {
    if (filter === 'active' && item.completed) return false;
    if (filter === 'completed' && !item.completed) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    playCutePop();
    onAddTodo({
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || undefined,
    });
    setNewTitle('');
  };

  const getPriorityBadge = (p: TodoItem['priority']) => {
    switch (p) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309] border border-[#fde68a] inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Low
          </span>
        );
    }
  };

  const getCategoryColor = (cat: TodoItem['category']) => {
    switch (cat) {
      case 'academic':
        return 'bg-[#ede9fe] text-[#6d28d9] border-[#ddd6fe]';
      case 'campus':
        return 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
      case 'urgent':
        return 'bg-[#ffe4e6] text-[#be123c] border-[#fecdd3]';
      case 'personal':
      default:
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Cute To-Do Icon and Quick Progress */}
      <div className="bg-gradient-to-r from-[#fff7ed] via-[#fff1f2] to-[#fef2f2] rounded-2xl p-4 sm:p-5 border border-[#fed7aa]/70 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-sm border border-[#fcd34d] flex items-center justify-center shrink-0">
            <img
              src={todoIcon}
              alt="Cute To Do List Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif-title font-bold text-xl text-[#451a03]">
                Daily Task Planner
              </h2>
              <span className="px-2 py-0.5 bg-[#f97316] text-white text-[10px] font-bold rounded-full">
                {pendingCount} remaining
              </span>
            </div>
            <p className="text-xs text-[#78350f] mt-0.5">
              Keep your campus studies, club dues, and assignments organized ✨
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-56 bg-white/90 rounded-xl p-3 border border-[#fed7aa] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#78350f] mb-1.5">
            <span>Overall Completion</span>
            <span className="text-[#ea580c]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#ffedd5] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#fb923c] to-[#f43f5e] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add New Task Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl p-4 border border-[#ecdcd1] shadow-2xs space-y-3"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold font-serif-title text-[#3b271d]">
            ✨ Quick Add Task
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-2.5">
          <input
            id="todo-input-title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Submit Chemistry Lab Report, Review CS flashcards..."
            className="flex-1 bg-[#fffdfa] border border-[#d8c3b4] rounded-xl px-3.5 py-2 text-sm text-[#3b271d] focus:outline-hidden focus:ring-2 focus:ring-[#f97316]/50 placeholder:text-[#a89080]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="bg-[#fffdfa] border border-[#d8c3b4] rounded-xl px-2.5 py-2 text-xs text-[#3b271d] focus:outline-hidden font-medium"
            >
              <option value="academic">📚 Academic</option>
              <option value="campus">🏫 Campus</option>
              <option value="urgent">🔥 Urgent</option>
              <option value="personal">🌸 Personal</option>
            </select>

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-[#fffdfa] border border-[#d8c3b4] rounded-xl px-2.5 py-2 text-xs text-[#3b271d] focus:outline-hidden font-medium"
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-[#fffdfa] border border-[#d8c3b4] rounded-xl px-2.5 py-2 text-xs text-[#3b271d] focus:outline-hidden"
            />

            <button
              id="todo-btn-add"
              type="submit"
              className="bg-gradient-to-r from-[#ea580c] to-[#f43f5e] hover:from-[#c2410c] hover:to-[#e11d48] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-1.5 bg-[#f5ebe0]/80 p-1 rounded-xl border border-[#ebdcd0]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-[#3b271d] shadow-2xs font-bold'
                : 'text-[#6e5040] hover:text-[#3b271d]'
            }`}
          >
            All ({todos.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'active'
                ? 'bg-white text-[#3b271d] shadow-2xs font-bold'
                : 'text-[#6e5040] hover:text-[#3b271d]'
            }`}
          >
            Active ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === 'completed'
                ? 'bg-white text-[#3b271d] shadow-2xs font-bold'
                : 'text-[#6e5040] hover:text-[#3b271d]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-[#8c705f] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'academic', 'campus', 'urgent', 'personal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-[#432c21] text-white shadow-2xs'
                  : 'bg-white/80 text-[#6e5040] border border-[#ebdcd0] hover:bg-[#fff9f5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="bg-white/70 rounded-2xl p-8 text-center border-2 border-dashed border-[#e4d4c8]">
            <img
              src={todoIcon}
              alt="Empty Todo"
              referrerPolicy="no-referrer"
              className="w-16 h-16 mx-auto mb-3 object-contain opacity-80"
            />
            <p className="font-serif-title font-bold text-[#451a03]">
              No tasks found in this view!
            </p>
            <p className="text-xs text-[#78350f] mt-1">
              Add a new task above to stay on track with your study schedule.
            </p>
          </div>
        ) : (
          filteredTodos.map((item) => (
            <div
              key={item.id}
              id={`todo-item-${item.id}`}
              className={`group bg-white rounded-xl p-3.5 border transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                item.completed
                  ? 'border-[#e2e8f0] bg-[#fafaf9]/70 opacity-75'
                  : 'border-[#ebdcd0] hover:border-[#f97316]/40'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <button
                  onClick={() => {
                    playCutePop();
                    onToggleTodo(item.id);
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    item.completed
                      ? 'bg-[#10b981] text-white'
                      : 'border-2 border-[#d8c3b4] text-transparent hover:border-[#ea580c]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium transition-all ${
                      item.completed
                        ? 'line-through text-[#9ca3af]'
                        : 'text-[#2e1d15]'
                    }`}
                  >
                    {item.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>

                    {getPriorityBadge(item.priority)}

                    {item.dueDate && (
                      <span className="text-[11px] text-[#785b4c] inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#b45309]" />
                        {item.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteTodo(item.id)}
                  title="Delete task"
                  className="p-1.5 text-[#9ca3af] hover:text-[#ef4444] rounded-lg hover:bg-[#fee2e2]/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
