// Guarda la sesión en el dispositivo: expo-sqlite expone un `localStorage` que usa Supabase.
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * Cliente de Supabase de la app (proyecto "Llanero App", compartido con llanero-web).
 * Solo lo importan los `services/` (ver docs/architecture.md).
 *
 * Variables en `.env.local` (no se sube a git; ver `.env.example`) y, para las builds, en las
 * variables de entorno de EAS (development, preview y production), con los mismos nombres.
 * Solo van la URL y la clave PÚBLICA (anon): nunca la service role ni la contraseña de la base.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env.local y complétalas.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En la app no hay sesiones que vengan en la URL (no es web).
    detectSessionInUrl: false,
  },
});

// Renueva el token solo con la app en primer plano (recomendación de Supabase para móvil).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
