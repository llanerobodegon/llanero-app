import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { PHONE_CODES } from '@/lib/venezuela';
import type { PhoneCode } from '@/models/user.model';
import { userService } from '@/services/user.service';

const PHONE_LENGTH = 7;

/**
 * Teléfono de contacto del cliente. Se pide desde el checkout de un delivery cuando el perfil
 * no tiene uno: el repartidor lo necesita para ubicarlo al llegar.
 */
export function useContactPhoneViewModel() {
  const [phoneCode, setPhoneCodeValue] = useState<PhoneCode>(PHONE_CODES[0]);
  const [phone, setPhoneValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El error del campo se muestra solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Si ya tenía uno (entró a cambiarlo), se muestra el actual.
  useEffect(() => {
    let isActive = true;
    userService
      .getCurrent()
      .then((user) => {
        if (!isActive) return;
        if (user.phoneCode) setPhoneCodeValue(user.phoneCode);
        if (user.phone) setPhoneValue(user.phone);
      })
      .catch(() => {
        // Sin el dato actual el formulario simplemente empieza vacío.
      })
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, []);

  const setPhone = useCallback(
    (value: string) => setPhoneValue(value.replace(/\D/g, '').slice(0, PHONE_LENGTH)),
    [],
  );
  const setPhoneCode = useCallback((value: string) => {
    Haptics.selectionAsync();
    setPhoneCodeValue(value as PhoneCode);
  }, []);

  const isValid = phone.length === PHONE_LENGTH;

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await userService.updatePhone(phoneCode, phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu teléfono');
    } finally {
      setIsSaving(false);
    }
  }, [isValid, phone, phoneCode]);

  const goBack = useCallback(() => router.back(), []);

  return {
    phoneCode,
    phone,
    setPhoneCode,
    setPhone,
    phoneError: hasSubmitted && !isValid ? 'El número debe tener 7 dígitos' : undefined,
    isLoading,
    isSaving,
    error,
    canSave: !isLoading && !isSaving,
    save,
    goBack,
  };
}
