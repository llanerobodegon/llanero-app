import { supabase } from '@/lib/supabase';
import { normalizeCase } from '@/lib/text';
import type {
  CreateOrderData,
  DeliveryType,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
} from '@/models/order.model';
import type { Database } from '@/types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
type WarehouseRow = Database['public']['Tables']['warehouses']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];

/** Pedido con sus relaciones, tal como lo devuelve el select de abajo. */
type OrderWithRelations = OrderRow & {
  warehouses: Pick<WarehouseRow, 'id' | 'name' | 'address' | 'phone'> | null;
  addresses: Pick<AddressRow, 'id' | 'label' | 'address_line_1' | 'address_line_2' | 'city'> | null;
  order_items: OrderItemRow[];
};

/** Pedido + tienda + dirección + líneas. RLS: el cliente solo ve sus pedidos y sus líneas. */
const ORDER_SELECT = `
  *,
  warehouses (id, name, address, phone),
  addresses (id, label, address_line_1, address_line_2, city),
  order_items (*)
`;

/** Pedidos que se muestran en la lista (sin paginación por ahora). */
const ORDERS_LIMIT = 50;

function transformItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: normalizeCase(row.product_name),
    productImageUrl: row.product_image_url,
    quantity: row.quantity,
    unitPriceUsd: Number(row.unit_price_usd),
    unitPriceBs: Number(row.unit_price_bs),
    totalUsd: Number(row.total_usd),
    totalBs: Number(row.total_bs),
  };
}

function transformOrder(row: OrderWithRelations): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    warehouse: {
      id: row.warehouse_id,
      // Si la tienda ya no está activa, RLS la oculta: se muestra un nombre genérico.
      name: row.warehouses ? normalizeCase(row.warehouses.name) : 'Tienda Llanero',
      address: row.warehouses ? normalizeCase(row.warehouses.address) : null,
      phone: row.warehouses?.phone ?? null,
    },
    address: row.addresses
      ? {
          id: row.addresses.id,
          label: row.addresses.label,
          address1: row.addresses.address_line_1,
          address2: row.addresses.address_line_2,
          city: row.addresses.city,
        }
      : null,
    // TODO: el cliente no puede leer `users` de otros (RLS), así que el repartidor no llega.
    // Hace falta una vista o política en llanero-web que exponga nombre y teléfono del
    // repartidor asignado a los pedidos del cliente.
    deliveryPerson: null,
    deliveryType: row.delivery_type as DeliveryType,
    deliveryCode: row.delivery_code,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethodType: row.payment_method_type as PaymentMethodType,
    paymentBank: row.payment_bank,
    paymentReference: row.payment_reference,
    subtotalUsd: Number(row.subtotal_usd),
    subtotalBs: Number(row.subtotal_bs),
    deliveryFeeUsd: Number(row.delivery_fee_usd ?? 0),
    deliveryFeeBs: Number(row.delivery_fee_bs ?? 0),
    totalUsd: Number(row.total_usd),
    totalBs: Number(row.total_bs),
    exchangeRate: Number(row.exchange_rate),
    customerNotes: row.customer_notes,
    confirmedAt: row.confirmed_at,
    deliveredAt: row.delivered_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    items: [...(row.order_items ?? [])]
      .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
      .map(transformItem),
  };
}

/** Id del usuario con sesión. Se filtra por él: los admins pueden leer todos los pedidos. */
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');
  return id;
}

/**
 * Escucha en tiempo real los cambios de una tabla y avisa con `onChange`. Usa la sesión actual
 * (Realtime respeta las reglas de acceso: el cliente solo recibe sus filas). Devuelve cómo dejar
 * de escuchar.
 */
function subscribe(
  table: 'orders',
  buildFilter: (userId: string) => string,
  onChange: () => void,
): () => void {
  let isCancelled = false;
  let channel: ReturnType<typeof supabase.channel> | null = null;

  supabase.auth.getSession().then(({ data }) => {
    const userId = data.session?.user.id;
    if (isCancelled || !userId) return;
    channel = supabase
      .channel(`${table}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: buildFilter(userId) },
        () => onChange(),
      )
      .subscribe();
  });

  return () => {
    isCancelled = true;
    if (channel) supabase.removeChannel(channel);
  };
}

export const orderService = {
  /** Pedidos del usuario con sus líneas, del más reciente al más antiguo. */
  async getMine(): Promise<Order[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(ORDERS_LIMIT)
      .returns<OrderWithRelations[]>();
    if (error) throw new Error('No pudimos cargar tus pedidos');
    return data.map(transformOrder);
  },

  /** Un pedido del usuario con sus líneas, o `null` si no existe (o no es suyo). */
  async getById(orderId: string): Promise<Order | null> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .eq('user_id', userId)
      .returns<OrderWithRelations[]>()
      .maybeSingle();
    if (error) throw new Error('No pudimos cargar el pedido');
    return data ? transformOrder(data) : null;
  },

  /** Avisa cuando se crea o cambia cualquier pedido del usuario (estado, pago, repartidor…). */
  subscribeToMine(onChange: () => void): () => void {
    return subscribe('orders', (userId) => `user_id=eq.${userId}`, onChange);
  },

  /** Avisa cuando cambia un pedido concreto del usuario. */
  subscribeToOrder(orderId: string, onChange: () => void): () => void {
    return subscribe('orders', () => `id=eq.${orderId}`, onChange);
  },

  /**
   * Crea el pedido con la función `create_order` de la base, que valida la tienda, la
   * dirección, la cuenta y la disponibilidad, y calcula precios y totales en el servidor.
   * Queda pendiente hasta que la tienda verifique el pago.
   */
  async create(data: CreateOrderData): Promise<Order> {
    // Los tipos generados marcan como `string` los parámetros de la función aunque aceptan
    // `null` (dirección en retiro, banco en Zelle); por eso esos dos van con `as string`.
    const { data: orderId, error } = await supabase.rpc('create_order', {
      p_warehouse_id: data.warehouseId,
      p_delivery_type: data.deliveryType,
      p_address_id: data.addressId as string,
      p_payment_method_type: data.paymentMethodType,
      p_bank_account_id: data.bankAccountId,
      p_payment_bank: data.paymentBank as string,
      p_payment_reference: data.paymentReference,
      p_exchange_rate: data.exchangeRate,
      p_items: data.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      ...(data.customerNotes ? { p_customer_notes: data.customerNotes } : {}),
      ...(data.paymentProofUrl ? { p_payment_proof_url: data.paymentProofUrl } : {}),
    });
    if (error) {
      // Los errores de validación de la función (código P0001) traen el mensaje en español.
      throw new Error(error.code === 'P0001' ? error.message : 'No pudimos crear tu pedido');
    }
    const order = await orderService.getById(orderId);
    if (!order) throw new Error('Tu pedido se creó, pero no pudimos cargarlo');
    return order;
  },
};
