import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

const birthdayIcon = require('@/assets/images/transparent-birthday-icon.png');
const weddingIcon = require('@/assets/images/transparent-wedding-icon.png');
const partyIcon = require('@/assets/images/transparent-party-icon.png');
const meetingIcon = require('@/assets/images/transparent-meeting-icon.png');
const seminarIcon = require('@/assets/images/transparent-seminar-icon.png');
const reunionIcon = require('@/assets/images/transparent-reunion-icon.png');
const funeralIcon = require('@/assets/images/transparent-funeral-icon.png');

const categories = [
  { id: 'birthday', name: 'Birthday', icon: birthdayIcon, colors: ['#f472b6', '#db2777'] },
  { id: 'wedding', name: 'Wedding', icon: weddingIcon, colors: ['#c084fc', '#9333ea'] },
  { id: 'party', name: 'Party', icon: partyIcon, colors: ['#fb923c', '#ea580c'] },
  { id: 'meeting', name: 'Meeting', icon: meetingIcon, colors: ['#22d3ee', '#0891b2'] },
  { id: 'seminar', name: 'Seminar', icon: seminarIcon, colors: ['#818cf8', '#4f46e5'] },
  { id: 'reunion', name: 'Reunion', icon: reunionIcon, colors: ['#4ade80', '#16a34a'] },
  { id: 'funeral', name: 'Funeral', icon: funeralIcon, colors: ['#6b7280', '#374151'] },
  { id: 'concert', name: 'Concert', icon: partyIcon, colors: ['#fb7185', '#e11d48'] },
  { id: 'sports', name: 'Sports', icon: meetingIcon, colors: ['#60a5fa', '#2563eb'] },
  { id: 'gaming', name: 'Gaming', icon: partyIcon, colors: ['#a78bfa', '#7c3aed'] },
  { id: 'graduation', name: 'Graduation', icon: seminarIcon, colors: ['#facc15', '#ca8a04'] },
  { id: 'other', name: 'Other', icon: meetingIcon, colors: ['#94a3b8', '#475569'] },
];

export default function CreateEventCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/create-event-details?category=${categoryId}`);
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-56 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-24 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
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