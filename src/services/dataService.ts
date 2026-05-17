import { supabase } from '../../lib/supabase';
import { Artwork, SiteData } from '../../types';

export const dataService = {
  // Global Settings
  async getSettings(): Promise<Partial<SiteData> | null> {
    const { data, error } = await supabase
      .from('site_configs')
      .select('payload')
      .eq('id', 'primary_config')
      .single();
    
    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
    return data?.payload || null;
  },

  async updateSettings(payload: Partial<SiteData>) {
    const { error } = await supabase
      .from('site_configs')
      .upsert({
        id: 'primary_config',
        payload,
        updated_at: new Date().toISOString(),
        status: 'active'
      });
    
    if (error) {
       console.error('Supabase updateSettings Error:', error);
       if (error.code === '42P01') throw new Error("Table 'site_configs' introuvable. Veuillez exécuter le script SQL dans Supabase.");
       throw error;
    }
  },

  // Artworks
  async getArtworks(): Promise<Artwork[]> {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching artworks:', error);
      return [];
    }

    // Map database fields to application fields
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      year: item.year,
      category: item.category,
      imageUrl: item.image_url,
      description: item.description,
      price: item.price,
      dimensions: item.dimensions,
      availability: item.availability,
      status: item.status || 'disponible'
    }));
  },

  async syncArtworks(artworks: Artwork[]) {
    console.log(`Syncing ${artworks.length} artworks...`);
    
    // 1. Delete all existing
    const { error: deleteError } = await supabase
      .from('artworks')
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      console.error('Supabase deleteArtworks Error:', deleteError);
      if (deleteError.code === '42P01') throw new Error("Table 'artworks' introuvable.");
      throw deleteError;
    }

    // 2. Prepare inserts
    const inserts = artworks.map((art, index) => ({
      title: art.title || "Sans titre",
      year: art.year || "",
      category: art.category || "Autre",
      image_url: art.imageUrl || "",
      description: art.description || "",
      price: art.price || "",
      dimensions: art.dimensions || "",
      availability: art.availability || "",
      status: art.status || "disponible",
      display_order: index
    }));

    // 3. Batch insert (might need splitting if too large, but 800px compressed images should be fine)
    if (inserts.length > 0) {
      // If we have many artworks with large images, we might hit payload limits.
      // We'll try to insert in smaller chunks if needed, but for now full batch.
      const { error: insertError } = await supabase
        .from('artworks')
        .insert(inserts);
      
      if (insertError) {
        console.error('Supabase insertArtworks Error:', insertError);
        // If error is related to payload size (often 413 or 431 or custom code)
        if (insertError.message.includes('too large') || insertError.code === '413') {
           throw new Error("Le volume de données est trop important. Essayez de réduire le nombre d'images ou leur taille.");
        }
        throw insertError;
      }
    }
    console.log("Artworks sync successful");
  }
};
