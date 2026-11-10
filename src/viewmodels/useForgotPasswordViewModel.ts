import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isPasswordValid } from '@/lib/password';
import { authService } from '@/services/auth.service';

export const FORGOT_PASSWORD_STEPS = ['Correo', 'Código', 'Nueva contraseña'] as const;
export const RESET_CODE_LENGTH = 6;
/** Espera antes de poder pedir otro código. */
const RESEND_SECONDS = 60;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Form = { email: string; code: string; password: string; confirmPassword: string };
type FormErrors = Partial<Record<keyof Form, string>>;

/**
 * Recuperar contraseña en 3 pasos dentro de una pantalla: correo (se envía el código), código
 * de verificación (inicia sesión) y contraseña nueva. Al terminar muestra la confirmación.
 */
export function useForgotPasswordViewModel(initialEmail = '') {
  const [step, setStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [form, setForm] = useState<Form>({
    email: initialEmail,
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [submittedSteps, setSubmittedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEmail = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, email: value }));
  }, []);
  const setCode = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, code: value.replace(/\D/g, '').slice(0, RESET_CODE_LENGTH) }));
  }, []);
  const setPassword = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, password: value }));
  }, []);
  const setConfirmPassword = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, confirmPassword: value }));
  }, []);

  const stepErrors = useMemo<FormErrors>(() => {
    const errors: FormErrors = {};
    if (step === 0) {
      if (!form.email.trim()) errors.email = 'Ingresa tu correo';
      else if (!EMAIL_PATTERN.test(form.email.trim())) {
        errors.email = 'Revisa el formato del correo';
      }
    }
    if (step === 2) {
      if (!isPasswordValid(form.password)) {
        errors.password = 'La contraseña no cumple los requisitos';
      }
      if (form.confirmPassword !== form.password) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    return errors;
  }, [form, step]);
  const showErrors = submittedSteps.includes(step);

  const [resendIn, setResendIn] = useState(0);
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const email = form.email.trim().toLowerCase();

  /** Paso 2: verifica el código y pasa a la contraseña nueva. */
  const verifyCode = useCallback(
    async (code: string) => {
      if (code.length !== RESET_CODE_LENGTH) return;
      try {
        setIsSubmitting(true);
        setError(null);
        await authService.verifyPasswordResetCode(email, code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep(2);
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(err instanceof Error ? err.message : 'No pudimos verificar el código');
        setForm((f) => ({ ...f, code: '' }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email],
  );

  /** Botón principal de cada paso. */
  const next = useCallback(async () => {
    setSubmittedSteps((s) => (s.includes(step) ? s : [...s, step]));
    if (Object.keys(stepErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (step === 1) {
      verifyCode(form.code);
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      if (step === 0) {
        await authService.requestPasswordReset(email);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResendIn(RESEND_SECONDS);
        setStep(1);
      } else {
        await authService.resetPassword(form.password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsDone(true);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(
        err instanceof Error
          ? err.message
          : step === 0
            ? 'No pudimos enviar el código'
            : 'No pudimos guardar tu contraseña',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, form.code, form.password, step, stepErrors, verifyCode]);

  const resendCode = useCallback(async () => {
    if (resendIn > 0) return;
    try {
      setError(null);
      await authService.requestPasswordReset(email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos reenviar el código');
    }
  }, [email, resendIn]);

  /** Atrás: paso anterior, o sale desde el primero (o desde la confirmación). */
  const back = useCallback(() => {
    setError(null);
    if (step > 0 && !isDone) setStep((s) => s - 1);
    else router.back();
  }, [isDone, step]);

  /**
   * Confirmación: verificar el código ya inició la sesión, así que se entra directo a la app
   * (las pantallas de ingreso de debajo ya no están disponibles).
   */
  const goToApp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  }, []);

  const canContinue =
    !isSubmitting &&
    (step === 0
      ? !!form.email
      : step === 1
        ? form.code.length === RESET_CODE_LENGTH
        : !!form.password && !!form.confirmPassword);

  return {
    step,
    isDone,
    form,
    errors: {
      ...(showErrors ? stepErrors : {}),
      confirmPassword:
        (showErrors ? stepErrors.confirmPassword : undefined) ??
        (form.confirmPassword && form.confirmPassword !== form.password
          ? 'Las contraseñas no coinciden'
          : undefined),
    } as FormErrors,
    error,
    isSubmitting,
    canContinue,
    primaryLabel: step === 0 ? 'Enviar código' : step === 1 ? 'Verificar' : 'Guardar contraseña',
    email,

    setEmail,
    setCode,
    setPassword,
    setConfirmPassword,
    verifyCode,
    resendCode,
    resendIn,
    next,
    back,
    goToApp,
  };
}
