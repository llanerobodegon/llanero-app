import { useLocalSearchParams } from 'expo-router';

import { CheckoutSuccessView } from '@/views/CheckoutSuccessView';

export default function CheckoutSuccessRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <CheckoutSuccessView orderId={orderId} />;
}
