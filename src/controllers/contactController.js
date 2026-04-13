import pool from '../config/database.js';

let nodemailer;
try {
  const nodemailerModule = await import('nodemailer');
  nodemailer = nodemailerModule.default || nodemailerModule;
} catch (e) {
  console.warn('nodemailer not installed. Emails will not be sent.');
}

export const submitContact = async (req, res) => {
  const { name, phone, email, service, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'Name, phone, and email are required.' });
  }

  try {
    // 1. Save to database
    const [result] = await pool.query(
      `INSERT INTO contact_submissions (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, service || null, message || null]
    );

    // 2. Try sending email if SMTP is configured
    try {
        const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ("smtp", "emailTemplate")');
        const settings = settingsRows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        if (nodemailer && settings.smtp && settings.emailTemplate) {
            const { host, port, user, pass, senderEmail, recipientEmail } = settings.smtp;
            
            if (host && user && pass) {
                // Create transporter
                const transporter = nodemailer.createTransport({
                    host,
                    port: parseInt(port) || 587,
                    secure: parseInt(port) === 465, // true for 465, false for other ports
                    auth: { user, pass }
                });

                const templateStr = settings.emailTemplate.body || '';
                const subject = settings.emailTemplate.subject || 'New Contact Submission';

                // Very simple replacement
                const emailBody = templateStr
                    .replace(/{{name}}/g, name)
                    .replace(/{{phone}}/g, phone)
                    .replace(/{{email}}/g, email)
                    .replace(/{{service}}/g, service || 'N/A')
                    .replace(/{{message}}/g, message || 'N/A');

                await transporter.sendMail({
                    from: senderEmail || user, 
                    to: recipientEmail || user,
                    subject: subject,
                    text: emailBody
                });
            }
        }
    } catch (emailErr) {
        console.error('Error sending email:', emailErr);
        // Do not fail the submission if email fails
    }

    res.status(201).json({ success: true, message: 'Submission successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
