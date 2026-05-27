import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  Award,
  ChevronRight,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/context/theme-context';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { resolveMediaUrl } from '@/utils/media';
import { getPreference } from '@/utils/preferences';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scheme, setScheme } = useAppTheme();
  const { user, logout } = useAuth();
  const push = usePushNotifications();

  const [language, setLanguage] = useState('English (US)');
  const darkMode = scheme === 'dark';

  useEffect(() => {
    getPreference('invyte_language').then((stored) => {
      if (stored) setLanguage(stored);
    });
  }, []);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          icon: User,
          label: 'Edit Profile',
          description: 'Update your personal info',
          colors: ['#c084fc', '#9333ea'],
          route: '/edit-profile',
        },
        {
          id: 'achievements',
          icon: Award,
          label: 'Achievements',
          description: 'View badges and progress',
          colors: ['#facc15', '#f97316'],
          route: '/achievements',
        },
        {
          id: 'privacy',
          icon: Lock,
          label: 'Privacy & Security',
          description: 'Manage your account security',
          colors: ['#22d3ee', '#0891b2'],
          route: '/privacy-security',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          icon: Bell,
          label: 'Notifications',
          description: 'Event reminders and updates',
          colors: ['#f472b6', '#db2777'],
          toggle: true,
          value: push.enabled,
          onChange: push.toggle,
        },
        {
          id: 'theme',
          icon: darkMode ? Moon : Sun,
          label: 'Appearance',
          description: darkMode ? 'Dark mode enabled' : 'Light mode enabled',
          colors: ['#fb923c', '#ea580c'],
          toggle: true,
          value: darkMode,
          onChange: (value: boolean) => setScheme(value ? 'dark' : 'light'),
        },
        {
          id: 'language',
          icon: Globe,
          label: 'Language',
          description: language,
          colors: ['#4ade80', '#16a34a'],
          route: '/language',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help and support',
          colors: ['#818cf8', '#4f46e5'],
          route: '/help-center',
        },
      ],
    },
  ];

  return (
    <View className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-[#F7F7FB]'}`}>
      <View className="absolute right-10 top-20 h-64 w-64 rounded-full bg-purple-400/10" />
      <View className="absolute left-5 top-60 h-56 w-56 rounded-full bg-pink-400/10" />
      <View className="absolute bottom-40 right-8 h-48 w-48 rounded-full bg-blue-400/10" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View className="px-6">
          {/* Header */}
          <View className="mb-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/tabs/profile');
              }}
              className={`h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
                darkMode
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <ArrowLeft
                color={darkMode ? '#e5e7eb' : '#374151'}
                size={20}
              />
            </Pressable>

            <Text
              className={`text-2xl font-black ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Settings
            </Text>

            <View className="h-11 w-11" />
          </View>

          {/* Profile Card */}
          <MotiView
            from={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            className="mb-8 overflow-hidden rounded-[32px]"
          >
            <LinearGradient
              colors={['#a855f7', '#9333ea', '#db2777']}
              className="relative p-5"
            >
              <View className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-400/30" />
              <View className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-400/20" />

              <View className="z-10 flex-row items-center gap-4">
                <Image
                  source={{
                    uri: resolveMediaUrl(user?.avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Invyte'),
                  }}
                  className="h-14 w-14 rounded-full"
                />

                <View className="flex-1">
                  <Text className="mb-0.5 text-xl font-black text-white">
                    {user?.name || 'Guest User'}
                  </Text>
                  <Text className="text-sm font-medium text-white/70">
                    {user?.username ? `@${user.username.replace('@', '')}` : user?.email || 'Sign in to sync settings'}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push('/edit-profile' as any)}
                  className="rounded-xl border border-white/30 bg-white/20 px-4 py-2"
                >
                  <Text className="text-sm font-bold text-white">Edit</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </MotiView>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={section.title} className="mb-6">
              <Text
                className={`mb-3 px-1 text-sm font-black uppercase tracking-wide ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {section.title}
              </Text>

              <View className="gap-3">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;

                  return (
                    <MotiView
                      key={item.id}
                      from={{ opacity: 0, translateX: -10 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        type: 'timing',
                        delay: sectionIndex * 100 + itemIndex * 50,
                        duration: 300,
                      }}
                    >
                      <Pressable
                        disabled={item.toggle}
                        onPress={() =>
                          item.route &&
                          router.push(item.route as Parameters<typeof router.push>[0])
                        }
                        className={`rounded-[24px] border p-4 shadow-sm ${
                          darkMode
                            ? 'border-gray-700 bg-gray-800'
                            : 'border-gray-100 bg-white'
                        }`}
                      >
                        <View className="flex-row items-center gap-4">
                          <LinearGradient
                            colors={item.colors as [string, string]}
                            className="h-12 w-12 items-center justify-center"
                            style={{ borderRadius: 12 }}
                          >
                            <Icon color="white" size={24} strokeWidth={2.5} />
                          </LinearGradient>

                          <View className="min-w-0 flex-1">
                            <Text
                              className={`mb-0.5 text-base font-black ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {item.label}
                            </Text>

                            <Text
                              className={`text-sm font-medium ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {item.description}
                            </Text>
                          </View>

                          {item.toggle ? (
                            <Switch
                              value={item.value}
                              onValueChange={item.onChange}
                              trackColor={{
                                false: darkMode ? '#4b5563' : '#d1d5db',
                                true: '#9333ea',
                              }}
                              thumbColor="#ffffff"
                            />
                          ) : (
                            <ChevronRight
                              color={darkMode ? '#6b7280' : '#9ca3af'}
                              size={20}
                              strokeWidth={2.5}
                            />
                          )}
                        </View>
                      </Pressable>
                    </MotiView>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Logout */}
          <MotiPressable
            onPress={logout}
            from={{ opacity: 0, translateY: 10 }}
            animate={({ pressed }) => {
              'worklet';
              return {
                scale: pressed ? 0.98 : 1,
                opacity: 1,
                translateY: 0,
              };
            }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ marginTop: 32, borderRadius: 24, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#ef4444', '#e11d48']}
              className="flex-row items-center justify-center gap-3 p-4"
            >
              <LogOut color="white" size={20} strokeWidth={2.5} />
              <Text className="text-base font-black text-white">
                Log Out
              </Text>
            </LinearGradient>
          </MotiPressable>

          <Text
            className={`mt-8 text-center text-xs font-semibold ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            Invyte App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
