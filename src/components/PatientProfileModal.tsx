import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  MessageSquare,
  Plus,
  Send,
  Edit,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Patient, Visit, Followup, MessageLog, PatientStatus } from '../types';
import { api } from '../api';
import { getPastelTreatmentConfig } from '../utils/treatmentColors';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onOpenSetFollowup: (patient: Patient) => void;
  onOpenAddVisit: (patient: Patient) => void;
  onPatientUpdated: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onOpenSetFollowup,
  onOpenAddVisit,
  onPatientUpdated,
}) => {
  const [data, setData] = useState<{
    patient: Patient;
    visits: Visit[];
    followups: Followup[];
    messages: MessageLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick custom WhatsApp message modal inside profile
  const [showCustomMsgInput, setShowCustomMsgInput] = useState(false);
  const [customMsgText, setCustomMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState<string | null>(null);

  // Status editing state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPatientById(patientId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      loadDetails();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: PatientStatus) => {
    if (!data) return;
    try {
      setIsUpdatingStatus(true);
      await api.updatePatient(data.patient.id, { status: newStatus });
      setData({
        ...data,
        patient: { ...data.patient, status: newStatus },
      });
      onPatientUpdated();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!data || !customMsgText.trim()) return;
    try {
      setSendingMsg(true);
      setMsgFeedback(null);
      const res = await api.sendCustomWhatsApp({
        patient_id: data.patient.id,
        phone: data.patient.phone,
        name: data.patient.name,
        message: customMsgText.trim(),
      });
      setMsgFeedback('WhatsApp message dispatched successfully!');
      setCustomMsgText('');
      setShowCustomMsgInput(false);
      // Reload profile to show in WhatsApp activity
      loadDetails();
      onPatientUpdated();
    } catch (err: any) {
      setMsgFeedback('Error: ' + err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCompleteFollowup = async (followupId: string) => {
    try {
      await api.completeFollowup(followupId);
      loadDetails();
      onPatientUpdated();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleSendFollowupReminder = async (followupId: string) => {
    try {
      await api.sendFollowupReminder(followupId);
      alert('WhatsApp reminder sent!');
      loadDetails();
      onPatientUpdated();
    } catch (err: any) {
      alert('Failed to send reminder: ' + err.message);
    }
  };

  const statusColors: Record<PatientStatus, string> = {
    'New': 'bg-blue-100 text-blue-900 border-blue-300',
    'Consultation': 'bg-indigo-100 text-indigo-900 border-indigo-300',
    'Treatment Ongoing': 'bg-amber-100 text-amber-900 border-amber-300',
    'Follow-up Due': 'bg-rose-100 text-rose-900 border-rose-300',
    'Treatment Completed': 'bg-emerald-100 text-emerald-900 border-emerald-300',
    'Inactive': 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto">
        {/* Header: Solid high-contrast Indian govt style */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between border-b border-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-700 border border-blue-500 flex items-center justify-center font-bold text-lg">
              {data?.patient.name ? data.patient.name.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-extrabold text-lg tracking-tight">
                  {data?.patient.name || 'Patient Profile'}
                </h2>
                {data?.patient && (
                  <span className="font-mono text-xs font-extrabold bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                    {data.patient.patient_id}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {data?.patient.phone}
                </span>
                <span>•</span>
                <span>Registered: {data?.patient.registration_date}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Toolbar */}
        {data?.patient && (
          <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Status:</span>
              <select
                value={data.patient.status}
                onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
                disabled={isUpdatingStatus}
                className={`font-bold px-2 py-1 rounded border text-xs cursor-pointer ${statusColors[data.patient.status]}`}
              >
                <option value="New">New</option>
                <option value="Consultation">Consultation</option>
                <option value="Treatment Ongoing">Treatment Ongoing</option>
                <option value="Follow-up Due">Follow-up Due</option>
                <option value="Treatment Completed">Treatment Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAddVisit(data.patient)}
                className="px-3 py-1.5 font-bold rounded bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Visit</span>
              </button>

              <button
                onClick={() => onOpenSetFollowup(data.patient)}
                className="px-3 py-1.5 font-bold rounded bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Set Follow-up</span>
              </button>

              <button
                onClick={() => setShowCustomMsgInput(!showCustomMsgInput)}
                className="px-3 py-1.5 font-bold rounded bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Feedback Banner */}
        {msgFeedback && (
          <div className="bg-emerald-100 border-b border-emerald-300 text-emerald-900 px-6 py-2 text-xs font-bold flex items-center justify-between">
            <span>{msgFeedback}</span>
            <button onClick={() => setMsgFeedback(null)} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {/* Direct WhatsApp Quick Send Drawer */}
        {showCustomMsgInput && data && (
          <div className="bg-emerald-50/90 border-b border-emerald-300 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                Direct WhatsApp Message to {data.patient.name} ({data.patient.phone})
              </span>
              <button
                onClick={() => setShowCustomMsgInput(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Type message to send directly via WhatsApp API..."
              value={customMsgText}
              onChange={(e) => setCustomMsgText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-emerald-400 rounded bg-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSendCustomMessage}
                disabled={sendingMsg || !customMsgText.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded cursor-pointer disabled:opacity-50"
              >
                {sendingMsg ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading patient clinical records...
            </div>
          ) : error || !data ? (
            <div className="py-8 text-center text-red-600 text-sm font-medium">
              {error || 'Patient data not found.'}
            </div>
          ) : (
            <>
              {/* Row 1: Patient Information & Current Treatment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Patient Information */}
                <div className="bg-slate-50 border border-slate-300 rounded-md p-4 space-y-2.5">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <User className="w-4 h-4 text-blue-700" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Age / Gender:</span>
                      <strong className="text-slate-900 font-semibold">{data.patient.age} yrs • {data.patient.gender}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone (WhatsApp):</span>
                      <strong className="text-slate-900 font-semibold">{data.patient.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Registration Date:</span>
                      <strong className="text-slate-900 font-semibold">{data.patient.registration_date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Last Visit:</span>
                      <strong className="text-slate-900 font-semibold">{data.patient.last_visit || 'N/A'}</strong>
                    </div>
                  </div>
                  {data.patient.complaint && (
                    <div className="text-xs pt-1.5 border-t border-slate-200">
                      <span className="text-slate-500 font-medium block">Chief Complaint:</span>
                      <p className="text-slate-800 font-medium mt-0.5">{data.patient.complaint}</p>
                    </div>
                  )}
                  {data.patient.notes && (
                    <div className="text-xs pt-1">
                      <span className="text-slate-500 font-medium block">Clinical Notes:</span>
                      <p className="text-slate-700 italic mt-0.5">{data.patient.notes}</p>
                    </div>
                  )}
                </div>

                {/* Treatment & Next Follow-Up */}
                <div className="bg-slate-50 border border-slate-300 rounded-md p-4 space-y-2.5">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-700" />
                    Treatment & Next Follow-Up
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Current Treatment:</span>
                      {(() => {
                        const tColor = getPastelTreatmentConfig(data.patient.treatment);
                        return (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-xs ${tColor.bg} ${tColor.border} ${tColor.text}`}>
                            <span className={`w-2 h-2 rounded-full ${tColor.dot}`} />
                            <strong className="text-sm font-black">{data.patient.treatment}</strong>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-white/70 ml-1 ${tColor.subtext}`}>
                              {tColor.colorName}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <span className="text-slate-500 block">Attending Doctor:</span>
                      <strong className="text-slate-900 font-semibold">{data.patient.doctor}</strong>
                    </div>

                    <div className="p-3 bg-white border border-slate-300 rounded mt-2">
                      <span className="text-slate-500 font-bold block text-[11px] uppercase">
                        Next Follow-Up Status:
                      </span>
                      {data.patient.next_followup ? (
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-700" />
                            <strong className="text-sm font-bold text-slate-900">
                              {data.patient.next_followup}
                            </strong>
                          </div>
                          {data.patient.followup_note && (
                            <div className="text-xs text-slate-700 mt-1">
                              <strong>Purpose:</strong> {data.patient.followup_note}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs mt-1">
                          No pending follow-up date set.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Visit History */}
              <div className="bg-white border border-slate-300 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-700" />
                    Clinical Visit History ({data.visits.length})
                  </h3>
                  <button
                    onClick={() => onOpenAddVisit(data.patient)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Visit
                  </button>
                </div>

                {data.visits.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No visits recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.visits.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{v.visit_date}</span>
                            <span className="text-blue-800">• {v.treatment}</span>
                          </div>
                          <p className="text-slate-700">{v.notes}</p>
                          <span className="text-slate-500 text-[11px]">Doctor: {v.doctor}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[11px] self-start sm:self-center">
                          {v.status || 'Completed'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 3: Follow-Up History */}
              <div className="bg-white border border-slate-300 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    Follow-Up History & Upcoming Sittings ({data.followups.length})
                  </h3>
                  <button
                    onClick={() => onOpenSetFollowup(data.patient)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Set Follow-up
                  </button>
                </div>

                {data.followups.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No follow-ups recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.followups.map((f) => (
                      <div
                        key={f.id}
                        className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2 ${
                          f.status === 'completed'
                            ? 'bg-slate-50 border-slate-200'
                            : f.followup_date < '2026-09-16'
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-teal-50/60 border-teal-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span>{f.followup_date}</span>
                            <span className="font-semibold text-slate-600">— {f.followup_note}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600">
                            <span>Reminder: {f.reminder_timing.replace(/_/g, ' ')}</span>
                            {f.last_reminder_sent && (
                              <span className="text-emerald-700 font-semibold">
                                ✓ WhatsApp Sent: {f.last_reminder_sent.split('T')[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {f.status !== 'completed' ? (
                            <>
                              <button
                                onClick={() => handleSendFollowupReminder(f.id)}
                                title="Send WhatsApp reminder now"
                                className="px-2.5 py-1 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded cursor-pointer"
                              >
                                Send Reminder
                              </button>
                              <button
                                onClick={() => handleCompleteFollowup(f.id)}
                                className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded cursor-pointer"
                              >
                                Mark Done
                              </button>
                            </>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 4: WhatsApp Activity Log */}
              <div className="bg-white border border-slate-300 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    WhatsApp Activity Log ({data.messages.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">Automated & Direct Messages</span>
                </div>

                {data.messages.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No WhatsApp messages dispatched yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.messages.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <span className="capitalize text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px] font-mono">
                              {m.message_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {m.sent_at ? new Date(m.sent_at).toLocaleString() : ''}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              m.whatsapp_status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.whatsapp_status === 'Sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.whatsapp_status}
                          </span>
                        </div>
                        <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 whitespace-pre-line font-sans text-xs">
                          {m.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold rounded bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
