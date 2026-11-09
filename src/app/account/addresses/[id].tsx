import { useLocalSearchParams } from 'expo-router';

import { AddressFormView } from '@/views/AddressFormView';

export default function EditAddressRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddressFormView addressId={id} />;
}
