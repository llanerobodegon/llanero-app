import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SymbolView } from 'expo-symbols';
import { Chip, Description, Select, Separator, useThemeColor } from 'heroui-native';
import { Fragment, type ComponentProps } from 'react';
import { useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import type { Warehouse } from '@/models/warehouse.model';

type SelectValue = ComponentProps<typeof Select>['value'];
type SelectOption = Exclude<NonNullable<SelectValue>, unknown[]>;

type WarehouseSelectorProps = {
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  onSelect: (warehouse: Warehouse) => void;
  isLoading?: boolean;
};

/** Chip con la tienda actual; al tocarlo abre un Select en hoja inferior para cambiarla. */
export function WarehouseSelector({
  warehouses,
  selectedWarehouse,
  onSelect,
  isLoading = false,
}: WarehouseSelectorProps) {
  const insets = useSafeAreaInsets();
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const scheme = useColorScheme();
  // Igual que el tab activo: vinotinto en claro, naranja en oscuro (contraste).
  const selectedColor = scheme === 'dark' ? Colors.dark.accent : Colors.light.accentSecondary;

  const label = isLoading ? 'Cargando tiendas…' : (selectedWarehouse?.name ?? 'Elige una tienda');
  const isDisabled = isLoading || warehouses.length === 0;

  const value: SelectOption | undefined = selectedWarehouse
    ? { value: selectedWarehouse.id, label: selectedWarehouse.name }
    : undefined;

  const handleValueChange = (option: SelectValue) => {
    if (!option || Array.isArray(option)) return;
    const warehouse = warehouses.find((w) => w.id === option.value);
    if (warehouse) onSelect(warehouse);
  };

  return (
    <Select
      presentation="bottom-sheet"
      value={value}
      onValueChange={handleValueChange}
      isDisabled={isDisabled}>
      <Select.Trigger variant="unstyled" asChild>
        <Chip
          variant="secondary"
          color="default"
          size="lg"
          disabled={isDisabled}
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
      </Select.Trigger>

      <Select.Portal>
        <Select.Overlay />
        <Select.Content
          presentation="bottom-sheet"
          snapPoints={['55%', '85%']}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full">
          <View className="mb-3 gap-1 px-1">
            <Select.ListLabel>Elige tu tienda</Select.ListLabel>
            <Description>
              El catálogo y los precios dependen de la tienda.
            </Description>
          </View>

          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
            {warehouses.map((warehouse, index) => (
              <Fragment key={warehouse.id}>
                <Select.Item value={warehouse.id} label={warehouse.name}>
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2">
                      <Select.ItemLabel numberOfLines={1} />
                      {!warehouse.isOpen ? (
                        <Chip size="sm" variant="soft" color="warning">
                          Cerrada
                        </Chip>
                      ) : null}
                    </View>
                    {warehouse.address ? (
                      <Select.ItemDescription numberOfLines={1}>
                        {warehouse.address}
                      </Select.ItemDescription>
                    ) : null}
                  </View>
                  <Select.ItemIndicator iconProps={{ size: 18, color: selectedColor }} />
                </Select.Item>
                {index < warehouses.length - 1 ? <Separator /> : null}
              </Fragment>
            ))}
          </BottomSheetScrollView>
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
