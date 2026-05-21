import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Briefcase,
  Cake,
  Check,
  CloudSun,
  Crown,
  Flame,
  Flower2,
  Gamepad,
  Gamepad2,
  Heart,
  Music,
  Palmtree,
  PartyPopper,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Theme = {
  id: string;
  name: string;
  category: string;
  icon: any;
  colors: [string, string, string];
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  mood: string;
};

const allThemes: Theme[] = [
  {
    id: 'cartoon-party',
    name: 'Cartoon Party',
    category: 'birthday',
    icon: PartyPopper,
    colors: ['#facc15', '#fb923c', '#ef4444'],
    primaryColor: '#FBBF24',
    secondaryColor: '#3B82F6',
    backgroundColor: '#FEF3C7',
    mood: 'playful',
  },
  {
    id: 'neon-birthday',
    name: 'Neon Birthday',
    category: 'birthday',
    icon: Zap,
    colors: ['#9333ea', '#ec4899', '#22d3ee'],
    primaryColor: '#A855F7',
    secondaryColor: '#EC4899',
    backgroundColor: '#1F1B2E',
    mood: 'vibrant',
  },
  {
    id: 'superhero-birthday',
    name: 'Superhero Birthday',
    category: 'birthday',
    icon: Flame,
    colors: ['#dc2626', '#2563eb', '#eab308'],
    primaryColor: '#DC2626',
    secondaryColor: '#2563EB',
    backgroundColor: '#FEE2E2',
    mood: 'bold',
  },
  {
    id: 'princess-theme',
    name: 'Princess Theme',
    category: 'birthday',
    icon: Crown,
    colors: ['#f472b6', '#c084fc', '#ec4899'],
    primaryColor: '#F472B6',
    secondaryColor: '#C084FC',
    backgroundColor: '#FCE7F3',
    mood: 'elegant',
  },
  {
    id: 'arcade-party',
    name: 'Arcade Party',
    category: 'birthday',
    icon: Gamepad,
    colors: ['#4f46e5', '#9333ea', '#db2777'],
    primaryColor: '#4F46E5',
    secondaryColor: '#DB2777',
    backgroundColor: '#EDE9FE',
    mood: 'retro',
  },
  {
    id: 'candyland',
    name: 'Candyland',
    category: 'birthday',
    icon: Sparkles,
    colors: ['#ec4899', '#fb7185', '#fb923c'],
    primaryColor: '#EC4899',
    secondaryColor: '#FB923C',
    backgroundColor: '#FFF1F2',
    mood: 'sweet',
  },
  {
    id: 'space-adventure',
    name: 'Space Adventure',
    category: 'birthday',
    icon: Rocket,
    colors: ['#312e81', '#6d28d9', '#1e3a8a'],
    primaryColor: '#312E81',
    secondaryColor: '#6366F1',
    backgroundColor: '#1E1B4B',
    mood: 'cosmic',
  },
  {
    id: 'balloon-festival',
    name: 'Balloon Festival',
    category: 'birthday',
    icon: Cake,
    colors: ['#22d3ee', '#60a5fa', '#a855f7'],
    primaryColor: '#22D3EE',
    secondaryColor: '#A855F7',
    backgroundColor: '#ECFEFF',
    mood: 'cheerful',
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    category: 'wedding',
    icon: Crown,
    colors: ['#fef3c7', '#fde68a', '#fcd34d'],
    primaryColor: '#F59E0B',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#FFFBEB',
    mood: 'luxurious',
  },
  {
    id: 'garden-wedding',
    name: 'Garden Wedding',
    category: 'wedding',
    icon: Flower2,
    colors: ['#86efac', '#34d399', '#14b8a6'],
    primaryColor: '#10B981',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#ECFDF5',
    mood: 'natural',
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    category: 'wedding',
    icon: Heart,
    colors: ['#f3f4f6', '#e5e7eb', '#d1d5db'],
    primaryColor: '#FFFFFF',
    secondaryColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
    mood: 'clean',
  },
  {
    id: 'party-neon',
    name: 'Neon Party',
    category: 'party',
    icon: Zap,
    colors: ['#9333ea', '#ec4899', '#22d3ee'],
    primaryColor: '#A855F7',
    secondaryColor: '#22D3EE',
    backgroundColor: '#1F1B2E',
    mood: 'electric',
  },
  {
    id: 'party-tropical',
    name: 'Tropical Party',
    category: 'party',
    icon: Palmtree,
    colors: ['#4ade80', '#14b8a6', '#06b6d4'],
    primaryColor: '#4ADE80',
    secondaryColor: '#06B6D4',
    backgroundColor: '#ECFDF5',
    mood: 'fun',
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    category: 'meeting',
    icon: Briefcase,
    colors: ['#2563eb', '#4f46e5', '#1d4ed8'],
    primaryColor: '#2563EB',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#EFF6FF',
    mood: 'professional',
  },
  {
    id: 'neon-arena',
    name: 'Neon Arena',
    category: 'gaming',
    icon: Gamepad2,
    colors: ['#ec4899', '#9333ea', '#4f46e5'],
    primaryColor: '#EC4899',
    secondaryColor: '#6366F1',
    backgroundColor: '#1E1B2E',
    mood: 'electric',
  },
  {
    id: 'festival-lights',
    name: 'Festival Lights',
    category: 'concert',
    icon: Music,
    colors: ['#facc15', '#ec4899', '#9333ea'],
    primaryColor: '#FBBF24',
    secondaryColor: '#EC4899',
    backgroundColor: '#1E1B2E',
    mood: 'energetic',
  },
  {
    id: 'peaceful-memorial',
    name: 'Peaceful Memorial',
    category: 'funeral',
    icon: Flower2,
    colors: ['#cbd5e1', '#9ca3af', '#71717a'],
    primaryColor: '#64748B',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#F8FAFC',
    mood: 'peaceful',
  },
  {
    id: 'sunset-wedding',
    name: 'Sunset Wedding',
    category: 'wedding',
    icon: CloudSun,
    colors: ['#fb923c', '#fb7185', '#a855f7'],
    primaryColor: '#FB923C',
    secondaryColor: '#F472B6',
    backgroundColor: '#FFF7ED',
    mood: 'warm',
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'party', label: 'Party' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'concert', label: 'Concert' },
  { id: 'funeral', label: 'Memorial' },
];

export default function ThemeSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category = 'birthday' } = useLocalSearchParams<{ category?: string }>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const filteredThemes = useMemo(() => {
    if (selectedFilter === 'all') {
      return allThemes.filter((theme) => theme.category === category);
    }

    return allThemes.filter((theme) => theme.category === selectedFilter);
  }, [selectedFilter, category]);

  const screenWidth = Dimensions.get('window').width;
  const CARD_GAP = 16;
  const HORIZONTAL_PADDING = 20;
  const cardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

  const handleNext = () => {
    if (!selectedTheme) return;

    router.replace(
      `/invitation-card?theme=${selectedTheme}&category=${category}`
    );
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
                No themes available for this category
              </Text>
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
                <Text className="text-base font-black text-white">Next</Text>
              </LinearGradient>
            </MotiPressable>
          </View>
        </MotiView>
      )}
    </LinearGradient>
  );
}