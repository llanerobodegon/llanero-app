import type { Slider } from '@/models/slider.model';

/** Posiciones de slider que define la tabla `sliders`. */
export const SliderPosition = {
  main: 1,
  secondary: 2,
} as const;

// TODO: reemplazar por la consulta a Supabase (`sliders` con is_active = true y la posición
// pedida, ordenados por slot) cuando se conecte el cliente. La firma no debe cambiar.
// `imageUrl` vacío = el componente muestra un placeholder.
const MOCK_DATE = '2026-11-01T00:00:00.000Z';
const MOCK_SLIDERS: Slider[] = [SliderPosition.main, SliderPosition.secondary].flatMap((position) =>
  [1, 2, 3].map((slot) => ({
    id: `mock-slider-${position}-${slot}`,
    name: position === SliderPosition.main ? `Banner ${slot}` : `Banner secundario ${slot}`,
    position,
    slot,
    imageUrl: '',
    linkUrl: null,
    isActive: true,
    createdBy: null,
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  })),
);

export const sliderService = {
  /** Slides activos de una posición, ordenados por slot. */
  async getActiveByPosition(position: number): Promise<Slider[]> {
    return MOCK_SLIDERS.filter((s) => s.isActive && s.position === position).sort(
      (a, b) => a.slot - b.slot,
    );
  },
};
