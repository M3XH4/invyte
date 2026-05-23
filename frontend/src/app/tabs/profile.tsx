import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Calendar,
  Crown,
  Settings,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserCircle,
  Users,
  Zap,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { profileApi, type ProfileStats } from '@/api/profileApi';
import { useAuth } from '@/hooks/useAuth';
import { buildAchievements } from '@/utils/achievements';
import type { Achievement } from '@/types/achievement';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStats = async () => {
      try {
        setError('');
        setStats(await profileApi.stats());
      } catch (error: any) {
        setError(error.message || 'Unable to load profile stats.');
      }
    };

    loadStats();
  }, [isAuthenticated]);

  return (
    <View className={`flex-1 ${theme.page}`}>
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 130,
        }}
      >
        <View className="px-6">
          {/* Header */}
          <View className="mb-8 flex-row items-center justify-between">
            <Text className={`text-3xl font-black ${theme.headerText}`}>
              Profile
            </Text>

            {isAuthenticated && (
              <Pressable
                onPress={() => router.push('/profile-settings')}
                className={`h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
              >
                <Settings color={theme.iconColor} size={20} />
              </Pressable>
            )}
          </View>

          {!isAuthenticated ? (
            <GuestProfileFallback />
          ) : user ? (
            <>
              {/* Profile Hero Card */}
              <MotiView
                from={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'timing', duration: 400 }}
                className="mb-8 overflow-hidden rounded-[32px]"
              >
                <LinearGradient
                  colors={['#a855f7', '#9333ea', '#db2777']}
                  className="relative h-[230px] w-full rounded-[32px] px-5"
                >
                  <View className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-400/30" />
                  <View className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-400/20" />

                  <View className="absolute left-5 right-5 top-5 z-10 flex-row items-start gap-4">
                    <View className="relative">
                      <Image
                        source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Invyte') }}
                        className="h-16 w-16 rounded-full"
                      />

                      <View className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                    </View>

                    <View className="flex-1 pt-1">
                      <Text className="mb-0.5 text-2xl font-black text-white">
                        {user.name}
                      </Text>

                      <Text className="mb-2 text-sm font-medium text-white/70">
                        {user.username ? `@${user.username.replace('@', '')}` : user.email}
                      </Text>

                      <LinearGradient
                        colors={['#facc15', '#fb923c']}
                        className="self-start flex-row items-center gap-1.5 px-3 py-1.5"
                        style={{ borderRadius: 9999 }}
                      >
                        <Star color="white" size={14} fill="white" />
                        <Text className="text-xs font-black text-white">
                          {user.role === 'admin' ? 'Admin' : 'Host'}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View className="absolute left-0 right-0 top-[120px] z-10 flex-row justify-center gap-3">
                    <ProfileStat
                      icon={Calendar}
                      value={stats?.events_hosted ?? 0}
                      label="Events"
                    />
                    <ProfileStat
                      icon={Users}
                      value={stats?.guests_invited ?? 0}
                      label="Guests"
                    />
                    <ProfileStat
                      icon={TrendingUp}
                      value={stats?.attendance_rate ?? '0%'}
                      label="Rate"
                    />
                  </View>
                </LinearGradient>
              </MotiView>

              <AchievementsSection stats={stats} />

              {!!error && (
                <View className={`rounded-2xl border p-4 ${theme.surface}`}>
                  <Text className="text-sm font-semibold text-red-500">{error}</Text>
                </View>
              )}
            </>
          ) : (
            <GuestProfileFallback />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function GuestProfileFallback() {
  const router = useRouter();
  const theme = useScreenTheme();

  return (
    <View className={`items-center rounded-[32px] border p-8 shadow-sm ${theme.surface}`}>
      <View className={`mb-5 h-24 w-24 items-center justify-center rounded-[28px] ${theme.surfaceMuted}`}>
        <UserCircle color="#9333ea" size={56} />
      </View>

      <Text className={`mb-2 text-center text-2xl font-black ${theme.headerText}`}>
        You’re browsing as guest
      </Text>

      <Text className={`mb-6 text-center text-sm leading-5 ${theme.subText}`}>
        Sign in to view your profile, achievements, hosted events, and guest stats.
      </Text>

      <Pressable
        onPress={() => router.push('/auth-login')}
        className="w-full overflow-hidden rounded-2xl"
      >
        <LinearGradient
          colors={['#9333ea', '#ec4899']}
          className="h-14 items-center justify-center"
        >
          <Text className="text-base font-bold text-white">
            Sign In
          </Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        onPress={() => router.push('/auth-register')}
        className="mt-3 h-12 items-center justify-center"
      >
        <Text className={`font-bold ${theme.isDarkMode ? 'text-fuchsia-300' : 'text-purple-600'}`}>
          Create an account
        </Text>
      </Pressable>
    </View>
  );
}

function ProfileStat({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: string | number;
  label: string;
}) {
  return (
    <View className="h-[82px] w-[95px] items-center justify-center rounded-[22px] border border-white/25 bg-white/15 p-3">
      <Icon color="white" size={20} strokeWidth={2.5} />
      <Text className="mt-1 text-2xl font-black text-white">
        {value}
      </Text>
      <Text className="text-[10px] font-bold text-white/80">
        {label}
      </Text>
    </View>
  );
}

function AchievementsSection({ stats }: { stats: ProfileStats | null }) {
  const router = useRouter();
  const theme = useScreenTheme();
  const achievements = buildAchievements(stats);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <View className="mb-6">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Trophy color="#eab308" size={24} />
          <Text className={`text-xl font-black ${theme.headerText}`}>
            Achievements
          </Text>
        </View>

        <Pressable onPress={() => router.push('/achievements' as any)}>
          <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-fuchsia-300' : 'text-purple-600'}`}>
            {unlockedCount}/{achievements.length} completed
          </Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-4">
        {achievements.slice(0, 4).map((achievement, index) => {
          const Icon = achievementIcon(achievement);

          return (
            <MotiView
              key={achievement.id}
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'timing',
                delay: index * 80,
                duration: 350,
              }}
              className="overflow-hidden rounded-[28px]"
              style={{
                width: '48%',
                height: 120,
              }}
            >
              <LinearGradient
                colors={achievement.colors as [string, string]}
                className="relative h-full w-full p-4"
              >
                <View className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />

                <View className="z-10 h-full justify-between">
                  <Icon color="white" size={32} strokeWidth={2.5} />

                  <View>
                    <Text className="mb-0.5 text-sm font-black text-white">
                      {achievement.title}
                    </Text>
                    <Text className="text-[11px] font-semibold leading-tight text-white/85">
                      {achievement.description}
                    </Text>
                  </View>
                </View>

                {achievement.unlocked && (
                  <View className="absolute right-3 top-3 h-6 w-6 items-center justify-center rounded-full bg-white">
                    <Award color="#10b981" size={14} strokeWidth={3} />
                  </View>
                )}

                {!achievement.unlocked && (
                  <View className="absolute inset-0 items-center justify-center rounded-[28px] bg-black/40">
                    <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/15">
                      <Text className="text-2xl">🔒</Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}

function achievementIcon(achievement: Achievement) {
  const icons = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    target: Target,
    crown: Crown,
    award: Award,
    calendar: Calendar,
    users: Users,
  };

  return icons[achievement.iconName] || Award;
}
