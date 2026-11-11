import { useLocalSearchParams } from 'expo-router';

import { RegisteredView } from '@/views/RegisteredView';

export default function RegisteredRoute() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  return <RegisteredView name={name ?? ''} />;
}
