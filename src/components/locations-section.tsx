import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Skeleton, useThemeColor } from 'heroui-native';
import { FlatList, Pressable, View } from 'react-native';

import type { Warehouse } from '@/models/warehouse.model';

import { SectionHeader } from './section-header';

const SIDE_PADDING = 16;
const GAP = 12;
/** Ancho de cada logo; el alto sale de la proporción 2:1 (140 × 70). */
const ITEM_WIDTH = 140;
const SKELETON_COUNT = 3;

type LocationsSectionProps = {
  title?: string;
  warehouses: Warehouse[];
  isLoading?: boolean;
  onPressWarehouse?: (warehouse: Warehouse) => void;
};

/** Fila horizontal de logos 2:1, uno por tienda. */
export function LocationsSection({
  title = 'Nuestras ubicaciones',
  warehouses,
  isLoading = false,
  onPressWarehouse,
}: LocationsSectionProps) {
  const [muted] = useThemeColor(['muted']);

  if (!isLoading && warehouses.length === 0) return null;

  return (
    <View className="gap-3">
      <SectionHeader title={title} />

      {isLoading ? (
        <View className="flex-row gap-3 px-4">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton
              key={index}
              style={{ width: ITEM_WIDTH }}
              className="aspect-[2/1] rounded-2xl"
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={warehouses}
          keyExtractor={(warehouse) => warehouse.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          // Padding vertical para que la sombra de los logos no se corte.
          contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, paddingVertical: 4, gap: GAP }}
          renderItem={({ item }) => (
            <Pressable
              onPress={onPressWarehouse ? () => onPressWarehouse(item) : undefined}
              disabled={!onPressWarehouse}
              accessibilityRole={onPressWarehouse ? 'button' : 'image'}
              accessibilityLabel={item.address ? `${item.name}, ${item.address}` : item.name}
              style={{ width: ITEM_WIDTH }}
              className="aspect-[2/1] overflow-hidden rounded-2xl bg-surface p-3 shadow-surface">
              {/* TODO: confirmar qué imagen usa cada ubicación; por ahora `logoUrl` de la tienda. */}
              {item.logoUrl ? (
                <Image
                  source={item.logoUrl}
                  contentFit="contain"
                  transition={200}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <SymbolView
                    name={{ ios: 'photo', android: 'image', web: 'image' }}
                    size={22}
                    tintColor={muted}
                  />
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
