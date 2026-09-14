import React, { useState, useEffect, useRef } from 'react';
import { ResourceItem } from '../types';
import { playCutePop, playCuteChime } from '../utils/sound';
import { ExternalLink, Star, Plus, Search, BookOpen, Bookmark, GraduationCap, Cpu, FileSpreadsheet, Volume2, VolumeX, Play, Pause, Headphones } from 'lucide-react';
import booksResourcesIcon from '../assets/images/books_resources_icon_1789391402505.jpg';

interface ResourcesViewProps {
  resources: ResourceItem[];
  onAddResource: (item: Omit<ResourceItem, 'id'>) => void;
  onToggleFavorite: (id: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onAddResource,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Resource Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceItem['category']>('tools');
  const [url, setUrl] = useState('https://');

  // Ambient Lofi Synthesizer State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'lofi' | 'cafe' | 'fire'>('rain');
  const [volume, setVolume] = useState(0.2);

  // Web Audio Context & Nodes Ref for Ambient generator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<any[]>([]);

  useEffect(() => {
    return () => {
      // Clean up audio on unmount
      stopAmbientSound();
    };
  }, []);

  const stopAmbientSound = () => {
    sourceNodesRef.current.forEach((n) => {
      try {
        n.stop();
        n.disconnect();
      } catch {}
    });
    sourceNodesRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const startAmbientSound = (type: 'rain' | 'lofi' | 'cafe' | 'fire') => {
    stopAmbientSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Synthesize soothing ambient textures using procedural noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      if (type === 'rain') {
        // Pink / Brown noise for soft falling rain
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        sourceNodesRef.current.push(whiteNoise);
      } else {
        // Lofi warmth / gentle ocean breeze
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 1.2;
        }

        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        // Add soft warm drone oscillator
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(110, ctx.currentTime); // A2
        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.04, ctx.currentTime);

        drone.connect(droneGain);
        droneGain.connect(masterGain);
        drone.start();

        brownNoise.connect(filter);
        filter.connect(masterGain);
        brownNoise.start();

        sourceNodesRef.current.push(brownNoise, drone);
      }

      setIsPlayingAudio(true);
    } catch (e) {
      console.error('Audio synthesizer error:', e);
    }
  };

  const toggleSound = () => {
    playCutePop();
    if (isPlayingAudio) {
      stopAmbientSound();
    } else {
      startAmbientSound(soundType);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    playCuteChime();
    onAddResource({
      title: title.trim(),
      description: description.trim() || 'Helpful study resource link.',
      category,
      url: url.startsWith('http') ? url : `https://${url}`,
      iconName: 'Bookmark',
      isFavorite: false,
    });

    setTitle('');
    setDescription('');
    setUrl('https://');
    setShowAddModal(false);
  };

  const filteredResources = resources.filter((r) => {
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    const matchesQuery =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Ambient Study Player & Quick Add */}
      <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs ring-2 ring-[#7dd3fc] bg-[#e0f2fe] flex items-center justify-center p-0.5 shrink-0">
            <img
              src={booksResourcesIcon}
              alt="Books and Resources"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-cute font-bold text-sm sm:text-base text-[#0369a1]">
                Campus Resources & Study Hub
              </h3>
              <span className="bg-[#e0f2fe] text-[#0284c7] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#bae6fd]">
                {isPlayingAudio ? 'Ambient Playing' : 'I ❤️ Books'}
              </span>
            </div>
            <p className="text-xs text-[#0284c7] mt-0.5">
              Academic links, cheat sheets, and calming soundscapes for deep focus
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white/90 p-1 rounded-xl border border-[#bbf7d0] text-xs font-cute">
            {[
              { id: 'rain', label: '🌧️ Soft Rain' },
              { id: 'lofi', label: '☕ Warm Cafe' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  playCutePop();
                  setSoundType(snd.id as any);
                  if (isPlayingAudio) {
                    startAmbientSound(snd.id as any);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  soundType === snd.id
                    ? 'bg-[#059669] text-white font-bold shadow-2xs'
                    : 'text-[#166534] hover:bg-[#eafaf1]'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSound}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
              isPlayingAudio
                ? 'bg-[#059669] text-white hover:bg-[#047857]'
                : 'bg-white text-[#059669] border border-[#bbf7d0] hover:bg-[#dcfce7]'
            }`}
            title={isPlayingAudio ? 'Pause ambient sound' : 'Play ambient sound'}
          >
            {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-white/90 px-2.5 py-1.5 rounded-xl border border-[#bbf7d0]">
            <Volume2 className="w-3.5 h-3.5 text-[#059669]" />
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.02"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-[#059669] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#ebdcd0]">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-cute">
          {[
            { id: 'all', label: '🌟 All Resources' },
            { id: 'academic', label: '🎓 Academic & Research' },
            { id: 'tools', label: '🛠️ Study Tools' },
            { id: 'cheatsheets', label: '📐 Cheatsheets' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => {
                playCutePop();
                setActiveCategory(c.id);
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#059669] text-white font-bold shadow-2xs'
                  : 'bg-white/80 text-[#523d32] border border-[#dfd0c2] hover:bg-[#faeee4]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6d5f]" />
            <input
              type="text"
              placeholder="Search resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/90 border border-[#dfcebf] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3b271d] font-reading placeholder:text-[#a89084] focus:outline-none focus:ring-2 focus:ring-[#34d399]"
            />
          </div>

          <button
            onClick={() => {
              playCutePop();
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1 bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-xl text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="group bg-white/90 rounded-2xl p-4 border border-[#ebdcd0] hover:border-[#10b981] hover:shadow-md transition-all duration-200 flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#059669] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </span>

                <button
                  onClick={() => {
                    playCutePop();
                    onToggleFavorite(res.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    res.isFavorite
                      ? 'text-[#f59e0b] bg-[#fef3c7]'
                      : 'text-[#c2a99c] hover:text-[#f59e0b]'
                  }`}
                  title="Bookmark"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>

              <h4 className="font-cute font-bold text-sm text-[#3b271d] group-hover:text-[#059669] transition-colors line-clamp-1">
                {res.title}
              </h4>

              <p className="text-xs text-[#7f6356] font-reading mt-1 leading-relaxed line-clamp-2">
                {res.description}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#f0e3d6] flex items-center justify-between">
              <span className="text-[10px] font-cute font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f4eae0] text-[#735446]">
                {res.category}
              </span>

              <a
                href={res.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center space-x-1 text-xs font-cute font-bold text-[#059669] hover:text-[#047857] transition-colors"
              >
                <span>Open Vault</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-[#fbf7ee] rounded-2xl max-w-md w-full p-5 sm:p-6 border border-[#e5d8c8] paper-shadow relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ebdcd0]">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🌿</span>
                <h3 className="font-serif-title font-bold text-lg text-[#3d271d]">
                  Add Study Resource
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#96796d] hover:text-[#5a3b2f] text-sm font-cute cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Organic Chemistry Mechanism Cheat Sheet"
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#3b271d] font-reading focus:ring-2 focus:ring-[#34d399] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#34d399] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-cute focus:ring-2 focus:ring-[#34d399] focus:outline-none"
                >
                  <option value="academic">🎓 Academic & Research</option>
                  <option value="tools">🛠️ Productivity & Study Tools</option>
                  <option value="cheatsheets">📐 Formula Cheatsheets</option>
                  <option value="templates">📑 Templates & Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-cute font-bold text-[#5c4033] mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this resource helpful..."
                  className="w-full bg-white border border-[#dac7b7] rounded-xl px-3 py-2 text-xs text-[#3b271d] font-reading focus:ring-2 focus:ring-[#34d399] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#d8c5b6] text-xs font-cute text-[#684b3e] hover:bg-[#faefe5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-cute font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Resource ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
