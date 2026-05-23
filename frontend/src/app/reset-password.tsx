import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';

const invyteLogo = require('@/assets/images/invyte-logo.png');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();

  const { email = '' } = useLocalSearchParams<{
    email?: string;
    code?: string;
  }>();
  const { code = '' } = useLocalSearchParams<{ code?: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const passwordsMatch =
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword;

  const isPasswordStrong = newPassword.length >= 8;

  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const handleResetPassword = async () => {
    if (!passwordsMatch || !isPasswordStrong) return;

    try {
      setLoading(true);
      setError('');
      await resetPassword(String(email), String(code), newPassword);
      setShowSuccess(true);

      setTimeout(() => {
        router.replace('/auth-login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#000045]">
      {/* Floating particles */}
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
            borderRadius: 999,
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
          {/* Logo section */}
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
                    borderRadius:
                      particle.type === 'diamond' ? 2 : 999,
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
                Reset Password
              </Text>

              <Text className="px-8 text-center text-sm text-white/70">
                Create a new strong password for your account
              </Text>

              {!!email && (
                <Text className="mt-2 text-sm font-bold text-white">
                  {email}
                </Text>
              )}
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
            {/* New Password */}
            <View className="gap-2">
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                secureTextEntry={!showNewPassword}
                showPassword={showNewPassword}
                onToggle={() =>
                  setShowNewPassword(!showNewPassword)
                }
              />

              {!!newPassword && (
                <View className="flex-row items-center gap-2 px-1">
                  <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                    <View
                      className={`h-full rounded-full ${
                        isPasswordStrong
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{
                        width: isPasswordStrong ? '100%' : '50%',
                      }}
                    />
                  </View>

                  <Text
                    className={`text-xs font-bold ${
                      isPasswordStrong
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}
                  >
                    {isPasswordStrong ? 'Strong' : 'Weak'}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View className="gap-2">
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry={!showConfirmPassword}
                showPassword={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />

              {!!confirmPassword && (
                <View className="px-1">
                  {passwordsMatch ? (
                    <View className="flex-row items-center gap-1">
                      <CheckCircle
                        color="#4ade80"
                        size={14}
                      />

                      <Text className="text-xs font-bold text-green-400">
                        Passwords match
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-xs font-bold text-red-400">
                      Passwords don&apos;t match
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Password Requirements */}
            <View className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Text className="mb-2 text-xs font-bold text-white/70">
                Password must contain:
              </Text>

              <View className="gap-1">
                <Requirement
                  met={newPassword.length >= 8}
                  label="At least 8 characters"
                />

                <Requirement
                  met={hasUppercase}
                  label="One uppercase letter"
                />

                <Requirement
                  met={hasNumber}
                  label="One number"
                />
              </View>
            </View>

            {!!error && (
              <View className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                <Text className="text-sm font-semibold text-red-200">{error}</Text>
              </View>
            )}

            <View className="flex-1" />

            {/* Button */}
            <MotiPressable
              disabled={loading || !passwordsMatch || !isPasswordStrong}
              onPress={handleResetPassword}
              animate={({ pressed }) => {
                'worklet';

                const enabled =
                  !loading && passwordsMatch && isPasswordStrong;

                return {
                  scale: pressed && enabled ? 0.97 : 1,
                  opacity: enabled ? 1 : 0.5,
                };
              }}
              style={{ overflow: 'hidden', borderRadius: 999 }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                className="h-14 items-center justify-center"
              >
                {loading ? (
                  <ActivityIndicator color="#000045" />
                ) : (
                  <Text className="text-lg font-black text-[#000045]">
                    Reset Password
                  </Text>
                )}
              </LinearGradient>
            </MotiPressable>
          </MotiView>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-[32px] border border-white/20 bg-white/10 p-8"
          >
            <View className="items-center">
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  delay: 200,
                }}
              >
                <LinearGradient
                  colors={['#4ade80', '#16a34a']}
                  className="mb-4 h-20 w-20 items-center justify-center rounded-full"
                >
                  <CheckCircle
                    color="white"
                    size={40}
                    strokeWidth={3}
                  />
                </LinearGradient>
              </MotiView>

              <Text className="mb-2 text-2xl font-black text-white">
                Password Reset!
              </Text>

              <Text className="text-center text-sm text-white/70">
                Your password has been successfully reset.
                Redirecting to login...
              </Text>
            </View>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

function PasswordInput({
  showPassword,
  onToggle,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="relative">
      <View className="h-14 flex-row items-center rounded-2xl border border-[#2020a0]/40 bg-[#0a0a4a]/60 px-4">
        <Lock color="rgba(255,255,255,0.6)" size={20} />

        <TextInput
          {...props}
          placeholderTextColor="rgba(255,255,255,0.5)"
          className="ml-3 flex-1 pr-10 text-white"
        />

        <Pressable onPress={onToggle}>
          {showPassword ? (
            <EyeOff
              color="rgba(255,255,255,0.6)"
              size={20}
            />
          ) : (
            <Eye
              color="rgba(255,255,255,0.6)"
              size={20}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function Requirement({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`h-1.5 w-1.5 rounded-full ${
          met ? 'bg-green-400' : 'bg-white/30'
        }`}
      />

      <Text
        className={`text-xs ${
          met ? 'text-green-400' : 'text-white/50'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
