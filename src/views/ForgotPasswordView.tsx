import { SymbolView } from 'expo-symbols';
import { Button, FieldError, Label, Spinner, TextField } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormInput } from '@/components/form/form-input';
import { PasswordInput } from '@/components/form/password-input';
import { PasswordStrength } from '@/components/form/password-strength';
import { VerificationCode } from '@/components/form/verification-code';
import { ScreenHeader } from '@/components/screen-header';
import { StepsIndicator } from '@/components/steps-indicator';
import { useActionForeground } from '@/hooks/use-action-foreground';
import {
  FORGOT_PASSWORD_STEPS,
  RESET_CODE_LENGTH,
  useForgotPasswordViewModel,
} from '@/viewmodels/useForgotPasswordViewModel';

/** Recuperar contraseña: correo, código y contraseña nueva; al final, confirmación. */
export function ForgotPasswordView({ initialEmail }: { initialEmail: string }) {
  const vm = useForgotPasswordViewModel(initialEmail);
  const insets = useSafeAreaInsets();
  const actionForeground = useActionForeground();

  // Confirmación: minimalista, como la bienvenida del registro.
  if (vm.isDone) {
    return (
      <View
        className="flex-1 bg-background px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 12 }}>
        <View className="flex-1 items-center justify-center gap-4">
          <View className="size-20 items-center justify-center rounded-full bg-action">
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={34}
              weight="bold"
              tintColor={actionForeground}
            />
          </View>
          <Text
            className="text-center text-3xl font-bold text-foreground"
            accessibilityRole="header">
            Contraseña actualizada
          </Text>
          <Text className="text-center text-base text-muted">
            Listo, ya entraste con tu contraseña nueva.
          </Text>
        </View>
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          onPress={vm.goToApp}
          className="rounded-full bg-action">
          <Button.Label className="text-action-foreground">Ir a Explorar</Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Recuperar contraseña" onBack={vm.back} />
      <View className="pb-3 pt-1">
        <StepsIndicator steps={FORGOT_PASSWORD_STEPS} current={vm.step} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-2 pb-6">
        {vm.step === 0 ? (
          <>
            <Text className="pl-1 text-sm text-muted">
              Escribe el correo de tu cuenta y te enviaremos un código para crear una contraseña
              nueva.
            </Text>
            <TextField isRequired isInvalid={!!vm.errors.email}>
              <Label>Correo</Label>
              <FormInput
                value={vm.form.email}
                onChangeText={vm.setEmail}
                placeholder="tucorreo@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={vm.next}
              />
              <FieldError>{vm.errors.email}</FieldError>
            </TextField>
          </>
        ) : vm.step === 1 ? (
          <VerificationCode
            email={vm.email}
            value={vm.form.code}
            onChange={vm.setCode}
            onComplete={vm.verifyCode}
            length={RESET_CODE_LENGTH}
            isInvalid={!!vm.error}
            isDisabled={vm.isSubmitting}
            resendIn={vm.resendIn}
            onResend={vm.resendCode}
          />
        ) : (
          <>
            <TextField isRequired isInvalid={!!vm.errors.password}>
              <Label>Contraseña nueva</Label>
              <PasswordInput
                value={vm.form.password}
                onChangeText={vm.setPassword}
                placeholder="Crea una contraseña segura"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
              />
              <FieldError>{vm.errors.password}</FieldError>
            </TextField>
            <PasswordStrength password={vm.form.password} />
            <TextField isRequired isInvalid={!!vm.errors.confirmPassword}>
              <Label>Confirmar contraseña nueva</Label>
              <PasswordInput
                value={vm.form.confirmPassword}
                onChangeText={vm.setConfirmPassword}
                placeholder="Repite la contraseña nueva"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={vm.next}
              />
              <FieldError>{vm.errors.confirmPassword}</FieldError>
            </TextField>
          </>
        )}

        {vm.error ? (
          <View className="rounded-2xl bg-danger/10 px-4 py-3">
            <Text
              className={`text-sm text-danger ${vm.step === 1 ? 'text-center' : ''}`}
              accessibilityLiveRegion="polite">
              {vm.error}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 12 }} className="px-4 pt-3">
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          isDisabled={!vm.canContinue}
          onPress={vm.next}
          className="rounded-full bg-action">
          {vm.isSubmitting ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">{vm.primaryLabel}</Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
