import { SymbolView } from 'expo-symbols';
import { type InputProps, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { FormInput } from './form-input';

/** Espacio a la derecha del texto para que no quede debajo del ojito. */
const EYE_SPACE = 48;

/**
 * Campo de contraseña: `FormInput` oculto por defecto, con un ojito a la derecha para
 * mostrar u ocultar lo escrito.
 */
export function PasswordInput({ style, ...props }: Omit<InputProps, 'secureTextEntry'>) {
  const [isVisible, setIsVisible] = useState(false);
  const [muted] = useThemeColor(['muted']);

  return (
    <View className="justify-center">
      <FormInput
        {...props}
        secureTextEntry={!isVisible}
        autoCapitalize="none"
        autoCorrect={false}
        style={[{ paddingRight: EYE_SPACE }, style]}
      />
      <Pressable
        onPress={() => setIsVisible((value) => !value)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-4 size-6 items-center justify-center">
        <SymbolView
          name={
            isVisible
              ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
              : { ios: 'eye', android: 'visibility', web: 'visibility' }
          }
          size={18}
          tintColor={muted}
        />
      </Pressable>
    </View>
  );
}
