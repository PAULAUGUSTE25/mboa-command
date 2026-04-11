import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, MapPin, CreditCard, Smartphone, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../lib/api';
import { PAYMENT_ICONS, PAYMENT_COLORS, PAYMENT_BG } from '../lib/icons';
import { staggerContainer, fadeSlideUp } from '../components/PageTransition';

const PAYMENT_METHODS = [
  { id: 'mtn_momo',     label: 'MTN Mobile Money',    sublabel: 'Paiement rapide' },
  { id: 'orange_money', label: 'Orange Money',         sublabel: 'Paiement mobile' },
  { id: 'cash',         label: 'Espèces',               sublabel: 'À la livraison' },
  { id: 'card',         label: 'Carte bancaire',       sublabel: 'Visa / Mastercard' },
];

export default function CartPage() {
  const navigate = useNavigate();
  const { items, restaurantName, total, delivery_fee, updateQuantity, removeItem, clearCart } = useCart() as ReturnType<typeof useCart> & { delivery_fee?: number };
  const { isAuthenticated } = useAuth();
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('mtn_momo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { restaurantId } = useCart();

  const deliveryFee = 500;
  const grandTotal = total + deliveryFee;

  const handleOrder = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!address.trim()) { toast.error('Entrez votre adresse de livraison'); return; }
    if (items.length === 0) { toast.error('Votre panier est vide'); return; }
    setLoading(true);
    try {
      const res = await ordersAPI.create({
        restaurant_id: restaurantId!,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        delivery_address: address,
        delivery_city: 'Yaoundé',
        payment_method: payment,
        notes,
      });
      clearCart();
      toast.success('Commande passée avec succès! 🎉');
      navigate(`/tracking/${res.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center px-5 gap-4">
        <div className="w-24 h-24 bg-[#161920] rounded-full flex items-center justify-center text-5xl border border-[#2A2D3A]">🛒</div>
        <h2 className="text-white font-extrabold text-xl">Panier vide</h2>
        <p className="text-[#6B7280] text-center text-sm">Ajoutez des plats délicieux de vos restaurants préférés</p>
        <button onClick={() => navigate('/home')}
          className="bg-primary text-black font-extrabold px-10 py-4 rounded-2xl shadow-[0_4px_20px_rgba(168,255,62,0.35)] mt-2">
          Découvrir les restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-28">

      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4 bg-[#0B0C10]/95 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 bg-[#161920] rounded-2xl flex items-center justify-center border border-[#2A2D3A]">
            <ArrowLeft size={18} className="text-[#9CA3AF]" />
          </button>
          <div>
            <h1 className="text-white font-extrabold text-lg">Mon Panier</h1>
            <p className="text-[#6B7280] text-xs">{restaurantName}</p>
          </div>
          <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
            {items.length} article{items.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">

        {/* ── Items ── */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show"
          className="bg-[#161920] rounded-2xl border border-[#2A2D3A] overflow-hidden">
          {items.map((item, i) => (
            <div key={item.id} className={`flex gap-3.5 p-4 ${i < items.length - 1 ? 'border-b border-[#2A2D3A]' : ''}`}>
              <img src={item.image} alt={item.name} className="w-[68px] h-[68px] rounded-2xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-extrabold text-sm truncate leading-tight">{item.name}</h3>
                <p className="text-primary font-bold text-sm mt-0.5">{item.price.toLocaleString()} F</p>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1.5 bg-[#0B0C10] rounded-2xl p-1 border border-[#2A2D3A]">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-xl bg-[#1E2130] flex items-center justify-center">
                      <Minus size={12} className="text-white" />
                    </button>
                    <span className="text-white font-extrabold text-sm w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center">
                      <Plus size={12} className="text-black" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-sm">{(item.price * item.quantity).toLocaleString()} F</span>
                    <button onClick={() => removeItem(item.id)}
                      className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Delivery Address ── */}
        <div className="bg-[#161920] rounded-2xl border border-[#2A2D3A] p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-primary" />
            <h3 className="text-white font-extrabold text-sm">Adresse de livraison</h3>
          </div>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Ex: Bastos, Rue des Ambassades, Immeuble Rose, Apt 3B, Yaoundé"
            rows={2}
            className="w-full bg-[#0B0C10] border-2 border-[#2A2D3A] rounded-2xl px-4 py-3 text-white text-sm placeholder:text-[#4B5060] focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* ── Payment Method ── */}
        <div className="bg-[#161920] rounded-2xl border border-[#2A2D3A] p-4">
          <h3 className="text-white font-extrabold text-sm mb-3 flex items-center gap-2">
            <CreditCard size={15} className="text-primary" /> Mode de paiement
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(pm => {
              const PIcon = PAYMENT_ICONS[pm.id] ?? Smartphone;
              const isActive = payment === pm.id;
              return (
                <motion.button key={pm.id} onClick={() => setPayment(pm.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all ${
                    isActive ? 'border-primary bg-primary/10' : 'border-[#2A2D3A] bg-[#0B0C10]'
                  }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-primary/20' : (PAYMENT_BG[pm.id] ?? 'bg-white/5')
                  }`}>
                    <PIcon size={16} className={isActive ? 'text-primary' : (PAYMENT_COLORS[pm.id] ?? 'text-[#9CA3AF]')} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold leading-tight truncate ${
                      isActive ? 'text-primary' : 'text-white'
                    }`}>{pm.label}</p>
                    <p className="text-[#6B7280] text-[10px] mt-0.5">{pm.sublabel}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Special Notes ── */}

        <div className="bg-[#161920] rounded-2xl border border-[#2A2D3A] p-4">
          <h3 className="text-white font-extrabold text-sm mb-3 flex items-center gap-2">
            <FileText size={15} className="text-primary" /> Instructions spéciales
          </h3>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Pas de piment, sonnez à l'interphone..."
            className="w-full bg-[#0B0C10] border-2 border-[#2A2D3A] rounded-2xl px-4 py-3 text-white text-sm placeholder:text-[#4B5060] focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* ── Order Summary ── */}
        <div className="bg-[#161920] rounded-2xl border border-[#2A2D3A] p-4 space-y-3">
          <h3 className="text-white font-extrabold text-sm">Résumé</h3>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
            <span className="text-white font-semibold">{total.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Frais de livraison</span>
            <span className="text-primary font-semibold">+ {deliveryFee.toLocaleString()} FCFA</span>
          </div>
          <div className="h-px bg-[#2A2D3A]" />
          <div className="flex justify-between items-center">
            <span className="text-white font-extrabold text-base">Total</span>
            <span className="text-primary font-black text-xl">{grandTotal.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      {/* ── Sticky Order Button ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] bg-[#0B0C10]/95 backdrop-blur-md border-t border-[#2A2D3A] z-40">
        <button onClick={handleOrder} disabled={loading}
          className="w-full bg-primary text-black font-extrabold py-[17px] rounded-2xl flex items-center justify-between px-5 disabled:opacity-60 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(168,255,62,0.35)]">
          <span className="text-base">{loading ? 'Commande en cours...' : 'Confirmer la commande'}</span>
          <span className="flex items-center gap-1.5 text-base">
            {grandTotal.toLocaleString()} F
            <ChevronRight size={18} strokeWidth={3} />
          </span>
        </button>
      </div>
    </div>
  );
}
