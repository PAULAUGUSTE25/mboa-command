import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email: string = location.state?.email || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) { navigate('/login'); return; }
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const code = digits.join('');

  const handleDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) { toast.error('Entrez les 6 chiffres'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(email, code);
      setVerified(true);
      setTimeout(() => {
        login(res.data.token, res.data.user);
        toast.success(`Bienvenue ${res.data.user.name}!`);
        navigate('/home');
      }, 1200);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Code incorrect');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await authAPI.sendOTP(email);
      toast.success('Nouveau code envoyé!');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-6">
        <button
          onClick={() => navigate('/login')}
          className="w-10 h-10 bg-[#161920] rounded-2xl flex items-center justify-center border border-[#2A2D3A]"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-extrabold text-xl">Vérification</h1>
          <p className="text-[#6B7280] text-xs mt-0.5">Code OTP par email</p>
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col">

        {/* Icon + message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-10"
        >
          <div className="w-20 h-20 bg-primary/10 border-2 border-primary/30 rounded-3xl flex items-center justify-center mb-5">
            <Mail size={36} className="text-primary" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Vérifiez votre email</p>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Nous avons envoyé un code à 6 chiffres à<br />
            <span className="text-white font-semibold">{maskedEmail}</span>
          </p>
        </motion.div>

        {/* OTP inputs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-3 mb-8"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 bg-[#161920] text-white outline-none transition-all duration-200 ${
                d
                  ? 'border-primary shadow-[0_0_12px_rgba(168,255,62,0.3)]'
                  : 'border-[#2A2D3A] focus:border-primary/60'
              }`}
            />
          ))}
        </motion.div>

        {/* Verify button */}
        <AnimatePresence mode="wait">
          {verified ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,255,62,0.5)]">
                <ShieldCheck size={32} className="text-black" />
              </div>
              <p className="text-primary font-bold">Identité confirmée!</p>
            </motion.div>
          ) : (
            <motion.button
              key="verify"
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || code.length < 6}
              className="w-full h-14 bg-primary text-black font-extrabold text-base rounded-2xl shadow-[0_4px_20px_rgba(168,255,62,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Vérification...
                </span>
              ) : 'Confirmer le code'}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <p className="text-[#6B7280] text-sm">Code non reçu?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-sm font-bold disabled:text-[#4B5060] text-primary flex items-center gap-1 transition-colors"
          >
            {resending ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : countdown > 0 ? (
              `Renvoyer (${countdown}s)`
            ) : (
              'Renvoyer'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
