import React, { useState } from 'react';
import {
  CalendarClock,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Edit2,
  ExternalLink,
  BellRing,
} from 'lucide-react';
import { Followup, Patient } from '../types';

interface FollowupsViewProps {
  followups: Followup[];
  onSelectPatientById: (patientId: string) => void;
  onEditFollowup: (followup: Followup) => void;
  onCompleteFollowup: (followupId: string) => void;
  onSendReminder: (followupId: string, type?: string) => void;
  onTriggerAutomatedReminders: () => void;
  isTriggering: boolean;
}

type TabType = 'today' | 'upcoming' | 'overdue' | 'all';

export const FollowupsView: React.FC<FollowupsViewProps> = ({
  followups,
  onSelectPatientById,
  onEditFollowup,
  onCompleteFollowup,
  onSendReminder,
  onTriggerAutomatedReminders,
  isTriggering,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const todayStr = '2026-09-16';

  // Categorize
  const todayList = followups.filter(
    (f) => f.status !== 'completed' && f.followup_date === todayStr
  );
  const upcomingList = followups.filter(
    (f) => f.status !== 'completed' && f.followup_date > todayStr
  );
  const overdueList = followups.filter(
    (f) => f.status !== 'completed' && f.followup_date < todayStr
  );
  const allList = followups;

  const currentList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'overdue'
      ? overdueList
      : allList;

  return (
    <div className="space-y-4 text-slate-800">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Follow-Up & Appointments Management
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-900 rounded border border-blue-300">
              16 Sep 2026
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Dental sittings tracker with automated WhatsApp reminder triggers (1-day, 2-day, and same-day)
          </p>
        </div>

        {/* Runner Button */}
        <button
          onClick={onTriggerAutomatedReminders}
          disabled={isTriggering}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded border border-slate-700 shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <BellRing className={`w-4 h-4 text-amber-400 ${isTriggering ? 'animate-spin' : ''}`} />
          <span>{isTriggering ? 'Running Reminders...' : 'Send Due WhatsApp Reminders'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-lg border border-slate-300 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded transition cursor-pointer border flex items-center gap-2 ${
            activeTab === 'today'
              ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today ({todayList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded transition cursor-pointer border flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming ({upcomingList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded transition cursor-pointer border flex items-center gap-2 ${
            activeTab === 'overdue'
              ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Overdue ({overdueList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded transition cursor-pointer border flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>All Follow-ups ({allList.length})</span>
        </button>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-extrabold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Treatment</th>
                <th className="px-4 py-3">Follow-up Date</th>
                <th className="px-4 py-3">Follow-up Note</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">WhatsApp Reminder</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No follow-ups in the <strong>{activeTab}</strong> section.
                  </td>
                </tr>
              ) : (
                currentList.map((f) => {
                  const isToday = f.followup_date === todayStr;
                  const isOverdue = f.followup_date < todayStr && f.status !== 'completed';

                  return (
                    <tr
                      key={f.id}
                      className={`hover:bg-slate-50 transition ${
                        isToday ? 'bg-amber-50/30' : isOverdue ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectPatientById(f.patient_id)}
                          className="font-extrabold text-slate-900 hover:text-blue-700 text-left text-sm cursor-pointer"
                        >
                          {f.patient_name || 'Patient'}
                        </button>
                      </td>

                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{f.patient_phone}</span>
                          {f.patient_phone && (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${f.patient_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Direct WhatsApp"
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-teal-900">{f.treatment}</span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] border ${
                            isToday
                              ? 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-900 border-rose-400 font-extrabold'
                              : 'bg-teal-50 text-teal-900 border-teal-300'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {f.followup_date}
                          {isToday && ' (Today)'}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-medium max-w-xs">
                        {f.followup_note}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            f.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : isToday
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {f.status === 'completed' ? 'Completed' : isToday ? 'Due Today' : isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.whatsapp_status === 'Sent' || f.whatsapp_status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {f.whatsapp_status || 'Pending'}
                          </span>
                          {f.last_reminder_sent && (
                            <span className="text-[10px] text-slate-500 block">
                              Sent: {f.last_reminder_sent.split('T')[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPatientById(f.patient_id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border border-slate-300 cursor-pointer"
                            title="View patient profile"
                          >
                            View
                          </button>

                          <button
                            onClick={() => onEditFollowup(f)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded border border-teal-300 cursor-pointer flex items-center gap-1"
                            title="Edit follow-up date and note"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {f.status !== 'completed' && (
                            <>
                              <button
                                onClick={() => onSendReminder(f.id)}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded border border-emerald-900 cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Send automated WhatsApp reminder"
                              >
                                <Send className="w-3 h-3" />
                                <span>Reminder</span>
                              </button>

                              <button
                                onClick={() => onCompleteFollowup(f.id)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded border border-slate-900 cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Mark sitting completed"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
