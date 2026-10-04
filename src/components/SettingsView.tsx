import React, { useState } from 'react';
import {
  Settings,
  MessageSquare,
  Key,
  Phone,
  Webhook,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Building,
  RefreshCw,
} from 'lucide-react';
import { ClinicSettings, WhatsAppProvider } from '../types';
import { api } from '../api';

interface SettingsViewProps {
  settings: ClinicSettings | null;
  onUpdateSettings: (newSettings: ClinicSettings) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<ClinicSettings>(
    settings || {
      clinic_name: 'DentCare Dental Clinic & Implant Centre',
      clinic_phone: '+91 98765 43210',
      clinic_address: 'SCO 14, Health City, Sector 62, Mohali, Punjab',
      whatsapp_provider: 'Meta Cloud API',
      whatsapp_api_key: 'EAAQ...meta_live_token_dentcare_2026',
      phone_number_id: '109823485764321',
      webhook_url: 'https://dentcare-clinic.app/api/whatsapp-webhook',
      templates: {
        welcome_message:
          'Hello {{patientName}},\n\nWelcome to {{clinicName}} 🦷\nThank you for visiting us. We look forward to taking care of your smile.',
        reminder_1_day:
          'Hello {{patientName}},\n\nThis is a friendly reminder from {{clinicName}} for your follow-up appointment tomorrow for {{treatment}}.\n\nDate: {{followUpDate}}\nNote: {{followUpNote}}\n\nPlease reply YES to confirm your sitting.',
        reminder_2_days:
          'Hello {{patientName}},\n\nFriendly reminder from {{clinicName}}: Your dental sitting for {{treatment}} is scheduled in 2 days on {{followUpDate}}.\n\nLooking forward to seeing you.',
        reminder_same_day:
          'Good morning {{patientName}},\n\nReminder: Your dental appointment is TODAY at {{clinicName}} for {{treatment}}.\n\nPlease arrive 10 minutes before your scheduled slot. 🦷',
        treatment_completed:
          'Dear {{patientName}},\n\nCongratulations on completing your {{treatment}} with {{clinicName}}! Keep smiling bright. Feel free to reach out to us if you need any assistance.',
      },
    }
  );

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    provider: string;
    message: string;
    testNumber?: string;
  } | null>(null);
  const [testMobile, setTestMobile] = useState('+91 98765 43210');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.testWhatsAppConnection({
        provider: formData.whatsapp_provider,
        apiKey: formData.whatsapp_api_key,
        phoneId: formData.phone_number_id,
        testNumber: testMobile,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        provider: formData.whatsapp_provider,
        message: err.message || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-800" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              WhatsApp API & Clinic Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure Meta Cloud API, Twilio, Wati, AiSensy, and automated WhatsApp patient templates
          </p>
        </div>

        {saveSuccess && (
          <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinic Profile */}
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <Building className="w-4 h-4 text-blue-700" />
            Dental Clinic Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Clinic Display Name
              </label>
              <input
                type="text"
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Clinic Official Contact Phone
              </label>
              <input
                type="text"
                value={formData.clinic_phone}
                onChange={(e) => setFormData({ ...formData, clinic_phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Clinic Physical Address
            </label>
            <input
              type="text"
              value={formData.clinic_address}
              onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-medium"
            />
          </div>
        </div>

        {/* WhatsApp Provider Credentials */}
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            WhatsApp API Provider Integration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                WhatsApp Provider <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.whatsapp_provider}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_provider: e.target.value as WhatsAppProvider })
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white font-bold text-slate-900"
              >
                <option value="Meta Cloud API">Meta Cloud API (Official WhatsApp Business)</option>
                <option value="Twilio">Twilio WhatsApp Messaging API</option>
                <option value="Wati">WATI (WhatsApp Team Inbox)</option>
                <option value="AiSensy">AiSensy (Official WhatsApp Platform)</option>
                <option value="Other">Custom / Other Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Phone Number ID / Sender Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.phone_number_id}
                onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                API Key / Access Token <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={formData.whatsapp_api_key}
                onChange={(e) => setFormData({ ...formData, whatsapp_api_key: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Webhook URL (Delivery & Read Status Updates)
              </label>
              <input
                type="text"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-blue-700 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Test Connection Box */}
          <div className="p-4 bg-slate-50 rounded border border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Verify WhatsApp Gateway Connectivity
                </span>
                <span className="text-[11px] text-slate-500">
                  Sends an instant ping or test WhatsApp handshake to confirm API token validity.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Test mobile number"
                  value={testMobile}
                  onChange={(e) => setTestMobile(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white w-36 font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded border border-emerald-900 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded text-xs font-medium border flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-red-50 text-red-900 border-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message Templates Section */}
        <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              Automated Message Templates Editor
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Variables allowed: <code>{`{{patientName}}`}</code>, <code>{`{{clinicName}}`}</code>, <code>{`{{treatment}}`}</code>, <code>{`{{followUpDate}}`}</code>, <code>{`{{followUpNote}}`}</code>.
            </p>
          </div>

          {/* Welcome Message Template */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Welcome Message Template (Sent upon new patient registration)
            </label>
            <textarea
              rows={3}
              value={formData.templates.welcome_message}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  templates: { ...formData.templates, welcome_message: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-sans focus:border-blue-700 focus:outline-none"
            />
          </div>

          {/* 1-day reminder */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              2. 1-Day Before Follow-Up Reminder
            </label>
            <textarea
              rows={3}
              value={formData.templates.reminder_1_day}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  templates: { ...formData.templates, reminder_1_day: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-sans focus:border-blue-700 focus:outline-none"
            />
          </div>

          {/* 2-day reminder */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              3. 2-Days Before Follow-Up Reminder
            </label>
            <textarea
              rows={3}
              value={formData.templates.reminder_2_days}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  templates: { ...formData.templates, reminder_2_days: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-sans focus:border-blue-700 focus:outline-none"
            />
          </div>

          {/* same-day reminder */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              4. Same-Day Morning Follow-Up Reminder
            </label>
            <textarea
              rows={3}
              value={formData.templates.reminder_same_day}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  templates: { ...formData.templates, reminder_same_day: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-sans focus:border-blue-700 focus:outline-none"
            />
          </div>

          {/* Treatment completed */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              5. Completed Treatment Message
            </label>
            <textarea
              rows={3}
              value={formData.templates.treatment_completed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  templates: { ...formData.templates, treatment_completed: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-sans focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded border border-blue-900 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration & Templates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
