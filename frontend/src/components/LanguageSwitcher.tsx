import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const currentCode = i18n.language === 'fr' ? 'FR' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 bg-[#161920] border border-[#2A2D3A] rounded-xl hover:border-primary/30 transition-all active:scale-95"
    >
      <span className="text-white text-xs font-bold">{currentCode}</span>
    </button>
  );
}
