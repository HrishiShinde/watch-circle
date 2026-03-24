import { createClient } from '@supabase/supabase-js'

// Re-export TMDB_IMG so existing imports don't break
export { TMDB_IMG, TMDB_IMG_ORIG, searchTMDB, fetchTMDBMovie, fetchTMDBGenreMap, matchGenreIds } from './tmdb'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

