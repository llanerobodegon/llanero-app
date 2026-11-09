import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { addressService } from '@/services/address.service';

/** Ciudades donde hay delivery. */
export const CITIES = ['Barquisimeto', 'Cabudare', 'Acarigua'] as const;

type Form = {
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string | null;
};

type FormErrors = Partial<Record<keyof Form, string>>;

/** Mensajes en español por campo; vacío si el formulario es válido. */
function validate(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.label.trim()) errors.label = 'Ponle un nombre a la dirección';
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Ingresa la dirección';
  if (!form.city) errors.city = 'Selecciona tu ciudad';
  return errors;
}

export function useNewAddressViewModel() {
  const [form, setForm] = useState<Form>({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const setLabel = useCallback((value: string) => setForm((f) => ({ ...f, label: value })), []);
  const setAddressLine1 = useCallback(
    (value: string) => setForm((f) => ({ ...f, addressLine1: value })),
    [],
  );
  const setAddressLine2 = useCallback(
    (value: string) => setForm((f) => ({ ...f, addressLine2: value })),
    [],
  );
  const setCity = useCallback((value: string) => {
    Haptics.selectionAsync();
    setForm((f) => ({ ...f, city: value }));
  }, []);

  const errors = useMemo(() => validate(form), [form]);

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0 || !form.city) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await addressService.create({
        label: form.label.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || null,
        city: form.city,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar la dirección');
    } finally {
      setIsSaving(false);
    }
  }, [errors, form]);

  const goBack = useCallback(() => router.back(), []);

  return {
    form,
    errors: hasSubmitted ? errors : {},
    isSaving,
    error,
    setLabel,
    setAddressLine1,
    setAddressLine2,
    setCity,
    save,
    goBack,
  };
}
