import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { isPasswordValid } from '@/lib/password';
import { authService } from '@/services/auth.service';

type Form = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof Form, string>>;

/** Mensajes en español por campo; vacío si el formulario es válido. */
function validate(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.currentPassword) errors.currentPassword = 'Ingresa tu contraseña actual';
  if (!isPasswordValid(form.newPassword)) {
    errors.newPassword = 'La contraseña nueva no cumple los requisitos';
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'Debe ser distinta a la actual';
  }
  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  return errors;
}

export function useChangePasswordViewModel() {
  const [form, setForm] = useState<Form>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  // Error del servidor sobre la contraseña actual (p. ej. "no es correcta").
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const setCurrentPassword = useCallback((value: string) => {
    setCurrentPasswordError(null);
    setForm((f) => ({ ...f, currentPassword: value }));
  }, []);
  const setNewPassword = useCallback(
    (value: string) => setForm((f) => ({ ...f, newPassword: value })),
    [],
  );
  const setConfirmPassword = useCallback(
    (value: string) => setForm((f) => ({ ...f, confirmPassword: value })),
    [],
  );

  const errors = useMemo(() => validate(form), [form]);
  const isComplete = !!form.currentPassword && !!form.newPassword && !!form.confirmPassword;

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await authService.changePassword(form.currentPassword, form.newPassword);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = err instanceof Error ? err.message : 'No pudimos cambiar tu contraseña';
      // El error de la contraseña actual va debajo de su campo; el resto, al final.
      if (message.toLowerCase().includes('actual')) {
        setCurrentPasswordError(message);
      } else {
        setError(message);
      }
    } finally {
      setIsSaving(false);
    }
  }, [errors, form]);

  const goBack = useCallback(() => router.back(), []);

  const fieldErrors = hasSubmitted ? errors : {};

  return {
    form,
    errors: {
      ...fieldErrors,
      currentPassword: currentPasswordError ?? fieldErrors.currentPassword,
      // "No coinciden" se avisa en cuanto se escribe la confirmación, sin esperar a guardar.
      confirmPassword:
        fieldErrors.confirmPassword ??
        (form.confirmPassword && form.confirmPassword !== form.newPassword
          ? 'Las contraseñas no coinciden'
          : undefined),
    },
    isSaving,
    error,
    canSave: isComplete && !isSaving,

    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    save,
    goBack,
  };
}
