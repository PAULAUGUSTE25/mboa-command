import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Kribi', 'Limbe', 'Buéa'];

const INPUT_CLS = "w-full bg-[#161920] border-2 border-[#2A2D3A] rounded-2xl px-5 py-4 text-white text-base placeholder:text-[#4B5060] focus:outline-none focus:border-primary transition-all duration-200";
const LABEL_CLS = "text-white/80 text-sm font-semibold tracking-wide uppercase";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: 'Yaoundé' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error(t('auth.fillAllFields')); return; }
    if (form.password.length < 6) { toast.error(t('auth.passwordMinLength')); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success(t('auth.registerSuccess'));
      navigate('/home');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col overflow-hidden">

      {/* ── Hero Image ── */}
      <div className="relative h-[36vh] flex-shrink-0">
        <img
          src="/images/ndole-crevettes.jpg"
          alt="Ndolé Crevettes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-transparent to-transparent" />

        {/* Back */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-12 left-5 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Logo */}
        <div className="absolute top-10 left-0 right-0 flex justify-center">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl">
            <img
              src="/images/app logo.png"
              alt="Mboa Command"
              className="w-14 h-14 rounded-xl object-cover"
            />
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="flex-1 bg-[#0D0F14] rounded-t-[32px] -mt-6 relative z-10 px-6 pt-8 pb-12 overflow-y-auto">

        <div className="mb-7">
          <h1 className="text-white text-[28px] font-extrabold leading-tight tracking-tight">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-text-sub mt-1.5 text-base">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>{t('auth.name')} <span className="text-primary">*</span></label>
            <input
              type="text"
              placeholder={t('auth.namePlaceholder')}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className={INPUT_CLS}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>{t('auth.emailLabel')} <span className="text-primary">*</span></label>
            <input
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={INPUT_CLS}
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>{t('auth.phone')}</label>
            <input
              type="tel"
              placeholder={t('auth.phonePlaceholder')}
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className={INPUT_CLS}
              autoComplete="tel"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>{t('auth.passwordLabel')} <span className="text-primary">*</span></label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                className={INPUT_CLS + ' pr-14'}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className={LABEL_CLS}>{t('auth.cityLabel')}</label>
            <div className="relative">
              <select
                value={form.city}
                onChange={e => set('city', e.target.value)}
                className={INPUT_CLS + ' appearance-none pr-12 cursor-pointer'}
              >
                {CITIES.map(city => <option key={city} value={city} className="bg-[#161920]">{city}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-extrabold text-base py-[17px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(168,255,62,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {t('auth.registering')}
              </span>
            ) : (
              <>
                {t('auth.registerButton')}
                <ChevronRight size={18} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-text-sub mt-7 text-sm">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            {t('auth.loginButton')}
          </Link>
        </p>
      </div>
    </div>
  );
}
