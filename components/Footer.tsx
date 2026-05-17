import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSiteData } from '../context/SiteContext';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { data, setIsAdmin } = useSiteData();
  const [isAuthMode, setIsAuthMode] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const [error, setError] = React.useState(false);

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const val = password.trim().toUpperCase();
    const correctPass = (data.adminPassword || "FRIDA KAHLO").toUpperCase();
    
    // Support historic default OR the new custom password
    if (val === correctPass || (correctPass === "FRIDA KAHLO" && val === "FRIDA KALHO")) {
      setIsAdmin(true);
      setIsAuthMode(false);
      setPassword('');
      setError(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
      setPassword('');
    }
  };

  return (
    <footer className="bg-zen-stone py-24 text-zen-beige relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zen-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-6 flex flex-col items-center space-y-16">
        <div className="text-4xl font-serif tracking-[0.2em] italic opacity-90">
          {data.hero.titleTop} {data.hero.titleBottom}
        </div>
        
        <div className="w-16 h-px bg-zen-gold/30"></div>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
          <a 
            href={data.socials.instagram} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] text-zen-beige/60 hover:text-zen-gold transition-all"
          >
            <span>Instagram</span>
            <div className="w-0 h-px bg-zen-gold group-hover:w-8 transition-all duration-500"></div>
          </a>
          <a 
            href={data.socials.facebook} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] text-zen-beige/60 hover:text-zen-gold transition-all"
          >
            <span>Facebook</span>
            <div className="w-0 h-px bg-zen-gold group-hover:w-8 transition-all duration-500"></div>
          </a>
          <a 
            href={data.socials.linkedin} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] text-zen-beige/60 hover:text-zen-gold transition-all"
          >
            <span>LinkedIn</span>
            <div className="w-0 h-px bg-zen-gold group-hover:w-8 transition-all duration-500"></div>
          </a>
        </div>

        <div className="space-y-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-40">{data.contact.address}</p>
          
          <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-6 w-full">
            {!isAuthMode ? (
              <motion.button 
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthMode(true)}
                className="relative z-[100] text-[10px] uppercase tracking-[0.3em] font-medium text-zen-gold border border-zen-gold/20 px-10 py-4 rounded-full hover:bg-zen-gold hover:text-zen-stone transition-all duration-500 cursor-pointer shadow-lg"
              >
                {t('admin.access', { defaultValue: data.ui.adminAccess })}
              </motion.button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAdminVerify}
                className="flex flex-col items-center space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <input 
                    autoFocus
                    type="password"
                    placeholder={`${t('admin.password', { defaultValue: 'Mot de passe' })}...`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-transparent border-b ${error ? 'border-red-500' : 'border-zen-gold/40'} py-2 px-4 text-xs tracking-widest text-zen-gold outline-none focus:border-zen-gold transition-all`}
                  />
                  <button type="submit" className="text-[10px] uppercase tracking-widest text-zen-gold font-bold p-2">
                    {t('admin.enter', { defaultValue: 'Entrer' })}
                  </button>
                  <button type="button" onClick={() => setIsAuthMode(false)} className="text-[10px] uppercase tracking-widest text-white/30 p-2">
                    ×
                  </button>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] uppercase tracking-widest text-red-400">
                    {t('admin.incorrectKey', { defaultValue: 'Clé incorrecte' })}
                  </motion.p>
                )}
              </motion.form>
            )}
            
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-20 font-light">
              &copy; {new Date().getFullYear()} {t('footer.copyright', { defaultValue: data.ui.footerCopyright })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;