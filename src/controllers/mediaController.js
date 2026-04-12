import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import env from '../config/env.js';

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const authorId = req.author?.id || null;

    // Process image with Sharp (optional: resize or convert to webp)
    // For now, let's keep it simple.
    
    const publicUrl = `/uploads/${filename}`;
    const diskPath = req.file.path;

    // Save to DB
    const [result] = await pool.execute(
      'INSERT INTO media (filename, original_name, mime_type, size, disk_path, public_url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [filename, originalname, mimetype, size, diskPath, publicUrl, authorId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        filename,
        original_name: originalname,
        public_url: publicUrl,
        mime_type: mimetype,
        size
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listMedia = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, filename, original_name, mime_type, size, public_url, created_at FROM media ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get file info from DB
    const [rows] = await pool.execute('SELECT disk_path FROM media WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const { disk_path } = rows[0];

    // Delete from disk
    if (fs.existsSync(disk_path)) {
      fs.unlinkSync(disk_path);
    }

    // Delete from DB
    await pool.execute('DELETE FROM media WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
