import { BottomSheet, RNHostView } from '@expo/ui';
import { Button, Spinner, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

import { NumberKeypad } from '@/components/form/number-keypad';
import { useActionForeground } from '@/hooks/use-action-foreground';

/** Margen lateral de la hoja; se fija igual en iOS y Android para calcular el ancho. */
const SHEET_PADDING = 16;
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 5;

type DeliveryCodeSheetProps = {
  isOpen: boolean;
  attemptsLeft: number;
  /** Error del último intento ("Código incorrecto"). */
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (code: string) => void;
  onClose: () => void;
};

/**
 * Hoja para escribir el código de 4 dígitos que el cliente le muestra al repartidor, con el
 * mismo teclado propio que la referencia del pago en el checkout (sin el teclado del sistema).
 * El código nunca llega a este teléfono: lo valida el servidor.
 */
export function DeliveryCodeSheet({
  isOpen,
  attemptsLeft,
  error,
  isSubmitting,
  onSubmit,
  onClose,
}: DeliveryCodeSheetProps) {
  const [code, setCode] = useState('');
  const [background] = useThemeColor(['background']);
  const actionForeground = useActionForeground();
  // La hoja nativa no le impone ancho al contenido de React Native (ver OptionsSheet).
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - SHEET_PADDING * 2;

  // El campo vuelve vacío cada vez que se abre la hoja y después de un código incorrecto
  // (cambian los intentos), para no reenviar el mismo sin querer.
  const resetKey = `${isOpen}:${attemptsLeft}`;
  const [seenResetKey, setSeenResetKey] = useState(resetKey);
  if (resetKey !== seenResetKey) {
    setSeenResetKey(resetKey);
    setCode('');
  }

  const isComplete = code.length === CODE_LENGTH;
  // Al volver a escribir se deja de marcar el error del intento anterior.
  const showError = !!error && code.length === 0;

  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={onClose}
      containerColor={background}
      contentPadding={{ top: SHEET_PADDING, left: SHEET_PADDING, right: SHEET_PADDING }}>
      <RNHostView matchContents={{ vertical: true }}>
        <View style={{ width: contentWidth }} className="gap-4 pb-4">
          <View className="gap-1 px-3">
            <Text className="text-lg font-semibold text-foreground" accessibilityRole="header">
              Código de entrega
            </Text>
            <Text className="text-sm text-muted">
              Pídele al cliente el código de 4 dígitos de su pedido.
            </Text>
          </View>

          {/* Los 4 dígitos en grande, con el error y los intentos que quedan */}
          <View className="items-center gap-3 rounded-3xl bg-surface px-4 py-5">
            <View
              className="flex-row gap-3"
              accessibilityLiveRegion="polite"
              accessibilityLabel={code ? `Código ${code.split('').join(' ')}` : 'Código vacío'}>
              {Array.from({ length: CODE_LENGTH }, (_, index) => (
                <View
                  key={index}
                  className={`size-14 items-center justify-center rounded-2xl border-2 bg-background ${
                    showError
                      ? 'border-danger'
                      : index === code.length
                        ? 'border-action'
                        : 'border-transparent'
                  }`}>
                  <Text
                    className="text-3xl font-bold text-foreground"
                    style={{ fontVariant: ['tabular-nums'] }}>
                    {code[index] ?? ''}
                  </Text>
                </View>
              ))}
            </View>
            {showError ? (
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

          <NumberKeypad
            value={code}
            onChange={setCode}
            maxLength={CODE_LENGTH}
            width={contentWidth}
            isDisabled={isSubmitting}
          />

          <Button
            size="lg"
            // Sin capa de color al presionar sobre el color de acción.
            feedbackVariant="scale"
            isDisabled={!isComplete || isSubmitting}
            onPress={() => onSubmit(code)}
            className="rounded-full bg-action">
            {isSubmitting ? <Spinner size="sm" color={actionForeground} /> : null}
            <Button.Label className="text-action-foreground">
              {isSubmitting ? 'Confirmando…' : 'Confirmar entrega'}
            </Button.Label>
          </Button>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}
