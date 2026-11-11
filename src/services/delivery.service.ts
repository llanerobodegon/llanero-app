import { normalizeCase } from '@/lib/text';
import { supabase } from '@/lib/supabase';
import type {
  CompleteDeliveryResult,
  DeliveryAvailability,
  DeliveryListItem,
  DeliveryOrder,
  DeliverySummary,
} from '@/models/delivery.model';
import type { OrderStatus } from '@/models/order.model';
import type { Database } from '@/types/database';

// Modo repartidor: todo pasa por funciones del servidor (`security definer`). El repartidor no
// tiene acceso directo a `orders`; así nunca recibe el código de entrega ni datos de pago.
// El tiempo real es una señal aparte (`subscribeToChanges`), no la lectura de la tabla.

type DeliveryRow = Database['public']['Functions']['get_delivery_orders']['Returns'][number];

export type DeliveryErrorCode =
  | 'not_delivery'
  | 'order_not_found'
  | 'invalid_status'
  | 'code_locked'
  | 'has_active_delivery'
  | 'unknown';

const ERROR_MESSAGES: Record<DeliveryErrorCode, string> = {
  not_delivery: 'Tu cuenta no tiene acceso al modo repartidor',
  order_not_found: 'Este pedido ya no está asignado a ti',
  invalid_status: 'El pedido cambió de estado. Actualiza e inténtalo de nuevo',
  code_locked: 'Se agotaron los intentos. Contacta al bodegón para completar la entrega',
  has_active_delivery: 'Termina tu entrega en curso antes de desconectarte',
  unknown: 'Algo salió mal. Revisa tu conexión e inténtalo de nuevo',
};

const KNOWN_CODES = Object.keys(ERROR_MESSAGES).filter(
  (code) => code !== 'unknown',
) as DeliveryErrorCode[];

/** Error del modo repartidor: `code` dice qué pasó y `message` ya viene en español. */
export class DeliveryError extends Error {
  code: DeliveryErrorCode;

  constructor(code: DeliveryErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = 'DeliveryError';
    this.code = code;
  }
}

/** El servidor responde con una clave (`order_not_found`, …) en el mensaje del error. */
function toDeliveryError(error: { message?: string } | null): DeliveryError {
  const message = error?.message ?? '';
  const code = KNOWN_CODES.find((known) => message.includes(known));
  return new DeliveryError(code ?? 'unknown');
}

/** Pedidos por página en el historial. */
export const HISTORY_PAGE_SIZE = 20;

/** En la lista de pendientes entran todos (un repartidor no acumula tantos a la vez). */
const ACTIVE_LIMIT = 50;

function transformListItem(row: DeliveryRow): DeliveryListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as OrderStatus,
    warehouseName: normalizeCase(row.warehouse_name),
    customerName: normalizeCase(row.customer_name),
    addressLine1: row.address_line_1 ? normalizeCase(row.address_line_1) : null,
    city: row.city ? normalizeCase(row.city) : null,
    itemCount: Number(row.item_count),
    createdAt: row.created_at,
    deliveredAt: row.delivered_at ?? null,
  };
}

/** Forma del JSON de `get_delivery_order` (ver la migración de funciones del repartidor). */
type DeliveryOrderJson = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  customer_notes: string | null;
  attempts_left: number;
  contact_hidden: boolean;
  warehouse: { name: string; address: string | null; phone: string | null } | null;
  customer: {
    first_name: string | null;
    last_name: string | null;
    phone_code: string | null;
    phone: string | null;
  } | null;
  address: {
    label: string | null;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
  } | null;
  items: {
    id: string;
    product_name: string;
    product_image_url: string | null;
    quantity: number;
  }[];
};

function transformOrder(json: DeliveryOrderJson): DeliveryOrder {
  return {
    id: json.id,
    orderNumber: json.order_number,
    status: json.status as OrderStatus,
    createdAt: json.created_at,
    confirmedAt: json.confirmed_at,
    deliveredAt: json.delivered_at,
    customerNotes: json.customer_notes?.trim() || null,
    attemptsLeft: Number(json.attempts_left ?? 0),
    isContactHidden: !!json.contact_hidden,
    warehouse: {
      name: json.warehouse ? normalizeCase(json.warehouse.name) : 'Tienda Llanero',
      address: json.warehouse?.address ? normalizeCase(json.warehouse.address) : null,
      phone: json.warehouse?.phone ?? null,
    },
    customer: {
      firstName: normalizeCase(json.customer?.first_name ?? ''),
      lastName: normalizeCase(json.customer?.last_name ?? ''),
      phoneCode: json.customer?.phone_code ?? null,
      phone: json.customer?.phone ?? null,
    },
    address: json.address
      ? {
          label: json.address.label,
          address1: normalizeCase(json.address.address_line_1),
          address2: json.address.address_line_2
            ? normalizeCase(json.address.address_line_2)
            : null,
          city: normalizeCase(json.address.city),
        }
      : null,
    items: (json.items ?? []).map((item) => ({
      id: item.id,
      productName: normalizeCase(item.product_name),
      productImageUrl: item.product_image_url,
      quantity: Number(item.quantity),
    })),
  };
}

export const deliveryService = {
  /** Entregas asignadas y sin terminar, de la más antigua a la más reciente. */
  async getActive(): Promise<DeliveryListItem[]> {
    const { data, error } = await supabase.rpc('get_delivery_orders', {
      p_scope: 'active',
      p_limit: ACTIVE_LIMIT,
    });
    if (error) throw toDeliveryError(error);
    return (data ?? []).map(transformListItem);
  },

  /** Entregas completadas, de la más reciente a la más antigua. `page` empieza en 0. */
  async getHistory(page: number): Promise<DeliveryListItem[]> {
    const { data, error } = await supabase.rpc('get_delivery_orders', {
      p_scope: 'history',
      p_limit: HISTORY_PAGE_SIZE,
      p_offset: page * HISTORY_PAGE_SIZE,
    });
    if (error) throw toDeliveryError(error);
    return (data ?? []).map(transformListItem);
  },

  /** Detalle de una entrega, o `null` si el pedido no está (o ya no está) asignado a él. */
  async getById(orderId: string): Promise<DeliveryOrder | null> {
    const { data, error } = await supabase.rpc('get_delivery_order', { p_order_id: orderId });
    if (error) throw toDeliveryError(error);
    if (!data) return null;
    return transformOrder(data as unknown as DeliveryOrderJson);
  },

  /** Entregas de hoy y de los últimos 7 días. */
  async getSummary(): Promise<DeliverySummary> {
    const { data, error } = await supabase.rpc('get_delivery_summary');
    if (error) throw toDeliveryError(error);
    const row = data?.[0];
    return { today: Number(row?.today ?? 0), last7Days: Number(row?.last_7_days ?? 0) };
  },

  /** "Retiré el pedido": pasa a en camino. Repetirlo no hace nada. */
  async markPickedUp(orderId: string): Promise<void> {
    const { error } = await supabase.rpc('delivery_mark_picked_up', { p_order_id: orderId });
    if (error) throw toDeliveryError(error);
  },

  /**
   * Confirma la entrega con el código del cliente. Un código incorrecto no es un error: vuelve
   * `isCompleted: false` con los intentos que quedan.
   */
  async complete(orderId: string, code: string): Promise<CompleteDeliveryResult> {
    const { data, error } = await supabase.rpc('delivery_complete_order', {
      p_order_id: orderId,
      p_code: code,
    });
    if (error) throw toDeliveryError(error);
    const result = data as { completed?: boolean; attempts_left?: number } | null;
    return {
      isCompleted: !!result?.completed,
      attemptsLeft: Number(result?.attempts_left ?? 0),
    };
  },

  /**
   * Avisa cuando el servidor cambia alguna entrega del repartidor (asignada, reasignada,
   * cancelada, cambio de estado). Es solo una señal por un canal privado suyo, sin datos del
   * pedido: quien la recibe vuelve a cargar con las funciones de arriba. Devuelve cómo dejar
   * de escuchar.
   */
  subscribeToChanges(onChange: () => void): () => void {
    let isCancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (isCancelled || !userId) return;
      // Los canales privados validan el token de la sesión.
      await supabase.realtime.setAuth();
      if (isCancelled) return;
      channel = supabase
        .channel(`delivery:${userId}`, { config: { private: true } })
        .on('broadcast', { event: 'changed' }, () => onChange())
        .subscribe();
    })().catch(() => {
      // Sin tiempo real la app sigue funcionando: se actualiza al entrar y al deslizar.
    });

    return () => {
      isCancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  },

  /** Disponibilidad actual del repartidor (su propia fila de `users`). */
  async getAvailability(): Promise<DeliveryAvailability> {
    const { data: session } = await supabase.auth.getSession();
    const id = session.session?.user.id;
    if (!id) throw new DeliveryError('unknown');
    const { data, error } = await supabase
      .from('users')
      .select('delivery_status')
      .eq('id', id)
      .single();
    if (error) throw new DeliveryError('unknown');
    return data.delivery_status ?? 'available';
  },

  /** Cambia entre disponible y no disponible; devuelve el estado que quedó. */
  async setAvailability(isAvailable: boolean): Promise<DeliveryAvailability> {
    const { data, error } = await supabase.rpc('set_delivery_availability', {
      p_available: isAvailable,
    });
    if (error) throw toDeliveryError(error);
    return data as DeliveryAvailability;
  },
};
