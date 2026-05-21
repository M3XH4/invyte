import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Calendar,
  Crown,
  Plus,
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
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type User = {
  name: string;
  username: string;
  avatar: string;
  eventsHosted: number;
  guestsInvited: number;
  attendanceRate: string;
  badge: string;
};
const achievements = [
  {
    id: 1,
    icon: Trophy,
    title: 'Event Master',
    description: 'Created 10+ events',
    unlocked: true,
    colors: ['#facc15', '#f97316'],
  },
  {
    id: 2,
    icon: Star,
    title: 'People Magnet',
    description: 'Invited 100+ guests',
    unlocked: true,
    colors: ['#f472b6', '#e11d48'],
  },
  {
    id: 3,
    icon: Zap,
    title: 'High Energy Host',
    description: '90% RSVP rate',
    unlocked: true,
    colors: ['#f87171', '#f97316'],
  },
  {
    id: 4,
    icon: Target,
    title: 'Early Bird',
    description: 'Planned 30 days ahead',
    unlocked: true,
    colors: ['#60a5fa', '#06b6d4'],
  },
  {
    id: 5,
    icon: Crown,
    title: 'Premium Host',
    description: 'Use all themes',
    unlocked: false,
    colors: ['#c084fc', '#ec4899'],
  },
  {
    id: 6,
    icon: Award,
    title: 'Perfect Planner',
    description: 'Zero cancellations',
    unlocked: false,
    colors: ['#4ade80', '#10b981'],
  },
];

// const user : User | null = null;

// Example authenticated user:
const user = {
  name: 'Argyle',
  username: '@argyle_events',
  avatar:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjGZJiVjkYNcKy7wX1h1Rz-5Hjgn6wn4S9Jw&s',
  eventsHosted: 12,
  guestsInvited: 248,
  attendanceRate: '94%',
  badge: 'Top Host',
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();

  const isAuthenticated = !!user;

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
          ) : (
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
                        source={{ uri: user.avatar }}
                        className="h-[72px] w-[72px] rounded-[24px]"
                      />

                      <View className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                    </View>

                    <View className="flex-1 pt-1">
                      <Text className="mb-0.5 text-2xl font-black text-white">
                        {user.name}
                      </Text>

                      <Text className="mb-2 text-sm font-medium text-white/70">
                        {user.username}
                      </Text>

                      <LinearGradient
                        colors={['#facc15', '#fb923c']}
                        className="self-start flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                      >
                        <Star color="white" size={14} fill="white" />
                        <Text className="text-xs font-black text-white">
                          {user.badge}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <View className="absolute left-0 right-0 top-[120px] z-10 flex-row justify-center gap-3">
                    <ProfileStat
                      icon={Calendar}
                      value={user.eventsHosted}
                      label="Events"
                    />
                    <ProfileStat
                      icon={Users}
                      value={user.guestsInvited}
                      label="Guests"
                    />
                    <ProfileStat
                      icon={TrendingUp}
                      value={user.attendanceRate}
                      label="Rate"
                    />
                  </View>
                </LinearGradient>
              </MotiView>

              <AchievementsSection />
            </>
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

function AchievementsSection() {
  const theme = useScreenTheme();
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

        <Text className={`text-sm font-bold ${theme.mutedText}`}>
          {unlockedCount}/{achievements.length} completed
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-4">
        {achievements.slice(0, 4).map((achievement, index) => {
          const Icon = achievement.icon;

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