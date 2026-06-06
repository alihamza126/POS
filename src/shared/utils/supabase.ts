import { createClient } from '@supabase/supabase-js';
import { ENV } from '../constants/env';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
