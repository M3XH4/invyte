import { Redirect, router } from "expo-router";
import SplashScreen from "./getting-started";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";

import "../global.css";
export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const [fontsLoaded] = useFonts({
    PoppinsRegular: require("@/assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("@/assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    const checkFirstTime = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      setIsFirstTime(!hasSeenOnboarding);
      setIsLoading(false);
    };

    checkFirstTime();
  }, []);


  if (isLoading) return null;
  if (!fontsLoaded) return null;
  
  return isFirstTime ? (
    <SplashScreen onContinue={() => router.replace("/onboarding")} />
  ) : (
    <Redirect href="/tabs" />
  );
}
