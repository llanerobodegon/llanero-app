import { BottomSheet, RNHostView } from '@expo/ui';
import { SymbolView } from 'expo-symbols';
import { Chip, Separator, useThemeColor } from 'heroui-native';
import { Fragment, useState } from 'react';
import { Pressable, Text, useColorScheme, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Warehouse } from '@/models/warehouse.model';

type WarehouseSelectorProps = {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  onSelect: (warehouse: Warehouse) => void;
  isLoading?: boolean;
};

/** Chip con la tienda actual; al tocarlo abre una hoja nativa (`@expo/ui`) para cambiarla. */
export function WarehouseSelector({
  warehouses,
  selectedWarehouse,
  onSelect,
  isLoading = false,
}: WarehouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [foreground, muted, background] = useThemeColor(['foreground', 'muted', 'background']);
  const scheme = useColorScheme();
  // Igual que el tab activo: vinotinto en claro, naranja en oscuro (contraste).
  const selectedColor = scheme === 'dark' ? Colors.dark.accent : Colors.light.accentSecondary;

  const label = isLoading ? 'Cargando tiendas…' : (selectedWarehouse?.name ?? 'Elige una tienda');
  const isDisabled = isLoading || warehouses.length === 0;

  const handleSelect = (warehouse: Warehouse) => {
    onSelect(warehouse);
    setIsOpen(false);
  };

  return (
    <>
      <Chip
        variant="secondary"
        color="default"
        size="lg"
        disabled={isDisabled}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Tienda: ${label}. Toca para cambiarla`}
        className="h-11 gap-1.5 bg-surface px-4 shadow-surface">
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

      {/* Sin snapPoints la hoja se ajusta al contenido; son pocas tiendas.
          Fondo gris sutil (el del Inicio) y las opciones en una tarjeta blanca. */}
      <BottomSheet
        isPresented={isOpen}
        onDismiss={() => setIsOpen(false)}
        containerColor={background}>
        <RNHostView matchContents={{ vertical: true }}>
          <View className="gap-3 pb-4">
            <View className="gap-1 px-3">
              <Text className="text-lg font-semibold text-foreground" accessibilityRole="header">
                Elige tu tienda
              </Text>
              <Text className="text-sm text-muted">
                El catálogo y los precios dependen de la tienda.
              </Text>
            </View>

            <View className="overflow-hidden rounded-3xl bg-surface">
              {warehouses.map((warehouse, index) => {
                const isSelected = warehouse.id === selectedWarehouse?.id;
                return (
                  <Fragment key={warehouse.id}>
                    <Pressable
                      onPress={() => handleSelect(warehouse)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-60">
                      <View className="flex-1 gap-0.5">
                        <View className="flex-row items-center gap-2">
                          <Text
                            className="shrink text-base font-medium text-foreground"
                            numberOfLines={1}>
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
                        // Check blanco dentro de un círculo con el color de selección.
                        <View
                          style={{ backgroundColor: selectedColor }}
                          className="size-6 items-center justify-center rounded-full">
                          <SymbolView
                            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                            size={12}
                            weight="bold"
                            tintColor="#ffffff"
                          />
                        </View>
                      ) : null}
                    </Pressable>
                    {index < warehouses.length - 1 ? <Separator className="mx-4" /> : null}
                  </Fragment>
                );
              })}
            </View>
          </View>
        </RNHostView>
      </BottomSheet>
    </>
  );
}
