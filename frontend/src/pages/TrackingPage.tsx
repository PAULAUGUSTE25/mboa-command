import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, CheckCircle, ChefHat, Bike, Package } from 'lucide-react';
import { ordersAPI } from '../lib/api';

interface Order {
  id: string; status: string; total: number; delivery_fee: number;
  restaurant_name: string; restaurant_image: string; restaurant_phone: string;
  driver_name: string; driver_phone: string; estimated_delivery: string;
  delivery_address: string; created_at: string;
  items: { id: number; name: string; quantity: number; price: number }[];
}

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmée', icon: CheckCircle, desc: 'Votre commande a été confirmée' },
  { key: 'preparing', label: 'Préparation', icon: ChefHat, desc: 'Le restaurant prépare votre commande' },
  { key: 'on_the_way', label: 'En route', icon: Bike, desc: 'Votre livreur est en chemin' },
  { key: 'delivered', label: 'Livrée', icon: Package, desc: 'Commande livrée! Bon appétit 🎉' },
];

const STATUS_INDEX: Record<string, number> = { confirmed: 0, preparing: 1, on_the_way: 2, delivered: 3 };

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!id) return;
    const load = () => {
      ordersAPI.getById(id).then(res => {
        setOrder(res.data);
        setCurrentStep(STATUS_INDEX[res.data.status] ?? 0);
      }).catch(() => navigate('/home')).finally(() => setLoading(false));
    };
    load();
    // Auto-advance status simulation
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 3) {
          const nextStatus = ['confirmed', 'preparing', 'on_the_way', 'delivered'][prev + 1];
          if (id) ordersAPI.updateStatus(id, nextStatus).catch(() => {});
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-3">🛵</div>
        <p className="text-text-sub">Chargement du suivi...</p>
      </div>
    </div>
  );

  if (!order) return null;

  const estimatedTime = order.estimated_delivery
    ? new Date(order.estimated_delivery).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="min-h-screen bg-dark pb-10">
      {/* Cover */}
      <div className="relative h-48">
        <img src={order.restaurant_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="w-10 h-10 bg-dark/70 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Suivi commande</h1>
          <div className="w-10" />
        </div>
        <div className="absolute bottom-4 left-5">
          <p className="text-white font-bold text-base">{order.restaurant_name}</p>
          <p className="text-text-sub text-xs">{order.items.length} article(s)</p>
        </div>
      </div>

      <div className="px-5 space-y-4 mt-4 page-enter">
        {/* ETA Card */}
        <div className="bg-primary rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-dark/70 text-xs font-semibold">Livraison estimée</p>
            <p className="text-dark font-black text-2xl">{estimatedTime}</p>
            <p className="text-dark/70 text-xs">{order.delivery_address || 'Votre adresse'}</p>
          </div>
          <div className="text-5xl">🏠</div>
        </div>

        {/* Status Steps */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-white font-bold text-sm mb-4">Statut de la commande</h3>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-primary' : 'bg-dark-card2 border border-dark-border'}`}>
                      <Icon size={16} className={isDone ? 'text-dark' : 'text-text-muted'} />
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-6 mt-1 transition-all duration-500 ${i < currentStep ? 'bg-primary' : 'bg-dark-border'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className={`text-sm font-bold ${isDone ? 'text-white' : 'text-text-muted'}`}>{step.label}</p>
                    {isCurrent && (
                      <p className="text-text-sub text-xs mt-0.5 animate-pulse">{step.desc}</p>
                    )}
                  </div>
                  {isCurrent && i < 3 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                  {isDone && i < currentStep && (
                    <CheckCircle size={16} className="text-primary mt-1.5 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Info */}
        {order.driver_name && (
          <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
            <h3 className="text-white font-bold text-sm mb-3">Votre livreur</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl">🛵</div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{order.driver_name}</p>
                <p className="text-text-sub text-xs">{order.driver_phone}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-primary text-[10px] font-semibold">En route vers vous</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center">
                  <Phone size={16} className="text-primary" />
                </button>
                <button className="w-10 h-10 bg-dark-card2 border border-dark-border rounded-xl flex items-center justify-center">
                  <MessageCircle size={16} className="text-text-sub" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-white font-bold text-sm mb-3">Détails de la commande</h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-text-sub text-sm">{item.quantity}x {item.name}</span>
                <span className="text-white text-sm font-semibold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
              </div>
            ))}
            <div className="h-px bg-dark-border my-2" />
            <div className="flex justify-between">
              <span className="text-text-sub text-sm">Livraison</span>
              <span className="text-white text-sm">+{order.delivery_fee?.toLocaleString() || '500'} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-primary font-black">{order.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {currentStep === 3 && (
          <div className="bg-primary rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-dark font-black text-lg">Commande livrée!</h3>
            <p className="text-dark/70 text-sm mt-1 mb-4">Bon appétit! N'oubliez pas de noter votre livreur.</p>
            <button onClick={() => navigate('/home')} className="bg-dark text-primary font-bold px-6 py-3 rounded-xl">
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
