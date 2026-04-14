import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FOOD_IMAGES = [
  '/images/poulet-dg.jpg',
  '/images/ndole-crevettes.jpg',
  '/images/eru-fufu.jpg',
  '/images/mbongo.jpg',
  '/images/achu-taro.jpg',
  '/images/kondre.jpg',
  '/images/ndole.jpg',
  '/images/koki.jpg',
  '/images/eru-mais.jpg',
];

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Food photo mosaic background */}
      <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-25 scale-110">
        {FOOD_IMAGES.map((src, i) => (
          <div key={i} className="overflow-hidden">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0B0C10]/75" />

      {/* Centered Logo */}
      <div className="flex flex-col items-center z-10">
        {/* Real app logo */}
        <div
          className="mb-5 shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
          style={{ animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          <img
            src="/images/app-logo.png"
            alt="Mboa Command"
            className="w-52 h-52 rounded-3xl object-cover"
          />
        </div>

        <p className="text-white/70 font-semibold text-base tracking-wide">La saveur du Cameroun, livrée 🇨🇲</p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 w-32 h-1 bg-white/10 rounded-full overflow-hidden z-10">
        <div className="h-full bg-primary rounded-full" style={{ animation: 'loadBar 2.8s linear forwards' }} />
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes loadBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
