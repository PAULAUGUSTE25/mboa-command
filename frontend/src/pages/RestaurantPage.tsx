import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Bike, MapPin, Plus, Minus, Heart, Share2, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantsAPI } from '../lib/api';
import { useCart } from '../context/CartContext';

interface MenuItem {
  id: string; name: string; description: string; price: number; image: string;
  is_featured: number; is_spicy: number; calories?: number; prep_time?: string; tags?: string;
}
interface MenuCategory { id: number; name: string; items: MenuItem[]; }
interface Restaurant {
  id: string; name: string; description: string; image: string; cover_image: string;
  category_name: string; category_icon: string; rating: number; rating_count: number;
  delivery_time: string; delivery_fee: number; min_order: number; city: string; address: string;
  phone: string; is_open: number; promo_text?: string; menu: MenuCategory[];
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, getItemQuantity, itemCount, total } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    restaurantsAPI.getById(id).then(res => {
      setRestaurant(res.data);
      if (res.data.menu?.length > 0) setActiveTab(res.data.menu[0].id);
    }).catch(() => {
      toast.error('Restaurant non trouvé');
      navigate('/home');
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">🍽️</div>
        <p className="text-[#6B7280]">Chargement...</p>
      </div>
    </div>
  );

  if (!restaurant) return null;

  const allItems = restaurant.menu?.flatMap(cat => cat.items) || [];
  const activeItems = activeTab
    ? restaurant.menu?.find(cat => cat.id === activeTab)?.items || []
    : allItems;

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-32">

      {/* ── Cover Image ── */}
      <div className="relative h-64">
        <img src={restaurant.cover_image || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-black/40 to-transparent" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 pt-12">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setLiked(l => !l)}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : 'text-white'} />
            </button>
            <button className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Share2 size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Open/Closed Badge */}
        <div className="absolute bottom-4 left-5">
          <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold ${
            restaurant.is_open
              ? 'bg-primary text-black shadow-[0_2px_12px_rgba(168,255,62,0.4)]'
              : 'bg-[#2A2D3A] text-[#9CA3AF]'
          }`}>
            {restaurant.is_open ? '● Ouvert' : '● Fermé'}
          </span>
        </div>
      </div>

      {/* ── Info Section ── */}
      <div className="px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl font-extrabold leading-tight">{restaurant.name}</h1>
            <p className="text-[#6B7280] text-sm mt-1">{restaurant.category_icon} {restaurant.category_name}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#161920] rounded-2xl px-3 py-2 border border-[#2A2D3A] flex-shrink-0">
            <Star size={13} fill="#A8FF3E" className="text-primary" />
            <span className="text-white font-extrabold text-sm">{restaurant.rating}</span>
            <span className="text-[#6B7280] text-xs">({restaurant.rating_count})</span>
          </div>
        </div>

        <p className="text-[#9CA3AF] text-sm mt-2.5 leading-relaxed">{restaurant.description}</p>

        {/* Stats Row */}
        <div className="flex gap-3 mt-4 pb-4 border-b border-[#2A2D3A]">
          {[
            { icon: Clock,  val: restaurant.delivery_time,                                                label: 'Livraison' },
            { icon: Bike,   val: restaurant.delivery_fee === 0 ? 'Gratuit' : `${restaurant.delivery_fee} F`, label: 'Frais livr.' },
            { icon: MapPin, val: restaurant.city,                                                        label: restaurant.address },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{val}</p>
                <p className="text-[#6B7280] text-[10px] truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Banner */}
        {restaurant.promo_text && (
          <div className="bg-primary/10 border border-primary/25 rounded-2xl p-3 mt-4 flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <p className="text-primary text-sm font-bold">{restaurant.promo_text}</p>
          </div>
        )}
      </div>

      {/* ── Menu Category Tabs ── */}
      {restaurant.menu && restaurant.menu.length > 0 && (
        <div className="mt-5 sticky top-0 bg-[#0B0C10]/95 backdrop-blur-md z-30 px-5 pb-3 border-b border-[#2A2D3A]">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab(null)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === null
                  ? 'bg-primary text-black shadow-[0_2px_10px_rgba(168,255,62,0.35)]'
                  : 'bg-[#161920] text-[#9CA3AF] border border-[#2A2D3A]'
              }`}>
              Tout
            </button>
            {restaurant.menu.map(cat => (
              <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === cat.id
                    ? 'bg-primary text-black shadow-[0_2px_10px_rgba(168,255,62,0.35)]'
                    : 'bg-[#161920] text-[#9CA3AF] border border-[#2A2D3A]'
                }`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Menu Items ── */}
      <div className="px-5 mt-4 space-y-3 pb-4">
        {activeItems.map(item => {
          const qty = getItemQuantity(item.id);
          return (
            <div key={item.id}
              className="bg-[#161920] rounded-2xl border border-[#2A2D3A] flex gap-3 p-3 hover:border-primary/30 transition-all">
              <div className="relative w-[88px] h-[88px] rounded-2xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {item.is_featured ? (
                  <span className="absolute top-1.5 left-1.5 bg-primary text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">⭐</span>
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-extrabold text-sm leading-tight">{item.name}</h3>
                <div className="flex gap-2 mt-0.5">
                  {item.is_spicy ? (
                    <span className="flex items-center gap-0.5 text-[9px] text-red-400 font-semibold">
                      <Flame size={9} />Épicé
                    </span>
                  ) : null}
                  {item.calories ? (
                    <span className="text-[#4B5060] text-[9px]">{item.calories} kcal</span>
                  ) : null}
                </div>
                <p className="text-[#6B7280] text-[11px] mt-1 line-clamp-2 leading-tight">{item.description}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-primary font-extrabold text-sm">{item.price.toLocaleString()} FCFA</span>
                  <div className="flex items-center gap-2">
                    {qty > 0 && (
                      <button
                        onClick={() => toast('🛒 Gérez le panier depuis l’icône panier')}
                        className="w-7 h-7 bg-[#1E2130] border border-[#2A2D3A] rounded-xl flex items-center justify-center">
                        <Minus size={12} className="text-white" />
                      </button>
                    )}
                    {qty > 0 && (
                      <span className="text-white font-extrabold text-sm w-5 text-center">{qty}</span>
                    )}
                    <button
                      onClick={() => {
                        if (!restaurant.is_open) { toast.error('Ce restaurant est fermé'); return; }
                        addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          restaurantId: restaurant.id,
                          restaurantName: restaurant.name,
                        });
                        toast.success(`${item.name} ajouté!`, { icon: '✅', duration: 1200 });
                      }}
                      className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(168,255,62,0.4)] active:scale-90 transition-transform">
                      <Plus size={16} className="text-black" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Floating Cart CTA ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 z-40">
          <button onClick={() => navigate('/cart')}
            className="w-full bg-primary text-black font-extrabold py-4 rounded-2xl flex items-center justify-between px-5 shadow-[0_8px_32px_rgba(168,255,62,0.45)] active:scale-[0.98] transition-all">
            <span className="bg-black/20 text-black text-xs font-black w-7 h-7 rounded-xl flex items-center justify-center">{itemCount}</span>
            <span className="text-base">Voir mon panier</span>
            <span className="font-black text-base">{total.toLocaleString()} F</span>
          </button>
        </div>
      )}
    </div>
  );
}
