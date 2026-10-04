import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
  UserPlus,
  CalendarClock,
  BellRing,
  Stethoscope,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { api } from './api';
import {
  Patient,
  Followup,
  MessageLog,
  ClinicSettings,
  DashboardStats,
  ReminderTiming,
} from './types';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { FollowupsView } from './components/FollowupsView';
import { WhatsAppView } from './components/WhatsAppView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AddPatientModal } from './components/AddPatientModal';
import { SetFollowupModal } from './components/SetFollowupModal';
import { AddVisitModal } from './components/AddVisitModal';
import { PatientProfileModal } from './components/PatientProfileModal';

type NavTab = 'dashboard' | 'patients' | 'followups' | 'whatsapp' | 'analytics' | 'settings';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Core data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [todayFollowups, setTodayFollowups] = useState<Followup[]>([]);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  // Loading & notification states
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [isTriggeringReminders, setIsTriggeringReminders] = useState(false);

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSetFollowupOpen, setIsSetFollowupOpen] = useState(false);
  const [selectedPatientForFollowup, setSelectedPatientForFollowup] = useState<Patient | null>(null);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<Patient | null>(null);
  const [selectedPatientIdForProfile, setSelectedPatientIdForProfile] = useState<string | null>(null);

  // Load all initial data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, patientsRes, followupsRes, todayRes, messagesRes, settingsRes] =
        await Promise.all([
          api.getStats(),
          api.getPatients(),
          api.getFollowups(),
          api.getTodayFollowups(),
          api.getMessages(),
          api.getSettings(),
        ]);

      setStats(statsRes);
      setPatients(patientsRes);
      setFilteredPatients(patientsRes);
      setFollowups(followupsRes);
      setTodayFollowups(todayRes);
      setMessages(messagesRes);
      setSettings(settingsRes);
    } catch (err: any) {
      console.error('Failed to load clinic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filter patients
  const handleFilterPatients = async (filters: any) => {
    try {
      const res = await api.getPatients(filters);
      setFilteredPatients(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Add Patient action
  const handleAddPatientSubmit = async (formData: any) => {
    const res = await api.registerPatient(formData);
    showToast(
      `Patient ${res.patient.name} registered. WhatsApp welcome message: ${res.welcomeMessageResult.status}!`,
      'success'
    );
    loadAllData();
    return res;
  };

  // Set / Save Followup
  const handleSaveFollowup = async (data: {
    patient_id: string;
    followup_date: string;
    followup_note: string;
    reminder_timing: ReminderTiming;
  }) => {
    await api.setFollowup(data);
    showToast(`Follow-up appointment scheduled for ${data.followup_date}`, 'success');
    loadAllData();
  };

  // Add Visit
  const handleSaveVisit = async (data: any) => {
    if (!selectedPatientForVisit) return;
    await api.addVisit({
      patient_id: selectedPatientForVisit.id,
      ...data,
    });
    showToast(`Clinical visit record saved successfully.`, 'success');
    loadAllData();
  };

  // Mark Followup Completed
  const handleCompleteFollowup = async (followupId: string) => {
    try {
      await api.completeFollowup(followupId);
      showToast('Follow-up sitting marked as completed.', 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Send WhatsApp Reminder
  const handleSendFollowupReminder = async (followupId: string) => {
    try {
      const res = await api.sendFollowupReminder(followupId);
      showToast(`WhatsApp reminder dispatched (Status: ${res.status})`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast('Failed to send reminder: ' + err.message, 'error');
    }
  };

  // Trigger automated background reminder runner
  const handleTriggerAutomatedReminders = async () => {
    try {
      setIsTriggeringReminders(true);
      const res = await api.triggerReminders();
      showToast(res.message, 'success');
      loadAllData();
    } catch (err: any) {
      showToast('Error triggering automated reminders: ' + err.message, 'error');
    } finally {
      setIsTriggeringReminders(false);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: ClinicSettings) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    showToast('Clinic settings & WhatsApp templates updated successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Banner / Govt / Healthcare Trust Bar */}
      <header className="bg-slate-900 text-white border-b-2 border-blue-600 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo & Clinic Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-700 border border-blue-500 flex items-center justify-center font-bold text-xl shadow-xs">
              🦷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight text-white leading-none">
                  {settings?.clinic_name || 'DentCare Dental Clinic'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3" /> WhatsApp API Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Patient Management & Automated WhatsApp Reminders System
              </p>
            </div>
          </div>

          {/* Quick Header Action & Receptionist Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="top-add-patient-btn"
              onClick={() => setIsAddPatientOpen(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold rounded border border-blue-600 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Register Patient</span>
              <span className="sm:hidden">+ Patient</span>
            </button>

            <button
              onClick={() => {
                setSelectedPatientForFollowup(null);
                setIsSetFollowupOpen(true);
              }}
              className="hidden md:flex px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded border border-teal-600 shadow-sm items-center gap-1.5 cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Set Follow-up</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-700 text-xs">
              <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-slate-300">
                DR
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 block text-[11px] leading-tight">Dr. Ananya Rao</span>
                <span className="text-[10px] text-slate-400">Chief Dental Surgeon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar: Solid High-Contrast */}
        <div className="bg-slate-800 border-t border-slate-700/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto no-scrollbar space-x-1 py-1">
            <button
              id="nav-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-2 rounded text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-patients"
              onClick={() => setCurrentTab('patients')}
              className={`px-4 py-2 rounded text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                currentTab === 'patients'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patient Directory</span>
              <span className="bg-slate-900 text-slate-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {patients.length}
              </span>
            </button>

            <button
              id="nav-followups"
              onClick={() => setCurrentTab('followups')}
              className={`px-4 py-2 rounded text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                currentTab === 'followups'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Follow-ups & Sittings</span>
              {todayFollowups.length > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded font-mono">
                  {todayFollowups.length}
                </span>
              )}
            </button>

            <button
              id="nav-whatsapp"
              onClick={() => setCurrentTab('whatsapp')}
              className={`px-4 py-2 rounded text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                currentTab === 'whatsapp'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Automation</span>
              <span className="bg-slate-900 text-slate-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {messages.length}
              </span>
            </button>

            <button
              id="nav-analytics"
              onClick={() => setCurrentTab('analytics')}
              className={`px-4 py-2 rounded text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                currentTab === 'analytics'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Monthly Analytics</span>
            </button>

            <button
              id="nav-settings"
              onClick={() => setCurrentTab('settings')}
              className={`px-4 py-2 rounded text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                currentTab === 'settings'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>WhatsApp API Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert / Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`p-4 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2.5 border-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-500'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-500'
                : 'bg-blue-900 text-white border-blue-500'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">
              Initializing Dental Clinic Management System...
            </p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                todayFollowups={todayFollowups}
                onOpenAddPatient={() => setIsAddPatientOpen(true)}
                onOpenSetFollowup={() => {
                  setSelectedPatientForFollowup(null);
                  setIsSetFollowupOpen(true);
                }}
                onNavigateToPatients={() => setCurrentTab('patients')}
                onNavigateToFollowups={() => setCurrentTab('followups')}
                onSendFollowupReminder={handleSendFollowupReminder}
                onCompleteFollowup={handleCompleteFollowup}
                onTriggerReminders={handleTriggerAutomatedReminders}
              />
            )}

            {currentTab === 'patients' && (
              <PatientsView
                patients={filteredPatients}
                onSelectPatient={(p) => setSelectedPatientIdForProfile(p.id)}
                onOpenAddPatient={() => setIsAddPatientOpen(true)}
                onOpenSetFollowup={(p) => {
                  setSelectedPatientForFollowup(p);
                  setIsSetFollowupOpen(true);
                }}
                onFilterChange={handleFilterPatients}
              />
            )}

            {currentTab === 'followups' && (
              <FollowupsView
                followups={followups}
                onSelectPatientById={(pid) => setSelectedPatientIdForProfile(pid)}
                onEditFollowup={(f) => {
                  const p = patients.find((item) => item.id === f.patient_id);
                  if (p) {
                    setSelectedPatientForFollowup(p);
                  }
                  setIsSetFollowupOpen(true);
                }}
                onCompleteFollowup={handleCompleteFollowup}
                onSendReminder={handleSendFollowupReminder}
                onTriggerAutomatedReminders={handleTriggerAutomatedReminders}
                isTriggering={isTriggeringReminders}
              />
            )}

            {currentTab === 'whatsapp' && (
              <WhatsAppView
                messages={messages}
                patients={patients}
                settings={settings}
                onRefreshMessages={loadAllData}
                onOpenSettings={() => setCurrentTab('settings')}
              />
            )}

            {currentTab === 'analytics' && <AnalyticsView />}

            {currentTab === 'settings' && (
              <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-300 py-4 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>{settings?.clinic_name || 'DentCare Dental Clinic'}</strong> — Dental Practice Management & WhatsApp Automation System
          </span>
          <div className="flex items-center gap-4 text-slate-600 font-semibold">
            <span>Date: 16 September 2026</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">WhatsApp Gateway: Meta Cloud API Active</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {isAddPatientOpen && (
        <AddPatientModal
          isOpen={isAddPatientOpen}
          onClose={() => setIsAddPatientOpen(false)}
          onSubmit={handleAddPatientSubmit}
          totalPatientsCount={patients.length}
        />
      )}

      {isSetFollowupOpen && (
        <SetFollowupModal
          isOpen={isSetFollowupOpen}
          onClose={() => {
            setIsSetFollowupOpen(false);
            setSelectedPatientForFollowup(null);
          }}
          patient={selectedPatientForFollowup}
          patientsList={patients}
          onSave={handleSaveFollowup}
        />
      )}

      {isAddVisitOpen && selectedPatientForVisit && (
        <AddVisitModal
          isOpen={isAddVisitOpen}
          onClose={() => {
            setIsAddVisitOpen(false);
            setSelectedPatientForVisit(null);
          }}
          patient={selectedPatientForVisit}
          onSave={handleSaveVisit}
        />
      )}

      {selectedPatientIdForProfile && (
        <PatientProfileModal
          isOpen={Boolean(selectedPatientIdForProfile)}
          onClose={() => setSelectedPatientIdForProfile(null)}
          patientId={selectedPatientIdForProfile}
          onOpenSetFollowup={(p) => {
            setSelectedPatientForFollowup(p);
            setIsSetFollowupOpen(true);
          }}
          onOpenAddVisit={(p) => {
            setSelectedPatientForVisit(p);
            setIsAddVisitOpen(true);
          }}
          onPatientUpdated={loadAllData}
        />
      )}
    </div>
  );
}
