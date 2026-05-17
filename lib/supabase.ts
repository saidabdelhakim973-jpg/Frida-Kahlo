import { createClient } from '@supabase/supabase-js';

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  // Accepter les URLs simples sans protocole pour plus de flexibilité
  const testUrl = url.includes('://') ? url : `https://${url}`;
  try {
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!supabaseUrl && 
                    !!supabaseAnonKey && 
                    isValidUrl(supabaseUrl) &&
                    !supabaseUrl.includes('your-project-id');

if (!isConfigured) {
  console.warn('Supabase non configuré : ', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey, 
    validUrl: isValidUrl(supabaseUrl) 
  });
}

const cleanUrl = (url: string | undefined) => {
  if (!url) return 'https://placeholder.supabase.co';
  let formatted = url.trim();
  if (!formatted.includes('://')) formatted = `https://${formatted}`;
  formatted = formatted.replace(/\/rest\/v1\/?$/, '');
  return formatted.replace(/\/$/, '');
};

const finalUrl = cleanUrl(supabaseUrl);
const finalKey = (supabaseAnonKey || 'placeholder').trim();

export const supabase = createClient(finalUrl, finalKey);

export const SUPABASE_CONFIGURED = isConfigured;
