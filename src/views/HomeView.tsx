import { StyleSheet, View } from 'react-native';

import { HomeTopBar } from '@/components/home-top-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

export function HomeView() {
  return (
    <ThemedView style={styles.container}>
      {/* TODO: abrir el carrito cuando exista su pantalla */}
      <HomeTopBar onPressCart={() => {}} />

      <View style={styles.content}>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Categorías, promociones y productos destacados.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  description: {
    textAlign: 'center',
  },
});
