import { useCSSVariable } from 'uniwind';

/**
 * Color del contenido (íconos, spinner) de los botones de acción `bg-action`.
 * `useThemeColor` de HeroUI solo conoce sus propios colores, por eso se lee la variable directo.
 */
export function useActionForeground(): string {
  const color = useCSSVariable('--color-action-foreground');
  return typeof color === 'string' ? color : '#ffffff';
}
