import { Tabs, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Pressable, Text, View } from "react-native";
import { Home, Calendar, Plus, Users, UserCircle } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from '@/hooks/use-color-scheme';

function CustomTabBar({ state, navigation }: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const tabs = [
    { name: "index", label: "Home", icon: Home },
    { name: "events", label: "Events", icon: Calendar },
    { name: "guests", label: "Guests", icon: Users },
    { name: "profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <>
      {/* Center FAB */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 48,
          alignSelf: "center",
          zIndex: 50,
        }}
      >
        {/* Main FAB */}
        <MotiPressable
          onPress={() => router.push("/create-event-categories")}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.92 : 1,
            };
          }}
        >
          <LinearGradient
            colors={["#a855f7", "#9333ea", "#ec4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 62,
              width: 62,
              borderRadius: 34,
              alignItems: "center",
              justifyContent: "center",
              elevation: 10,
              shadowColor: "#9333ea",
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <Plus color="white" size={30} strokeWidth={2.5} />
          </LinearGradient>
        </MotiPressable>
      </View>

      {/* Floating Glass Tab Bar */}
      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: insets.bottom + 12,
          zIndex: 40,
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        <BlurView
          intensity={40}
          tint={isDarkMode ? 'dark' : 'light'}
          className={`border ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'}`}
        >
          <View className={`h-[68px] flex-row items-center justify-around px-2 ${isDarkMode ? 'bg-gray-950/80' : 'bg-white/80'}`}>
            {tabs.slice(0, 2).map((tab) => (
              <TabButton
                key={tab.name}
                tab={tab}
                state={state}
                navigation={navigation}
              />
            ))}

            {/* Spacer for FAB */}
            <View className="w-14" />

            {tabs.slice(2).map((tab) => (
              <TabButton
                key={tab.name}
                tab={tab}
                state={state}
                navigation={navigation}
              />
            ))}
          </View>
        </BlurView>
      </View>
    </>
  );
}

function TabButton({ tab, state, navigation }: any) {
  const routeIndex = state.routes.findIndex(
    (route: any) => route.name === tab.name,
  );
  const isActive = state.index === routeIndex;
  const Icon = tab.icon;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: state.routes[routeIndex].key,
      canPreventDefault: true,
    });

    if (!isActive && !event.defaultPrevented) {
      navigation.navigate(tab.name);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="min-w-[60px] items-center justify-center gap-1"
    >
      <View className={`p-2 ${isActive ? "rounded-xl bg-purple-100" : ""}`}>
        <Icon
          size={22}
          color={isActive ? "#9333ea" : "#9ca3af"}
          strokeWidth={2}
        />
      </View>

      <Text
        className={`text-[10px] ${isActive ? "text-purple-600" : "text-gray-400"}`}
        style={{ fontFamily: "PoppinsSemiBold" }}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="guests" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
