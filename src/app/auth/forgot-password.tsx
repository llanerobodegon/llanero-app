import { useLocalSearchParams } from 'expo-router';

import { ForgotPasswordView } from '@/views/ForgotPasswordView';

export default function ForgotPasswordRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return <ForgotPasswordView initialEmail={email ?? ''} />;
}
