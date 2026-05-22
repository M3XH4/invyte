import { Redirect, router } from "expo-router";
import SplashScreen from "./getting-started";
import NetworkFallback from "./network-fallback";
import LoadingScreen from "./loading-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { api } from "@/lib/api";

import "../global.css";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const [fontsLoaded] = useFonts({
    PoppinsRegular: require("@/assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("@/assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
  });

  const checkConnection = async () => {
    try {
      setIsLoading(true);

      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      await api.get("/health");

      setIsFirstTime(!hasSeenOnboarding);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!fontsLoaded) return;

    checkConnection();
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen />;
  }

  if (!isConnected) {
    return <NetworkFallback onRetry={checkConnection} />;
  }

  return isFirstTime ? (
    <SplashScreen onContinue={() => router.replace("/onboarding")} />
  ) : (
    <Redirect href="/tabs" />
  );
}
