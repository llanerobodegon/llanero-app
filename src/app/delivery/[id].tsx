import { useLocalSearchParams } from 'expo-router';

import { DeliveryDetailView } from '@/views/DeliveryDetailView';

export default function DeliveryDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeliveryDetailView orderId={id} />;
}
