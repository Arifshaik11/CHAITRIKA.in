import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.REACT_APP_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.REACT_APP_SUPABASE_URL : '');
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.REACT_APP_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.REACT_APP_SUPABASE_ANON_KEY : '');

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

