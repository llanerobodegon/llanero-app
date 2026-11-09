import { SymbolView } from 'expo-symbols';
import { PressableFeedback, Skeleton, useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

type AccountSummaryCardProps = {
  fullName: string;
  /** Correo ya enmascarado ("mari***@gmail.com"). */
  email: string;
  initials: string;
  isLoading?: boolean;
  onPress?: () => void;
};

/** Resumen del usuario: avatar con iniciales, nombre y correo. Lleva a la información personal. */
export function AccountSummaryCard({
  fullName,
  email,
  initials,
  isLoading = false,
  onPress,
}: AccountSummaryCardProps) {
  const [muted] = useThemeColor(['muted']);

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-3xl" />;
  }

  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${fullName}, ${email}`}
      accessibilityHint="Abre tu información personal"
      className="flex-row items-center gap-4 rounded-3xl bg-surface p-4">
      <View className="size-14 items-center justify-center rounded-full bg-accent">
        <Text className="text-lg font-bold text-accent-foreground">{initials}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
          {fullName}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {email}
        </Text>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={14}
        weight="semibold"
        tintColor={muted}
      />
    </PressableFeedback>
  );
}
