import { Button, FieldError, Label, Spinner, TextField } from 'heroui-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormInput } from '@/components/form/form-input';
import { PasswordInput } from '@/components/form/password-input';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { useLoginViewModel } from '@/viewmodels/useLoginViewModel';

/** Ingresar con email: correo, contraseña, "¿Olvidaste tu contraseña?" y registro. */
export function LoginView() {
  const vm = useLoginViewModel();
  const insets = useSafeAreaInsets();
  const actionForeground = useActionForeground();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Ingresar con email" onBack={vm.goBack} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-8 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="gap-1 pl-1">
          <Text className="text-2xl font-bold text-foreground">¡Hola de nuevo!</Text>
          <Text className="text-sm text-muted">Ingresa tu correo y tu contraseña.</Text>
        </View>

        <View className="gap-5">
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
            />
            <FieldError>{vm.errors.email}</FieldError>
          </TextField>

          <TextField isRequired isInvalid={!!vm.errors.password}>
            <Label>Contraseña</Label>
            <PasswordInput
              value={vm.form.password}
              onChangeText={vm.setPassword}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={vm.signIn}
            />
            <FieldError>{vm.errors.password}</FieldError>
          </TextField>

          <Pressable
            onPress={vm.forgotPassword}
            hitSlop={8}
            accessibilityRole="button"
            className="-mt-2 self-end active:opacity-60">
            <Text className="text-sm font-medium text-action">¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {vm.error ? (
            <View className="rounded-2xl bg-danger/10 px-4 py-3">
              <Text className="text-sm text-danger" accessibilityLiveRegion="polite">
                {vm.error}
              </Text>
            </View>
          ) : null}

          <Button
            size="lg"
            // Sin capa de color al presionar sobre el color de acción.
            feedbackVariant="scale"
            isDisabled={!vm.canSubmit}
            onPress={vm.signIn}
            className="rounded-full bg-action">
            {vm.isSubmitting ? <Spinner size="sm" color={actionForeground} /> : null}
            <Button.Label className="text-action-foreground">
              {vm.isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
            </Button.Label>
          </Button>
        </View>

        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-sm text-muted">¿No tienes cuenta?</Text>
          <Pressable
            onPress={vm.goToRegister}
            hitSlop={8}
            accessibilityRole="button"
            className="active:opacity-60">
            <Text className="text-sm font-semibold text-action">Regístrate</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
