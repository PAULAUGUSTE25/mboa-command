import { Home, Search, ShoppingBag, User, UtensilsCrossed } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const getNavItems = (t: any) => [
  { icon: Home,            label: t('common.home'),    path: '/home' },
  { icon: Search,          label: t('common.explore'), path: '/explore' },
  { icon: UtensilsCrossed, label: t('common.dishes'),  path: '/explore?tab=dishes' },
  { icon: ShoppingBag,     label: t('common.cart'),    path: '/cart' },
  { icon: User,            label: t('common.profile'), path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { itemCount } = useCart();
  const navItems = getNavItems(t);

  const hiddenRoutes = ['/', '/login', '/register', '/onboarding', '/otp'];
  const hiddenPrefixes = ['/tracking'];
  if (hiddenRoutes.includes(location.pathname)) return null;
  if (hiddenPrefixes.some(p => location.pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0C10] to-transparent pointer-events-none" />

      <div className="relative px-4 pb-5 pt-2 max-w-7xl mx-auto">
        <div className="bg-[#161920]/95 backdrop-blur-xl border border-[#2A2D3A] rounded-[28px] px-2 py-2 flex items-center justify-around shadow-[0_8px_32px_rgba(0,0,0,0.6)] md:max-w-2xl md:mx-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const basePath = path.split('?')[0];
            const isActive = location.pathname === basePath;
            const isCart   = path === '/cart';

            return (
              <motion.button
                key={path}
                onClick={() => navigate(path)}
                whileTap={{ scale: 0.82 }}
                className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl relative"
              >
                <div className="relative">
                  {/* Animated active pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-bg"
                        className="absolute -inset-2 bg-primary/15 rounded-xl"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      color: isActive ? '#A8FF3E' : '#6B7280',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  {/* Cart badge */}
                  <AnimatePresence>
                    {isCart && itemCount > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center z-20 shadow-[0_0_8px_rgba(168,255,62,0.9)]"
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <motion.span
                  animate={{ color: isActive ? '#A8FF3E' : '#4B5060' }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] font-bold"
                >
                  {label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
