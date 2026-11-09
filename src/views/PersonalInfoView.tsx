import {
  Button,
  FieldError,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField,
  useThemeColor,
} from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectField } from '@/components/form/select-field';
import { ScreenHeader } from '@/components/screen-header';
import {
  ID_TYPES,
  PHONE_CODES,
  usePersonalInfoViewModel,
} from '@/viewmodels/usePersonalInfoViewModel';

/** Quita la sombra (elevation) que HeroUI pone a los campos en Android; en iOS la quita el tema. */
const NO_SHADOW = 'android:[elevation:0]';

/** Ancho común de los desplegables de operadora y tipo de cédula, para que los campos se alineen. */
const PREFIX_WIDTH = 104;

/** Información personal: nombre, apellido, teléfono y cédula. */
export function PersonalInfoView() {
  const vm = usePersonalInfoViewModel();
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);

  const header = <ScreenHeader title="Información personal" onBack={vm.goBack} />;

  if (vm.isLoading) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <View className="gap-5 px-4 pt-4">
          {Array.from({ length: 4 }, (_, index) => (
            <View key={index} className="gap-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <TextField isRequired isInvalid={!!vm.errors.firstName}>
          <Label>Nombre</Label>
          <Input
            className={NO_SHADOW}
            value={vm.form.firstName}
            onChangeText={vm.setFirstName}
            placeholder="Tu nombre"
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.firstName}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.lastName}>
          <Label>Apellido</Label>
          <Input
            className={NO_SHADOW}
            value={vm.form.lastName}
            onChangeText={vm.setLastName}
            placeholder="Tu apellido"
            autoCapitalize="words"
            autoComplete="family-name"
            textContentType="familyName"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.lastName}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.phone}>
          <Label>Teléfono</Label>
          <View className="flex-row gap-2">
            <SelectField
              value={vm.form.phoneCode}
              options={PHONE_CODES}
              onChange={vm.setPhoneCode}
              accessibilityLabel="Código de operadora"
              width={PREFIX_WIDTH}
            />
            <Input
              className={`flex-1 ${NO_SHADOW}`}
              value={vm.form.phone}
              onChangeText={vm.setPhone}
              placeholder="1234567"
              keyboardType="number-pad"
              maxLength={7}
              textContentType="telephoneNumber"
              accessibilityLabel="Número de teléfono"
            />
          </View>
          <FieldError>{vm.errors.phone}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.idNumber}>
          <Label>Cédula de identidad</Label>
          <View className="flex-row gap-2">
            <SelectField
              value={vm.form.idType}
              options={ID_TYPES}
              onChange={vm.setIdType}
              accessibilityLabel="Tipo de documento"
              width={PREFIX_WIDTH}
            />
            <Input
              className={`flex-1 ${NO_SHADOW}`}
              value={vm.form.idNumber}
              onChangeText={vm.setIdNumber}
              placeholder="12345678"
              keyboardType="number-pad"
              maxLength={9}
              accessibilityLabel="Número de cédula"
            />
          </View>
          <FieldError>{vm.errors.idNumber}</FieldError>
        </TextField>

        {vm.error ? <Text className="text-sm text-danger">{vm.error}</Text> : null}
      </ScrollView>

      {/* Guardar, fijo abajo (igual que "Agregar al carrito" en el producto) */}
      <View
        style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
        className="px-4 pt-3">
        <Button
          size="lg"
          // Sin capa de color al presionar: en `primary` sería naranja sobre el botón negro.
          feedbackVariant="scale"
          isDisabled={!vm.canSave}
          onPress={vm.save}
          className="rounded-full bg-foreground">
          {vm.isSaving ? <Spinner size="sm" color={background} /> : null}
          <Button.Label className="text-background">
            {vm.isSaving ? 'Guardando…' : 'Guardar cambios'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
