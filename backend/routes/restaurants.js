const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all restaurants (with optional filters)
router.get('/', (req, res) => {
  const { city, category, featured, search, limit = 50, offset = 0 } = req.query;
  let query = `
    SELECT r.*, c.name as category_name, c.icon as category_icon
    FROM restaurants r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (city) { query += ' AND r.city = ?'; params.push(city); }
  if (category) { query += ' AND c.slug = ?'; params.push(category); }
  if (featured === 'true') { query += ' AND r.is_featured = 1'; }
  if (search) { query += ' AND (r.name LIKE ? OR r.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY r.is_featured DESC, r.rating DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  const restaurants = db.prepare(query).all(...params);
  res.json({ data: restaurants, total: restaurants.length });
});

// GET single restaurant
router.get('/:id', (req, res) => {
  const restaurant = db.prepare(`
    SELECT r.*, c.name as category_name, c.icon as category_icon
    FROM restaurants r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `).get(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });

  const menuCategories = db.prepare('SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY sort_order').all(req.params.id);
  const menuItems = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1').all(req.params.id);

  const menu = menuCategories.map(cat => ({
    ...cat,
    items: menuItems.filter(item => item.menu_category_id === cat.id)
  }));

  res.json({ ...restaurant, menu });
});

// GET restaurant reviews
router.get('/:id/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT rv.*, u.name as user_name, u.avatar
    FROM reviews rv
    JOIN users u ON rv.user_id = u.id
    WHERE rv.restaurant_id = ?
    ORDER BY rv.created_at DESC
    LIMIT 20
  `).all(req.params.id);
  res.json({ data: reviews });
});

module.exports = router;
