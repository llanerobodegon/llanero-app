import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { Separator, useThemeColor } from 'heroui-native';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

type Topic = {
  key: string;
  title: string;
  description: string;
  icon: { ios: SFSymbol; android: AndroidSymbol };
};

const TOPICS: Topic[] = [
  {
    key: 'orders',
    title: 'Estado de tus pedidos',
    description: 'Cuando verifiquemos tu pago, tu pedido salga y llegue.',
    icon: { ios: 'shippingbox', android: 'local_shipping' },
  },
  {
    key: 'promotions',
    title: 'Promociones',
    description: 'Descuentos y ofertas de tu bodegón.',
    icon: { ios: 'tag', android: 'sell' },
  },
  {
    key: 'news',
    title: 'Novedades',
    description: 'Productos nuevos y mejoras de la app.',
    icon: { ios: 'sparkles', android: 'auto_awesome' },
  },
];

/** Tarjeta con los tipos de notificaciones que recibe el cliente; atenuada si están apagadas. */
export function NotificationTopics({ isEnabled }: { isEnabled: boolean }) {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="gap-2">
      <Text className="pl-1 text-sm font-semibold text-muted" accessibilityRole="header">
        Te avisaremos sobre
      </Text>
      <View className={`rounded-3xl bg-surface ${isEnabled ? '' : 'opacity-50'}`}>
        {TOPICS.map((topic, index) => (
          <Fragment key={topic.key}>
            <View className="flex-row items-center gap-3 p-4">
              <View className="size-9 items-center justify-center rounded-full bg-default">
                <SymbolView
                  name={{
                    ios: topic.icon.ios,
                    android: topic.icon.android,
                    web: topic.icon.android,
                  }}
                  size={17}
                  tintColor={foreground}
                />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-foreground">{topic.title}</Text>
                <Text className="text-xs text-muted">{topic.description}</Text>
              </View>
            </View>
            {index < TOPICS.length - 1 ? <Separator className="ml-16 mr-4" /> : null}
          </Fragment>
        ))}
      </View>
      {!isEnabled ? (
        <Text className="pl-1 text-xs text-muted">
          Activa las notificaciones para recibir estos avisos.
        </Text>
      ) : null}
    </View>
  );
}
