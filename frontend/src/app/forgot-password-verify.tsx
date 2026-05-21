import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const invyteLogo = require('@/assets/images/invyte-logo.png');

export default function VerifyCodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

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
    { type: 'streak', color: '#FF1493', width: 32, height: 4, angle: -45, top: '12%', left: '15%' },
    { type: 'streak', color: '#00BFFF', width: 24, height: 4, angle: -30, top: '14%', left: '25%' },
    { type: 'streak', color: '#FFD700', width: 28, height: 4, angle: 45, top: '12%', right: '15%' },
    { type: 'streak', color: '#9370DB', width: 24, height: 4, angle: 30, top: '14%', right: '25%' },
    { type: 'star', color: '#FFD700', size: 20, top: '10%', left: '20%' },
    { type: 'star', color: '#FF1493', size: 16, top: '11%', right: '18%' },
    { type: 'diamond', color: '#9370DB', size: 12, top: '16%', right: '22%' },
    { type: 'diamond', color: '#FFD700', size: 12, top: '9%', left: '30%' },
  ];

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) return;

    router.push({
      pathname: '/reset-password',
      params: {
        email,
        code: verificationCode,
      },
    });
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
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
        keyboardShouldPersistTaps="handled"
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
              else router.replace('/forgot-password');
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
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.1)',
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
                className="mb-6 h-28 w-40"
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
                Verify Code
              </Text>

              <Text className="px-8 text-center text-sm text-white/70">
                We sent a verification code to{'\n'}
                <Text className="font-bold text-white">{email}</Text>
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
            className="flex-1 gap-8"
          >
            <View className="flex-row justify-center gap-3">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleChange(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(index, nativeEvent.key)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  className="h-14 w-12 rounded-2xl border-2 border-[#2020a0]/40 bg-[#0a0a4a]/60 text-2xl font-black text-white"
                />
              ))}
            </View>

            <View className="items-center">
              {timeLeft > 0 ? (
                <Text className="text-sm text-white/60">
                  Resend code in{' '}
                  <Text className="font-bold text-white">{timeLeft}s</Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend}>
                  <Text className="text-sm font-bold text-pink-400">
                    Resend Code
                  </Text>
                </Pressable>
              )}
            </View>

            <View className="flex-1" />

            <MotiPressable
              disabled={code.join('').length !== 6}
              onPress={handleVerify}
              animate={({ pressed }) => {
                'worklet';
                const enabled = code.join('').length === 6;

                return {
                  scale: pressed && enabled ? 0.97 : 1,
                  opacity: enabled ? 1 : 0.5,
                };
              }}
              style={{ overflow: 'hidden', borderRadius: 9999 }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                className="h-14 flex-row items-center justify-center gap-2"
              >
                <CheckCircle color="#000045" size={20} />
                <Text className="text-lg font-black text-[#000045]">
                  Verify Code
                </Text>
              </LinearGradient>
            </MotiPressable>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}