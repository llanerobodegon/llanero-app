import { useLocalSearchParams } from 'expo-router';

import { SubcategoryView } from '@/views/SubcategoryView';

export default function SubcategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SubcategoryView subcategoryId={id} />;
}
