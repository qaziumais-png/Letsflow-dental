import React, { useState } from 'react';
import { X, Stethoscope, AlertCircle } from 'lucide-react';
import { Patient, DOCTORS } from '../types';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (visit: {
    visit_date: string;
    treatment: string;
    doctor: string;
    notes: string;
  }) => Promise<void>;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
  const [visitDate, setVisitDate] = useState('2026-09-16');
  const [treatment, setTreatment] = useState(patient.treatment);
  const [doctor, setDoctor] = useState(patient.doctor || DOCTORS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSave({
        visit_date: visitDate,
        treatment,
        doctor,
        notes: notes.trim() || 'Clinical visit logged.',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden">
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between border-b border-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Record Clinical Visit</h2>
              <p className="text-xs text-slate-300">Patient: {patient.name} ({patient.patient_id})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Visit Date</label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Treatment Performed</label>
            <input
              type="text"
              required
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Doctor</label>
            <select
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
            >
              {DOCTORS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Clinical Notes & Observations</label>
            <textarea
              rows={3}
              placeholder="Tooth condition, procedure steps, medicines prescribed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
            />
          </div>

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
              className="px-5 py-2 text-xs font-extrabold rounded bg-blue-700 hover:bg-blue-800 text-white border border-blue-900 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Visit Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
