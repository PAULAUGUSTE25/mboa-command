const express = require('express');
const router = express.Router();
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');

// GET all restaurants (with optional filters)
router.get('/', asyncHandler(async (req, res) => {
  const { city, category, featured, search, limit = 50, offset = 0 } = req.query;
  let query = `
    SELECT r.*, c.name as category_name, c.icon as category_icon
    FROM restaurants r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (city) { query += ' AND r.city = $' + (params.length + 1); params.push(city); }
  if (category) { query += ' AND c.slug = $' + (params.length + 1); params.push(category); }
  if (featured === 'true') { query += ' AND r.is_featured = 1'; }
  if (search) { query += ' AND (r.name ILIKE $' + (params.length + 1) + ' OR r.description ILIKE $' + (params.length + 2) + ')'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY r.is_featured DESC, r.rating DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(parseInt(limit), parseInt(offset));
  const restaurants = await db.queryAll(query, params);
  res.json({ data: restaurants, total: restaurants.length });
}));

// GET single restaurant
router.get('/:id', asyncHandler(async (req, res) => {
  const restaurant = await db.queryOne(`
    SELECT r.*, c.name as category_name, c.icon as category_icon
    FROM restaurants r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = $1
  `, [req.params.id]);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });

  const menuCategories = await db.queryAll('SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY sort_order', [req.params.id]);
  const menuItems = await db.queryAll('SELECT * FROM menu_items WHERE restaurant_id = $1 AND is_available = 1', [req.params.id]);

  const menu = menuCategories.map(cat => ({
    ...cat,
    items: menuItems.filter(item => item.menu_category_id === cat.id)
  }));

  res.json({ ...restaurant, menu });
}));

// GET restaurant reviews
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const reviews = await db.queryAll(`
    SELECT rv.*, u.name as user_name, u.avatar
    FROM reviews rv
    JOIN users u ON rv.user_id = u.id
    WHERE rv.restaurant_id = $1
    ORDER BY rv.created_at DESC
    LIMIT 20
  `, [req.params.id]);
  res.json({ data: reviews });
}));

module.exports = router;
