import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const invyteLogo = require('@/assets/images/invyte-logo.png');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');

  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 3000,
      })),
    []
  );

  const fireworkParticles = [
    { type: 'streak', color: '#FF1493', width: 32, height: 4, angle: -45, top: '14%', left: '15%' },
    { type: 'streak', color: '#00BFFF', width: 24, height: 4, angle: -30, top: '16%', left: '25%' },
    { type: 'streak', color: '#FFD700', width: 28, height: 4, angle: 45, top: '14%', right: '15%' },
    { type: 'streak', color: '#9370DB', width: 24, height: 4, angle: 30, top: '16%', right: '25%' },
    { type: 'star', color: '#FFD700', size: 20, top: '12%', left: '20%' },
    { type: 'star', color: '#FF1493', size: 16, top: '13%', right: '18%' },
    { type: 'star', color: '#00BFFF', size: 16, top: '18%', left: '18%' },
    { type: 'diamond', color: '#9370DB', size: 12, top: '19%', right: '22%' },
    { type: 'diamond', color: '#FFD700', size: 12, top: '11%', left: '30%' },
    { type: 'diamond', color: '#00BFFF', size: 12, top: '11%', right: '30%' },
  ];

  const handleSendCode = () => {
    if (!email.trim()) return;

    router.push({
      pathname: '/forgot-password-verify',
      params: { email },
    });
  };

  return (
    <View className="flex-1 bg-[#000045]">
      {particles.map((particle) => (
        <MotiView
          key={particle.id}
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'timing',
            duration: particle.duration,
            delay: particle.delay,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            position: 'absolute',
            // cast to any to allow percentage strings (e.g. '12%')
            left: particle.left as any,
            top: particle.top as any,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'white',
          }}
        />
      ))}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 36,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-1 px-6">
          <MotiPressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/auth-login');
            }}
            from={{ opacity: 0, translateX: -20 }}
            animate={({ pressed }) => {
              'worklet';
              return {
                opacity: 1,
                translateX: 0,
                scale: pressed ? 0.95 : 1,
              };
            }}
            transition={{ type: 'timing', duration: 300 }}
            style={{
              position: 'absolute',
              left: 24,
              top: 0,
              zIndex: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <ArrowLeft color="white" size={20} />
          </MotiPressable>

          <View className="relative mb-8 items-center">
            {fireworkParticles.map((particle, index) => (
              <MotiView
                key={index}
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'timing',
                  delay: 200 + index * 50,
                  duration: 400,
                }}
                style={{
                  position: 'absolute',
                  top: particle.top as any,
                  left: particle.left as any,
                  right: particle.right as any,
                }}
              >
                <View
                  style={{
                    width:
                      particle.type === 'streak'
                        ? particle.width
                        : particle.size,
                    height:
                      particle.type === 'streak'
                        ? particle.height
                        : particle.size,
                    backgroundColor: particle.color,
                    borderRadius: particle.type === 'diamond' ? 2 : 999,
                    transform: [
                      {
                        rotate:
                          particle.type === 'diamond'
                            ? '45deg'
                            : `${particle.angle ?? 0}deg`,
                      },
                    ],
                  }}
                />
              </MotiView>
            ))}

            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                duration: 600,
              }}
            >
              <Image
                source={invyteLogo}
                className="mb-6 h-32 w-48"
                resizeMode="contain"
              />
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                delay: 300,
                duration: 500,
              }}
              className="items-center"
            >
              <Text className="mb-2 text-3xl font-black text-white">
                Forgot Password?
              </Text>

              <Text className="px-8 text-center text-sm text-white/70">
                Don&apos;t worry! Enter your email and we&apos;ll send you a
                verification code
              </Text>
            </MotiView>
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              delay: 400,
              duration: 500,
            }}
            className="flex-1 gap-6"
          >
            <View className="h-14 flex-row items-center rounded-2xl border border-[#2020a0]/40 bg-[#0a0a4a]/60 px-4">
              <Mail color="rgba(255,255,255,0.6)" size={20} />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                className="ml-3 flex-1 text-white"
              />
            </View>

            <View className="flex-1" />

            <MotiPressable
              disabled={!email.trim()}
              onPress={handleSendCode}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed && email.trim() ? 0.97 : 1,
                  opacity: email.trim() ? 1 : 0.5,
                };
              }}
              style={{ overflow: 'hidden', borderRadius: 9999 }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                className="h-14 flex-row items-center justify-center gap-2"
              >
                <Send color="#000045" size={20} />
                <Text className="text-lg font-black text-[#000045]">
                  Send Verification Code
                </Text>
              </LinearGradient>
            </MotiPressable>

            <View className="flex-row justify-center pb-4">
              <Text className="text-sm text-white/70">
                Remember your password?{' '}
              </Text>

              <Pressable onPress={() => router.replace('/auth-login')}>
                <Text className="text-sm font-bold text-pink-400">
                  Login
                </Text>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}