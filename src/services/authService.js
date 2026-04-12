import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import * as authorModel from '../models/authorModel.js';
import { generateUniqueSlug } from '../utils/slugify.js';

/**
 * Auth Service - Business logic for authentication
 */

/**
 * Authenticate user with email and password
 */
export async function login(email, password) {
  const author = await authorModel.findByEmail(email);

  if (!author) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, author.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: author.id, email: author.email, role: author.role, name: author.name },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { id: author.id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );

  return {
    token,
    refreshToken,
    user: {
      id: author.id,
      name: author.name,
      email: author.email,
      role: author.role,
      avatar_url: author.avatar_url,
    },
  };
}

/**
 * Refresh an expired token using refresh token
 */
export async function refreshToken(refreshTokenStr) {
  try {
    const decoded = jwt.verify(refreshTokenStr, env.jwt.refreshSecret);
    const author = await authorModel.findById(decoded.id);

    if (!author) {
      throw Object.assign(new Error('Invalid refresh token.'), { statusCode: 401 });
    }

    const token = jwt.sign(
      { id: author.id, email: author.email, role: author.role, name: author.name },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    return { token };
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token.'), { statusCode: 401 });
  }
}

/**
 * Register a new author (admin-only)
 */
export async function register(data) {
  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // Generate unique slug
  const slug = await generateUniqueSlug(data.name, 'authors');

  const id = await authorModel.create({
    name: data.name,
    email: data.email,
    password_hash: passwordHash,
    slug,
    bio: data.bio || null,
    designation: data.designation || null,
    social_links: data.social_links || {},
    role: data.role || 'author',
  });

  return authorModel.findById(id);
}
