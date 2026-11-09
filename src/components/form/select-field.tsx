import { Select } from 'heroui-native';

import { useActionForeground } from '@/hooks/use-action-foreground';

type SelectFieldProps = {
  /** Opción elegida; `null` muestra el `placeholder`. */
  value: string | null;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Lectores de pantalla: "Código de operadora", "Ciudad"… */
  accessibilityLabel: string;
  /**
   * Ancho fijo del disparador (desplegable delante de un campo, como la operadora del
   * teléfono). Sin él, ocupa todo el ancho y la lista mide lo mismo que el campo.
   */
  width?: number;
  isDisabled?: boolean;
};

/**
 * Desplegable de la app: se ve como un campo más, abre una lista flotante y marca la opción
 * elegida con un check blanco sobre círculo del color de acción.
 */
export function SelectField({
  value,
  options,
  onChange,
  placeholder = 'Selecciona',
  accessibilityLabel,
  width,
  isDisabled = false,
}: SelectFieldProps) {
  const actionForeground = useActionForeground();

  return (
    <Select
      value={value ? { value, label: value } : undefined}
      onValueChange={(option) => option && onChange(option.value)}
      isDisabled={isDisabled}>
      <Select.Trigger
        style={width ? { width } : undefined}
        accessibilityLabel={`${accessibilityLabel}: ${value ?? placeholder}`}>
        <Select.Value placeholder={placeholder} />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content
          presentation="popover"
          width={width ? Math.max(width, 120) : 'trigger'}
          placement="bottom">
          {options.map((option) => (
            <Select.Item key={option} value={option} label={option}>
              <Select.ItemLabel />
              {/* Check blanco sobre círculo del color de acción (vino en claro, naranja en oscuro) */}
              <Select.ItemIndicator
                className="size-5 items-center justify-center rounded-full bg-action"
                iconProps={{ size: 11, color: actionForeground }}
              />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
