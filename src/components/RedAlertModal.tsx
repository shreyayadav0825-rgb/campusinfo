import React from 'react';
import { ClassClash } from '../types';
import { playCutePop } from '../utils/sound';
import {
  AlertOctagon,
  X,
  Clock,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  MapPin,
  ArrowRight,
  ShieldAlert,
  BellOff,
} from 'lucide-react';
import { stopRedAlertSound } from '../utils/sound';

interface RedAlertModalProps {
  clash: ClassClash | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (clashId: string) => void;
  onStopAlert?: () => void;
  onOpenEmailReply?: (recipient: string, subject: string, bodyText: string) => void;
}

export const RedAlertModal: React.FC<RedAlertModalProps> = ({
  clash,
  isOpen,
  onClose,
  onResolve,
  onStopAlert,
  onOpenEmailReply,
}) => {
  if (!isOpen || !clash) return null;

  const { classA, classB, overlapDescription } = clash;

  const handleSendProfEmail = () => {
    playCutePop();
    const recipient = classA.instructorOrSender || 'professor@campus.edu';
    const subject = `Urgent: Schedule Clash Conflict - ${classA.className} vs ${classB.className}`;
    const body = `Dear ${classA.instructorOrSender || 'Professor / Course Instructor'},

I am writing to notify you of a direct schedule conflict. 

My session for "${classA.className}" (${classA.dayOrDate}, ${classA.startTime} - ${classA.endTime}) clashes directly with "${classB.className}" (${classB.dayOrDate}, ${classB.startTime} - ${classB.endTime}).

Details of Conflict:
• ${classA.className}: ${classA.dayOrDate} at ${classA.startTime} (${classA.locationOrRoom || 'Campus'})
• ${classB.className}: ${classB.dayOrDate} at ${classB.startTime} (${classB.locationOrRoom || 'Campus'})

Could you please advise if there is an alternate makeup section, recorded lecture, or alternate lab time available?

Thank you very much for your understanding,
[Your Name]`;

    if (onOpenEmailReply) {
      onOpenEmailReply(recipient, subject, body);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="red-alert-modal-container"
        className="bg-[#fffdfd] rounded-2xl max-w-2xl w-full border-2 border-[#ef4444] shadow-2xl overflow-hidden relative"
      >
        {/* Urgent Emergency Header */}
        <div className="bg-gradient-to-r from-[#dc2626] via-[#b91c1c] to-[#991b1b] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-[#b91c1c] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Red Alert Triggered
                </span>
                <span className="text-xs text-red-100 font-medium">
                  Detected at {clash.detectedAt}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-title mt-0.5">
                Two Classes Clashing!
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playCutePop();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Overlap Summary Card */}
          <div className="bg-[#fef2f2] border-l-4 border-[#dc2626] p-3.5 rounded-r-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#dc2626] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#991b1b] uppercase tracking-wide">
                Conflict Breakdown
              </h4>
              <p className="text-xs text-[#7f1d1d] font-medium mt-0.5 leading-relaxed">
                {overlapDescription}
              </p>
              <p className="text-[11px] text-[#b91c1c] mt-1">
                Source: Detected across{' '}
                <span className="font-bold underline">
                  {clash.source === 'whatsapp'
                    ? 'WhatsApp Study Circle Summaries'
                    : clash.source === 'gmail'
                    ? 'Campus Gmail Professor Notices'
                    : 'WhatsApp & Gmail Notices'}
                </span>
              </p>
            </div>
          </div>

          {/* Comparative Cards: Class A vs Class B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Class A */}
            <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-md">
                  Class 1
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                  {classA.source.startsWith('whatsapp') ? (
                    <>
                      <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
                    </>
                  ) : (
                    <>
                      <Mail className="w-3 h-3 text-rose-600" /> Gmail
                    </>
                  )}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#0f172a]">
                {classA.className}
              </h3>

              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex items-center gap-1.5 font-semibold text-red-700">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    {classA.dayOrDate} • {classA.startTime} – {classA.endTime}
                  </span>
                </div>
                {classA.locationOrRoom && (
                  <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{classA.locationOrRoom}</span>
                  </div>
                )}
                {classA.instructorOrSender && (
                  <p className="text-[11px] text-gray-500">
                    From: <span className="font-medium text-gray-700">{classA.instructorOrSender}</span>
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-2 rounded-lg text-[11px] text-gray-600 italic border border-gray-200 line-clamp-3">
                "{classA.snippet}"
              </div>
            </div>

            {/* Class B */}
            <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-md">
                  Class 2
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                  {classB.source.startsWith('whatsapp') ? (
                    <>
                      <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
                    </>
                  ) : (
                    <>
                      <Mail className="w-3 h-3 text-rose-600" /> Gmail
                    </>
                  )}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#0f172a]">
                {classB.className}
              </h3>

              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex items-center gap-1.5 font-semibold text-red-700">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    {classB.dayOrDate} • {classB.startTime} – {classB.endTime}
                  </span>
                </div>
                {classB.locationOrRoom && (
                  <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{classB.locationOrRoom}</span>
                  </div>
                )}
                {classB.instructorOrSender && (
                  <p className="text-[11px] text-gray-500">
                    From: <span className="font-medium text-gray-700">{classB.instructorOrSender}</span>
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-2 rounded-lg text-[11px] text-gray-600 italic border border-gray-200 line-clamp-3">
                "{classB.snippet}"
              </div>
            </div>
          </div>

          {/* Visual Conflict Timeline */}
          <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-[#475569] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              Visual Schedule Overlap Timeline ({classA.dayOrDate})
            </h4>
            
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-500 font-medium truncate shrink-0">{classA.courseCode || 'Class 1'}</span>
                <div className="flex-1 bg-gray-100 rounded-md h-5 relative overflow-hidden flex items-center">
                  <div className="absolute left-[15%] w-[45%] h-full bg-red-400/80 rounded flex items-center px-1.5 text-[9px] text-white font-bold">
                    {classA.startTime}–{classA.endTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 text-gray-500 font-medium truncate shrink-0">{classB.courseCode || 'Class 2'}</span>
                <div className="flex-1 bg-gray-100 rounded-md h-5 relative overflow-hidden flex items-center">
                  <div className="absolute left-[15%] w-[65%] h-full bg-red-600/90 rounded flex items-center px-1.5 text-[9px] text-white font-bold">
                    {classB.startTime}–{classB.endTime}
                  </div>
                </div>
              </div>

              {/* Clash warning marker */}
              <div className="flex items-center justify-end text-[10px] text-red-600 font-bold gap-1 pt-1">
                <AlertOctagon className="w-3 h-3" />
                <span>Direct Overlap between 3:00 PM and 4:30 PM!</span>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-[#fff1f2] border border-rose-200 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-[#881337] uppercase tracking-wider">
              Immediate Action Steps
            </h4>
            <ul className="text-xs text-[#9f1239] space-y-1 list-disc list-inside">
              <li>Notify the course coordinator or TA of the time clash immediately.</li>
              <li>Ask if the lab session has an alternate makeup slot or if lecture will be recorded.</li>
              <li>Request attendance exemption or asynchronous credit before the deadline.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="modal-stop-alert-btn"
              onClick={() => {
                playCutePop();
                stopRedAlertSound();
                if (onStopAlert) {
                  onStopAlert();
                } else {
                  onResolve(clash.id);
                }
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <BellOff className="w-3.5 h-3.5 text-red-600" />
              <span>Stop Red Alert</span>
            </button>

            <button
              onClick={() => {
                playCutePop();
                onResolve(clash.id);
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark Resolved</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                playCutePop();
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2 text-gray-600 hover:text-gray-900 rounded-xl text-xs font-medium"
            >
              Dismiss
            </button>

            <button
              onClick={handleSendProfEmail}
              className="w-full sm:w-auto px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Professor About Conflict</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
