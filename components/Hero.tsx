import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link as RouterLink } from 'react-router-dom';
import { useSiteData } from '../context/SiteContext';

const Hero: React.FC = () => {
  const { data } = useSiteData();
  const slideshowImages = data.hero.slideshowImages || [];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-zen-ivory">
      {/* Background Zen Gradient */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-zen-beige rounded-full opacity-30 blur-[150px] -z-10"
      ></motion.div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-24 lg:gap-40 items-center group">
        <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-12 lg:pr-16 transition-transform duration-1000 lg:group-hover:-translate-x-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center lg:justify-start space-x-6">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: 48 }}
                 transition={{ delay: 0.5, duration: 1 }}
                 className="h-px bg-zen-gold"
               ></motion.div>
               <h2 className="text-[11px] uppercase tracking-[0.5em] text-zen-taupe font-bold">{data.hero.subtitle}</h2>
            </div>
             <motion.h1 
              initial={{ opacity: 0, filter: 'blur(20px)', y: 50 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ delay: 0.2, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[10rem] font-serif text-zen-stone leading-[0.9] italic select-none"
            >
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.5 }}
              >
                {data.hero.titleTop}
              </motion.span> 
              <br /> 
              <motion.span 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 2, ease: "easeOut" }}
                className="pl-0 lg:pl-24 text-zen-gold drop-shadow-sm inline-block"
              >
                {data.hero.titleBottom}
              </motion.span>
            </motion.h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl md:text-2xl text-zen-stone/60 max-w-lg font-light leading-relaxed italic border-l-2 border-zen-gold/20 lg:pl-10"
          >
            "{data.hero.quote}" 
            <br /><span className="text-sm uppercase tracking-widest text-zen-gold mt-4 block">{data.hero.location}</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 pt-6"
          >
            <RouterLink 
              to="/gallery-full"
              className="group relative px-12 py-5 bg-zen-stone text-white text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:shadow-2xl"
            >
              <span className="relative z-10">{data.ui.heroCollection}</span>
              <div className="absolute inset-0 bg-zen-gold translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out"></div>
            </RouterLink>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <div className="relative w-full max-w-md group">
            {/* Double frames décoratifs */}
            <motion.div 
              animate={{ rotate: [0, 1, -1, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border border-zen-gold/20 translate-x-10 translate-y-10 -z-10"
            ></motion.div>
            <motion.div 
              animate={{ rotate: [0, -1, 1, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border border-zen-stone/5 translate-x-20 translate-y-20 -z-20"
            ></motion.div>
            
            {/* Conteneur Diaporama */}
            <motion.div 
              whileHover={{ rotate: 1, x: 80 }}
              className="relative overflow-hidden bg-white p-5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] aspect-[3/4] transition-all duration-1000"
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 2 }}
                  className="absolute inset-5"
                >
                  <img 
                    src={slideshowImages[currentImageIndex]} 
                    alt={`Slide ${currentImageIndex}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zen-stone/40 to-transparent opacity-60"></div>
                </motion.div>
              </AnimatePresence>
              
              {/* Indicateurs de progression discrets */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {slideshowImages.map((_, idx) => (
                  <motion.div 
                    key={idx} 
                    animate={{ width: currentImageIndex === idx ? 24 : 8 }}
                    className={`h-0.5 transition-colors duration-700 ${
                      currentImageIndex === idx ? 'bg-zen-gold' : 'bg-white/30'
                    }`}
                  ></motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-6 opacity-30"
      >
        <span className="text-[9px] uppercase tracking-[0.6em] vertical-text">{data.ui.heroExplore}</span>
        <div className="w-px h-24 bg-gradient-to-b from-zen-gold to-transparent"></div>
      </motion.div>
    </div>
  );
};

export default Hero;