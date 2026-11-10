import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Chip, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { OptionsSheet } from '@/components/options-sheet';
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
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);

  const label = isLoading ? 'Cargando tiendas…' : (selectedWarehouse?.name ?? 'Elige una tienda');
  const isDisabled = isLoading || warehouses.length === 0;

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(true);
  };

  const handleSelect = (warehouse: Warehouse) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Tienda: ${label}. Toca para cambiarla`}
        // self-center: el Chip de HeroUI trae `align-self: flex-start`, que anula el centrado del padre.
        className="h-11 gap-1.5 self-center bg-surface px-4 shadow-surface">
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

      <OptionsSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Elige tu tienda"
        description="El catálogo y los precios dependen de la tienda."
        options={warehouses}
        keyExtractor={(warehouse) => warehouse.id}
        // Con muchas tiendas: media pantalla, se puede subir y la lista tiene scroll nativo
        // (igual que la hoja de bancos). Con pocas, la hoja se ajusta al contenido.
        isScrollable={warehouses.length > 6}
        isSelected={(warehouse) => warehouse.id === selectedWarehouse?.id}
        onSelect={handleSelect}
        getAccessibilityLabel={(warehouse) =>
          `${warehouse.name}, ${warehouse.isOpen ? 'abierta' : 'cerrada'}`
        }
        renderOption={(warehouse) => (
          <>
            <View className="flex-row items-center gap-2">
              {/* Punto verde = abierta, rojo = cerrada */}
              <View
                className={`size-2 rounded-full ${warehouse.isOpen ? 'bg-success' : 'bg-danger'}`}
              />
              <Text className="shrink text-base font-medium text-foreground" numberOfLines={1}>
                {warehouse.name}
              </Text>
            </View>
            {warehouse.address ? (
              <Text className="pl-4 text-sm text-muted" numberOfLines={1}>
                {warehouse.address}
              </Text>
            ) : null}
          </>
        )}
      />
    </>
  );
}
