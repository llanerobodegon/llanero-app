import { SymbolView } from 'expo-symbols';
import { useThemeColor } from 'heroui-native';
import { Text, View } from 'react-native';

import { getPasswordChecks, getPasswordStrength } from '@/lib/password';

/** Color de los segmentos llenos según el nivel (1 débil … 4 fuerte). */
const LEVEL_COLOR = {
  0: 'bg-default',
  1: 'bg-danger',
  2: 'bg-warning',
  3: 'bg-success',
  4: 'bg-success',
} as const;

const LEVEL_TEXT = {
  0: 'text-muted',
  1: 'text-danger',
  2: 'text-warning',
  3: 'text-success',
  4: 'text-success',
} as const;

/**
 * Indicador de la contraseña nueva: barra de 4 segmentos con su nivel (Débil, Regular, Buena,
 * Fuerte) y la lista de recomendaciones, que se marcan en verde al cumplirse.
 */
export function PasswordStrength({ password }: { password: string }) {
  const [muted, success] = useThemeColor(['muted', 'success']);
  const strength = getPasswordStrength(password);
  const checks = getPasswordChecks(password);

  return (
    <View className="gap-3 rounded-3xl bg-surface p-4">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">Seguridad</Text>
          {strength.score > 0 ? (
            <Text className={`text-sm font-semibold ${LEVEL_TEXT[strength.score]}`}>
              {strength.label}
            </Text>
          ) : (
            <Text className="text-sm text-muted">Escribe tu contraseña nueva</Text>
          )}
        </View>
        <View
          className="flex-row gap-1.5"
          accessible
          accessibilityLabel={
            strength.score > 0 ? `Seguridad: ${strength.label}` : 'Seguridad: sin contraseña'
          }>
          {[1, 2, 3, 4].map((level) => (
            <View
              key={level}
              className={`h-1.5 flex-1 rounded-full ${
                strength.score >= level ? LEVEL_COLOR[strength.score] : 'bg-default'
              }`}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        {checks.map((check) => (
          <View
            key={check.key}
            className="flex-row items-center gap-2"
            accessible
            accessibilityLabel={`${check.label}: ${check.met ? 'cumplido' : 'pendiente'}`}>
            <SymbolView
              name={
                check.met
                  ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
                  : {
                      ios: 'circle',
                      android: 'radio_button_unchecked',
                      web: 'radio_button_unchecked',
                    }
              }
              size={16}
              tintColor={check.met ? success : muted}
            />
            <Text className={`text-sm ${check.met ? 'text-foreground' : 'text-muted'}`}>
              {check.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
