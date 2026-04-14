import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Bike, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const getSlides = (t: any) => [
  {
    image: '/images/poulet-dg.jpg',
    tag: t('onboarding.slide1.tag'),
    title: t('onboarding.slide1.title'),
    subtitle: t('onboarding.slide1.subtitle'),
    accent: '#A8FF3E',
    Icon: ShoppingBag,
  },
  {
    image: '/images/delivery.jpg',
    tag: t('onboarding.slide2.tag'),
    title: t('onboarding.slide2.title'),
    subtitle: t('onboarding.slide2.subtitle'),
    accent: '#A8FF3E',
    Icon: Bike,
  },
  {
    image: '/images/payment\'s background.png',
    tag: t('onboarding.slide3.tag'),
    title: t('onboarding.slide3.title'),
    subtitle: t('onboarding.slide3.subtitle'),
    accent: '#A8FF3E',
    Icon: CreditCard,
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const slides = getSlides(t);

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1);
    else navigate('/login');
  };

  const slide = slides[current];
  const SlideIcon = slide.Icon;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[#0B0C10]">
      {/* Full-screen food image */}
      <div className="absolute inset-0 transition-all duration-700">
        <img
          key={slide.image}
          src={slide.image}
          alt=""
          className="w-full h-full object-cover"
          style={{ animation: 'kenBurns 8s ease-out forwards' }}
        />
        {/* Gradient overlay - stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/60 to-[#0B0C10]/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/60 to-transparent h-40" />
      </div>

      {/* Logo + Language + Skip */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 gap-3">
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-lg">
          <img
            src="/images/app logo.png"
            alt="Mboa Command"
            className="w-10 h-10 rounded-xl object-cover"
          />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={() => navigate('/login')}
            className="text-white/70 text-sm font-bold hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
            {t('onboarding.skip')} →
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom content card */}
      <div className="relative z-10 px-6 pb-10">
        {/* Tag pill */}
        <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
          <span>{slide.tag}</span>
        </div>

        {/* Title */}
        <h1 className="text-white text-[32px] font-black leading-[1.1] mb-3 whitespace-pre-line drop-shadow-lg">
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p className="text-white/75 text-sm leading-relaxed mb-8">{slide.subtitle}</p>

        {/* Dots */}
        <div className="flex gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/30'}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          className="w-full bg-primary text-black font-extrabold text-lg py-[17px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(168,255,62,0.4)] active:scale-[0.98] transition-all"
        >
          {current < slides.length - 1 ? (
            <>
              {t('onboarding.next')}
              <ChevronRight size={20} />
            </>
          ) : (
            <>
              <SlideIcon size={20} />
              {t('onboarding.getStarted')}
            </>
          )}
        </button>

        {/* Login link */}
        {current === slides.length - 1 && (
          <p className="text-center text-white/50 text-sm mt-4">
            {t('onboarding.hasAccount')}{' '}
            <button onClick={() => navigate('/login')} className="text-primary font-semibold">
              {t('onboarding.signIn')}
            </button>
          </p>
        )}
      </div>

      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
