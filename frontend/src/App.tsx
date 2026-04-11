import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import BottomNav from './components/BottomNav';

import SplashPage from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import TrackingPage from './pages/TrackingPage';
import ProfilePage from './pages/ProfilePage';
import OTPPage from './pages/OTPPage';

const SHOW_NAV = ['/home', '/explore', '/cart', '/profile'];

function AppLayout() {
  const path = window.location.pathname;
  const showNav = SHOW_NAV.some(p => path.startsWith(p));

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-dark relative overflow-hidden md:shadow-[0_0_80px_rgba(0,0,0,0.9)] md:border-x md:border-white/5">
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/tracking/:id" element={<TrackingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1E2D24',
                color: '#E8F5E9',
                border: '1px solid #2D4A36',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: { primary: '#A8FF3E', secondary: '#0D1F14' },
              },
              error: {
                iconTheme: { primary: '#FF6B6B', secondary: '#FFF' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
