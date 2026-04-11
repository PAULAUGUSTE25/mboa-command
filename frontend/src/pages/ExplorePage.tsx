import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, SlidersHorizontal, Star, Clock } from 'lucide-react';
import { restaurantsAPI, menuAPI } from '../lib/api';
import RestaurantCard from '../components/RestaurantCard';

interface Restaurant { id: string; name: string; image: string; cover_image?: string; category_name?: string; category_icon?: string; rating: number; rating_count: number; delivery_time: string; delivery_fee: number; city: string; is_open: number; promo_text?: string; description?: string; }
interface MenuItem { id: string; name: string; price: number; image: string; restaurant_name: string; restaurant_id: string; rating: number; delivery_time: string; is_spicy?: number; }

const SORT_OPTIONS = [
  { key: 'rating', label: '⭐ Note' },
  { key: 'delivery_time', label: '⚡ Rapidité' },
  { key: 'delivery_fee', label: '💰 Frais livr.' },
];

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'restaurants' | 'dishes'>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length > 0) {
        search();
      } else {
        loadAll();
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [restRes, dishRes] = await Promise.all([
        restaurantsAPI.getAll({}),
        menuAPI.getFeatured({ limit: 20 }),
      ]);
      setRestaurants(restRes.data.data);
      setDishes(dishRes.data.data);
    } catch {
      setRestaurants([]);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    setLoading(true);
    try {
      const [restRes, dishRes] = await Promise.all([
        restaurantsAPI.getAll({ search: query }),
        menuAPI.search(query),
      ]);
      setRestaurants(restRes.data.data);
      setDishes(dishRes.data.data);
    } catch {
      setRestaurants([]);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'delivery_fee') return a.delivery_fee - b.delivery_fee;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-28">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/5 px-5 pt-12 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-extrabold text-xl tracking-tight">Explorer</h1>
          <span className="text-[#6B7280] text-sm">{sortedRestaurants.length} résultats</span>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5060]" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ndolé, Soya, Poulet DG..."
              className="w-full bg-[#161920] border-2 border-[#2A2D3A] rounded-2xl pl-11 pr-10 py-3.5 text-white placeholder:text-[#4B5060] focus:outline-none focus:border-primary transition-all text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-[#2A2D3A] rounded-full">
                <X size={14} className="text-[#9CA3AF]" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowSort(s => !s)}
            className={`w-[50px] h-[50px] rounded-2xl flex items-center justify-center border-2 transition-all ${showSort ? 'bg-primary border-primary' : 'bg-[#161920] border-[#2A2D3A]'}`}>
            <SlidersHorizontal size={18} className={showSort ? 'text-black' : 'text-[#9CA3AF]'} />
          </button>
        </div>

        {/* Sort Pills */}
        {showSort && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => { setSortBy(opt.key); setShowSort(false); }}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  sortBy === opt.key ? 'bg-primary text-black shadow-[0_2px_8px_rgba(168,255,62,0.4)]' : 'bg-[#161920] text-[#9CA3AF] border border-[#2A2D3A]'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-[#161920] rounded-2xl p-1 border border-[#2A2D3A]">
          <button onClick={() => setTab('restaurants')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'restaurants' ? 'bg-primary text-black shadow-[0_2px_8px_rgba(168,255,62,0.3)]' : 'text-[#6B7280]'
            }`}>
            Restaurants ({sortedRestaurants.length})
          </button>
          <button onClick={() => setTab('dishes')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === 'dishes' ? 'bg-primary text-black shadow-[0_2px_8px_rgba(168,255,62,0.3)]' : 'text-[#6B7280]'
            }`}>
            Plats ({dishes.length})
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[88px] bg-[#161920] rounded-2xl animate-pulse border border-[#2A2D3A]" />
            ))}
          </div>
        ) : tab === 'restaurants' ? (
          <div className="space-y-3">
            {sortedRestaurants.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#161920] rounded-full flex items-center justify-center text-3xl border border-[#2A2D3A]">🔍</div>
                <p className="text-white font-bold">Aucun restaurant trouvé</p>
                <p className="text-[#6B7280] text-sm">Essayez un autre mot-clé</p>
              </div>
            ) : sortedRestaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {dishes.length === 0 ? (
              <div className="col-span-2 text-center py-20 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#161920] rounded-full flex items-center justify-center text-3xl border border-[#2A2D3A]">🍽️</div>
                <p className="text-white font-bold">Aucun plat trouvé</p>
                <p className="text-[#6B7280] text-sm">Essayez un autre mot-clé</p>
              </div>
            ) : dishes.map(dish => (
              <div key={dish.id} onClick={() => navigate(`/restaurant/${dish.restaurant_id}`)}
                className="bg-[#161920] rounded-2xl overflow-hidden cursor-pointer border border-[#2A2D3A] hover:border-primary/40 active:scale-[0.97] transition-all">
                <div className="relative h-[120px] overflow-hidden">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {dish.is_spicy && (
                    <span className="absolute top-2 left-2 bg-[#EF4444]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">🌶</span>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                    <Star size={9} fill="#A8FF3E" className="text-primary" />
                    <span className="text-white text-[10px] font-bold">{dish.rating || '4.5'}</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-white font-extrabold text-xs truncate leading-tight">{dish.name}</p>
                  <p className="text-[#6B7280] text-[10px] truncate mt-0.5">{dish.restaurant_name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-extrabold text-xs">{dish.price.toLocaleString()} F</span>
                    <div className="flex items-center gap-0.5 text-[#6B7280]">
                      <Clock size={9} />
                      <span className="text-[10px]">{dish.delivery_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
