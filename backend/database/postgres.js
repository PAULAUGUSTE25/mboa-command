const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('neon')
    ? { rejectUnauthorized: false }
    : undefined,
});

// Helper for Express async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Convert SQLite ? placeholders to PostgreSQL $1, $2...
function convertSQL(sql) {
  let counter = 0;
  return sql.replace(/\?/g, () => `$${++counter}`);
}

// Execute a query and return all rows
async function queryAll(sql, params = []) {
  const result = await pool.query(convertSQL(sql), params);
  return result.rows;
}

// Execute a query and return first row (or null)
async function queryOne(sql, params = []) {
  const result = await pool.query(convertSQL(sql), params);
  return result.rows[0] || null;
}

// Execute an INSERT/UPDATE/DELETE query
async function run(sql, params = []) {
  const result = await pool.query(convertSQL(sql), params);
  return { changes: result.rowCount };
}

// Execute multiple SQL statements
async function exec(sql) {
  const statements = sql.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    await pool.query(stmt);
  }
}

// Simulate SQLite prepare → run with RETURNING id for auto-increment tables
async function runReturning(sql, params = []) {
  const converted = convertSQL(sql);
  const result = await pool.query(converted + ' RETURNING id', params);
  return { lastInsertRowid: result.rows[0]?.id, changes: result.rowCount };
}

// Initialize PostgreSQL schema
async function initializeDatabase() {
  console.log('[POSTGRES] Initializing schema...');

  // Drop existing tables if needed (comment out in production)
  // await pool.query('DROP TABLE IF EXISTS order_items, orders, menu_items, menu_categories, restaurants, categories, users, favorites, reviews, otp_codes CASCADE');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      address TEXT,
      city TEXT DEFAULT 'Yaoundé',
      avatar TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      cover_image TEXT,
      category_id INTEGER,
      address TEXT,
      city TEXT,
      phone TEXT,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      delivery_time TEXT,
      delivery_fee INTEGER DEFAULT 500,
      min_order INTEGER DEFAULT 1000,
      is_open INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      promo_text TEXT,
      latitude REAL,
      longitude REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id SERIAL PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      menu_category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image TEXT,
      is_available INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_spicy INTEGER DEFAULT 0,
      prep_time TEXT,
      calories INTEGER,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total INTEGER NOT NULL,
      delivery_fee INTEGER DEFAULT 500,
      delivery_address TEXT,
      delivery_city TEXT,
      payment_method TEXT DEFAULT 'cash',
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      driver_name TEXT,
      driver_phone TEXT,
      estimated_delivery TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      restaurant_id TEXT,
      menu_item_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      order_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT DEFAULT 'login',
      expires_at BIGINT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await seedDatabase();
  console.log('[POSTGRES] ✅ Schema initialized and seeded');
}

// Seed initial data
async function seedDatabase() {
  const existing = await queryOne('SELECT COUNT(*) as count FROM categories');
  if (existing && parseInt(existing.count) > 0) return;

  console.log('[POSTGRES] Seeding database...');

  // Seed Categories
  const categories = [
    ['Camerounais', '🍲', 'camerounais'],
    ['Grillades & Soya', '🔥', 'grillades'],
    ['Fast Food', '🍔', 'fast-food'],
    ['Pizzas', '🍕', 'pizzas'],
    ['Poissons', '🐟', 'poissons'],
    ['Poulet', '🍗', 'poulet'],
    ['Végétarien', '🥗', 'vegetarien'],
    ['Desserts', '🍰', 'desserts'],
    ['Boissons', '🥤', 'boissons'],
  ];
  for (const c of categories) {
    await run('INSERT INTO categories (name, icon, slug) VALUES ($1, $2, $3)', c);
  }

  // Seed Restaurants (with explicit UUIDs for consistency)
  const restaurantData = [
    { id: uuidv4(), name: 'Chez Mama Mado', description: 'La vraie cuisine camerounaise, préparée avec amour. Ndolé, Eru, Koki et bien plus.', image: '/images/ndole-crevettes.jpg', cover_image: '/images/poulet-dg.jpg', category_id: 1, address: 'Quartier Bastos', city: 'Yaoundé', phone: '+237 697 123 456', rating: 4.8, rating_count: 342, delivery_time: '25-35 min', delivery_fee: 500, min_order: 2000, is_open: 1, is_featured: 1, promo_text: '20% sur votre première commande!' },
    { id: uuidv4(), name: 'Le Soya King', description: 'Le meilleur soya de Douala. Brochettes, poulet braisé, bœuf grillé.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', cover_image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800', category_id: 2, address: 'Akwa', city: 'Douala', phone: '+237 699 456 789', rating: 4.6, rating_count: 218, delivery_time: '20-30 min', delivery_fee: 700, min_order: 1500, is_open: 1, is_featured: 1, promo_text: null },
    { id: uuidv4(), name: 'Fast Mboa', description: 'Burgers, wraps et frites façon camerounaise. Rapide, délicieux, abordable.', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', cover_image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', category_id: 3, address: 'Bonanjo', city: 'Douala', phone: '+237 690 789 012', rating: 4.4, rating_count: 185, delivery_time: '15-25 min', delivery_fee: 500, min_order: 1500, is_open: 1, is_featured: 1, promo_text: 'Livraison gratuite dès 5000 FCFA' },
    { id: uuidv4(), name: 'La Table du Chef', description: 'Gastronomie camerounaise revisitée. Cadre chic, service impeccable.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', cover_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category_id: 1, address: 'Nlongkak', city: 'Yaoundé', phone: '+237 694 012 345', rating: 4.9, rating_count: 97, delivery_time: '35-45 min', delivery_fee: 1000, min_order: 5000, is_open: 1, is_featured: 0, promo_text: null },
    { id: uuidv4(), name: 'Pizza & Co Yaoundé', description: 'Pizzas artisanales cuites au feu de bois. Livraison rapide dans tout Yaoundé.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', cover_image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', category_id: 4, address: 'Mvan', city: 'Yaoundé', phone: '+237 691 234 567', rating: 4.5, rating_count: 263, delivery_time: '25-40 min', delivery_fee: 500, min_order: 3000, is_open: 1, is_featured: 0, promo_text: 'Pizza offerte dès 2 commandées!' },
    { id: uuidv4(), name: 'Mama Africa Kitchen', description: "Saveurs d'Afrique: Jollof rice, thieboudienne, plantains et plus.", image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', cover_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', category_id: 1, address: 'Omnisports', city: 'Yaoundé', phone: '+237 695 567 890', rating: 4.7, rating_count: 156, delivery_time: '30-45 min', delivery_fee: 600, min_order: 2000, is_open: 1, is_featured: 0, promo_text: null },
    { id: uuidv4(), name: 'Poisson Frais Kribi', description: 'Poissons frais du littoral. Braisé, frit ou en sauce. La mer dans votre assiette.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', cover_image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800', category_id: 5, address: 'Bali', city: 'Douala', phone: '+237 697 890 123', rating: 4.6, rating_count: 134, delivery_time: '25-35 min', delivery_fee: 700, min_order: 2500, is_open: 1, is_featured: 0, promo_text: null },
    { id: uuidv4(), name: 'Poulet Express', description: 'Poulet braisé, frit, rôti. La référence du poulet à Yaoundé.', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', cover_image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800', category_id: 6, address: 'Mendong', city: 'Yaoundé', phone: '+237 693 456 789', rating: 4.5, rating_count: 209, delivery_time: '20-30 min', delivery_fee: 500, min_order: 2000, is_open: 1, is_featured: 0, promo_text: '50% sur le 2ème poulet!' },
  ];

  for (const r of restaurantData) {
    await run(`
      INSERT INTO restaurants (id, name, description, image, cover_image, category_id, address, city, phone, rating, rating_count, delivery_time, delivery_fee, min_order, is_open, is_featured, promo_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [r.id, r.name, r.description, r.image, r.cover_image, r.category_id, r.address, r.city, r.phone, r.rating, r.rating_count, r.delivery_time, r.delivery_fee, r.min_order, r.is_open, r.is_featured, r.promo_text]);
  }

  // Seed Menu Categories
  const menuCatData = [
    [restaurantData[0].id, 'Plats Traditionnels', 1],
    [restaurantData[0].id, 'Soupes & Bouillons', 2],
    [restaurantData[0].id, 'Accompagnements', 3],
    [restaurantData[1].id, 'Grillades', 1],
    [restaurantData[1].id, 'Brochettes', 2],
    [restaurantData[1].id, 'Boissons', 3],
    [restaurantData[2].id, 'Burgers', 1],
    [restaurantData[2].id, 'Wraps', 2],
    [restaurantData[2].id, 'Frites & Sides', 3],
    [restaurantData[3].id, 'Entrées', 1],
    [restaurantData[3].id, 'Plats Principaux', 2],
    [restaurantData[3].id, 'Desserts', 3],
    [restaurantData[4].id, 'Pizzas Classiques', 1],
    [restaurantData[4].id, 'Pizzas Spéciales', 2],
    [restaurantData[5].id, 'Plats Africains', 1],
    [restaurantData[5].id, 'Riz & Pâtes', 2],
    [restaurantData[6].id, 'Poissons Entiers', 1],
    [restaurantData[6].id, 'Fruits de Mer', 2],
    [restaurantData[7].id, 'Poulet', 1],
    [restaurantData[7].id, 'Accompagnements', 2],
  ];

  const menuCatIds = {};
  for (const [restId, name, order] of menuCatData) {
    const result = await pool.query(
      'INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id',
      [restId, name, order]
    );
    if (!menuCatIds[restId]) menuCatIds[restId] = [];
    menuCatIds[restId].push(result.rows[0].id);
  }

  // Seed Menu Items
  const menuItems = [
    [uuidv4(), restaurantData[0].id, menuCatIds[restaurantData[0].id][0], 'Ndolé Complet', 'Feuilles de ndolé cuites avec crevettes, viande et arachides.', 3500, '/images/ndole-crevettes.jpg', 1, 1, 0, '20 min', 450, 'traditionnel,populaire'],
    [uuidv4(), restaurantData[0].id, menuCatIds[restaurantData[0].id][0], 'Eru avec Fufu', 'Légumes okok cuits avec viande fumée et huile de palme.', 3000, '/images/eru-fufu.jpg', 1, 1, 0, '25 min', 380, 'traditionnel'],
    [uuidv4(), restaurantData[0].id, menuCatIds[restaurantData[0].id][0], 'Poulet DG', 'Poulet sauté avec plantains mûrs, poivrons, tomates et épices.', 5500, '/images/poulet-dg.jpg', 1, 1, 0, '30 min', 520, 'populaire,festif'],
    [uuidv4(), restaurantData[0].id, menuCatIds[restaurantData[0].id][1], 'Soupe Koki', 'Gâteau de haricots niébé à la vapeur avec huile de palme.', 1500, '/images/koki.jpg', 1, 0, 0, '15 min', 290, 'végétarien'],
    [uuidv4(), restaurantData[0].id, menuCatIds[restaurantData[0].id][2], 'Plantain Frit', 'Plantains mûrs frits à point, croustillants et dorés.', 500, 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400', 1, 0, 0, '10 min', 180, 'végétarien'],
    [uuidv4(), restaurantData[1].id, menuCatIds[restaurantData[1].id][0], 'Soya Bœuf (Portion)', 'Morceaux de bœuf marinés et grillés sur braises avec épices suya.', 2000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 1, 1, '15 min', 350, 'populaire,grillé'],
    [uuidv4(), restaurantData[1].id, menuCatIds[restaurantData[1].id][0], 'Poulet Braisé Entier', 'Poulet entier braisé à la braise avec sauce pimentée.', 5000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 1, '40 min', 680, 'populaire'],
    [uuidv4(), restaurantData[1].id, menuCatIds[restaurantData[1].id][1], 'Brochettes Bœuf (x5)', 'Cinq brochettes de bœuf marinées aux épices africaines.', 1500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 0, 1, '15 min', 280, 'grillé'],
    [uuidv4(), restaurantData[2].id, menuCatIds[restaurantData[2].id][0], 'MboaBurger Classic', 'Steak haché 150g, cheddar, laitue, tomate, sauce secrète.', 2500, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1, 1, 0, '15 min', 480, 'populaire'],
    [uuidv4(), restaurantData[2].id, menuCatIds[restaurantData[2].id][0], 'Chicken Burger Pimenté', 'Filet de poulet croustillant, sauce pimentée, cornichons.', 2800, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', 1, 1, 1, '15 min', 510, 'épicé,populaire'],
    [uuidv4(), restaurantData[2].id, menuCatIds[restaurantData[2].id][1], 'Wrap Soya', 'Soya bœuf enroulé dans une galette avec crudités.', 2200, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', 1, 0, 1, '10 min', 420, 'fusion'],
    [uuidv4(), restaurantData[2].id, menuCatIds[restaurantData[2].id][2], 'Frites Classiques', 'Frites de pommes de terre dorées et croustillantes.', 800, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', 1, 0, 0, '10 min', 280, 'accompagnement'],
    [uuidv4(), restaurantData[3].id, menuCatIds[restaurantData[3].id][0], 'Velouté de Ndolé', 'Ndolé revisité en velouté crémeux avec chips de plantain.', 3000, '/images/ndole.jpg', 1, 1, 0, '20 min', 320, 'gastronomique'],
    [uuidv4(), restaurantData[3].id, menuCatIds[restaurantData[3].id][1], 'Filet de Capitaine Sauce Mafé', 'Capitaine grillé nappé d\'une sauce mafé aux arachides.', 8500, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', 1, 1, 0, '35 min', 580, 'gastronomique,premium'],
    [uuidv4(), restaurantData[3].id, menuCatIds[restaurantData[3].id][2], 'Fondant au Chocolat', 'Fondant chaud accompagné d\'une crème à la vanille.', 2500, 'https://images.unsplash.com/photo-1606313564200-e75d5e34476c?w=400', 1, 0, 0, '15 min', 380, 'dessert'],
    [uuidv4(), restaurantData[4].id, menuCatIds[restaurantData[4].id][0], 'Margherita', 'Sauce tomate, mozzarella, basilic frais.', 3500, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 1, 0, 0, '25 min', 560, 'classique'],
    [uuidv4(), restaurantData[4].id, menuCatIds[restaurantData[4].id][1], 'Pizza Poulet DG', 'Notre pizza signature: poulet DG, plantain, poivrons.', 5000, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 1, 1, 1, '30 min', 720, 'signature,fusion,populaire'],
    [uuidv4(), restaurantData[5].id, menuCatIds[restaurantData[5].id][0], 'Jollof Rice au Poulet', 'Riz jollof épicé cuit avec poulet braisé, légumes.', 2500, '/images/haricots-plantain.jpg', 1, 1, 1, '25 min', 520, 'africain,populaire'],
    [uuidv4(), restaurantData[5].id, menuCatIds[restaurantData[5].id][1], 'Riz Sauté aux Légumes', 'Riz sauté wok avec légumes frais et sauce soja.', 1800, '/images/haricots-noirs.jpg', 1, 0, 0, '15 min', 380, 'végétarien'],
    [uuidv4(), restaurantData[6].id, menuCatIds[restaurantData[6].id][0], 'Capitaine Braisé Entier', 'Capitaine du fleuve braisé au feu de bois.', 5500, '/images/poisson-sauce.jpg', 1, 1, 1, '35 min', 480, 'poisson,populaire'],
    [uuidv4(), restaurantData[6].id, menuCatIds[restaurantData[6].id][1], 'Crevettes Sautées', 'Grosses crevettes sautées à l\'ail et persil.', 6500, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', 1, 1, 0, '20 min', 390, 'fruitsmer,premium'],
    [uuidv4(), restaurantData[7].id, menuCatIds[restaurantData[7].id][0], 'Poulet Braisé Demi', 'Demi poulet braisé à la braise avec sauce piment fraîche.', 2500, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 1, '30 min', 450, 'populaire'],
    [uuidv4(), restaurantData[7].id, menuCatIds[restaurantData[7].id][0], 'Ailes de Poulet Pimentées (x8)', 'Huit ailes de poulet marinées et grillées.', 3000, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', 1, 0, 1, '25 min', 520, 'épicé'],
    [uuidv4(), restaurantData[7].id, menuCatIds[restaurantData[7].id][1], 'Riz Blanc', 'Riz blanc parfumé au jasmin.', 500, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', 1, 0, 0, '10 min', 180, 'accompagnement'],
  ];

  for (const item of menuItems) {
    await run(`
      INSERT INTO menu_items (id, restaurant_id, menu_category_id, name, description, price, image, is_available, is_featured, is_spicy, prep_time, calories, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, item);
  }

  console.log('[POSTGRES] ✅ Database seeded');
}

module.exports = {
  pool,
  queryAll,
  queryOne,
  run,
  exec,
  runReturning,
  initializeDatabase,
  seedDatabase,
  asyncHandler,
};
