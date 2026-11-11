import { SymbolView } from 'expo-symbols';
import {
  Button,
  FieldError,
  Label,
  Skeleton,
  Spinner,
  TextField,
  useThemeColor,
} from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountMenuItem, AccountMenuSection } from '@/components/account/account-menu';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { FormInput } from '@/components/form/form-input';
import { SelectField } from '@/components/form/select-field';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { BANKS, ID_TYPES, PHONE_CODES } from '@/lib/venezuela';
import { usePaymentMethodFormViewModel } from '@/viewmodels/usePaymentMethodFormViewModel';

/** Ancho común de los desplegables de operadora y tipo de cédula, para que los campos se alineen. */
const PREFIX_WIDTH = 104;

/**
 * Método de pago (Pago Móvil): alias, teléfono, cédula y banco. Sin `methodId` crea uno
 * nuevo; con `methodId` lo edita y ofrece marcarlo como predeterminado o eliminarlo.
 */
export function PaymentMethodFormView({ methodId }: { methodId?: string }) {
  const vm = usePaymentMethodFormViewModel(methodId);
  const insets = useSafeAreaInsets();
  const [background, foreground] = useThemeColor(['background', 'foreground']);
  const actionForeground = useActionForeground();
  const header = <ScreenHeader title={vm.title} onBack={vm.goBack} />;

  if (vm.isLoading) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <View className="gap-5 px-4 pt-4">
          {Array.from({ length: 4 }, (_, index) => (
            <View key={index} className="gap-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-12 w-full rounded-full" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (vm.isNotFound) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <EmptyState
          icon={{ ios: 'creditcard.trianglebadge.exclamationmark', android: 'credit_card_off' }}
          title="No encontramos este método de pago"
          description={vm.error ?? 'Puede que lo hayas eliminado.'}
          actionLabel="Volver"
          onPressAction={vm.goBack}
        />
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
        {/* Para qué se guardan estos datos (solo al crear) */}
        {vm.isEditing ? null : (
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
        )}

        <TextField isRequired isInvalid={!!vm.errors.alias}>
          <Label>Alias</Label>
          <FormInput
            value={vm.form.alias}
            onChangeText={vm.setAlias}
            // `customer_payment_methods.alias` es VARCHAR(50).
            maxLength={50}
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

        {/* Opciones de un método existente (igual que en direcciones) */}
        {vm.isEditing ? (
          <View className="pt-2">
            <AccountMenuSection>
              {vm.isDefault ? null : (
                <AccountMenuItem
                  title="Usar como predeterminado"
                  icon={{ ios: 'star', android: 'star' }}
                  showChevron={false}
                  onPress={vm.makeDefault}
                />
              )}
              <AccountMenuItem
                title="Eliminar método de pago"
                icon={{ ios: 'trash', android: 'delete' }}
                tone="danger"
                showChevron={false}
                onPress={vm.requestDelete}
              />
            </AccountMenuSection>
          </View>
        ) : null}
      </ScrollView>

      {/* Guardar, fijo abajo (igual que en los demás formularios) */}
      <View
        style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
        className="px-4 pt-3">
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          isDisabled={!vm.canSave}
          onPress={vm.save}
          className="rounded-full bg-action">
          {vm.isSaving ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">
            {vm.isSaving ? 'Guardando…' : vm.saveLabel}
          </Button.Label>
        </Button>
      </View>

      <ConfirmDialog
        isOpen={vm.isDeleteConfirmOpen}
        title="¿Eliminar este método de pago?"
        description={
          vm.isDefault
            ? 'Es tu método predeterminado. Si tienes otros, el más reciente pasará a serlo.'
            : 'Ya no aparecerá al pagar tus pedidos.'
        }
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={vm.confirmDelete}
        onCancel={vm.cancelDelete}
      />
    </KeyboardAvoidingView>
  );
}
