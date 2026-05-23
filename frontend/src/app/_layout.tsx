import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import StartupLoadingScreen from '@/components/StartupLoadingScreen';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { AppBootstrapProvider, getBootstrapApiUrlLabel, useAppBootstrap } from '@/hooks/useAppBootstrap';
import { usePushNotifications } from '@/hooks/usePushNotifications';

import '../global.css';

function AppStatusBar() {
  const { isDarkMode } = useAppTheme();

  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

function PushBootstrap() {
  usePushNotifications();

  return null;
}

function AppShell() {
  const bootstrap = useAppBootstrap();

  if (!bootstrap.isReady) {
    return (
      <StartupLoadingScreen
        message={bootstrap.message}
        error={bootstrap.error}
        apiUrl={bootstrap.error ? getBootstrapApiUrlLabel() : undefined}
        onRetry={bootstrap.retry}
      />
    );
  }

  return (
    <>
      <PushBootstrap />
      <AppStatusBar />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
      <ThemeProvider>
        <AppBootstrapProvider>
          <AppShell />
        </AppBootstrapProvider>
      </ThemeProvider>
  );
}
