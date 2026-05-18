import { Redirect } from 'expo-router';

export default function Index() {
  const isFirstTime = true; // later: replace with AsyncStorage

  if (isFirstTime) {
    return <Redirect href="/getting-started" />;
  }

  return <Redirect href="/tabs/index" />;
}