import { Redirect, router } from 'expo-router';
import SplashScreen  from './getting-started';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [firstTime, setFirstTime] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('seenOnboarding').then(value => {
      setFirstTime(!value);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  
  return firstTime
    ? <SplashScreen onContinue={() => router.replace('/onboarding')} />
    : <Redirect href="/tabs" />
}