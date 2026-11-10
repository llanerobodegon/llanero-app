import { SymbolView } from 'expo-symbols';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

type CheckoutStepsProps = {
  steps: readonly string[];
  /** Índice del paso actual (0 = primero). */
  current: number;
};

/**
 * Indicador de pasos del checkout: solo los números (unidos por una línea) y, debajo, el
 * nombre del paso actual en grande. El actual y los completados van en el color de acción; los
 * completados muestran un check.
 */
export function CheckoutSteps({ steps, current }: CheckoutStepsProps) {
  const actionForeground = useActionForeground();

  return (
    <View className="gap-3 px-4">
      <View
        className="w-full flex-row items-center"
        accessible
        accessibilityLabel={`Paso ${current + 1} de ${steps.length}`}>
        {steps.map((step, index) => {
          const isDone = index < current;
          const isReached = index <= current;
          return (
            <Fragment key={step}>
              <View
                className={`size-7 items-center justify-center rounded-full ${
                  isReached ? 'bg-action' : 'bg-default'
                }`}>
                {isDone ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={12}
                    weight="bold"
                    tintColor={actionForeground}
                  />
                ) : (
                  <Text
                    className={`text-sm font-bold ${
                      isReached ? 'text-action-foreground' : 'text-muted'
                    }`}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 ? (
                // flex-1: las líneas se reparten el ancho y el indicador ocupa el 100%.
                <View
                  className={`mx-2 h-0.5 flex-1 rounded-full ${isDone ? 'bg-action' : 'bg-default'}`}
                />
              ) : null}
            </Fragment>
          );
        })}
      </View>

      <Text className="pl-0.5 text-2xl font-bold text-foreground" accessibilityRole="header">
        {steps[current]}
      </Text>
    </View>
  );
}
