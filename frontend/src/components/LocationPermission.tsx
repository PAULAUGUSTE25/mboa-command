import { useState } from 'react';
import { MapPin, X, Loader2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface LocationPermissionProps {
  onLocationReceived?: (address: string, lat: number, lng: number) => void;
  trigger?: React.ReactNode;
}

export default function LocationPermission({ onLocationReceived, trigger }: LocationPermissionProps) {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reverse geocode coordinates to address using Nominatim (free)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handleAllow = async () => {
    if (!navigator.geolocation) {
      toast.error(t('location.notSupported'));
      setShowPrompt(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates
        const address = await reverseGeocode(latitude, longitude);
        
        // Store in localStorage
        localStorage.setItem('userLocation', JSON.stringify({
          address,
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
        }));

        // Callback
        if (onLocationReceived) {
          onLocationReceived(address, latitude, longitude);
        }

        toast.success(t('location.success'));
        setLoading(false);
        setShowPrompt(false);
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(t('location.denied'));
        } else {
          toast.error(t('location.error'));
        }
        setShowPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDeny = () => {
    setShowPrompt(false);
  };

  return (
    <>
      {/* Trigger button */}
      {trigger ? (
        <div onClick={() => setShowPrompt(true)}>
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setShowPrompt(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-all"
        >
          <Navigation size={16} />
          <span className="text-sm font-semibold">{t('location.useMyLocation')}</span>
        </button>
      )}

      <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDeny}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-[#161920] rounded-3xl p-6 z-[60] border-2 border-[#2A2D3A] shadow-2xl"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button
              onClick={handleDeny}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#2A2D3A] rounded-full hover:bg-[#3A3D4A] transition-colors z-10"
            >
              <X size={16} className="text-[#9CA3AF]" />
            </button>

            <div className="flex flex-col items-center text-center pb-2">
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
                <MapPin size={32} className="text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-white text-xl font-extrabold mb-2">
                {t('location.title')}
              </h3>

              {/* Description */}
              <p className="text-[#9CA3AF] text-sm mb-6 leading-relaxed">
                {t('location.description')}
              </p>

              {/* Benefits */}
              <div className="w-full bg-[#0B0C10] rounded-xl p-3 mb-5 space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm">📍</span>
                  <p className="text-[#9CA3AF] text-[11px] flex-1">{t('location.benefit1')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm">🚴</span>
                  <p className="text-[#9CA3AF] text-[11px] flex-1">{t('location.benefit2')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm">⚡</span>
                  <p className="text-[#9CA3AF] text-[11px] flex-1">{t('location.benefit3')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full space-y-3">
                <button
                  onClick={handleAllow}
                  disabled={loading}
                  className="w-full bg-primary text-black font-extrabold py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(168,255,62,0.35)] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? t('common.loading') : t('location.allow')}
                </button>
                <button
                  onClick={handleDeny}
                  className="w-full bg-transparent border-2 border-[#2A2D3A] text-[#9CA3AF] font-bold py-3 rounded-2xl hover:border-[#3A3D4A] active:scale-[0.98] transition-all"
                >
                  {t('location.deny')}
                </button>
              </div>

              {/* Privacy note */}
              <p className="text-[#6B7280] text-[10px] mt-4">
                🔒 {t('location.privacy')}
              </p>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
}
