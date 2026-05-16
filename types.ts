
export interface Artwork {
  id: string | number;
  title: string;
  category: string;
  imageUrl: string;
  year: string;
  description?: string;
  dimensions?: string;
  price?: string;
  availability?: string;
  status: 'vendu' | 'disponible';
}

export interface SiteData {
  hero: {
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    location: string;
    quote: string;
    imageUrl: string;
    slideshowImages: string[];
  };
  bio: {
    title: string;
    subtitle: string;
    text: string;
    role: string;
    imageUrl: string;
    secondaryImageUrl: string;
    studioLocation: string;
  };
  gallery: {
    title: string;
    subtitle: string;
  };
  ui: {
    navHome: string;
    navGallery: string;
    navAbout: string;
    navContact: string;
    adminAccess: string;
    priceInquiry: string;
    inquiryMessage: string;
    formSuccess: string;
    footerCopyright: string;
    contactTitle: string;
    contactSubtitle: string;
    formName: string;
    formEmail: string;
    formSubject: string;
    formMessage: string;
    formSubmit: string;
    footerSocial: string;
    galleryPaintings: string;
    gallerySculptures: string;
    heroExplore: string;
    heroCollection: string;
  };
  contact: {
    email: string;
    inquiryEmail: string;
    phone: string;
    address: string;
    quote: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  artworks: Artwork[];
  theme: {
    primary: string;
    accent: string;
    bg: string;
  };
  adminPassword?: string;
}

export enum Section {
  Home = 'home',
  Gallery = 'gallery',
  ArtTherapy = 'art-therapy',
  About = 'about',
  Contact = 'contact'
}
