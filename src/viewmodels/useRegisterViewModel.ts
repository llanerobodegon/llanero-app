import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isPasswordValid } from '@/lib/password';
import { authService } from '@/services/auth.service';

export const REGISTER_STEPS = ['Datos básicos', 'Contraseña', 'Verificación'] as const;
export const CODE_LENGTH = 6;
/** Espera antes de poder pedir otro código. */
const RESEND_SECONDS = 60;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
};

type FormErrors = Partial<Record<keyof Form, string>>;

function validateBasics(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = 'Ingresa tu nombre';
  if (!form.lastName.trim()) errors.lastName = 'Ingresa tu apellido';
  if (!form.email.trim()) errors.email = 'Ingresa tu correo';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Revisa el formato del correo';
  return errors;
}

function validatePassword(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!isPasswordValid(form.password)) errors.password = 'La contraseña no cumple los requisitos';
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  return errors;
}

/**
 * Registro en 3 pasos dentro de una sola pantalla: datos básicos, contraseña (al terminarlo se
 * crea la cuenta y se envía el código) y verificación del código de 6 dígitos.
 */
export function useRegisterViewModel() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  // Errores por campo: se muestran desde el primer intento de avanzar en cada paso.
  const [submittedSteps, setSubmittedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback(
    (field: keyof Form) => (value: string) => {
      setError(null);
      setForm((f) => ({ ...f, [field]: value }));
    },
    [],
  );
  const setFirstName = useMemo(() => setField('firstName'), [setField]);
  const setLastName = useMemo(() => setField('lastName'), [setField]);
  const setEmail = useMemo(() => setField('email'), [setField]);
  const setPassword = useMemo(() => setField('password'), [setField]);
  const setConfirmPassword = useMemo(() => setField('confirmPassword'), [setField]);
  const setCode = useCallback((value: string) => {
    setError(null);
    setForm((f) => ({ ...f, code: value.replace(/\D/g, '').slice(0, CODE_LENGTH) }));
  }, []);

  const stepErrors = useMemo(
    () => (step === 0 ? validateBasics(form) : step === 1 ? validatePassword(form) : {}),
    [form, step],
  );
  const showErrors = submittedSteps.includes(step);

  // Cuenta regresiva para reenviar el código.
  const [resendIn, setResendIn] = useState(0);
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const email = form.email.trim().toLowerCase();

  /** Paso 3: verifica el código y entra a la bienvenida. */
  const verifyCode = useCallback(
    async (code: string) => {
      if (code.length !== CODE_LENGTH) return;
      try {
        setIsSubmitting(true);
        setError(null);
        await authService.verifySignUpCode(email, code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Cierra el ingreso (bienvenida, registro): "atrás" no vuelve aquí.
        if (router.canDismiss()) router.dismissAll();
        router.replace({ pathname: '/auth/registered', params: { name: form.firstName.trim() } });
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(err instanceof Error ? err.message : 'No pudimos verificar el código');
        setForm((f) => ({ ...f, code: '' }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, form.firstName],
  );

  /** Botón principal: avanza de paso (en el 2 crea la cuenta y envía el código). */
  const next = useCallback(async () => {
    setSubmittedSteps((s) => (s.includes(step) ? s : [...s, step]));
    if (Object.keys(stepErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (step === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
      return;
    }
    if (step === 1) {
      try {
        setIsSubmitting(true);
        setError(null);
        await authService.signUp({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email,
          password: form.password,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResendIn(RESEND_SECONDS);
        setStep(2);
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const message = err instanceof Error ? err.message : 'No pudimos crear tu cuenta';
        setError(message);
        // "Ya existe una cuenta": el correo está en el paso 1, se vuelve a él.
        if (message.toLowerCase().includes('correo')) setStep(0);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    verifyCode(form.code);
  }, [email, form, step, stepErrors, verifyCode]);

  const resendCode = useCallback(async () => {
    if (resendIn > 0) return;
    try {
      setError(null);
      await authService.resendSignUpCode(email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos reenviar el código');
    }
  }, [email, resendIn]);

  /** Atrás: paso anterior, o sale del registro desde el primero. */
  const back = useCallback(() => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
    else router.back();
  }, [step]);

  const canContinue =
    !isSubmitting &&
    (step === 0
      ? !!form.firstName && !!form.lastName && !!form.email
      : step === 1
        ? !!form.password && !!form.confirmPassword
        : form.code.length === CODE_LENGTH);

  return {
    step,
    form,
    errors: {
      ...(showErrors ? stepErrors : {}),
      // "No coinciden" se avisa en cuanto se escribe la confirmación.
      confirmPassword:
        (showErrors ? stepErrors.confirmPassword : undefined) ??
        (form.confirmPassword && form.confirmPassword !== form.password
          ? 'Las contraseñas no coinciden'
          : undefined),
    } as FormErrors,
    error,
    isSubmitting,
    canContinue,
    primaryLabel: step === 0 ? 'Continuar' : step === 1 ? 'Crear cuenta' : 'Verificar',
    email,

    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setCode,
    verifyCode,
    resendCode,
    resendIn,
    next,
    back,
  };
}
