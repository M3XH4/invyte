import { ActivityIndicator, RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle,
  Clock,
  Trophy,
  Trash2,
  Users,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sendTestLocalNotification } from '@/services/pushNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { notifications, loading, refreshing, error, unreadCount, refresh, markAllAsRead } = useNotifications();
  const push = usePushNotifications();

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const hasNotifications = safeNotifications.length > 0;

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
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
              <Pressable onPress={markAllAsRead} className="flex-row items-center gap-1">
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

          <View className={`mb-5 rounded-2xl border p-4 shadow-sm ${theme.surface}`}>
            <View className="mb-4 flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className={`text-base font-black ${theme.headerText}`}>Device Push</Text>
                <Text className={`mt-1 text-sm ${theme.subText}`}>
                  {push.statusMessage || (push.enabled ? 'This device is set to receive alerts.' : 'Push notifications are off on this device.')}
                </Text>
              </View>
              <Pressable
                onPress={() => push.toggle(!push.enabled)}
                className={`rounded-xl px-4 py-2 ${push.enabled ? 'bg-emerald-500' : 'bg-purple-600'}`}
              >
                <Text className="text-sm font-black text-white">{push.enabled ? 'On' : 'Enable'}</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={sendTestLocalNotification}
              className={`h-11 items-center justify-center rounded-xl border ${theme.surfaceMuted}`}
            >
              <Text className={`text-sm font-black ${theme.textOnSurface}`}>Send Test Notification</Text>
            </Pressable>
          </View>

          {loading && (
            <View className={`mb-5 rounded-2xl border p-5 ${theme.surface}`}>
              <ActivityIndicator color="#9333ea" />
              <Text className={`mt-2 text-center text-sm font-semibold ${theme.subText}`}>Loading notifications...</Text>
            </View>
          )}

          {!!error && (
            <View className={`mb-5 rounded-2xl border p-4 ${theme.surface}`}>
              <Text className="text-sm font-semibold text-red-500">{error}</Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && !hasNotifications && (
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
              const config = getNotificationConfig(notification.type);
              const IconComponent = config.icon;
              const unread = notification.unread || !notification.is_read;

              return (
                <MotiView
                  key={notification.id}
                  from={{ opacity: 0, translateX: -50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: 'timing',
                    delay: index * 50,
                  }}
                  className={`relative overflow-hidden rounded-xl border p-3 ${unread
                    ? (theme.isDarkMode ? 'border-fuchsia-400/20 bg-fuchsia-400/10' : 'border-purple-200 bg-purple-50')
                    : theme.surface
                    }`}
                >
                  <View
                    className="absolute bottom-0 left-0 top-0 w-1"
                    style={{ backgroundColor: config.color }}
                  />

                  <View className="flex-row items-start gap-3 pl-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                      style={{ backgroundColor: notification.color || config.color }}
                    >
                      <IconComponent color="white" size={20} strokeWidth={2} />
                    </View>

                    <View className="min-w-0 flex-1">
                      <View className="mb-1 flex-row items-start justify-between gap-2">
                        <Text className={`flex-1 text-sm font-semibold ${theme.headerText}`}>
                          {notification.title}
                        </Text>

                        {unread && (
                          <View className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                        )}
                      </View>

                      <Text className={`mb-1.5 text-xs ${theme.subText}`}>
                        {notification.message}
                      </Text>

                      <Text className={`text-[10px] ${theme.mutedText}`}>
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
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

function getNotificationConfig(type?: string) {
  const configs: Record<string, { icon: any; color: string }> = {
    rsvp_submitted: { icon: CheckCircle, color: '#22c55e' },
    event_reminder: { icon: Clock, color: '#f59e0b' },
    event_updated: { icon: Bell, color: '#9333ea' },
    guest_invited: { icon: Users, color: '#2563eb' },
    achievement: { icon: Trophy, color: '#f97316' },
  };

  return configs[type || ''] || { icon: Bell, color: '#9333ea' };
}
