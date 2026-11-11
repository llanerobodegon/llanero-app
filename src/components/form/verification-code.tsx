import { InputOTP } from 'heroui-native';
import { Pressable, Text, View } from 'react-native';

type VerificationCodeProps = {
  /** Correo al que se envió el código. */
  email: string;
  value: string;
  onChange: (value: string) => void;
  /** Se llama al escribir el último dígito. */
  onComplete: (code: string) => void;
  length: number;
  isInvalid?: boolean;
  isDisabled?: boolean;
  /** Segundos que faltan para poder reenviar (0 = ya se puede). */
  resendIn: number;
  onResend: () => void;
};

/**
 * Código de verificación enviado por correo (registro, recuperar contraseña): a quién se envió,
 * los cuadros de `InputOTP` de HeroUI y "Reenviar código" con cuenta regresiva.
 */
export function VerificationCode({
  email,
  value,
  onChange,
  onComplete,
  length,
  isInvalid = false,
  isDisabled = false,
  resendIn,
  onResend,
}: VerificationCodeProps) {
  return (
    <View className="items-center gap-6 pt-2">
      <View className="items-center gap-1">
        <Text className="text-center text-sm text-muted">
          {`Enviamos un código de ${length} dígitos a`}
        </Text>
        <Text className="text-center text-base font-semibold text-foreground">{email}</Text>
      </View>

      <InputOTP
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        maxLength={length}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        // Teclado numérico y autocompletar el código que llega por correo/SMS.
        textInputProps={{
          autoFocus: true,
          keyboardType: 'number-pad',
          textContentType: 'oneTimeCode',
          autoComplete: 'one-time-code',
        }}>
        <InputOTP.Group>
          {Array.from({ length }, (_, index) => (
            <InputOTP.Slot
              key={index}
              index={index}
              // Cuadros redondeados (no píldora) y foco del color de acción; rojo si hay error.
              className={`rounded-2xl ${isInvalid ? '' : 'outline-action'}`}
            />
          ))}
        </InputOTP.Group>
      </InputOTP>

      {resendIn > 0 ? (
        <Text className="text-sm text-muted">{`Reenviar código en ${resendIn} s`}</Text>
      ) : (
        <Pressable
          onPress={onResend}
          hitSlop={8}
          accessibilityRole="button"
          className="active:opacity-60">
          <Text className="text-sm font-semibold text-action">Reenviar código</Text>
        </Pressable>
      )}
    </View>
  );
}
