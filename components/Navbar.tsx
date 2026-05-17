import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteData } from '../context/SiteContext';
import { X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const { data, isAdmin, setIsAdmin } = useSiteData();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { label: t('nav.home'), id: 'home' },
    { label: t('nav.gallery'), id: 'gallery' },
    { label: t('nav.about'), id: 'about' },
    { label: t('nav.contact'), id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    if (id === 'gallery') {
      setIsMenuOpen(false);
      return;
    }

    if (location.pathname !== '/') {
      setIsMenuOpen(false);
      return; 
    }

    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={false}
      animate={{ 
        height: scrolled ? 64 : 96,
        backgroundColor: scrolled ? 'rgba(254, 253, 252, 0.95)' : 'rgba(254, 253, 252, 0)',
        backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        borderBottomColor: scrolled ? 'rgba(249, 247, 242, 1)' : 'rgba(249, 247, 242, 0)'
      }}
      className="fixed top-0 left-0 w-full z-50 border-b transition-colors duration-700"
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/" 
            onClick={(e) => handleNavClick(e, 'home')}
            className="text-2xl font-serif tracking-widest text-zen-stone"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              animate={{ scale: scrolled ? 0.9 : 1 }}
            >
              {data.hero.titleTop} <span className="italic font-light opacity-60">{data.hero.titleBottom}</span>
            </motion.div>
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.id === 'gallery' ? '/gallery-full' : `/#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`group relative text-[10px] uppercase tracking-[0.3em] transition-colors py-2 ${
                activeSection === item.id ? 'text-zen-gold font-bold' : 'text-zen-stone/70 hover:text-zen-stone'
              }`}
            >
              {item.label}
              <motion.span 
                initial={false}
                animate={{ width: activeSection === item.id ? '100%' : '0%' }}
                whileHover={{ width: '100%' }}
                className="absolute -bottom-1 left-0 h-px bg-zen-gold transition-all duration-500"
              ></motion.span>
            </Link>
          ))}
          <LanguageSelector />
          {isAdmin && (
            <button 
              onClick={() => setIsAdmin(true)}
              className="text-[10px] uppercase tracking-[0.3em] text-zen-gold font-bold border border-zen-gold/20 px-4 py-1 rounded hover:bg-zen-gold hover:text-white transition-all"
            >
              {t('admin.dashboard', { defaultValue: 'Dashboard' })}
            </button>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col space-y-1.5 w-6 cursor-pointer focus:outline-none z-50"
          aria-label={t('nav.toggleMenu', { defaultValue: 'Toggle Menu' })}
        >
          <motion.div animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 8 : 0 }} className="h-0.5 w-full bg-zen-stone"></motion.div>
          <motion.div animate={{ opacity: isMenuOpen ? 0 : 1 }} className="h-0.5 w-full bg-zen-stone"></motion.div>
          <motion.div animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -8 : 0 }} className="h-0.5 w-full bg-zen-stone"></motion.div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[1000] md:hidden bg-white shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-8 right-6 p-4 text-zen-stone/40 hover:text-zen-gold transition-colors z-[1010]"
            >
              <X size={32} strokeWidth={1} />
            </button>

            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20 space-y-16 overflow-y-auto bg-white relative z-10">
              {/* Section Traduction pour Mobile */}
              <div className="w-full max-w-xs space-y-6 pt-10">
                <div className="flex items-center justify-center space-x-4">
                   <div className="h-px w-8 bg-zen-gold/30"></div>
                   <p className="text-[10px] uppercase tracking-[0.4em] text-zen-gold font-bold">
                    {t('nav.selectLanguage', { defaultValue: 'Langue' })}
                  </p>
                   <div className="h-px w-8 bg-zen-gold/30"></div>
                </div>
                
                <div className="flex justify-center gap-6">
                  {[
                    { code: 'fr', name: 'FR', flag: '🇫🇷' },
                    { code: 'en', name: 'EN', flag: '🇬🇧' },
                    { code: 'ar', name: 'AR', flag: '🇲🇦' }
                  ].map((lang) => {
                    const isActive = i18n.language.startsWith(lang.code);
                    return (
                      <motion.button
                        key={lang.code}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                        }}
                        className={`flex flex-col items-center space-y-2 group`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 shadow-sm ${
                          isActive ? 'bg-zen-gold text-white shadow-lg scale-110' : 'bg-white border border-zen-beige text-zen-stone'
                        }`}>
                          {lang.flag}
                        </div>
                        <span className={`text-[10px] tracking-widest font-bold transition-colors ${
                          isActive ? 'text-zen-gold' : 'text-zen-stone/40'
                        }`}>
                          {lang.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col items-center space-y-10 w-full">
                {navItems.map((item, idx) => (
                  <Link
                    key={item.id}
                    to={item.id === 'gallery' ? '/gallery-full' : `/#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`text-3xl md:text-3xl uppercase tracking-[0.4em] font-serif italic transition-all duration-500 relative group ${
                      activeSection === item.id ? 'text-zen-gold' : 'text-zen-stone/80'
                    }`}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                    {activeSection === item.id && (
                      <motion.div 
                        layoutId="activeTabMobile"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-zen-gold/40 mx-auto w-12"
                      />
                    )}
                  </Link>
                ))}
              </div>

              <div className="pt-10">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[10px] uppercase tracking-[0.5em] text-zen-stone/40 hover:text-zen-gold transition-colors"
                >
                  {t('nav.close', { defaultValue: 'Fermer' })}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;