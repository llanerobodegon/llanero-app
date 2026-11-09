import { SymbolView } from 'expo-symbols';
import { Button, Skeleton, useThemeColor } from 'heroui-native';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddressCard } from '@/components/address/address-card';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/screen-header';
import { useAddressesViewModel } from '@/viewmodels/useAddressesViewModel';

/** Direcciones de entrega del cliente. */
export function AddressesView() {
  const vm = useAddressesViewModel();
  const insets = useSafeAreaInsets();
  const [background] = useThemeColor(['background']);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Mis direcciones" onBack={vm.goBack} />

      {vm.isLoading ? (
        <View className="gap-3 px-4 pt-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-3xl" />
          ))}
        </View>
      ) : vm.error ? (
        <EmptyState
          icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
          title="No pudimos cargar tus direcciones"
          description={vm.error}
          actionLabel="Reintentar"
          onPressAction={vm.retry}
        />
      ) : vm.isEmpty ? (
        <EmptyState
          icon={{ ios: 'mappin.and.ellipse', android: 'location_on' }}
          title="Aún no tienes direcciones"
          description="Agrega una dirección para recibir tus pedidos por delivery."
          actionLabel="Agregar dirección"
          onPressAction={vm.addAddress}
        />
      ) : (
        <>
          <FlatList
            data={vm.addresses}
            keyExtractor={(address) => address.id}
            renderItem={({ item }) => <AddressCard address={item} />}
            ItemSeparatorComponent={() => <View className="h-3" />}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-4 pb-6"
          />

          {/* Agregar otra, fijo abajo (igual que "Guardar" en los formularios) */}
          <View
            style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
            className="px-4 pt-3">
            <Button
              size="lg"
              // Sin capa de color al presionar: en `primary` sería naranja sobre el botón negro.
              feedbackVariant="scale"
              onPress={vm.addAddress}
              className="rounded-full bg-foreground">
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={16}
                weight="semibold"
                tintColor={background}
              />
              <Button.Label className="text-background">Agregar dirección</Button.Label>
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
