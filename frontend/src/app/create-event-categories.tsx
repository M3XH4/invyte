import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { categoryStore, useCategoryStore } from '@/store/categoryStore';
import { createEventStore } from '@/store/createEventStore';
import type { EventCategory } from '@/types/event';

const birthdayIcon = require('@/assets/images/transparent-birthday-icon.png');
const weddingIcon = require('@/assets/images/transparent-wedding-icon.png');
const partyIcon = require('@/assets/images/transparent-party-icon.png');
const meetingIcon = require('@/assets/images/transparent-meeting-icon.png');
const seminarIcon = require('@/assets/images/transparent-seminar-icon.png');
const reunionIcon = require('@/assets/images/transparent-reunion-icon.png');
const funeralIcon = require('@/assets/images/transparent-funeral-icon.png');

type CategoryOption = {
  id: string;
  name: string;
  icon: any;
  colors: string[];
};

const categoryDisplay: Record<string, { icon: any; colors: string[] }> = {
  birthday: { icon: birthdayIcon, colors: ['#f472b6', '#db2777'] },
  wedding: { icon: weddingIcon, colors: ['#c084fc', '#9333ea'] },
  party: { icon: partyIcon, colors: ['#fb923c', '#ea580c'] },
  meeting: { icon: meetingIcon, colors: ['#22d3ee', '#0891b2'] },
  seminar: { icon: seminarIcon, colors: ['#818cf8', '#4f46e5'] },
  reunion: { icon: reunionIcon, colors: ['#4ade80', '#16a34a'] },
  funeral: { icon: funeralIcon, colors: ['#6b7280', '#374151'] },
};

export default function CreateEventCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const categoryState = useCategoryStore();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(!categoryState.isInitialLoaded);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError('');
      const apiCategories = categoryState.isInitialLoaded && !refresh
        ? categoryState.categories
        : await categoryStore.fetchCategories({ refresh });
      setCategories(apiCategories.map(mapCategory));
    } catch (error: any) {
      setError(error.message || 'Unable to load categories.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryState.categories, categoryState.isInitialLoaded]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategorySelect = (categoryId: string) => {
    createEventStore.reset({ categorySlug: categoryId });
    router.push(`/create-event-details?category=${categoryId}`);
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-56 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-24 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadCategories(true)} />}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="px-5">
          <View className="mb-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/tabs');
                }
              }}
              className={`h-10 w-10 items-center justify-center rounded-full shadow-sm ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>
          </View>

          <View className="mb-8">
            <Text className={`mb-2 text-3xl font-black ${theme.headerText}`}>
              What type of event
            </Text>
            <Text className={`mb-3 text-3xl font-black ${theme.headerText}`}>
              are you creating?
            </Text>
            <Text className={`text-sm ${theme.subText}`}>
              Choose a category to get started
            </Text>
          </View>

          <View className="mb-8 flex-row items-center justify-center gap-2">
            <View className="h-2 w-2 rounded-full bg-purple-600" />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
          </View>

          <View className="flex-row flex-wrap gap-4">
            {loading && (
              <View className="w-full items-center py-8">
                <ActivityIndicator color="#9333ea" />
                <Text className={`mt-2 text-sm font-semibold ${theme.subText}`}>Loading categories...</Text>
              </View>
            )}

            {!!error && (
              <View className={`mb-4 w-full rounded-2xl border p-4 ${theme.surface}`}>
                <Text className="text-sm font-semibold text-red-500">{error}</Text>
                <Pressable onPress={() => loadCategories(true)} className="mt-3 self-start rounded-xl bg-purple-600 px-4 py-2">
                  <Text className="text-sm font-bold text-white">Retry</Text>
                </Pressable>
              </View>
            )}

            {!loading && !error && categories.length === 0 && (
              <View className={`w-full items-center rounded-2xl border p-6 ${theme.surface}`}>
                <Text className={`text-center text-base font-black ${theme.headerText}`}>
                  No categories available
                </Text>
                <Text className={`mt-2 text-center text-sm ${theme.subText}`}>
                  Please seed or create event categories in the backend first.
                </Text>
              </View>
            )}

            {categories.map((category, index) => (
              <MotiView
                key={category.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'timing',
                  delay: index * 50,
                  duration: 300,
                }}
                style={{
                  width: '47%',
                }}
              >
                <Pressable
                  onPress={() => handleCategorySelect(category.id)}
                  className="overflow-hidden rounded-3xl shadow-lg"
                >
                  <LinearGradient
                    colors={category.colors as [string, string]}
                    className="relative h-[160px] items-center justify-center p-6"
                  >
                    <View className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/20" />

                    <Image
                      source={category.icon}
                      className="mb-3 h-16 w-16"
                      resizeMode="contain"
                    />

                    <Text className="text-base font-black text-white">
                      {category.name}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function mapCategory(category: EventCategory) {
  const display = categoryDisplay[category.slug] || {
    icon: meetingIcon,
    colors: ['#94a3b8', '#475569'],
  };

  return {
    id: category.slug,
    name: category.name,
    icon: display.icon,
    colors: category.color ? [category.color, darken(category.color)] : display.colors,
  };
}

function darken(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#475569';

  const value = Number.parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((value >> 16) & 255) - 50);
  const g = Math.max(0, ((value >> 8) & 255) - 50);
  const b = Math.max(0, (value & 255) - 50);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
