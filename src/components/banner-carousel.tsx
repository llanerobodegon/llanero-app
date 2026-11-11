import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Skeleton, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import {
  FlatList,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { Slider } from '@/models/slider.model';

const SIDE_PADDING = 16;
const GAP = 12;

type BannerCarouselProps = {
  slides: Slider[];
  isLoading?: boolean;
};

/** Carrusel de banners cuadrados con paginación por puntos. */
export function BannerCarousel({ slides, isLoading = false }: BannerCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted] = useThemeColor(['muted']);

  const slideWidth = screenWidth - SIDE_PADDING * 2;
  const interval = slideWidth + GAP;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / interval);
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    if (clamped !== activeIndex) setActiveIndex(clamped);
  };

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: SIDE_PADDING }}>
        <Skeleton className="aspect-square w-full rounded-4xl" />
      </View>
    );
  }

  if (slides.length === 0) return null;

  return (
    <View className="gap-4">
      <FlatList
        data={slides}
        keyExtractor={(slide) => slide.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, gap: GAP }}
        renderItem={({ item, index }) => (
          <View
            style={{ width: slideWidth }}
            className="aspect-square overflow-hidden rounded-4xl bg-surface"
            accessibilityRole="image"
            accessibilityLabel={`${item.name}, ${index + 1} de ${slides.length}`}>
            {item.imageUrl ? (
              <Image
                source={item.imageUrl}
                contentFit="cover"
                transition={200}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              // TODO: quitar el placeholder cuando los sliders vengan de Supabase con imagen.
              <View className="flex-1 items-center justify-center gap-2">
                <SymbolView
                  name={{ ios: 'photo', android: 'image', web: 'image' }}
                  size={32}
                  tintColor={muted}
                />
                <Text className="text-sm text-muted">{item.name}</Text>
              </View>
            )}
          </View>
        )}
      />

      {slides.length > 1 ? (
        <View className="flex-row items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              className={
                index === activeIndex
                  ? 'h-2 w-6 rounded-full bg-accent-secondary'
                  : 'size-2 rounded-full bg-muted/30'
              }
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
