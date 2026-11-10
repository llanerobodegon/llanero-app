import { Image, type ImageContentFit } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Skeleton, useThemeColor } from 'heroui-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { SectionHeader } from './section-header';

const SIDE_PADDING = 16;
const GAP = 12;
const SKELETON_COUNT = 3;

export type ImageRowItem = {
  id: string;
  imageUrl: string | null;
  /** Texto para lectores de pantalla y para el placeholder sin imagen. */
  label: string;
};

type ImageRowSectionProps<T extends ImageRowItem> = {
  title: string;
  items: T[];
  /** Ancho de cada imagen; el alto sale de `aspectRatio`. */
  itemWidth: number;
  /** Proporción ancho / alto de cada imagen (por defecto 2:1). */
  aspectRatio?: number;
  /** `cover` para banners, `contain` para logos. */
  contentFit?: ImageContentFit;
  /** Muestra `label` en el placeholder cuando no hay imagen. */
  showLabelInPlaceholder?: boolean;
  isLoading?: boolean;
  onPressItem?: (item: T) => void;
};

/** Sección del Inicio: título y fila horizontal de imágenes (banners, logos, ubicaciones). */
export function ImageRowSection<T extends ImageRowItem>({
  title,
  items,
  itemWidth,
  aspectRatio = 2,
  contentFit = 'cover',
  showLabelInPlaceholder = false,
  isLoading = false,
  onPressItem,
}: ImageRowSectionProps<T>) {
  const [muted] = useThemeColor(['muted']);
  const isContain = contentFit === 'contain';

  if (!isLoading && items.length === 0) return null;

  return (
    <View className="gap-3">
      <SectionHeader title={title} />

      {isLoading ? (
        <View className="flex-row gap-3 px-4">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton
              key={index}
              style={{ width: itemWidth, aspectRatio }}
              className="rounded-2xl"
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          // Padding vertical para que la sombra de las tarjetas no se corte.
          contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, paddingVertical: 4, gap: GAP }}
          renderItem={({ item }) => (
            <Pressable
              onPress={onPressItem ? () => onPressItem(item) : undefined}
              disabled={!onPressItem}
              accessibilityRole={onPressItem ? 'button' : 'image'}
              accessibilityLabel={item.label}
              style={{ width: itemWidth, aspectRatio }}
              className={`overflow-hidden rounded-2xl bg-surface ${isContain ? 'p-3' : ''}`}>
              {item.imageUrl ? (
                <Image
                  source={item.imageUrl}
                  contentFit={contentFit}
                  transition={200}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                // TODO: quitar el placeholder cuando los datos vengan de Supabase con imagen.
                <View className="flex-1 items-center justify-center gap-1 px-2">
                  <SymbolView
                    name={{ ios: 'photo', android: 'image', web: 'image' }}
                    size={22}
                    tintColor={muted}
                  />
                  {showLabelInPlaceholder ? (
                    <Text className="text-center text-xs text-muted" numberOfLines={1}>
                      {item.label}
                    </Text>
                  ) : null}
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
