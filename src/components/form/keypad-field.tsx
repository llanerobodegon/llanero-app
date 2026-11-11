import { BottomSheet, RNHostView } from '@expo/ui';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

import { NumberKeypad } from './number-keypad';

/** Margen lateral de la hoja; se fija igual en iOS y Android para calcular el ancho. */
const SHEET_PADDING = 16;

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
  const [muted, background] = useThemeColor(['muted', 'background']);
  const actionForeground = useActionForeground();
  // La hoja nativa no le impone ancho al contenido de React Native (ver OptionsSheet).
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = windowWidth - SHEET_PADDING * 2;

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

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

            <NumberKeypad
              value={value}
              onChange={onChange}
              maxLength={maxLength}
              width={contentWidth}
            />

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
