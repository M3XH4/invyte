import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Award, Calendar, Crown, Star, Target, Trophy, Users, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { profileApi, type ProfileStats } from '@/api/profileApi';
import { useScreenTheme } from '@/hooks/use-screen-theme';
import { buildAchievements } from '@/utils/achievements';
import type { Achievement } from '@/types/achievement';

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const loadStats = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError('');
      setStats(await profileApi.stats());
    } catch (error: any) {
      setError(error.message || 'Unable to load achievements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const achievements = buildAchievements(stats);
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  const nextAchievement = achievements
    .filter((achievement) => !achievement.unlocked)
    .sort((a, b) => b.progress / b.target - a.progress / a.target)[0];
  const visibleAchievements = achievements.filter((achievement) => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadStats(true)} />}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}
      >
        <View className="px-5">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className={`h-11 w-11 items-center justify-center rounded-2xl border ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>
            <Text className={`text-2xl font-black ${theme.headerText}`}>Achievements</Text>
            <View className="h-11 w-11" />
          </View>

          <View className={`mb-5 rounded-[24px] border p-5 ${theme.surface}`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-sm font-bold ${theme.subText}`}>Completed</Text>
                <Text className={`mt-1 text-4xl font-black ${theme.headerText}`}>
                  {unlocked}/{achievements.length}
                </Text>
              </View>
              {loading && <ActivityIndicator color="#9333ea" />}
            </View>
            {!!error && <Text className="mt-3 text-sm font-semibold text-red-500">{error}</Text>}
            {nextAchievement && (
              <View className={`mt-4 rounded-2xl p-4 ${theme.surfaceMuted}`}>
                <Text className={`text-xs font-black uppercase ${theme.subText}`}>Next Badge</Text>
                <Text className={`mt-1 text-base font-black ${theme.textOnSurface}`}>{nextAchievement.title}</Text>
                <Text className={`mt-1 text-sm ${theme.subText}`}>
                  {nextAchievement.target - nextAchievement.progress} more to unlock
                </Text>
              </View>
            )}
          </View>

          <View className="mb-5 flex-row gap-2">
            {(['all', 'unlocked', 'locked'] as const).map((item) => {
              const active = filter === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  className={`flex-1 rounded-2xl border py-3 ${active ? 'border-purple-500 bg-purple-500/10' : theme.surface}`}
                >
                  <Text className={`text-center text-sm font-black ${active ? 'text-purple-600' : theme.textOnSurface}`}>
                    {item === 'all' ? 'All' : item === 'unlocked' ? 'Unlocked' : 'Locked'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mb-5 flex-row gap-3">
            <MiniStat label="Events" value={stats?.events_hosted ?? 0} />
            <MiniStat label="Guests" value={stats?.guests_invited ?? 0} />
            <MiniStat label="Rate" value={stats?.attendance_rate ?? '0%'} />
          </View>

          <View className="gap-4">
            {visibleAchievements.map((achievement, index) => {
              const Icon = achievementIcon(achievement);
              const progress = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));

              return (
                <MotiView
                  key={achievement.id}
                  from={{ opacity: 0, translateY: 12 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', delay: index * 50 }}
                  className={`overflow-hidden rounded-[24px] border ${theme.surface}`}
                >
                  <View className="p-4">
                    <View className="flex-row items-center gap-4">
                      <LinearGradient
                        colors={achievement.colors}
                        className="h-14 w-14 items-center justify-center rounded-2xl"
                      >
                        <Icon color="white" size={26} />
                      </LinearGradient>

                      <View className="flex-1">
                        <View className="mb-1 flex-row items-center justify-between">
                          <Text className={`text-base font-black ${theme.textOnSurface}`}>
                            {achievement.title}
                          </Text>
                          <Text className={`text-xs font-black ${achievement.unlocked ? 'text-emerald-500' : theme.mutedText}`}>
                            {achievement.unlocked ? 'Unlocked' : `${achievement.progress}/${achievement.target}`}
                          </Text>
                        </View>

                        <Text className={`mb-3 text-sm ${theme.subText}`}>{achievement.description}</Text>

                        <View className={`h-2 overflow-hidden rounded-full ${theme.surfaceMuted}`}>
                          <View
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </MotiView>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  const theme = useScreenTheme();

  return (
    <View className={`flex-1 rounded-2xl border p-4 ${theme.surface}`}>
      <Text className={`text-xl font-black ${theme.headerText}`}>{value}</Text>
      <Text className={`text-xs font-bold ${theme.subText}`}>{label}</Text>
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
