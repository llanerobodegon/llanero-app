import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { authService } from '@/services/auth.service';

type Form = { email: string; password: string };
type FormErrors = Partial<Record<keyof Form, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mensajes en español por campo; vacío si el formulario es válido. */
function validate(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.trim()) errors.email = 'Ingresa tu correo';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Revisa el formato del correo';
  if (!form.password) errors.password = 'Ingresa tu contraseña';
  return errors;
}

export function useLoginViewModel() {
  const [form, setForm] = useState<Form>({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const setEmail = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, email: value }));
  }, []);
  const setPassword = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, password: value }));
  }, []);

  const errors = useMemo(() => validate(form), [form]);

  /** Inicia sesión y entra a la app, sin dejar el login debajo. */
  const signIn = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await authService.signIn(form.email.trim().toLowerCase(), form.password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Cierra la bienvenida y el formulario: "atrás" desde el Inicio no vuelve al ingreso.
      if (router.canDismiss()) router.dismissAll();
      router.replace('/');
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'No pudimos iniciar tu sesión');
    } finally {
      setIsSubmitting(false);
    }
  }, [errors, form]);

  // TODO: recuperar contraseña (supabase.auth.resetPasswordForEmail).
  const forgotPassword = useCallback(() => Haptics.selectionAsync(), []);
  const goToRegister = useCallback(() => {
    Haptics.selectionAsync();
    router.push('/auth/register');
  }, []);

  const goBack = useCallback(() => router.back(), []);

  return {
    form,
    errors: hasSubmitted ? errors : {},
    error,
    isSubmitting,
    canSubmit: !!form.email && !!form.password && !isSubmitting,
    setEmail,
    setPassword,
    signIn,
    forgotPassword,
    goToRegister,
    goBack,
  };
}
