import { SymbolView } from 'expo-symbols';
import { Button, Skeleton, useThemeColor } from 'heroui-native';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { PaymentMethodCard } from '@/components/payment-method/payment-method-card';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { usePaymentMethodsViewModel } from '@/viewmodels/usePaymentMethodsViewModel';

/** Métodos de pago guardados del cliente. */
export function PaymentMethodsView() {
  const vm = usePaymentMethodsViewModel();
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);
  const actionForeground = useActionForeground();

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Métodos de pago" onBack={vm.goBack} />

      {vm.isLoading ? (
        <View className="gap-3 px-4 pt-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-3xl" />
          ))}
        </View>
      ) : vm.error ? (
        <EmptyState
          icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
          title="No pudimos cargar tus métodos de pago"
          description={vm.error}
          actionLabel="Reintentar"
          onPressAction={vm.retry}
        />
      ) : vm.isEmpty ? (
        <EmptyState
          icon={{ ios: 'creditcard', android: 'credit_card' }}
          title="Aún no tienes métodos de pago"
          description="Guarda tus datos de Pago Móvil para pagar tus pedidos más rápido."
          actionLabel="Agregar método de pago"
          onPressAction={vm.addPaymentMethod}
        />
      ) : (
        <>
          <FlatList
            data={vm.paymentMethods}
            keyExtractor={(method) => method.id}
            renderItem={({ item }) => (
              <PaymentMethodCard method={item} onPress={vm.editPaymentMethod} />
            )}
            ItemSeparatorComponent={() => <View className="h-2.5" />}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-4 pb-6"
          />

          {/* Agregar otro, fijo abajo (igual que en Direcciones) */}
          <View
            style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
            className="px-4 pt-3">
            <Button
              size="lg"
              // Sin capa de color al presionar sobre el color de acción.
              feedbackVariant="scale"
              onPress={vm.addPaymentMethod}
              className="rounded-full bg-action">
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={16}
                weight="semibold"
                tintColor={actionForeground}
              />
              <Button.Label className="text-action-foreground">Agregar método de pago</Button.Label>
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
