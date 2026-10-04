import React from 'react';
import {
  Users,
  UserPlus,
  CalendarCheck,
  CalendarClock,
  AlertOctagon,
  Activity,
  MessageSquare,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Phone,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardStats, Followup } from '../types';
import { PASTEL_TREATMENT_PALETTES } from '../utils/treatmentColors';

interface DashboardViewProps {
  stats: DashboardStats | null;
  todayFollowups: Followup[];
  onOpenAddPatient: () => void;
  onOpenSetFollowup: () => void;
  onNavigateToPatients: () => void;
  onNavigateToFollowups: () => void;
  onSendFollowupReminder: (followupId: string) => void;
  onCompleteFollowup: (followupId: string) => void;
  onTriggerReminders: () => void;
}

const COLORS = [
  PASTEL_TREATMENT_PALETTES.rct.hex,
  PASTEL_TREATMENT_PALETTES.cleaning.hex,
  PASTEL_TREATMENT_PALETTES.extraction.hex,
  PASTEL_TREATMENT_PALETTES.implant.hex,
  PASTEL_TREATMENT_PALETTES.braces.hex,
  PASTEL_TREATMENT_PALETTES.whitening.hex,
  PASTEL_TREATMENT_PALETTES.other.hex,
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  todayFollowups,
  onOpenAddPatient,
  onOpenSetFollowup,
  onNavigateToPatients,
  onNavigateToFollowups,
  onSendFollowupReminder,
  onCompleteFollowup,
  onTriggerReminders,
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading dental clinic dashboard...
      </div>
    );
  }

  // Calculate high-level treatment counts matching user's requested breakdown
  const getTreatmentCount = (matchKeywords: string[]) => {
    return stats.treatmentBreakdown
      .filter((t) => matchKeywords.some((k) => t.treatment.toLowerCase().includes(k.toLowerCase())))
      .reduce((sum, item) => sum + item.count, 0);
  };

  const rctCount = getTreatmentCount(['root canal', 'rct']);
  const cleaningCount = getTreatmentCount(['cleaning', 'scaling', 'polishing']);
  const extractionCount = getTreatmentCount(['extraction', 'wisdom']);
  const implantCount = getTreatmentCount(['implant']);
  const bracesCount = getTreatmentCount(['braces', 'aligner', 'retainer']);
  const whiteningCount = getTreatmentCount(['whitening', 'veneer']);
  const coreSum = rctCount + cleaningCount + extractionCount + implantCount + bracesCount + whiteningCount;
  const otherCount = Math.max(0, stats.totalPatients - coreSum);

  const treatmentCards = [
    {
      name: 'Root Canal Treatment (RCT)',
      shortName: 'RCT',
      count: rctCount,
      ...PASTEL_TREATMENT_PALETTES.rct,
    },
    {
      name: 'Dental Cleaning',
      shortName: 'Cleaning',
      count: cleaningCount,
      ...PASTEL_TREATMENT_PALETTES.cleaning,
    },
    {
      name: 'Tooth Extraction',
      shortName: 'Extraction',
      count: extractionCount,
      ...PASTEL_TREATMENT_PALETTES.extraction,
    },
    {
      name: 'Dental Implant',
      shortName: 'Implant',
      count: implantCount,
      ...PASTEL_TREATMENT_PALETTES.implant,
    },
    {
      name: 'Braces / Aligners',
      shortName: 'Braces',
      count: bracesCount,
      ...PASTEL_TREATMENT_PALETTES.braces,
    },
    {
      name: 'Teeth Whitening',
      shortName: 'Whitening',
      count: whiteningCount,
      ...PASTEL_TREATMENT_PALETTES.whitening,
    },
    {
      name: 'Other Treatments',
      shortName: 'Other',
      count: otherCount,
      ...PASTEL_TREATMENT_PALETTES.other,
    },
  ];

  const pieData = treatmentCards.map((t) => ({ name: t.name, value: t.count || 1 }));

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner / Welcome & Quick Actions Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Clinic Operations Dashboard
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Dental patient register, sitting schedules, and automated WhatsApp patient engagement
          </p>
        </div>

        {/* Prominent Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-quick-add-patient"
            onClick={onOpenAddPatient}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded border border-blue-900 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Patient</span>
          </button>

          <button
            id="dash-quick-set-followup"
            onClick={onOpenSetFollowup}
            className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded border border-teal-900 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <CalendarClock className="w-4 h-4" />
            <span>Set Follow-up</span>
          </button>

          <button
            id="dash-quick-view-patients"
            onClick={onNavigateToPatients}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded border border-slate-400 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Patient Directory</span>
          </button>

          <button
            id="dash-quick-view-today"
            onClick={onNavigateToFollowups}
            className="px-3.5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded border border-amber-900 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Today's Follow-ups ({stats.followupsToday})</span>
          </button>
        </div>
      </div>

      {/* 6 Summary Metric Cards: Solid, High-Contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Patients */}
        <div
          onClick={onNavigateToPatients}
          className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm hover:border-blue-600 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Patients</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalPatients}</div>
          <div className="text-[11px] text-blue-700 font-bold mt-1">All Registered</div>
        </div>

        {/* New Patients This Month */}
        <div
          onClick={onNavigateToPatients}
          className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm hover:border-emerald-600 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">New (Sep '26)</span>
            <UserPlus className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">{stats.newPatientsThisMonth}</div>
          <div className="text-[11px] text-emerald-800 font-bold mt-1">This Month</div>
        </div>

        {/* Active Treatments */}
        <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Cases</span>
            <Activity className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-black text-indigo-900 tracking-tight">{stats.activeTreatments}</div>
          <div className="text-[11px] text-indigo-700 font-bold mt-1">Ongoing Dental</div>
        </div>

        {/* Follow-ups Due */}
        <div
          onClick={onNavigateToFollowups}
          className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm hover:border-teal-600 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Follow-ups Due</span>
            <CalendarCheck className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-black text-teal-800 tracking-tight">{stats.followupsDue}</div>
          <div className="text-[11px] text-teal-700 font-bold mt-1">Pending Sittings</div>
        </div>

        {/* Follow-ups Today */}
        <div
          onClick={onNavigateToFollowups}
          className="bg-amber-50/70 p-4 rounded-lg border-2 border-amber-500 shadow-sm hover:border-amber-600 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-black uppercase tracking-wider">Today's Visits</span>
            <CalendarClock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">{stats.followupsToday}</div>
          <div className="text-[11px] text-amber-800 font-extrabold mt-1">Scheduled Today</div>
        </div>

        {/* Overdue Follow-ups */}
        <div
          onClick={onNavigateToFollowups}
          className={`p-4 rounded-lg border shadow-sm transition cursor-pointer ${
            stats.overdueFollowups > 0
              ? 'bg-rose-50 border-rose-400 hover:border-rose-600'
              : 'bg-white border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Overdue</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">{stats.overdueFollowups}</div>
          <div className="text-[11px] text-rose-800 font-bold mt-1">Missed Date</div>
        </div>
      </div>

      {/* Treatment Breakdown Section: Dynamic from DB with distinct pastel colors */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Treatment Breakdown & Patient Counts</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                7 Pastel Categories
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Live calculated patient distribution across clinical dental specialties in pastel color-coded fields
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 bg-blue-100 text-blue-900 rounded border border-blue-300 self-start sm:self-auto">
            {stats.totalPatients} Active Records
          </span>
        </div>

        {/* Grid of distinct pastel treatment cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {treatmentCards.map((item) => (
            <div
              key={item.name}
              className={`p-3.5 rounded-lg border shadow-xs transition-all flex items-center justify-between gap-3 ${item.bg} ${item.border} ${item.borderHover}`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                  <span className={`text-xs font-black truncate block ${item.text}`} title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className={`text-[11px] font-semibold ${item.subtext}`}>
                    {stats.totalPatients > 0
                      ? Math.round((item.count / stats.totalPatients) * 100)
                      : 0}
                    % of total
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-white/70 ${item.subtext}`}>
                    {item.colorName}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-lg font-black px-2.5 py-1 rounded inline-block shadow-xs ${item.badge} ${item.badgeText}`}>
                  {item.count}
                </span>
                <span className={`text-[10px] font-bold block mt-0.5 ${item.subtext}`}>patients</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Today's Follow-up Action List & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Follow-ups Immediate Action Center (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Today's Appointments ({todayFollowups.length})
                </h3>
                <p className="text-[11px] text-slate-500">16 September 2026</p>
              </div>
            </div>
            <button
              onClick={onNavigateToFollowups}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              View All ↗
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[360px]">
            {todayFollowups.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No follow-ups due today. You are all caught up!
              </div>
            ) : (
              todayFollowups.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded border border-amber-300 bg-amber-50/50 flex flex-col gap-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{f.patient_name}</h4>
                      <p className="text-teal-800 font-semibold">{f.treatment}</p>
                      <p className="text-slate-600 mt-0.5 text-[11px]">{f.followup_note}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                      Due Today
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {f.patient_phone}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSendFollowupReminder(f.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Send WhatsApp appointment reminder"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => onCompleteFollowup(f.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visual Analytics Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Patient Trend Chart */}
          <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Monthly Patient Registration Trend
                </h3>
                <p className="text-[11px] text-slate-500">New patient intake over recent months</p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="newPatients" name="New Patients" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalVisits" name="Total Clinical Visits" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
