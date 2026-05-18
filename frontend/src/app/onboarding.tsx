import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiImage, MotiText, MotiView } from "moti";
import { ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

const calendarImage = require("@/assets/images/calendar.png");
const threeKidsImage = require("@/assets/images/3-kids.png");
const trophyImage = require("@/assets/images/trophy.png");
const kidOnRocket = require("@/assets/images/kid-in-a-rocket.png");

const onboardingSteps = [
  {
    image: calendarImage,
    title: "Create\nAwesome Events",
    description: "Design, customize and\ninvite your people.",
    bgColor: "#13066f",
    bgEnd: "#0a0340",
  },
  {
    image: threeKidsImage,
    title: "Invite & Manage\nGuests Easily",
    description: "Keep track of RSVPs\nin real-time.",
    bgColor: "#fb436a",
    bgEnd: "#d91c4a",
  },
  {
    image: trophyImage,
    title: "Track & Celebrate\nTogether",
    description: "QR check-in, attendance\nstats and achievements!",
    bgColor: "#01cae5",
    bgEnd: "#0197b8",
  },
  {
    image: kidOnRocket,
    title: "Ready to Start\nYour Adventure",
    description: "Join thousands creating\namazing events",
    bgColor: "#2d1b6b",
    bgEnd: "#1a0d4d",
  },
];

const shapesByScreen = [
  [
    {
      type: "blob",
      color: "#ec4899",
      size: 32,
      top: "15%",
      left: "8%",
      rotation: 45,
    },
    {
      type: "blob",
      color: "#f472b6",
      size: 24,
      top: "12%",
      right: "12%",
      rotation: 0,
    },
    {
      type: "blob",
      color: "#22d3ee",
      size: 20,
      top: "20%",
      right: "18%",
      rotation: 30,
    },
    {
      type: "diamond",
      color: "#c084fc",
      size: 16,
      top: "25%",
      left: "15%",
      rotation: 45,
    },
    {
      type: "blob",
      color: "#a3e635",
      size: 24,
      top: "55%",
      left: "10%",
      rotation: 60,
    },
    {
      type: "diamond",
      color: "#06b6d4",
      size: 20,
      top: "65%",
      right: "15%",
      rotation: 45,
    },
  ],
  [
    {
      type: "star",
      color: "#facc15",
      size: 24,
      top: "10%",
      left: "8%",
      rotation: 0,
    },
    {
      type: "diamond",
      color: "#a855f7",
      size: 16,
      top: "8%",
      right: "15%",
      rotation: 45,
    },
    {
      type: "blob",
      color: "#fde047",
      size: 20,
      top: "15%",
      left: "85%",
      rotation: 20,
    },
    {
      type: "diamond",
      color: "#ec4899",
      size: 20,
      top: "20%",
      left: "15%",
      rotation: 45,
    },
    {
      type: "diamond",
      color: "#22d3ee",
      size: 20,
      top: "18%",
      right: "10%",
      rotation: 45,
    },
  ],
  [
    {
      type: "diamond",
      color: "#a855f7",
      size: 20,
      top: "8%",
      left: "10%",
      rotation: 45,
    },
    {
      type: "diamond",
      color: "#22d3ee",
      size: 16,
      top: "12%",
      left: "18%",
      rotation: 45,
    },
    {
      type: "diamond",
      color: "#3b82f6",
      size: 24,
      top: "10%",
      right: "15%",
      rotation: 45,
    },
    {
      type: "star",
      color: "#facc15",
      size: 24,
      top: "20%",
      left: "8%",
      rotation: 0,
    },
    {
      type: "diamond",
      color: "#ec4899",
      size: 20,
      top: "18%",
      right: "20%",
      rotation: 45,
    },
  ],
  [
    {
      type: "diamond",
      color: "#ec4899",
      size: 20,
      top: "8%",
      left: "10%",
      rotation: 45,
    },
    {
      type: "star",
      color: "#c084fc",
      size: 20,
      top: "10%",
      left: "20%",
      rotation: 0,
    },
    {
      type: "star",
      color: "#facc15",
      size: 24,
      top: "8%",
      right: "12%",
      rotation: 0,
    },
    {
      type: "planet",
      color: "#fb923c",
      size: 32,
      top: "12%",
      right: "8%",
      rotation: 0,
    },
    {
      type: "diamond",
      color: "#22d3ee",
      size: 16,
      top: "15%",
      right: "20%",
      rotation: 45,
    },
  ],
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const step = onboardingSteps[currentStep];
  const shapes = shapesByScreen[currentStep];

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/tabs');
  };
  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await finishOnboarding();
    }
  };

  const handleSkip = finishOnboarding;

  return (
    <LinearGradient
      colors={[step.bgColor, step.bgEnd]}
      className="flex-1 overflow-hidden"
    >
      <View className="absolute inset-0">
        {shapes.map((shape, index) => (
          <MotiView
            key={index}
            from={{
              translateY: 0,
              rotate: `${shape.rotation}deg`,
              scale: 1,
            }}
            animate={{
              translateY: -15,
              rotate:
                shape.type === "diamond"
                  ? `${shape.rotation + 360}deg`
                  : `${shape.rotation + 20}deg`,
              scale: 1.1,
            }}
            transition={{
              type: "timing",
              duration: 3000 + index * 200,
              loop: true,
              repeatReverse: true,
              delay: index * 100,
            }}
            style={{
              position: "absolute",
              top: shape.top as any,
              left: shape.left as any,
              right: shape.right as any,
            }}
          >
            <View
              style={{
                width: shape.size,
                height: shape.size,
                backgroundColor: shape.color,
                opacity: 0.85,
                borderRadius:
                  shape.type === "planet"
                    ? shape.size / 2
                    : shape.type === "star"
                      ? 4
                      : 8,
                transform:
                  shape.type === "diamond" ? [{ rotate: "45deg" }] : [],
              }}
            />
          </MotiView>
        ))}
      </View>

      <Pressable
        onPress={handleSkip}
        className="absolute right-6 z-20 bg-white/20 border border-white/40 px-5 py-2.5 rounded-full shadow-lg"
        style={{ top: insets.top + 16 }}
      >
        <Text className="text-white font-semibold text-sm" style={{ fontFamily: "PoppinsSemiBold" }}>
          Skip
        </Text>
      </Pressable>
      <View
        className="relative z-10 flex-1 items-center justify-between px-8"
        style={{
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-1 items-center justify-center">
          <MotiView
            key={`content-${currentStep}`}
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "timing", duration: 500 }}
            className="items-center"
          >
            <MotiText
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400 }}
              className="text-center text-4xl leading-tight text-white"
              style={{ fontFamily: "PoppinsBold" }}
            >
              {step.title}
            </MotiText>

            <Text className="mb-10 text-center text-md leading-relaxed text-white/100" style={{ fontFamily: "PoppinsRegular" }}>
              {step.description}
            </Text>

            <MotiImage
              source={step.image}
              from={{ translateY: 0 }}
              animate={{ translateY: -10 }}
              transition={{
                type: "timing",
                duration: 3000,
                loop: true,
                repeatReverse: true,
              }}
              className={currentStep === 0 ? "h-120 w-120" : "h-120 w-120"}
              resizeMode="contain"
            />
          </MotiView>
        </View>

        <View className="w-full max-w-sm items-center gap-6">
          <View className="flex-row gap-2">
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${index === currentStep ? "w-5 bg-white" : "w-2 bg-white/30"
                  }`}
              />
            ))}
          </View>

          <Pressable
            onPress={handleNext}
            className="h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl"
          >
            <ArrowRight color={step.bgColor} size={26} strokeWidth={3} />
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
