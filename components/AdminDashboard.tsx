import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteData } from '../context/SiteContext';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';

// Inline SVGs for icons to avoid dependency issues
const Icons = {
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Save: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Type: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Palette: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 112.828 2.828l-1.657 1.657M7 11h.01" /></svg>,
  Database: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m0 10c0 1.657-3.582 3-8 3s-8-1.343-8-3M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3m0 5c0 1.657-3.582 3-8 3s-8-1.343-8-3" /></svg>,
};

const AdminDashboard: React.FC = () => {
  const { data, updateData, isAdmin, setIsAdmin } = useSiteData();
  const [activeTab, setActiveTab] = useState<'titles' | 'artworks' | 'bio' | 'theme' | 'contact' | 'ui'>('titles');
  const [localData, setLocalData] = useState(data);
  
  // Update local data when site data changes (e.g. on load)
  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<number | string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ type: 'artwork' | 'bio' | 'artwork_new' | 'hero' | 'bio_secondary' | 'hero_slideshow', id?: number, index?: number } | null>(null);
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  if (!isAdmin) return null;

  const sqlScript = `
-- 1. Créer la table des configurations générales
CREATE TABLE IF NOT EXISTS site_configs (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

-- 2. Créer la table des œuvres
CREATE TABLE IF NOT EXISTS artworks (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    year TEXT,
    category TEXT,
    image_url TEXT,
    description TEXT,
    price TEXT,
    dimensions TEXT,
    availability TEXT,
    status TEXT DEFAULT 'disponible',
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Désactiver RLS ou créer des politiques d'accès public (TEST ONLY)
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read" ON site_configs;
DROP POLICY IF EXISTS "Allow all insert" ON site_configs;
DROP POLICY IF EXISTS "Allow all update" ON site_configs;
CREATE POLICY "Allow all read" ON site_configs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow all insert" ON site_configs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow all update" ON site_configs FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all read" ON artworks;
DROP POLICY IF EXISTS "Allow all insert" ON artworks;
DROP POLICY IF EXISTS "Allow all update" ON artworks;
DROP POLICY IF EXISTS "Allow all delete" ON artworks;
CREATE POLICY "Allow all read" ON artworks FOR SELECT TO anon USING (true);
CREATE POLICY "Allow all insert" ON artworks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow all update" ON artworks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON artworks FOR DELETE TO anon USING (true);
  `;

  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert("Erreur: Impossible d'initialiser le contexte canvas.");
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Using 0.6 for better compression to fit in database columns
        callback(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => {
        alert("Erreur lors du chargement de l'image.");
        setIsUploading(null);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      alert("Erreur lors de la lecture du fichier.");
      setIsUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTestConnection = async () => {
    console.log("Testing Supabase connection...");
    try {
      const { data, error } = await supabase.from('site_configs').select('id').limit(1);
      if (error) {
        console.error("Supabase Test Error:", error);
        throw error;
      }
      alert("✅ Connexion réussie ! Les tables Supabase sont accessibles.");
    } catch (error: any) {
      console.error("Detailed Connection Error:", error);
      if (error.code === '42P01') {
        alert("❌ Erreur : Les tables n'ont pas été trouvées. Avez-vous bien exécuté le script SQL dans Supabase ?");
      } else if (error.message === 'Failed to fetch') {
        alert("❌ Erreur : Impossible de contacter Supabase. Vérifiez votre VITE_SUPABASE_URL.");
      } else {
        alert("❌ Erreur de connexion : " + (error.message || "Inconnu") + " (Code: " + (error.code || "N/A") + ")");
      }
    }
  };

  const handleSave = async () => {
    console.log("Starting save process...", localData);
    setIsSaving(true);
    try {
      console.log("Calling updateData...");
      await updateData(localData);
      console.log("Save successful!");
      alert("Modifications enregistrées avec succès dans Supabase !");
    } catch (error: any) {
      console.error("Save error detailed:", error);
      const msg = error.message || "Erreur inconnue";
      alert(`Erreur lors de l'enregistrement: ${msg}. Vérifiez que les tables Supabase sont bien créées.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddArtwork = () => {
    const newArt = {
      id: Date.now(),
      title: "Nouvelle Œuvre",
      category: "Peinture",
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000",
      year: new Date().getFullYear().toString(),
      description: "Description de l'œuvre",
      dimensions: "80 x 100 cm",
      status: "disponible" as const
    };
    setLocalData({ ...localData, artworks: [newArt, ...localData.artworks] });
  };

  const handleImportNewArtwork = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Importing new artwork:", file.name);
    setIsUploading('new');
    
    compressImage(file, (base64) => {
      console.log("Compression success for new artwork");
      const newArt = {
        id: Date.now(),
        title: file.name.split('.')[0] || "Nouvelle Œuvre",
        category: "Peinture",
        imageUrl: base64,
        year: new Date().getFullYear().toString(),
        description: "",
        dimensions: "N/A",
        status: "disponible" as const
      };
      setLocalData(prev => ({ ...prev, artworks: [newArt, ...prev.artworks] }));
      setIsUploading(null);
    });
    // Reset input
    e.target.value = '';
  };

  const removeArtwork = (id: number) => {
    setLocalData(prev => ({ ...prev, artworks: prev.artworks.filter(a => a.id !== id) }));
  };

  const handleImageUpload = (artId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Updating image for artwork:", artId);
    setIsUploading(artId);
    compressImage(file, (base64) => {
      console.log("Compression success for artwork:", artId);
      setLocalData(prev => ({
        ...prev,
        artworks: prev.artworks.map(a => a.id === artId ? { ...a, imageUrl: base64 } : a)
      }));
      setIsUploading(null);
    });
    // Reset input
    e.target.value = '';
  };

  const handleBioImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Updating bio image");
    setIsUploading('bio');
    compressImage(file, (base64) => {
      console.log("Compression success for bio portrait");
      setLocalData(prev => ({ ...prev, bio: { ...prev.bio, imageUrl: base64 } }));
      setIsUploading(null);
    });
    // Reset input
    e.target.value = '';
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Updating hero image");
    setIsUploading('hero');
    compressImage(file, (base64) => {
      setLocalData(prev => ({ ...prev, hero: { ...prev.hero, imageUrl: base64 } }));
      setIsUploading(null);
    });
    e.target.value = '';
  };

  const handleBioSecondaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Updating bio secondary image");
    setIsUploading('bio_secondary');
    compressImage(file, (base64) => {
      setLocalData(prev => ({ ...prev, bio: { ...prev.bio, secondaryImageUrl: base64 } }));
      setIsUploading(null);
    });
    e.target.value = '';
  };

  const handleHeroSlideshowImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(`hero_slide_${index}`);
    compressImage(file, (base64) => {
      const newSlides = [...localData.hero.slideshowImages];
      newSlides[index] = base64;
      setLocalData(prev => ({ ...prev, hero: { ...prev.hero, slideshowImages: newSlides } }));
      setIsUploading(null);
    });
    e.target.value = '';
  };

  const handleAddHeroSlide = () => {
    const newSlide = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000";
    setLocalData(prev => ({ 
      ...prev, 
      hero: { 
        ...prev.hero, 
        slideshowImages: [...(prev.hero.slideshowImages || []), newSlide] 
      } 
    }));
  };

  const removeHeroSlide = (index: number) => {
    const newSlides = localData.hero.slideshowImages.filter((_, i) => i !== index);
    setLocalData(prev => ({ ...prev, hero: { ...prev.hero, slideshowImages: newSlides } }));
  };

  const triggerUpload = (type: 'artwork' | 'bio' | 'artwork_new' | 'hero' | 'bio_secondary' | 'hero_slideshow', id?: number, index?: number) => {
    setUploadTarget({ type, id, index });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadTarget) return;
    
    if (uploadTarget.type === 'artwork_new') {
      handleImportNewArtwork(e);
    } else if (uploadTarget.type === 'bio') {
      handleBioImageUpload(e);
    } else if (uploadTarget.type === 'hero') {
      handleHeroImageUpload(e);
    } else if (uploadTarget.type === 'bio_secondary') {
      handleBioSecondaryImageUpload(e);
    } else if (uploadTarget.type === 'hero_slideshow' && uploadTarget.index !== undefined) {
      handleHeroSlideshowImageUpload(uploadTarget.index, e);
    } else if (uploadTarget.type === 'artwork' && uploadTarget.id !== undefined) {
      handleImageUpload(uploadTarget.id, e);
    }
    
    setUploadTarget(null);
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-zen-stone/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zen-ivory w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zen-beige flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-full bg-zen-gold flex items-center justify-center text-white">
                <Icons.Save />
             </div>
             <h2 className="text-xl font-serif italic text-zen-stone">Tableau de Bord - Frida Kahlo Mode</h2>
          </div>
          <div className="flex items-center space-x-4">
             {SUPABASE_CONFIGURED ? (
               <div className="flex items-center space-x-2 text-[8px] uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <Icons.Database />
                 <span>Supabase Connecté</span>
               </div>
             ) : (
               <div className="flex items-center space-x-2 text-[8px] uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                 <Icons.Database />
                 <span>Supabase non configuré</span>
               </div>
             )}
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 ${isSaving ? 'bg-zen-taupe' : 'bg-zen-stone'} text-white text-[10px] uppercase tracking-widest rounded-full hover:bg-zen-gold transition-colors flex items-center space-x-2`}
             >
                <div className={isSaving ? "animate-spin" : ""}>
                   <Icons.Save />
                </div>
                <span>{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
             </button>
             <button 
                onClick={() => setShowSqlHelp(true)}
                className="px-4 py-2 bg-zen-ivory text-zen-stone text-[10px] uppercase tracking-widest rounded-full border border-zen-beige hover:bg-zen-beige transition-colors flex items-center space-x-2"
             >
                <Icons.Palette />
                <span>Aide SQL</span>
             </button>
             <button 
                onClick={handleTestConnection}
                className="px-4 py-2 bg-zen-ivory text-zen-stone text-[10px] uppercase tracking-widest rounded-full border border-zen-beige hover:bg-zen-beige transition-colors flex items-center space-x-2"
             >
                <Icons.Database />
                <span>Tester Connexion</span>
             </button>
             <button 
                onClick={() => setIsAdmin(false)}
                className="p-2 hover:bg-zen-beige rounded-full transition-colors text-zen-taupe"
             >
                <Icons.X />
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-20 md:w-64 border-r border-zen-beige bg-zen-beige/10 p-4 space-y-2">
            {[
              { id: 'titles', icon: Icons.Type, label: 'Textes & Titres' },
              { id: 'artworks', icon: Icons.Image, label: 'Galerie' },
              { id: 'bio', icon: Icons.Type, label: 'Biographie' },
              { id: 'contact', icon: Icons.Save, label: 'Contact' },
              { id: 'ui', icon: Icons.Type, label: 'Interface' },
              { id: 'theme', icon: Icons.Palette, label: 'Design' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white shadow-sm text-zen-gold border border-zen-beige' 
                    : 'text-zen-taupe hover:bg-white/50'
                }`}
              >
                <tab.icon />
                <span className="hidden md:block text-xs uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'titles' && (
                <motion.div key="titles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Prénom (Hero)</label>
                          <input 
                            type="text" 
                            value={localData.hero.titleTop}
                            onChange={e => setLocalData({...localData, hero: {...localData.hero, titleTop: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Nom (Hero)</label>
                          <input 
                            type="text" 
                            value={localData.hero.titleBottom}
                            onChange={e => setLocalData({...localData, hero: {...localData.hero, titleBottom: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Sous-titre Hero</label>
                          <input 
                            type="text" 
                            value={localData.hero.subtitle}
                            onChange={e => setLocalData({...localData, hero: {...localData.hero, subtitle: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Localisation Hero</label>
                          <input 
                            type="text" 
                            value={localData.hero.location}
                            onChange={e => setLocalData({...localData, hero: {...localData.hero, location: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Citation Hero</label>
                          <textarea 
                            rows={2}
                            value={localData.hero.quote}
                            onChange={e => setLocalData({...localData, hero: {...localData.hero, quote: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-8 border-t border-zen-beige">
                        <div className="flex justify-between items-center mb-6">
                           <div>
                              <h4 className="text-[11px] uppercase tracking-widest text-zen-stone font-bold">Diaporama Hero</h4>
                              <p className="text-[9px] text-zen-taupe mt-1">Gérez les images qui défilent en page d'accueil</p>
                           </div>
                          <button 
                            onClick={handleAddHeroSlide}
                            className="text-[9px] uppercase tracking-widest bg-zen-stone text-white px-5 py-2 rounded-full hover:bg-zen-gold transition-all flex items-center space-x-2"
                          >
                            <Icons.Plus />
                            <span>Ajouter une image</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                           {localData.hero.slideshowImages?.map((img, idx) => (
                             <div key={idx} className="relative group aspect-[3/4] bg-white border border-zen-beige rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {isUploading === `hero_slide_${idx}` && (
                                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
                                    <div className="animate-spin text-white scale-125"><Icons.Save /></div>
                                  </div>
                                )}
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-2 right-2 bg-zen-stone/80 text-white text-[8px] px-2 py-1 rounded-md backdrop-blur-sm z-10 opacity-60">
                                   {idx + 1}
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                   <button 
                                     onClick={() => triggerUpload('hero_slideshow', undefined, idx)}
                                     title="Changer l'image"
                                     className="p-2 bg-white text-zen-stone rounded-full hover:bg-zen-gold hover:text-white transition-all transform hover:scale-110"
                                   >
                                     <Icons.Upload />
                                   </button>
                                   <button 
                                     onClick={() => removeHeroSlide(idx)}
                                     title="Supprimer"
                                     className="p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                                   >
                                     <Icons.Trash />
                                   </button>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

              {activeTab === 'artworks' && (
                <motion.div key="artworks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-8 border-b border-zen-beige pb-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Titre Galerie</label>
                      <input 
                        type="text" 
                        value={localData.gallery.title}
                        onChange={e => setLocalData({...localData, gallery: {...localData.gallery, title: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none font-serif italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Sous-titre Galerie</label>
                      <input 
                        type="text" 
                        value={localData.gallery.subtitle}
                        onChange={e => setLocalData({...localData, gallery: {...localData.gallery, subtitle: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-sm uppercase tracking-widest font-bold">Gestion des Œuvres</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                         onClick={() => triggerUpload('artwork_new')}
                         className="flex items-center space-x-2 text-[10px] uppercase tracking-widest bg-zen-gold text-white px-6 py-3 rounded-full hover:bg-zen-gold/90 transition-colors shadow-lg"
                      >
                        <Icons.Upload />
                        <span>Importer une image</span>
                      </button>
                      <button 
                        onClick={handleAddArtwork}
                        className="flex items-center space-x-2 text-[10px] uppercase tracking-widest bg-zen-stone text-white px-6 py-3 rounded-full hover:bg-zen-stone/90 transition-colors shadow-lg"
                      >
                        <Icons.Plus />
                        <span>Créer manuellement</span>
                      </button>
                    </div>
                  </div>
                  {isUploading === 'new' && (
                    <div className="bg-zen-beige/30 p-8 rounded-2xl border-2 border-dashed border-zen-gold/30 flex flex-col items-center justify-center space-y-4 animate-pulse">
                      <div className="animate-spin text-zen-gold">
                        <Icons.Save />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-zen-gold font-bold">Traitement de l'image en cours...</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localData.artworks.map((art) => (
                      <div key={art.id} className="bg-white p-6 rounded-2xl border border-zen-beige relative group shadow-sm hover:shadow-md transition-shadow">
                        <button 
                          onClick={() => removeArtwork(art.id)}
                          className="absolute top-4 right-4 bg-red-50 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-500 hover:text-white"
                        >
                          <Icons.Trash />
                        </button>
                        <div className="flex gap-6">
                            <div className="w-32 flex-shrink-0 flex flex-col space-y-2">
                              <div className="w-32 h-32 bg-zen-beige rounded-xl overflow-hidden border border-zen-beige/50 relative">
                                {isUploading === art.id ? (
                                  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                    <div className="animate-spin text-white">
                                      <Icons.Save />
                                    </div>
                                  </div>
                                ) : null}
                                <img src={art.imageUrl} className="w-full h-full object-cover" alt="" />
                              </div>
                              <button 
                                onClick={() => triggerUpload('artwork', art.id)}
                                className="bg-zen-beige/50 hover:bg-zen-gold hover:text-white py-1.5 px-3 rounded-lg text-[8px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 font-bold border border-transparent hover:border-zen-gold/20"
                              >
                                <Icons.Upload />
                                <span>Importer (P)</span>
                              </button>
                            </div>
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest text-zen-taupe">Titre</label>
                              <input 
                                className="w-full p-2 text-sm border border-zen-beige rounded bg-zen-beige/5 focus:border-zen-gold outline-none"
                                value={art.title}
                                onChange={e => {
                                  const newArts = localData.artworks.map(a => a.id === art.id ? {...a, title: e.target.value} : a);
                                  setLocalData({...localData, artworks: newArts});
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest text-zen-taupe">Catégorie</label>
                              <select 
                                className="w-full p-2 text-sm border border-zen-beige rounded bg-zen-beige/5 focus:border-zen-gold outline-none"
                                value={art.category}
                                onChange={e => {
                                  const newArts = localData.artworks.map(a => a.id === art.id ? {...a, category: e.target.value as 'Peinture' | 'Sculpture'} : a);
                                  setLocalData({...localData, artworks: newArts});
                                }}
                              >
                                <option value="Peinture">Tableau</option>
                                <option value="Peinture">Peinture</option>
                                <option value="Sculpture">Sculpture</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest text-zen-taupe">Statut</label>
                              <select 
                                className="w-full p-2 text-sm border border-zen-beige rounded bg-zen-beige/5 focus:border-zen-gold outline-none"
                                value={art.status || 'disponible'}
                                onChange={e => {
                                  const newArts = localData.artworks.map(a => a.id === art.id ? {...a, status: e.target.value as 'vendu' | 'disponible'} : a);
                                  setLocalData({...localData, artworks: newArts});
                                }}
                              >
                                <option value="disponible">Disponible</option>
                                <option value="vendu">Vendu</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest text-zen-taupe">Année</label>
                            <input 
                              className="w-full p-2 text-sm border border-zen-beige rounded bg-zen-beige/5 focus:border-zen-gold outline-none"
                              value={art.year}
                              onChange={e => {
                                const newArts = localData.artworks.map(a => a.id === art.id ? {...a, year: e.target.value} : a);
                                setLocalData({...localData, artworks: newArts});
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest text-zen-taupe">Dimensions</label>
                            <input 
                              className="w-full p-2 text-sm border border-zen-beige rounded bg-zen-beige/5 focus:border-zen-gold outline-none"
                              value={art.dimensions}
                              onChange={e => {
                                const newArts = localData.artworks.map(a => a.id === art.id ? {...a, dimensions: e.target.value} : a);
                                setLocalData({...localData, artworks: newArts});
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1 mt-4">
                          <label className="text-[9px] uppercase tracking-widest text-zen-taupe">Lien Image</label>
                          <div className="flex space-x-2">
                            <input 
                              className="flex-1 p-2 text-[10px] border border-zen-beige rounded bg-zen-beige/5 focus:border-zen-gold outline-none font-mono"
                              value={art.imageUrl}
                              onChange={e => {
                                const newArts = localData.artworks.map(a => a.id === art.id ? {...a, imageUrl: e.target.value} : a);
                                setLocalData({...localData, artworks: newArts});
                              }}
                            />
                            <button 
                              onClick={() => triggerUpload('artwork', art.id)}
                              className="bg-zen-beige hover:bg-zen-gold hover:text-white p-2.5 rounded transition-colors flex items-center justify-center"
                            >
                              <Icons.Upload />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'bio' && (
                <motion.div key="bio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Portrait Artiste</label>
                      <div className="relative group aspect-[3/4] bg-zen-beige rounded-2xl overflow-hidden border border-zen-beige/50">
                        {isUploading === 'bio' && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="animate-spin text-white"><Icons.Save /></div>
                          </div>
                        )}
                        <img 
                          src={localData.bio.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                        <button 
                          onClick={() => triggerUpload('bio')}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] uppercase tracking-widest font-bold"
                        >
                          Changer le portrait
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Titre Biographie</label>
                          <input 
                            type="text" 
                            value={localData.bio.title}
                            onChange={e => setLocalData({...localData, bio: {...localData.bio, title: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none font-serif italic"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Sous-titre Biographie</label>
                          <input 
                            type="text" 
                            value={localData.bio.subtitle}
                            onChange={e => setLocalData({...localData, bio: {...localData.bio, subtitle: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Rôle / Sous-titre</label>
                          <input 
                            type="text" 
                            value={localData.bio.role}
                            onChange={e => setLocalData({...localData, bio: {...localData.bio, role: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Lieu Atelier</label>
                          <input 
                            type="text" 
                            value={localData.bio.studioLocation}
                            onChange={e => setLocalData({...localData, bio: {...localData.bio, studioLocation: e.target.value}})}
                            className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Portrait Secondaire (Cercle)</label>
                        <div className="flex items-center space-x-6">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-zen-beige">
                            {isUploading === 'bio_secondary' && (
                              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10 text-white">
                                <div className="animate-spin scale-50"><Icons.Save /></div>
                              </div>
                            )}
                            <img src={localData.bio.secondaryImageUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                          <button 
                            onClick={() => triggerUpload('bio_secondary')}
                            className="px-4 py-2 border border-zen-beige rounded-lg text-[8px] uppercase tracking-widest font-bold hover:bg-zen-beige transition-colors"
                          >
                            Changer l'image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Texte Biographie</label>
                    <textarea 
                      rows={10}
                      value={localData.bio.text}
                      onChange={e => setLocalData({...localData, bio: {...localData.bio, text: e.target.value}})}
                      className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none resize-none leading-relaxed"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Email de contact</label>
                      <input 
                        type="email" 
                        value={localData.contact.email}
                        onChange={e => setLocalData({...localData, contact: {...localData.contact, email: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Email des demandes (Prix)</label>
                      <input 
                        type="email" 
                        value={localData.contact.inquiryEmail}
                        onChange={e => setLocalData({...localData, contact: {...localData.contact, inquiryEmail: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                  {/* UI Text Settings */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-xs font-serif text-zen-stone italic border-b border-zen-beige pb-2">Textes de l'Interface</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Catégorie Tableaux</label>
                        <input 
                          type="text" 
                          value={localData.ui.galleryPaintings}
                          onChange={e => setLocalData({...localData, ui: {...localData.ui, galleryPaintings: e.target.value}})}
                          className="w-full p-2 border border-zen-beige rounded text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Catégorie Sculptures</label>
                        <input 
                          type="text" 
                          value={localData.ui.gallerySculptures}
                          onChange={e => setLocalData({...localData, ui: {...localData.ui, gallerySculptures: e.target.value}})}
                          className="w-full p-2 border border-zen-beige rounded text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Texte Bouton Collection</label>
                        <input 
                          type="text" 
                          value={localData.ui.heroCollection}
                          onChange={e => setLocalData({...localData, ui: {...localData.ui, heroCollection: e.target.value}})}
                          className="w-full p-2 border border-zen-beige rounded text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Texte d'appel (Hero)</label>
                        <input 
                          type="text" 
                          value={localData.ui.heroExplore}
                          onChange={e => setLocalData({...localData, ui: {...localData.ui, heroExplore: e.target.value}})}
                          className="w-full p-2 border border-zen-beige rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Style & Thème */}
                  <div className="space-y-4 pt-6 mt-6 border-t border-zen-beige">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-zen-gold font-bold">Personnalisation Visuelle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-widest text-zen-taupe font-bold">Couleur d'Accent</label>
                          <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                            <input type="color" value={localData.theme.accent} onChange={e => setLocalData({...localData, theme: {...localData.theme, accent: e.target.value}})} className="w-10 h-10 border-0 p-0" />
                            <input type="text" value={localData.theme.accent} onChange={e => setLocalData({...localData, theme: {...localData.theme, accent: e.target.value}})} className="flex-1 text-[10px] font-mono border-0 outline-none" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-widest text-zen-taupe font-bold">Couleur Texte</label>
                          <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                            <input type="color" value={localData.theme.primary} onChange={e => setLocalData({...localData, theme: {...localData.theme, primary: e.target.value}})} className="w-10 h-10 border-0 p-0" />
                            <input type="text" value={localData.theme.primary} onChange={e => setLocalData({...localData, theme: {...localData.theme, primary: e.target.value}})} className="flex-1 text-[10px] font-mono border-0 outline-none" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-widest text-zen-taupe font-bold">Couleur de Fond</label>
                          <div className="flex items-center space-x-3 p-2 bg-white rounded shadow-sm">
                            <input type="color" value={localData.theme.bg} onChange={e => setLocalData({...localData, theme: {...localData.theme, bg: e.target.value}})} className="w-10 h-10 border-0 p-0" />
                            <input type="text" value={localData.theme.bg} onChange={e => setLocalData({...localData, theme: {...localData.theme, bg: e.target.value}})} className="flex-1 text-[10px] font-mono border-0 outline-none" />
                          </div>
                       </div>
                    </div>
                  </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Téléphone</label>
                      <input 
                        type="text" 
                        value={localData.contact.phone}
                        onChange={e => setLocalData({...localData, contact: {...localData.contact, phone: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Adresse / Localisation</label>
                    <input 
                      type="text" 
                      value={localData.contact.address}
                      onChange={e => setLocalData({...localData, contact: {...localData.contact, address: e.target.value}})}
                      className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Citation Contact</label>
                    <textarea 
                      rows={3}
                      value={localData.contact.quote}
                      onChange={e => setLocalData({...localData, contact: {...localData.contact, quote: e.target.value}})}
                      className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none resize-none font-serif italic"
                    />
                  </div>

                  <div className="pt-6 border-t border-zen-beige">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-zen-stone mb-6">Liens Sociaux</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Instagram</label>
                        <input 
                          type="text" 
                          value={localData.socials.instagram}
                          onChange={e => setLocalData({...localData, socials: {...localData.socials, instagram: e.target.value}})}
                          className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Facebook</label>
                        <input 
                          type="text" 
                          value={localData.socials.facebook}
                          onChange={e => setLocalData({...localData, socials: {...localData.socials, facebook: e.target.value}})}
                          className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">LinkedIn</label>
                        <input 
                          type="text" 
                          value={localData.socials.linkedin}
                          onChange={e => setLocalData({...localData, socials: {...localData.socials, linkedin: e.target.value}})}
                          className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ui' && (
                <motion.div key="ui" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Menu: Accueil</label>
                      <input 
                        type="text" 
                        value={localData.ui.navHome}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, navHome: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Menu: Galerie</label>
                      <input 
                        type="text" 
                        value={localData.ui.navGallery}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, navGallery: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Menu: À Propos</label>
                      <input 
                        type="text" 
                        value={localData.ui.navAbout}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, navAbout: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Menu: Contact</label>
                      <input 
                        type="text" 
                        value={localData.ui.navContact}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, navContact: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Bouton Administration (Pied de page)</label>
                      <input 
                        type="text" 
                        value={localData.ui.adminAccess}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, adminAccess: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Bouton Hero: La Collection</label>
                      <input 
                        type="text" 
                        value={localData.ui.heroCollection}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, heroCollection: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Bouton Hero: Explorer</label>
                      <input 
                        type="text" 
                        value={localData.ui.heroExplore}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, heroExplore: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Titre Galerie (Tableaux)</label>
                      <input 
                        type="text" 
                        value={localData.ui.galleryPaintings}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, galleryPaintings: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Titre Galerie (Sculptures)</label>
                      <input 
                        type="text" 
                        value={localData.ui.gallerySculptures}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, gallerySculptures: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Label: Demande de prix</label>
                      <input 
                        type="text" 
                        value={localData.ui.priceInquiry}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, priceInquiry: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Message de demande automatique</label>
                      <input 
                        type="text" 
                        value={localData.ui.inquiryMessage}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, inquiryMessage: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Titre Section Contact</label>
                      <input 
                        type="text" 
                        value={localData.ui.contactTitle}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, contactTitle: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Sous-titre Section Contact</label>
                      <input 
                        type="text" 
                        value={localData.ui.contactSubtitle}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, contactSubtitle: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-2 pt-4 border-t border-zen-beige">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Form: Nom</label>
                            <input 
                                type="text" 
                                value={localData.ui.formName}
                                onChange={e => setLocalData({...localData, ui: {...localData.ui, formName: e.target.value}})}
                                className="w-full p-2 text-xs border border-zen-beige rounded focus:border-zen-gold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Form: Email</label>
                            <input 
                                type="text" 
                                value={localData.ui.formEmail}
                                onChange={e => setLocalData({...localData, ui: {...localData.ui, formEmail: e.target.value}})}
                                className="w-full p-2 text-xs border border-zen-beige rounded focus:border-zen-gold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Form: Sujet</label>
                            <input 
                                type="text" 
                                value={localData.ui.formSubject}
                                onChange={e => setLocalData({...localData, ui: {...localData.ui, formSubject: e.target.value}})}
                                className="w-full p-2 text-xs border border-zen-beige rounded focus:border-zen-gold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Form: Message</label>
                            <input 
                                type="text" 
                                value={localData.ui.formMessage}
                                onChange={e => setLocalData({...localData, ui: {...localData.ui, formMessage: e.target.value}})}
                                className="w-full p-2 text-xs border border-zen-beige rounded focus:border-zen-gold outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Form: Bouton Envoyer</label>
                      <input 
                        type="text" 
                        value={localData.ui.formSubmit}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, formSubmit: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Succès Formulaire</label>
                      <input 
                        type="text" 
                        value={localData.ui.formSuccess}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, formSuccess: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Titre Pied de page: Social</label>
                      <input 
                        type="text" 
                        value={localData.ui.footerSocial}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, footerSocial: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Mot de Passe Administration</label>
                      <input 
                        type="text" 
                        placeholder="Par défaut: FRIDA KAHLO"
                        value={localData.adminPassword}
                        onChange={e => setLocalData({...localData, adminPassword: e.target.value})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe font-bold">Copyright (Bas de page)</label>
                      <input 
                        type="text" 
                        value={localData.ui.footerCopyright}
                        onChange={e => setLocalData({...localData, ui: {...localData.ui, footerCopyright: e.target.value}})}
                        className="w-full p-3 border border-zen-beige rounded-md focus:border-zen-gold outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'theme' && (
                <motion.div key="theme" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-[10px] uppercase tracking-widest flex items-center space-x-2">
                    <span>Note: Le changement des couleurs globales nécessite également de mettre à jour le fichier CSS, cette section modifie les styles inline.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-center space-x-4">
                      <input 
                        type="color" 
                        value={localData.theme.accent}
                        onChange={e => setLocalData({...localData, theme: {...localData.theme, accent: e.target.value}})}
                        className="w-12 h-12 rounded-full cursor-pointer"
                      />
                      <span className="text-xs uppercase tracking-widest font-bold">Couleur Accent (Doré)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="color" 
                        value={localData.theme.primary}
                        onChange={e => setLocalData({...localData, theme: {...localData.theme, primary: e.target.value}})}
                        className="w-12 h-12 rounded-full cursor-pointer"
                      />
                      <span className="text-xs uppercase tracking-widest font-bold">Couleur Primaire (Texte)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="color" 
                        value={localData.theme.bg}
                        onChange={e => setLocalData({...localData, theme: {...localData.theme, bg: e.target.value}})}
                        className="w-12 h-12 rounded-full cursor-pointer border border-zen-beige"
                      />
                      <span className="text-xs uppercase tracking-widest font-bold">Couleur Fond</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <input 
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />

      {/* SQL Help Modal */}
      {showSqlHelp && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-zen-beige flex justify-between items-center">
              <h3 className="text-lg font-serif italic text-zen-stone">Configuration de la Base de Données</h3>
              <button onClick={() => setShowSqlHelp(false)} className="p-2 hover:bg-zen-beige rounded-full transition-colors">
                <Icons.X />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-zen-taupe leading-relaxed">
                Si rien ne s'affiche dans votre Dashboard ou si les bases de données sont vides, vous devez exécuter ce script dans le <strong>SQL Editor</strong> de votre projet Supabase :
              </p>
              <div className="relative">
                <pre className="bg-zen-stone text-zen-ivory p-4 rounded-xl text-[10px] overflow-x-auto font-mono leading-relaxed">
                  {sqlScript}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(sqlScript);
                    alert("Script copié dans le presse-papier !");
                  }}
                  className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-[8px] uppercase tracking-widest transition-colors backdrop-blur-md"
                >
                  Copier
                </button>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                <div className="text-blue-500 mt-0.5"><Icons.Database /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Note sur la sécurité</p>
                  <p className="text-[10px] text-blue-600 leading-relaxed">Ce script active l'accès public (anon) pour faciliter le test. Pour un projet en production, vous devriez configurer des politiques plus restrictives basées sur l'authentification.</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-zen-beige/10 border-t border-zen-beige flex justify-end">
              <button 
                onClick={() => setShowSqlHelp(false)}
                className="px-6 py-2 bg-zen-stone text-white text-[10px] uppercase tracking-widest rounded-full hover:bg-zen-gold transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
