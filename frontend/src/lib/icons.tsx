import {
  Soup, Beef, Fish, Leaf, Drumstick, Sandwich, Pizza, Coffee,
  Wheat, FlameKindling, Utensils,
  Smartphone, CircleDollarSign, Banknote, CreditCard,
  Package, TrendingDown, Star, Zap, ShieldCheck, Clock, Bike,
  Home, Search, ShoppingBag, User, UtensilsCrossed,
  Gift, Trophy, Flame,
} from 'lucide-react';
import { type LucideProps } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Category icons  — maps category names to lucide icons
───────────────────────────────────────────────────────── */
const CATEGORY_MAP: Record<string, React.FC<LucideProps>> = {
  'Plats traditionnels': Soup,
  'Viandes & Grillades': Beef,
  'Poissons & Fruits de mer': Fish,
  'Végétarien': Leaf,
  'Poulet': Drumstick,
  'Sandwichs & Burgers': Sandwich,
  'Pizza & Fast-food': Pizza,
  'Boissons': Coffee,
  'Féculents': Wheat,
  'Sauces & Épices': FlameKindling,
  default: Utensils,
};

export function getCategoryIcon(name: string): React.FC<LucideProps> {
  return CATEGORY_MAP[name] ?? CATEGORY_MAP.default;
}

/* ─────────────────────────────────────────────────────────
   Payment method icons
───────────────────────────────────────────────────────── */
export const PAYMENT_ICONS: Record<string, React.FC<LucideProps>> = {
  mtn_momo:     Smartphone,
  orange_money: CircleDollarSign,
  cash:         Banknote,
  card:         CreditCard,
};

export const PAYMENT_COLORS: Record<string, string> = {
  mtn_momo:     'text-yellow-400',
  orange_money: 'text-orange-400',
  cash:         'text-emerald-400',
  card:         'text-blue-400',
};

export const PAYMENT_BG: Record<string, string> = {
  mtn_momo:     'bg-yellow-400/10',
  orange_money: 'bg-orange-400/10',
  cash:         'bg-emerald-400/10',
  card:         'bg-blue-400/10',
};

/* ─────────────────────────────────────────────────────────
   Profile stats icons
───────────────────────────────────────────────────────── */
export const STAT_ICONS = {
  orders:   Package,
  savings:  TrendingDown,
  points:   Star,
  speed:    Zap,
  trust:    ShieldCheck,
  delivery: Bike,
  time:     Clock,
  gift:     Gift,
  rank:     Trophy,
  spicy:    Flame,
};

/* ─────────────────────────────────────────────────────────
   Re-exports for convenience
───────────────────────────────────────────────────────── */
export {
  Home, Search, ShoppingBag, User, UtensilsCrossed,
  Utensils, Zap, ShieldCheck, Star, Package, Gift, Trophy,
};
