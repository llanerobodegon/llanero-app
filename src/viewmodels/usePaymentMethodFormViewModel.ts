import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import type { IdType, PhoneCode } from '@/models/user.model';
import { paymentMethodService } from '@/services/payment-method.service';

type Form = {
  alias: string;
  phoneCode: PhoneCode;
  phoneNumber: string;
  documentType: IdType;
  documentNumber: string;
  bank: string | null;
};

type FormErrors = Partial<Record<keyof Form, string>>;

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Mensajes en español por campo; vacío si el formulario es válido. */
function validate(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.alias.trim()) errors.alias = 'Ponle un nombre para reconocerlo';
  if (form.phoneNumber.length !== 7) errors.phoneNumber = 'El número debe tener 7 dígitos';
  if (form.documentNumber.length < 6 || form.documentNumber.length > 9) {
    errors.documentNumber = 'La cédula debe tener entre 6 y 9 dígitos';
  }
  if (!form.bank) errors.bank = 'Selecciona tu banco';
  return errors;
}

/** Formulario de nuevo método de pago (Pago Móvil). */
export function usePaymentMethodFormViewModel() {
  const [form, setForm] = useState<Form>({
    alias: '',
    phoneCode: '0414',
    phoneNumber: '',
    documentType: 'V',
    documentNumber: '',
    bank: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const setAlias = useCallback((value: string) => setForm((f) => ({ ...f, alias: value })), []);
  const setPhoneNumber = useCallback(
    (value: string) => setForm((f) => ({ ...f, phoneNumber: onlyDigits(value).slice(0, 7) })),
    [],
  );
  const setDocumentNumber = useCallback(
    (value: string) => setForm((f) => ({ ...f, documentNumber: onlyDigits(value).slice(0, 9) })),
    [],
  );
  const setPhoneCode = useCallback((value: string) => {
    Haptics.selectionAsync();
    setForm((f) => ({ ...f, phoneCode: value as PhoneCode }));
  }, []);
  const setDocumentType = useCallback((value: string) => {
    Haptics.selectionAsync();
    setForm((f) => ({ ...f, documentType: value as IdType }));
  }, []);
  const setBank = useCallback((value: string) => {
    Haptics.selectionAsync();
    setForm((f) => ({ ...f, bank: value }));
  }, []);

  const errors = useMemo(() => validate(form), [form]);

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0 || !form.bank) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await paymentMethodService.create({
        type: 'pago_movil',
        alias: form.alias.trim(),
        bank: form.bank,
        phoneCode: form.phoneCode,
        phoneNumber: form.phoneNumber,
        documentType: form.documentType,
        documentNumber: form.documentNumber,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el método de pago');
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
    setAlias,
    setPhoneCode,
    setPhoneNumber,
    setDocumentType,
    setDocumentNumber,
    setBank,
    save,
    goBack,
  };
}
