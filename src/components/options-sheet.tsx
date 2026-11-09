import { BottomSheet, Column, RNHostView, ScrollView as NativeScrollView } from '@expo/ui';
import { SymbolView } from 'expo-symbols';
import { SearchField, Separator, useThemeColor } from 'heroui-native';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ACTION_FOCUS, NO_SHADOW } from '@/components/form/form-input';
import { useActionForeground } from '@/hooks/use-action-foreground';

/** Minúsculas y sin acentos, para buscar "credito" y encontrar "Crédito". */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

type OptionsSheetProps<T> = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  options: readonly T[];
  keyExtractor: (option: T) => string;
  isSelected: (option: T) => boolean;
  onSelect: (option: T) => void;
  /** Contenido de cada fila (a la izquierda del check). */
  renderOption: (option: T) => ReactNode;
  /** Etiqueta para lectores de pantalla de cada opción. */
  getAccessibilityLabel: (option: T) => string;
  /**
   * `true` para listas largas (bancos): la hoja abre a media pantalla, se puede subir y la
   * lista tiene scroll. Sin él, la hoja se ajusta al contenido (pocas opciones).
   */
  isScrollable?: boolean;
  /** Si se pasa, muestra un buscador con este placeholder que filtra las opciones. */
  searchPlaceholder?: string;
  /** Texto por el que se busca cada opción (por defecto, la etiqueta de accesibilidad). */
  getSearchText?: (option: T) => string;
};

/**
 * Hoja nativa (`@expo/ui`) para elegir una opción, con el diseño de "Elige tu tienda":
 * fondo gris sutil, título y descripción, opciones en una tarjeta blanca con separadores y
 * check blanco en círculo del color de acción en la elegida.
 */
export function OptionsSheet<T>({
  isOpen,
  onClose,
  title,
  description,
  options,
  keyExtractor,
  isSelected,
  onSelect,
  renderOption,
  getAccessibilityLabel,
  isScrollable = false,
  searchPlaceholder,
  getSearchText,
}: OptionsSheetProps<T>) {
  const [background] = useThemeColor(['background']);
  const actionForeground = useActionForeground();
  const [query, setQuery] = useState('');

  const visibleOptions = useMemo(() => {
    const q = normalize(query);
    if (!q) return options;
    const toText = getSearchText ?? getAccessibilityLabel;
    return options.filter((option) => normalize(toText(option)).includes(q));
  }, [getAccessibilityLabel, getSearchText, options, query]);

  // Al cerrar se limpia la búsqueda, para que la próxima vez aparezca la lista completa.
  const close = () => {
    setQuery('');
    onClose();
  };
  const select = (option: T) => {
    setQuery('');
    onSelect(option);
  };

  const header = (
    <View className="gap-3">
      <View className="gap-1 px-3">
        <Text className="text-lg font-semibold text-foreground" accessibilityRole="header">
          {title}
        </Text>
        {description ? <Text className="text-sm text-muted">{description}</Text> : null}
      </View>
      {/* Buscador a todo el ancho (como la tarjeta de opciones) y en forma de píldora */}
      {searchPlaceholder ? (
        <SearchField value={query} onChange={setQuery} className="w-full">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              placeholder={searchPlaceholder}
              className={`rounded-full ${NO_SHADOW} ${ACTION_FOCUS}`}
              selectionColorClassName="accent-action"
              autoCorrect={false}
              returnKeyType="search"
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      ) : null}
    </View>
  );

  const list = (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {visibleOptions.length === 0 ? (
        <Text className="px-4 py-6 text-center text-sm text-muted">
          {`Sin resultados para "${query.trim()}"`}
        </Text>
      ) : null}
      {visibleOptions.map((option, index) => {
        const selected = isSelected(option);
        return (
          <Fragment key={keyExtractor(option)}>
            <Pressable
              onPress={() => select(option)}
              accessibilityRole="button"
              accessibilityLabel={getAccessibilityLabel(option)}
              accessibilityState={{ selected }}
              className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-60">
              <View className="flex-1 gap-0.5">{renderOption(option)}</View>
              {selected ? (
                // Check blanco dentro de un círculo del color de acción.
                <View className="size-6 items-center justify-center rounded-full bg-action">
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={12}
                    weight="bold"
                    tintColor={actionForeground}
                  />
                </View>
              ) : null}
            </Pressable>
            {index < visibleOptions.length - 1 ? <Separator className="mx-4" /> : null}
          </Fragment>
        );
      })}
    </View>
  );

  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={close}
      containerColor={background}
      snapPoints={isScrollable ? ['half', 'full'] : undefined}>
      {isScrollable ? (
        // Scroll NATIVO (SwiftUI / Compose): la hoja lo reconoce y coordina el arrastre con el
        // scroll. Un ScrollView de React Native aquí compite con el gesto de la hoja.
        <Column spacing={12}>
          <RNHostView matchContents={{ vertical: true }}>{header}</RNHostView>
          <NativeScrollView showsIndicators={false}>
            <RNHostView matchContents={{ vertical: true }}>
              <View className="pb-8">{list}</View>
            </RNHostView>
          </NativeScrollView>
        </Column>
      ) : (
        // Sin snapPoints la hoja se ajusta al contenido.
        <RNHostView matchContents={{ vertical: true }}>
          <View className="gap-3 pb-4">
            {header}
            {list}
          </View>
        </RNHostView>
      )}
    </BottomSheet>
  );
}
