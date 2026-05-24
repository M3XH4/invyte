import { useEffect, useMemo } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, ChevronRight, Clock, MapPin, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { eventStore, useEventStore } from '@/store/eventStore';
import { guestEventStore, useGuestEventStore } from '@/store/guestEventStore';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dateTime';
import { getEventComputedStatus } from '@/utils/eventStatus';
import { mergeUserEvents } from '@/utils/mergeUserEvents';
import ScanQrFab from '@/components/scan-qr-fab';
const heroCardImage = require('@/assets/images/hero-card-image.png');
const birthdayTransIcon = require('@/assets/images/transparent-birthday-icon.png');
const weddingTransIcon = require('@/assets/images/transparent-wedding-icon.png');
const partyTransIcon = require('@/assets/images/transparent-party-icon.png');
const meetingTransIcon = require('@/assets/images/transparent-meeting-icon.png');

type EventItem = {
  id: number | string;
  title: string;
  date: string;
  dateISO: string;
  time: string;
  location: string;
  attendees: number;
  image?: any;
  role?: string;
};

const fallbackCategories = [
  { id: 'birthday', name: 'Birthday', icon: birthdayTransIcon, colors: ['#f472b6', '#db2777'] },
  { id: 'wedding', name: 'Wedding', icon: weddingTransIcon, colors: ['#c084fc', '#9333ea'] },
  { id: 'party', name: 'Party', icon: partyTransIcon, colors: ['#fb923c', '#ea580c'] },
  { id: 'meeting', name: 'Meeting', icon: meetingTransIcon, colors: ['#22d3ee', '#0891b2'] },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { user } = useAuth();
  const eventState = useEventStore();
  const guestEventState = useGuestEventStore();
  const { unreadCount } = useNotifications();

  const categories = fallbackCategories;

  useEffect(() => {
    eventStore.syncIfStale({ status: 'all', per_page: 50 }).catch(() => undefined);
    if (user) guestEventStore.fetchGuestEvents().catch(() => undefined);
  }, [user]);

  const upcomingEvents: EventItem[] = useMemo(() => {
    const mergedEvents = mergeUserEvents(eventState.events, guestEventState.events);
    const upcoming = mergedEvents.filter((event) => {
      return getEventComputedStatus(event) === 'upcoming';
    });

    return upcoming
      .sort((a, b) => {
        const aDate = new Date(`${a.start_date || a.date}T${String(a.start_time || a.time || '00:00').slice(0, 5)}:00`).getTime();
        const bDate = new Date(`${b.start_date || b.date}T${String(b.start_time || b.time || '00:00').slice(0, 5)}:00`).getTime();
        return aDate - bDate;
      })
      .slice(0, 5)
      .map((event) => ({
        id: event.uuid || event.id,
        role: event.relationshipRole === 'guest' ? 'Invited' : 'Hosted',
        title: event.title,
        date: event.date || event.start_date || 'Date TBD',
        dateISO: event.date || event.start_date || new Date().toISOString(),
        time: event.time || event.start_time || 'Time TBD',
        location: event.location || event.venue_name || event.venue_address || 'Location TBD',
        attendees: event.rsvp?.going ?? 0,
      }));
  }, [eventState.events, guestEventState.events]);

  const notificationsCount = unreadCount;

  const latestUpcomingEvent = useMemo(() => {
    if (upcomingEvents.length === 0) return null;

    return [...upcomingEvents].sort(
      (a, b) =>
        new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )[0];
  }, [upcomingEvents]);

  useEffect(() => {
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[home] event store render', {
          events: eventState.events.length,
        upcomingEvents: upcomingEvents.length,
        hero: latestUpcomingEvent?.title || null,
        refreshing: eventState.isRefreshing,
      });
    }
  }, [eventState.events.length, eventState.isRefreshing, latestUpcomingEvent?.title, upcomingEvents.length]);

  const calculateDaysUntil = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);

    const diffTime = event.getTime() - today.getTime();
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  const heroTitle = latestUpcomingEvent?.title ?? 'Create Your First Event';
  const heroDate = latestUpcomingEvent
    ? `${formatDateForDisplay(latestUpcomingEvent.date) || latestUpcomingEvent.date} • ${formatTimeForDisplay(latestUpcomingEvent.time) || latestUpcomingEvent.time}`
    : 'Start your adventure today';
  const heroLocation =
    latestUpcomingEvent?.location ?? 'Plan, invite, and celebrate';
  const heroAttendees = latestUpcomingEvent?.attendees ?? 0;
  const heroDays = latestUpcomingEvent
    ? calculateDaysUntil(latestUpcomingEvent.dateISO)
    : 0;

  return (
    <LinearGradient
      colors={theme.pageGradient}
      className="flex-1"
    >
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={eventState.isRefreshing}
            onRefresh={() => {
              void Promise.all([
                eventStore.refreshEvents({ status: 'all', per_page: 50 }),
                user ? guestEventStore.fetchGuestEvents() : Promise.resolve([]),
              ]).catch((error) => {
                if (typeof __DEV__ === 'undefined' || __DEV__) {
                  console.log('[home] refresh failed; keeping existing hero/events', error?.message || error);
                }
              });
            }}
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 130,
        }}
      >
        <View className="px-6">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() => router.push('/tabs/profile')}
                className="relative"
              >
                <Image
                  source={{
                    uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Invyte'),
                  }}
                  className="h-14 w-14 rounded-full"
                />

                <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
              </Pressable>

              <View>
                <Text className={`text-2xl font-black ${theme.headerText}`}>
                  Hey {user?.name?.split(' ')[0] || 'there'}!
                </Text>
                <Text className={`text-sm ${theme.subText}`}>
                  Ready to make today unforgettable?
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push('/notifications')}
              className={`relative h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
            >
              <Bell color={theme.iconColor} size={20} />

              {notificationsCount > 0 && (
                <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-pink-500">
                  <Text className="text-[9px] font-bold text-white">
                    {notificationsCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Hero Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            className="mb-6 overflow-hidden rounded-[28px] shadow-2xl"
          >
            <Pressable
              onPress={() =>
                latestUpcomingEvent
                  ? router.push({ pathname: '/event-management', params: { eventId: latestUpcomingEvent.id } })
                  : router.push('/create-event-categories')
              }
            >
              <LinearGradient
                colors={['#a855f7', '#9333ea', '#db2777']}
                className="relative h-[240px] w-full overflow-hidden rounded-[28px]"
              >
                <View className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-pink-400/30" />
                <View className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-400/20" />

                <Image
                  source={heroCardImage}
                  className="absolute right-1 top-9 h-[180px] w-[145px]"
                  resizeMode="contain"
                />

                {latestUpcomingEvent && (
                  <View className="absolute right-5 top-5 z-10 rounded-2xl border border-white/40 bg-white/20 px-3 py-2">
                    <Text className="text-center text-2xl font-black leading-none text-white">
                      {heroDays}
                    </Text>

                    <Text className="text-[10px] font-bold uppercase text-white/80">
                      Days Left
                    </Text>
                  </View>
                )}

                <View className="absolute left-5 top-6 z-10 w-[170px]">
                  <View className="mb-2 self-start rounded-full bg-white/25 px-3 py-1">
                    <Text className="text-[11px] font-black text-white">
                      {latestUpcomingEvent ? `${latestUpcomingEvent.role || 'Hosted'} EVENT` : 'GET STARTED'}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={2}
                    className="mb-3 text-[26px] font-black leading-[30px] text-white"
                  >
                    {heroTitle}
                  </Text>

                  <View className="mb-2 flex-row items-start gap-2">
                    <Calendar color="white" size={14} strokeWidth={2.5} />
                    <Text className="flex-1 text-xs font-bold text-white">
                      {heroDate}
                    </Text>
                  </View>

                  <View className="mb-2 flex-row items-start gap-2">
                    <MapPin color="white" size={14} strokeWidth={2.5} />
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-xs font-bold text-white"
                    >
                      {heroLocation}
                    </Text>
                  </View>

                  <View className="mb-5 flex-row items-start gap-2">
                    <Users color="white" size={14} strokeWidth={2.5} />
                    <Text className="text-xs font-bold text-white">
                      {heroAttendees} attending
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() =>
                    latestUpcomingEvent
                      ? router.push({ pathname: '/event-management', params: { eventId: latestUpcomingEvent.id } })
                      : router.push('/create-event-categories')
                  }
                  className={`absolute bottom-3 left-5 z-20 h-[38px] flex-row items-center justify-center gap-1 rounded-full px-4 ${theme.surface}`}
                >
                  <Text className={`text-xs font-black ${theme.isDarkMode ? 'text-fuchsia-200' : 'text-purple-700'}`}>
                    {latestUpcomingEvent ? 'View Event' : 'Create Event'}
                  </Text>
                  <ChevronRight color={theme.isDarkMode ? '#f5d0fe' : '#7e22ce'} size={14} strokeWidth={3} />
                </Pressable>
              </LinearGradient>
            </Pressable>
          </MotiView>

          {/* Categories */}
          <View className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-xl font-black ${theme.headerText}`}>
                Categories
              </Text>

              <Pressable
                onPress={() => router.push('/create-event-categories')}
                className="flex-row items-center"
              >
                <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-fuchsia-300' : 'text-purple-600'}`}>
                  See All
                </Text>
                <ChevronRight color="#9333ea" size={16} />
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              {categories.map((category, index) => (
                <MotiView
                  key={category.id}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 100, duration: 300 }}
                  className="flex-1"
                >
                  <Pressable
                    onPress={() =>
                      router.push(`/create-event-details?category=${category.id}`)
                    }
                    className="items-center"
                  >
                    <LinearGradient
                      colors={category.colors as [string, string]}
                      className="mb-2 aspect-square w-full items-center justify-center p-3"
                      style={{ borderRadius: 12 }}
                    >
                      <Image
                        source={category.icon}
                        className="h-full w-full"
                        resizeMode="contain"
                      />
                    </LinearGradient>

                    <Text className={`text-xs font-bold ${theme.textOnSurfaceSecondary}`}>
                      {category.name}
                    </Text>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </View>

          {/* Upcoming Events */}
          <View className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-xl font-black ${theme.headerText}`}>
                Upcoming Events
              </Text>

              <Pressable
                onPress={() => router.push('/tabs/events')}
                className="flex-row items-center"
              >
                <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-fuchsia-300' : 'text-purple-600'}`}>
                  See All
                </Text>
                <ChevronRight color="#9333ea" size={16} />
              </Pressable>
            </View>

            <View className="gap-3">
              {upcomingEvents.length === 0 ? (
                <Pressable
                  onPress={() => router.push('/create-event-categories')}
                  className={`rounded-2xl border p-4 shadow-sm ${theme.surface}`}
                >
                  <Text className={`text-base font-black ${theme.textOnSurface}`}>
                    No upcoming events yet
                  </Text>
                  <Text className={`mt-1 text-sm ${theme.subText}`}>
                    Create your first event to see it here.
                  </Text>
                </Pressable>
              ) : (
                upcomingEvents.map((event, index) => (
                  <MotiView
                    key={event.id}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: index * 100, duration: 400 }}
                  >
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: '/event-management', params: { eventId: event.id } })
                      }
                      className={`rounded-2xl border p-4 shadow-sm ${theme.surface}`}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-purple-100">
                          {event.image ? (
                            <Image
                              source={event.image}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <Calendar color="#9333ea" size={26} />
                          )}
                        </View>

                        <View className="min-w-0 flex-1">
                          <Text
                            numberOfLines={1}
                            className={`mb-1 text-base font-bold ${theme.textOnSurface}`}
                          >
                            {event.title}
                          </Text>
                          <Text className={`mb-1 text-[10px] font-black uppercase ${event.role === 'Invited' ? 'text-sky-500' : 'text-purple-500'}`}>
                            {event.role || 'Hosted'}
                          </Text>

                          <View className="mb-1 flex-row items-center gap-2">
                            <Clock color={theme.chevronColor} size={14} />
                            <Text className={`text-xs ${theme.textOnSurfaceSecondary}`}>
                              {`${formatDateForDisplay(event.date) || event.date} • ${formatTimeForDisplay(event.time) || event.time}`}
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-2">
                            <MapPin color={theme.chevronColor} size={14} />
                            <Text
                              numberOfLines={1}
                              className={`flex-1 text-xs ${theme.textOnSurfaceSecondary}`}
                            >
                              {event.location}
                            </Text>
                          </View>
                        </View>

                          <View className="items-end gap-2">
                            <LinearGradient
                              colors={['#a855f7', '#ec4899']}
                              className="px-3 py-1.5"
                              style={{ borderRadius: 9999 }}
                            >
                              <View className="flex-row items-center gap-1.5">
                                <Calendar color="white" size={14} />
                                <Text className="text-xs font-black text-white">
                                  {calculateDaysUntil(event.dateISO)}d
                                </Text>
                              </View>
                            </LinearGradient>

                            <View className="flex-row items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5">
                              <Users color="#2563eb" size={14} />
                              <Text className="text-xs font-bold text-blue-600">
                                {event.attendees}
                              </Text>
                            </View>
                          </View>
                      </View>
                    </Pressable>
                  </MotiView>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <ScanQrFab />
    </LinearGradient>
  );
}
