import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SavedPaymentMethod } from '@/models/payment-method.model';
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

const EMPTY_FORM: Form = {
  alias: '',
  phoneCode: '0414',
  phoneNumber: '',
  documentType: 'V',
  documentNumber: '',
  bank: null,
};

function toForm(method: SavedPaymentMethod): Form {
  return {
    alias: method.alias,
    phoneCode: method.phoneCode,
    phoneNumber: method.phoneNumber,
    documentType: method.documentType,
    documentNumber: method.documentNumber,
    bank: method.bank,
  };
}

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

/**
 * Formulario de método de pago (Pago Móvil). Sin `methodId` crea uno nuevo; con `methodId` lo
 * carga para editarlo y además permite eliminarlo o marcarlo como predeterminado.
 */
export function usePaymentMethodFormViewModel(methodId?: string) {
  const isEditing = !!methodId;

  const [method, setMethod] = useState<SavedPaymentMethod | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!methodId) return;
    let isActive = true;
    paymentMethodService
      .getById(methodId)
      .then((data) => {
        if (!isActive) return;
        setMethod(data);
        if (data) setForm(toForm(data));
        setError(data ? null : 'No encontramos este método de pago');
      })
      .catch(
        (err) =>
          isActive &&
          setError(err instanceof Error ? err.message : 'Error al cargar el método de pago'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [methodId]);

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
  const isDirty = useMemo(
    () => !method || JSON.stringify(form) !== JSON.stringify(toForm(method)),
    [form, method],
  );

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0 || !form.bank) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const data = {
      type: 'pago_movil' as const,
      alias: form.alias.trim(),
      bank: form.bank,
      phoneCode: form.phoneCode,
      phoneNumber: form.phoneNumber,
      documentType: form.documentType,
      documentNumber: form.documentNumber,
    };
    try {
      setIsSaving(true);
      setError(null);
      if (methodId) {
        await paymentMethodService.update(methodId, data);
      } else {
        await paymentMethodService.create(data);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el método de pago');
    } finally {
      setIsSaving(false);
    }
  }, [errors, form, methodId]);

  /** Marca este método como predeterminado y vuelve a la lista. */
  const makeDefault = useCallback(async () => {
    if (!methodId) return;
    try {
      setError(null);
      await paymentMethodService.setDefault(methodId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cambiar el predeterminado');
    }
  }, [methodId]);

  // Eliminar pide confirmación.
  const requestDelete = useCallback(() => {
    Haptics.selectionAsync();
    setIsDeleteConfirmOpen(true);
  }, []);
  const cancelDelete = useCallback(() => setIsDeleteConfirmOpen(false), []);
  const confirmDelete = useCallback(async () => {
    if (!methodId) return;
    setIsDeleteConfirmOpen(false);
    try {
      setError(null);
      await paymentMethodService.remove(methodId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos eliminar el método de pago');
    }
  }, [methodId]);

  const goBack = useCallback(() => router.back(), []);

  return {
    isEditing,
    title: isEditing ? 'Editar método de pago' : 'Nuevo método de pago',
    saveLabel: isEditing ? 'Guardar cambios' : 'Guardar método de pago',
    isDefault: method?.isDefault ?? false,
    isNotFound: isEditing && !isLoading && !method,

    form,
    errors: hasSubmitted ? errors : {},
    isLoading,
    isSaving,
    error,
    // Al editar, guardar solo se activa si cambió algo.
    canSave: isDirty && !isSaving,

    setAlias,
    setPhoneCode,
    setPhoneNumber,
    setDocumentType,
    setDocumentNumber,
    setBank,
    save,

    makeDefault,
    isDeleteConfirmOpen,
    requestDelete,
    cancelDelete,
    confirmDelete,

    goBack,
  };
}
