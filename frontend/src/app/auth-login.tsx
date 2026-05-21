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
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const invyteLogo = require('@/assets/images/invyte-logo.png');

const googleLogo = {
  uri: 'https://images.icon-icons.com/2699/PNG/512/google_logo_icon_169090.png',
};

const appleLogo = {
  uri: 'https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-index-content-uploads-10.png',
};

const facebookLogo = {
  uri: 'https://1000logos.net/wp-content/uploads/2017/02/Facebook-Logosu.png',
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <View className="flex-1 bg-[#000045]">
      {/* Background particles */}
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
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 36,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-1 px-6">
          {/* Logo Section */}
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
                  top: particle.top ? parseFloat(particle.top) : undefined,
                  left: particle.left ? parseFloat(particle.left) : undefined,
                  right: particle.right ? parseFloat(particle.right) : undefined,
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
              transition={{ type: 'timing', delay: 300, duration: 500 }}
              className="items-center"
            >
              <Text className="mb-2 text-3xl font-black text-white">
                Welcome Back!
              </Text>
              <Text className="text-sm text-white/70">
                Log in to continue your adventure
              </Text>
            </MotiView>
          </View>

          {/* Login Form */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 400, duration: 500 }}
            className="gap-4"
          >
            <InputWithIcon
              icon={User}
              placeholder="Email or Username"
              autoCapitalize="none"
            />

            <View className="relative">
              <InputWithIcon
                icon={Lock}
                placeholder="Password"
                secureTextEntry={!showPassword}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-0 h-14 justify-center"
              >
                {showPassword ? (
                  <EyeOff color="rgba(255,255,255,0.6)" size={20} />
                ) : (
                  <Eye color="rgba(255,255,255,0.6)" size={20} />
                )}
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push('/forgot-password')}
              className="items-end"
            >
              <Text className="text-sm text-white/60">
                Forgot password?
              </Text>
            </Pressable>

            <MotiPressable
              onPress={() => router.replace('/tabs')}
              animate={({ pressed }) => {
                'worklet';
                return { scale: pressed ? 0.97 : 1 };
              }}
              style={{ marginTop: 8, overflow: 'hidden', borderRadius: 9999 }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                className="h-14 items-center justify-center"
              >
                <Text className="text-lg font-black text-[#000045]">
                  Login
                </Text>
              </LinearGradient>
            </MotiPressable>

            <View className="relative my-6 items-center">
              <View className="absolute top-1/2 h-px w-full bg-white/20" />
              <Text className="bg-[#000045] px-4 text-xs text-white/50">
                or continue with
              </Text>
            </View>

            <View className="flex-row justify-center gap-4 pb-6">
              <SocialButton source={googleLogo} />
              <SocialButton source={appleLogo} />
              <SocialButton source={facebookLogo} size="large" />
            </View>

            <View className="flex-row justify-center pb-4">
              <Text className="text-sm text-white/70">
                Don&apos;t have an account?{' '}
              </Text>

              <Pressable onPress={() => router.push('/auth-register')}>
                <Text className="text-sm font-bold text-pink-400">
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}

function InputWithIcon({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  icon: any;
}) {
  return (
    <View className="h-14 flex-row items-center rounded-2xl border border-[#2020a0]/40 bg-[#0a0a4a]/60 px-4">
      <Icon color="rgba(255,255,255,0.6)" size={20} />

      <TextInput
        {...props}
        placeholderTextColor="rgba(255,255,255,0.5)"
        className="ml-3 flex-1 text-white"
      />
    </View>
  );
}

function SocialButton({
  source,
  size,
}: {
  source: any;
  size?: 'normal' | 'large';
}) {
  return (
    <MotiPressable
      animate={({ pressed }) => {
        'worklet';
        return { scale: pressed ? 0.95 : 1 };
      }}
      style={{
        height: 64,
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <Image
        source={source}
        className={size === 'large' ? 'h-9 w-9' : 'h-7 w-7'}
        resizeMode="contain"
      />
    </MotiPressable>
  );
}