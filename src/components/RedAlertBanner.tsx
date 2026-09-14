import React from 'react';
import { ClassClash } from '../types';
import { playCutePop, playRedAlertSound, stopRedAlertSound } from '../utils/sound';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  X,
  Volume2,
  Calendar,
  Sparkles,
  BellOff,
} from 'lucide-react';

interface RedAlertBannerProps {
  clashes: ClassClash[];
  onOpenClash: (clash: ClassClash) => void;
  onDismiss: (clashId: string) => void;
  onResolveClash?: (clashId: string) => void;
  onStopAlert?: () => void;
  onSimulateClash?: () => void;
  onNavigateToSource?: (source: 'whatsapp' | 'gmail') => void;
}

export const RedAlertBanner: React.FC<RedAlertBannerProps> = ({
  clashes,
  onOpenClash,
  onDismiss,
  onResolveClash,
  onStopAlert,
  onSimulateClash,
  onNavigateToSource,
}) => {
  const activeClashes = clashes.filter((c) => !c.resolved);

  if (activeClashes.length === 0) {
    return null;
  }

  const primaryClash = activeClashes[0];

  const handlePlaySound = () => {
    playRedAlertSound();
  };

  const handleStopAlert = () => {
    playCutePop();
    stopRedAlertSound();
    if (onStopAlert) {
      onStopAlert();
    } else {
      onDismiss(primaryClash.id);
    }
  };

  return (
    <div
      id="global-red-alert-banner"
      className="w-full bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#b91c1c] text-white shadow-md border-b-2 border-red-800 animate-in slide-in-from-top duration-300 relative z-40"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left Side: Flashing Emergency Beacon & Details */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="bg-white text-[#b91c1c] text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">
                🚨 RED ALERT
              </span>
              <span className="text-xs font-bold text-red-100 truncate">
                Two Class Timings Clashing!
              </span>
            </div>

            <p className="text-xs text-white/90 truncate font-medium mt-0.5">
              <span className="font-bold underline text-white">
                {primaryClash.classA.className}
              </span>{' '}
              clashes with{' '}
              <span className="font-bold underline text-white">
                {primaryClash.classB.className}
              </span>{' '}
              on {primaryClash.classA.dayOrDate} ({primaryClash.classA.startTime}–{primaryClash.classA.endTime} vs {primaryClash.classB.startTime}–{primaryClash.classB.endTime})
            </p>
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={handlePlaySound}
            title="Play Emergency Warning Chime"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Explicit Stop Red Alert button */}
          <button
            id="btn-stop-red-alert"
            onClick={handleStopAlert}
            title="Stop and silence the Red Alert"
            className="bg-black/35 hover:bg-black/55 text-white border border-white/30 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BellOff className="w-3.5 h-3.5 text-yellow-300" />
            <span>Stop Red Alert</span>
          </button>

          <button
            onClick={() => {
              playCutePop();
              onOpenClash(primaryClash);
            }}
            className="bg-white hover:bg-red-50 text-[#b91c1c] font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Resolve Conflict</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              playCutePop();
              onDismiss(primaryClash.id);
            }}
            title="Dismiss Alert"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
