const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'mboaeats.db');
const db = new DatabaseSync(DB_PATH);

function initializeDatabase() {
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (menu_category_id) REFERENCES menu_categories(id)
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      restaurant_id TEXT,
      menu_item_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      order_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      purpose TEXT DEFAULT 'login',
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDatabase();
}

function seedDatabase() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existing.count > 0) return;

  const { v4: uuidv4 } = require('uuid');

  // Seed Categories
  const insertCat = db.prepare('INSERT INTO categories (name, icon, slug) VALUES (?, ?, ?)');
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
  categories.forEach(c => insertCat.run(...c));

  // Seed Restaurants
  const insertRest = db.prepare(`
    INSERT INTO restaurants (id, name, description, image, cover_image, category_id, address, city, phone, rating, rating_count, delivery_time, delivery_fee, min_order, is_open, is_featured, promo_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const restaurants = [
    {
      id: uuidv4(), name: 'Chez Mama Mado', description: 'La vraie cuisine camerounaise, préparée avec amour. Ndolé, Eru, Koki et bien plus.',
      image: '/images/ndole-crevettes.jpg', cover_image: '/images/poulet-dg.jpg',
      category_id: 1, address: 'Quartier Bastos', city: 'Yaoundé', phone: '+237 697 123 456',
      rating: 4.8, rating_count: 342, delivery_time: '25-35 min', delivery_fee: 500, min_order: 2000, is_open: 1, is_featured: 1, promo_text: '20% sur votre première commande!'
    },
    {
      id: uuidv4(), name: 'Le Soya King', description: 'Le meilleur soya de Douala. Brochettes, poulet braisé, bœuf grillé.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', cover_image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
      category_id: 2, address: 'Akwa', city: 'Douala', phone: '+237 699 456 789',
      rating: 4.6, rating_count: 218, delivery_time: '20-30 min', delivery_fee: 700, min_order: 1500, is_open: 1, is_featured: 1, promo_text: null
    },
    {
      id: uuidv4(), name: 'Fast Mboa', description: 'Burgers, wraps et frites façon camerounaise. Rapide, délicieux, abordable.',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', cover_image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      category_id: 3, address: 'Bonanjo', city: 'Douala', phone: '+237 690 789 012',
      rating: 4.4, rating_count: 185, delivery_time: '15-25 min', delivery_fee: 500, min_order: 1500, is_open: 1, is_featured: 1, promo_text: 'Livraison gratuite dès 5000 FCFA'
    },
    {
      id: uuidv4(), name: 'La Table du Chef', description: 'Gastronomie camerounaise revisitée. Cadre chic, service impeccable.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', cover_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      category_id: 1, address: 'Nlongkak', city: 'Yaoundé', phone: '+237 694 012 345',
      rating: 4.9, rating_count: 97, delivery_time: '35-45 min', delivery_fee: 1000, min_order: 5000, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'Pizza & Co Yaoundé', description: 'Pizzas artisanales cuites au feu de bois. Livraison rapide dans tout Yaoundé.',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', cover_image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      category_id: 4, address: 'Mvan', city: 'Yaoundé', phone: '+237 691 234 567',
      rating: 4.5, rating_count: 263, delivery_time: '25-40 min', delivery_fee: 500, min_order: 3000, is_open: 1, is_featured: 0, promo_text: 'Pizza offerte dès 2 commandées!'
    },
    {
      id: uuidv4(), name: 'Mama Africa Kitchen', description: 'Saveurs d\'Afrique: Jollof rice, thieboudienne, plantains et plus.',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', cover_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      category_id: 1, address: 'Omnisports', city: 'Yaoundé', phone: '+237 695 567 890',
      rating: 4.7, rating_count: 156, delivery_time: '30-45 min', delivery_fee: 600, min_order: 2000, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'Poisson Frais Kribi', description: 'Poissons frais du littoral. Braisé, frit ou en sauce. La mer dans votre assiette.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', cover_image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800',
      category_id: 5, address: 'Bali', city: 'Douala', phone: '+237 697 890 123',
      rating: 4.6, rating_count: 134, delivery_time: '25-35 min', delivery_fee: 700, min_order: 2500, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'Poulet Express', description: 'Poulet braisé, frit, rôti. La référence du poulet à Yaoundé.',
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', cover_image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800',
      category_id: 6, address: 'Mendong', city: 'Yaoundé', phone: '+237 693 456 789',
      rating: 4.5, rating_count: 209, delivery_time: '20-30 min', delivery_fee: 500, min_order: 2000, is_open: 1, is_featured: 0, promo_text: '50% sur le 2ème poulet!'
    },
    // ── REAL RESTAURANTS (verified) ──────────────────────────────────────────
    {
      id: uuidv4(), name: 'Boukarou Lounge', description: 'Cuisine camerounaise authentique dans un cadre lounge élégant. Spécialités du terroir et cocktails signature. Rue de Narvik, Yaoundé.',
      image: '/images/ndole.jpg', cover_image: '/images/eru-fufu.jpg',
      category_id: 1, address: 'Rue de Narvik, Nlongkak', city: 'Yaoundé', phone: '+237 699 874 321',
      rating: 4.1, rating_count: 1273, delivery_time: '25-40 min', delivery_fee: 600, min_order: 2500, is_open: 1, is_featured: 1, promo_text: 'Ambiance lounge tous les soirs!'
    },
    {
      id: uuidv4(), name: 'Socrat Restaurant', description: 'Saveurs locales et influences internationales en plein cœur de Bastos. Terrasse soignée, service impeccable.',
      image: '/images/kondre.jpg', cover_image: '/images/poulet-dg.jpg',
      category_id: 1, address: 'Nouvelle Route Bastos', city: 'Yaoundé', phone: '+237 696 543 210',
      rating: 4.1, rating_count: 822, delivery_time: '20-35 min', delivery_fee: 500, min_order: 2000, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'Tchopetyamo', description: "L'adresse incontournable du soya et des brochettes à Yaoundé. Cuisine de rue légendaire, ambiance festive.",
      image: '/images/haricots-plantain.jpg', cover_image: '/images/mbongo.jpg',
      category_id: 2, address: 'Carrefour Nlongkak', city: 'Yaoundé', phone: '+237 690 112 233',
      rating: 4.2, rating_count: 1777, delivery_time: '15-25 min', delivery_fee: 400, min_order: 1000, is_open: 1, is_featured: 1, promo_text: 'Le soya le plus célèbre de Yaoundé!'
    },
    {
      id: uuidv4(), name: "Restaurant Le Boun's", description: 'Cuisine camerounaise revisitée avec une touche internationale. Cadre raffiné, menu créatif et service attentionné.',
      image: '/images/achu-taro.jpg', cover_image: '/images/ndole-crevettes.jpg',
      category_id: 1, address: 'Quartier Elig-Essono', city: 'Yaoundé', phone: '+237 693 887 654',
      rating: 4.3, rating_count: 91, delivery_time: '30-45 min', delivery_fee: 700, min_order: 3000, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'The Famous', description: "Restaurant haut de gamme alliant gastronomie locale et internationale. L'élégance camerounaise à table, à Bastos.",
      image: '/images/eru-mais.jpg', cover_image: '/images/achu-soup.jpg',
      category_id: 1, address: 'Bastos, Rue de la Rotonde', city: 'Yaoundé', phone: '+237 694 765 432',
      rating: 4.1, rating_count: 695, delivery_time: '35-50 min', delivery_fee: 1000, min_order: 5000, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'Maison H', description: "L'adresse la plus appréciée de Bonapriso. Cuisine locale et internationale dans un cadre moderne et vibrant.",
      image: '/images/poulet-dg.jpg', cover_image: '/images/haricots-noirs.jpg',
      category_id: 1, address: 'Bonapriso', city: 'Douala', phone: '+237 699 321 654',
      rating: 4.2, rating_count: 2833, delivery_time: '25-40 min', delivery_fee: 700, min_order: 3000, is_open: 1, is_featured: 1, promo_text: 'Plus de 2800 clients satisfaits!'
    },
    {
      id: uuidv4(), name: 'La Marquise Restaurant', description: 'Cuisine camerounaise et française à Bonapriso. Décor élégant, vins sélectionnés et service de qualité.',
      image: '/images/koki.jpg', cover_image: '/images/kondre.jpg',
      category_id: 1, address: 'Bonapriso, Rue Tokoto', city: 'Douala', phone: '+237 699 654 987',
      rating: 4.2, rating_count: 517, delivery_time: '30-45 min', delivery_fee: 800, min_order: 3500, is_open: 1, is_featured: 0, promo_text: null
    },
    {
      id: uuidv4(), name: 'Le Grilladin', description: 'Institution de Douala depuis 2008. Grillades françaises et camerounaises, buffets généreux et cadre convivial à Akwa.',
      image: '/images/mbongo.jpg', cover_image: '/images/haricots-plantain.jpg',
      category_id: 2, address: 'Akwa, Boulevard de la Liberté', city: 'Douala', phone: '+237 699 234 567',
      rating: 4.4, rating_count: 456, delivery_time: '25-40 min', delivery_fee: 700, min_order: 2500, is_open: 1, is_featured: 1, promo_text: 'Buffet grillades le weekend!'
    },
    {
      id: uuidv4(), name: 'À La Broche', description: 'Barbecue camerounais authentique à Bonapriso. Brochettes, poulet fumé et viandes grillées au feu de bois.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', cover_image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
      category_id: 2, address: 'Bonapriso, Sortie Casino', city: 'Douala', phone: '+237 675 444 361',
      rating: 4.0, rating_count: 282, delivery_time: '20-35 min', delivery_fee: 600, min_order: 2000, is_open: 1, is_featured: 0, promo_text: null
    },
  ];

  // Store restaurant IDs for menu seeding
  const restaurantIds = [];
  restaurants.forEach(r => {
    const id = r.id;
    insertRest.run(
      id, r.name, r.description, r.image, r.cover_image, r.category_id,
      r.address, r.city, r.phone, r.rating, r.rating_count,
      r.delivery_time, r.delivery_fee, r.min_order, r.is_open, r.is_featured, r.promo_text
    );
    restaurantIds.push(id);
  });

  // Seed Menu Categories
  const insertMenuCat = db.prepare('INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES (?, ?, ?)');
  const menuCatIds = {};

  const menuCatData = [
    [restaurantIds[0], 'Plats Traditionnels', 1],
    [restaurantIds[0], 'Soupes & Bouillons', 2],
    [restaurantIds[0], 'Accompagnements', 3],
    [restaurantIds[1], 'Grillades', 1],
    [restaurantIds[1], 'Brochettes', 2],
    [restaurantIds[1], 'Boissons', 3],
    [restaurantIds[2], 'Burgers', 1],
    [restaurantIds[2], 'Wraps', 2],
    [restaurantIds[2], 'Frites & Sides', 3],
    [restaurantIds[3], 'Entrées', 1],
    [restaurantIds[3], 'Plats Principaux', 2],
    [restaurantIds[3], 'Desserts', 3],
    [restaurantIds[4], 'Pizzas Classiques', 1],
    [restaurantIds[4], 'Pizzas Spéciales', 2],
    [restaurantIds[5], 'Plats Africains', 1],
    [restaurantIds[5], 'Riz & Pâtes', 2],
    [restaurantIds[6], 'Poissons Entiers', 1],
    [restaurantIds[6], 'Fruits de Mer', 2],
    [restaurantIds[7], 'Poulet', 1],
    [restaurantIds[7], 'Accompagnements', 2],
    // New real restaurants
    [restaurantIds[8],  'Spécialités Maison', 1],
    [restaurantIds[8],  'Grillades & Soya', 2],
    [restaurantIds[8],  'Boissons', 3],
    [restaurantIds[9],  'Cuisine Camerounaise', 1],
    [restaurantIds[9],  'Cuisine Internationale', 2],
    [restaurantIds[10], 'Soya & Brochettes', 1],
    [restaurantIds[10], 'Plats du Jour', 2],
    [restaurantIds[11], 'Plats Fusion', 1],
    [restaurantIds[11], 'Classiques Camerounais', 2],
    [restaurantIds[12], 'Entrées', 1],
    [restaurantIds[12], 'Plats Principaux', 2],
    [restaurantIds[13], 'Cuisine Locale', 1],
    [restaurantIds[13], 'Cuisine Internationale', 2],
    [restaurantIds[14], 'Spécialités Camerounaises', 1],
    [restaurantIds[14], 'Cuisine Française', 2],
    [restaurantIds[15], 'Grillades', 1],
    [restaurantIds[15], 'Plats Camerounais', 2],
    [restaurantIds[16], 'Brochettes & BBQ', 1],
    [restaurantIds[16], 'Plats Locaux', 2],
  ];

  menuCatData.forEach(([restId, name, order]) => {
    const result = insertMenuCat.run(restId, name, order);
    if (!menuCatIds[restId]) menuCatIds[restId] = [];
    menuCatIds[restId].push(result.lastInsertRowid);
  });

  // Seed Menu Items
  const insertItem = db.prepare(`
    INSERT INTO menu_items (id, restaurant_id, menu_category_id, name, description, price, image, is_available, is_featured, is_spicy, prep_time, calories, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const menuItems = [
    // Chez Mama Mado - Plats Traditionnels
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][0], 'Ndolé Complet', 'Feuilles de ndolé cuites avec crevettes, viande et arachides. Servi avec miondo ou plantain.', 3500, '/images/ndole-crevettes.jpg', 1, 1, 0, '20 min', 450, 'traditionnel,populaire'],
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][0], 'Eru avec Fufu', 'Légumes okok cuits avec viande fumée et huile de palme. Accompagné de fufu de maïs.', 3000, '/images/eru-fufu.jpg', 1, 1, 0, '25 min', 380, 'traditionnel'],
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][0], 'Poulet DG', 'Poulet sauté avec plantains mûrs, poivrons, tomates et épices camerounaises.', 5500, '/images/poulet-dg.jpg', 1, 1, 0, '30 min', 520, 'populaire,festif'],
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][0], 'Mbongo Tchobi', 'Poulet ou poisson cuisiné dans une sauce noire aux épices ancestrales du Cameroun.', 4000, '/images/mbongo.jpg', 1, 0, 1, '35 min', 410, 'épicé,traditionnel'],
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][0], 'Kondre', 'Cabri cuit lentement avec plantains verts et épices du Bamiléké.', 5000, '/images/kondre.jpg', 1, 0, 0, '40 min', 580, 'traditionnel,bamiléké'],
    // Chez Mama Mado - Soupes
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][1], 'Soupe Koki', 'Gâteau de haricots niébé à la vapeur avec huile de palme et épices.', 1500, '/images/koki.jpg', 1, 0, 0, '15 min', 290, 'végétarien'],
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][1], 'Achu Soup', 'Soupe jaune aux épices avec taro pilé. Spécialité des Grassfields.', 3500, '/images/achu-taro.jpg', 1, 0, 1, '30 min', 460, 'traditionnel,épicé'],
    // Chez Mama Mado - Accompagnements
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][2], 'Plantain Frit', 'Plantains mûrs frits à point, croustillants et dorés.', 500, 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400', 1, 0, 0, '10 min', 180, 'végétarien'],
    [uuidv4(), restaurantIds[0], menuCatIds[restaurantIds[0]][2], 'Miondo (Bâton de Manioc)', 'Manioc fermenté enroulé dans des feuilles. Accompagnement incontournable.', 300, '/images/ndole-crevettes.jpg', 1, 0, 0, '5 min', 140, 'végétarien'],

    // Le Soya King - Grillades
    [uuidv4(), restaurantIds[1], menuCatIds[restaurantIds[1]][0], 'Soya Bœuf (Portion)', 'Morceaux de bœuf marinés et grillés sur braises avec épices suya.', 2000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 1, 1, '15 min', 350, 'populaire,grillé'],
    [uuidv4(), restaurantIds[1], menuCatIds[restaurantIds[1]][0], 'Poulet Braisé Entier', 'Poulet entier braisé à la braise avec sauce pimentée.', 5000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 1, '40 min', 680, 'populaire'],
    [uuidv4(), restaurantIds[1], menuCatIds[restaurantIds[1]][0], 'Porc Grillé (Portion)', 'Côtelettes de porc grillées avec sauce tomate maison.', 2500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 0, 0, '20 min', 420, 'grillé'],
    // Le Soya King - Brochettes
    [uuidv4(), restaurantIds[1], menuCatIds[restaurantIds[1]][1], 'Brochettes Bœuf (x5)', 'Cinq brochettes de bœuf marinées aux épices africaines.', 1500, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 0, 1, '15 min', 280, 'grillé'],
    [uuidv4(), restaurantIds[1], menuCatIds[restaurantIds[1]][1], 'Brochettes Mouton (x5)', 'Cinq brochettes de mouton tendre et épicé.', 1800, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 0, 1, '15 min', 310, 'grillé'],

    // Fast Mboa - Burgers
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][0], 'MboaBurger Classic', 'Steak haché 150g, cheddar, laitue, tomate, sauce secrète MboaEats.', 2500, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1, 1, 0, '15 min', 480, 'populaire'],
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][0], 'Chicken Burger Pimenté', 'Filet de poulet croustillant, sauce pimentée, cornichons, oignons.', 2800, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', 1, 1, 1, '15 min', 510, 'épicé,populaire'],
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][0], 'Double Beef Smash', 'Double steak smashé, double cheddar, sauce burger maison.', 3500, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', 1, 0, 0, '20 min', 650, 'premium'],
    // Fast Mboa - Wraps
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][1], 'Wrap Soya', 'Soya bœuf enroulé dans une galette avec crudités et sauce suya.', 2200, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', 1, 0, 1, '10 min', 420, 'fusion'],
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][1], 'Wrap Poulet DG', 'Poulet DG revisité en wrap avec plantain caramélisé.', 2500, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', 1, 0, 0, '10 min', 450, 'fusion,original'],
    // Fast Mboa - Frites
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][2], 'Frites Classiques', 'Frites de pommes de terre dorées et croustillantes.', 800, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', 1, 0, 0, '10 min', 280, 'accompagnement'],
    [uuidv4(), restaurantIds[2], menuCatIds[restaurantIds[2]][2], 'Frites de Plantain', 'Frites de plantain vert, croustillantes et salées.', 700, 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400', 1, 0, 0, '12 min', 250, 'local'],

    // La Table du Chef
    [uuidv4(), restaurantIds[3], menuCatIds[restaurantIds[3]][0], 'Velouté de Ndolé', 'Ndolé revisité en velouté crémeux avec chips de plantain.', 3000, '/images/ndole.jpg', 1, 1, 0, '20 min', 320, 'gastronomique'],
    [uuidv4(), restaurantIds[3], menuCatIds[restaurantIds[3]][1], 'Filet de Capitaine Sauce Mafé', 'Capitaine grillé nappé d\'une sauce mafé aux arachides et légumes du jardin.', 8500, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', 1, 1, 0, '35 min', 580, 'gastronomique,premium'],
    [uuidv4(), restaurantIds[3], menuCatIds[restaurantIds[3]][1], 'Tournedos Rossini Camerounais', 'Filet de bœuf de qualité, foie gras, sauce truffe et garniture locale.', 12000, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 1, 0, 0, '40 min', 720, 'gastronomique,premium'],
    [uuidv4(), restaurantIds[3], menuCatIds[restaurantIds[3]][2], 'Fondant au Chocolat', 'Fondant chaud accompagné d\'une crème à la vanille du pays.', 2500, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', 1, 0, 0, '15 min', 380, 'dessert'],

    // Pizza & Co
    [uuidv4(), restaurantIds[4], menuCatIds[restaurantIds[4]][0], 'Margherita', 'Sauce tomate, mozzarella, basilic frais.', 3500, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 1, 0, 0, '25 min', 560, 'classique'],
    [uuidv4(), restaurantIds[4], menuCatIds[restaurantIds[4]][0], 'Quatre Fromages', 'Mozzarella, cheddar, emmental, parmesan.', 4500, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 1, 0, 0, '25 min', 680, 'fromage'],
    [uuidv4(), restaurantIds[4], menuCatIds[restaurantIds[4]][1], 'Pizza Poulet DG', 'Notre pizza signature: poulet DG, plantain, poivrons, sauce tomate épicée.', 5000, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 1, 1, 1, '30 min', 720, 'signature,fusion,populaire'],
    [uuidv4(), restaurantIds[4], menuCatIds[restaurantIds[4]][1], 'Pizza Soya', 'Soya bœuf, oignons caramélisés, sauce suya, mozza.', 5500, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 1, 1, 1, '30 min', 740, 'signature,fusion'],

    // Mama Africa Kitchen
    [uuidv4(), restaurantIds[5], menuCatIds[restaurantIds[5]][0], 'Jollof Rice au Poulet', 'Riz jollof épicé cuit avec poulet braisé, légumes et épices west-africaines.', 2500, '/images/haricots-plantain.jpg', 1, 1, 1, '25 min', 520, 'africain,populaire'],
    [uuidv4(), restaurantIds[5], menuCatIds[restaurantIds[5]][0], 'Thiéboudienne', 'Riz au poisson sénégalais avec légumes, sauce tomate.', 3000, '/images/poisson-sauce.jpg', 1, 0, 0, '30 min', 580, 'africain'],
    [uuidv4(), restaurantIds[5], menuCatIds[restaurantIds[5]][1], 'Riz Sauté aux Légumes', 'Riz sauté wok avec légumes frais et sauce soja.', 1800, '/images/haricots-noirs.jpg', 1, 0, 0, '15 min', 380, 'végétarien'],

    // Poisson Frais Kribi
    [uuidv4(), restaurantIds[6], menuCatIds[restaurantIds[6]][0], 'Capitaine Braisé Entier', 'Capitaine du fleuve braisé au feu de bois avec sauce tomate pimentée.', 5500, '/images/poisson-sauce.jpg', 1, 1, 1, '35 min', 480, 'poisson,populaire'],
    [uuidv4(), restaurantIds[6], menuCatIds[restaurantIds[6]][0], 'Tilapia Frit', 'Tilapia entier frit croustillant avec sauce tartare maison.', 4000, '/images/poisson-sauce.jpg', 1, 0, 0, '20 min', 420, 'poisson'],
    [uuidv4(), restaurantIds[6], menuCatIds[restaurantIds[6]][1], 'Crevettes Sautées', 'Grosses crevettes sautées à l\'ail et persil, servies avec riz blanc.', 6500, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', 1, 1, 0, '20 min', 390, 'fruitsmer,premium'],

    // Poulet Express
    [uuidv4(), restaurantIds[7], menuCatIds[restaurantIds[7]][0], 'Poulet Braisé Demi', 'Demi poulet braisé à la braise avec sauce piment fraîche.', 2500, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 1, '30 min', 450, 'populaire'],
    [uuidv4(), restaurantIds[7], menuCatIds[restaurantIds[7]][0], 'Poulet Rôti Entier', 'Poulet entier rôti aux herbes et épices locales.', 4500, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400', 1, 0, 0, '45 min', 780, 'familial'],
    [uuidv4(), restaurantIds[7], menuCatIds[restaurantIds[7]][0], 'Ailes de Poulet Pimentées (x8)', 'Huit ailes de poulet marinées et grillées avec sauce piment diabolique.', 3000, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', 1, 0, 1, '25 min', 520, 'épicé'],
    [uuidv4(), restaurantIds[7], menuCatIds[restaurantIds[7]][1], 'Riz Blanc', 'Riz blanc parfumé au jasmin.', 500, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', 1, 0, 0, '10 min', 180, 'accompagnement'],

    // ── Boukarou Lounge (8) ─────────────────────────────────────────────────
    [uuidv4(), restaurantIds[8], menuCatIds[restaurantIds[8]][0], 'Ndolé Spécial Boukarou', 'Notre ndolé signature aux crevettes géantes, viande fumée et miondo maison.', 4500, '/images/ndole-crevettes.jpg', 1, 1, 0, '25 min', 480, 'signature,traditionnel,populaire'],
    [uuidv4(), restaurantIds[8], menuCatIds[restaurantIds[8]][0], 'Eru Complet Lounge', 'Eru aux légumes okok avec fufu de maïs, viande et poisson fumé du pays.', 3500, '/images/eru-fufu.jpg', 1, 0, 0, '30 min', 420, 'traditionnel'],
    [uuidv4(), restaurantIds[8], menuCatIds[restaurantIds[8]][0], 'Poulet DG Boukarou', 'Poulet DG revisité aux légumes du marché et plantains dorés caramélisés.', 5500, '/images/poulet-dg.jpg', 1, 1, 0, '30 min', 540, 'signature,populaire'],
    [uuidv4(), restaurantIds[8], menuCatIds[restaurantIds[8]][1], 'Soya Bœuf Premium', 'Soya de bœuf mariné aux épices suya, grillé au charbon de bois.', 2500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 1, 1, '20 min', 360, 'épicé,populaire'],
    [uuidv4(), restaurantIds[8], menuCatIds[restaurantIds[8]][1], 'Brochettes Mixtes (x5)', 'Cinq brochettes bœuf et mouton grillées, sauce piment maison.', 2000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 0, 1, '20 min', 310, 'grillé,épicé'],
    [uuidv4(), restaurantIds[8], menuCatIds[restaurantIds[8]][2], 'Jus de Gingembre Maison', 'Jus de gingembre frais pressé avec citron vert et miel du pays.', 800, 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400', 1, 0, 0, '5 min', 80, 'boisson,naturel'],

    // ── Socrat Restaurant (9) ───────────────────────────────────────────────
    [uuidv4(), restaurantIds[9], menuCatIds[restaurantIds[9]][0], 'Kondre Socrat', 'Cabri mijoté aux plantains verts et épices bamiléké, servi avec fufu.', 5500, '/images/kondre.jpg', 1, 1, 0, '40 min', 590, 'traditionnel,bamiléké'],
    [uuidv4(), restaurantIds[9], menuCatIds[restaurantIds[9]][0], 'Mbongo Tchobi Socrat', 'Poulet en sauce noire ancestrale et épices secrètes avec plantain frit.', 4500, '/images/mbongo.jpg', 1, 1, 1, '35 min', 430, 'épicé,traditionnel'],
    [uuidv4(), restaurantIds[9], menuCatIds[restaurantIds[9]][0], 'Achu Complet Bastos', 'Taro pilé avec soupe jaune aux épices grassfields, viande et écrevisses.', 4000, '/images/achu-taro.jpg', 1, 0, 1, '30 min', 470, 'traditionnel,grassfields'],
    [uuidv4(), restaurantIds[9], menuCatIds[restaurantIds[9]][1], 'Steak Grillé Sauce Poivre', 'Entrecôte 250g grillée sauce poivre vert maison, haricots verts et frites.', 7500, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 1, 0, 0, '25 min', 720, 'international,premium'],
    [uuidv4(), restaurantIds[9], menuCatIds[restaurantIds[9]][1], 'Pâtes Carbonara Camerounaise', 'Spaghetti carbonara aux lardons fumés locaux et fromage râpé.', 3500, 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=400', 1, 0, 0, '20 min', 590, 'international,pâtes'],

    // ── Tchopetyamo (10) ────────────────────────────────────────────────────
    [uuidv4(), restaurantIds[10], menuCatIds[restaurantIds[10]][0], 'Soya Bœuf Grande Portion', 'La plus grande portion de soya de Yaoundé. Marinade maison au feu de charbon.', 2500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 1, 1, '15 min', 380, 'populaire,épicé,signature'],
    [uuidv4(), restaurantIds[10], menuCatIds[restaurantIds[10]][0], 'Brochettes Mouton (x6)', 'Six brochettes de mouton tendre marinées aux épices suya.', 2000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 0, 1, '15 min', 330, 'grillé'],
    [uuidv4(), restaurantIds[10], menuCatIds[restaurantIds[10]][0], 'Poulet Braisé Tchopetyamo', 'Demi-poulet braisé sauce piment, le classique de la maison.', 2500, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 1, '30 min', 450, 'populaire,braisé'],
    [uuidv4(), restaurantIds[10], menuCatIds[restaurantIds[10]][1], 'Haricots Rouges au Plantain', 'Haricots rouges mijotés avec plantain frit croustillant et sauce tomate.', 1500, '/images/haricots-plantain.jpg', 1, 1, 0, '20 min', 420, 'local,végétarien'],
    [uuidv4(), restaurantIds[10], menuCatIds[restaurantIds[10]][1], 'Maïs et Niébé Mijoté', 'Maïs et haricots noirs mijotés à la camerounaise, sauce pimentée.', 1200, '/images/haricots-noirs.jpg', 1, 0, 0, '25 min', 350, 'local,végétarien'],

    // ── Restaurant Le Boun\'s (11) ──────────────────────────────────────────
    [uuidv4(), restaurantIds[11], menuCatIds[restaurantIds[11]][0], 'Burger Ndolé Fusion', 'Steak haché maison sur lit de ndolé, fromage fondu et chips de plantain.', 3500, '/images/ndole.jpg', 1, 1, 0, '20 min', 550, 'fusion,signature'],
    [uuidv4(), restaurantIds[11], menuCatIds[restaurantIds[11]][0], 'Wrap Poulet DG', 'Poulet DG revisité en wrap aux légumes croquants et sauce suya.', 3000, '/images/poulet-dg.jpg', 1, 0, 0, '15 min', 480, 'fusion'],
    [uuidv4(), restaurantIds[11], menuCatIds[restaurantIds[11]][1], 'Eru Traditionnel Maison', 'Eru okok aux légumes, fufu de maïs et viande fumée du terroir.', 3000, '/images/eru-mais.jpg', 1, 0, 0, '25 min', 390, 'traditionnel'],
    [uuidv4(), restaurantIds[11], menuCatIds[restaurantIds[11]][1], 'Achu du Boun\'s', 'Achu soupe jaune épicée des Grassfields avec taro pilé maison.', 3500, '/images/achu-soup.jpg', 1, 1, 1, '30 min', 460, 'traditionnel,grassfields'],

    // ── The Famous (12) ─────────────────────────────────────────────────────
    [uuidv4(), restaurantIds[12], menuCatIds[restaurantIds[12]][0], 'Tartare de Capitaine', 'Capitaine frais en tartare aux herbes fraîches et vinaigrette citron.', 4500, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', 1, 1, 0, '15 min', 290, 'gastronomique,poisson,premium'],
    [uuidv4(), restaurantIds[12], menuCatIds[restaurantIds[12]][0], 'Velouté de Ndolé Crémeux', 'Crème de ndolé aux crevettes, chips de plantain et huile de palme vierge.', 3500, '/images/ndole-crevettes.jpg', 1, 0, 0, '20 min', 310, 'gastronomique,signature'],
    [uuidv4(), restaurantIds[12], menuCatIds[restaurantIds[12]][1], 'Filet de Bœuf Sauce Ndolé', 'Filet de bœuf grillé nappé de réduction de ndolé aux arachides torréfiées.', 9500, '/images/ndole.jpg', 1, 1, 0, '35 min', 680, 'gastronomique,fusion,signature'],
    [uuidv4(), restaurantIds[12], menuCatIds[restaurantIds[12]][1], 'Poulet Rôti Bastos', 'Poulet entier rôti aux herbes de Provence et épices camerounaises.', 7000, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 0, 0, '45 min', 720, 'gastronomique,rôti'],

    // ── Maison H - Douala (13) ──────────────────────────────────────────────
    [uuidv4(), restaurantIds[13], menuCatIds[restaurantIds[13]][0], 'Poulet DG Maison H', 'Version signature: plantains caramélisés, légumes du marché, sauce légère aux épices.', 6000, '/images/poulet-dg.jpg', 1, 1, 0, '30 min', 530, 'signature,populaire'],
    [uuidv4(), restaurantIds[13], menuCatIds[restaurantIds[13]][0], 'Ndolé Gourmet Maison H', 'Ndolé revisité aux crevettes royales et viande de qualité supérieure.', 5000, '/images/ndole-crevettes.jpg', 1, 1, 0, '25 min', 490, 'gastronomique,traditionnel'],
    [uuidv4(), restaurantIds[13], menuCatIds[restaurantIds[13]][0], 'Eru Premium Bonapriso', 'Eru okok préparé à la méthode traditionnelle avec viande de qualité.', 4500, '/images/eru-fufu.jpg', 1, 0, 0, '30 min', 440, 'traditionnel,premium'],
    [uuidv4(), restaurantIds[13], menuCatIds[restaurantIds[13]][1], 'Burger Maison H', 'Double smash burger, sauce secrète maison, pickles et fromage fondu.', 4000, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', 1, 1, 0, '20 min', 640, 'international,populaire'],
    [uuidv4(), restaurantIds[13], menuCatIds[restaurantIds[13]][1], 'Club Sandwich Maison H', 'Triple-decker: poulet grillé, bacon, tomate, laitue, mayo maison.', 3500, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', 1, 0, 0, '15 min', 510, 'international,sandwich'],

    // ── La Marquise - Douala (14) ───────────────────────────────────────────
    [uuidv4(), restaurantIds[14], menuCatIds[restaurantIds[14]][0], 'Achu Soup La Marquise', 'Achu authentique des Grassfields, soupe jaune et viande de qualité supérieure.', 4500, '/images/achu-taro.jpg', 1, 1, 1, '30 min', 480, 'traditionnel,grassfields'],
    [uuidv4(), restaurantIds[14], menuCatIds[restaurantIds[14]][0], 'Koki Spécial Tokoto', 'Gâteau de haricots niébé vapeur avec huile de palme rouge et épices locales.', 2000, '/images/koki.jpg', 1, 0, 0, '20 min', 310, 'végétarien,traditionnel'],
    [uuidv4(), restaurantIds[14], menuCatIds[restaurantIds[14]][0], 'Mbongo Tchobi Marquise', 'Poulet fermier en sauce noire mbongo aux épices secrètes, avec miondo.', 5000, '/images/mbongo.jpg', 1, 0, 1, '40 min', 450, 'épicé,traditionnel,signature'],
    [uuidv4(), restaurantIds[14], menuCatIds[restaurantIds[14]][1], 'Entrecôte Grillée Sauce Béarnaise', 'Entrecôte 250g grillée à la française, sauce béarnaise et légumes de saison.', 9000, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 1, 0, 0, '30 min', 750, 'français,premium'],
    [uuidv4(), restaurantIds[14], menuCatIds[restaurantIds[14]][1], 'Quiche Lorraine Maison', 'Quiche lorraine aux lardons fumés camerounais et fromage râpé.', 3500, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', 1, 0, 0, '15 min', 460, 'français'],

    // ── Le Grilladin - Douala (15) ──────────────────────────────────────────
    [uuidv4(), restaurantIds[15], menuCatIds[restaurantIds[15]][0], 'Côte de Bœuf au Charbon', 'Côte de bœuf 400g grillée au charbon de bois, sauce poivre maison et gratin.', 8500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 1, 0, '30 min', 780, 'grillades,premium'],
    [uuidv4(), restaurantIds[15], menuCatIds[restaurantIds[15]][0], 'Buffet Grillades Weekend', 'Buffet de grillades: bœuf, mouton, poulet, saucisses. À volonté le weekend.', 6500, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 1, 0, '15 min', 950, 'buffet,grillades,weekend'],
    [uuidv4(), restaurantIds[15], menuCatIds[restaurantIds[15]][0], 'Agneau Grillé aux Herbes', 'Carré d\'agneau grillé aux herbes de Provence et sauce à la menthe.', 7500, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 1, 0, 0, '35 min', 680, 'grillades,premium,français'],
    [uuidv4(), restaurantIds[15], menuCatIds[restaurantIds[15]][1], 'Mbongo Tchobi Grilladin', 'Poulet fermier en sauce noire mbongo aux épices ancestrales.', 4500, '/images/mbongo.jpg', 1, 1, 1, '35 min', 430, 'traditionnel,épicé'],
    [uuidv4(), restaurantIds[15], menuCatIds[restaurantIds[15]][1], 'Capitaine Braisé Kribi', 'Capitaine du littoral braisé au feu de bois, sauce pimentée maison.', 5500, '/images/poisson-sauce.jpg', 1, 0, 1, '35 min', 490, 'poisson,épicé'],

    // ── À La Broche - Douala (16) ───────────────────────────────────────────
    [uuidv4(), restaurantIds[16], menuCatIds[restaurantIds[16]][0], 'Brochettes Mixtes (x8)', 'Huit brochettes mixtes: bœuf, poulet et mouton marinés aux épices suya.', 3000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400', 1, 1, 1, '20 min', 420, 'grillé,épicé,populaire'],
    [uuidv4(), restaurantIds[16], menuCatIds[restaurantIds[16]][0], 'Poulet Fumé À La Broche', 'Poulet entier fumé lentement au bois de campêche et épices locales.', 5500, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 0, '45 min', 680, 'fumé,signature'],
    [uuidv4(), restaurantIds[16], menuCatIds[restaurantIds[16]][0], 'Soya Porc Épicé', 'Porc mariné aux épices suya et grillé sur braises vives.', 2500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 1, 0, 1, '20 min', 390, 'grillé,épicé'],
    [uuidv4(), restaurantIds[16], menuCatIds[restaurantIds[16]][1], 'Haricots Rouges Plantain Frit', 'Haricots rouges mijotés au palme rouge, plantain frit croustillant.', 1500, '/images/haricots-plantain.jpg', 1, 0, 0, '20 min', 410, 'traditionnel,végétarien'],
    [uuidv4(), restaurantIds[16], menuCatIds[restaurantIds[16]][1], 'Eru Okok Fumé', 'Eru aux légumes okok et viande fumée, servi avec fufu de maïs jaune.', 3500, '/images/eru-mais.jpg', 1, 0, 0, '30 min', 400, 'traditionnel'],
  ];

  menuItems.forEach(item => insertItem.run(...item));

  // Seed a default user
  const hashedPwd = bcrypt.hashSync('password123', 10);
  db.prepare(`
    INSERT INTO users (id, name, email, phone, password, address, city, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), 'Paul Auguste', 'paul@mboaeats.cm', '+237 695 584 290', hashedPwd, 'Bastos, Yaoundé', 'Yaoundé', 'customer');

  console.log('✅ Database seeded successfully!');
}

initializeDatabase();

module.exports = db;
