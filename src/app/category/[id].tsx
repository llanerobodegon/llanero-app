import { useLocalSearchParams } from 'expo-router';

import { CategoryView } from '@/views/CategoryView';

export default function CategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CategoryView categoryId={id} />;
}
