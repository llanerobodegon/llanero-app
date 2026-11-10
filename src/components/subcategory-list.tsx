import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { PressableFeedback, Separator, useThemeColor } from 'heroui-native';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

import type { Subcategory } from '@/models/warehouse.model';

type SubcategoryListProps = {
  subcategories: Subcategory[];
  onPress: (subcategory: Subcategory) => void;
};

/** Subcategorías en una tarjeta con separadores: imagen, nombre y chevron. */
export function SubcategoryList({ subcategories, onPress }: SubcategoryListProps) {
  const [muted] = useThemeColor(['muted']);

  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {subcategories.map((subcategory, index) => (
        <Fragment key={subcategory.id}>
          <PressableFeedback
            animation={false}
            onPress={() => onPress(subcategory)}
            accessibilityRole="button"
            accessibilityLabel={subcategory.name}
            className="flex-row items-center gap-3 px-4 py-3">
            <PressableFeedback.Highlight />
            <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-default">
              {subcategory.imageUrl ? (
                <Image
                  source={subcategory.imageUrl}
                  contentFit="cover"
                  transition={150}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                // TODO: quitar el placeholder cuando las subcategorías vengan con imagen.
                <SymbolView
                  name={{ ios: 'photo', android: 'image', web: 'image' }}
                  size={18}
                  tintColor={muted}
                />
              )}
            </View>
            <Text className="flex-1 text-base font-medium text-foreground" numberOfLines={1}>
              {subcategory.name}
            </Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
              weight="semibold"
              tintColor={muted}
            />
          </PressableFeedback>
          {index < subcategories.length - 1 ? <Separator className="ml-[76px] mr-4" /> : null}
        </Fragment>
      ))}
    </View>
  );
}
