import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { authService } from '@/services/auth.service';

interface AuthContextType {
  session: Session | null;
  /** `true` hasta saber si hay una sesión guardada en el dispositivo. */
  isLoading: boolean;
  isSignedIn: boolean;
  /** Id del usuario con sesión (`auth.users.id` = `users.id`). */
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Sesión de Supabase Auth: se lee la guardada al abrir la app y se actualiza sola al entrar,
 * salir o renovar el token. El layout raíz la usa para mostrar el ingreso o la app.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    authService
      .getSession()
      .then((data) => isActive && setSession(data))
      .catch(() => {})
      .finally(() => isActive && setIsLoading(false));
    const unsubscribe = authService.onSessionChange((data) => {
      if (isActive) setSession(data);
    });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isSignedIn: !!session,
        userId: session?.user.id ?? null,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return context;
}
