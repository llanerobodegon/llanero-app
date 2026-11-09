import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { IdType, PhoneCode, User } from '@/models/user.model';
import { userService } from '@/services/user.service';

/** Códigos de operadora en el orden en que se muestran en el selector. */
export const PHONE_CODES: PhoneCode[] = ['0414', '0424', '0412', '0422', '0416', '0426'];
export const ID_TYPES: IdType[] = ['V', 'E'];

type Form = {
  firstName: string;
  lastName: string;
  phoneCode: PhoneCode;
  phone: string;
  idType: IdType;
  idNumber: string;
};

type FormErrors = Partial<Record<keyof Form, string>>;

const EMPTY_FORM: Form = {
  firstName: '',
  lastName: '',
  phoneCode: PHONE_CODES[0],
  phone: '',
  idType: 'V',
  idNumber: '',
};

function toForm(user: User): Form {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phoneCode: user.phoneCode ?? PHONE_CODES[0],
    phone: user.phone ?? '',
    idType: user.idType ?? 'V',
    idNumber: user.idNumber ?? '',
  };
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Mensajes en español por campo; vacío si el formulario es válido. */
function validate(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = 'Ingresa tu nombre';
  if (!form.lastName.trim()) errors.lastName = 'Ingresa tu apellido';
  if (form.phone.length !== 7) errors.phone = 'El número debe tener 7 dígitos';
  if (form.idNumber.length < 6 || form.idNumber.length > 9) {
    errors.idNumber = 'La cédula debe tener entre 6 y 9 dígitos';
  }
  return errors;
}

export function usePersonalInfoViewModel() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Los errores por campo se muestran solo después del primer intento de guardar.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    let isActive = true;
    userService
      .getCurrent()
      .then((data) => {
        if (!isActive) return;
        setUser(data);
        setForm(toForm(data));
        setError(null);
      })
      .catch(
        (err) =>
          isActive && setError(err instanceof Error ? err.message : 'Error al cargar tus datos'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, []);

  const setFirstName = useCallback(
    (value: string) => setForm((f) => ({ ...f, firstName: value })),
    [],
  );
  const setLastName = useCallback(
    (value: string) => setForm((f) => ({ ...f, lastName: value })),
    [],
  );
  const setPhone = useCallback(
    (value: string) => setForm((f) => ({ ...f, phone: onlyDigits(value).slice(0, 7) })),
    [],
  );
  const setIdNumber = useCallback(
    (value: string) => setForm((f) => ({ ...f, idNumber: onlyDigits(value).slice(0, 9) })),
    [],
  );
  const setPhoneCode = useCallback((value: string) => {
    Haptics.selectionAsync();
    setForm((f) => ({ ...f, phoneCode: value as PhoneCode }));
  }, []);
  const setIdType = useCallback((value: string) => {
    Haptics.selectionAsync();
    setForm((f) => ({ ...f, idType: value as IdType }));
  }, []);

  const errors = useMemo(() => validate(form), [form]);
  const isDirty = useMemo(
    () => !!user && JSON.stringify(form) !== JSON.stringify(toForm(user)),
    [form, user],
  );

  const save = useCallback(async () => {
    setHasSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await userService.update({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneCode: form.phoneCode,
        phone: form.phone,
        idType: form.idType,
        idNumber: form.idNumber,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tus datos');
    } finally {
      setIsSaving(false);
    }
  }, [errors, form]);

  const goBack = useCallback(() => router.back(), []);

  return {
    form,
    errors: hasSubmitted ? errors : {},
    isLoading,
    isSaving,
    error,
    canSave: isDirty && !isSaving,

    setFirstName,
    setLastName,
    setPhoneCode,
    setPhone,
    setIdType,
    setIdNumber,
    save,
    goBack,
  };
}
