import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
  useThemeColor,
} from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectField } from '@/components/form/select-field';
import { ScreenHeader } from '@/components/screen-header';
import { CITIES, useNewAddressViewModel } from '@/viewmodels/useNewAddressViewModel';

/** Quita la sombra (elevation) que HeroUI pone a los campos en Android; en iOS la quita el tema. */
const NO_SHADOW = 'android:[elevation:0]';

/** Formulario de nueva dirección: nombre, dirección 1 y 2, y ciudad. */
export function NewAddressView() {
  const vm = useNewAddressViewModel();
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Nueva dirección" onBack={vm.goBack} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <TextField isRequired isInvalid={!!vm.errors.label}>
          <Label>Nombre</Label>
          <Input
            className={NO_SHADOW}
            value={vm.form.label}
            onChangeText={vm.setLabel}
            placeholder="Ej. Casa, Oficina, Casa de mamá"
            autoCapitalize="sentences"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.label}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.addressLine1}>
          <Label>Dirección 1</Label>
          <Input
            className={NO_SHADOW}
            value={vm.form.addressLine1}
            onChangeText={vm.setAddressLine1}
            placeholder="Ej. Av. Lara con calle 5, Urb. del Este"
            autoComplete="address-line1"
            textContentType="streetAddressLine1"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.addressLine1}</FieldError>
        </TextField>

        <TextField>
          <Label>Dirección 2</Label>
          <Input
            className={NO_SHADOW}
            value={vm.form.addressLine2}
            onChangeText={vm.setAddressLine2}
            placeholder="Ej. Casa 12, frente a la plaza"
            autoComplete="address-line2"
            textContentType="streetAddressLine2"
            returnKeyType="done"
          />
          <Description>Opcional: casa, apartamento o punto de referencia.</Description>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.city}>
          <Label>Ciudad</Label>
          <SelectField
            value={vm.form.city}
            options={CITIES}
            onChange={vm.setCity}
            placeholder="Selecciona tu ciudad"
            accessibilityLabel="Ciudad"
          />
          <FieldError>{vm.errors.city}</FieldError>
        </TextField>

        {vm.error ? <Text className="text-sm text-danger">{vm.error}</Text> : null}
      </ScrollView>

      {/* Guardar, fijo abajo (igual que en Información personal) */}
      <View
        style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
        className="px-4 pt-3">
        <Button
          size="lg"
          // Sin capa de color al presionar: en `primary` sería naranja sobre el botón negro.
          feedbackVariant="scale"
          isDisabled={vm.isSaving}
          onPress={vm.save}
          className="rounded-full bg-foreground">
          {vm.isSaving ? <Spinner size="sm" color={background} /> : null}
          <Button.Label className="text-background">
            {vm.isSaving ? 'Guardando…' : 'Guardar dirección'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
