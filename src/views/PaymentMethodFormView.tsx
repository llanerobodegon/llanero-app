import { SymbolView } from 'expo-symbols';
import { Button, FieldError, Label, Spinner, TextField, useThemeColor } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormInput } from '@/components/form/form-input';
import { SelectField } from '@/components/form/select-field';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { BANKS, ID_TYPES, PHONE_CODES } from '@/lib/venezuela';
import { usePaymentMethodFormViewModel } from '@/viewmodels/usePaymentMethodFormViewModel';

/** Ancho común de los desplegables de operadora y tipo de cédula, para que los campos se alineen. */
const PREFIX_WIDTH = 104;

/** Nuevo método de pago (Pago Móvil): alias, teléfono, cédula y banco. */
export function PaymentMethodFormView() {
  const vm = usePaymentMethodFormViewModel();
  const insets = useSafeAreaInsets();
  const [background, foreground] = useThemeColor(['background', 'foreground']);
  const actionForeground = useActionForeground();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Nuevo método de pago" onBack={vm.goBack} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        {/* Para qué se guardan estos datos */}
        <View className="flex-row items-center gap-3 rounded-3xl bg-surface p-4">
          <View className="size-10 items-center justify-center rounded-full bg-default">
            <SymbolView
              name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
              size={18}
              tintColor={foreground}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-sm font-semibold text-foreground">Paga más rápido</Text>
            <Text className="text-xs text-muted">
              Guardamos tus datos de Pago Móvil solo para agilizar tus compras: al pagar los
              rellenamos por ti.
            </Text>
          </View>
        </View>

        <TextField isRequired isInvalid={!!vm.errors.alias}>
          <Label>Alias</Label>
          <FormInput
            value={vm.form.alias}
            onChangeText={vm.setAlias}
            placeholder="Ej. Mi Pago Móvil, Banesco personal"
            autoCapitalize="sentences"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.alias}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.phoneNumber}>
          <Label>Teléfono</Label>
          <View className="flex-row gap-2">
            <SelectField
              value={vm.form.phoneCode}
              options={PHONE_CODES}
              onChange={vm.setPhoneCode}
              accessibilityLabel="Código de operadora"
              width={PREFIX_WIDTH}
            />
            <FormInput
              className="flex-1"
              value={vm.form.phoneNumber}
              onChangeText={vm.setPhoneNumber}
              placeholder="1234567"
              keyboardType="number-pad"
              maxLength={7}
              textContentType="telephoneNumber"
              accessibilityLabel="Número de teléfono"
            />
          </View>
          <FieldError>{vm.errors.phoneNumber}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.documentNumber}>
          <Label>Cédula de identidad</Label>
          <View className="flex-row gap-2">
            <SelectField
              value={vm.form.documentType}
              options={ID_TYPES}
              onChange={vm.setDocumentType}
              accessibilityLabel="Tipo de documento"
              width={PREFIX_WIDTH}
            />
            <FormInput
              className="flex-1"
              value={vm.form.documentNumber}
              onChangeText={vm.setDocumentNumber}
              placeholder="12345678"
              keyboardType="number-pad"
              maxLength={9}
              accessibilityLabel="Número de cédula"
            />
          </View>
          <FieldError>{vm.errors.documentNumber}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.bank}>
          <Label>Banco</Label>
          <SelectField
            value={vm.form.bank}
            options={BANKS}
            onChange={vm.setBank}
            placeholder="Selecciona tu banco"
            accessibilityLabel="Banco"
            presentation="sheet"
            sheetTitle="Selecciona tu banco"
            sheetDescription="El banco asociado a tu Pago Móvil."
            sheetSearchPlaceholder="Buscar banco"
          />
          <FieldError>{vm.errors.bank}</FieldError>
        </TextField>

        {vm.error ? <Text className="text-sm text-danger">{vm.error}</Text> : null}
      </ScrollView>

      {/* Guardar, fijo abajo (igual que en los demás formularios) */}
      <View
        style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
        className="px-4 pt-3">
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          isDisabled={vm.isSaving}
          onPress={vm.save}
          className="rounded-full bg-action">
          {vm.isSaving ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">
            {vm.isSaving ? 'Guardando…' : 'Guardar método de pago'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
