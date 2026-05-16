import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSiteData } from '../context/SiteContext';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const { data, isAdmin, setIsAdmin } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { label: data.ui.navHome, id: 'home' },
    { label: data.ui.navGallery, id: 'gallery' },
    { label: data.ui.navAbout, id: 'about' },
    { label: data.ui.navContact, id: 'contact' },
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
        <div className="hidden md:flex space-x-10">
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
          {isAdmin && (
            <button 
              onClick={() => setIsAdmin(true)}
              className="text-[10px] uppercase tracking-[0.3em] text-zen-gold font-bold border border-zen-gold/20 px-4 py-1 rounded hover:bg-zen-gold hover:text-white transition-all"
            >
              Dashboard
            </button>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col space-y-1.5 w-6 cursor-pointer focus:outline-none z-50"
          aria-label="Toggle Menu"
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
            className="fixed inset-0 bg-zen-ivory z-40 md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {navItems.map((item, idx) => (
                <Link
                  key={item.id}
                  to={item.id === 'gallery' ? '/gallery-full' : `/#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`text-2xl uppercase tracking-[0.3em] font-serif italic transition-all duration-300 ${
                    activeSection === item.id ? 'text-zen-gold translate-x-2' : 'text-zen-stone/70'
                  }`}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;