import { ConfirmDialog } from './confirm-dialog';

type ChangeWarehouseDialogProps = {
  isOpen: boolean;
  currentName: string;
  nextName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirma cambiar de tienda cuando el carrito tiene productos (se vaciará). */
export function ChangeWarehouseDialog({
  isOpen,
  currentName,
  nextName,
  onConfirm,
  onCancel,
}: ChangeWarehouseDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={`¿Cambiar a ${nextName}?`}
      description={`Tu carrito tiene productos de ${currentName} y se vaciará, porque los precios y la disponibilidad cambian según la tienda.`}
      confirmLabel="Cambiar y vaciar"
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
