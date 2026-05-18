import { Pressable, View, Image } from 'react-native'
import React from 'react'
import { MotiView, MotiImage, MotiText } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type DecorativeElement = {
  type: 'star' | 'diamond' | 'planet'
  size: number
  color: string
  top: `${number}%`
  left: `${number}%`
}

const invyteLogo = require('@/assets/images/invyte-logo.png');
const kidInARocket = require('@/assets/images/kid-in-a-rocket.png');

export default function GettingStartedScreen({ onContinue }: { onContinue: () => void }) {
  const insets = useSafeAreaInsets();

  const decorativeElements: DecorativeElement[] = [
    { type: 'star', size: 24, color: '#facc15', top: '8%', left: '10%' },
    { type: 'star', size: 16, color: '#fde047', top: '15%', left: '85%' },
    { type: 'star', size: 20, color: '#c084fc', top: '25%', left: '75%' },
    { type: 'diamond', size: 16, color: '#22d3ee', top: '12%', left: '70%' },
    { type: 'diamond', size: 12, color: '#60a5fa', top: '20%', left: '20%' },
    { type: 'planet', size: 40, color: '#f97316', top: '10%', left: '88%' },
    { type: 'planet', size: 48, color: '#ec4899', top: '78%', left: '8%' },
    { type: 'planet', size: 32, color: '#f59e0b', top: '82%', left: '85%' },
    { type: 'star', size: 12, color: '#fde047', top: '70%', left: '15%' },
    { type: 'diamond', size: 16, color: '#67e8f9', top: '75%', left: '78%' },
  ];

  return (
      <Pressable
        onPress={onContinue}
        className="relative flex-1 overflow-hidden bg-[#0f0c29]"
      >
        <View className="absolute inset-0">
          {decorativeElements.map((el, i) => (
          <MotiView
            key={i}
            from={{ translateY: 0, rotate: '0deg', scale: 1 }}
            animate={{
              translateY: el.type === 'planet' ? -15 : -10,
              rotate: el.type === 'diamond' ? '360deg' : '10deg',
              scale: 1.1,
            }}
            transition={{
              type: 'timing',
              duration: 3000 + i * 200,
              loop: true,
              repeatReverse: true,
            }}
            style={{
              position: 'absolute',
              top: el.top,
              left: el.left,
            }}
          >
            <View
              style={{
                width: el.size,
                height: el.size,
                backgroundColor: el.color,
                borderRadius: el.type === 'diamond' ? 2 : el.size / 2,
                transform: el.type === 'diamond' ? [{ rotate: '45deg' }] : [],
              }}
            />
          </MotiView>
        ))}
      </View>
      {Array.from({ length: 20 }).map((_, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 2000 + i * 50,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'white',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="items-center pt-28"
      >
        <Image
          source={invyteLogo}
          className="w-64 h-45 mb-1"
          resizeMode="contain"
        />

        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          className="text-white text-md tracking-wide text-center"
          style={{ fontFamily: 'PoppinsSemiBold' }}
        >
          Make every invite an adventure!
        </MotiText>
      </MotiView>

      <View className="flex-1 items-center justify-center px-4">
        <MotiImage
          source={kidInARocket}
          from={{ translateY: 0 }}
          animate={{ translateY: -15 }}
          transition={{
            type: 'timing',
            duration: 3000,
            loop: true,
            repeatReverse: true,
          }}
          className="w-full h-[340px]"
          resizeMode="contain"
        />
      </View>

      <MotiText
        from={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
          repeatReverse: true,
        }}
        style={{ bottom: 24 + insets.bottom, fontFamily: 'PoppinsBold' }}
        className="absolute self-center text-white/80 text-sm"
      >
        Tap to continue
      </MotiText>
    </Pressable>
  )
}