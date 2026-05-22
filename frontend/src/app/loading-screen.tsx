import { View, Image } from "react-native";
import React from "react";
import { MotiView, MotiText } from "moti";

type DecorativeElement = {
  type: "star" | "diamond" | "planet";
  size: number;
  color: string;
  top: `${number}%`;
  left: `${number}%`;
};

const invyteLogo = require("@/assets/images/invyte-logo.png");

export default function LoadingScreen() {
  const decorativeElements: DecorativeElement[] = [
    { type: "star", size: 24, color: "#facc15", top: "8%", left: "10%" },
    { type: "star", size: 16, color: "#fde047", top: "15%", left: "85%" },
    { type: "star", size: 20, color: "#c084fc", top: "25%", left: "75%" },
    { type: "diamond", size: 16, color: "#22d3ee", top: "12%", left: "70%" },
    { type: "diamond", size: 12, color: "#60a5fa", top: "20%", left: "20%" },
    { type: "planet", size: 40, color: "#f97316", top: "10%", left: "88%" },
    { type: "planet", size: 48, color: "#ec4899", top: "78%", left: "8%" },
    { type: "planet", size: 32, color: "#f59e0b", top: "82%", left: "85%" },
  ];

  return (
    <View className="flex-1 bg-[#0f0c29] overflow-hidden items-center justify-center">
      <View className="absolute inset-0">
        {decorativeElements.map((el, i) => (
           <MotiView
                key={i}
                from={{ translateY: 0, rotate: "0deg", scale: 1 }}
                animate={{
                translateY: el.type === "planet" ? -15 : -10,
                rotate: el.type === "diamond" ? "360deg" : "10deg",
                scale: 1.1,
                }}
                transition={{
                type: "timing",
                duration: 3000 + i * 200,
                loop: true,
                repeatReverse: true,
                }}
                style={{
                position: "absolute",
                top: el.top,
                left: el.left,
                }}
            >
            <View
                style={{
                width: el.size,
                height: el.size,
                backgroundColor: el.color,
                borderRadius: el.type === "diamond" ? 2 : el.size / 2,
                transform: el.type === "diamond" ? [{ rotate: "45deg" }] : [],
                }}
            />
          </MotiView>
        ))}
      </View>

      <Image
        source={invyteLogo}
        className="w-64 h-44"
        resizeMode="contain"
      />

      <MotiText
        from={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{
          loop: true,
          repeatReverse: true,
          duration: 1000,
        }}
        className="text-white mt-4 text-sm"
        style={{ fontFamily: "PoppinsSemiBold" }}
      >
        Connecting to server...
      </MotiText>
    </View>
  );
}