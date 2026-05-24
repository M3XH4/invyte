import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  HelpCircle,
  MapPin,
  Plus,
  Search,
  Filter,
  XCircle,
} from "lucide-react-native";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from 'react';
import { useScreenTheme } from "@/hooks/use-screen-theme";
import { useAuth } from "@/hooks/useAuth";
import { eventStore, useEventStore } from "@/store/eventStore";
import { guestEventStore, useGuestEventStore } from "@/store/guestEventStore";
import type { Event } from "@/types/event";
import { formatDateForDisplay, formatTimeForDisplay } from "@/utils/dateTime";
import { getEventComputedStatus } from "@/utils/eventStatus";
import { mergeUserEvents } from "@/utils/mergeUserEvents";
import { normalizeEventRsvpStats } from "@/utils/rsvpStats";

const fallbackCover =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80";

type EventFilter = 'all' | 'hosted' | 'guest' | 'upcoming' | 'ongoing' | 'past' | 'archived';

export default function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EventFilter>('all');

  const eventsState = useEventStore();
  const guestEventState = useGuestEventStore();
  const loading = eventsState.isLoadingInitial && eventsState.events.length === 0;
  const refreshing = eventsState.isRefreshing;
  const error = eventsState.error;
  const refresh = async () => {
    if (statusFilter === 'archived') {
      await eventStore.refreshEvents({ status: 'archived', per_page: 50 });
      return;
    }

    await Promise.all([
      eventStore.refreshEvents({ status: 'all', per_page: 50 }),
      guestEventStore.fetchGuestEvents().catch((error) => {
        if (typeof __DEV__ === 'undefined' || __DEV__) {
          console.log('[events] failed to refresh guest events', error?.message || error);
        }
      }),
    ]);
  };

  useEffect(() => {
    if (statusFilter === 'archived') {
      eventStore.fetchArchivedEvents().catch((error) => {
        if (typeof __DEV__ === 'undefined' || __DEV__) {
          console.log('[events] failed to load archive', error?.message || error);
        }
      });
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAuthenticated || guestEventState.loaded || guestEventState.loading) return;

    guestEventStore.fetchGuestEvents().catch((error) => {
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[events] failed to load guest-side events', error?.message || error);
      }
    });
  }, [guestEventState.loaded, guestEventState.loading, isAuthenticated]);

  const events = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const mergedEvents = mergeUserEvents(eventsState.events, guestEventState.events);

    const source =
      statusFilter === 'archived'
        ? eventsState.archivedEvents.map((event) => ({ ...event, relationshipRole: 'host' as const }))
        : statusFilter === 'hosted'
          ? mergedEvents.filter((event) => event.relationshipRole === 'host')
          : statusFilter === 'guest'
            ? mergedEvents.filter((event) => event.relationshipRole === 'guest')
            : mergedEvents;

    return source.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        categorySlug(event).toLowerCase().includes(query) ||
        (event.location || event.venue_name || event.venue_address || '').toLowerCase().includes(query);
      const computedStatus = getEventComputedStatus(event);
      const matchesStatus =
        statusFilter === 'all' ||
        statusFilter === 'hosted' ||
        statusFilter === 'guest' ||
        computedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [eventsState.archivedEvents, eventsState.events, guestEventState.events, searchQuery, statusFilter]);

  const handleRestoreEvent = async (eventId: string) => {
    await eventStore.restoreEvent(eventId);
  };

  const handlePermanentDeleteEvent = async (eventId: string) => {
    await eventStore.permanentlyDeleteEvent(eventId);
  };

  const calculateResponseRate = (event: Event) => {
    const stats = normalizeEventRsvpStats({ ...(event.rsvp || {}), totalInvited: event.totalInvited });
    const totalResponses = stats.going + stats.maybe + stats.notGoing;

    if (stats.totalInvited === 0) return 0;

    const responseRate = Math.round((totalResponses / stats.totalInvited) * 100);
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[events] RSVP progress', {
        eventId: event.uuid || event.id,
        totalInvited: stats.totalInvited,
        going: stats.going,
        maybe: stats.maybe,
        notGoing: stats.notGoing,
        pending: stats.pending,
        responseRate,
      });
    }
    return responseRate;
  };

  const handleCreateEvent = () => {
    if (!isAuthenticated) {
      router.push('/auth-login');
      return;
    }

    router.push("/create-event-categories");
  };

  const calculateDaysUntil = (eventDate: string) => {
    if (!eventDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);

    const diffTime = event.getTime() - today.getTime();

    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refresh().catch((error) => {
                if (typeof __DEV__ === 'undefined' || __DEV__) {
                  console.log('[my-events] refresh failed; preserving current events', error?.message || error);
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
        <View className="px-5">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className={`text-3xl font-black ${theme.headerText}`}>
                My Events
              </Text>
              <Text className={`text-sm ${theme.subText}`}>
                Manage your events and track RSVPs
              </Text>
            </View>

            {/* <Pressable
              onPress={() => router.push('/my-event-settings')}
              className="h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <Settings color="#374151" size={20} />
            </Pressable> */}
          </View>

          {/* Stats Summary */}
          <View className="mb-6 flex-row gap-3">
            <StatsCard
              label="Total Events"
              value={events.length}
              color="#9333ea"
            />
            <StatsCard
              label="Upcoming"
              value={events.filter((e) => getEventComputedStatus(e) === "upcoming").length}
              color="#059669"
            />
            <StatsCard
              label="Total Going"
              value={events.reduce((sum, e) => sum + (e.rsvp?.going ?? 0), 0)}
              color="#0891b2"
            />
          </View>
          {/* Search & Filter */}
          <View className="mb-5 flex-row gap-3">
            <View className={`h-12 flex-1 flex-row items-center rounded-2xl border px-4 shadow-sm ${theme.surface}`}>
                <Search color={theme.chevronColor} size={16} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search events..."
                  placeholderTextColor={theme.chevronColor}
                className={`ml-3 flex-1 text-sm ${theme.textOnSurface}`}
              />
            </View>

            <View className={`h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${theme.surface}`}>
              <Pressable
                onPress={() => setShowFilters(!showFilters)}
                className={`h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${showFilters ? 'border-purple-600 bg-purple-600' : theme.surface}`}
              >
                <Filter color={showFilters ? 'white' : theme.iconColor} size={16} />
              </Pressable>
          </View>
          </View>

          {showFilters && (
            <View className={`mb-5 rounded-2xl border p-1.5 shadow-sm ${theme.surface}`}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2 px-1">
                {(['all', 'hosted', 'guest', 'upcoming', 'ongoing', 'past', 'archived'] as EventFilter[]).map((status) => {
                  const active = statusFilter === status;

                  return (
                    <Pressable
                      key={status}
                      onPress={() => setStatusFilter(status as any)}
                      className={`min-w-[92px] rounded-xl px-4 py-2 ${active ? 'bg-purple-600' : ''
                        }`}
                    >
                      <Text
                        className={`text-center text-xs font-bold ${active ? 'text-white' : theme.textOnSurfaceSecondary
                          }`}
                      >
                        {capitalize(status)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              </ScrollView>
            </View>
          )}
          {/* Events List */}
          {loading && (
            <View className="items-center py-12">
              <ActivityIndicator color="#9333ea" />
              <Text className={`mt-3 text-sm font-semibold ${theme.subText}`}>
                Loading events...
              </Text>
            </View>
          )}

          {!!error && !loading && events.length === 0 && (
            <View className={`mb-5 rounded-2xl border p-4 ${theme.surface}`}>
              <Text className="mb-3 text-sm font-semibold text-red-500">{error}</Text>
              <Pressable
                onPress={() => {
                  void refresh().catch((error) => {
                    if (typeof __DEV__ === 'undefined' || __DEV__) {
                      console.log('[my-events] retry failed; preserving current events', error?.message || error);
                    }
                  });
                }}
                className="self-start rounded-xl bg-purple-600 px-4 py-2"
              >
                <Text className="text-sm font-bold text-white">Try Again</Text>
              </Pressable>
            </View>
          )}

          <View className="gap-4">
            {events.map((event, index) => (
              <MotiView
                key={`${event.relationshipRole || 'host'}-${event.uuid || event.id}`}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  delay: index * 100,
                  duration: 300,
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/event-management",
                      params: {
                        eventId: event.uuid || event.id,
                      },
                    })
                  }
                  className={`overflow-hidden rounded-2xl border shadow-sm ${theme.surface}`}
                >
                  {/* Event Header */}
                  <View className="relative h-32 overflow-hidden">
                    <Image
                      source={{ uri: event.coverImage || event.cover_image || fallbackCover }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />

                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.65)"]}
                      className="absolute inset-0"
                    />

                    <View className="absolute left-3 top-3 flex-row items-center gap-2">
                      <Badge
                        label={event.relationshipRole === 'guest' ? 'Invited' : 'Host'}
                        bg={event.relationshipRole === 'guest' ? '#e0f2fe' : '#f3e8ff'}
                        text={event.relationshipRole === 'guest' ? '#0369a1' : '#7e22ce'}
                      />
                      <Badge
                        label={capitalize(getEventComputedStatus(event))}
                        bg="#f3e8ff"
                        text="#7e22ce"
                      />
                      <Badge
                        label={capitalize(categorySlug(event))}
                        bg={getCategoryBg(categorySlug(event))}
                        text={getCategoryText(categorySlug(event))}
                      />
                    </View>

                    {getEventComputedStatus(event) === "upcoming" && (
                      <View className="absolute right-3 top-3 rounded-xl border border-white/40 bg-white/20 px-3 py-2">
                        <Text className="text-center text-2xl font-black leading-none text-white">
                          {calculateDaysUntil(event.date || event.start_date || '')}
                        </Text>
                        <Text className="text-[9px] font-bold uppercase text-white/80">
                          Days
                        </Text>
                      </View>
                    )}

                    <View className="absolute bottom-3 left-3 right-3">
                      <Text className="text-lg font-black text-white">
                        {event.title}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View className="p-4">
                    <View className="mb-4 gap-2">
                      <View className="flex-row items-center gap-2">
                        <Calendar color={theme.iconColor} size={16} />
                        <Text className={`text-sm font-semibold ${theme.subText}`}>
                          {formatDateForDisplay(event.date || event.start_date || '') || 'Date TBD'} • {formatTimeForDisplay(event.time || event.start_time || '') || 'Time TBD'}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <MapPin color={theme.iconColor} size={16} />
                        <Text
                          numberOfLines={1}
                          className={`flex-1 text-sm font-semibold ${theme.subText}`}
                        >
                          {event.location || event.venue_name || event.venue_address || 'Location TBD'}
                        </Text>
                      </View>
                    </View>

                    <View className={`mb-3 rounded-xl p-3 ${theme.surfaceMuted}`}>
                      <View className="mb-3 flex-row items-center justify-between">
                        <Text className={`text-xs font-bold ${theme.textOnSurface}`}>
                          RSVP Progress
                        </Text>
                        <Text className="text-xs font-bold text-purple-600">
                          {calculateResponseRate(event)}% responded
                        </Text>
                      </View>

                      <View className={`mb-3 h-2 w-full flex-row overflow-hidden rounded-full ${theme.isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <View
                          className="h-full bg-emerald-500"
                          style={{
                            width: `${event.totalInvited ? ((event.rsvp?.going ?? 0) / event.totalInvited) * 100 : 0}%`,
                          }}
                        />
                        <View
                          className="h-full bg-amber-500"
                          style={{
                            width: `${event.totalInvited ? ((event.rsvp?.maybe ?? 0) / event.totalInvited) * 100 : 0}%`,
                          }}
                        />
                        <View
                          className="h-full bg-red-500"
                          style={{
                            width: `${event.totalInvited ? ((event.rsvp?.notGoing ?? event.rsvp?.not_going ?? 0) / event.totalInvited) * 100 : 0}%`,
                          }}
                        />
                      </View>

                      <View className="flex-row justify-between">
                        <RsvpCount
                          icon={CheckCircle}
                          color="#059669"
                          value={event.rsvp?.going ?? 0}
                        />
                        <RsvpCount
                          icon={HelpCircle}
                          color="#d97706"
                          value={event.rsvp?.maybe ?? 0}
                        />
                        <RsvpCount
                          icon={XCircle}
                          color="#dc2626"
                          value={event.rsvp?.notGoing ?? event.rsvp?.not_going ?? 0}
                        />
                        <RsvpCount
                          icon={Clock}
                          color="#9333ea"
                          value={event.rsvp?.pending ?? 0}
                        />
                      </View>
                    </View>

                    {getEventComputedStatus(event) === 'archived' && event.relationshipRole !== 'guest' ? (
                      <View className="flex-row gap-3">
                        <Pressable
                          onPress={() => {
                            void handleRestoreEvent(event.uuid || event.id);
                          }}
                          className={`h-10 flex-1 items-center justify-center rounded-xl ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}
                        >
                          <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                            Restore
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            void handlePermanentDeleteEvent(event.uuid || event.id);
                          }}
                          className="h-10 flex-1 items-center justify-center rounded-xl bg-red-500/15"
                        >
                          <Text className="text-sm font-bold text-red-500">
                            Delete Permanently
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View className={`h-10 flex-row items-center justify-center gap-2 rounded-xl ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}>
                        <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                          View Details
                        </Text>
                        <ChevronRight color={theme.isDarkMode ? '#d8b4fe' : '#7e22ce'} size={16} />
                      </View>
                    )}
                  </View>
                </Pressable>
              </MotiView>
            ))}
          </View>

          {/* Empty State */}
          {!loading && !refreshing && !error && events.length === 0 && (
            <View className="items-center py-12">
              <View className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-100'}`}>
                <Calendar color={theme.isDarkMode ? '#d8b4fe' : '#9333ea'} size={40} />
              </View>

              <Text className={`mb-2 text-lg font-black ${theme.headerText}`}>
                {!searchQuery && statusFilter === 'all' ? 'No Events Yet' : 'No Events Found'}
              </Text>

              <Text className={`mb-6 text-sm ${theme.subText}`}>
                {!searchQuery && statusFilter === 'all'
                  ? 'Create your first event to get started!'
                  : 'Try changing your search or filter.'}
              </Text>

              <Pressable
                onPress={handleCreateEvent}
                className="overflow-hidden rounded-2xl shadow-lg"
              >
                <LinearGradient
                  colors={["#9333ea", "#ec4899"]}
                  className="flex-row items-center gap-2 px-6 py-3"
                >
                  <Plus color="white" size={20} />
                  <Text className="font-bold text-white">Create Event</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const theme = useScreenTheme();

  return (
    <View
      className={`flex-1 rounded-2xl border p-4 shadow-sm ${theme.surface}`}
    >
      <Text style={{ color }} className="mb-1 text-center text-2xl font-black">
        {value}
      </Text>
      <Text
        className={`text-center text-xs font-bold ${theme.subText}`}
      >
        {label}
      </Text>
    </View>
  );
}

function Badge({
  label,
  bg,
  text,
}: {
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <View
      className="rounded-full border px-3 py-1"
      style={{ backgroundColor: bg, borderColor: bg }}
    >
      <Text style={{ color: text }} className="text-xs font-bold">
        {label}
      </Text>
    </View>
  );
}

function RsvpCount({
  icon: Icon,
  color,
  value,
}: {
  icon: any;
  color: string;
  value: number;
}) {
  const theme = useScreenTheme();

  return (
    <View className="flex-row items-center gap-1.5">
      <Icon color={color} size={14} />
      <Text className={`text-xs font-bold ${theme.textOnSurface}`}>{value}</Text>
    </View>
  );
}

function capitalize(value: string) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function categorySlug(event: Event) {
  if (typeof event.category === 'string') return event.category;
  return event.category_slug || event.category?.slug || 'event';
}

function getCategoryBg(category: string) {
  const colors: Record<string, string> = {
    birthday: "#fce7f3",
    wedding: "#f3e8ff",
    party: "#ffedd5",
    meeting: "#cffafe",
    seminar: "#e0e7ff",
    funeral: "#f3f4f6",
  };

  return colors[category] || "#dbeafe";
}

function getCategoryText(category: string) {
  const colors: Record<string, string> = {
    birthday: "#be185d",
    wedding: "#7e22ce",
    party: "#c2410c",
    meeting: "#0e7490",
    seminar: "#4338ca",
    funeral: "#374151",
  };

  return colors[category] || "#1d4ed8";
}
