import { SearchField } from 'heroui-native';

import { ACTION_FOCUS, NO_SHADOW } from './form-input';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

/**
 * Buscador de la app: el `SearchField` de HeroUI en píldora, con lupa, ✕ para borrar y el foco
 * y cursor del color de acción (Buscar, subcategoría, hojas de opciones).
 */
export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <SearchField value={value} onChange={onChange} className="w-full">
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          placeholder={placeholder}
          className={`${NO_SHADOW} ${ACTION_FOCUS}`}
          selectionColorClassName="accent-action"
          autoCorrect={false}
          returnKeyType="search"
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
