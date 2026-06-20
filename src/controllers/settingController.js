import pool from '../config/database.js';


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
    if (!settings.webinar) {
        settings.webinar = {
            topic: '',
            link: '',
            schedule: '',
            enabled: false
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
    return res.status(400).json({
        success: false,
        message: 'SMTP email sending feature has been disabled.'
    });
};

export const getPublicOpenHours = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = "openHours"');
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          description: '',
          link: '',
          startTime: '16:00',
          endTime: '17:00',
          enabled: false
        }
      });
    }

    let val = rows[0].setting_value;
    if (typeof val === 'string') {
      try { val = JSON.parse(val); } catch(e){}
    }

    res.json({ success: true, data: val });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicWebinar = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = "webinar"');
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          topic: '',
          link: '',
          schedule: '',
          enabled: false
        }
      });
    }

    let val = rows[0].setting_value;
    if (typeof val === 'string') {
      try { val = JSON.parse(val); } catch(e){}
    }

    res.json({ success: true, data: val });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
