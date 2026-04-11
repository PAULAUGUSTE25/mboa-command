const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { generateOTP, sendOTPEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'mboa_command_secret_2024';
const OTP_ENABLED = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { name, email, phone, password, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const hashed = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, name, email, phone, password, city) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, name, email, phone || null, hashed, city || 'Yaoundé'
  );
  const token = jwt.sign({ id, email, name, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, phone, city: city || 'Yaoundé', role: 'customer' } });
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

// ── Send OTP ──────────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { email, purpose = 'login' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  if (!OTP_ENABLED) {
    return res.status(503).json({ error: 'Service email non configuré. Ajoutez EMAIL_USER et EMAIL_PASS dans .env' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });

  // Invalidate any existing OTPs for this email/purpose
  db.prepare('UPDATE otp_codes SET used = 1 WHERE email = ? AND purpose = ?').run(email, purpose);

  const code = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  db.prepare('INSERT INTO otp_codes (email, code, purpose, expires_at) VALUES (?, ?, ?, ?)').run(email, code, purpose, expiresAt);

  try {
    await sendOTPEmail(email, code, user.name);
    res.json({ message: 'Code OTP envoyé avec succès', email });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du mail. Vérifiez vos identifiants Gmail.' });
  }
});

// ── Verify OTP ────────────────────────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  const { email, code, purpose = 'login' } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });

  const record = db.prepare(
    'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND purpose = ? AND used = 0 ORDER BY id DESC LIMIT 1'
  ).get(email, code, purpose);

  if (!record) return res.status(400).json({ error: 'Code invalide ou déjà utilisé' });
  if (Date.now() > record.expires_at) return res.status(400).json({ error: 'Code expiré. Demandez un nouveau code.' });

  // Mark as used
  db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(record.id);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

module.exports = router;
