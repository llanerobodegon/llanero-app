import { BottomSheet, RNHostView } from '@expo/ui';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

/** Margen lateral de la hoja; se fija igual en iOS y Android para calcular el ancho. */
const SHEET_PADDING = 16;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'] as const;
type Key = (typeof KEYS)[number];

type KeypadFieldProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
  /** Título y descripción de la hoja. */
  title: string;
  description?: string;
  accessibilityLabel: string;
};

/**
 * Campo numérico con teclado propio: se ve como los demás campos y al tocarlo abre una hoja
 * nativa con el número en grande arriba y un teclado de 0 a 9 (sin el teclado del sistema).
 */
export function KeypadField({
  value,
  onChange,
  maxLength,
  placeholder,
  title,
  description,
  accessibilityLabel,
}: KeypadFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [foreground, muted, background] = useThemeColor(['foreground', 'muted', 'background']);
  const actionForeground = useActionForeground();
  // La hoja nativa no le impone ancho al contenido de React Native (ver OptionsSheet).
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - SHEET_PADDING * 2;

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const press = (key: Key) => {
    if (key === 'delete') {
      if (!value) return;
      Haptics.selectionAsync();
      onChange(value.slice(0, -1));
    } else if (key === 'clear') {
      if (!value) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChange('');
    } else {
      if (value.length >= maxLength) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      Haptics.selectionAsync();
      onChange(value + key);
    }
  };

  return (
    <>
      {/* Disparador con las clases del campo de HeroUI, para verse igual que los demás */}
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}: ${value || 'vacío'}`}
        accessibilityHint="Abre el teclado numérico"
        className="select__trigger--variant-default">
        <Text
          numberOfLines={1}
          style={{ fontVariant: ['tabular-nums'] }}
          className={`select__value ${value ? 'select__value--is-selected' : 'select__value--is-selected-false'}`}>
          {value || placeholder}
        </Text>
        <SymbolView
          name={{ ios: 'circle.grid.3x3.fill', android: 'dialpad', web: 'dialpad' }}
          size={16}
          tintColor={muted}
        />
      </Pressable>

      <BottomSheet
        isPresented={isOpen}
        onDismiss={close}
        containerColor={background}
        contentPadding={{ top: SHEET_PADDING, left: SHEET_PADDING, right: SHEET_PADDING }}>
        <RNHostView matchContents={{ vertical: true }}>
          <View style={{ width: contentWidth }} className="gap-4 pb-4">
            <View className="gap-1 px-3">
              <Text className="text-lg font-semibold text-foreground" accessibilityRole="header">
                {title}
              </Text>
              {description ? <Text className="text-sm text-muted">{description}</Text> : null}
            </View>

            {/* El número en grande, con contador */}
            <View className="items-center gap-1 rounded-3xl bg-surface px-4 py-5">
              <Text
                className={`text-4xl font-bold tracking-[4px] ${
                  value ? 'text-foreground' : 'text-muted'
                }`}
                style={{ fontVariant: ['tabular-nums'] }}
                numberOfLines={1}
                adjustsFontSizeToFit
                accessibilityLiveRegion="polite"
                accessibilityLabel={value ? `Referencia ${value.split('').join(' ')}` : 'Vacío'}>
                {value || '—'}
              </Text>
              <Text className="text-xs text-muted">{`${value.length}/${maxLength}`}</Text>
            </View>

            {/* Teclado: 1-9, borrar todo, 0 y borrar */}
            <View className="flex-row flex-wrap justify-between gap-y-2">
              {KEYS.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => press(key)}
                  onLongPress={key === 'delete' ? () => press('clear') : undefined}
                  accessibilityRole="button"
                  accessibilityLabel={
                    key === 'delete' ? 'Borrar' : key === 'clear' ? 'Borrar todo' : key
                  }
                  style={{ width: (contentWidth - 16) / 3 }}
                  className="h-14 items-center justify-center rounded-2xl bg-surface active:opacity-50">
                  {key === 'delete' ? (
                    <SymbolView
                      name={{ ios: 'delete.left', android: 'backspace', web: 'backspace' }}
                      size={22}
                      tintColor={foreground}
                    />
                  ) : key === 'clear' ? (
                    <Text className="text-sm font-semibold text-muted">Borrar</Text>
                  ) : (
                    <Text className="text-2xl font-semibold text-foreground">{key}</Text>
                  )}
                </Pressable>
              ))}
            </View>

            <Button
              size="lg"
              // Sin capa de color al presionar sobre el color de acción.
              feedbackVariant="scale"
              onPress={close}
              className="rounded-full bg-action">
              <SymbolView
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                size={16}
                weight="semibold"
                tintColor={actionForeground}
              />
              <Button.Label className="text-action-foreground">Listo</Button.Label>
            </Button>
          </View>
        </RNHostView>
      </BottomSheet>
    </>
  );
}
