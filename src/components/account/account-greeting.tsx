import { Skeleton } from 'heroui-native';
import { Text, View } from 'react-native';

type AccountGreetingProps = {
  firstName: string;
  /** Correo ya enmascarado ("mari***@gmail.com"). */
  email: string;
  initials: string;
  isLoading?: boolean;
};

/** Saludo de la cuenta (sin tarjeta): avatar con iniciales, "¡Hola, nombre!" y el correo. */
export function AccountGreeting({
  firstName,
  email,
  initials,
  isLoading = false,
}: AccountGreetingProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center gap-4 px-1">
        <Skeleton className="size-16 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-7 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </View>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`Hola, ${firstName}. ${email}`}
      className="flex-row items-center gap-4 px-1">
      <View className="size-16 items-center justify-center rounded-full bg-accent">
        <Text className="text-xl font-bold text-accent-foreground">{initials}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-2xl font-bold text-foreground" numberOfLines={1}>
          {`¡Hola, ${firstName}!`}
        </Text>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {email}
        </Text>
      </View>
    </View>
  );
}
