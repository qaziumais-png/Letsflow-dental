import React from 'react';
import {
  UserPlus,
  CalendarPlus,
  BellRing,
  CheckCircle2,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  clinicName: string;
  onOpenAddPatient: () => void;
  onOpenSetFollowup: () => void;
  onRunReminders: () => void;
  isRunningReminders: boolean;
  todayCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  clinicName,
  onOpenAddPatient,
  onOpenSetFollowup,
  onRunReminders,
  isRunningReminders,
  todayCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3.5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title & Clinic Info */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {clinicName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              WhatsApp Live
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
            <span>Today: <strong>16 September 2026</strong></span>
            <span>•</span>
            <span>{todayCount} follow-up{todayCount === 1 ? '' : 's'} scheduled today</span>
          </p>
        </div>

        {/* Action Buttons: Solid, high contrast, clean */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            id="header-run-reminders-btn"
            onClick={onRunReminders}
            disabled={isRunningReminders}
            title="Check and trigger scheduled WhatsApp reminders"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <BellRing className={`w-3.5 h-3.5 text-amber-400 ${isRunningReminders ? 'animate-spin' : ''}`} />
            <span>{isRunningReminders ? 'Checking...' : 'Run Due Reminders'}</span>
          </button>

          <button
            id="header-set-followup-btn"
            onClick={onOpenSetFollowup}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded bg-teal-700 hover:bg-teal-800 text-white border border-teal-800 shadow-sm transition cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-teal-200" />
            <span>Set Follow-up</span>
          </button>

          <button
            id="header-add-patient-btn"
            onClick={onOpenAddPatient}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded bg-blue-700 hover:bg-blue-800 text-white border border-blue-900 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>+ Add Patient</span>
          </button>
        </div>
      </div>
    </header>
  );
};
