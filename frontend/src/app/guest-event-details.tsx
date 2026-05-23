import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { guestEventStore, useGuestEventStore } from '@/store/guestEventStore';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dateTime';
import { displayGuestStatus } from '@/utils/rsvpStats';

export default function GuestEventDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const state = useGuestEventStore();

  useEffect(() => {
    if (!state.loaded && !state.loading) {
      guestEventStore.fetchGuestEvents().catch(() => undefined);
    }
  }, [state.loaded, state.loading]);

  const item = useMemo(
    () => state.events.find((entry) => entry.event.id === eventId || entry.event.uuid === eventId),
    [eventId, state.events],
  );
  const event = item?.event;
  const guest = item?.guest as any;

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 36 }}
      >
        <View className="px-6">
          <View className="mb-6 flex-row items-center gap-3">
            <Pressable onPress={() => router.back()} className={`h-11 w-11 items-center justify-center rounded-2xl border ${theme.iconButton}`}>
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>
            <Text className={`text-xl font-black ${theme.headerText}`}>Guest Event</Text>
          </View>

          {state.loading && !event ? (
            <View className={`items-center rounded-[28px] border p-8 ${theme.surface}`}>
              <ActivityIndicator color="#9333ea" />
              <Text className={`mt-3 text-sm font-semibold ${theme.subText}`}>Loading event...</Text>
            </View>
          ) : !event ? (
            <View className={`rounded-[28px] border p-6 ${theme.surface}`}>
              <Text className={`text-lg font-black ${theme.textOnSurface}`}>Event not found</Text>
            </View>
          ) : (
            <View className="gap-4">
              <View className={`rounded-[28px] border p-5 ${theme.surface}`}>
                <Text className={`mb-3 text-2xl font-black ${theme.textOnSurface}`}>{event.title}</Text>
                <Info icon={Calendar} text={formatDateForDisplay(event.date || event.start_date || '') || 'Event date'} />
                <Info icon={Clock} text={formatTimeForDisplay(event.time || event.start_time || '') || 'Event time'} />
                <Info icon={MapPin} text={event.location || event.venue_address || 'Event location'} />
                {!!event.description && <Text className={`mt-4 text-sm font-semibold leading-5 ${theme.subText}`}>{event.description}</Text>}
              </View>

              <View className={`rounded-[28px] border p-5 ${theme.surface}`}>
                <Text className={`mb-3 text-lg font-black ${theme.textOnSurface}`}>Your RSVP</Text>
                <Info icon={CheckCircle} text={displayGuestStatus(guest?.response_status || guest?.status)} />
                <Info icon={Users} text={`${guest?.plus_ones ?? 0} plus ones`} />
              </View>

              {item.permissions.can_view_guest_list ? (
                <View className={`rounded-[28px] border p-5 ${theme.surface}`}>
                  <Text className={`text-lg font-black ${theme.textOnSurface}`}>Guest list is available to view from the invitation page.</Text>
                  <Text className={`mt-2 text-sm font-semibold ${theme.subText}`}>Management actions are hidden for guest access.</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function Info({ icon: Icon, text }: { icon: any; text: string }) {
  const theme = useScreenTheme();
  return (
    <View className="mb-2 flex-row items-center gap-2">
      <Icon color={theme.chevronColor} size={16} />
      <Text className={`flex-1 text-sm font-bold ${theme.textOnSurface}`}>{text}</Text>
    </View>
  );
}
