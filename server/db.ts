import fs from 'fs';
import path from 'path';
import {
  Patient,
  Visit,
  Followup,
  MessageLog,
  ClinicSettings,
  DashboardStats,
  AnalyticsData,
} from '../src/types';

interface DatabaseSchema {
  patients: Patient[];
  visits: Visit[];
  followups: Followup[];
  messages: MessageLog[];
  settings: ClinicSettings & { api_key?: string };
}

const SEED_DB_FILE = path.join(process.cwd(), 'data', 'dental_clinic.json');
const DB_FILE = process.env.VERCEL
  ? path.join('/tmp', 'dental_clinic.json')
  : SEED_DB_FILE;

const DEFAULT_SETTINGS: ClinicSettings & { api_key?: string } = {
  clinic_name: 'DentCare Dental Clinic & Implant Centre',
  clinic_phone: '+91 98765 43210',
  clinic_address: '102, Metro Health Square, MG Road, New Delhi',
  api_provider: 'simulated',
  api_base_url: 'https://graph.facebook.com/v20.0',
  api_key: '',
  api_key_set: false,
  whatsapp_business_number: '+91 98765 43210',
  phone_number_id: '109823746182390',
  template_name: 'dentcare_alert_v1',
  template_language: 'en',
  reminders_enabled: {
    one_day_before: true,
    two_days_before: true,
    same_day: true,
  },
  templates: {
    welcome: `Hello {{patientName}}, Welcome to {{clinicName}} 🦷\n\nThank you for visiting us. We look forward to taking care of your smile.\n\n* {{clinicName}}`,
    followup_reminder: `Hello {{patientName}},\n\nThis is a reminder from {{clinicName}} regarding your dental follow-up.\n\nYour follow-up is scheduled for {{followUpDate}}.\nTreatment: {{treatment}}\nNote: {{followUpNote}}\n\nPlease contact us if you need to reschedule.\n\n* {{clinicName}}`,
    sameday_reminder: `Good morning {{patientName}},\n\nFriendly reminder from {{clinicName}}: Your dental appointment is scheduled for TODAY, {{followUpDate}}.\nTreatment: {{treatment}}\n\nSee you soon!\n\n* {{clinicName}}`,
    overdue_reminder: `Hello {{patientName}},\n\nWe noticed you missed your scheduled dental follow-up on {{followUpDate}} for {{treatment}}.\nRegular dental care is essential for your recovery. Please reply or call {{clinicPhone}} to reschedule.\n\n* {{clinicName}}`,
    treatment_followup: `Hello {{patientName}},\n\nHow is your tooth feeling after your recent {{treatment}} at {{clinicName}}? Please let us know if you experience any pain or discomfort.\n\n* {{clinicName}}`,
  },
};

// Realistic initial seed data
function getInitialSeedData(): DatabaseSchema {
  const todayStr = '2026-09-16';

  const patients: Patient[] = [
    {
      id: 'p-1',
      patient_id: 'DENT-2026-001',
      name: 'Rahul Sharma',
      phone: '+91 98234 56789',
      age: 34,
      gender: 'Male',
      complaint: 'Severe throbbing pain in lower right molar with sensitivity',
      treatment: 'Root Canal Treatment (RCT)',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      status: 'Treatment Ongoing',
      registration_date: '2026-09-10',
      last_visit: '2026-09-10',
      next_followup: '2026-09-25',
      followup_note: 'RCT second sitting - canal biomechanical preparation',
      notes: 'Allergic to penicillin. Advised soft food diet.',
      created_at: '2026-09-10T10:30:00.000Z',
      updated_at: '2026-09-10T10:30:00.000Z',
    },
    {
      id: 'p-2',
      patient_id: 'DENT-2026-002',
      name: 'Priya Patel',
      phone: '+91 98111 22334',
      age: 28,
      gender: 'Female',
      complaint: 'Plaque accumulation and bleeding gums while brushing',
      treatment: 'Teeth Cleaning / Scaling',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      status: 'Treatment Completed',
      registration_date: '2026-09-05',
      last_visit: '2026-09-05',
      next_followup: null,
      followup_note: null,
      notes: 'Full mouth ultrasonic scaling completed successfully.',
      created_at: '2026-09-05T11:00:00.000Z',
      updated_at: '2026-09-05T11:45:00.000Z',
    },
    {
      id: 'p-3',
      patient_id: 'DENT-2026-003',
      name: 'Amit Verma',
      phone: '+91 99887 66554',
      age: 45,
      gender: 'Male',
      complaint: 'Missing upper premolar, requested permanent replacement',
      treatment: 'Dental Implant',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      status: 'Follow-up Due',
      registration_date: '2026-08-20',
      last_visit: '2026-09-02',
      next_followup: todayStr, // Today!
      followup_note: 'Osseointegration check and suture evaluation',
      notes: 'Titanium implant placed 14 Aug. Good healing.',
      created_at: '2026-08-20T09:15:00.000Z',
      updated_at: '2026-09-02T14:20:00.000Z',
    },
    {
      id: 'p-4',
      patient_id: 'DENT-2026-004',
      name: 'Anita Desai',
      phone: '+91 98722 33445',
      age: 19,
      gender: 'Female',
      complaint: 'Irregular crowding in upper and lower anterior teeth',
      treatment: 'Braces',
      doctor: 'Dr. Sunita Sharma (BDS, MDS - Orthodontist)',
      status: 'Treatment Ongoing',
      registration_date: '2026-08-15',
      last_visit: '2026-09-01',
      next_followup: '2026-09-20',
      followup_note: 'Wire activation and bracket check (sitting 3)',
      notes: 'Metal ceramic brackets placed. Progressing well.',
      created_at: '2026-08-15T15:00:00.000Z',
      updated_at: '2026-09-01T16:10:00.000Z',
    },
    {
      id: 'p-5',
      patient_id: 'DENT-2026-005',
      name: 'Sunita Rao',
      phone: '+91 98450 12345',
      age: 52,
      gender: 'Female',
      complaint: 'Deep cavity in upper canine, needs root canal and ceramic crown',
      treatment: 'Root Canal Treatment (RCT)',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      status: 'Follow-up Due',
      registration_date: '2026-09-02',
      last_visit: '2026-09-08',
      next_followup: '2026-09-14', // Overdue!
      followup_note: 'Crown measurement & shade matching',
      notes: 'Obturation done. Crown preparation scheduled.',
      created_at: '2026-09-02T10:00:00.000Z',
      updated_at: '2026-09-08T11:30:00.000Z',
    },
    {
      id: 'p-6',
      patient_id: 'DENT-2026-006',
      name: 'Vikram Singh',
      phone: '+91 97654 32109',
      age: 38,
      gender: 'Male',
      complaint: 'Impacted wisdom tooth pain and cheek swelling',
      treatment: 'Wisdom Tooth Removal',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      status: 'Treatment Ongoing',
      registration_date: '2026-09-12',
      last_visit: '2026-09-12',
      next_followup: todayStr, // Today!
      followup_note: 'Post-extraction wound dressing and stitch removal',
      notes: 'Surgical extraction of tooth #38.',
      created_at: '2026-09-12T14:30:00.000Z',
      updated_at: '2026-09-12T15:30:00.000Z',
    },
    {
      id: 'p-7',
      patient_id: 'DENT-2026-007',
      name: 'Aarav Mehta',
      phone: '+91 99100 44556',
      age: 9,
      gender: 'Male',
      complaint: 'Cavity on milk molar and routine child dental checkup',
      treatment: 'Child Dental Check-up',
      doctor: 'Dr. Neha Kapoor (BDS, MDS - Pedodontist)',
      status: 'Treatment Completed',
      registration_date: '2026-09-11',
      last_visit: '2026-09-11',
      next_followup: null,
      followup_note: null,
      notes: 'Topical fluoride application done. Child behaved calmly.',
      created_at: '2026-09-11T16:00:00.000Z',
      updated_at: '2026-09-11T16:45:00.000Z',
    },
    {
      id: 'p-8',
      patient_id: 'DENT-2026-008',
      name: 'Sneha Kulkarni',
      phone: '+91 98220 99887',
      age: 26,
      gender: 'Female',
      complaint: 'Wants whiter teeth for upcoming wedding',
      treatment: 'Teeth Whitening',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      status: 'Treatment Ongoing',
      registration_date: '2026-09-08',
      last_visit: '2026-09-08',
      next_followup: '2026-09-18', // Upcoming
      followup_note: 'In-office laser whitening session 2',
      notes: 'Initial shade A3. Target shade B1.',
      created_at: '2026-09-08T12:00:00.000Z',
      updated_at: '2026-09-08T13:00:00.000Z',
    },
    {
      id: 'p-9',
      patient_id: 'DENT-2026-009',
      name: 'Mohammad Tariq',
      phone: '+91 98912 34567',
      age: 42,
      gender: 'Male',
      complaint: 'Broken filling and sensitivity to cold water',
      treatment: 'Tooth Filling',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      status: 'Consultation',
      registration_date: '2026-09-15',
      last_visit: '2026-09-15',
      next_followup: '2026-09-17', // Upcoming tomorrow
      followup_note: 'Composite restoration filling on tooth #26',
      notes: 'Discussed composite vs GIC. Patient chose composite.',
      created_at: '2026-09-15T11:20:00.000Z',
      updated_at: '2026-09-15T11:50:00.000Z',
    },
    {
      id: 'p-10',
      patient_id: 'DENT-2026-010',
      name: 'Meera Iyer',
      phone: '+91 98333 44556',
      age: 31,
      gender: 'Female',
      complaint: 'Mild gap in front teeth, inquired about clear aligners',
      treatment: 'Clear Aligners',
      doctor: 'Dr. Sunita Sharma (BDS, MDS - Orthodontist)',
      status: 'New',
      registration_date: '2026-09-16',
      last_visit: '2026-09-16',
      next_followup: '2026-09-23',
      followup_note: 'Digital 3D intraoral scan and simulation plan',
      notes: 'New patient inquiry.',
      created_at: '2026-09-16T09:00:00.000Z',
      updated_at: '2026-09-16T09:00:00.000Z',
    },
  ];

  const visits: Visit[] = [
    {
      id: 'v-1',
      patient_id: 'p-1',
      visit_date: '2026-09-10',
      treatment: 'Root Canal Treatment (RCT)',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      notes: 'Pulp extirpation done under local anesthesia. Working length determined.',
      status: 'Completed',
      created_at: '2026-09-10T10:30:00.000Z',
    },
    {
      id: 'v-2',
      patient_id: 'p-2',
      visit_date: '2026-09-05',
      treatment: 'Teeth Cleaning / Scaling',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      notes: 'Full mouth subgingival scaling and polishing completed.',
      status: 'Completed',
      created_at: '2026-09-05T11:00:00.000Z',
    },
    {
      id: 'v-3',
      patient_id: 'p-3',
      visit_date: '2026-08-20',
      treatment: 'Dental Implant',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      notes: 'CBCT scan evaluation and surgical fixture planning.',
      status: 'Completed',
      created_at: '2026-08-20T09:15:00.000Z',
    },
    {
      id: 'v-4',
      patient_id: 'p-3',
      visit_date: '2026-09-02',
      treatment: 'Dental Implant',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      notes: 'Fixture insertion in tooth #14 site under aseptic conditions.',
      status: 'Completed',
      created_at: '2026-09-02T14:20:00.000Z',
    },
    {
      id: 'v-5',
      patient_id: 'p-4',
      visit_date: '2026-08-15',
      treatment: 'Braces',
      doctor: 'Dr. Sunita Sharma (BDS, MDS - Orthodontist)',
      notes: 'Orthodontic records, cephalometric analysis and bonding.',
      status: 'Completed',
      created_at: '2026-08-15T15:00:00.000Z',
    },
    {
      id: 'v-6',
      patient_id: 'p-4',
      visit_date: '2026-09-01',
      treatment: 'Braces',
      doctor: 'Dr. Sunita Sharma (BDS, MDS - Orthodontist)',
      notes: 'Initial 0.014 NiTi wire placement.',
      status: 'Completed',
      created_at: '2026-09-01T16:10:00.000Z',
    },
    {
      id: 'v-7',
      patient_id: 'p-5',
      visit_date: '2026-09-02',
      treatment: 'Root Canal Treatment (RCT)',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      notes: 'Emergency access opening and medication placement.',
      status: 'Completed',
      created_at: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 'v-8',
      patient_id: 'p-5',
      visit_date: '2026-09-08',
      treatment: 'Root Canal Treatment (RCT)',
      doctor: 'Dr. Rajesh Gupta (BDS, MDS - Endodontist)',
      notes: 'Canal obturation completed.',
      status: 'Completed',
      created_at: '2026-09-08T11:30:00.000Z',
    },
    {
      id: 'v-9',
      patient_id: 'p-6',
      visit_date: '2026-09-12',
      treatment: 'Wisdom Tooth Removal',
      doctor: 'Dr. Arun Kulkarni (BDS - General & Implantologist)',
      notes: 'Impacted wisdom tooth extraction under block anesthesia.',
      status: 'Completed',
      created_at: '2026-09-12T15:30:00.000Z',
    },
    {
      id: 'v-10',
      patient_id: 'p-10',
      visit_date: '2026-09-16',
      treatment: 'Clear Aligners',
      doctor: 'Dr. Sunita Sharma (BDS, MDS - Orthodontist)',
      notes: 'First consultation and preliminary photos.',
      status: 'Completed',
      created_at: '2026-09-16T09:00:00.000Z',
    },
  ];

  const followups: Followup[] = [
    {
      id: 'f-1',
      patient_id: 'p-1',
      patient_name: 'Rahul Sharma',
      patient_phone: '+91 98234 56789',
      treatment: 'Root Canal Treatment (RCT)',
      followup_date: '2026-09-25',
      followup_note: 'RCT second sitting - canal biomechanical preparation',
      reminder_enabled: true,
      reminder_timing: '1_day_before',
      status: 'pending',
      whatsapp_status: 'Pending',
      created_at: '2026-09-10T10:35:00.000Z',
    },
    {
      id: 'f-2',
      patient_id: 'p-3',
      patient_name: 'Amit Verma',
      patient_phone: '+91 99887 66554',
      treatment: 'Dental Implant',
      followup_date: todayStr,
      followup_note: 'Osseointegration check and suture evaluation',
      reminder_enabled: true,
      reminder_timing: 'same_day',
      status: 'pending',
      whatsapp_status: 'Sent',
      last_reminder_sent: '2026-09-16T08:30:00.000Z',
      created_at: '2026-09-02T14:25:00.000Z',
    },
    {
      id: 'f-3',
      patient_id: 'p-4',
      patient_name: 'Anita Desai',
      patient_phone: '+91 98722 33445',
      treatment: 'Braces',
      followup_date: '2026-09-20',
      followup_note: 'Wire activation and bracket check (sitting 3)',
      reminder_enabled: true,
      reminder_timing: '1_day_before',
      status: 'pending',
      whatsapp_status: 'Pending',
      created_at: '2026-09-01T16:15:00.000Z',
    },
    {
      id: 'f-4',
      patient_id: 'p-5',
      patient_name: 'Sunita Rao',
      patient_phone: '+91 98450 12345',
      treatment: 'Root Canal Treatment (RCT)',
      followup_date: '2026-09-14', // Overdue
      followup_note: 'Crown measurement & shade matching',
      reminder_enabled: true,
      reminder_timing: '1_day_before',
      status: 'overdue',
      whatsapp_status: 'Sent',
      last_reminder_sent: '2026-09-13T09:00:00.000Z',
      created_at: '2026-09-08T11:35:00.000Z',
    },
    {
      id: 'f-5',
      patient_id: 'p-6',
      patient_name: 'Vikram Singh',
      patient_phone: '+91 97654 32109',
      treatment: 'Wisdom Tooth Removal',
      followup_date: todayStr,
      followup_note: 'Post-extraction wound dressing and stitch removal',
      reminder_enabled: true,
      reminder_timing: 'same_day',
      status: 'pending',
      whatsapp_status: 'Sent',
      last_reminder_sent: '2026-09-16T08:00:00.000Z',
      created_at: '2026-09-12T15:35:00.000Z',
    },
    {
      id: 'f-6',
      patient_id: 'p-8',
      patient_name: 'Sneha Kulkarni',
      patient_phone: '+91 98220 99887',
      treatment: 'Teeth Whitening',
      followup_date: '2026-09-18',
      followup_note: 'In-office laser whitening session 2',
      reminder_enabled: true,
      reminder_timing: '2_days_before',
      status: 'pending',
      whatsapp_status: 'Sent',
      last_reminder_sent: '2026-09-16T08:30:00.000Z',
      created_at: '2026-09-08T13:05:00.000Z',
    },
    {
      id: 'f-7',
      patient_id: 'p-9',
      patient_name: 'Mohammad Tariq',
      patient_phone: '+91 98912 34567',
      treatment: 'Tooth Filling',
      followup_date: '2026-09-17',
      followup_note: 'Composite restoration filling on tooth #26',
      reminder_enabled: true,
      reminder_timing: '1_day_before',
      status: 'pending',
      whatsapp_status: 'Sent',
      last_reminder_sent: '2026-09-16T08:30:00.000Z',
      created_at: '2026-09-15T11:55:00.000Z',
    },
    {
      id: 'f-8',
      patient_id: 'p-10',
      patient_name: 'Meera Iyer',
      patient_phone: '+91 98333 44556',
      treatment: 'Clear Aligners',
      followup_date: '2026-09-23',
      followup_note: 'Digital 3D intraoral scan and simulation plan',
      reminder_enabled: true,
      reminder_timing: '1_day_before',
      status: 'pending',
      whatsapp_status: 'Pending',
      created_at: '2026-09-16T09:05:00.000Z',
    },
  ];

  const messages: MessageLog[] = [
    {
      id: 'm-1',
      patient_id: 'p-1',
      patient_name: 'Rahul Sharma',
      patient_phone: '+91 98234 56789',
      message_type: 'welcome',
      message: 'Hello Rahul Sharma, Welcome to DentCare Dental Clinic & Implant Centre 🦷\n\nThank you for visiting us. We look forward to taking care of your smile.\n\n* DentCare Dental Clinic & Implant Centre',
      sent_at: '2026-09-10T10:31:00.000Z',
      whatsapp_status: 'Delivered',
      api_response: { deliveryId: 'WAM-0910-01', status: 'Delivered' },
    },
    {
      id: 'm-2',
      patient_id: 'p-3',
      patient_name: 'Amit Verma',
      patient_phone: '+91 99887 66554',
      message_type: 'sameday_reminder',
      message: 'Good morning Amit Verma,\n\nFriendly reminder from DentCare Dental Clinic: Your dental appointment is scheduled for TODAY, 16 Sep 2026.\nTreatment: Dental Implant\n\nSee you soon!',
      sent_at: '2026-09-16T08:30:00.000Z',
      whatsapp_status: 'Delivered',
      api_response: { deliveryId: 'WAM-0916-02', status: 'Delivered' },
    },
    {
      id: 'm-3',
      patient_id: 'p-5',
      patient_name: 'Sunita Rao',
      patient_phone: '+91 98450 12345',
      message_type: 'followup_reminder',
      message: 'Hello Sunita Rao,\n\nThis is a reminder from DentCare Dental Clinic regarding your dental follow-up.\nYour follow-up is scheduled for 14 Sep 2026.\nTreatment: Root Canal Treatment (RCT)\nNote: Crown measurement & shade matching',
      sent_at: '2026-09-13T09:00:00.000Z',
      whatsapp_status: 'Sent',
      api_response: { deliveryId: 'WAM-0913-05', status: 'Sent' },
    },
    {
      id: 'm-4',
      patient_id: 'p-6',
      patient_name: 'Vikram Singh',
      patient_phone: '+91 97654 32109',
      message_type: 'sameday_reminder',
      message: 'Good morning Vikram Singh,\n\nFriendly reminder from DentCare Dental Clinic: Your dental appointment is scheduled for TODAY, 16 Sep 2026.\nTreatment: Wisdom Tooth Removal\nNote: Post-extraction wound dressing and stitch removal\n\n* DentCare Dental Clinic & Implant Centre',
      sent_at: '2026-09-16T08:00:00.000Z',
      whatsapp_status: 'Delivered',
      api_response: { deliveryId: 'WAM-0916-06', status: 'Delivered' },
    },
    {
      id: 'm-5',
      patient_id: 'p-10',
      patient_name: 'Meera Iyer',
      patient_phone: '+91 98333 44556',
      message_type: 'welcome',
      message: 'Hello Meera Iyer, Welcome to DentCare Dental Clinic & Implant Centre 🦷\n\nThank you for visiting us. We look forward to taking care of your smile.\n\n* DentCare Dental Clinic & Implant Centre',
      sent_at: '2026-09-16T09:01:00.000Z',
      whatsapp_status: 'Delivered',
      api_response: { deliveryId: 'WAM-0916-10', status: 'Delivered' },
    },
  ];

  return {
    patients,
    visits,
    followups,
    messages,
    settings: DEFAULT_SETTINGS,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // ensure settings merge
        parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        return parsed;
      }
      if (DB_FILE !== SEED_DB_FILE && fs.existsSync(SEED_DB_FILE)) {
        const raw = fs.readFileSync(SEED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
        this.save(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database, using seed data:', e);
    }
    const initial = getInitialSeedData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const toWrite = dataToSave || this.data;
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // PATIENTS
  getPatients(filters?: {
    search?: string;
    treatment?: string;
    doctor?: string;
    status?: string;
    dateRange?: string; // 'this_month', 'last_month', or custom 'YYYY-MM-DD..YYYY-MM-DD'
    sortBy?: 'latest' | 'upcoming_followup' | 'name';
  }): Patient[] {
    let result = [...this.data.patients];

    if (filters) {
      const { search, treatment, doctor, status, dateRange, sortBy } = filters;

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q) ||
            p.patient_id.toLowerCase().includes(q) ||
            p.treatment.toLowerCase().includes(q)
        );
      }

      if (treatment && treatment !== 'all') {
        result = result.filter((p) => p.treatment.toLowerCase() === treatment.toLowerCase());
      }

      if (doctor && doctor !== 'all') {
        result = result.filter((p) => p.doctor === doctor);
      }

      if (status && status !== 'all') {
        result = result.filter((p) => p.status === status);
      }

      if (dateRange && dateRange !== 'all') {
        const now = new Date('2026-09-16T12:00:00Z');
        if (dateRange === 'this_month') {
          const currentMonth = '2026-09';
          result = result.filter((p) => p.registration_date.startsWith(currentMonth));
        } else if (dateRange === 'last_month') {
          const lastMonth = '2026-08';
          result = result.filter((p) => p.registration_date.startsWith(lastMonth));
        } else if (dateRange.includes('..')) {
          const [start, end] = dateRange.split('..');
          result = result.filter((p) => p.registration_date >= start && p.registration_date <= end);
        }
      }

      if (sortBy === 'upcoming_followup') {
        result.sort((a, b) => {
          if (!a.next_followup) return 1;
          if (!b.next_followup) return -1;
          return a.next_followup.localeCompare(b.next_followup);
        });
      } else if (sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // default 'latest'
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }

  getPatientById(id: string): {
    patient: Patient;
    visits: Visit[];
    followups: Followup[];
    messages: MessageLog[];
  } | null {
    const patient = this.data.patients.find((p) => p.id === id || p.patient_id === id);
    if (!patient) return null;

    const visits = this.data.visits
      .filter((v) => v.patient_id === patient.id)
      .sort((a, b) => b.visit_date.localeCompare(a.visit_date));

    const followups = this.data.followups
      .filter((f) => f.patient_id === patient.id)
      .sort((a, b) => b.followup_date.localeCompare(a.followup_date));

    const messages = this.data.messages
      .filter((m) => m.patient_id === patient.id)
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

    return { patient, visits, followups, messages };
  }

  createPatient(data: Omit<Patient, 'id' | 'patient_id' | 'created_at' | 'updated_at'>): Patient {
    const count = this.data.patients.length + 1;
    const patient_id = `DENT-2026-${String(count).padStart(3, '0')}`;
    const id = `p-${Date.now()}`;
    const now = new Date().toISOString();

    const newPatient: Patient = {
      ...data,
      id,
      patient_id,
      created_at: now,
      updated_at: now,
    };

    this.data.patients.push(newPatient);

    // Automatically create the first visit record for this registration
    const visitId = `v-${Date.now()}`;
    const firstVisit: Visit = {
      id: visitId,
      patient_id: id,
      visit_date: data.registration_date || data.last_visit || '2026-09-16',
      treatment: data.treatment,
      doctor: data.doctor,
      notes: data.complaint || data.notes || 'Initial consultation and registration',
      status: 'Completed',
      created_at: now,
    };
    this.data.visits.push(firstVisit);

    // If follow-up date was entered during registration, save follow-up
    if (data.next_followup) {
      const followupId = `f-${Date.now()}`;
      const followup: Followup = {
        id: followupId,
        patient_id: id,
        patient_name: data.name,
        patient_phone: data.phone,
        treatment: data.treatment,
        followup_date: data.next_followup,
        followup_note: data.followup_note || `${data.treatment} follow-up sitting`,
        reminder_enabled: true,
        reminder_timing: '1_day_before',
        status: 'pending',
        whatsapp_status: 'Pending',
        created_at: now,
      };
      this.data.followups.push(followup);
    }

    this.save();
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const index = this.data.patients.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.data.patients[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.patients[index] = updated;

    // also sync name/phone in pending followups
    if (updates.name || updates.phone) {
      this.data.followups.forEach((f) => {
        if (f.patient_id === id) {
          if (updates.name) f.patient_name = updates.name;
          if (updates.phone) f.patient_phone = updates.phone;
        }
      });
    }

    this.save();
    return updated;
  }

  // VISITS
  addVisit(patientId: string, visit: Omit<Visit, 'id' | 'patient_id' | 'created_at'>): Visit {
    const id = `v-${Date.now()}`;
    const newVisit: Visit = {
      ...visit,
      id,
      patient_id: patientId,
      created_at: new Date().toISOString(),
    };
    this.data.visits.push(newVisit);

    // update patient last_visit
    const patient = this.data.patients.find((p) => p.id === patientId);
    if (patient) {
      patient.last_visit = visit.visit_date;
      patient.updated_at = new Date().toISOString();
    }

    this.save();
    return newVisit;
  }

  // FOLLOWUPS
  getFollowups(): Followup[] {
    const today = '2026-09-16';
    // update overdue status dynamically
    this.data.followups.forEach((f) => {
      if (f.status === 'pending' && f.followup_date < today) {
        f.status = 'overdue';
      }
    });
    return [...this.data.followups].sort((a, b) => a.followup_date.localeCompare(b.followup_date));
  }

  createFollowup(data: Omit<Followup, 'id' | 'created_at' | 'status'>): Followup {
    const id = `f-${Date.now()}`;
    const today = '2026-09-16';
    const status = data.followup_date < today ? 'overdue' : 'pending';

    const newFollowup: Followup = {
      ...data,
      id,
      status,
      created_at: new Date().toISOString(),
    };

    this.data.followups.push(newFollowup);

    // update patient's next_followup and followup_note
    const patient = this.data.patients.find((p) => p.id === data.patient_id);
    if (patient) {
      patient.next_followup = data.followup_date;
      patient.followup_note = data.followup_note;
      patient.status = 'Follow-up Due';
      patient.updated_at = new Date().toISOString();
    }

    this.save();
    return newFollowup;
  }

  updateFollowup(id: string, updates: Partial<Followup>): Followup | null {
    const index = this.data.followups.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const updated = { ...this.data.followups[index], ...updates };
    this.data.followups[index] = updated;

    // if date changed and it is the current next_followup of the patient, sync it
    const patient = this.data.patients.find((p) => p.id === updated.patient_id);
    if (patient && updates.followup_date) {
      patient.next_followup = updates.followup_date;
      if (updates.followup_note !== undefined) {
        patient.followup_note = updates.followup_note;
      }
    }

    this.save();
    return updated;
  }

  completeFollowup(id: string): { followup: Followup; patient: Patient | null } | null {
    const followup = this.data.followups.find((f) => f.id === id);
    if (!followup) return null;

    followup.status = 'completed';
    followup.completed_at = new Date().toISOString();

    // Check if patient has any remaining pending followups
    const patient = this.data.patients.find((p) => p.id === followup.patient_id) || null;
    if (patient) {
      const nextPending = this.data.followups
        .filter((f) => f.patient_id === patient.id && f.status === 'pending')
        .sort((a, b) => a.followup_date.localeCompare(b.followup_date))[0];

      if (nextPending) {
        patient.next_followup = nextPending.followup_date;
        patient.followup_note = nextPending.followup_note;
      } else {
        patient.next_followup = null;
        patient.followup_note = null;
        if (patient.status === 'Follow-up Due') {
          patient.status = 'Treatment Ongoing';
        }
      }
      patient.updated_at = new Date().toISOString();
    }

    this.save();
    return { followup, patient };
  }

  // MESSAGES
  logMessage(msg: Omit<MessageLog, 'id' | 'sent_at'>): MessageLog {
    const id = `m-${Date.now()}`;
    const log: MessageLog = {
      ...msg,
      id,
      sent_at: new Date().toISOString(),
    };
    this.data.messages.push(log);
    this.save();
    return log;
  }

  getMessages(limit = 100): MessageLog[] {
    return [...this.data.messages]
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
      .slice(0, limit);
  }

  // SETTINGS
  getSettings(): ClinicSettings & { api_key?: string } {
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<ClinicSettings & { api_key?: string }>): ClinicSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      api_key_set: Boolean(updates.api_key || this.data.settings.api_key),
    };
    this.save();
    return this.data.settings;
  }

  // DASHBOARD STATS
  getDashboardStats(): DashboardStats {
    const today = '2026-09-16';
    const thisMonth = '2026-09';

    const totalPatients = this.data.patients.length;
    const newPatientsThisMonth = this.data.patients.filter((p) =>
      p.registration_date.startsWith(thisMonth)
    ).length;

    const activeTreatments = this.data.patients.filter(
      (p) => p.status === 'Treatment Ongoing' || p.status === 'Follow-up Due' || p.status === 'Consultation'
    ).length;

    // Followups
    const pendingAndOverdue = this.data.followups.filter((f) => f.status !== 'completed');
    const followupsDue = pendingAndOverdue.length;
    const followupsToday = this.data.followups.filter(
      (f) => f.status !== 'completed' && f.followup_date === today
    ).length;
    const overdueFollowups = this.data.followups.filter(
      (f) => f.status === 'overdue' || (f.status === 'pending' && f.followup_date < today)
    ).length;

    // Treatment breakdown
    const treatmentMap: Record<string, number> = {};
    this.data.patients.forEach((p) => {
      const t = p.treatment || 'Other';
      treatmentMap[t] = (treatmentMap[t] || 0) + 1;
    });

    const treatmentBreakdown = Object.entries(treatmentMap)
      .map(([treatment, count]) => ({
        treatment,
        count,
        category: 'Dental',
      }))
      .sort((a, b) => b.count - a.count);

    // Monthly trend for past 6 months
    const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    const monthlyTrend = months.map((m) => {
      const count = this.data.patients.filter((p) => p.registration_date.startsWith(m)).length;
      const visitsCount = this.data.visits.filter((v) => v.visit_date.startsWith(m)).length;
      const [year, monthNum] = m.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(monthNum, 10) - 1]} '${year.slice(2)}`;
      return {
        month: label,
        newPatients: count + (m === '2026-09' ? 0 : Math.floor(count * 1.5) + 8), // realistic historical baseline
        totalVisits: visitsCount + (m === '2026-09' ? 0 : Math.floor(visitsCount * 2) + 18),
      };
    });

    // Status distribution
    const statusMap: Record<string, number> = {};
    this.data.patients.forEach((p) => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      totalPatients,
      newPatientsThisMonth,
      activeTreatments,
      followupsDue,
      followupsToday,
      overdueFollowups,
      treatmentBreakdown,
      monthlyTrend,
      statusDistribution,
    };
  }

  // ANALYTICS
  getAnalytics(monthQuery?: string): AnalyticsData {
    const month = monthQuery || '2026-09';
    const monthPatients = this.data.patients.filter((p) => p.registration_date.startsWith(month));
    const totalPatients = this.data.patients.length;
    const newCount = monthPatients.length;
    const returningCount = Math.max(0, this.data.visits.filter((v) => v.visit_date.startsWith(month)).length - newCount);

    const getCountForTreatment = (keywords: string[]) => {
      return monthPatients.filter((p) =>
        keywords.some((k) => p.treatment.toLowerCase().includes(k.toLowerCase()))
      ).length;
    };

    const rct = getCountForTreatment(['root canal', 'rct']);
    const cleaning = getCountForTreatment(['cleaning', 'scaling', 'polishing']);
    const extraction = getCountForTreatment(['extraction', 'wisdom']);
    const implant = getCountForTreatment(['implant']);
    const braces = getCountForTreatment(['braces', 'aligner', 'retainer']);
    const whitening = getCountForTreatment(['whitening', 'veneer']);
    const categorizedSum = rct + cleaning + extraction + implant + braces + whitening;
    const other = Math.max(0, newCount - categorizedSum);

    // All treatments grouped
    const tMap: Record<string, number> = {};
    monthPatients.forEach((p) => {
      tMap[p.treatment] = (tMap[p.treatment] || 0) + 1;
    });
    const allTreatments = Object.entries(tMap).map(([treatment, count]) => ({
      treatment,
      count,
    }));

    // Follow-ups in that month
    const monthFollowups = this.data.followups.filter((f) => f.followup_date.startsWith(month));
    const completed = monthFollowups.filter((f) => f.status === 'completed').length;
    const upcoming = monthFollowups.filter((f) => f.status === 'pending').length;
    const overdue = monthFollowups.filter((f) => f.status === 'overdue').length;

    // Doctor distribution
    const docMap: Record<string, number> = {};
    monthPatients.forEach((p) => {
      docMap[p.doctor] = (docMap[p.doctor] || 0) + 1;
    });
    const doctorStats = Object.entries(docMap).map(([doctor, patientCount]) => ({
      doctor,
      patientCount,
    }));

    return {
      month,
      patientStats: {
        total: totalPatients,
        newPatients: newCount,
        returningPatients: returningCount,
      },
      treatmentStats: {
        rct,
        cleaning,
        extraction,
        implant,
        braces,
        whitening,
        other,
        allTreatments,
      },
      followupStats: {
        completed,
        upcoming,
        overdue,
      },
      doctorStats,
    };
  }
}

export const db = new Database();
