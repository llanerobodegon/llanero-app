import { Text, View } from 'react-native';

type CartBadgeProps = {
  count: number;
};

/** Contador sobre el ícono del carrito, en el color de acción. HeroUI Native no trae Badge. */
export function CartBadge({ count }: CartBadgeProps) {
  if (count <= 0) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-action px-1">
      <Text className="text-[11px] font-bold text-action-foreground">
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}
