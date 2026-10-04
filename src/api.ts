import {
  Patient,
  Visit,
  Followup,
  ClinicSettings,
  DashboardStats,
  AnalyticsData,
  MessageLog,
  ReminderTiming,
} from './types';

export const api = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard-stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getStats(): Promise<DashboardStats> {
    return this.getDashboardStats();
  },

  // Patients
  async getPatients(filters?: {
    search?: string;
    treatment?: string;
    doctor?: string;
    status?: string;
    dateRange?: string;
    sortBy?: string;
  }): Promise<Patient[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'all') params.append(k, v);
      });
    }
    const res = await fetch(`/api/patients?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  async getPatientById(id: string): Promise<{
    patient: Patient;
    visits: Visit[];
    followups: Followup[];
    messages: MessageLog[];
  }> {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient details');
    return res.json();
  },

  async createPatient(
    patientData: any
  ): Promise<{ patient: Patient; welcomeMessageResult: any }> {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create patient' }));
      throw new Error(err.error || 'Failed to create patient');
    }
    return res.json();
  },

  async registerPatient(
    patientData: any
  ): Promise<{ patient: Patient; welcomeMessageResult: any }> {
    return this.createPatient(patientData);
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update patient');
    return res.json();
  },

  async addVisit(
    arg1: string | { patient_id: string; visit_date: string; treatment: string; doctor: string; notes: string; status?: string },
    arg2?: { visit_date: string; treatment: string; doctor: string; notes: string; status?: string }
  ): Promise<Visit> {
    let patientId = '';
    let visitData: any = null;

    if (typeof arg1 === 'string') {
      patientId = arg1;
      visitData = arg2;
    } else {
      patientId = arg1.patient_id;
      visitData = arg1;
    }

    const res = await fetch(`/api/patients/${patientId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    });
    if (!res.ok) throw new Error('Failed to add visit');
    return res.json();
  },

  async createFollowup(
    patientId: string,
    data: {
      followup_date: string;
      followup_note: string;
      reminder_enabled?: boolean;
      reminder_timing?: string;
    }
  ): Promise<Followup> {
    const res = await fetch(`/api/patients/${patientId}/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to schedule follow-up');
    return res.json();
  },

  async setFollowup(data: {
    patient_id: string;
    followup_date: string;
    followup_note: string;
    reminder_timing: ReminderTiming;
  }): Promise<Followup> {
    return this.createFollowup(data.patient_id, {
      followup_date: data.followup_date,
      followup_note: data.followup_note,
      reminder_enabled: true,
      reminder_timing: data.reminder_timing,
    });
  },

  // Followups
  async getFollowups(): Promise<Followup[]> {
    const res = await fetch('/api/followups');
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return res.json();
  },

  async getTodayFollowups(): Promise<Followup[]> {
    const res = await fetch('/api/followups?date=2026-09-16');
    if (!res.ok) throw new Error('Failed to fetch today follow-ups');
    return res.json();
  },

  async updateFollowup(id: string, updates: Partial<Followup>): Promise<Followup> {
    const res = await fetch(`/api/followups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update follow-up');
    return res.json();
  },

  async completeFollowup(id: string): Promise<{ followup: Followup; patient: Patient | null }> {
    const res = await fetch(`/api/followups/${id}/complete`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to mark follow-up completed');
    return res.json();
  },

  async sendFollowupReminder(id: string, type?: string): Promise<any> {
    const res = await fetch(`/api/followups/${id}/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error('Failed to send follow-up reminder');
    return res.json();
  },

  async triggerAutomatedReminders(): Promise<{ sentCount: number; details: any[]; message: string }> {
    const res = await fetch('/api/followups/trigger-automated-reminders', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger reminders');
    const data = await res.json();
    return {
      sentCount: data.sentCount || 0,
      details: data.details || [],
      message: `Automated WhatsApp runner processed. Dispatched ${data.sentCount || 0} scheduled reminders.`,
    };
  },

  async triggerReminders(): Promise<{ sentCount: number; details: any[]; message: string }> {
    return this.triggerAutomatedReminders();
  },

  // WhatsApp
  async getMessages(limit = 100): Promise<MessageLog[]> {
    const res = await fetch(`/api/whatsapp/messages?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch WhatsApp messages');
    return res.json();
  },

  async sendCustomWhatsApp(data: {
    patient_id?: string;
    phone: string;
    name?: string;
    message: string;
  }): Promise<any> {
    const res = await fetch('/api/whatsapp/send-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send WhatsApp message');
    return res.json();
  },

  async testWhatsAppConnection(data?: any): Promise<{ success: boolean; message: string; provider: string; details?: any }> {
    const res = await fetch('/api/whatsapp/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<ClinicSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<ClinicSettings & { api_key?: string }>): Promise<ClinicSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Analytics
  async getAnalytics(month?: string): Promise<AnalyticsData> {
    const res = await fetch(`/api/analytics?month=${month || '2026-09'}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};
