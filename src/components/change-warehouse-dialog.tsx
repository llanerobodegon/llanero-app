import { ConfirmDialog } from './confirm-dialog';

type ChangeWarehouseDialogProps = {
  isOpen: boolean;
  nextName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirma cambiar de tienda cuando el carrito tiene productos (se vaciará). */
export function ChangeWarehouseDialog({
  isOpen,
  nextName,
  onConfirm,
  onCancel,
}: ChangeWarehouseDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={`¿Cambiar a ${nextName}?`}
      description="Se vaciará tu carrito."
      confirmLabel="Cambiar"
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
