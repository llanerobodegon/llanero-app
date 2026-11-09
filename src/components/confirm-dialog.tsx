import { Button, Dialog } from 'heroui-native';
import { View } from 'react-native';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` para acciones que borran algo. */
  tone?: 'danger' | 'default';
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
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <View className="mb-5 gap-1.5">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
          </View>
          <View className="flex-row justify-end gap-3">
            <Button variant="ghost" size="sm" onPress={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onPress={onConfirm}>
              {confirmLabel}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
