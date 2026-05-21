import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle,
  Clock,
  HelpCircle,
  Trophy,
  Trash2,
  Users,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  color: string;
  icon: typeof Bell;
};

const notifications: NotificationItem[] = [
  {
    id: 1,
    icon: CheckCircle,
    title: 'Alex accepted your invitation!',
    message: "Alex is going to Sarah's Birthday Bash",
    time: '5 minutes ago',
    unread: true,
    color: '#22c55e',
  }
];

const fallbackNotifications: NotificationItem[] = [];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();

  const safeNotifications = notifications.length > 0 ? notifications : fallbackNotifications;
  const unreadCount = notifications.filter((item) => item.unread).length;
  const hasNotifications = safeNotifications.length > 0;

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View className="px-5">
          {/* Header */}
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.back()}
                className={`h-10 w-10 items-center justify-center rounded-xl border ${theme.iconButton}`}
              >
                <ArrowLeft color={theme.iconColor} size={20} />
              </Pressable>

              <Text className={`text-2xl font-black ${theme.headerText}`}>
                Notifications
              </Text>
            </View>

            {hasNotifications && (
              <Pressable className="flex-row items-center gap-1">
                <CheckCheck color="#9333ea" size={16} />
                <Text className="text-xs font-semibold text-purple-600">
                  Mark all
                </Text>
              </Pressable>
            )}
          </View>

          {/* Unread Count */}
          {hasNotifications && (
            <View className={`mb-5 rounded-2xl border p-4 shadow-sm ${theme.surface}`}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`text-xs ${theme.subText}`}>
                    Unread notifications
                  </Text>
                  <Text className={`text-3xl font-bold ${theme.headerText}`}>
                    {unreadCount}
                  </Text>
                </View>

                <LinearGradient
                  colors={['#9333ea', '#ec4899']}
                  className="h-14 w-14 items-center justify-center rounded-2xl"
                >
                  <Bell color="white" size={28} />
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Empty State */}
          {!hasNotifications && (
            <View className={`mt-20 items-center rounded-3xl border p-8 shadow-sm ${theme.surface}`}>
              <View className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${theme.surfaceMuted}`}>
                <Bell color="#9333ea" size={36} />
              </View>

              <Text className={`mb-2 text-xl font-black ${theme.headerText}`}>
                No notifications yet
              </Text>

              <Text className={`text-center text-sm leading-5 ${theme.subText}`}>
                You’ll see RSVP updates, reminders, and event activity here.
              </Text>
            </View>
          )}

          {/* Notifications List */}
          <View className="gap-3">
            {safeNotifications.map((notification: any, index: number) => {
              const IconComponent = notification.icon;

              return (
                <MotiView
                  key={notification.id}
                  from={{ opacity: 0, translateX: -50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: 'timing',
                    delay: index * 50,
                  }}
                  className={`relative overflow-hidden rounded-xl border p-3 ${notification.unread
                    ? (theme.isDarkMode ? 'border-fuchsia-400/20 bg-fuchsia-400/10' : 'border-purple-200 bg-purple-50')
                    : theme.surface
                    }`}
                >
                  <View
                    className="absolute bottom-0 left-0 top-0 w-1"
                    style={{ backgroundColor: notification.color }}
                  />

                  <View className="flex-row items-start gap-3 pl-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                      style={{ backgroundColor: notification.color }}
                    >
                      <IconComponent color="white" size={20} strokeWidth={2} />
                    </View>

                    <View className="min-w-0 flex-1">
                      <View className="mb-1 flex-row items-start justify-between gap-2">
                        <Text className={`flex-1 text-sm font-semibold ${theme.headerText}`}>
                          {notification.title}
                        </Text>

                        {notification.unread && (
                          <View className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                        )}
                      </View>

                      <Text className={`mb-1.5 text-xs ${theme.subText}`}>
                        {notification.message}
                      </Text>

                      <Text className={`text-[10px] ${theme.mutedText}`}>
                        {notification.time}
                      </Text>
                    </View>

                    <Pressable className="h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                      <Trash2 color="#f87171" size={16} />
                    </Pressable>
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