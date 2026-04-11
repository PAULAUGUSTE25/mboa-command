const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, address, city, avatar, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json(user);
});

router.put('/me', authMiddleware, (req, res) => {
  const { name, phone, address, city } = req.body;
  db.prepare('UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?').run(name, phone, address, city, req.user.id);
  const updated = db.prepare('SELECT id, name, email, phone, address, city, avatar, role FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

router.get('/favorites', authMiddleware, (req, res) => {
  const favorites = db.prepare(`
    SELECT f.*, r.name as restaurant_name, r.image, r.rating, r.delivery_time, r.city
    FROM favorites f
    LEFT JOIN restaurants r ON f.restaurant_id = r.id
    WHERE f.user_id = ?
  `).all(req.user.id);
  res.json({ data: favorites });
});

router.post('/favorites', authMiddleware, (req, res) => {
  const { restaurant_id, menu_item_id } = req.body;
  db.prepare('INSERT INTO favorites (user_id, restaurant_id, menu_item_id) VALUES (?, ?, ?)').run(req.user.id, restaurant_id || null, menu_item_id || null);
  res.status(201).json({ message: 'Ajouté aux favoris' });
});

router.delete('/favorites/:restaurantId', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?').run(req.user.id, req.params.restaurantId);
  res.json({ message: 'Retiré des favoris' });
});

module.exports = router;
