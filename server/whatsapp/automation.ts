import { db } from '../db';
import {
  createWhatsAppProvider,
  renderTemplate,
  WhatsAppConfig,
  WhatsAppSendResult,
} from './provider';
import { Patient, Followup } from '../../src/types';

export function getProviderInstance() {
  const settings = db.getSettings();
  let providerType: 'simulated' | 'meta_cloud' | 'generic_webhook' | 'twilio' = 'simulated';
  if (settings.whatsapp_provider === 'Meta Cloud API' || settings.api_provider === 'meta_cloud') {
    providerType = 'meta_cloud';
  } else if (settings.whatsapp_provider === 'Twilio' || settings.api_provider === 'twilio') {
    providerType = 'twilio';
  } else if (
    settings.whatsapp_provider === 'Wati' ||
    settings.whatsapp_provider === 'AiSensy' ||
    settings.whatsapp_provider === 'Other' ||
    settings.api_provider === 'generic_webhook'
  ) {
    providerType = 'generic_webhook';
  }

  const config: WhatsAppConfig = {
    provider: providerType,
    baseUrl: settings.api_base_url || '',
    apiKey: settings.whatsapp_api_key || settings.api_key || '',
    businessNumber: settings.whatsapp_business_number || settings.clinic_phone || '',
    phoneNumberId: settings.phone_number_id || '',
    templateName: settings.template_name || '',
    templateLanguage: settings.template_language || 'en_US',
  };
  return createWhatsAppProvider(config);
}

export async function sendWelcomeMessage(patient: Patient): Promise<WhatsAppSendResult> {
  const settings = db.getSettings();
  const provider = getProviderInstance();

  const template = settings.templates?.welcome ||
    `Hello {{patientName}}, Welcome to {{clinicName}} 🦷\n\nThank you for visiting us. We look forward to taking care of your smile.\n\n* {{clinicName}}`;

  const renderedText = renderTemplate(template, {
    patientName: patient.name,
    clinicName: settings.clinic_name,
    clinicPhone: settings.clinic_phone,
    treatment: patient.treatment,
    doctor: patient.doctor,
  });

  const result = await provider.send({
    to: patient.phone,
    patientName: patient.name,
    messageType: 'welcome',
    text: renderedText,
    templateVariables: {
      patientName: patient.name,
      clinicName: settings.clinic_name,
    },
  });

  // Log in database
  db.logMessage({
    patient_id: patient.id,
    patient_name: patient.name,
    patient_phone: patient.phone,
    message_type: 'welcome',
    message: renderedText,
    whatsapp_status: result.status,
    api_response: result.rawResponse || { messageId: result.messageId, error: result.error },
  });

  return result;
}

export async function sendFollowupReminder(
  followupId: string,
  forcedType?: 'followup_reminder' | 'sameday_reminder' | 'overdue_reminder'
): Promise<WhatsAppSendResult> {
  const followups = db.getFollowups();
  const followup = followups.find((f) => f.id === followupId);
  if (!followup) {
    throw new Error('Followup not found');
  }

  const patientDetails = db.getPatientById(followup.patient_id);
  const patient = patientDetails?.patient;
  const settings = db.getSettings();
  const provider = getProviderInstance();

  const todayStr = '2026-09-16';
  const isToday = followup.followup_date === todayStr;
  const isOverdue = followup.followup_date < todayStr;

  let messageType = forcedType;
  if (!messageType) {
    if (isOverdue) messageType = 'overdue_reminder';
    else if (isToday) messageType = 'sameday_reminder';
    else messageType = 'followup_reminder';
  }

  let template = settings.templates[messageType] || settings.templates.followup_reminder;

  const phone = followup.patient_phone || patient?.phone || '';
  const patientName = followup.patient_name || patient?.name || 'Patient';
  const treatment = followup.treatment || patient?.treatment || 'Dental Consultation';

  // Format date readable (e.g., 25 Sep 2026)
  const dParts = followup.followup_date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${dParts[2]} ${months[parseInt(dParts[1], 10) - 1]} ${dParts[0]}`;

  const renderedText = renderTemplate(template, {
    patientName,
    clinicName: settings.clinic_name,
    clinicPhone: settings.clinic_phone,
    treatment,
    followUpDate: formattedDate,
    followUpNote: followup.followup_note || 'Scheduled sitting',
  });

  const result = await provider.send({
    to: phone,
    patientName,
    messageType,
    text: renderedText,
    templateVariables: {
      patientName,
      clinicName: settings.clinic_name,
      followUpDate: formattedDate,
      treatment,
    },
  });

  // Update followup
  db.updateFollowup(followup.id, {
    last_reminder_sent: new Date().toISOString(),
    whatsapp_status: result.status,
  });

  // Log message
  db.logMessage({
    patient_id: followup.patient_id,
    patient_name: patientName,
    patient_phone: phone,
    message_type: messageType,
    message: renderedText,
    whatsapp_status: result.status,
    api_response: result.rawResponse || { messageId: result.messageId, error: result.error },
  });

  return result;
}

export async function checkAndSendDueReminders(): Promise<{ sentCount: number; details: any[] }> {
  const followups = db.getFollowups();
  const settings = db.getSettings();
  const todayStr = '2026-09-16';

  const today = new Date('2026-09-16T00:00:00Z');
  const oneDayAfter = new Date(today);
  oneDayAfter.setDate(today.getDate() + 1);
  const oneDayStr = oneDayAfter.toISOString().split('T')[0];

  const twoDaysAfter = new Date(today);
  twoDaysAfter.setDate(today.getDate() + 2);
  const twoDaysStr = twoDaysAfter.toISOString().split('T')[0];

  const pending = followups.filter((f) => f.status !== 'completed' && f.reminder_enabled);
  const dueToRemind: { followup: Followup; type: 'sameday_reminder' | 'followup_reminder' | 'overdue_reminder' }[] = [];

  for (const f of pending) {
    // If already sent today, skip
    if (f.last_reminder_sent && f.last_reminder_sent.startsWith(todayStr)) {
      continue;
    }

    if (f.followup_date === todayStr && settings.reminders_enabled.same_day) {
      dueToRemind.push({ followup: f, type: 'sameday_reminder' });
    } else if (f.followup_date === oneDayStr && settings.reminders_enabled.one_day_before) {
      dueToRemind.push({ followup: f, type: 'followup_reminder' });
    } else if (f.followup_date === twoDaysStr && settings.reminders_enabled.two_days_before) {
      dueToRemind.push({ followup: f, type: 'followup_reminder' });
    } else if (f.followup_date < todayStr) {
      dueToRemind.push({ followup: f, type: 'overdue_reminder' });
    }
  }

  const results = [];
  for (const item of dueToRemind) {
    try {
      const res = await sendFollowupReminder(item.followup.id, item.type);
      results.push({ id: item.followup.id, patient: item.followup.patient_name, status: res.status });
    } catch (e: any) {
      results.push({ id: item.followup.id, patient: item.followup.patient_name, error: e.message });
    }
  }

  return { sentCount: results.length, details: results };
}

export async function sendCustomWhatsAppMessage(
  patientId: string,
  phone: string,
  patientName: string,
  message: string
): Promise<WhatsAppSendResult> {
  const provider = getProviderInstance();
  const settings = db.getSettings();

  const renderedText = renderTemplate(message, {
    patientName,
    clinicName: settings.clinic_name,
    clinicPhone: settings.clinic_phone,
  });

  const result = await provider.send({
    to: phone,
    patientName,
    messageType: 'custom',
    text: renderedText,
  });

  db.logMessage({
    patient_id: patientId,
    patient_name: patientName,
    patient_phone: phone,
    message_type: 'custom',
    message: renderedText,
    whatsapp_status: result.status,
    api_response: result.rawResponse || { messageId: result.messageId, error: result.error },
  });

  return result;
}
