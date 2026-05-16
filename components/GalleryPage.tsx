import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteData } from '../context/SiteContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Maximize2, X, Filter } from 'lucide-react';

const GalleryPage: React.FC = () => {
  const { data } = useSiteData();
  const [filter, setFilter] = useState<'Tous' | 'Peinture' | 'Sculpture'>('Tous');
  const [selectedArt, setSelectedArt] = useState<any | null>(null);

  const filteredArtworks = data.artworks.filter(art => 
    filter === 'Tous' || art.category === filter
  );

  return (
    <div className="min-h-screen bg-zen-bg pt-32 pb-20 px-6">
      {/* Navigation & Header */}
      <div className="container mx-auto max-w-7xl">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-3 text-zen-taupe hover:text-zen-gold transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform duration-300" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Retour à l'accueil</span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-zen-beige pb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-serif text-zen-stone italic leading-tight">
              L'Espace <br /> <span className="pl-12 md:pl-24">Contemplatif</span>
            </h1>
            <p className="text-zen-taupe font-light tracking-[0.2em] uppercase text-xs">
              Exploration complète de la collection Asmae Laaroubi
            </p>
          </div>
          
          <div className="flex items-center space-x-8">
            {(['Tous', 'Peinture', 'Sculpture'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative text-[10px] uppercase tracking-[0.3em] font-bold transition-colors ${
                  filter === f ? 'text-zen-gold' : 'text-zen-stone/40 hover:text-zen-stone'
                }`}
              >
                {f}
                {filter === f && (
                  <motion.div 
                    layoutId="filter-underline"
                    className="absolute -bottom-2 left-0 right-0 h-px bg-zen-gold"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry-like Grid */}
        <motion.div 
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
        >
          <AnimatePresence>
            {filteredArtworks.map((art, idx) => (
              <motion.div
                key={art.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="break-inside-avoid"
              >
                <div 
                  className="group relative bg-white p-4 shadow-xl hover:shadow-2xl transition-all duration-1000 cursor-none"
                  onClick={() => setSelectedArt(art)}
                  onMouseEnter={() => {
                     // Custom cursor logic can be added here
                  }}
                >
                  <div className="relative overflow-hidden aspect-auto">
                    {art.status === 'vendu' && (
                      <div className="absolute top-0 left-0 z-20 bg-red-600 text-white px-4 py-1.5 text-[8px] uppercase tracking-widest font-bold shadow-lg transform -rotate-12 -translate-x-2 translate-y-3 border border-white/40">
                        Vendu
                      </div>
                    )}
                    <motion.img 
                      src={art.imageUrl} 
                      alt={art.title}
                      className="w-full h-auto transition-transform duration-[2s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-zen-stone/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                       <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                          <Maximize2 size={24} />
                       </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2 border-t border-zen-beige pt-4 overflow-hidden">
                    <div className="flex justify-between items-start">
                       <h3 className="text-lg font-serif text-zen-stone italic group-hover:text-zen-gold transition-colors">{art.title}</h3>
                       <span className="text-[8px] uppercase tracking-widest text-zen-taupe mt-1.5">{art.year}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zen-taupe/60">{art.category} — {art.dimensions}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox / Immersive View */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-zen-stone/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12"
          >
            <button 
              onClick={() => setSelectedArt(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4"
            >
              <X size={40} strokeWidth={1} />
            </button>

            <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-white p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative"
              >
                {selectedArt.status === 'vendu' && (
                  <div className="absolute top-0 left-0 z-20 bg-red-600 text-white px-8 py-3 text-[12px] uppercase tracking-widest font-bold shadow-2xl transform -rotate-12 -translate-x-4 translate-y-6 border-2 border-white/40">
                    Vendu
                  </div>
                )}
                <img 
                  src={selectedArt.imageUrl} 
                  className="w-full h-auto max-h-[70vh] object-contain" 
                  alt={selectedArt.title} 
                />
              </motion.div>

              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white space-y-12"
              >
                <div className="space-y-4">
                  <div className="h-px w-20 bg-zen-gold"></div>
                  <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">{selectedArt.title}</h2>
                  <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.4em] text-white/60">
                    <span>{selectedArt.year}</span>
                    <span>•</span>
                    <span>{selectedArt.category}</span>
                  </div>
                </div>

                <p className="text-xl font-light leading-relaxed text-white/80 italic">
                  {selectedArt.description || "Une œuvre explorant l'équilibre délicat entre la forme et l'émotion."}
                </p>

                <div className="grid grid-cols-2 gap-12 pt-8 border-t border-white/10">
                   <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-white/40">Dimensions</p>
                      <p className="text-sm font-medium tracking-widest">{selectedArt.dimensions || "Variable"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-white/40">Disponibilité</p>
                      <p className="text-sm font-medium tracking-widest">{selectedArt.availability || "Sur Demande"}</p>
                   </div>
                </div>

                {selectedArt.status === 'vendu' ? (
                  <div className="pt-12">
                    <div className="inline-block px-10 py-4 bg-red-600/10 border border-red-600/30 text-red-500 text-xs uppercase tracking-[0.5em] font-bold">
                      Cette œuvre n'est plus disponible
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      const subject = encodeURIComponent(`${data.ui.priceInquiry}: ${selectedArt.title}`);
                      const body = encodeURIComponent(`${data.ui.inquiryMessage} ${selectedArt.title}\n\nLien de l'œuvre: ${window.location.origin}/gallery-full?art=${selectedArt.id}`);
                      window.location.href = `mailto:${data.contact.inquiryEmail}?subject=${subject}&body=${body}`;
                    }}
                    className="group flex items-center space-x-6 pt-12"
                  >
                    <span className="text-xs uppercase tracking-[0.5em] text-zen-gold group-hover:text-white transition-colors">Demander le prix</span>
                    <div className="w-20 h-px bg-zen-gold group-hover:w-40 group-hover:bg-white transition-all duration-700"></div>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative text Background */}
      <div className="fixed bottom-10 -left-20 text-[20vh] font-serif italic text-zen-stone/[0.02] -z-10 select-none whitespace-nowrap pointer-events-none">
        ASMAE LAAROUBI
      </div>
    </div>
  );
};

export default GalleryPage;
