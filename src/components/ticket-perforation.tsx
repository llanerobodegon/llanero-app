import { View } from 'react-native';

const DASH_COUNT = 28;
const NOTCH_SIZE = 20;

type TicketPerforationProps = {
  /** Color del fondo detrás del ticket: las muescas lo "muerden" con ese color. */
  notchColor: string;
  /** Margen interno horizontal del ticket, para colocar las muescas en el borde. */
  inset: number;
};

/**
 * Línea perforada del ticket con una muesca semicircular a cada lado.
 * Los guiones son vistas: en iOS `borderStyle: 'dashed'` no funciona en un solo lado.
 */
export function TicketPerforation({ notchColor, inset }: TicketPerforationProps) {
  const notchStyle = {
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    top: -NOTCH_SIZE / 2,
    backgroundColor: notchColor,
  };

  return (
    <View style={{ marginHorizontal: inset }} className="relative justify-center">
      <View className="flex-row gap-1.5">
        {Array.from({ length: DASH_COUNT }, (_, index) => (
          <View key={index} className="h-0.5 flex-1 rounded-full bg-border" />
        ))}
      </View>
      <View
        style={[notchStyle, { left: -inset - NOTCH_SIZE / 2 }]}
        className="absolute rounded-full"
      />
      <View
        style={[notchStyle, { right: -inset - NOTCH_SIZE / 2 }]}
        className="absolute rounded-full"
      />
    </View>
  );
}
