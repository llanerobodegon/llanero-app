import { LinkButton } from 'heroui-native';
import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  /** Si se pasa, muestra "Ver todo" a la derecha. */
  onPressSeeAll?: () => void;
};

/** Título de sección del Inicio con enlace opcional "Ver todo". */
export function SectionHeader({ title, onPressSeeAll }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4">
      <Text className="text-xl font-semibold text-foreground" accessibilityRole="header">
        {title}
      </Text>
      {onPressSeeAll ? (
        <LinkButton onPress={onPressSeeAll} accessibilityLabel={`Ver todo: ${title}`}>
          <LinkButton.Label className="text-action">Ver todo</LinkButton.Label>
        </LinkButton>
      ) : null}
    </View>
  );
}
