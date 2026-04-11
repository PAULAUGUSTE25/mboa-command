require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://mboa-command.vercel.app',
  'https://frontend-sage-zeta-77.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Allow all Vercel preview deployments
    if (origin.includes('.vercel.app')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mboa Command API is running 🚀', version: '1.0.0' });
});

// Chrome DevTools auto-discovery endpoint (silences 404 + CSP warning in Chrome 116+)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`\n😋  Mboa Command API running on http://localhost:${PORT}`);
  console.log(`📡  Health check: http://localhost:${PORT}/api/health\n`);
});
