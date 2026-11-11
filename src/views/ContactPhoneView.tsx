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

import { FormInput } from '@/components/form/form-input';
import { SelectField } from '@/components/form/select-field';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { PHONE_CODES } from '@/lib/venezuela';
import { useContactPhoneViewModel } from '@/viewmodels/useContactPhoneViewModel';

/** Mismo ancho del desplegable de operadora que en "Información personal". */
const PREFIX_WIDTH = 104;

/** Teléfono de contacto para la entrega: lo pide el checkout de un delivery si falta. */
export function ContactPhoneView() {
  const vm = useContactPhoneViewModel();
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);
  const actionForeground = useActionForeground();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Teléfono de contacto" onBack={vm.goBack} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <Text className="text-sm leading-5 text-muted">
          El repartidor lo usará para llamarte o escribirte por WhatsApp cuando lleve tu pedido.
        </Text>

        {vm.isLoading ? (
          <View className="gap-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-12 w-full rounded-full" />
          </View>
        ) : (
          <TextField isRequired isInvalid={!!vm.phoneError}>
            <Label>Teléfono</Label>
            <View className="flex-row gap-2">
              <SelectField
                value={vm.phoneCode}
                options={PHONE_CODES}
                onChange={vm.setPhoneCode}
                accessibilityLabel="Código de operadora"
                width={PREFIX_WIDTH}
              />
              <FormInput
                className="flex-1"
                value={vm.phone}
                onChangeText={vm.setPhone}
                placeholder="1234567"
                keyboardType="number-pad"
                maxLength={7}
                textContentType="telephoneNumber"
                autoFocus
                accessibilityLabel="Número de teléfono"
              />
            </View>
            <FieldError>{vm.phoneError}</FieldError>
          </TextField>
        )}

        {vm.error ? <Text className="text-sm text-danger">{vm.error}</Text> : null}
      </ScrollView>

      {/* Guardar, fijo abajo (igual que en "Información personal") */}
      <View
        style={{
          paddingBottom: insets.bottom + 12,
          backgroundColor: background,
        }}
        className="px-4 pt-3">
        <Button
          size="lg"
          feedbackVariant="scale"
          isDisabled={!vm.canSave}
          onPress={vm.save}
          className="rounded-full bg-action">
          {vm.isSaving ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">
            {vm.isSaving ? 'Guardando…' : 'Guardar teléfono'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
