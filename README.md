# 🍲 MBOA Command - Food Delivery App

> **Authentic Cameroonian cuisine delivered to your doorstep**

A modern, full-stack food delivery application featuring Cameroonian restaurants and dishes. Built with React, Express.js, and PostgreSQL.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://mboa-command.vercel.app)
[![API Status](https://img.shields.io/badge/API-online-success)](https://mboa-command-api.onrender.com/api/health)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# THIS WORK   WAS DONE BY
NDEFO PAUL AUGUSTE
ICTU20212527
SOFTWARE ENGINEERING
LEVEL 4

MOUNET NOTAM URIELLE MERVEILLE
ICTU20234379
SOFTWARE ENGINEERING 
LEVEL 4

## 🌟 Features

### For Customers
- 🔍 **Browse Restaurants** - Discover local Cameroonian restaurants
- 🍽️ **View Menus** - Explore authentic dishes with detailed descriptions
- 🛒 **Shopping Cart** - Add items and manage your order
- 📱 **Responsive Design** - Seamless experience on mobile and desktop
- 🔐 **User Authentication** - Secure login with OTP verification
- 📦 **Order Tracking** - Real-time order status updates
- ⭐ **Ratings & Reviews** - Share your dining experience

### For Restaurants
- 📊 **Dashboard** - Manage menu items and orders
- 🖼️ **Media Management** - Upload dish images
- 📈 **Analytics** - Track ratings and customer feedback

---

## 🚀 Live Demo

- **Frontend**: [https://mboa-command.vercel.app](https://mboa-command.vercel.app)
- **API**: [https://mboa-command-api.onrender.com/api](https://mboa-command-api.onrender.com/api)
- **Health Check**: [API Status](https://mboa-command-api.onrender.com/api/health)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer (OTP verification)
- **CORS**: Enabled for Vercel deployments

### DevOps & Hosting
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Supabase (PostgreSQL)
- **Version Control**: Git + GitHub
- **CI/CD**: Automatic deployments on push

---

## 📁 Project Structure

```
mboa-command/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React Context providers
│   │   ├── lib/             # Utilities and helpers
│   │   └── App.tsx          # Main app component
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express.js API server
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── restaurants.js   # Restaurant CRUD
│   │   ├── menu.js          # Menu items
│   │   ├── orders.js        # Order management
│   │   ├── categories.js    # Food categories
│   │   └── users.js         # User management
│   ├── database/            # Database layer
│   │   ├── db.js            # DB connection router
│   │   ├── postgres.js      # PostgreSQL adapter
│   │   └── db-sqlite.js     # SQLite adapter (dev)
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT verification
│   ├── utils/               # Helper functions
│   ├── server.js            # Express app entry point
│   └── package.json
│
├── STATUS.md                # System status documentation
├── test-integration.md      # Integration test results
└── README.md                # This file
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or use Supabase)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PAULAUGUSTE25/mboa-command.git
   cd mboa-command
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   DATABASE_URL=postgresql://user:password@host:5432/database
   
   # Email (Optional - for OTP)
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend** (`frontend/.env.development`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Initialize Database**
   ```bash
   cd backend
   npm start
   # Database will auto-initialize with seed data
   ```

6. **Start Development Servers**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open the App**
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP code

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/featured` - Get featured restaurants
- `GET /api/restaurants/category/:slug` - Filter by category

### Menu
- `GET /api/menu/restaurant/:id` - Get restaurant menu
- `GET /api/menu/item/:id` - Get menu item details
- `GET /api/menu/featured` - Get featured dishes

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

### Categories
- `GET /api/categories` - List all food categories

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile

---

## 🗄️ Database Schema

### Main Tables
- **users** - Customer and admin accounts
- **categories** - Food categories (Camerounais, Grillades, etc.)
- **restaurants** - Restaurant information
- **menu_categories** - Menu sections per restaurant
- **menu_items** - Individual dishes
- **orders** - Customer orders
- **order_items** - Items in each order
- **favorites** - User saved restaurants/dishes
- **reviews** - Restaurant ratings and comments
- **otp_codes** - Email verification codes

---

## 🎨 Design Features

- **Dark Theme** - Modern dark UI with lime green accents
- **Mobile-First** - Optimized for mobile devices
- **Smooth Animations** - Framer Motion transitions
- **Responsive Images** - Optimized loading with lazy loading
- **Bottom Navigation** - Easy mobile navigation
- **Search & Filters** - Find restaurants and dishes quickly

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- OTP email verification
- CORS protection
- SQL injection prevention (parameterized queries)
- Environment variable protection

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set environment variable: `VITE_API_URL`
4. Deploy automatically on push

### Backend (Render)
1. Create Web Service on Render
2. Connect GitHub repository
3. Set environment variables (see `render.yaml`)
4. Deploy automatically on push

### Database (Supabase)
1. Create project on Supabase
2. Copy connection string
3. Add to `DATABASE_URL` environment variable

---

## 📊 Performance

- **Frontend**: Lighthouse score 90+
- **Backend**: Response time < 200ms
- **Database**: Connection pooling enabled
- **CDN**: Static assets via Vercel Edge Network

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Paul Auguste**
- GitHub: [@PAULAUGUSTE25](https://github.com/PAULAUGUSTE25)
- Project: [MBOA Command](https://github.com/PAULAUGUSTE25/mboa-command)

---

## 🙏 Acknowledgments

- Cameroonian cuisine inspiration
- shadcn/ui for beautiful components
- Vercel for hosting
- Supabase for database
- The open-source community

---

## 📞 Support

For support, email support@mboa-command.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Payment integration (Mobile Money, Orange Money)
- [ ] Real-time order tracking with maps
- [ ] Push notifications
- [ ] Restaurant owner dashboard
- [ ] Delivery driver app
- [ ] Multi-language support (French/English)
- [ ] Loyalty program
- [ ] Referral system

---

**Made with ❤️ in Cameroon 🇨🇲**
