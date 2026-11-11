import { useCSSVariable } from 'uniwind';

/**
 * Color del contenido (íconos, spinner) de los botones de acción `bg-action`.
 * `useThemeColor` de HeroUI solo conoce sus propios colores, por eso se lee la variable directo.
 */
export function useActionForeground(): string {
  const color = useCSSVariable('--color-action-foreground');
  return typeof color === 'string' ? color : '#ffffff';
}

/** Color de acción (vino en claro, naranja en oscuro) para props que piden un color, no una clase. */
export function useActionColor(): string {
  const color = useCSSVariable('--color-action');
  return typeof color === 'string' ? color : '#790102';
}
