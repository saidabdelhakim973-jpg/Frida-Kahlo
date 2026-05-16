import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../context/SiteContext';
import { Artwork } from '../types';
import { ArrowRight } from 'lucide-react';

const Gallery: React.FC = () => {
  const { data } = useSiteData();
  const paintings = data.artworks.filter(a => a.category === 'Peinture');
  const sculptures = data.artworks.filter(a => a.category === 'Sculpture');

  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  
  return (
    <div className="container mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center mb-20 space-y-4"
      >
        <h2 className="text-sm uppercase tracking-[0.6em] text-zen-taupe font-medium">{data.gallery.subtitle}</h2>
        <div className="flex items-center justify-center space-x-6">
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} className="h-px bg-zen-gold"></motion.div>
          <h3 className="text-5xl md:text-7xl font-serif text-zen-stone italic">{data.gallery.title}</h3>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 48 }} className="h-px bg-zen-gold"></motion.div>
        </div>
      </motion.div>

      {/* Section Tableaux */}
      <div className="mb-32">
        <div className="flex items-center space-x-4 mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zen-gold font-bold">01</span>
            <h4 className="text-3xl font-serif italic text-zen-stone">{data.ui.galleryPaintings}</h4>
            <div className="h-px flex-1 bg-zen-gold/20"></div>
        </div>
        <GallerySection artworks={paintings} onSelect={setSelectedArt} />
      </div>

      {/* Section Sculptures */}
      <div>
        <div className="flex items-center space-x-4 mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zen-gold font-bold">02</span>
            <h4 className="text-3xl font-serif italic text-zen-stone">{data.ui.gallerySculptures}</h4>
            <div className="h-px flex-1 bg-zen-gold/20"></div>
        </div>
        {sculptures.length > 0 ? (
          <GallerySection artworks={sculptures} onSelect={setSelectedArt} />
        ) : (
          <div className="text-center py-20 border border-dashed border-zen-beige rounded-2xl">
            <p className="text-zen-taupe text-xs uppercase tracking-widest italic">Aucune sculpture pour le moment</p>
          </div>
        )}
      </div>

      <div className="mt-32 text-center">
        <Link 
          to="/gallery-full" 
          className="inline-flex items-center space-x-6 group"
        >
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.4em] text-zen-taupe group-hover:text-zen-gold transition-colors">Découvrir l'intégralité</p>
            <h4 className="text-2xl font-serif italic text-zen-stone group-hover:text-zen-gold transition-colors">Collection Complète</h4>
          </div>
          <div className="w-16 h-16 rounded-full border border-zen-stone/20 flex items-center justify-center group-hover:bg-zen-stone group-hover:text-white transition-all duration-500 transform group-hover:scale-110">
            <ArrowRight size={24} strokeWidth={1} />
          </div>
        </Link>
      </div>

      <AnimatePresence>
        {selectedArt && <ImmersionMode art={selectedArt} onClose={() => setSelectedArt(null)} />}
      </AnimatePresence>
    </div>
  );
};

interface GallerySectionProps {
    artworks: Artwork[];
    onSelect: (art: Artwork) => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ artworks, onSelect }) => {
  const { data } = useSiteData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Magnifier State
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;
    setMagnifierPos({ x, y, bgX, bgY });
  };
  
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    })
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
    setShowMagnifier(false);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
    setShowMagnifier(false);
  };

  const currentArt = artworks[currentIndex];

  if (artworks.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-8 relative flex justify-center h-[500px] md:h-[600px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div 
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.5 }
                }}
                className="absolute inset-0 flex justify-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="antique-frame max-w-full relative h-fit group cursor-none"
                  onMouseEnter={() => setShowMagnifier(true)}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMouseMove}
                  ref={containerRef}
                >
                  <div className="relative bg-[#ece8e0] overflow-hidden flex items-center justify-center shadow-inner group-hover:shadow-2xl transition-shadow duration-700" style={{ minWidth: '300px', minHeight: '400px' }}>
                    {currentArt.status === 'vendu' && (
                      <div className="absolute top-0 left-0 z-50 bg-red-600 text-white px-6 py-2 text-[10px] uppercase tracking-[0.5em] font-bold shadow-2xl backdrop-blur-sm -rotate-12 transform -translate-x-3 translate-y-4 border-2 border-white/40">
                        Vendu
                      </div>
                    )}
                    <img 
                      src={currentArt.imageUrl} 
                      alt={currentArt.title} 
                      className="max-w-full max-h-[60vh] object-contain shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 pointer-events-none glass-reflection opacity-40 z-20"></div>
                    
                    {/* Interactive Lens */}
                    <AnimatePresence>
                      {showMagnifier && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute pointer-events-none z-50 rounded-full border-4 border-white/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-no-repeat overflow-hidden"
                          style={{
                            width: '200px',
                            height: '200px',
                            left: `${magnifierPos.x - 100}px`,
                            top: `${magnifierPos.y - 100}px`,
                            backgroundImage: `url(${currentArt.imageUrl})`,
                            backgroundSize: '400%',
                            backgroundPosition: `${magnifierPos.bgX}% ${magnifierPos.bgY}%`,
                          }}
                        >
                          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 border border-black/5 text-[9px] uppercase tracking-[0.3em] text-black/80 shadow-xl z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      Explorer les détails
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-y-0 left-0 -translate-x-1/2 flex items-center">
              <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white text-zen-stone border border-zen-beige shadow-lg hover:bg-zen-gold hover:text-white transition-colors flex items-center justify-center z-40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 translate-x-1/2 flex items-center">
              <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white text-zen-stone border border-zen-beige shadow-lg hover:bg-zen-gold hover:text-white transition-colors flex items-center justify-center z-40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pl-16 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h4 className="text-4xl md:text-5xl font-serif text-zen-stone italic leading-tight">{currentArt.title}</h4>
                <p className="text-sm italic text-zen-taupe/80 tracking-widest">{currentArt.year}</p>
                <p className="text-zen-stone/70 font-light leading-relaxed text-lg italic">
                    {currentArt.description || "Une œuvre explorant l'équilibre délicat entre la forme et l'émotion."}
                </p>
                {currentArt.dimensions && (
                    <div className="inline-block px-3 py-1 bg-zen-beige text-[9px] uppercase tracking-[0.2em] text-zen-taupe border-l-2 border-zen-gold">
                        {currentArt.dimensions}
                    </div>
                )}
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => onSelect(currentArt)}
                        className="px-8 py-3 bg-zen-stone text-white text-[10px] uppercase tracking-widest hover:bg-zen-gold transition-colors flex-1"
                    >
                        Immersion
                    </button>
                    {currentArt.status === 'vendu' ? (
                      <div className="px-8 py-3 bg-red-600/10 border border-red-600/20 text-red-600 text-[10px] uppercase tracking-widest text-center flex-1 font-bold">
                          Œuvre Vendue
                      </div>
                    ) : (
                      <button 
                          onClick={() => {
                              const subject = encodeURIComponent(`${data.ui.priceInquiry}: ${currentArt.title}`);
                              const body = encodeURIComponent(`${data.ui.inquiryMessage} ${currentArt.title}\n\nLien de l'œuvre: ${window.location.origin}${window.location.pathname}?art=${currentArt.id}`);
                              window.location.href = `mailto:${data.contact.inquiryEmail}?subject=${subject}&body=${body}`;
                          }}
                          className="px-8 py-3 border border-zen-stone/20 text-zen-stone text-[10px] uppercase tracking-widest hover:border-zen-gold hover:text-zen-gold transition-colors flex-1"
                      >
                          Demander le prix
                      </button>
                    )}
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex space-x-1 pt-6 border-t border-zen-beige">
                {artworks.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-0.5 transition-all duration-500 ${currentIndex === idx ? 'w-8 bg-zen-gold' : 'w-2 bg-zen-taupe/20'}`} />
                ))}
            </div>
          </div>
        </div>
    </div>
  );
};

interface ImmersionModeProps {
    art: Artwork;
    onClose: () => void;
}

const ImmersionMode: React.FC<ImmersionModeProps> = ({ art, onClose }) => {
    const { data } = useSiteData();
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
    const immersionRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!immersionRef.current) return;
        const { left, top, width, height } = immersionRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        
        const bgX = (x / width) * 100;
        const bgY = (y / height) * 100;
        setMagnifierPos({ x, y, bgX, bgY });
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-none"
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
            ref={immersionRef}
        >
            <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-white z-[120] pointer-events-none"
            />
            
             <div className="absolute top-0 left-0 w-full p-12 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start z-[110]">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-white"
                >
                    <p className="text-[10px] uppercase tracking-[1em] text-zen-gold font-bold mb-2">Voyage Immersif</p>
                    <h4 className="text-4xl font-serif italic tracking-wider drop-shadow-lg">{art.title}</h4>
                </motion.div>
                <div className="flex items-center space-x-8">
                    {art.status !== 'vendu' && (
                      <motion.button 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          onClick={(e) => {
                              e.stopPropagation();
                              const subject = encodeURIComponent(`${data.ui.priceInquiry}: ${art.title}`);
                              const body = encodeURIComponent(`${data.ui.inquiryMessage} ${art.title}\n\nLien de l'œuvre: ${window.location.origin}${window.location.pathname}?art=${art.id}`);
                              window.location.href = `mailto:${data.contact.inquiryEmail}?subject=${subject}&body=${body}`;
                          }}
                          className="px-8 py-3 border border-white/40 text-white text-[10px] uppercase tracking-widest hover:border-zen-gold hover:bg-zen-gold/10 transition-all backdrop-blur-sm"
                      >
                          Demander le prix
                      </motion.button>
                    )}
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        onClick={onClose} 
                        className="text-white/80 hover:text-white p-3 border border-white/20 rounded-full hover:border-zen-gold hover:bg-zen-gold/10 transition-all backdrop-blur-sm shadow-xl"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </motion.button>
                </div>
            </div>

            <motion.img 
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2 }}
                src={art.imageUrl} 
                className="max-w-full max-h-full object-contain relative z-10"
                alt="" 
            />

            {/* Immersion Lens */}
            <AnimatePresence>
                {showMagnifier && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute pointer-events-none z-50 rounded-full border-2 border-white/30 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-no-repeat"
                        style={{
                            width: '300px',
                            height: '300px',
                            left: `${magnifierPos.x - 150}px`,
                            top: `${magnifierPos.y - 150}px`,
                            backgroundImage: `url(${art.imageUrl})`,
                            backgroundSize: '400%',
                            backgroundPosition: `${magnifierPos.bgX}% ${magnifierPos.bgY}%`,
                        }}
                    >
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] rounded-full scale-[0.98] border border-white/10"></div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] uppercase tracking-[1em] z-[110]">
                Explorez le détail
            </div>

            {/* Custom high-end cursor */}
            <motion.div 
                className="absolute w-4 h-4 border border-zen-gold rounded-full pointer-events-none z-[130]"
                animate={{
                    x: magnifierPos.x - 8,
                    y: magnifierPos.y - 8,
                }}
                transition={{ type: 'spring', stiffness: 1000, damping: 50 }}
            />
        </motion.div>
    );
};

export default Gallery;