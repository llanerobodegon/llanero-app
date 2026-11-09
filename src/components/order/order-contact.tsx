import { SymbolView } from 'expo-symbols';
import { Button, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

/** Verde de marca de WhatsApp. */
const WHATSAPP_GREEN = '#25D366';

type OrderContactProps = {
  name: string;
  subtitle: string;
  /** Iniciales para una persona; sin ellas se muestra el ícono de tienda. */
  initials?: string;
  /** Si no se pasa (no hay teléfono válido), no se muestra el botón de WhatsApp. */
  onPressWhatsApp?: () => void;
};

/** Contacto del pedido (repartidor o tienda): avatar, nombre y botón de WhatsApp. */
export function OrderContact({ name, subtitle, initials, onPressWhatsApp }: OrderContactProps) {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="flex-row items-center gap-3">
      {initials ? (
        <View className="size-12 items-center justify-center rounded-full bg-accent">
          <Text className="text-base font-bold text-accent-foreground">{initials}</Text>
        </View>
      ) : (
        <View className="size-12 items-center justify-center rounded-full bg-default">
          <SymbolView
            name={{ ios: 'storefront', android: 'storefront', web: 'storefront' }}
            size={20}
            tintColor={foreground}
          />
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-muted">{subtitle}</Text>
      </View>
      {onPressWhatsApp ? (
        <Button
          isIconOnly
          feedbackVariant="scale"
          onPress={onPressWhatsApp}
          accessibilityLabel={`Escribir a ${name} por WhatsApp`}
          style={{ backgroundColor: WHATSAPP_GREEN }}
          className="size-11 rounded-full">
          <WhatsAppIcon size={22} />
        </Button>
      ) : null}
    </View>
  );
}
