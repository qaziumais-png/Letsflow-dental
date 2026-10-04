import express from 'express';
import { db } from './db';
import {
  sendWelcomeMessage,
  sendFollowupReminder,
  checkAndSendDueReminders,
  sendCustomWhatsAppMessage,
  getProviderInstance,
} from './whatsapp/automation';

export function createApiApp() {
  const app = express();

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dashboard stats
  app.get('/api/dashboard-stats', (req, res) => {
    try {
      const stats = db.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Patients list with query filters
  app.get('/api/patients', (req, res) => {
    try {
      const { search, treatment, doctor, status, dateRange, sortBy } = req.query as any;
      const patients = db.getPatients({
        search,
        treatment,
        doctor,
        status,
        dateRange,
        sortBy,
      });
      res.json(patients);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create patient + Auto trigger WhatsApp welcome message
  app.post('/api/patients', async (req, res) => {
    try {
      const patientData = req.body;
      if (!patientData.name || !patientData.phone) {
        return res.status(400).json({ error: 'Patient Name and Mobile Number are required.' });
      }

      // 1. Save patient
      // 2. Create patient ID
      // 3. Save treatment
      // 4. Save follow-up if entered
      const newPatient = db.createPatient(patientData);

      // 5. Trigger WhatsApp welcome message
      let welcomeResult = null;
      try {
        welcomeResult = await sendWelcomeMessage(newPatient);
      } catch (wErr: any) {
        console.error('Failed to dispatch welcome message:', wErr);
        welcomeResult = { success: false, error: wErr.message, status: 'Failed' };
      }

      // 6. Return created patient + welcome result
      res.status(201).json({
        patient: newPatient,
        welcomeMessageResult: welcomeResult,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Single patient profile with visits, followups, message logs
  app.get('/api/patients/:id', (req, res) => {
    try {
      const data = db.getPatientById(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update patient details / treatment status
  app.put('/api/patients/:id', (req, res) => {
    try {
      const updated = db.updatePatient(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add visit for patient
  app.post('/api/patients/:id/visits', (req, res) => {
    try {
      const visit = db.addVisit(req.params.id, req.body);
      res.status(201).json(visit);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create follow-up for patient
  app.post('/api/patients/:id/followups', (req, res) => {
    try {
      const patient = db.getPatientById(req.params.id)?.patient;
      const followup = db.createFollowup({
        patient_id: req.params.id,
        patient_name: patient?.name,
        patient_phone: patient?.phone,
        treatment: patient?.treatment,
        followup_date: req.body.followup_date,
        followup_note: req.body.followup_note || 'Dental follow-up sitting',
        reminder_enabled: req.body.reminder_enabled !== false,
        reminder_timing: req.body.reminder_timing || '1_day_before',
        whatsapp_status: 'Pending',
      });
      res.status(201).json(followup);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Follow-ups list
  app.get('/api/followups', (req, res) => {
    try {
      const followups = db.getFollowups();
      res.json(followups);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Edit follow-up
  app.put('/api/followups/:id', (req, res) => {
    try {
      const updated = db.updateFollowup(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Followup not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark follow-up completed
  app.put('/api/followups/:id/complete', (req, res) => {
    try {
      const result = db.completeFollowup(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Followup not found' });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Manual trigger for WhatsApp reminder on specific follow-up
  app.post('/api/followups/:id/send-reminder', async (req, res) => {
    try {
      const { type } = req.body;
      const result = await sendFollowupReminder(req.params.id, type);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger automated reminder sweep
  app.post('/api/followups/trigger-automated-reminders', async (req, res) => {
    try {
      const result = await checkAndSendDueReminders();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // WhatsApp messages log
  app.get('/api/whatsapp/messages', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const messages = db.getMessages(limit);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Send custom WhatsApp message
  app.post('/api/whatsapp/send-custom', async (req, res) => {
    try {
      const { patient_id, phone, name, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ error: 'Phone number and message text are required.' });
      }
      const result = await sendCustomWhatsAppMessage(
        patient_id || 'manual',
        phone,
        name || 'Patient',
        message
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings: Get WhatsApp and Clinic Config
  app.get('/api/settings', (req, res) => {
    try {
      const full = db.getSettings();
      // Mask api_key for safety
      const safeSettings = {
        ...full,
        api_key: full.api_key ? '••••••••' + full.api_key.slice(-4) : '',
        api_key_set: Boolean(full.api_key && full.api_key.trim().length > 0),
      };
      res.json(safeSettings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Settings
  app.put('/api/settings', (req, res) => {
    try {
      const updates = req.body;
      // If api_key is passed as masked placeholder, don't overwrite with dots
      if (updates.api_key && updates.api_key.startsWith('••••')) {
        delete updates.api_key;
      }
      const updated = db.updateSettings(updates);
      res.json({
        ...updated,
        api_key: updated.api_key ? '••••••••' + updated.api_key.slice(-4) : '',
        api_key_set: Boolean(updated.api_key && updated.api_key.trim().length > 0),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Test WhatsApp API connection
  app.post('/api/whatsapp/test-connection', async (req, res) => {
    try {
      const provider = getProviderInstance();
      const testResult = await provider.testConnection();
      res.json(testResult);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Analytics
  app.get('/api/analytics', (req, res) => {
    try {
      const month = (req.query.month as string) || '2026-09';
      const analytics = db.getAnalytics(month);
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}
