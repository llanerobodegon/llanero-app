import { useLocalSearchParams } from 'expo-router';

import { PaymentMethodFormView } from '@/views/PaymentMethodFormView';

export default function EditPaymentMethodRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PaymentMethodFormView methodId={id} />;
}
