import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  ArrowUpRight,
  TrendingUp,
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
import { AnalyticsData } from '../types';
import { api } from '../api';
import { PASTEL_TREATMENT_PALETTES } from '../utils/treatmentColors';

const COLORS = [
  PASTEL_TREATMENT_PALETTES.rct.hex,
  PASTEL_TREATMENT_PALETTES.cleaning.hex,
  PASTEL_TREATMENT_PALETTES.extraction.hex,
  PASTEL_TREATMENT_PALETTES.implant.hex,
  PASTEL_TREATMENT_PALETTES.braces.hex,
  PASTEL_TREATMENT_PALETTES.whitening.hex,
  PASTEL_TREATMENT_PALETTES.other.hex,
];

export const AnalyticsView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (m: string) => {
    try {
      setLoading(true);
      const res = await api.getAnalytics(m);
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedMonth);
  }, [selectedMonth]);

  const monthOptions = [
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
  ];

  if (!data && loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading dental analytics...
      </div>
    );
  }

  const treatmentChartData = data
    ? [
        { name: 'RCT', count: data.treatmentStats.rct },
        { name: 'Cleaning', count: data.treatmentStats.cleaning },
        { name: 'Extraction', count: data.treatmentStats.extraction },
        { name: 'Implants', count: data.treatmentStats.implant },
        { name: 'Braces', count: data.treatmentStats.braces },
        { name: 'Whitening', count: data.treatmentStats.whitening },
        { name: 'Other', count: data.treatmentStats.other },
      ]
    : [];

  return (
    <div className="space-y-5 text-slate-800">
      {/* Title Bar & Month Selector */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Monthly Dental Practice Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Dynamic statistics for patient footfall, clinical procedures, and follow-up completion rates
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Select Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-300 rounded bg-white text-slate-900 focus:border-blue-700 focus:outline-none shadow-xs"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data && (
        <>
          {/* Section 1: Patient Statistics */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              1. Patient Statistics ({monthOptions.find((m) => m.value === selectedMonth)?.label})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
                <div className="text-xs font-bold text-slate-600 mb-1">Total Clinic Patients</div>
                <div className="text-2xl font-black text-slate-900">{data.patientStats.total}</div>
                <div className="text-[11px] text-slate-500 mt-1">Cumulative Registered</div>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-lg border-2 border-blue-500 shadow-sm">
                <div className="text-xs font-black text-blue-900 mb-1">New Patients This Month</div>
                <div className="text-2xl font-black text-blue-800">{data.patientStats.newPatients}</div>
                <div className="text-[11px] text-blue-700 font-bold mt-1">Registered in {selectedMonth}</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
                <div className="text-xs font-bold text-slate-600 mb-1">Returning Patient Visits</div>
                <div className="text-2xl font-black text-emerald-700">{data.patientStats.returningPatients}</div>
                <div className="text-[11px] text-emerald-800 font-bold mt-1">Follow-up sittings</div>
              </div>
            </div>
          </div>

          {/* Section 2: Treatment Statistics */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              2. Treatment Statistics ({monthOptions.find((m) => m.value === selectedMonth)?.label})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
              {/* RCT - Pastel Sky Blue */}
              <div className="bg-sky-50/90 p-3 rounded-lg border border-sky-200 hover:border-sky-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-sky-950 block">RCT</span>
                <span className="text-xl font-black text-sky-900 block my-1">
                  {data.treatmentStats.rct}
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded border border-sky-200 inline-block">
                  patients
                </span>
              </div>

              {/* Cleaning - Pastel Mint Green */}
              <div className="bg-emerald-50/90 p-3 rounded-lg border border-emerald-200 hover:border-emerald-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-emerald-950 block">Cleaning</span>
                <span className="text-xl font-black text-emerald-900 block my-1">
                  {data.treatmentStats.cleaning}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                  patients
                </span>
              </div>

              {/* Extraction - Pastel Peach Amber */}
              <div className="bg-amber-50/90 p-3 rounded-lg border border-amber-200 hover:border-amber-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-amber-950 block">Extraction</span>
                <span className="text-xl font-black text-amber-900 block my-1">
                  {data.treatmentStats.extraction}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                  patients
                </span>
              </div>

              {/* Implants - Pastel Indigo */}
              <div className="bg-indigo-50/90 p-3 rounded-lg border border-indigo-200 hover:border-indigo-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-indigo-950 block">Implants</span>
                <span className="text-xl font-black text-indigo-900 block my-1">
                  {data.treatmentStats.implant}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded border border-indigo-200 inline-block">
                  patients
                </span>
              </div>

              {/* Braces - Pastel Lavender Violet */}
              <div className="bg-purple-50/90 p-3 rounded-lg border border-purple-200 hover:border-purple-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-purple-950 block">Braces</span>
                <span className="text-xl font-black text-purple-900 block my-1">
                  {data.treatmentStats.braces}
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded border border-purple-200 inline-block">
                  patients
                </span>
              </div>

              {/* Whitening - Pastel Rose Pink */}
              <div className="bg-rose-50/90 p-3 rounded-lg border border-rose-200 hover:border-rose-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-rose-950 block">Whitening</span>
                <span className="text-xl font-black text-rose-900 block my-1">
                  {data.treatmentStats.whitening}
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200 inline-block">
                  patients
                </span>
              </div>

              {/* Other - Pastel Aqua Teal */}
              <div className="bg-teal-50/90 p-3 rounded-lg border border-teal-200 hover:border-teal-400 shadow-xs text-center transition-all">
                <span className="text-xs font-black text-teal-950 block">Other</span>
                <span className="text-xl font-black text-teal-900 block my-1">
                  {data.treatmentStats.other}
                </span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-1.5 py-0.5 rounded border border-teal-200 inline-block">
                  treatments
                </span>
              </div>
            </div>

            {/* Treatment Chart */}
            <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm mt-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
                Treatment Breakdown Graph
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={treatmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Patients" fill="#1d4ed8" radius={[4, 4, 0, 0]}>
                      {treatmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 3: Follow-up Statistics */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              3. Follow-up Statistics ({monthOptions.find((m) => m.value === selectedMonth)?.label})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">Completed Sittings</div>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">
                    {data.followupStats.completed}
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">Upcoming Sittings</div>
                  <div className="text-2xl font-black text-teal-800 mt-0.5">
                    {data.followupStats.upcoming}
                  </div>
                </div>
                <Clock className="w-8 h-8 text-teal-600" />
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600">Overdue Follow-ups</div>
                  <div className="text-2xl font-black text-rose-700 mt-0.5">
                    {data.followupStats.overdue}
                  </div>
                </div>
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
