const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'mboa_command_secret_2024';

// Simple in-memory database
const DB = {
  users: [],
  categories: [],
  restaurants: [],
  menu_categories: [],
  menu_items: []
};

let initialized = false;

function initDB() {
  if (initialized) return;
  initialized = true;

  // Seed categories
  DB.categories = [
    {id:1,name:'Camerounais',icon:'🍲',slug:'camerounais'},
    {id:2,name:'Grillades & Soya',icon:'🔥',slug:'grillades'},
    {id:3,name:'Fast Food',icon:'🍔',slug:'fast-food'}
  ];

  // Seed restaurants
  const r1=uuidv4(),r2=uuidv4(),r3=uuidv4();
  DB.restaurants = [
    {id:r1,name:'Chez Mama Mado',description:'La vraie cuisine camerounaise',image:'/images/ndole-crevettes.jpg',cover_image:'/images/poulet-dg.jpg',category_id:1,address:'Bastos',city:'Yaoundé',phone:'+237697123456',rating:4.8,rating_count:342,delivery_time:'25-35 min',delivery_fee:500,min_order:2000,is_open:1,is_featured:1,promo_text:'20% sur votre première commande!'},
    {id:r2,name:'Le Soya King',description:'Le meilleur soya de Douala',image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',cover_image:'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',category_id:2,address:'Akwa',city:'Douala',phone:'+237699456789',rating:4.6,rating_count:218,delivery_time:'20-30 min',delivery_fee:700,min_order:1500,is_open:1,is_featured:1,promo_text:null},
    {id:r3,name:'Fast Mboa',description:'Burgers camerounais',image:'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',cover_image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',category_id:3,address:'Bonanjo',city:'Douala',phone:'+237690789012',rating:4.4,rating_count:185,delivery_time:'15-25 min',delivery_fee:500,min_order:1500,is_open:1,is_featured:1,promo_text:'Livraison gratuite dès 5000 FCFA'}
  ];

  // Seed menu categories
  DB.menu_categories = [
    {id:1,restaurant_id:r1,name:'Plats Traditionnels',sort_order:1},
    {id:2,restaurant_id:r2,name:'Grillades',sort_order:1},
    {id:3,restaurant_id:r3,name:'Burgers',sort_order:1}
  ];

  // Seed menu items
  DB.menu_items = [
    {id:uuidv4(),restaurant_id:r1,menu_category_id:1,name:'Ndolé Complet',description:'Feuilles de ndolé avec crevettes',price:3500,image:'/images/ndole-crevettes.jpg',is_available:1,is_featured:1,is_spicy:0,prep_time:'20 min',calories:450,tags:'traditionnel'},
    {id:uuidv4(),restaurant_id:r2,menu_category_id:2,name:'Soya Bœuf',description:'Bœuf grillé aux épices',price:2000,image:'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400',is_available:1,is_featured:1,is_spicy:1,prep_time:'15 min',calories:350,tags:'grillé'},
    {id:uuidv4(),restaurant_id:r3,menu_category_id:3,name:'MboaBurger',description:'Burger camerounais',price:2500,image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',is_available:1,is_featured:1,is_spicy:0,prep_time:'15 min',calories:480,tags:'populaire'}
  ];

  // Demo user
  const hash = bcrypt.hashSync('password123', 10);
  DB.users.push({
    id:uuidv4(),
    name:'Paul Ndefo',
    email:'paul@mboaeats.cm',
    phone:'+237695584290',
    password:hash,
    city:'Yaoundé',
    role:'customer'
  });
}

// Auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Non authentifié' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token invalide' }); }
}

// Routes
app.get('/api/health', (req, res) => {
  initDB();
  res.json({ status: 'OK', users: DB.users.length, restaurants: DB.restaurants.length });
});

app.get('/api/debug', (req, res) => {
  initDB();
  res.json({ 
    users: DB.users.length,
    categories: DB.categories.length,
    restaurants: DB.restaurants.length,
    menu_items: DB.menu_items.length
  });
});

app.post('/api/auth/register', (req, res) => {
  try {
    initDB();
    const { name, email, password, city } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Champs requis manquants' });
    if (DB.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email déjà utilisé' });
    const id = uuidv4();
    const user = { id, name, email, phone: null, password: bcrypt.hashSync(password, 10), city: city || 'Yaoundé', role: 'customer' };
    DB.users.push(user);
    const token = jwt.sign({ id, email, name, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, city: user.city, role: 'customer' } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/login', (req, res) => {
  try {
    console.log('[LOGIN] Starting login...');
    initDB();
    console.log('[LOGIN] DB initialized, users:', DB.users.length);
    
    const { email, password } = req.body;
    console.log('[LOGIN] Request:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      console.log('[LOGIN] Missing credentials');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const user = DB.users.find(u => u.email === email);
    console.log('[LOGIN] User found:', !!user);
    
    if (!user) {
      console.log('[LOGIN] User not found');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('[LOGIN] Comparing passwords...');
    const passwordMatch = bcrypt.compareSync(password, user.password);
    console.log('[LOGIN] Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('[LOGIN] Password mismatch');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('[LOGIN] Generating token...');
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    console.log('[LOGIN] Token generated');
    
    const { password: _, ...safe } = user;
    console.log('[LOGIN] Success, sending response');
    res.json({ token, user: safe });
  } catch(e) { 
    console.error('[LOGIN ERROR]', e);
    res.status(500).json({ error: e.message || 'Erreur serveur' }); 
  }
});

app.get('/api/categories', (req, res) => {
  try {
    initDB();
    res.json({ data: DB.categories });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/restaurants', (req, res) => {
  try {
    initDB();
    const { city, category, featured, search } = req.query;
    let results = DB.restaurants.map(r => {
      const cat = DB.categories.find(c => c.id === r.category_id);
      return { ...r, category_name: cat?.name, category_icon: cat?.icon, category_slug: cat?.slug };
    });
    if (city) results = results.filter(r => r.city === city);
    if (category) results = results.filter(r => {
      const cat = DB.categories.find(c => c.id === r.category_id);
      return cat?.slug === category;
    });
    if (featured === '1') results = results.filter(r => r.is_featured === 1);
    if (search) results = results.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    res.json({ data: results, total: results.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/restaurants/:id', (req, res) => {
  try {
    initDB();
    const r = DB.restaurants.find(rest => rest.id === req.params.id);
    if (!r) return res.status(404).json({ error: 'Restaurant non trouvé' });
    const cat = DB.categories.find(c => c.id === r.category_id);
    const menuCats = DB.menu_categories.filter(mc => mc.restaurant_id === req.params.id).sort((a,b) => a.sort_order - b.sort_order);
    const menuItems = DB.menu_items.filter(mi => mi.restaurant_id === req.params.id && mi.is_available === 1);
    const menu = menuCats.map(cat => ({ ...cat, items: menuItems.filter(i => i.menu_category_id === cat.id) }));
    res.json({ ...r, category_name: cat?.name, category_icon: cat?.icon, menu });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/menu/featured', (req, res) => {
  try {
    initDB();
    const { limit = 8 } = req.query;
    const results = DB.menu_items.filter(mi => mi.is_featured === 1).slice(0, parseInt(limit)).map(mi => {
      const r = DB.restaurants.find(rest => rest.id === mi.restaurant_id);
      return { ...mi, restaurant_name: r?.name, delivery_time: r?.delivery_time, delivery_fee: r?.delivery_fee, rating: r?.rating };
    });
    res.json({ data: results });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/menu/items/:id', (req, res) => {
  try {
    initDB();
    const item = DB.menu_items.find(mi => mi.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Plat non trouvé' });
    const r = DB.restaurants.find(rest => rest.id === item.restaurant_id);
    res.json({ ...item, restaurant_name: r?.name, delivery_time: r?.delivery_time, delivery_fee: r?.delivery_fee });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/menu/search', (req, res) => {
  try {
    initDB();
    const { q } = req.query;
    if (!q) return res.json({ data: [] });
    const results = DB.menu_items.filter(mi => 
      mi.name.toLowerCase().includes(q.toLowerCase()) || 
      mi.description?.toLowerCase().includes(q.toLowerCase()) ||
      mi.tags?.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 30).map(mi => {
      const r = DB.restaurants.find(rest => rest.id === mi.restaurant_id);
      return { ...mi, restaurant_name: r?.name, delivery_time: r?.delivery_time, delivery_fee: r?.delivery_fee, rating: r?.rating };
    });
    res.json({ data: results });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.use((err, req, res, _next) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

// For Vercel serverless
module.exports = app;
module.exports.default = app;
