import type {
  DeliveryType,
  Order,
  OrderDeliveryPerson,
  OrderWarehouse,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
} from '@/models/order.model';

// TODO: reemplazar los mocks por Supabase cuando se conecte el cliente:
//   supabase.from('orders')
//     .select('*, warehouses (id, name, address, phone), addresses (id, label, address_line_1, address_line_2, city),
//              delivery_person:users!orders_delivery_person_id_fkey (id, first_name, last_name, phone, phone_code),
//              order_items (id, product_id, product_name, product_image_url, quantity,
//                           unit_price_usd, unit_price_bs, total_usd, total_bs)')
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false })
// La política RLS "Customers can view their own orders" ya limita a los pedidos del usuario.
// Ojo: para leer el repartidor, `users` necesita una política RLS que deje al cliente ver al
// repartidor de sus pedidos (hoy solo existe para la web). Los DECIMAL llegan como string: convertir con Number(). La firma no debe cambiar.

const EXCHANGE_RATE = 230.5;

type MockItem = { name: string; quantity: number; unitPriceUsd: number };

type MockOrder = {
  number: number;
  warehouse: OrderWarehouse;
  deliveryType: DeliveryType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethodType: PaymentMethodType;
  /** Hace cuántos minutos se creó. */
  minutesAgo: number;
  deliveryFeeUsd: number;
  items: MockItem[];
  cancellationReason?: string;
  deliveryPerson?: OrderDeliveryPerson;
};

const MOCK_LAS_MERCEDES: OrderWarehouse = {
  id: 'mock-warehouse-las-mercedes',
  name: 'Llanero Bodegón Las Mercedes',
  address: 'Calle París con Av. Río de Janeiro, Las Mercedes',
  phone: '0424-1234567',
};

const MOCK_ALTAMIRA: OrderWarehouse = {
  id: 'mock-warehouse-altamira',
  name: 'Llanero Bodegón Altamira',
  address: 'Av. San Juan Bosco, 2da transversal, Altamira',
  phone: '0412-7654321',
};

const MOCK_DELIVERY_PERSON: OrderDeliveryPerson = {
  id: 'mock-delivery-1',
  firstName: 'Carlos',
  lastName: 'Rodríguez',
  phone: '1234567',
  phoneCode: '0414',
};

const MOCK_ORDERS: MockOrder[] = [
  {
    number: 128,
    warehouse: MOCK_LAS_MERCEDES,
    deliveryType: 'delivery',
    status: 'on_delivery',
    paymentStatus: 'verified',
    paymentMethodType: 'pago_movil',
    minutesAgo: 25,
    deliveryPerson: MOCK_DELIVERY_PERSON,
    deliveryFeeUsd: 2.5,
    items: [
      { name: 'Cerveza Polar Pilsen', quantity: 1, unitPriceUsd: 22 },
      { name: 'Hielo', quantity: 2, unitPriceUsd: 1.5 },
      { name: 'Doritos Mega Queso', quantity: 2, unitPriceUsd: 2.47 },
    ],
  },
  {
    number: 127,
    warehouse: MOCK_LAS_MERCEDES,
    deliveryType: 'pickup',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethodType: 'zelle',
    minutesAgo: 8,
    deliveryFeeUsd: 0,
    items: [
      { name: 'Ron Santa Teresa 1796', quantity: 1, unitPriceUsd: 32.3 },
      { name: 'Coca-Cola', quantity: 2, unitPriceUsd: 2.4 },
    ],
  },
  {
    number: 119,
    warehouse: MOCK_ALTAMIRA,
    deliveryType: 'delivery',
    status: 'completed',
    paymentStatus: 'verified',
    paymentMethodType: 'pago_movil',
    minutesAgo: 60 * 26,
    deliveryPerson: MOCK_DELIVERY_PERSON,
    deliveryFeeUsd: 2.5,
    items: [
      { name: 'Harina PAN Blanca', quantity: 4, unitPriceUsd: 1.28 },
      { name: 'Queso Blanco Llanero', quantity: 1, unitPriceUsd: 6.12 },
      { name: 'Huevos', quantity: 1, unitPriceUsd: 5.5 },
      { name: 'Leche Completa Campestre', quantity: 2, unitPriceUsd: 1.95 },
      { name: 'Café Fama de América', quantity: 1, unitPriceUsd: 6.5 },
      { name: 'Azúcar Montalbán', quantity: 1, unitPriceUsd: 1.35 },
    ],
  },
  {
    number: 104,
    warehouse: MOCK_LAS_MERCEDES,
    deliveryType: 'pickup',
    status: 'cancelled',
    paymentStatus: 'rejected',
    paymentMethodType: 'transferencia',
    minutesAgo: 60 * 24 * 5,
    deliveryFeeUsd: 0,
    cancellationReason: 'No pudimos verificar el pago.',
    items: [{ name: 'Whisky Buchanan’s 12', quantity: 1, unitPriceUsd: 45 }],
  },
  {
    number: 97,
    warehouse: MOCK_ALTAMIRA,
    deliveryType: 'delivery',
    status: 'completed',
    paymentStatus: 'verified',
    paymentMethodType: 'zelle',
    minutesAgo: 60 * 24 * 12,
    deliveryFeeUsd: 2.5,
    items: [
      { name: 'Malta Polar', quantity: 2, unitPriceUsd: 4.8 },
      { name: 'Pepito Original', quantity: 3, unitPriceUsd: 1.1 },
    ],
  },
];

const round2 = (value: number) => Math.round(value * 100) / 100;
const toBs = (usd: number) => round2(usd * EXCHANGE_RATE);

function toMockOrder(mock: MockOrder, now: number): Order {
  const id = `mock-order-${mock.number}`;
  const createdAt = new Date(now - mock.minutesAgo * 60_000).toISOString();
  const items = mock.items.map((item, index) => {
    const totalUsd = round2(item.unitPriceUsd * item.quantity);
    return {
      id: `${id}-item-${index + 1}`,
      productId: `mock-product-${index + 1}`,
      productName: item.name,
      productImageUrl: null,
      quantity: item.quantity,
      unitPriceUsd: item.unitPriceUsd,
      unitPriceBs: toBs(item.unitPriceUsd),
      totalUsd,
      totalBs: toBs(totalUsd),
    };
  });
  const subtotalUsd = round2(items.reduce((sum, item) => sum + item.totalUsd, 0));
  const totalUsd = round2(subtotalUsd + mock.deliveryFeeUsd);
  const isPastConfirmation = mock.status === 'on_delivery' || mock.status === 'completed';

  return {
    id,
    orderNumber: `ORD-${String(mock.number).padStart(5, '0')}`,
    warehouse: mock.warehouse,
    address:
      mock.deliveryType === 'delivery'
        ? {
            id: 'mock-address-1',
            label: 'Casa',
            address1: 'Av. Principal de Las Mercedes, Edif. Roraima',
            address2: 'Piso 4, apto 4B',
            city: 'Caracas',
          }
        : null,
    deliveryPerson: mock.deliveryPerson ?? null,
    deliveryType: mock.deliveryType,
    deliveryCode: String(1000 + ((mock.number * 37) % 9000)),
    status: mock.status,
    paymentStatus: mock.paymentStatus,
    paymentMethodType: mock.paymentMethodType,
    paymentBank: mock.paymentMethodType === 'pago_movil' ? 'Banesco' : null,
    paymentReference: '0412',
    subtotalUsd,
    subtotalBs: toBs(subtotalUsd),
    deliveryFeeUsd: mock.deliveryFeeUsd,
    deliveryFeeBs: toBs(mock.deliveryFeeUsd),
    totalUsd,
    totalBs: toBs(totalUsd),
    exchangeRate: EXCHANGE_RATE,
    customerNotes: null,
    confirmedAt: isPastConfirmation ? createdAt : null,
    deliveredAt: mock.status === 'completed' ? createdAt : null,
    cancelledAt: mock.status === 'cancelled' ? createdAt : null,
    cancellationReason: mock.cancellationReason ?? null,
    createdAt,
    updatedAt: createdAt,
    items,
  };
}

export const orderService = {
  /** Pedidos del usuario con sus líneas, del más reciente al más antiguo. */
  async getMine(): Promise<Order[]> {
    const now = Date.now();
    return MOCK_ORDERS.map((mock) => toMockOrder(mock, now)).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  /**
   * Un pedido del usuario con sus líneas, o `null` si no existe (o no es suyo: RLS lo oculta).
   * TODO: en Supabase, el mismo select de `getMine` con `.eq('id', orderId).maybeSingle()`.
   */
  async getById(orderId: string): Promise<Order | null> {
    const orders = await orderService.getMine();
    return orders.find((order) => order.id === orderId) ?? null;
  },
};
