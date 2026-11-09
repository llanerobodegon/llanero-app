import {
  Button,
  Description,
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
import { CITIES, useAddressFormViewModel } from '@/viewmodels/useAddressFormViewModel';

/**
 * Formulario de dirección: nombre, dirección 1 y 2, y ciudad. Sin `addressId` crea una nueva;
 * con `addressId` la edita y ofrece marcarla como predeterminada o eliminarla.
 */
export function AddressFormView({ addressId }: { addressId?: string }) {
  const vm = useAddressFormViewModel(addressId);
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);
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
          icon={{ ios: 'mappin.slash', android: 'location_off' }}
          title="No encontramos esta dirección"
          description={vm.error ?? 'Puede que la hayas eliminado.'}
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
        <TextField isRequired isInvalid={!!vm.errors.label}>
          <Label>Nombre</Label>
          <FormInput
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
          <FormInput
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
          <FormInput
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

        {/* Opciones de una dirección existente */}
        {vm.isEditing ? (
          <View className="pt-2">
            <AccountMenuSection>
              {vm.isDefault ? null : (
                <AccountMenuItem
                  title="Usar como predeterminada"
                  icon={{ ios: 'star', android: 'star' }}
                  showChevron={false}
                  onPress={vm.makeDefault}
                />
              )}
              <AccountMenuItem
                title="Eliminar dirección"
                icon={{ ios: 'trash', android: 'delete' }}
                tone="danger"
                showChevron={false}
                onPress={vm.requestDelete}
              />
            </AccountMenuSection>
          </View>
        ) : null}
      </ScrollView>

      {/* Guardar, fijo abajo (igual que en Información personal) */}
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
        title="¿Eliminar esta dirección?"
        description={
          vm.isDefault
            ? 'Es tu dirección predeterminada. Si tienes otras, la más reciente pasará a serlo.'
            : 'Ya no podrás elegirla para tus pedidos.'
        }
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={vm.confirmDelete}
        onCancel={vm.cancelDelete}
      />
    </KeyboardAvoidingView>
  );
}
