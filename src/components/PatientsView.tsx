import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Phone,
  Calendar,
  Eye,
  CalendarClock,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Patient, PatientStatus, DOCTORS, TREATMENT_CATEGORIES } from '../types';
import { getPastelTreatmentConfig } from '../utils/treatmentColors';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAddPatient: () => void;
  onOpenSetFollowup: (patient: Patient) => void;
  onFilterChange: (filters: any) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onOpenAddPatient,
  onOpenSetFollowup,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    onFilterChange({
      search: val,
      treatment: selectedTreatment,
      doctor: selectedDoctor,
      status: selectedStatus,
      dateRange: selectedDateRange,
      sortBy,
    });
  };

  const handleFilterUpdate = (key: string, val: string) => {
    const updated = {
      search: searchTerm,
      treatment: key === 'treatment' ? val : selectedTreatment,
      doctor: key === 'doctor' ? val : selectedDoctor,
      status: key === 'status' ? val : selectedStatus,
      dateRange: key === 'dateRange' ? val : selectedDateRange,
      sortBy: key === 'sortBy' ? val : sortBy,
    };
    if (key === 'treatment') setSelectedTreatment(val);
    if (key === 'doctor') setSelectedDoctor(val);
    if (key === 'status') setSelectedStatus(val);
    if (key === 'dateRange') setSelectedDateRange(val);
    if (key === 'sortBy') setSortBy(val);

    onFilterChange(updated);
  };

  const statusBadges: Record<PatientStatus, string> = {
    'New': 'bg-blue-100 text-blue-900 border-blue-300',
    'Consultation': 'bg-indigo-100 text-indigo-900 border-indigo-300',
    'Treatment Ongoing': 'bg-amber-100 text-amber-900 border-amber-300',
    'Follow-up Due': 'bg-rose-100 text-rose-900 border-rose-300',
    'Treatment Completed': 'bg-emerald-100 text-emerald-900 border-emerald-300',
    'Inactive': 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Title Bar & Add Patient button */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Patient Directory
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Complete clinical records, treatment statuses, and scheduled dental sittings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded border border-slate-300">
            {patients.length} Patient{patients.length === 1 ? '' : 's'} Listed
          </span>
          <button
            onClick={onOpenAddPatient}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded border border-blue-900 shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls: High-Contrast & Solid */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, mobile number, ID or treatment..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
            />
          </div>

          {/* Treatment Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTreatment}
              onChange={(e) => handleFilterUpdate('treatment', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="all">All Treatments</option>
              {TREATMENT_CATEGORIES.map((cat) => (
                <optgroup key={cat.category} label={cat.category}>
                  {cat.treatments.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedDoctor}
              onChange={(e) => handleFilterUpdate('doctor', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="all">All Doctors</option>
              {DOCTORS.map((d) => (
                <option key={d} value={d}>
                  {d.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Consultation">Consultation</option>
              <option value="Treatment Ongoing">Treatment Ongoing</option>
              <option value="Follow-up Due">Follow-up Due</option>
              <option value="Treatment Completed">Treatment Completed</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="latest">Sort: Latest Added</option>
              <option value="upcoming_followup">Sort: Follow-up Date</option>
              <option value="name">Sort: Patient Name</option>
            </select>
          </div>
        </div>

        {/* Date Filter Quick Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-xs">
          <span className="font-bold text-slate-600">Date Filter:</span>
          {['all', 'this_month', 'last_month'].map((df) => (
            <button
              key={df}
              onClick={() => handleFilterUpdate('dateRange', df)}
              className={`px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                selectedDateRange === df
                  ? 'bg-blue-700 text-white border-blue-800'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {df === 'all' ? 'All Time' : df === 'this_month' ? 'This Month (Sep)' : 'Last Month (Aug)'}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-extrabold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Phone (WhatsApp)</th>
                <th className="px-4 py-3">Treatment</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Next Follow-up</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    No patients found matching your search or filters.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const isToday = p.next_followup === '2026-09-16';
                  const isOverdue = p.next_followup && p.next_followup < '2026-09-16';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/50 transition cursor-pointer"
                      onClick={() => onSelectPatient(p)}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-900">
                        {p.patient_id}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {p.age} yrs • {p.gender}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-800">{p.phone}</span>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${p.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open WhatsApp chat"
                            className="text-emerald-600 hover:text-emerald-800 p-0.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {(() => {
                          const tColor = getPastelTreatmentConfig(p.treatment);
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black border shadow-xs ${tColor.bg} ${tColor.border} ${tColor.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${tColor.dot}`} />
                              {p.treatment}
                            </span>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <span className="truncate max-w-[160px] block" title={p.doctor}>
                          {p.doctor ? p.doctor.split('(')[0] : 'Assigned Doctor'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {p.registration_date}
                      </td>

                      <td className="px-4 py-3">
                        {p.next_followup ? (
                          <div className="space-y-0.5">
                            <span
                              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] border ${
                                isToday
                                  ? 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold'
                                  : isOverdue
                                  ? 'bg-rose-100 text-rose-900 border-rose-400'
                                  : 'bg-teal-50 text-teal-900 border-teal-300'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {p.next_followup}
                              {isToday && ' (Today)'}
                              {isOverdue && ' (Overdue)'}
                            </span>
                            {p.followup_note && (
                              <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                                {p.followup_note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${statusBadges[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPatient(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border border-slate-300 cursor-pointer shadow-xs"
                            title="View complete clinical profile"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onOpenSetFollowup(p)}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded border border-teal-800 cursor-pointer shadow-xs"
                            title="Schedule follow-up sitting"
                          >
                            Follow-up
                          </button>
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
