import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { MessageLog, Patient, ClinicSettings } from '../types';
import { api } from '../api';

interface WhatsAppViewProps {
  messages: MessageLog[];
  patients: Patient[];
  settings: ClinicSettings | null;
  onRefreshMessages: () => void;
  onOpenSettings: () => void;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  messages,
  patients,
  settings,
  onRefreshMessages,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'send' | 'templates'>('log');
  const [searchTerm, setSearchTerm] = useState('');

  // Direct send state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directName, setDirectName] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  const filteredMessages = messages.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      (m.patient_name && m.patient_name.toLowerCase().includes(q)) ||
      (m.patient_phone && m.patient_phone.includes(q)) ||
      m.message.toLowerCase().includes(q) ||
      m.message_type.toLowerCase().includes(q)
    );
  });

  const handlePatientSelect = (pid: string) => {
    setSelectedPatientId(pid);
    const p = patients.find((item) => item.id === pid);
    if (p) {
      setDirectPhone(p.phone);
      setDirectName(p.name);
      setDirectMessage(`Hello ${p.name}, greeting from ${settings?.clinic_name || 'DentCare Dental Clinic'}. `);
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPhone.trim() || !directMessage.trim()) {
      alert('Please provide mobile number and message text.');
      return;
    }

    try {
      setSending(true);
      setSendResult(null);
      const res = await api.sendCustomWhatsApp({
        patient_id: selectedPatientId || undefined,
        phone: directPhone.trim(),
        name: directName.trim() || 'Patient',
        message: directMessage.trim(),
      });
      setSendResult(res);
      onRefreshMessages();
    } catch (err: any) {
      alert('Failed to send WhatsApp message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                WhatsApp Automation & Message Log
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Real-time delivery status, welcome notifications, and follow-up sitting alerts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshMessages}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Refresh Log</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded border border-emerald-900 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            Configure WhatsApp API
          </button>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="bg-white p-2 rounded-lg border border-slate-300 shadow-sm flex gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 rounded transition cursor-pointer border ${
            activeTab === 'log'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Message Log ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 rounded transition cursor-pointer border ${
            activeTab === 'send'
              ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Send Direct Message
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded transition cursor-pointer border ${
            activeTab === 'templates'
              ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Message Templates (5)
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'log' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search message logs by patient name, phone, or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-emerald-700 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-extrabold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Message Type</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Message Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        No WhatsApp message logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((m) => {
                      const d = m.sent_at ? new Date(m.sent_at) : null;
                      const formattedDate = d ? d.toLocaleDateString() : '';
                      const formattedTime = d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {m.patient_name || 'Patient'}
                          </td>

                          <td className="px-4 py-3 font-mono">
                            {m.patient_phone}
                          </td>

                          <td className="px-4 py-3">
                            <span className="capitalize text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded text-[11px] font-bold">
                              {m.message_type.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-slate-600 font-medium">
                            <div>{formattedDate}</div>
                            <div className="text-[11px] text-slate-400">{formattedTime}</div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                                m.whatsapp_status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : m.whatsapp_status === 'Sent'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : m.whatsapp_status === 'Pending'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}
                            >
                              {m.whatsapp_status}
                            </span>
                          </td>

                          <td className="px-4 py-3 max-w-md">
                            <p className="whitespace-pre-line text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 text-[11px] leading-relaxed">
                              {m.message}
                            </p>
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
      )}

      {/* Tab: Send Direct Message */}
      {activeTab === 'send' && (
        <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">Send Direct WhatsApp Message</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Transmit custom notifications, emergency appointment notes, or greeting messages
            </p>
          </div>

          {sendResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Message Successfully Sent! Message ID: {sendResult.messageId}</span>
              </div>
              {sendResult.waMeUrl && (
                <div className="pt-1">
                  <a
                    href={sendResult.waMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold underline"
                  >
                    Open in WhatsApp Web ↗
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSendDirect} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Select Registered Patient (Optional)
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
              >
                <option value="">-- Choose from Directory or Enter Number Below --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_id} — {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={directName}
                  onChange={(e) => setDirectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
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
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Message Content <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Type your WhatsApp message..."
                value={directMessage}
                onChange={(e) => setDirectMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded border border-emerald-900 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Dispatching...' : 'Send WhatsApp Message'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Message Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900">Configured WhatsApp Message Templates</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Standard automated templates supporting dynamic variables: <code>{`{{patientName}}`}</code>, <code>{`{{clinicName}}`}</code>, <code>{`{{treatment}}`}</code>, <code>{`{{followUpDate}}`}</code>, <code>{`{{followUpNote}}`}</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings &&
              Object.entries(settings.templates).map(([key, val]) => (
                <div key={key} className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-xs uppercase text-blue-900">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      Active
                    </span>
                  </div>
                  <pre className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {val}
                  </pre>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
