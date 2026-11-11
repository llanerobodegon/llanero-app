import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Address } from '@/models/address.model';
import { ADDRESS_LABEL_MAX_LENGTH, addressService } from '@/services/address.service';

/** Ciudades donde hay delivery. */
export const CITIES = ['Barquisimeto', 'Cabudare', 'Acarigua'] as const;

type Form = {
  label: string;
  addressLine1: string;
  addressLine2: string;
  city: string | null;
};

type FormErrors = Partial<Record<keyof Form, string>>;

const EMPTY_FORM: Form = { label: '', addressLine1: '', addressLine2: '', city: null };

function toForm(address: Address): Form {
  return {
    label: address.label,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
  };
}

/** Mensajes en español por campo; vacío si el formulario es válido. */
function validate(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.label.trim()) errors.label = 'Ponle un nombre a la dirección';
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Ingresa la dirección';
  if (!form.city) errors.city = 'Selecciona tu ciudad';
  return errors;
}

type PendingAction = 'delete' | null;

/**
 * Formulario de dirección. Sin `addressId` crea una nueva; con `addressId` la carga para
 * editarla y además permite eliminarla o marcarla como predeterminada.
 */
export function useAddressFormViewModel(addressId?: string) {
  const isEditing = !!addressId;

  const [address, setAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    if (!addressId) return;
    let isActive = true;
    addressService
      .getById(addressId)
      .then((data) => {
        if (!isActive) return;
        setAddress(data);
        if (data) setForm(toForm(data));
        setError(data ? null : 'No encontramos esta dirección');
      })
      .catch(
        (err) =>
          isActive && setError(err instanceof Error ? err.message : 'Error al cargar la dirección'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [addressId]);

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
  const isDirty = useMemo(
    () => !address || JSON.stringify(form) !== JSON.stringify(toForm(address)),
    [address, form],
  );

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0 || !form.city) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const data = {
      label: form.label.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || null,
      city: form.city,
    };
    try {
      setIsSaving(true);
      setError(null);
      if (addressId) {
        await addressService.update(addressId, data);
      } else {
        await addressService.create(data);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar la dirección');
    } finally {
      setIsSaving(false);
    }
  }, [addressId, errors, form]);

  /** Marca esta dirección como predeterminada y vuelve a la lista. */
  const makeDefault = useCallback(async () => {
    if (!addressId) return;
    try {
      setError(null);
      await addressService.setDefault(addressId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cambiar la predeterminada');
    }
  }, [addressId]);

  // Eliminar pide confirmación.
  const requestDelete = useCallback(() => {
    Haptics.selectionAsync();
    setPendingAction('delete');
  }, []);
  const cancelDelete = useCallback(() => setPendingAction(null), []);
  const confirmDelete = useCallback(async () => {
    if (!addressId) return;
    setPendingAction(null);
    try {
      setError(null);
      await addressService.remove(addressId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos eliminar la dirección');
    }
  }, [addressId]);

  const goBack = useCallback(() => router.back(), []);

  return {
    isEditing,
    title: isEditing ? 'Editar dirección' : 'Nueva dirección',
    saveLabel: isEditing ? 'Guardar cambios' : 'Guardar dirección',
    isDefault: address?.isDefault ?? false,
    isNotFound: isEditing && !isLoading && !address,

    form,
    labelMaxLength: ADDRESS_LABEL_MAX_LENGTH,
    errors: hasSubmitted ? errors : {},
    isLoading,
    isSaving,
    error,
    // Al editar, guardar solo se activa si cambió algo.
    canSave: isDirty && !isSaving,

    setLabel,
    setAddressLine1,
    setAddressLine2,
    setCity,
    save,

    makeDefault,
    isDeleteConfirmOpen: pendingAction === 'delete',
    requestDelete,
    cancelDelete,
    confirmDelete,

    goBack,
  };
}
