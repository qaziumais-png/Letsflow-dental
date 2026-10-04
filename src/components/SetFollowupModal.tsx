import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Patient, ReminderTiming } from '../types';

interface SetFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  patientsList: Patient[];
  onSave: (data: {
    patient_id: string;
    followup_date: string;
    followup_note: string;
    reminder_timing: ReminderTiming;
  }) => Promise<void>;
}

export const SetFollowupModal: React.FC<SetFollowupModalProps> = ({
  isOpen,
  onClose,
  patient,
  patientsList,
  onSave,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patient ? patient.id : (patientsList[0]?.id || ''));
  const [followupDate, setFollowupDate] = useState(patient?.next_followup || '2026-09-22');
  const [followupNote, setFollowupNote] = useState(patient?.followup_note || 'Second sitting consultation');
  const [reminderTiming, setReminderTiming] = useState<ReminderTiming>('1_day_before');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPatient = patient || patientsList.find((p) => p.id === selectedPatientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) {
      setError('Please select a follow-up date.');
      return;
    }
    const pid = patient ? patient.id : selectedPatientId;
    if (!pid) {
      setError('Please select a patient.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        patient_id: pid,
        followup_date: followupDate,
        followup_note: followupNote.trim() || 'Scheduled sitting',
        reminder_timing: reminderTiming,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-teal-800 text-white px-6 py-4 flex items-center justify-between border-b border-teal-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-700 border border-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">
                {patient ? `Schedule Follow-Up: ${patient.name}` : 'Set Patient Follow-Up'}
              </h2>
              <p className="text-xs text-teal-200">Dental Sitting & Automated WhatsApp Reminder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded hover:bg-teal-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!patient ? (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Select Patient <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  const p = patientsList.find((item) => item.id === e.target.value);
                  if (p?.treatment) {
                    setFollowupNote(`${p.treatment} follow-up sitting`);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-teal-700 focus:outline-none bg-white font-medium"
              >
                {patientsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_id} — {p.name} ({p.treatment})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
              <div className="text-slate-600">
                Patient ID: <span className="font-mono font-bold text-blue-800">{patient.patient_id}</span> | Phone: {patient.phone}
              </div>
              <div className="text-teal-800 font-semibold">
                Treatment: {patient.treatment}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Follow-up Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              required
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-teal-700 focus:outline-none bg-white font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Follow-up Purpose / Note <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RCT second sitting, crown trial, suture removal"
              value={followupNote}
              onChange={(e) => setFollowupNote(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-teal-700 focus:outline-none bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              WhatsApp Reminder Timing
            </label>
            <select
              value={reminderTiming}
              onChange={(e) => setReminderTiming(e.target.value as ReminderTiming)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-teal-700 focus:outline-none bg-white font-medium"
            >
              <option value="1_day_before">1 Day Before Appointment (Recommended)</option>
              <option value="2_days_before">2 Days Before Appointment</option>
              <option value="same_day">Same Day Morning (8:00 AM)</option>
            </select>
          </div>

          {/* Footer Buttons: Solid style */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded border border-slate-400 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-extrabold rounded bg-teal-700 hover:bg-teal-800 text-white border border-teal-900 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Follow-Up & Enable WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
