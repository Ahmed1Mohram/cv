const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

let clientPromise: Promise<any | null> | null = null;

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export const getSupabase = async () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!clientPromise) {
    const dynamicImport: any = new Function('u', 'return import(u)');
    clientPromise = Promise.resolve()
      .then(() => dynamicImport('https://esm.sh/@supabase/supabase-js@2.49.1'))
      .then((mod: any) => {
        const createClient = mod?.createClient;
        if (typeof createClient !== 'function') return null;
        return createClient(supabaseUrl, supabaseAnonKey);
      })
      .catch(() => null);
  }

  return clientPromise;
};
