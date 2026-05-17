import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSiteData } from '../context/SiteContext';

const Bio: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useSiteData();
  return (
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative group order-2 md:order-1"
        >
          {/* Éléments décoratifs en arrière-plan */}
          <div className="absolute -top-6 -left-6 md:-top-12 md:-left-12 w-32 h-32 md:w-48 md:h-48 border-t border-l border-zen-gold/40 -z-10 transition-transform duration-[1.5s] group-hover:-translate-x-4 group-hover:-translate-y-4"></div>
          
          {/* Conteneur de l'image incliné (Tilted) */}
          <div className="relative p-3 md:p-5 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] transition-all duration-[1.2s] ease-[cubic-bezier(0.23,1,0.32,1)] transform -rotate-2 md:-rotate-3 group-hover:rotate-0 origin-center group-hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)]">
            <div className="relative overflow-hidden aspect-[3/4]">
              <img 
                src={data.bio.imageUrl}
                alt={`${data.hero.titleTop} ${data.hero.titleBottom}`} 
                className="w-full h-full object-cover transition-all duration-[5s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:opacity-0 transition-opacity duration-1000"></div>
            </div>
            <div className="mt-4 md:mt-6 flex justify-between items-center px-2">
               <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-zen-gold animate-pulse"></span>
                  <span className="text-[10px] text-zen-taupe font-serif italic tracking-widest">{t('bio.studio', { defaultValue: data.bio.studioLocation })}</span>
               </div>
               <div className="w-12 h-px bg-zen-gold/30"></div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 w-48 md:w-72 h-px bg-zen-gold/30"></div>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="space-y-10 md:space-y-16 order-1 md:order-2"
        >
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-zen-gold font-bold">{t('bio.subtitle', { defaultValue: data.bio.subtitle })}</h2>
            <h3 className="text-4xl md:text-8xl font-serif italic text-zen-stone leading-[0.8]">{t('bio.title', { defaultValue: data.bio.title })}</h3>
            <div className="w-24 md:w-32 h-px bg-zen-gold opacity-40"></div>
          </div>
          
          <div className="space-y-6 md:space-y-8 relative">
            <p className="text-lg md:text-2xl leading-relaxed text-zen-stone font-light italic text-justify opacity-80 first-letter:text-5xl md:first-letter:text-6xl first-letter:font-serif first-letter:text-zen-gold first-letter:mr-4 first-letter:float-left">
              {t('bio.content', { defaultValue: data.bio.text })}
            </p>
          </div>
          
          <div className="pt-6 md:pt-10 flex flex-col sm:flex-row items-center sm:items-start space-y-8 sm:space-y-0 sm:space-x-12 md:space-x-20 group">
             <div className="relative">
                <motion.div 
                    whileHover={{ rotate: 0, scale: 1.1 }}
                    initial={{ rotate: 6 }}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full border border-zen-gold/20 flex items-center justify-center p-2 transition-all duration-1000 shadow-2xl bg-white"
                >
                   <img 
                    src={data.bio.secondaryImageUrl} 
                    className="w-full h-full rounded-full object-cover transition-all duration-700 hover:brightness-110" 
                    alt="Portrait secondaire" 
                   />
                </motion.div>
             </div>
             <div className="text-center sm:text-left">
                <p className="text-xl md:text-3xl tracking-[0.3em] uppercase text-zen-stone font-medium italic transition-transform duration-700 group-hover:translate-x-4">{data.hero.titleTop} {data.hero.titleBottom}</p>
                <div className="h-px w-24 bg-zen-gold/40 mt-4 mb-2 mx-auto sm:mx-0"></div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-zen-gold mt-2 opacity-80">{t('bio.role', { defaultValue: data.bio.role })}</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Bio;