import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { guestEventStore, useGuestEventStore } from '@/store/guestEventStore';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dateTime';

export default function GuestEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const state = useGuestEventStore();

  useEffect(() => {
    if (!state.loaded && !state.loading) {
      guestEventStore.fetchGuestEvents().catch(() => undefined);
    }
  }, [state.loaded, state.loading]);

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 36 }}
      >
        <View className="px-6">
          <View className="mb-6 flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/tabs/profile');
              }}
              className={`h-11 w-11 items-center justify-center rounded-2xl border ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>
            <View>
              <Text className={`text-2xl font-black ${theme.headerText}`}>Invited Events</Text>
              <Text className={`text-sm font-semibold ${theme.subText}`}>Events where you are a guest</Text>
            </View>
          </View>

          {state.loading && state.events.length === 0 ? (
            <View className={`items-center rounded-[28px] border p-8 ${theme.surface}`}>
              <ActivityIndicator color="#9333ea" />
              <Text className={`mt-3 text-sm font-semibold ${theme.subText}`}>Loading guest events...</Text>
            </View>
          ) : state.events.length === 0 ? (
            <View className={`rounded-[28px] border p-6 ${theme.surface}`}>
              <Text className={`text-lg font-black ${theme.textOnSurface}`}>No guest events yet</Text>
              <Text className={`mt-2 text-sm font-semibold ${theme.subText}`}>
                RSVP to an invitation using your account email to see it here.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {state.events.map((item) => {
                const event = item.event;
                return (
                  <Pressable
                    key={`${event.uuid || event.id}-${(item.guest as any)?.uuid || (item.guest as any)?.id}`}
                    onPress={() =>
                      router.push({
                        pathname: '/guest-event-details',
                        params: { eventId: event.uuid || event.id },
                      })
                    }
                    className={`rounded-[24px] border p-4 ${theme.surface}`}
                  >
                    <View className="flex-row items-start gap-3">
                      <LinearGradient colors={['#9333ea', '#ec4899']} className="h-12 w-12 items-center justify-center rounded-2xl">
                        <Calendar color="white" size={22} />
                      </LinearGradient>
                      <View className="flex-1">
                        <Text className={`text-base font-black ${theme.textOnSurface}`}>{event.title}</Text>
                        <View className="mt-2 flex-row items-center gap-2">
                          <Clock color={theme.chevronColor} size={14} />
                          <Text className={`text-xs font-semibold ${theme.subText}`}>
                            {formatDateForDisplay(event.date || event.start_date || '')} • {formatTimeForDisplay(event.time || event.start_time || '')}
                          </Text>
                        </View>
                        <View className="mt-1 flex-row items-center gap-2">
                          <MapPin color={theme.chevronColor} size={14} />
                          <Text numberOfLines={1} className={`flex-1 text-xs font-semibold ${theme.subText}`}>
                            {event.location || event.venue_address || 'Event location'}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={theme.chevronColor} size={20} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
