const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Create order
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { restaurant_id, items, delivery_address, delivery_city, payment_method, notes } = req.body;
  if (!restaurant_id || !items || !items.length) {
    return res.status(400).json({ error: 'Restaurant et articles requis' });
  }

  const restaurant = await db.queryOne('SELECT * FROM restaurants WHERE id = $1', [restaurant_id]);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });

  let total = 0;
  const validatedItems = [];
  for (const item of items) {
    const menuItem = await db.queryOne('SELECT * FROM menu_items WHERE id = $1 AND restaurant_id = $2', [item.menu_item_id, restaurant_id]);
    if (!menuItem) return res.status(400).json({ error: `Plat ${item.menu_item_id} non trouvé` });
    total += menuItem.price * item.quantity;
    validatedItems.push({ ...item, price: menuItem.price, name: menuItem.name });
  }

  const delivery_fee = restaurant.delivery_fee || 500;
  total += delivery_fee;

  const drivers = ['Jean-Pierre Kamga', 'Marie Mballa', 'Eric Nkeng', 'Sophie Talla', 'Paul Biya Jr.'];
  const driver_name = drivers[Math.floor(Math.random() * drivers.length)];
  const driver_phone = `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`;
  const minutes = Math.floor(Math.random() * 20) + 20;
  const estimated = new Date(Date.now() + minutes * 60000).toISOString();

  const orderId = uuidv4();
  await db.run(`
    INSERT INTO orders (id, user_id, restaurant_id, total, delivery_fee, delivery_address, delivery_city, payment_method, notes, driver_name, driver_phone, estimated_delivery, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'confirmed')
  `, [orderId, req.user.id, restaurant_id, total, delivery_fee, delivery_address || '', delivery_city || 'Yaoundé', payment_method || 'cash', notes || null, driver_name, driver_phone, estimated]);

  // Insert order items in parallel
  await Promise.all(validatedItems.map(item =>
    db.run('INSERT INTO order_items (order_id, menu_item_id, quantity, price, name) VALUES ($1, $2, $3, $4, $5)', [orderId, item.menu_item_id, item.quantity, item.price, item.name])
  ));

  const order = await db.queryOne(`
    SELECT o.*, r.name as restaurant_name, r.image as restaurant_image
    FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.id = $1
  `, [orderId]);
  const orderItems = await db.queryAll('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

  res.status(201).json({ ...order, items: orderItems });
}));

// Get user orders
router.get('/my', authMiddleware, asyncHandler(async (req, res) => {
  const orders = await db.queryAll(`
    SELECT o.*, r.name as restaurant_name, r.image as restaurant_image
    FROM orders o JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
    LIMIT 20
  `, [req.user.id]);

  const ordersWithItems = await Promise.all(orders.map(async (order) => {
    const items = await db.queryAll('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    return { ...order, items };
  }));
  res.json({ data: ordersWithItems });
}));

// Get single order
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const order = await db.queryOne(`
    SELECT o.*, r.name as restaurant_name, r.image as restaurant_image, r.phone as restaurant_phone
    FROM orders o JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.id = $1 AND o.user_id = $2
  `, [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
  const items = await db.queryAll('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  res.json({ ...order, items });
}));

// Update order status (simulate progression)
router.patch('/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
  await db.run('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3', [status, req.params.id, req.user.id]);
  res.json({ message: 'Statut mis à jour', status });
}));

module.exports = router;
