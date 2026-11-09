import { Button, FieldError, Label, Spinner, TextField, useThemeColor } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PasswordInput } from '@/components/form/password-input';
import { PasswordStrength } from '@/components/form/password-strength';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { useChangePasswordViewModel } from '@/viewmodels/useChangePasswordViewModel';

/** Cambiar contraseña: actual, nueva (con indicador de seguridad) y confirmación. */
export function ChangePasswordView() {
  const vm = useChangePasswordViewModel();
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);
  const actionForeground = useActionForeground();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Cambiar contraseña" onBack={vm.goBack} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <TextField isRequired isInvalid={!!vm.errors.currentPassword}>
          <Label>Contraseña actual</Label>
          <PasswordInput
            value={vm.form.currentPassword}
            onChangeText={vm.setCurrentPassword}
            placeholder="Tu contraseña actual"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.currentPassword}</FieldError>
        </TextField>

        <TextField isRequired isInvalid={!!vm.errors.newPassword}>
          <Label>Contraseña nueva</Label>
          <PasswordInput
            value={vm.form.newPassword}
            onChangeText={vm.setNewPassword}
            placeholder="Crea una contraseña segura"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
          />
          <FieldError>{vm.errors.newPassword}</FieldError>
        </TextField>

        <PasswordStrength password={vm.form.newPassword} />

        <TextField isRequired isInvalid={!!vm.errors.confirmPassword}>
          <Label>Confirmar contraseña nueva</Label>
          <PasswordInput
            value={vm.form.confirmPassword}
            onChangeText={vm.setConfirmPassword}
            placeholder="Repite la contraseña nueva"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={vm.save}
          />
          <FieldError>{vm.errors.confirmPassword}</FieldError>
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
          isDisabled={!vm.canSave}
          onPress={vm.save}
          className="rounded-full bg-action">
          {vm.isSaving ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">
            {vm.isSaving ? 'Guardando…' : 'Cambiar contraseña'}
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
