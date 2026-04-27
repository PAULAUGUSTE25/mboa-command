const express = require('express');
const router = express.Router();
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');

// GET menu item by id
router.get('/items/:id', asyncHandler(async (req, res) => {
  const item = await db.queryOne(`
    SELECT mi.*, r.name as restaurant_name, r.delivery_time, r.delivery_fee, mc.name as category_name
    FROM menu_items mi
    JOIN restaurants r ON mi.restaurant_id = r.id
    LEFT JOIN menu_categories mc ON mi.menu_category_id = mc.id
    WHERE mi.id = $1
  `, [req.params.id]);
  if (!item) return res.status(404).json({ error: 'Plat non trouvé' });
  res.json(item);
}));

// GET featured items across all restaurants
router.get('/featured', asyncHandler(async (req, res) => {
  const { city, limit = 10 } = req.query;
  let query = `
    SELECT mi.*, r.name as restaurant_name, r.rating, r.delivery_time, r.delivery_fee, r.city
    FROM menu_items mi
    JOIN restaurants r ON mi.restaurant_id = r.id
    WHERE mi.is_featured = 1 AND mi.is_available = 1
  `;
  const params = [];
  if (city) { query += ' AND r.city = $' + (params.length + 1); params.push(city); }
  query += ' ORDER BY r.rating DESC LIMIT $' + (params.length + 1);
  params.push(parseInt(limit));
  const items = await db.queryAll(query, params);
  res.json({ data: items });
}));

// Search menu items
router.get('/search', asyncHandler(async (req, res) => {
  const { q, city } = req.query;
  if (!q) return res.json({ data: [] });
  let query = `
    SELECT mi.*, r.name as restaurant_name, r.rating, r.delivery_time, r.delivery_fee, r.city
    FROM menu_items mi
    JOIN restaurants r ON mi.restaurant_id = r.id
    WHERE mi.is_available = 1 AND (mi.name ILIKE $1 OR mi.description ILIKE $2 OR mi.tags ILIKE $3)
  `;
  const params = [`%${q}%`, `%${q}%`, `%${q}%`];
  if (city) { query += ' AND r.city = $' + (params.length + 1); params.push(city); }
  query += ' ORDER BY mi.is_featured DESC, r.rating DESC LIMIT 30';
  const items = await db.queryAll(query, params);
  res.json({ data: items });
}));

module.exports = router;
