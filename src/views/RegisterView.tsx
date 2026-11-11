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
  CODE_LENGTH,
  REGISTER_STEPS,
  useRegisterViewModel,
} from '@/viewmodels/useRegisterViewModel';

/** Registro en 3 pasos: datos básicos, contraseña y código de verificación. */
export function RegisterView() {
  const vm = useRegisterViewModel();
  const insets = useSafeAreaInsets();
  const actionForeground = useActionForeground();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Crear cuenta" onBack={vm.back} />
      <View className="pb-3 pt-1">
        <StepsIndicator steps={REGISTER_STEPS} current={vm.step} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4 pt-2 pb-6">
        {vm.step === 0 ? (
          <>
            <Text className="pl-1 text-sm text-muted">
              Cuéntanos quién eres. Te enviaremos un código a tu correo para verificarlo.
            </Text>
            <TextField isRequired isInvalid={!!vm.errors.firstName}>
              <Label>Nombre</Label>
              <FormInput
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
              <FormInput
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
                returnKeyType="next"
                onSubmitEditing={vm.next}
              />
              <FieldError>{vm.errors.email}</FieldError>
            </TextField>
          </>
        ) : vm.step === 1 ? (
          <>
            <TextField isRequired isInvalid={!!vm.errors.password}>
              <Label>Contraseña</Label>
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
              <Label>Confirmar contraseña</Label>
              <PasswordInput
                value={vm.form.confirmPassword}
                onChangeText={vm.setConfirmPassword}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={vm.next}
              />
              <FieldError>{vm.errors.confirmPassword}</FieldError>
            </TextField>
          </>
        ) : (
          <VerificationCode
            email={vm.email}
            value={vm.form.code}
            onChange={vm.setCode}
            onComplete={vm.verifyCode}
            length={CODE_LENGTH}
            isInvalid={!!vm.error}
            isDisabled={vm.isSubmitting}
            resendIn={vm.resendIn}
            onResend={vm.resendCode}
          />
        )}

        {vm.error ? (
          <View className="rounded-2xl bg-danger/10 px-4 py-3">
            <Text
              className={`text-sm text-danger ${vm.step === 2 ? 'text-center' : ''}`}
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
