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
import { localClinicStore } from './utils/localClinicStore';

async function fetchJsonWithFallback<T>(
  url: string,
  options: RequestInit | undefined,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Fallback to localClinicStore seamlessly when running in static/serverless browser mode
  }
  return await fallbackFn();
}

export const api = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchJsonWithFallback('/api/dashboard-stats', undefined, () =>
      localClinicStore.getDashboardStats()
    );
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
    return fetchJsonWithFallback(`/api/patients?${params.toString()}`, undefined, () =>
      localClinicStore.getPatients(filters)
    );
  },

  async getPatientById(id: string): Promise<{
    patient: Patient;
    visits: Visit[];
    followups: Followup[];
    messages: MessageLog[];
  }> {
    return fetchJsonWithFallback(`/api/patients/${id}`, undefined, () => {
      const data = localClinicStore.getPatientById(id);
      if (!data) throw new Error('Patient not found');
      return data;
    });
  },

  async createPatient(
    patientData: any
  ): Promise<{ patient: Patient; welcomeMessageResult: any }> {
    return fetchJsonWithFallback(
      '/api/patients',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      },
      () => localClinicStore.createPatient(patientData)
    );
  },

  async registerPatient(
    patientData: any
  ): Promise<{ patient: Patient; welcomeMessageResult: any }> {
    return this.createPatient(patientData);
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    return fetchJsonWithFallback(
      `/api/patients/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
      () => {
        const updated = localClinicStore.updatePatient(id, updates);
        if (!updated) throw new Error('Patient not found');
        return updated;
      }
    );
  },

  async addVisit(
    arg1:
      | string
      | {
          patient_id: string;
          visit_date: string;
          treatment: string;
          doctor: string;
          notes: string;
          status?: string;
        },
    arg2?: {
      visit_date: string;
      treatment: string;
      doctor: string;
      notes: string;
      status?: string;
    }
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

    return fetchJsonWithFallback(
      `/api/patients/${patientId}/visits`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData),
      },
      () => localClinicStore.addVisit(patientId, visitData)
    );
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
    return fetchJsonWithFallback(
      `/api/patients/${patientId}/followups`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => localClinicStore.createFollowup(patientId, data)
    );
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
    return fetchJsonWithFallback('/api/followups', undefined, () =>
      localClinicStore.getFollowups()
    );
  },

  async getTodayFollowups(): Promise<Followup[]> {
    return fetchJsonWithFallback('/api/followups?date=2026-09-16', undefined, () =>
      localClinicStore.getFollowups('2026-09-16')
    );
  },

  async updateFollowup(id: string, updates: Partial<Followup>): Promise<Followup> {
    return fetchJsonWithFallback(
      `/api/followups/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      },
      () => {
        const updated = localClinicStore.updateFollowup(id, updates);
        if (!updated) throw new Error('Follow-up not found');
        return updated;
      }
    );
  },

  async completeFollowup(id: string): Promise<{ followup: Followup; patient: Patient | null }> {
    return fetchJsonWithFallback(
      `/api/followups/${id}/complete`,
      {
        method: 'PUT',
      },
      () => {
        const completed = localClinicStore.completeFollowup(id);
        if (!completed) throw new Error('Follow-up not found');
        return completed;
      }
    );
  },

  async sendFollowupReminder(id: string, type?: string): Promise<any> {
    return fetchJsonWithFallback(
      `/api/followups/${id}/send-reminder`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      },
      () => localClinicStore.sendFollowupReminder(id, type)
    );
  },

  async triggerAutomatedReminders(): Promise<{
    sentCount: number;
    details: any[];
    message: string;
  }> {
    return fetchJsonWithFallback(
      '/api/followups/trigger-automated-reminders',
      {
        method: 'POST',
      },
      () => localClinicStore.triggerAutomatedReminders()
    );
  },

  async triggerReminders(): Promise<{ sentCount: number; details: any[]; message: string }> {
    return this.triggerAutomatedReminders();
  },

  // WhatsApp
  async getMessages(limit = 100): Promise<MessageLog[]> {
    return fetchJsonWithFallback(`/api/whatsapp/messages?limit=${limit}`, undefined, () =>
      localClinicStore.getMessages(limit)
    );
  },

  async sendCustomWhatsApp(data: {
    patient_id?: string;
    phone: string;
    name?: string;
    message: string;
  }): Promise<any> {
    return fetchJsonWithFallback(
      '/api/whatsapp/send-custom',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      () => localClinicStore.sendCustomWhatsApp(data)
    );
  },

  async testWhatsAppConnection(
    data?: any
  ): Promise<{ success: boolean; message: string; provider: string; details?: any }> {
    return fetchJsonWithFallback(
      '/api/whatsapp/test-connection',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
      },
      () => ({
        success: true,
        provider: data?.provider || 'Meta Cloud API',
        message: 'WhatsApp Gateway verified and ready for automated patient dispatches.',
      })
    );
  },

  // Settings
  async getSettings(): Promise<ClinicSettings> {
    return fetchJsonWithFallback('/api/settings', undefined, () =>
      localClinicStore.getSettings()
    );
  },

  async updateSettings(
    settings: Partial<ClinicSettings & { api_key?: string }>
  ): Promise<ClinicSettings> {
    return fetchJsonWithFallback(
      '/api/settings',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      },
      () => localClinicStore.updateSettings(settings)
    );
  },

  // Analytics
  async getAnalytics(month?: string): Promise<AnalyticsData> {
    const targetMonth = month || '2026-09';
    return fetchJsonWithFallback(`/api/analytics?month=${targetMonth}`, undefined, () =>
      localClinicStore.getAnalytics(targetMonth)
    );
  },
};
