import { SymbolView } from 'expo-symbols';
import { Select, useThemeColor } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { OptionsSheet } from '@/components/options-sheet';

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
  /**
   * `popover` (por defecto): lista flotante bajo el campo, para pocas opciones.
   * `sheet`: hoja nativa con título y scroll (diseño de "Elige tu tienda"), para listas
   * largas como los bancos.
   */
  presentation?: 'popover' | 'sheet';
  /** Título y descripción de la hoja (solo con `presentation="sheet"`). */
  sheetTitle?: string;
  sheetDescription?: string;
  /** Muestra un buscador en la hoja con este placeholder (solo con `presentation="sheet"`). */
  sheetSearchPlaceholder?: string;
  isDisabled?: boolean;
};

/**
 * Desplegable de la app: se ve como un campo más y marca la opción elegida con un check
 * blanco sobre círculo del color de acción.
 */
export function SelectField({
  value,
  options,
  onChange,
  placeholder = 'Selecciona',
  accessibilityLabel,
  width,
  presentation = 'popover',
  sheetTitle,
  sheetDescription,
  sheetSearchPlaceholder,
  isDisabled = false,
}: SelectFieldProps) {
  const actionForeground = useActionForeground();

  if (presentation === 'sheet') {
    return (
      <SheetSelectField
        value={value}
        options={options}
        onChange={onChange}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
        title={sheetTitle ?? accessibilityLabel}
        description={sheetDescription}
        searchPlaceholder={sheetSearchPlaceholder}
        isDisabled={isDisabled}
      />
    );
  }

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

type SheetSelectFieldProps = {
  value: string | null;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  title: string;
  description?: string;
  searchPlaceholder?: string;
  isDisabled: boolean;
};

/**
 * Variante con hoja nativa: mismo disparador que el `Select` de HeroUI (sus clases de campo)
 * y la lista en `OptionsSheet`.
 */
function SheetSelectField({
  value,
  options,
  onChange,
  placeholder,
  accessibilityLabel,
  title,
  description,
  searchPlaceholder,
  isDisabled,
}: SheetSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [muted] = useThemeColor(['muted']);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}: ${value ?? placeholder}`}
        className={`select__trigger--variant-default ${isDisabled ? 'opacity-50' : ''}`}>
        <Text
          numberOfLines={1}
          className={`select__value ${value ? 'select__value--is-selected' : 'select__value--is-selected-false'}`}>
          {value ?? placeholder}
        </Text>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          size={14}
          tintColor={muted}
        />
      </Pressable>

      <OptionsSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        options={options}
        keyExtractor={(option) => option}
        isSelected={(option) => option === value}
        onSelect={(option) => {
          onChange(option);
          setIsOpen(false);
        }}
        getAccessibilityLabel={(option) => option}
        renderOption={(option) => (
          <Text className="text-base font-medium text-foreground" numberOfLines={1}>
            {option}
          </Text>
        )}
        isScrollable={options.length > 8}
        searchPlaceholder={searchPlaceholder}
      />
    </>
  );
}
