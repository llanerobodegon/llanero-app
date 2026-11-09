import { Select, useThemeColor } from 'heroui-native';

type PrefixSelectProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Lectores de pantalla: "Código de operadora", "Tipo de documento"… */
  accessibilityLabel: string;
  /** Ancho fijo del disparador, para alinearse con el campo de al lado. */
  width: number;
  isDisabled?: boolean;
};

/**
 * Desplegable compacto que va delante de un campo de texto (operadora del teléfono,
 * tipo de cédula). Se ve como un campo más y abre una lista flotante.
 */
export function PrefixSelect({
  value,
  options,
  onChange,
  accessibilityLabel,
  width,
  isDisabled = false,
}: PrefixSelectProps) {
  const [background] = useThemeColor(['background']);

  return (
    <Select
      value={{ value, label: value }}
      onValueChange={(option) => option && onChange(option.value)}
      isDisabled={isDisabled}>
      <Select.Trigger style={{ width }} accessibilityLabel={`${accessibilityLabel}: ${value}`}>
        <Select.Value placeholder={value} />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width={Math.max(width, 120)} placement="bottom">
          {options.map((option) => (
            <Select.Item key={option} value={option} label={option}>
              <Select.ItemLabel />
              {/* Check blanco sobre círculo negro (el `foreground` de la marca) */}
              <Select.ItemIndicator
                className="size-5 items-center justify-center rounded-full bg-foreground"
                iconProps={{ size: 11, color: background }}
              />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
