const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { generateOTP, sendOTPEmail } = require('../utils/mailer');
const asyncHandler = require('../utils/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'mboa_command_secret_2024';
const OTP_ENABLED = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, phone, password, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }
  const existing = await db.queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const hashed = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  await db.run('INSERT INTO users (id, name, email, phone, password, city) VALUES ($1, $2, $3, $4, $5, $6)', [
    id, name, email, phone || null, hashed, city || 'Yaoundé'
  ]);
  const token = jwt.sign({ id, email, name, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, phone, city: city || 'Yaoundé', role: 'customer' } });
}));

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const user = await db.queryOne('SELECT * FROM users WHERE email = $1', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
}));

// ── Send OTP ──────────────────────────────────────────────────────────────────
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { email, purpose = 'login' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  if (!OTP_ENABLED) {
    return res.status(503).json({ error: 'Service email non configuré. Ajoutez EMAIL_USER et EMAIL_PASS dans .env' });
  }

  const user = await db.queryOne('SELECT id, name FROM users WHERE email = $1', [email]);
  if (!user) return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });

  // Invalidate any existing OTPs for this email/purpose
  await db.run('UPDATE otp_codes SET used = 1 WHERE email = $1 AND purpose = $2', [email, purpose]);

  const code = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  await db.run('INSERT INTO otp_codes (email, code, purpose, expires_at) VALUES ($1, $2, $3, $4)', [email, code, purpose, expiresAt]);

  try {
    await sendOTPEmail(email, code, user.name);
    res.json({ message: 'Code OTP envoyé avec succès', email });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du mail. Vérifiez vos identifiants Gmail.' });
  }
}));

// ── Verify OTP ────────────────────────────────────────────────────────────────
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { email, code, purpose = 'login' } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });

  const record = await db.queryOne(
    'SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND purpose = $3 AND used = 0 ORDER BY id DESC LIMIT 1',
    [email, code, purpose]
  );

  if (!record) return res.status(400).json({ error: 'Code invalide ou déjà utilisé' });
  if (Date.now() > record.expires_at) return res.status(400).json({ error: 'Code expiré. Demandez un nouveau code.' });

  // Mark as used
  await db.run('UPDATE otp_codes SET used = 1 WHERE id = $1', [record.id]);

  const user = await db.queryOne('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
}));

module.exports = router;
