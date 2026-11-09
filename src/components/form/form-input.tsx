import { Input, type InputProps, useTextField } from 'heroui-native';

/** Sin la sombra (elevation) que HeroUI pone a los campos en Android; en iOS la quita el tema. */
export const NO_SHADOW = 'android:[elevation:0]';

/**
 * Borde de foco con el color de acción (vino en claro, naranja en oscuro) en vez del naranja
 * de HeroUI. iOS usa `outline` y Android `border`, igual que el Input original.
 */
export const ACTION_FOCUS = 'ios:focus:outline-action android:focus:border-action';

/**
 * Campo de texto de la app: el `Input` de HeroUI sin sombra y con el foco, el cursor y la
 * selección del color de acción.
 * Si el campo es inválido (prop o `TextField isInvalid`), conserva el rojo también con foco.
 */
export function FormInput({ className, isInvalid: localIsInvalid, ...props }: InputProps) {
  const textField = useTextField();
  const isInvalid = localIsInvalid ?? textField?.isInvalid ?? false;

  return (
    <Input
      {...props}
      isInvalid={localIsInvalid}
      // Cursor y selección del color de acción (rojo si el campo tiene error).
      selectionColorClassName={isInvalid ? 'accent-danger' : 'accent-action'}
      className={[NO_SHADOW, isInvalid ? '' : ACTION_FOCUS, className].filter(Boolean).join(' ')}
    />
  );
}
