import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { LegalLinks } from '@/constants/links';
import { useInAppBrowser } from '@/hooks/use-in-app-browser';

/** Bienvenida: elegir cómo ingresar y abrir los términos o la privacidad. */
export function useWelcomeViewModel() {
  const openInAppBrowser = useInAppBrowser();

  const continueWithEmail = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/auth/login');
  }, []);

  const openTerms = useCallback(() => openInAppBrowser(LegalLinks.terms), [openInAppBrowser]);
  const openPrivacy = useCallback(() => openInAppBrowser(LegalLinks.privacy), [openInAppBrowser]);

  return { continueWithEmail, openTerms, openPrivacy };
}
