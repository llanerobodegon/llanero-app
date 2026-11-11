import { useLocalSearchParams } from 'expo-router';

import { OrderDetailView } from '@/views/OrderDetailView';

export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetailView orderId={id} />;
}
