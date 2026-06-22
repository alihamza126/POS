import { createClient } from '@supabase/supabase-js';
import { ENV } from '../constants/env';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_ANON_KEY;

// Explicitly pass globalThis.fetch to avoid "TypeError: fetch failed" in
// Electron's main process (Node.js webpack bundle context). The Supabase
// client's auto-detected fetch can lose its binding when bundled via webpack
// for the electron-main target. Node 18+ has native fetch on globalThis.
const customFetch = (...args: Parameters<typeof fetch>) =>
  globalThis.fetch(...args);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
});

export default supabase;
