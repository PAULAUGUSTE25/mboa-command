import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Settings, Heart, Package, LogOut, ChevronRight, Edit3, Shield, TrendingDown, Star, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { staggerContainer, fadeSlideUp, scalePop } from '../components/PageTransition';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center px-5 pb-24 gap-4">
        <div className="w-20 h-20 bg-[#161920] rounded-full flex items-center justify-center text-4xl border border-[#2A2D3A]">👤</div>
        <h2 className="text-white font-extrabold text-xl">Non connecté</h2>
        <p className="text-[#6B7280] text-center text-sm">Connectez-vous pour accéder à votre profil</p>
        <button onClick={() => navigate('/login')}
          className="bg-primary text-black font-extrabold px-10 py-4 rounded-2xl shadow-[0_4px_20px_rgba(168,255,62,0.35)] mt-2">
          Se connecter
        </button>
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: 'Mes commandes',             sub: 'Historique & suivi',     action: () => navigate('/orders'), color: 'text-blue-400',   bg: 'bg-blue-400/10' },
    { icon: Heart,   label: 'Restaurants favoris',       sub: 'Vos coups de cœur',      action: () => {},                  color: 'text-red-400',    bg: 'bg-red-400/10' },
    { icon: MapPin,  label: 'Mes adresses',              sub: 'Gérer les adresses',      action: () => {},                  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: Shield,  label: 'Sécurité & confidentialité',sub: 'Mot de passe, données',   action: () => {},                  color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: Settings,label: 'Paramètres',                sub: 'Notifications, langue',   action: () => {},                  color: 'text-[#9CA3AF]',  bg: 'bg-[#1E2130]' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C10] pb-28">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden pt-12 pb-7 px-5">
        {/* Subtle bg glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />

        <div className="flex items-start justify-between mb-6 relative">
          <h1 className="text-white font-extrabold text-xl tracking-tight">Mon Profil</h1>
          <button className="w-10 h-10 bg-[#161920] rounded-2xl flex items-center justify-center border border-[#2A2D3A]">
            <Edit3 size={16} className="text-[#9CA3AF]" />
          </button>
        </div>

        {/* Avatar + Info */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary to-[#7DCE2A] flex items-center justify-center shadow-[0_4px_20px_rgba(168,255,62,0.3)]">
              <span className="text-black font-black text-3xl">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-[#0B0C10] flex items-center justify-center">
              <span className="text-[8px]">✓</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-extrabold text-[20px] leading-tight truncate">{user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={12} className="text-primary" />
              <span className="text-[#9CA3AF] text-sm">{user?.city || 'Cameroun'}</span>
            </div>
            <span className="mt-1.5 inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">
              🇨🇲 Mboa Command
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">

        {/* Contact Info */}
        <div className="bg-[#161920] rounded-2xl border border-[#2A2D3A] p-4 space-y-3.5">
          {user?.email && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[#6B7280] text-[10px] font-semibold uppercase tracking-wider">Email</p>
                <p className="text-white text-sm font-semibold truncate">{user.email}</p>
              </div>
            </div>
          )}
          {user?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-[#6B7280] text-[10px] font-semibold uppercase tracking-wider">Téléphone</p>
                <p className="text-white text-sm font-semibold">{user.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-3 gap-3">
          {[
            { label: 'Commandes', value: '12',    Icon: Package,      color: 'text-blue-400',    bg: 'bg-blue-400/10' },
            { label: 'FCFA écon.', value: '5 400', Icon: TrendingDown,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Points',    value: '240',   Icon: Star,          color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
          ].map(stat => (
            <motion.div key={stat.label} variants={fadeSlideUp}
              className="bg-[#161920] rounded-2xl p-3 text-center border border-[#2A2D3A]">
              <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                <stat.Icon size={15} className={stat.color} />
              </div>
              <div className="text-white font-extrabold text-base leading-none">{stat.value}</div>
              <div className="text-[#6B7280] text-[10px] mt-1 leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Referral Card */}
        <motion.div variants={scalePop} initial="hidden" animate="show"
          className="relative rounded-2xl overflow-hidden border border-primary/20">
          <img src="/images/poulet-dg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="relative bg-gradient-to-r from-primary/25 to-transparent p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/30">
              <Gift size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-white font-extrabold text-sm">Parrainez un ami</p>
              <p className="text-[#9CA3AF] text-xs mt-0.5">Gagnez 1 000 FCFA par parrainage</p>
            </div>
            <button className="bg-primary text-black text-xs font-extrabold px-4 py-2 rounded-xl flex-shrink-0">
              Partager
            </button>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show"
          className="bg-[#161920] rounded-2xl border border-[#2A2D3A] overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button key={item.label} variants={fadeSlideUp} onClick={item.action}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3.5 p-4 hover:bg-white/5 transition-colors text-left ${
                  i < menuItems.length - 1 ? 'border-b border-[#2A2D3A]' : ''
                }`}>
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={17} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{item.label}</p>
                  <p className="text-[#6B7280] text-xs mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight size={16} className="text-[#4B5060] flex-shrink-0" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Language Switcher */}
        <div className="flex flex-col gap-3">
          <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider px-1">
            {t('profile.language')}
          </p>
          <LanguageSwitcher />
        </div>

        {/* Logout */}
        {!showLogoutConfirm ? (
          <button onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3.5 p-4 bg-red-500/8 border border-red-500/20 rounded-2xl hover:bg-red-500/15 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center">
              <LogOut size={17} className="text-red-400" />
            </div>
            <span className="text-red-400 font-bold text-sm">Se déconnecter</span>
          </button>
        ) : (
          <div className="bg-[#161920] border border-[#2A2D3A] rounded-2xl p-5">
            <p className="text-white font-bold text-sm text-center mb-4">Confirmer la déconnexion ?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-[#1E2130] border border-[#2A2D3A] text-[#9CA3AF] font-bold py-3.5 rounded-2xl text-sm">
                Annuler
              </button>
              <button onClick={handleLogout}
                className="flex-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold py-3.5 rounded-2xl text-sm">
                Confirmer
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[#4B5060] text-xs pb-4">Mboa Command v1.0.0 🇨🇲 · Made in Cameroun</p>
      </div>
    </div>
  );
}
