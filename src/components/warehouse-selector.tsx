import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SymbolView } from 'expo-symbols';
import { BottomSheet, Chip, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import type { Warehouse } from '@/models/warehouse.model';

type WarehouseSelectorProps = {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  onSelect: (warehouse: Warehouse) => void;
  isLoading?: boolean;
};

/** Chip con la tienda actual; al tocarlo abre una hoja inferior para cambiarla. */
export function WarehouseSelector({
  warehouses,
  selectedWarehouse,
  onSelect,
  isLoading = false,
}: WarehouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const scheme = useColorScheme();
  // Igual que el tab activo: vinotinto en claro, naranja en oscuro (contraste).
  const selectedColor = scheme === 'dark' ? Colors.dark.accent : Colors.light.accentSecondary;

  const label = isLoading ? 'Cargando tiendas…' : (selectedWarehouse?.name ?? 'Elige una tienda');

  const handleSelect = (warehouse: Warehouse) => {
    onSelect(warehouse);
    setIsOpen(false);
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <Chip
        variant="secondary"
        color="default"
        size="lg"
        disabled={isLoading || warehouses.length === 0}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Tienda: ${label}. Toca para cambiarla`}
        className="gap-1.5 self-center">
        <SymbolView
          name={{ ios: 'storefront', android: 'storefront', web: 'storefront' }}
          size={16}
          tintColor={foreground}
        />
        <Chip.Label numberOfLines={1} className="max-w-56">
          {label}
        </Chip.Label>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          size={12}
          tintColor={muted}
        />
      </Chip>

      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={['55%', '85%']}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full">
          <View className="mb-3 gap-1 px-1">
            <BottomSheet.Title>Elige tu tienda</BottomSheet.Title>
            <BottomSheet.Description>
              El catálogo y los precios dependen de la tienda.
            </BottomSheet.Description>
          </View>

          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
            {warehouses.map((warehouse) => {
              const isSelected = warehouse.id === selectedWarehouse?.id;
              return (
                <Pressable
                  key={warehouse.id}
                  onPress={() => handleSelect(warehouse)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-default">
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {warehouse.name}
                      </Text>
                      {!warehouse.isOpen ? (
                        <Chip size="sm" variant="soft" color="warning">
                          Cerrada
                        </Chip>
                      ) : null}
                    </View>
                    {warehouse.address ? (
                      <Text className="text-sm text-muted" numberOfLines={1}>
                        {warehouse.address}
                      </Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={18}
                      tintColor={selectedColor}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
