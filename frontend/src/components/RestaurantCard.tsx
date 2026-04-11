import { Star, Clock, Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  category_name?: string;
  category_icon?: string;
  rating: number;
  rating_count: number;
  delivery_time: string;
  delivery_fee: number;
  city: string;
  is_open: number;
  promo_text?: string;
  description?: string;
}

interface Props {
  restaurant: Restaurant;
  variant?: 'default' | 'compact' | 'featured';
}

export default function RestaurantCard({ restaurant, variant = 'default' }: Props) {
  const navigate = useNavigate();

  /* ── Featured horizontal card ── */
  if (variant === 'featured') {
    return (
      <motion.div
        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        whileHover={{ scale: 1.03, borderColor: 'rgba(168,255,62,0.4)' }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="min-w-[260px] rounded-3xl overflow-hidden cursor-pointer group bg-[#161920] border border-[#2A2D3A]"
      >
        <div className="relative h-[140px] overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {!restaurant.is_open && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-[#161920] text-[#9CA3AF] text-xs font-bold px-4 py-1.5 rounded-full border border-[#2A2D3A]">Fermé</span>
            </div>
          )}

          {restaurant.promo_text && (
            <div className="absolute top-2.5 left-2.5 bg-primary text-black text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
              PROMO
            </div>
          )}

          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star size={10} fill="#A8FF3E" className="text-primary" />
            <span className="text-white text-[11px] font-bold">{restaurant.rating}</span>
            <span className="text-[#6B7280] text-[10px]">({restaurant.rating_count})</span>
          </div>
        </div>

        <div className="p-3.5">
          <h3 className="text-white font-extrabold text-sm truncate">{restaurant.name}</h3>
          <p className="text-[#6B7280] text-[11px] mt-0.5 truncate leading-tight">{restaurant.description}</p>
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center gap-1 text-[#6B7280]">
              <Clock size={11} />
              <span className="text-[11px]">{restaurant.delivery_time}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Bike size={11} />
              <span className="text-[11px] font-semibold">
                {restaurant.delivery_fee === 0 ? 'Gratuit' : `${restaurant.delivery_fee} F`}
              </span>
            </div>
            {restaurant.category_icon && (
              <span className="ml-auto text-[11px] text-[#6B7280]">
                {restaurant.category_icon} {restaurant.category_name}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Default list card ── */
  return (
    <motion.div
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      whileHover={{ scale: 1.015, borderColor: 'rgba(168,255,62,0.3)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="flex gap-3.5 bg-[#161920] rounded-2xl p-3.5 border border-[#2A2D3A] cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative w-[80px] h-[80px] rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
            <span className="text-white text-[9px] font-black uppercase tracking-wider">Fermé</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-extrabold text-sm truncate leading-tight">{restaurant.name}</h3>
          {restaurant.promo_text && (
            <span className="bg-primary/15 text-primary text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 border border-primary/25">
              PROMO
            </span>
          )}
        </div>

        <p className="text-[#6B7280] text-[11px] mt-0.5 truncate">
          {restaurant.category_icon} {restaurant.category_name}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={11} fill="#A8FF3E" className="text-primary" />
            <span className="text-white text-[11px] font-bold">{restaurant.rating}</span>
            <span className="text-[#6B7280] text-[10px]">({restaurant.rating_count})</span>
          </div>

          <div className="flex items-center gap-1 text-[#6B7280]">
            <Clock size={10} />
            <span className="text-[11px]">{restaurant.delivery_time}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          <Bike size={11} className="text-primary" />
          <span className="text-primary text-[11px] font-semibold">
            {restaurant.delivery_fee === 0 ? 'Livraison gratuite' : `${restaurant.delivery_fee} FCFA`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
