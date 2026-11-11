import { useLocalSearchParams } from 'expo-router';

import type { DeliveryType } from '@/models/order.model';
import { CheckoutPaymentView } from '@/views/CheckoutPaymentView';

export default function CheckoutPaymentRoute() {
  const { deliveryType, addressId } = useLocalSearchParams<{
    deliveryType: DeliveryType;
    addressId?: string;
  }>();
  return (
    <CheckoutPaymentView
      deliveryType={deliveryType === 'pickup' ? 'pickup' : 'delivery'}
      addressId={addressId || null}
    />
  );
}
