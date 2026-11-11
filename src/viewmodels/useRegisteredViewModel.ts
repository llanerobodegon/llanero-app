import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback } from 'react';

/** Bienvenida tras el registro: solo entrar a la app. */
export function useRegisteredViewModel() {
  const start = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  }, []);

  return { start };
}
