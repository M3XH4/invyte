import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsApi } from '@/api/eventsApi';
import { categoryStore, useCategoryStore } from '@/store/categoryStore';
import { createEventStore } from '@/store/createEventStore';
import { eventStore } from '@/store/eventStore';
import { themeStore, useThemeStore } from '@/store/themeStore';
import { imageUriToFormData } from '@/utils/upload';
import {
  mapCreateEventDraftToPayload,
  parseApiValidationErrors,
  validateCreateEventDraft,
  type ValidationErrors,
} from '@/utils/createEventValidation';
import type { Theme as ApiTheme } from '@/types/event';

type ThemeOption = {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: any;
  colors: [string, string, string];
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  mood: string;
  categories: string[];
};

export default function ThemeSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category = 'birthday' } = useLocalSearchParams<{ category?: string }>();
  const themeState = useThemeStore();
  const categoryState = useCategoryStore();
  const draft = createEventStore.get();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(draft.themeId || null);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(!themeState.isInitialLoaded);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (!categoryState.isInitialLoaded) {
      categoryStore.fetchCategories().catch(() => undefined);
    }
  }, [categoryState.isInitialLoaded]);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        setLoadingThemes(true);
        const apiThemes = themeState.isInitialLoaded
          ? themeState.themes
          : await themeStore.fetchThemes();
        setThemes(apiThemes.map((theme) => mapApiTheme(theme)));
      } catch (error: any) {
        setError(error.message || 'Unable to load themes from the backend.');
      } finally {
        setLoadingThemes(false);
      }
    };

    loadThemes();
  }, [category, themeState.isInitialLoaded, themeState.themes]);

  const filteredThemes = useMemo(() => {
    if (selectedFilter === 'all') {
      return themes;
    }

    return themes.filter((theme) => theme.categories.includes('all') || theme.categories.includes(selectedFilter));
  }, [selectedFilter, themes]);

  const filters = useMemo(() => {
    const categoryFilters = categoryState.categories
      .map((item) => ({ id: item.slug, label: item.name }))
      .filter((item) => item.id && item.id !== 'all');
    const themeFilters = Array.from(
      new Set(themes.flatMap((theme) => theme.categories).filter((item) => item && item !== 'all')),
    ).map((item) => ({ id: item, label: capitalize(item) }));
    const filtersById = new Map<string, { id: string; label: string }>();

    [...categoryFilters, ...themeFilters].forEach((item) => {
      if (!filtersById.has(item.id)) filtersById.set(item.id, item);
    });

    return [
      { id: 'all', label: 'All' },
      ...Array.from(filtersById.values()),
    ];
  }, [categoryState.categories, themes]);

  const screenWidth = Dimensions.get('window').width;
  const CARD_GAP = 16;
  const HORIZONTAL_PADDING = 20;
  const cardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

  const handleNext = async () => {
    if (!selectedTheme) return;

    try {
      setSubmitting(true);
      setError('');
      const selectedThemeOption = themes.find((theme) => theme.id === selectedTheme);
      const finalDraft = {
        ...createEventStore.get(),
        themeId: undefined,
        themeSlug: selectedThemeOption?.slug,
      };
      const validationErrors = validateCreateEventDraft(finalDraft);

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setError('Please fix the highlighted event details before creating your event.');
        return;
      }

      setFieldErrors({});
      const payload = mapCreateEventDraftToPayload(finalDraft);

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[create-event] final payload', payload);
      }

      const event = await eventsApi.createEvent(payload);
      eventStore.addEvent(event);

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[create-event] backend response added to store', {
          eventId: event.uuid || event.id,
          title: event.title,
        });
      }

      if (finalDraft.coverImage) {
        try {
          const eventWithCover = await eventsApi.uploadCover(
            event.uuid || event.id,
            imageUriToFormData(
              'cover',
              finalDraft.coverImage,
              finalDraft.localCoverName,
              finalDraft.localCoverType,
            ),
          );
          eventStore.updateEvent(eventWithCover);
        } catch (coverError: any) {
          if (typeof __DEV__ === 'undefined' || __DEV__) {
            console.warn('[create-event] cover upload failed after event creation', {
              message: coverError?.message,
              errors: coverError?.errors,
            });
          }
        }
      }

      createEventStore.reset();
      router.replace({
        pathname: '/invitation-card',
        params: { eventId: event.uuid || event.id },
      });
    } catch (error: any) {
      const validationErrors = parseApiValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
      }

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[create-event] backend validation response', {
          message: error?.message,
          errors: error?.errors,
        });
      }

      setError(error.message || 'Unable to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a0b2e', '#2d1b4e', '#1a0b2e']}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: selectedTheme ? insets.bottom + 120 : insets.bottom + 32,
        }}
      >
        <View className="px-5">
          <View className="mb-6 flex-row items-center">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/create-event-rsvp-settings');
              }}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10"
            >
              <ArrowLeft color="white" size={20} />
            </Pressable>
          </View>

          <View className="mb-6 flex-row items-center justify-center gap-2">
            <View className="h-2 w-2 rounded-full bg-white/30" />
            <View className="h-2 w-2 rounded-full bg-white/30" />
            <View className="h-2 w-2 rounded-full bg-white/30" />
            <View className="h-2 w-2 rounded-full bg-white" />
          </View>

          <View className="mb-8">
            <Text className="mb-2 text-center text-4xl font-black text-white">
              Choose a Theme
            </Text>
            <Text className="text-center text-sm text-white/60">
              Pick a theme that matches your event vibe!
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              paddingBottom: 8,
              marginBottom: 24,
            }}
          >
            {filters.map((filter) => {
              const active = selectedFilter === filter.id;

              return (
                <Pressable
                  key={filter.id}
                  onPress={() => setSelectedFilter(filter.id)}
                  className="overflow-hidden rounded-full"
                >
                  {active ? (
                    <LinearGradient
                      colors={['#9333ea', '#ec4899']}
                      className="rounded-full px-4 py-2"
                    >
                      <Text className="text-sm font-bold text-white">
                        {filter.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View className="rounded-full bg-white/10 px-4 py-2">
                      <Text className="text-sm font-bold text-white/70">
                        {filter.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          {loadingThemes && (
            <View className="mb-4 items-center">
              <ActivityIndicator color="white" />
              <Text className="mt-2 text-xs font-semibold text-white/60">Loading themes from backend...</Text>
            </View>
          )}
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {filteredThemes.map((theme, index) => {
              const Icon = theme.icon;
              const isSelected = selectedTheme === theme.id;

              return (
                <MotiPressable
                  key={theme.id}
                  onPress={() => setSelectedTheme(theme.id)}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={({ pressed }) => {
                    'worklet';
                    return {
                      opacity: 1,
                      scale: pressed ? 0.95 : 1,
                    };
                  }}
                  transition={{
                    type: 'timing',
                    delay: index * 50,
                    duration: 300,
                  }}
                  style={{
                    width: cardWidth,
                    height: 220,
                    borderRadius: 24,
                    overflow: 'hidden',
                    borderWidth: isSelected ? 4 : 0,
                    borderColor: '#facc15',
                    marginBottom: 16,
                  }}
                >
                  <LinearGradient
                    colors={theme.colors}
                    style={{
                      flex: 1,
                      padding: 16,
                    }}
                  >
                    <View className="absolute right-4 top-4 h-24 w-24 rounded-full bg-white/10" />
                    <View className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/10" />

                    <View className="z-10 flex-1 justify-between">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                        <Icon color="white" size={24} strokeWidth={2.5} />
                      </View>

                      <View>
                        <Text
                          numberOfLines={2}
                          className="mb-2 text-base font-black leading-tight text-white"
                        >
                          {theme.name}
                        </Text>

                        <View className="flex-row items-center gap-1.5">
                          <View className="h-6 w-6 rounded-full border-2 border-white/50 bg-white/30" />
                          <View className="h-6 w-6 rounded-full border-2 border-white/50 bg-white/40" />
                          <View className="h-6 w-6 rounded-full border-2 border-white/50 bg-white/50" />
                        </View>
                      </View>

                      {isSelected && (
                        <MotiView
                          from={{ scale: 0, rotate: '-180deg' }}
                          animate={{ scale: 1, rotate: '0deg' }}
                          className="absolute right-0 top-0 h-8 w-8 items-center justify-center rounded-full bg-yellow-400"
                        >
                          <Check color="white" size={20} strokeWidth={3} />
                        </MotiView>
                      )}
                    </View>
                  </LinearGradient>
                </MotiPressable>
              );
            })}
          </View>

          {filteredThemes.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-sm text-white/50">
                {loadingThemes ? 'Waiting for backend themes...' : 'No themes available from the backend'}
              </Text>
              {!loadingThemes && (
                <Pressable
                  onPress={() => themeStore.fetchThemes().then((items) => setThemes(items.map(mapApiTheme)))}
                  className="mt-4 rounded-xl bg-white/10 px-4 py-2"
                >
                  <Text className="text-sm font-bold text-white">Retry</Text>
                </Pressable>
              )}
            </View>
          )}

          {!!error && (
            <View className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3">
              <Text className="text-sm font-semibold text-red-100">{error}</Text>
              {Object.entries(fieldErrors).map(([field, message]) => (
                <Text key={field} className="mt-1 text-xs font-semibold text-red-100">
                  {field}: {message}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {selectedTheme && (
        <MotiView
          from={{ translateY: 100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          className="absolute left-0 right-0 px-5 pt-8"
          style={{
            bottom: 0,
            paddingBottom: insets.bottom + 20,
            backgroundColor: 'rgba(26, 11, 46, 0.95)',
          }}
        >
          <View className="overflow-hidden rounded-2xl">
            <MotiPressable
              disabled={submitting}
              onPress={handleNext}
              animate={({ pressed }) => {
                'worklet';
                return { scale: pressed ? 0.98 : 1 };
              }}
            >
              <LinearGradient
                colors={['#9333ea', '#a855f7', '#ec4899']}
                className="h-14 items-center justify-center"
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-black text-white">Create Event</Text>
                )}
              </LinearGradient>
            </MotiPressable>
          </View>
        </MotiView>
      )}
    </LinearGradient>
  );
}

function mapApiTheme(theme: ApiTheme): ThemeOption {
  const config = theme.config || {};
  const primary = String(config.primary || '#9333ea');
  const accent = String(config.accent || '#ec4899');
  const background = String(config.background || '#1F1B2E');
  const categories = normalizeThemeCategories(config);
  const category = categories[0] || 'all';

  return {
    id: theme.id,
    slug: theme.slug,
    name: theme.name,
    category,
    icon: Sparkles,
    colors: [primary, accent, background] as [string, string, string],
    primaryColor: primary,
    secondaryColor: accent,
    backgroundColor: background,
    mood: 'backend',
    categories,
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
}

function normalizeThemeCategories(config: Record<string, unknown>) {
  const categories = config.categories;

  if (Array.isArray(categories)) {
    return Array.from(new Set(categories.map(String).filter(Boolean)));
  }

  const category = config.category || config.event_category;

  return category ? [String(category)] : ['all'];
}
