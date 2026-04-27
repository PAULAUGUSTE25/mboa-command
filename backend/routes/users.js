const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await db.queryOne('SELECT id, name, email, phone, address, city, avatar, role, created_at FROM users WHERE id = $1', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json(user);
}));

router.put('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { name, phone, address, city } = req.body;
  await db.run('UPDATE users SET name = $1, phone = $2, address = $3, city = $4 WHERE id = $5', [name, phone, address, city, req.user.id]);
  const updated = await db.queryOne('SELECT id, name, email, phone, address, city, avatar, role FROM users WHERE id = $1', [req.user.id]);
  res.json(updated);
}));

router.get('/favorites', authMiddleware, asyncHandler(async (req, res) => {
  const favorites = await db.queryAll(`
    SELECT f.*, r.name as restaurant_name, r.image, r.rating, r.delivery_time, r.city
    FROM favorites f
    LEFT JOIN restaurants r ON f.restaurant_id = r.id
    WHERE f.user_id = $1
  `, [req.user.id]);
  res.json({ data: favorites });
}));

router.post('/favorites', authMiddleware, asyncHandler(async (req, res) => {
  const { restaurant_id, menu_item_id } = req.body;
  await db.run('INSERT INTO favorites (user_id, restaurant_id, menu_item_id) VALUES ($1, $2, $3)', [req.user.id, restaurant_id || null, menu_item_id || null]);
  res.status(201).json({ message: 'Ajouté aux favoris' });
}));

router.delete('/favorites/:restaurantId', authMiddleware, asyncHandler(async (req, res) => {
  await db.run('DELETE FROM favorites WHERE user_id = $1 AND restaurant_id = $2', [req.user.id, req.params.restaurantId]);
  res.json({ message: 'Retiré des favoris' });
}));

module.exports = router;
