import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { motion } from 'motion/react';

interface DeviceSelectorProps {
  onSelect: (mode: 'mobile' | 'pc') => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-zen-ivory flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-zen-stone italic"
          >
            Bienvenue dans l'Univers d'Asmae
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm uppercase tracking-[0.4em] text-zen-taupe"
          >
            Choisissez votre expérience de navigation
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Mobile Choice */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect('mobile')}
            className="group relative bg-white border border-zen-taupe/20 p-10 rounded-2xl shadow-sm hover:shadow-xl hover:border-zen-gold transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-zen-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="p-5 bg-zen-ivory rounded-full text-zen-taupe group-hover:text-zen-gold transition-colors">
                <Smartphone className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-zen-stone">Interface Mobile</h3>
                <p className="text-[10px] uppercase tracking-widest text-zen-taupe mt-2">Optimisée pour le tactile</p>
              </div>
            </div>
          </motion.button>

          {/* PC Choice */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect('pc')}
            className="group relative bg-white border border-zen-taupe/20 p-10 rounded-2xl shadow-sm hover:shadow-xl hover:border-zen-gold transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-zen-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="p-5 bg-zen-ivory rounded-full text-zen-taupe group-hover:text-zen-gold transition-colors">
                <Monitor className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-zen-stone">Interface PC</h3>
                <p className="text-[10px] uppercase tracking-widest text-zen-taupe mt-2">Expérience immersive grand écran</p>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] text-zen-taupe/60 italic"
        >
          Ce choix définit la mise en page initiale. Vous pourrez toujours redimensionner votre fenêtre.
        </motion.p>
      </div>
    </div>
  );
};

export default DeviceSelector;
