import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useThemeColor } from 'heroui-native';
import { Pressable, Text, View } from 'react-native';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'] as const;
type Key = (typeof KEYS)[number];

type NumberKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  /** Ancho disponible: las hojas nativas no le imponen ancho al contenido de React Native. */
  width: number;
  isDisabled?: boolean;
};

/**
 * Teclado numérico propio (1-9, borrar todo, 0 y borrar), para escribir números en una hoja
 * sin el teclado del sistema. Lo usan la referencia del pago y el código de entrega.
 */
export function NumberKeypad({
  value,
  onChange,
  maxLength,
  width,
  isDisabled = false,
}: NumberKeypadProps) {
  const [foreground] = useThemeColor(['foreground']);

  const press = (key: Key) => {
    if (isDisabled) return;
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
    <View
      className={`flex-row flex-wrap justify-between gap-y-2 ${isDisabled ? 'opacity-50' : ''}`}>
      {KEYS.map((key) => (
        <Pressable
          key={key}
          onPress={() => press(key)}
          onLongPress={key === 'delete' ? () => press('clear') : undefined}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={key === 'delete' ? 'Borrar' : key === 'clear' ? 'Borrar todo' : key}
          style={{ width: (width - 16) / 3 }}
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
  );
}
