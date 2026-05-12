# 📝 Changelog - MBOA Command

All notable changes to this project are documented in this file.

---

## [2.0.0] - 2026-05-12

### 🚀 Major Migration: SQLite → PostgreSQL (Supabase)

#### Added
- **PostgreSQL Database Integration**
  - Created `backend/database/postgres.js` - PostgreSQL adapter with connection pooling
  - Implemented async query methods: `queryAll()`, `queryOne()`, `run()`, `exec()`
  - Added SQL placeholder conversion (SQLite `?` → PostgreSQL `$1, $2...`)
  - Implemented database schema initialization with auto-seeding
  - Added `runReturning()` for INSERT operations with ID return

- **Database Router**
  - Created `backend/database/db.js` - Dynamic database loader
  - Auto-detects PostgreSQL vs SQLite based on `DATABASE_URL` environment variable
  - Seamless switching between development (SQLite) and production (PostgreSQL)

- **Async Route Handlers**
  - Created `backend/utils/asyncHandler.js` - Express async error handler wrapper
  - Converted all routes to async/await pattern for PostgreSQL compatibility

- **Documentation**
  - Added `README.md` - Comprehensive project documentation
  - Added `STATUS.md` - System status and architecture overview
  - Added `test-integration.md` - Integration test results
  - Added `test-frontend-backend.html` - Interactive API testing page
  - Added `CHANGELOG.md` - This file

#### Changed
- **Backend Routes (All converted to async)**
  - `routes/auth.js` - Authentication endpoints now async
  - `routes/categories.js` - Category listing now async
  - `routes/restaurants.js` - Restaurant CRUD now async
  - `routes/menu.js` - Menu operations now async
  - `routes/users.js` - User management now async
  - `routes/orders.js` - Order processing now async with parallel item insertion

- **Database Adapter**
  - Modified `backend/database/db-sqlite.js` - Added PostgreSQL-compatible API wrapper
  - Implemented sync-to-async wrappers for SQLite methods
  - Added SQL syntax conversion (LIKE → ILIKE for case-insensitive search)

- **Server Initialization**
  - Modified `backend/server.js` - Now async startup with database initialization
  - Added database health check before server start
  - Improved error handling with graceful shutdown

- **Environment Configuration**
  - Updated `backend/.env` - Added `DATABASE_URL` for PostgreSQL connection
  - Updated `frontend/.env.production` - Changed API URL from Vercel to Render
  - Updated `backend/render.yaml` - Removed SQLite disk, added DATABASE_URL

#### Fixed
- **PostgreSQL Compatibility Issues**
  - Fixed restaurant INSERT statement - Added missing `$17` placeholder for `promo_text`
  - Fixed SQL parameter placeholders throughout all queries
  - Fixed auto-increment ID handling (SQLite `lastInsertRowid` → PostgreSQL `RETURNING id`)
  - Fixed case-sensitive search (SQLite `LIKE` → PostgreSQL `ILIKE`)

- **Deployment Configuration**
  - Removed `--experimental-sqlite` flag from Render start command
  - Removed SQLite disk mount from Render configuration
  - Added SSL configuration for Supabase connection

#### Database Schema
```sql
Tables Created:
- users (id TEXT PRIMARY KEY, name, email, password, phone, address, city, avatar, role, created_at)
- categories (id SERIAL, name, icon, slug)
- restaurants (id TEXT, name, description, image, cover_image, category_id, address, city, phone, rating, rating_count, delivery_time, delivery_fee, min_order, is_open, is_featured, promo_text, latitude, longitude, created_at)
- menu_categories (id SERIAL, restaurant_id, name, sort_order)
- menu_items (id TEXT, restaurant_id, menu_category_id, name, description, price, image, is_available, is_featured, is_spicy, prep_time, calories, tags, created_at)
- orders (id TEXT, user_id, restaurant_id, status, total, delivery_fee, delivery_address, delivery_city, payment_method, payment_status, notes, driver_name, driver_phone, estimated_delivery, created_at, updated_at)
- order_items (id SERIAL, order_id, menu_item_id, quantity, price, name)
- favorites (id SERIAL, user_id, restaurant_id, menu_item_id, created_at)
- reviews (id SERIAL, user_id, restaurant_id, order_id, rating, comment, created_at)
- otp_codes (id SERIAL, email, code, purpose, expires_at, used, created_at)
```

#### Seed Data
- **9 Categories**: Camerounais, Grillades & Soya, Fast Food, Pizzas, Poissons, Poulet, Végétarien, Desserts, Boissons
- **8 Restaurants**: Chez Mama Mado, Le Soya King, Fast Mboa, La Table du Chef, Pizza & Co Yaoundé, Mama Africa Kitchen, Poisson Frais Kribi, Poulet Express
- **24 Menu Items**: Traditional Cameroonian dishes with prices, images, ratings

#### Deployment
- **Frontend**: Vercel (https://mboa-command.vercel.app)
- **Backend**: Render (https://mboa-command-api.onrender.com/api)
- **Database**: Supabase PostgreSQL (EU West - Ireland)

#### Testing
- ✅ Backend Health Check: OK
- ✅ Database Connection: OK
- ✅ Categories API: 9 categories returned
- ✅ Restaurants API: 8 restaurants with full details
- ✅ Frontend ↔ Backend ↔ Database: Full communication verified

---

## [1.1.0] - 2026-04-27

### Fixed
- **Frontend UI**
  - Fixed app logo path in `OnboardingPage.tsx` (line 69)
  - Fixed app logo path in `SplashPage.tsx` (line 51)
  - Created `frontend/public/favicon.svg` for browser tab icon

- **Navigation**
  - Modified `BottomNav.tsx` - Removed cart from hidden routes
  - BottomNav now always visible on main pages (Home, Search, Orders, Profile)

---

## [1.0.0] - Initial Release

### Added
- **Frontend (React + TypeScript + Vite)**
  - Modern dark theme UI with lime green accents
  - Responsive mobile-first design
  - React Router v6 for navigation
  - TailwindCSS for styling
  - shadcn/ui components
  - Lucide React icons
  - Context API for state management

- **Backend (Express.js + Node.js)**
  - RESTful API architecture
  - JWT authentication
  - bcrypt password hashing
  - Nodemailer OTP verification
  - SQLite database (synchronous)
  - CORS enabled
  - Express middleware

- **Core Features**
  - User registration and login
  - Restaurant browsing and filtering
  - Menu viewing with categories
  - Shopping cart functionality
  - Order placement
  - User profile management
  - Favorites system
  - Reviews and ratings

- **Pages**
  - Splash screen
  - Onboarding
  - Home with categories and featured restaurants
  - Restaurant details
  - Menu items
  - Cart
  - Checkout
  - Orders history
  - Profile

---

## Migration Summary

### Before (v1.x)
```
Frontend (Vercel) → Backend (Vercel) → SQLite (Local File)
```

### After (v2.0)
```
Frontend (Vercel) → Backend (Render) → PostgreSQL (Supabase Cloud)
```

### Key Improvements
- ✅ **Scalability**: PostgreSQL handles concurrent connections better than SQLite
- ✅ **Cloud Database**: No need for persistent disk storage
- ✅ **Better Performance**: Connection pooling and optimized queries
- ✅ **Production Ready**: Proper async/await pattern throughout
- ✅ **Separation of Concerns**: Frontend, Backend, Database all independently hosted
- ✅ **Cost Effective**: Free tiers on Vercel, Render, and Supabase

---

## Git Commit History

```
8f86dc0 - docs: add comprehensive README with setup instructions and architecture
876f310 - docs: add integration tests and system status documentation
5f3d4c7 - fix: update frontend to use Render backend URL
a343ce9 - fix: add DATABASE_URL to render.yaml for auto-deploy
f2851b8 - fix: correct restaurant INSERT placeholder count ($17 for promo_text)
08fd6a5 - feat: Migrate backend from SQLite to PostgreSQL (Supabase-compatible)
0bd7534 - fix: Show BottomNav on all main pages including cart
```

---

## Environment Variables

### Backend Production (Render)
```env
NODE_VERSION=22.0.0
PORT=10000
NODE_ENV=production
JWT_SECRET=<auto-generated>
DATABASE_URL=postgresql://postgres.hpffonuyhyoirzgmsigb:Auguste%40ictu2021@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
EMAIL_USER=<to-be-configured>
EMAIL_PASS=<to-be-configured>
FRONTEND_URL=https://mboa-command.vercel.app
```

### Frontend Production (Vercel)
```env
VITE_API_URL=https://mboa-command-api.onrender.com/api
```

---

## Breaking Changes

### v2.0.0
- **Database**: SQLite → PostgreSQL (requires migration)
- **Backend Host**: Vercel → Render
- **API URL**: Changed in frontend configuration
- **Async/Await**: All database operations now asynchronous
- **SQL Syntax**: Queries updated for PostgreSQL compatibility

---

## Roadmap

### Planned Features
- [ ] Payment integration (Mobile Money, Orange Money)
- [ ] Real-time order tracking with maps
- [ ] Push notifications
- [ ] Restaurant owner dashboard
- [ ] Delivery driver app
- [ ] Multi-language support (French/English)
- [ ] Loyalty program
- [ ] Referral system

### Technical Improvements
- [ ] Add Redis caching layer
- [ ] Implement rate limiting
- [ ] Add comprehensive unit tests
- [ ] Add E2E tests with Playwright
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and logging (Sentry)
- [ ] Implement WebSocket for real-time updates

---

**For detailed technical documentation, see [README.md](README.md)**  
**For current system status, see [STATUS.md](STATUS.md)**
