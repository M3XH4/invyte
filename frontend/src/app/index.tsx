import { Redirect } from 'expo-router';

import StartupLoadingScreen from '@/components/StartupLoadingScreen';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';

export default function Index() {
  const bootstrap = useAppBootstrap();

  if (!bootstrap.isReady) {
    return <StartupLoadingScreen message={bootstrap.message} />;
  }

  return <Redirect href={bootstrap.routeTarget} />;
}
