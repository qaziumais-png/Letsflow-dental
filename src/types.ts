export type PatientStatus =
  | 'New'
  | 'Consultation'
  | 'Treatment Ongoing'
  | 'Follow-up Due'
  | 'Treatment Completed'
  | 'Inactive';

export type Gender = 'Male' | 'Female' | 'Other';

export type FollowupStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

export type WhatsAppMessageStatus = 'Sent' | 'Delivered' | 'Failed' | 'Pending';

export type WhatsAppMessageType =
  | 'welcome'
  | 'followup_reminder'
  | 'sameday_reminder'
  | 'overdue_reminder'
  | 'treatment_followup'
  | 'custom';

export type ReminderTiming = '1_day_before' | '2_days_before' | 'same_day';

export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  complaint: string;
  treatment: string;
  treatment_custom?: string;
  doctor: string;
  status: PatientStatus;
  registration_date: string;
  last_visit: string;
  next_followup?: string | null;
  followup_note?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  treatment: string;
  doctor: string;
  notes: string;
  status: string;
  created_at: string;
}

export interface Followup {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_phone?: string;
  treatment?: string;
  followup_date: string;
  followup_note: string;
  reminder_enabled: boolean;
  reminder_timing: ReminderTiming;
  status: FollowupStatus;
  completed_at?: string | null;
  last_reminder_sent?: string | null;
  whatsapp_status?: WhatsAppMessageStatus;
  created_at: string;
}

export interface MessageLog {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_phone?: string;
  message_type: WhatsAppMessageType;
  message: string;
  sent_at: string;
  whatsapp_status: WhatsAppMessageStatus;
  api_response?: any;
}

export type WhatsAppProvider =
  | 'Meta Cloud API'
  | 'Twilio'
  | 'Wati'
  | 'AiSensy'
  | 'Other';

export interface ClinicSettings {
  clinic_name: string;
  clinic_phone: string;
  clinic_address: string;
  whatsapp_provider?: WhatsAppProvider;
  api_provider?: 'simulated' | 'meta_cloud' | 'generic_webhook' | 'twilio' | WhatsAppProvider;
  api_base_url?: string;
  api_key?: string;
  whatsapp_api_key?: string;
  api_key_set?: boolean;
  whatsapp_business_number?: string;
  phone_number_id: string;
  webhook_url?: string;
  template_name?: string;
  template_language?: string;
  reminders_enabled?: {
    one_day_before: boolean;
    two_days_before: boolean;
    same_day: boolean;
  };
  templates: {
    welcome?: string;
    welcome_message?: string;
    followup_reminder?: string;
    reminder_1_day?: string;
    reminder_2_days?: string;
    reminder_same_day?: string;
    sameday_reminder?: string;
    overdue_reminder?: string;
    treatment_followup?: string;
    treatment_completed?: string;
    [key: string]: any;
  };
}

export interface DashboardStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  activeTreatments: number;
  followupsDue: number;
  followupsToday: number;
  overdueFollowups: number;
  treatmentBreakdown: { treatment: string; count: number; category: string }[];
  monthlyTrend: { month: string; newPatients: number; totalVisits: number }[];
  statusDistribution: { status: string; count: number }[];
}

export interface AnalyticsData {
  month: string;
  patientStats: {
    total: number;
    newPatients: number;
    returningPatients: number;
  };
  treatmentStats: {
    rct: number;
    cleaning: number;
    extraction: number;
    implant: number;
    braces: number;
    whitening: number;
    other: number;
    allTreatments: { treatment: string; count: number }[];
  };
  followupStats: {
    completed: number;
    upcoming: number;
    overdue: number;
  };
  doctorStats: { doctor: string; patientCount: number }[];
}

export interface TreatmentCategory {
  category: string;
  treatments: string[];
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    category: 'General Dentistry',
    treatments: [
      'Dental Check-up',
      'Teeth Cleaning / Scaling',
      'Teeth Polishing',
      'Tooth Filling',
      'Tooth Extraction',
      'Gum Treatment',
      'Tooth Sensitivity',
    ],
  },
  {
    category: 'Restorative / Advanced',
    treatments: [
      'Root Canal Treatment (RCT)',
      'Dental Crown / Cap',
      'Dental Bridge',
      'Dental Implant',
      'Denture',
      'Wisdom Tooth Removal',
    ],
  },
  {
    category: 'Cosmetic Dentistry',
    treatments: [
      'Teeth Whitening',
      'Dental Veneers',
      'Smile Designing',
    ],
  },
  {
    category: 'Orthodontics',
    treatments: [
      'Braces',
      'Clear Aligners',
      'Retainer',
    ],
  },
  {
    category: 'Pediatric Dentistry',
    treatments: [
      'Child Dental Check-up',
      'Fluoride Treatment',
      'Sealants',
      'Milk Tooth Treatment',
    ],
  },
  {
    category: 'Other',
    treatments: ['Other Treatment'],
  },
];

export const DOCTORS = [
  'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
  'Dr. Sunita Sharma (BDS, MDS - Orthodontist)',
  'Dr. Arun Kulkarni (BDS - General & Implantologist)',
  'Dr. Neha Kapoor (BDS, MDS - Pedodontist)',
];
