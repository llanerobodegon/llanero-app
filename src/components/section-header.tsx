import { Text, View } from 'react-native';

/** Título de sección del Inicio. */
export function SectionHeader({ title }: { title: string }) {
  return (
    <View className="px-4">
      <Text className="text-xl font-semibold text-foreground" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}
