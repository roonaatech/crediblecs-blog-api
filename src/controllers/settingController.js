import pool from '../config/database.js';

let nodemailer;
try {
  const nodemailerModule = await import('nodemailer');
  nodemailer = nodemailerModule.default || nodemailerModule;
} catch (e) {
  console.warn('nodemailer not installed. Emails will not be sent.');
}

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM system_settings');
    console.log('[getSettings] Raw DB rows:', JSON.stringify(rows));
    
    const settings = rows.reduce((acc, row) => {
      let val = row.setting_value;
      if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch(e){}
      }
      acc[row.setting_key] = val;
      return acc;
    }, {});
    
    console.log('[getSettings] Parsed settings:', JSON.stringify(settings));
    
    // Set defaults if empty
    if (!settings.smtp) {
        settings.smtp = {
            host: '',
            port: 587,
            user: '',
            pass: '',
            senderEmail: '',
            recipientEmail: ''
        };
    }
    if (!settings.emailTemplate) {
        settings.emailTemplate = {
            subject: 'New Free Compliance Review Request',
            body: 'You have received a new request from {{name}}.\nPhone: {{phone}}\nEmail: {{email}}\nService: {{service}}'
        };
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    console.log('[updateSettings] Incoming req.body:', JSON.stringify(req.body));
    const settings = req.body.settings || req.body; // Expects { smtp: {...}, emailTemplate: {...} }
    console.log('[updateSettings] Extracted settings object:', JSON.stringify(settings));
    
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid settings format' });
    }

    for (const ObjectKey of Object.keys(settings)) {
      const valStr = JSON.stringify(settings[ObjectKey]);
      console.log(`[updateSettings] Saving key: ${ObjectKey}, value: ${valStr}`);
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [ObjectKey, valStr, valStr]
      );
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testSmtp = async (req, res) => {
    try {
        const { smtp } = req.body;
        if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
            return res.status(400).json({ success: false, message: 'Incomplete SMTP configuration for testing.' });
        }
        
        if (!nodemailer) {
            return res.status(500).json({ success: false, message: 'nodemailer package is not installed. Please install it to send emails.' });
        }
        
        const { host, port, user, pass, senderEmail, recipientEmail } = smtp;
        const transporter = nodemailer.createTransport({
            host,
            port: parseInt(port) || 587,
            secure: parseInt(port) === 465,
            auth: { user, pass }
        });
        
        // Verify connection setup first
        await transporter.verify();
        
        // Send actual test email
        await transporter.sendMail({
            from: senderEmail || user, 
            to: recipientEmail || user,
            subject: 'Test SMTP Connection - CredibleCS Site',
            text: 'If you are reading this email, your SMTP configuration is successfully working!'
        });
        
        res.json({ success: true, message: 'SMTP Test Successful! Email sent to your configured address.' });
    } catch (error) {
        console.error('SMTP test error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to authenticate or send email.' });
    }
};
