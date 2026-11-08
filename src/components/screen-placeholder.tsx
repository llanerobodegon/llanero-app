import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenPlaceholderProps = {
  title: string;
  description?: string;
};

/** Pantalla vacía temporal mientras se construye cada sección. */
export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {description ? (
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  description: {
    textAlign: 'center',
  },
});
