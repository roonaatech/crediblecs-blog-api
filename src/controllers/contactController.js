import pool from '../config/database.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { success, paginated, error as sendError } from '../utils/response.js';

let nodemailer;
try {
  const nodemailerModule = await import('nodemailer');
  nodemailer = nodemailerModule.default || nodemailerModule;
} catch (e) {
  console.warn('nodemailer not installed. Emails will not be sent.');
}

export const submitContact = async (req, res) => {
  const { name, phone, email, service, message, website } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'Name, phone, and email are required.' });
  }

  try {
    // 1. Save to database
    const [result] = await pool.query(
      `INSERT INTO contact_submissions (name, email, phone, service, message, website) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, service || null, message || null, website || null]
    );

    // 2. Try sending email if SMTP is configured
    try {
        const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ("smtp", "emailTemplate")');
        const settings = settingsRows.reduce((acc, row) => {
            let val = row.setting_value;
            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch(e){}
            }
            acc[row.setting_key] = val;
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

export const getSubmissionsApi = async (req, res) => {
  try {
    const { status, service, search, sortBy, sortOrder, website } = req.query;
    const { page, limit, offset } = parsePagination(req.query, 10, 50);

    let whereClauses = [];
    let queryParams = [];

    if (status) {
      whereClauses.push('status = ?');
      queryParams.push(status);
    }

    if (service) {
      whereClauses.push('service = ?');
      queryParams.push(service);
    }

    if (search) {
      whereClauses.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard);
    }

    if (website) {
      whereClauses.push('website = ?');
      queryParams.push(website);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const allowedSortFields = ['id', 'name', 'email', 'created_at', 'status', 'service', 'website'];
    const resolvedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const resolvedSortOrder = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countSql = `SELECT COUNT(*) as total FROM contact_submissions ${whereStr}`;
    const [countRows] = await pool.query(countSql, queryParams);
    const total = countRows[0].total;

    const fetchSql = `
      SELECT id, name, email, phone, service, message, website, status, created_at, updated_at
      FROM contact_submissions
      ${whereStr}
      ORDER BY ${resolvedSortBy} ${resolvedSortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(fetchSql, [...queryParams, limit, offset]);

    const paginationMeta = buildPagination(total, page, limit);
    return paginated(res, rows, paginationMeta);
  } catch (err) {
    console.error('Error fetching submissions via API:', err);
    return sendError(res, err.message, 500);
  }
};

export const updateSubmissionStatusApi = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return sendError(res, 'Status is required.', 400);
  }

  const validStatuses = ['new', 'contacted', 'resolved', 'consumed', 'junk'];
  if (!validStatuses.includes(status)) {
    return sendError(res, `Invalid status value. Allowed values: ${validStatuses.join(', ')}`, 400);
  }

  try {
    // Check if the record exists first
    const checkSql = 'SELECT id FROM contact_submissions WHERE id = ?';
    const [existingRows] = await pool.query(checkSql, [id]);
    if (existingRows.length === 0) {
      return sendError(res, `Contact submission with ID ${id} not found.`, 404);
    }

    // Update status
    const updateSql = 'UPDATE contact_submissions SET status = ? WHERE id = ?';
    await pool.query(updateSql, [status, id]);

    // Fetch the updated record
    const fetchSql = 'SELECT id, name, email, phone, service, message, website, status, created_at, updated_at FROM contact_submissions WHERE id = ?';
    const [updatedRows] = await pool.query(fetchSql, [id]);

    return success(res, updatedRows[0]);
  } catch (err) {
    console.error(`Error updating contact submission status (ID ${id}):`, err);
    return sendError(res, err.message, 500);
  }
};
