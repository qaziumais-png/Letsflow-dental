import React, { useState } from 'react';
import {
  X,
  UserPlus,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { TREATMENT_CATEGORIES, DOCTORS, Gender } from '../types';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<{ patient: any; welcomeMessageResult: any }>;
  totalPatientsCount: number;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  totalPatientsCount,
}) => {
  const nextId = `DENT-2026-${String(totalPatientsCount + 1).padStart(3, '0')}`;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<string>('30');
  const [gender, setGender] = useState<Gender>('Male');
  const [visitDate, setVisitDate] = useState('2026-09-16');
  const [complaint, setComplaint] = useState('');
  const [treatment, setTreatment] = useState('Root Canal Treatment (RCT)');
  const [treatmentCustom, setTreatmentCustom] = useState('');
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [notes, setNotes] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [followupNote, setFollowupNote] = useState('');
  const [sendWelcomeMsg, setSendWelcomeMsg] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    patient: any;
    welcomeMessageResult: any;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter Patient Name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter Patient Mobile Number for WhatsApp communication.');
      return;
    }

    const finalTreatment = treatment === 'Other Treatment' ? (treatmentCustom.trim() || 'Other Dental Treatment') : treatment;

    try {
      setLoading(true);
      const res = await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        age: parseInt(age, 10) || 30,
        gender,
        complaint: complaint.trim(),
        treatment: finalTreatment,
        treatment_custom: treatment === 'Other Treatment' ? treatmentCustom.trim() : undefined,
        doctor,
        status: followupDate ? 'Follow-up Due' : 'Treatment Ongoing',
        registration_date: visitDate,
        last_visit: visitDate,
        next_followup: followupDate || null,
        followup_note: followupDate ? (followupNote.trim() || `${finalTreatment} follow-up sitting`) : null,
        notes: notes.trim(),
        sendWelcomeMessage: sendWelcomeMsg,
      });

      setSuccessInfo(res);
    } catch (err: any) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessInfo(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header: Solid Indian Govt aesthetic */}
        <div className="bg-blue-800 text-white px-6 py-4 rounded-t-lg flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-700 border border-blue-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">New Patient Registration</h2>
              <p className="text-xs text-blue-200">Patient Directory & Automated WhatsApp Onboarding</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-blue-200 hover:text-white p-1 rounded hover:bg-blue-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 space-y-5">
          {successInfo ? (
            <div className="space-y-4 py-3">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-md">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-emerald-900 text-base">
                      Patient Successfully Registered!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Patient ID: <strong className="text-emerald-950 font-mono text-sm">{successInfo.patient.patient_id}</strong> — {successInfo.patient.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Message Status Banner */}
              <div className="p-4 bg-blue-50 border border-blue-300 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Welcome Message</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-600 text-white">
                    {successInfo.welcomeMessageResult?.status || 'Sent'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded border border-blue-200 font-sans">
                  "Hello <strong>{successInfo.patient.name}</strong>, Welcome to DentCare Dental Clinic & Implant Centre 🦷 Thank you for visiting us. We look forward to taking care of your smile."
                </p>
                {successInfo.welcomeMessageResult?.waMeUrl && (
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Direct WhatsApp Link for Mobile/Web:</span>
                    <a
                      href={successInfo.welcomeMessageResult.waMeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1"
                    >
                      Open in WhatsApp Web ↗
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 text-xs font-extrabold rounded bg-blue-800 text-white hover:bg-blue-900 cursor-pointer shadow-sm"
                >
                  Done & View Directory
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Patient ID Preview Banner */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded border border-slate-300 text-xs">
                <span className="font-semibold text-slate-700">Auto-Generated Patient ID:</span>
                <span className="font-mono font-extrabold text-blue-800 bg-white px-2.5 py-1 rounded border border-slate-300 text-sm">
                  {nextId}
                </span>
              </div>

              {/* Row 1: Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Patient Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Mobile Number (WhatsApp) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                  />
                  <span className="text-[11px] text-slate-500">Include country code if outside India.</span>
                </div>
              </div>

              {/* Row 2: Age, Gender, Visit Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Date of Visit</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                  />
                </div>
              </div>

              {/* Dental Problem / Complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Dental Problem / Complaint
                </label>
                <input
                  type="text"
                  placeholder="e.g. Throbbing pain in lower molar, bleeding gums, crowding"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                />
              </div>

              {/* Treatment Selected (Categorized Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Treatment Selected <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-semibold text-slate-900"
                  >
                    {TREATMENT_CATEGORIES.map((cat) => (
                      <optgroup key={cat.category} label={`--- ${cat.category} ---`}>
                        {cat.treatments.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Attending Doctor <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium text-slate-900"
                  >
                    {DOCTORS.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {treatment === 'Other Treatment' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Custom Treatment Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom dental treatment name"
                    value={treatmentCustom}
                    onChange={(e) => setTreatmentCustom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-amber-400 bg-amber-50/50 rounded focus:border-blue-700 focus:outline-none font-medium"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  placeholder="Medical history, allergies, specific medications, tooth number..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                />
              </div>

              {/* Manual Follow-up Section */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-md space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Schedule Next Follow-Up (Optional)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:border-blue-700 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Follow-up Purpose / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RCT second sitting, suture removal"
                      value={followupNote}
                      onChange={(e) => setFollowupNote(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white focus:border-blue-700 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Welcome Automation Trigger */}
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Send WhatsApp Welcome Message
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Dispatches personalized clinic welcome message to patient immediately.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendWelcomeMsg}
                  onChange={(e) => setSendWelcomeMsg(e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Action Buttons: Solid Indian govt style */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-bold rounded border border-slate-400 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-extrabold rounded bg-blue-700 hover:bg-blue-800 text-white border border-blue-900 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Patient & Send WhatsApp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
