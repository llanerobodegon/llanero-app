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
 * Indicador de pasos del checkout: círculos numerados unidos por una línea. El actual y los
 * completados van en el color de acción; los completados muestran un check.
 */
export function CheckoutSteps({ steps, current }: CheckoutStepsProps) {
  const actionForeground = useActionForeground();

  return (
    <View
      className="flex-row items-center gap-2 px-4"
      accessible
      accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${steps[current]}`}>
      {steps.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        const isReached = isDone || isCurrent;
        return (
          <Fragment key={step}>
            <View className="flex-row items-center gap-2">
              <View
                className={`size-6 items-center justify-center rounded-full ${
                  isReached ? 'bg-action' : 'bg-default'
                }`}>
                {isDone ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={11}
                    weight="bold"
                    tintColor={actionForeground}
                  />
                ) : (
                  <Text
                    className={`text-xs font-bold ${
                      isReached ? 'text-action-foreground' : 'text-muted'
                    }`}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                className={`text-sm ${isCurrent ? 'font-semibold text-foreground' : 'text-muted'}`}>
                {step}
              </Text>
            </View>
            {index < steps.length - 1 ? (
              <View
                className={`h-0.5 flex-1 rounded-full ${isDone ? 'bg-action' : 'bg-default'}`}
              />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}
