
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Bio from './components/Bio';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import GalleryPage from './components/GalleryPage';
import { useTranslation } from 'react-i18next';
import { SiteProvider, useSiteData } from './context/SiteContext';

const Home: React.FC<{ setActiveSection: React.Dispatch<React.SetStateAction<string>>, activeSection: string }> = ({ setActiveSection, activeSection }) => {
  const { t } = useTranslation();
  const { data } = useSiteData();
  const location = useLocation();
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', subject: t('contact.form.subjects.artwork', { defaultValue: 'Information Œuvre' }), message: '' });

  useEffect(() => {
    // Handle hash scrolling on load or path change
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: 'smooth'
          });
          setActiveSection(id);
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
      setActiveSection('home');
    }
  }, [location.hash, setActiveSection]);

  useEffect(() => {
    const handleInquiry = (e: any) => {
      const artworkTitle = e.detail.title;
      setFormData(prev => ({
        ...prev,
        subject: t('contact.form.subjects.artwork', { defaultValue: 'Information Œuvre' }),
        message: `${data.ui.inquiryMessage}${artworkTitle}`
      }));
    };

    window.addEventListener('artwork-inquiry', handleInquiry);
    return () => window.removeEventListener('artwork-inquiry', handleInquiry);
  }, [data.ui.inquiryMessage]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'gallery', 'about', 'contact'];
      const scrollPosition = window.scrollY + 120; // Offset pour la détection

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => {
      setFormStatus('sent');
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <>
      <Hero />
      <section id="gallery" className="py-32 bg-zen-beige/50 scroll-mt-20">
        <Gallery />
      </section>
      <section id="about" className="py-32 scroll-mt-20">
        <Bio />
      </section>
      <section id="contact" className="py-32 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm uppercase tracking-[0.6em] text-zen-taupe font-medium text-center mb-4">{t('contact.subtitle', { defaultValue: data.ui.contactSubtitle })}</h2>
            <h3 className="text-4xl md:text-6xl font-serif text-center mb-20 text-zen-stone italic">{t('contact.title', { defaultValue: data.ui.contactTitle })}</h3>
            
            <div className="grid md:grid-cols-2 gap-20">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-zen-taupe">{t('contact.atelier', { defaultValue: "L'Atelier" })}</p>
                  <p className="text-xl font-light leading-relaxed text-zen-stone italic">
                    {t('hero.quote', { defaultValue: data.contact.quote })}
                  </p>
                </div>
                
                <div className="space-y-6 font-light text-zen-stone/80 text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-px bg-zen-clay"></div>
                    <p>{data.contact.address}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-px bg-zen-clay"></div>
                    <p>{data.contact.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-px bg-zen-clay"></div>
                    <p>{data.contact.phone}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                {formStatus === 'sent' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-zen-clay/10 flex items-center justify-center text-zen-clay">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="font-serif text-2xl italic text-zen-stone">{t('contact.form.success', { defaultValue: data.ui.formSuccess })}</h3>
                    <p className="text-xs uppercase tracking-widest text-zen-taupe">{t('contact.form.responseTime', { defaultValue: 'Réponse sous 48h' })}</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className={`space-y-6 transition-opacity duration-500 ${formStatus === 'sending' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe px-1">{t('contact.form.name', { defaultValue: data.ui.formName })}</label>
                        <input 
                          required 
                          type="text" 
                          className="w-full bg-transparent border-b border-zen-taupe/20 py-3 px-1 focus:border-zen-clay outline-none transition-colors font-light" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-zen-taupe px-1">{t('contact.form.email', { defaultValue: data.ui.formEmail })}</label>
                        <input 
                          required 
                          type="email" 
                          className="w-full bg-transparent border-b border-zen-taupe/20 py-3 px-1 focus:border-zen-clay outline-none transition-colors font-light" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe px-1">{t('contact.form.subject', { defaultValue: data.ui.formSubject })}</label>
                      <select 
                        className="w-full bg-transparent border-b border-zen-taupe/20 py-3 px-1 focus:border-zen-clay outline-none transition-colors font-light cursor-pointer"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                      >
                        <option value={t('contact.form.subjects.artwork', { defaultValue: 'Information Œuvre' })}>{t('contact.form.subjects.artwork', { defaultValue: 'Information Œuvre' })}</option>
                        <option value={t('contact.form.subjects.collaboration', { defaultValue: 'Collaboration' })}>{t('contact.form.subjects.collaboration', { defaultValue: 'Collaboration' })}</option>
                        <option value={t('contact.form.subjects.other', { defaultValue: 'Autre' })}>{t('contact.form.subjects.other', { defaultValue: 'Autre' })}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-zen-taupe px-1">{t('contact.form.message', { defaultValue: data.ui.formMessage })}</label>
                      <textarea 
                        required 
                        rows={4} 
                        className="w-full bg-transparent border-b border-zen-taupe/20 py-3 px-1 focus:border-zen-clay outline-none transition-colors resize-none font-light"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={formStatus === 'sending'}
                      className="group flex items-center space-x-4 pt-4"
                    >
                      <span className="text-xs uppercase tracking-[0.4em] text-zen-stone group-hover:text-zen-clay transition-colors">
                        {formStatus === 'sending' ? t('contact.form.sending', { defaultValue: 'Envoi...' }) : t('contact.form.submit', { defaultValue: data.ui.formSubmit })}
                      </span>
                      <div className="w-12 h-px bg-zen-stone group-hover:w-20 group-hover:bg-zen-clay transition-all duration-500"></div>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

import DeviceSelector from './components/DeviceSelector';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useSiteData();
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/gallery-full') {
      setActiveSection('gallery');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Dynamically set CSS variables for theme if changed
    document.documentElement.style.setProperty('--zen-accent', data.theme.accent);
    document.documentElement.style.setProperty('--zen-primary', data.theme.primary);
    document.documentElement.style.setProperty('--zen-bg', data.theme.bg);
  }, [data.theme.accent, data.theme.primary, data.theme.bg]);

  return (
    <div 
      className="min-h-screen font-sans selection:bg-zen-clay selection:text-white transition-all duration-700"
      style={{ backgroundColor: data.theme.bg, color: data.theme.primary }}
    >
      <div className="w-full">
        <Navbar activeSection={activeSection} />
        <AdminDashboard />
        
        <main>
          <Routes>
            <Route path="/" element={<Home activeSection={activeSection} setActiveSection={setActiveSection} />} />
            <Route path="/gallery-full" element={<GalleryPage />} />
          </Routes>
          <Footer />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SiteProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SiteProvider>
  );
};

export default App;
