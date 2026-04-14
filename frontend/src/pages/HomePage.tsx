import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, ChevronDown, Search, Star, Clock, ArrowRight, Flame, Zap, Utensils, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { restaurantsAPI, menuAPI, categoriesAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from '../components/RestaurantCard';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LocationPermission from '../components/LocationPermission';
import { getCategoryIcon } from '../lib/icons';
import { staggerContainer, fadeSlideUp, scalePop } from '../components/PageTransition';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda'];

interface Category { id: number; name: string; icon: string; slug: string; }
interface Restaurant { id: string; name: string; image: string; cover_image?: string; category_name?: string; category_icon?: string; category_slug?: string; rating: number; rating_count: number; delivery_time: string; delivery_fee: number; city: string; is_open: number; is_featured: number; promo_text?: string; description?: string; }
interface MenuItem { id: string; name: string; price: number; image: string; restaurant_name: string; rating: number; delivery_time: string; delivery_fee: number; restaurant_id: string; is_spicy?: number; calories?: number; }

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [city, setCity] = useState(user?.city || 'Yaoundé');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, restRes, featRes] = await Promise.all([
          categoriesAPI.getAll(),
          restaurantsAPI.getAll({ city }),
          menuAPI.getFeatured({ limit: 8 }),
        ]);
        setCategories(catRes.data.data);
        setRestaurants(restRes.data.data);
        setFeaturedItems(featRes.data.data);
      } catch {
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [city]);

  const filteredRestaurants = activeCategory === 'all'
    ? restaurants
    : restaurants.filter(r => r.category_slug === activeCategory);

  const firstName = user?.name?.split(' ')[0] || 'vous';

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-28">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-5 pt-12 pb-3 max-w-7xl mx-auto">

          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {/* App logo small */}
              <img
                src="/images/app logo.png"
                alt="Mboa Command"
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
              <div>
                <p className="text-[#6B7280] text-xs font-medium">{t('home.greeting')}, {firstName}</p>
                <button
                  onClick={() => setShowCityPicker(s => !s)}
                  className="flex items-center gap-1.5 mt-0.5"
                >
                  <MapPin size={13} className="text-primary" />
                  <span className="text-white font-bold text-[16px] leading-tight">{city}</span>
                  <ChevronDown size={13} className={`text-primary transition-transform duration-200 ${showCityPicker ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button className="relative w-11 h-11 bg-[#161920] rounded-2xl flex items-center justify-center border border-[#2A2D3A]">
                <Bell size={19} className="text-[#9CA3AF]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#0B0C10] pulse-glow" />
              </button>
            </div>
          </div>

          {/* City Picker */}
          {showCityPicker && (
            <div className="absolute top-full left-5 right-5 bg-[#161920] border border-[#2A2D3A] rounded-2xl overflow-hidden shadow-2xl z-50 mt-1">
              {CITIES.map(c => (
                <button key={c} onClick={() => { setCity(c); setShowCityPicker(false); }}
                  className={`w-full px-4 py-3.5 text-left flex items-center gap-2.5 transition-colors ${c === city ? 'bg-primary/10 text-primary font-bold' : 'text-[#9CA3AF] hover:bg-white/5'}`}>
                  <MapPin size={14} />
                  <span className="text-sm">{c}</span>
                  {c === city && <span className="ml-auto text-primary text-xs font-black">✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Search bar */}
          <button
            onClick={() => navigate('/explore')}
            className="w-full bg-[#161920] border border-[#2A2D3A] rounded-2xl flex items-center gap-3 px-4 py-3.5 hover:border-primary/40 transition-colors"
          >
            <Search size={17} className="text-[#4B5060]" />
            <span className="text-[#4B5060] text-sm">{t('home.searchPlaceholder')}</span>
            <span className="ml-auto bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-lg">{t('common.search')}</span>
          </button>
        </div>
      </div>

      <motion.div
        className="px-5 pt-5 space-y-7 max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >

        {/* ── Promo Hero Banner ── */}
        <motion.div variants={scalePop}>
          <motion.div
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => navigate('/explore')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{ height: 160 }}
          >
            <img src="/images/commande .jpg" alt="Promo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-2">
                <motion.span
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-primary text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1"
                >
                  <Sparkles size={10} /> {t('home.promoLabel')}
                </motion.span>
              </div>
              <h2 className="text-white font-extrabold text-[22px] leading-tight whitespace-pre-line">
                {t('home.promoTitle')}
              </h2>
              <p className="text-white/60 text-xs mt-1 mb-3">{t('home.promoCode')} <span className="text-primary font-bold">{t('home.promoCodeValue')}</span></p>
              <div className="flex items-center gap-1 text-primary text-sm font-bold">
                {t('home.promoCta')} <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Quick Stats Row ── */}
        <motion.div variants={fadeSlideUp} className="grid grid-cols-3 gap-3">
          {[
            { Icon: Zap,   value: '30 min',               label: t('home.quickDelivery'), color: 'text-primary' },
            { Icon: Star,  value: '4.8',                  label: t('home.avgRating'),     color: 'text-primary', fill: '#A8FF3E' },
            { Icon: CheckCircle2, value: `${restaurants.length}+`, label: t('home.activeRestaurants'), color: 'text-primary' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
              className="bg-[#161920] rounded-2xl p-3 border border-[#2A2D3A] flex flex-col items-center gap-1"
            >
              <s.Icon size={16} className={s.color} fill={s.fill} />
              <span className="text-white font-extrabold text-base leading-none">{s.value}</span>
              <span className="text-[#6B7280] text-[10px] text-center leading-tight">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Categories ── */}
        <motion.div variants={fadeSlideUp}>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-white font-extrabold text-lg">{t('home.categories')}</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {/* All button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveCategory('all')}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                activeCategory === 'all' ? 'bg-primary/15 border-2 border-primary' : 'bg-[#161920] border-2 border-[#2A2D3A]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeCategory === 'all' ? 'bg-primary/20' : 'bg-white/5'
              }`}>
                <Utensils size={20} className={activeCategory === 'all' ? 'text-primary' : 'text-[#9CA3AF]'} />
              </div>
              <span className={`text-xs font-bold ${
                activeCategory === 'all' ? 'text-primary' : 'text-white'
              }`}>{t('home.allCategories')}</span>
            </motion.button>

            {categories.map(cat => {
              const CatIcon = getCategoryIcon(cat.name);
              const isActive = activeCategory === cat.slug;
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    isActive ? 'bg-primary/15 border-2 border-primary' : 'bg-[#161920] border-2 border-[#2A2D3A]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-primary/20' : 'bg-white/5'
                  }`}>
                    <CatIcon size={20} />
                  </div>
                  <span className={`text-xs font-bold ${
                    isActive ? 'text-primary' : 'text-white'
                  }`}>{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Featured Restaurants ── */}
        {restaurants.filter(r => r.is_featured).length > 0 && (
          <motion.div variants={fadeSlideUp}>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-white font-extrabold text-[17px]">{t('home.featuredRestaurants')}</h2>
                <p className="text-[#6B7280] text-xs mt-0.5">{t('home.featuredRestaurantsSubtitle')}</p>
              </div>
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => navigate('/explore')}
                className="flex items-center gap-1 text-primary text-sm font-bold">
                {t('home.seeAll')} <ArrowRight size={14} />
              </motion.button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {restaurants.filter(r => r.is_featured).map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
                >
                  <RestaurantCard restaurant={r} variant="featured" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Popular Dishes ── */}
        {featuredItems.length > 0 && (
          <motion.div variants={fadeSlideUp}>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-white font-extrabold text-[17px]">{t('home.popularDishes')}</h2>
                <p className="text-[#6B7280] text-xs mt-0.5">{t('home.popularDishesSubtitle')}</p>
              </div>
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => navigate('/explore?tab=dishes')}
                className="flex items-center gap-1 text-primary text-sm font-bold">
                {t('home.seeAll')} <ArrowRight size={14} />
              </motion.button>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/restaurant/${item.restaurant_id}`)}
                  className="min-w-[155px] bg-[#161920] rounded-2xl overflow-hidden cursor-pointer border border-[#2A2D3A]"
                >
                  <div className="relative h-[110px] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {item.is_spicy ? (
                      <span className="absolute top-2 left-2 bg-[#EF4444]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Flame size={9} /> Épicé
                      </span>
                    ) : null}
                    <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                      <Star size={9} fill="#A8FF3E" className="text-primary" />
                      <span className="text-white text-[10px] font-bold">{item.rating}</span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-white font-bold text-xs truncate leading-tight">{item.name}</p>
                    <p className="text-[#6B7280] text-[10px] truncate mt-0.5">{item.restaurant_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary font-extrabold text-xs">{item.price.toLocaleString()} F</span>
                      <div className="flex items-center gap-0.5 text-[#6B7280]">
                        <Clock size={9} />
                        <span className="text-[10px]">{item.delivery_time}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── All Restaurants ── */}
        <motion.div variants={fadeSlideUp}>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-white font-extrabold text-[17px]">{t('home.allRestaurants')}</h2>
              <p className="text-[#6B7280] text-xs mt-0.5">{filteredRestaurants.length} {t('home.availableIn')} {city}</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.15 }}
                  className="h-[90px] bg-[#161920] rounded-2xl border border-[#2A2D3A]"
                />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-[#161920] rounded-full flex items-center justify-center border border-[#2A2D3A]">
                <Utensils size={28} className="text-[#2A2D3A]" />
              </div>
              <p className="text-white font-bold">{t('home.noRestaurants')}</p>
              <p className="text-[#6B7280] text-sm">{t('home.startBackend')}</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {filteredRestaurants.map(r => (
                <motion.div key={r.id} variants={fadeSlideUp}>
                  <RestaurantCard restaurant={r} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ── Cuisine Banner ── */}
        <motion.div variants={scalePop} className="relative rounded-3xl overflow-hidden">
          <img src="/images/eru-fufu.jpg" alt="Cuisine" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
          <div className="absolute inset-0 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 size={14} className="text-primary" />
              <h3 className="text-white font-extrabold text-base">Cuisine 100% Camerounaise</h3>
            </div>
            <p className="text-white/60 text-xs mt-0.5">Ndolé · Eru · Soya · Achu · Kondre</p>
            <div className="flex gap-1.5 mt-2.5">
              {['Yaoundé', 'Douala', 'Bafoussam'].map(c => (
                <span key={c} className="bg-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/30">{c}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
