import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, AppState } from 'react-native';

import type { RoleName } from '@/models/user.model';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

interface AuthContextType {
  session: Session | null;
  /** `true` al abrir la app, hasta saber si hay una sesión guardada y cuál es su rol. */
  isLoading: boolean;
  /**
   * Hay sesión y ya se conoce su rol. Al iniciar sesión pasa a `true` cuando el rol llega, así
   * la app entra directo al modo correcto (nunca muestra la tienda a un repartidor).
   */
  isSignedIn: boolean;
  /** Id del usuario con sesión (`auth.users.id` = `users.id`). */
  userId: string | null;
  /** Rol del usuario con sesión; `null` sin sesión o mientras se resuelve. */
  role: RoleName | null;
  /** La cuenta es de repartidor: la app muestra el modo repartidor en vez de la tienda. */
  isDelivery: boolean;
  /**
   * Id del usuario cuando usa la tienda (cualquier rol menos repartidor). Los datos de la
   * tienda (bodega, carrito, favoritos) se cargan con este id, así un repartidor no los pide.
   */
  shopUserId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Pausa entre reintentos al consultar el rol sin conexión. */
const RETRY_DELAY_MS = 3000;

/**
 * Sesión de Supabase Auth: se lee la guardada al abrir la app y se actualiza sola al entrar,
 * salir o renovar el token. También resuelve el rol de la cuenta. El layout raíz usa ambos
 * para mostrar el ingreso, la tienda o el modo repartidor.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  // El rol va junto al id de su usuario: al cambiar de cuenta, el rol anterior no se usa nunca.
  const [access, setAccess] = useState<{ userId: string; role: RoleName } | null>(null);
  const [hasBooted, setHasBooted] = useState(false);

  useEffect(() => {
    let isActive = true;
    authService
      .getSession()
      .then((data) => isActive && setSession(data))
      .catch(() => {})
      .finally(() => isActive && setIsSessionLoading(false));
    const unsubscribe = authService.onSessionChange((data) => {
      if (isActive) setSession(data);
    });
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  // Rol de la cuenta: se usa el guardado en el teléfono (abre al instante y sin red) hasta que
  // llega el del servidor, que manda. Sin rol guardado se espera al servidor.
  const cachedRole = useMemo(() => (userId ? userService.getCachedRole(userId) : null), [userId]);

  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const load = () => {
      userService
        .getAccess()
        .then(({ role, isActive: isAccountActive }) => {
          if (!isActive) return;
          if (role === 'delivery' && !isAccountActive) {
            authService.signOut().catch(() => {});
            Alert.alert(
              'Cuenta desactivada',
              'Tu cuenta de repartidor está desactivada. Contacta al bodegón.',
            );
            return;
          }
          setAccess({ userId, role });
        })
        .catch(() => {
          // Sin conexión: se reintenta. Con rol guardado la app ya está abierta mientras tanto.
          if (isActive) retryTimer = setTimeout(load, RETRY_DELAY_MS);
        });
    };
    load();

    // Al volver a la app se revisa de nuevo (el admin pudo desactivar la cuenta).
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        clearTimeout(retryTimer);
        load();
      }
    });

    return () => {
      isActive = false;
      clearTimeout(retryTimer);
      subscription.remove();
    };
  }, [userId]);

  const role = userId ? (access && access.userId === userId ? access.role : cachedRole) : null;
  const isDelivery = role === 'delivery';

  // El splash solo cubre el arranque. Después, mientras llega el rol de un inicio de sesión,
  // la app sigue mostrando la pantalla de ingreso (no se desmonta la navegación).
  if (!hasBooted && !isSessionLoading && (userId === null || role !== null)) {
    setHasBooted(true);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading: !hasBooted,
        isSignedIn: !!session && role !== null,
        userId,
        role,
        isDelivery,
        shopUserId: role !== null && !isDelivery ? userId : null,
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
