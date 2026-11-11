import { useLocalSearchParams } from 'expo-router';

import { ProductDetailView } from '@/views/ProductDetailView';

export default function ProductDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductDetailView productId={id} />;
}
