import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Button, CloseButton, Skeleton, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PromoNotice } from '@/components/product/promo-notice';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import { formatUSD } from '@/lib/format';
import { useProductDetailViewModel } from '@/viewmodels/useProductDetailViewModel';

/** Descripciones más largas que esto se cortan con "Leer más". */
const DESCRIPTION_PREVIEW_LENGTH = 160;

/** Detalle de producto, presentado como modal sobre las pestañas. */
export function ProductDetailView({ productId }: { productId: string }) {
  const vm = useProductDetailViewModel(productId);
  const insets = useSafeAreaInsets();
  const [foreground, background, muted, danger] = useThemeColor([
    'foreground',
    'background',
    'muted',
    'danger',
  ]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // En iOS el modal es una hoja que no llega al borde superior; en Android ocupa la pantalla.
  const headerTop = Platform.OS === 'ios' ? 16 : insets.top + 8;
  const product = vm.product;
  const description = product?.description ?? null;
  const isLongDescription = (description?.length ?? 0) > DESCRIPTION_PREVIEW_LENGTH;

  return (
    <View className="flex-1 bg-background">
      {/* Encabezado: título a la izquierda y cerrar a la derecha (igual que el carrito) */}
      <View style={{ paddingTop: headerTop }} className="flex-row items-center gap-3 px-4 pb-2">
        <Text
          className="flex-1 pl-1 text-lg font-semibold text-foreground"
          accessibilityRole="header">
          Detalle del producto
        </Text>
        <CloseButton
          onPress={vm.close}
          accessibilityLabel="Cerrar detalle"
          className="size-11 rounded-full bg-surface shadow-surface"
        />
      </View>

      {vm.isLoading ? (
        <View className="gap-4 px-4 pt-4">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-1/3 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </View>
      ) : !product ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text className="text-center text-base font-semibold text-foreground">
            {vm.error ?? 'Producto no disponible'}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Imagen con el selector de cantidad montado sobre su borde inferior */}
            <View className="items-center">
              <View className="h-64 w-full items-center justify-center px-12">
                {product.imageUrls[0] ? (
                  <Image
                    source={product.imageUrls[0]}
                    contentFit="contain"
                    transition={200}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  // TODO: quitar el placeholder cuando los productos vengan con imagen.
                  <View className="size-48 items-center justify-center rounded-3xl bg-default">
                    <SymbolView
                      name={{ ios: 'photo', android: 'image', web: 'image' }}
                      size={40}
                      tintColor={muted}
                    />
                  </View>
                )}
              </View>
              <View className="-mt-2">
                <QuantityStepper
                  quantity={vm.quantity}
                  canDecrement={vm.canDecrement}
                  canIncrement={vm.canIncrement}
                  onDecrement={vm.decrement}
                  onIncrement={vm.increment}
                />
              </View>
            </View>

            <View className="gap-4 px-4 pt-6">
              {/* Nombre y favorito */}
              <View className="flex-row items-start gap-3">
                <Text className="flex-1 text-2xl font-semibold text-foreground">
                  {product.name}
                </Text>
                {/* TODO: favoritos reales (placeholder) */}
                <Button
                  isIconOnly
                  variant="tertiary"
                  onPress={vm.toggleFavorite}
                  accessibilityLabel={vm.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  accessibilityState={{ selected: vm.isFavorite }}
                  className="size-11 rounded-full bg-surface shadow-surface">
                  <SymbolView
                    name={
                      vm.isFavorite
                        ? { ios: 'heart.fill', android: 'favorite', web: 'favorite' }
                        : { ios: 'heart', android: 'favorite_border', web: 'favorite_border' }
                    }
                    size={20}
                    tintColor={vm.isFavorite ? danger : foreground}
                  />
                </Button>
              </View>

              {/* TODO: delivery rápido real (placeholder) */}
              {vm.isFastDelivery ? (
                <View className="-mt-2 flex-row items-center gap-1.5">
                  <View className="size-5 items-center justify-center rounded-full bg-success">
                    <SymbolView
                      name={{ ios: 'bolt.fill', android: 'bolt', web: 'bolt' }}
                      size={11}
                      tintColor="#ffffff"
                    />
                  </View>
                  <Text className="text-sm text-muted">Disponible en delivery rápido</Text>
                </View>
              ) : null}

              {/* Precio, descuento y calificación */}
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl font-bold text-foreground">
                    {formatUSD(vm.unitPrice)}
                  </Text>
                  {vm.originalPrice !== null ? (
                    <Text className="text-base text-muted line-through">
                      {formatUSD(vm.originalPrice)}
                    </Text>
                  ) : null}
                  {vm.discountPercent !== null ? (
                    <View className="rounded-full bg-foreground px-2 py-0.5">
                      <Text className="text-xs font-bold text-background">
                        {`${vm.discountPercent}%`}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {/* TODO: calificación real (placeholder) */}
                <View className="flex-row items-center gap-1.5">
                  <SymbolView
                    name={{ ios: 'star.fill', android: 'star', web: 'star' }}
                    size={18}
                    tintColor="#F5B400"
                  />
                  <Text className="text-base text-foreground">{`${vm.rating} Calificación`}</Text>
                </View>
              </View>

              {vm.showPromoNotice ? <PromoNotice /> : null}

              {description ? (
                <View className="gap-2">
                  <Text className="text-lg font-semibold text-foreground">Descripción</Text>
                  <Text className="text-base leading-6 text-muted">
                    {isLongDescription && !isDescriptionExpanded
                      ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}… `
                      : `${description} `}
                    {isLongDescription ? (
                      <Text
                        className="font-semibold text-foreground"
                        onPress={() => setIsDescriptionExpanded((value) => !value)}
                        accessibilityRole="button">
                        {isDescriptionExpanded ? 'Leer menos' : 'Leer más'}
                      </Text>
                    ) : null}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Agregar al carrito, fijo abajo */}
          <View
            style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
            className="px-4 pt-3">
            <Button
              size="lg"
              // Sin capa de color al presionar: en `primary` sería naranja sobre el botón negro.
              feedbackVariant="scale"
              onPress={vm.addToCart}
              className="rounded-full bg-foreground">
              <SymbolView
                name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
                size={20}
                tintColor={background}
              />
              <Button.Label className="text-background">
                {`Agregar al carrito · ${formatUSD(vm.totalPrice)}`}
              </Button.Label>
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
