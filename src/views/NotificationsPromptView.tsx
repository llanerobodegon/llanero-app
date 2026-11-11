import { Button, Dialog, Spinner } from 'heroui-native';
import { Pressable, Text, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';
import { useNotificationsPromptViewModel } from '@/viewmodels/useNotificationsPromptViewModel';

/**
 * Aviso para activar las notificaciones, sobre cualquier pantalla al entrar a la app con sesión
 * y sin permiso. Va una sola vez en el layout raíz.
 */
export function NotificationsPromptView() {
  const vm = useNotificationsPromptViewModel();
  const actionForeground = useActionForeground();

  return (
    <Dialog
      isOpen={vm.isOpen}
      // Tocar fuera equivale a "Ahora no". Mientras se activa no se cierra.
      onOpenChange={(open) => !open && !vm.isEnabling && vm.postpone()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <View className="mb-5 gap-1.5">
            <Dialog.Title>Activa las notificaciones</Dialog.Title>
            <Dialog.Description>
              {vm.isDelivery
                ? 'Así te avisamos al instante cuando el bodegón te asigne un pedido.'
                : 'Así te avisamos cuando confirmemos tu pago y cuando tu pedido vaya en camino.'}
            </Dialog.Description>
            {vm.needsSettings ? (
              <Dialog.Description>
                El permiso está desactivado para Llanero. Actívalo en los Ajustes del teléfono.
              </Dialog.Description>
            ) : null}
            {vm.error && !vm.needsSettings ? (
              <View className="mt-2 rounded-xl bg-danger/10 px-3 py-2">
                <Text className="text-sm text-danger" accessibilityLiveRegion="polite">
                  {vm.error}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-2">
            <Button
              size="md"
              // Sin capa de color al presionar sobre el color de acción.
              feedbackVariant="scale"
              isDisabled={vm.isEnabling}
              onPress={vm.enable}
              className="rounded-full bg-action">
              {vm.isEnabling ? <Spinner size="sm" color={actionForeground} /> : null}
              <Button.Label className="text-action-foreground">
                {vm.needsSettings ? 'Abrir ajustes' : 'Activar notificaciones'}
              </Button.Label>
            </Button>
            <Button
              variant="ghost"
              size="md"
              isDisabled={vm.isEnabling}
              onPress={vm.postpone}
              className="rounded-full">
              <Button.Label>Ahora no</Button.Label>
            </Button>
            <Pressable
              onPress={vm.dismissForever}
              disabled={vm.isEnabling}
              hitSlop={8}
              accessibilityRole="button"
              className="items-center py-1 active:opacity-60">
              <Text className="text-xs text-muted underline">No volver a mostrar</Text>
            </Pressable>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
