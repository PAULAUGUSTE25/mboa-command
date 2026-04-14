import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error(t('auth.emailRequired')); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form.email, form.password);
      login(res.data.token, res.data.user);
      toast.success(`Bienvenue ${res.data.user.name}!`);
      navigate('/home');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!form.email) { toast.error('Entrez votre email d\'abord'); return; }
    setLoading(true);
    try {
      await authAPI.sendOTP(form.email);
      toast.success(t('auth.otpSent'));
      navigate('/otp', { state: { email: form.email } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      const res = await authAPI.login('paul@mboaeats.cm', 'password123');
      login(res.data.token, res.data.user);
      toast.success(t('auth.loginSuccess'));
      navigate('/home');
    } catch {
      toast.error(t('auth.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col overflow-hidden">

      {/* ── Hero Image ── */}
      <div className="relative h-[46vh] flex-shrink-0">
        <img
          src="/images/poulet-dg.jpg"
          alt="Poulet DG"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="absolute top-12 left-5 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Logo over image */}
        <div className="absolute top-10 left-0 right-0 flex justify-center">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-xl">
            <img
              src="/images/app-logo.png"
              alt="Mboa Command"
              className="w-14 h-14 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Tagline bottom of image */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
            La saveur du Cameroun, livrée chez vous
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="flex-1 bg-[#0D0F14] rounded-t-[32px] -mt-6 relative z-10 px-6 pt-8 pb-10 overflow-y-auto">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-white text-[28px] font-extrabold leading-tight tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-text-sub mt-1.5 text-base">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-semibold tracking-wide uppercase">
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-[#161920] border-2 border-[#2A2D3A] rounded-2xl px-5 py-4 text-white text-base placeholder:text-[#4B5060] focus:outline-none focus:border-primary transition-all duration-200"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/80 text-sm font-semibold tracking-wide uppercase">
                {t('auth.passwordLabel')}
              </label>
              <button type="button" className="text-primary text-sm font-semibold">
                {t('auth.forgotPasswordLink')}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-[#161920] border-2 border-[#2A2D3A] rounded-2xl px-5 py-4 pr-14 text-white text-base placeholder:text-[#4B5060] focus:outline-none focus:border-primary transition-all duration-200"
                autoComplete="current-password"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-extrabold text-base py-[17px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(168,255,62,0.35)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {t('auth.loggingIn')}
              </span>
            ) : (
              <>
                {t('auth.loginButton')}
                <ChevronRight size={18} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#2A2D3A]" />
          <span className="text-[#4B5060] text-sm font-medium">{t('auth.or')}</span>
          <div className="flex-1 h-px bg-[#2A2D3A]" />
        </div>

        {/* OTP Login */}
        <button
          type="button"
          onClick={handleOTPLogin}
          disabled={!form.email || loading}
          className="w-full bg-[#161920] border-2 border-[#2A2D3A] text-white font-bold py-[15px] rounded-2xl flex items-center justify-center gap-2.5 hover:border-primary/40 active:scale-[0.98] transition-all duration-150 disabled:opacity-40"
        >
          <ShieldCheck size={18} className="text-primary" />
          {t('auth.otpLogin')}
        </button>

        {/* Demo Login */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full bg-transparent border-2 border-primary/40 text-primary font-bold py-[15px] rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/8 active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
        >
          <span className="text-lg">🇨🇲</span>
          {t('auth.demoLogin')}
        </button>

        {/* Register link */}
        <p className="text-center text-text-sub mt-7 text-sm">
          <span className="text-[#6B7280]">{t('auth.noAccount')}</span>
          <Link to="/register" className="text-primary font-bold">{t('auth.registerButton')}</Link>
        </p>
      </div>
    </div>
  );
}
