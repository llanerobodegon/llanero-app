import { Button, Dialog, Spinner, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` para acciones que borran algo. */
  tone?: 'danger' | 'default';
  /** Acción en curso: indicador en el botón, botones desactivados y no se puede cerrar. */
  isLoading?: boolean;
  /** Texto del botón mientras carga ("Eliminando…"). */
  loadingLabel?: string;
  /** Error de la acción: se muestra dentro del diálogo (y se puede reintentar). */
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Diálogo de confirmación (HeroUI) con botón de cancelar y de confirmar. */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  isLoading = false,
  loadingLabel,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [dangerForeground, accentForeground] = useThemeColor([
    'danger-foreground',
    'accent-foreground',
  ]);

  return (
    <Dialog
      isOpen={isOpen}
      // Mientras la acción está en curso no se cierra tocando fuera.
      onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <View className="mb-5 gap-1.5">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
            {errorMessage ? (
              <View className="mt-2 rounded-xl bg-danger/10 px-3 py-2">
                <Text className="text-sm text-danger" accessibilityLiveRegion="polite">
                  {errorMessage}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="flex-row justify-end gap-3">
            <Button variant="ghost" size="sm" isDisabled={isLoading} onPress={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              size="sm"
              isDisabled={isLoading}
              onPress={onConfirm}>
              {isLoading ? (
                <Spinner
                  size="sm"
                  color={tone === 'danger' ? dangerForeground : accentForeground}
                />
              ) : null}
              <Button.Label>
                {isLoading
                  ? (loadingLabel ?? confirmLabel)
                  : errorMessage
                    ? 'Reintentar'
                    : confirmLabel}
              </Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
