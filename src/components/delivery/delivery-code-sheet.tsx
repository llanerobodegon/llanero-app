import { Button, InputOTP, Spinner } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 5;

type DeliveryCodeSheetProps = {
  attemptsLeft: number;
  /** Error del último intento ("Código incorrecto"). */
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (code: string) => void;
  onClose: () => void;
};

/**
 * Panel para escribir el código de 4 dígitos que el cliente le muestra al repartidor.
 * El código nunca llega a este teléfono: lo valida el servidor.
 */
export function DeliveryCodeSheet({
  attemptsLeft,
  error,
  isSubmitting,
  onSubmit,
  onClose,
}: DeliveryCodeSheetProps) {
  const [code, setCode] = useState('');
  const actionForeground = useActionForeground();
  const isComplete = code.length === CODE_LENGTH;

  // Solo dígitos, aunque se pegue otra cosa.
  const handleChange = (value: string) => setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH));

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-lg font-bold text-foreground" accessibilityRole="header">
          Código de entrega
        </Text>
        <Text className="text-sm text-muted">
          Pídele al cliente el código de 4 dígitos de su pedido.
        </Text>
      </View>

      <View className="items-center gap-2">
        <InputOTP
          value={code}
          onChange={handleChange}
          maxLength={CODE_LENGTH}
          isInvalid={!!error}
          isDisabled={isSubmitting}
          textInputProps={{ autoFocus: true, keyboardType: 'number-pad' }}>
          <InputOTP.Group>
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <InputOTP.Slot
                key={index}
                index={index}
                className={`rounded-2xl ${error ? '' : 'outline-action'}`}
              />
            ))}
          </InputOTP.Group>
        </InputOTP>

        {error ? (
          <Text className="text-sm text-danger" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {attemptsLeft < MAX_ATTEMPTS ? (
          <Text className="text-xs text-muted">
            {attemptsLeft === 1 ? 'Te queda 1 intento' : `Te quedan ${attemptsLeft} intentos`}
          </Text>
        ) : null}
      </View>

      <View className="flex-row gap-3">
        <Button
          variant="ghost"
          size="lg"
          isDisabled={isSubmitting}
          onPress={onClose}
          className="flex-1 rounded-full">
          <Button.Label>Cancelar</Button.Label>
        </Button>
        <Button
          size="lg"
          feedbackVariant="scale"
          isDisabled={!isComplete || isSubmitting}
          onPress={() => onSubmit(code)}
          className="flex-1 rounded-full bg-action">
          {isSubmitting ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">Confirmar entrega</Button.Label>
        </Button>
      </View>
    </View>
  );
}
