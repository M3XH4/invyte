import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Send,
  UserPlus,
  Trash2,
  XCircle,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddGuestModal from '@/components/add-guest-modal';
import GuestDetailsModal from '@/components/guest-details-modal';
import { useScreenTheme } from '@/hooks/use-screen-theme';
import { useAuth } from '@/hooks/useAuth';
import { eventStore, useEventStore } from '@/store/eventStore';
import { guestEventStore, useGuestEventStore } from '@/store/guestEventStore';
import { guestStore, useGuestStore } from '@/store/guestStore';
import { safeRun } from '@/utils/safeRun';
import { mergeUserEvents } from '@/utils/mergeUserEvents';
import { normalizeGuestStatus } from '@/utils/rsvpStats';
import type { EventGuest } from '@/types/guest';
import type { Event } from '@/types/event';

type GuestStatus = 'going' | 'maybe' | 'pending' | 'not-going';
type ContactMethod = 'email' | 'whatsapp' | 'messenger' | 'telegram';

type Guest = {
  id: string;
  name: string;
  status: GuestStatus;
  avatar: string;
  color: [string, string];
  profileImage?: string;
  contactMethod?: ContactMethod;
  contactValue?: string;
  source?: EventGuest;
};

type EventItem = {
  id: string;
  name: string;
  category: 'birthday' | 'meeting' | 'party';
  categoryColor: [string, string];
  guests: Guest[];
  source?: Event;
  role: 'host' | 'guest';
  permissions?: Event['permissions'];
};

const statusConfig: Record<GuestStatus, { label: string; icon: any; bg: string; text: string; border: string }> = {
  going: { label: 'Going', icon: CheckCircle, bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  maybe: { label: 'Maybe', icon: HelpCircle, bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  pending: { label: 'Pending', icon: Clock, bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
  'not-going': { label: 'Not Going', icon: XCircle, bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

export default function GuestListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { isAuthenticated } = useAuth();

  const eventState = useEventStore();
  const guestEventState = useGuestEventStore();
  const guestState = useGuestStore();
  const [guestActionError, setGuestActionError] = useState('');
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'going' | 'pending' | 'recent'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<GuestStatus>('pending');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [contactValue, setContactValue] = useState('');
  const [selectedGuestDetails, setSelectedGuestDetails] = useState<{ guest: EventGuest; event?: Event } | null>(null);
  const [guestDetailsLoading, setGuestDetailsLoading] = useState(false);

  const events = useMemo(() => {
    return mergeUserEvents(eventState.events, guestEventState.events).map((event) => {
      const eventId = event.uuid || event.id;
      const guests = event.permissions?.can_view_guest_list !== false
        ? (guestState.guestsByEventId[eventId] ?? []).map(mapGuest)
        : [];
      return mapEventItem(event, guests, event.relationshipRole, event.permissions);
    });
  }, [eventState.events, guestEventState.events, guestState.guestsByEventId]);

  const loading = eventState.isLoadingInitial && eventState.events.length === 0 && guestEventState.events.length === 0;
  const refreshing = eventState.isRefreshing;
  const error = eventState.error;
  const refresh = async () => {
    await Promise.all([
      eventStore.refreshEvents({ status: 'all', per_page: 50 }),
      isAuthenticated
        ? guestEventStore.fetchGuestEvents().catch((error) => {
            if (typeof __DEV__ === 'undefined' || __DEV__) {
              console.log('[guest-list] failed to refresh guest events', error?.message || error);
            }
          })
        : Promise.resolve([]),
    ]);
  };

  useEffect(() => {
    if (!isAuthenticated || guestEventState.loaded || guestEventState.loading) return;

    guestEventStore.fetchGuestEvents().catch((error) => {
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[guest-list] failed to load guest-side events', error?.message || error);
      }
    });
  }, [guestEventState.loaded, guestEventState.loading, isAuthenticated]);

  useEffect(() => {
    if (eventState.isLoadingInitial || eventState.isRefreshing) return;

    if (events.length === 0) {
      setSelectedEventId('');
      setExpandedEvents([]);
      return;
    }

    setSelectedEventId((current) =>
      current && events.some((event) => event.id === current) ? current : events[0]?.id || '',
    );
    setExpandedEvents((current) => {
      const validExpanded = current.filter((id) => events.some((event) => event.id === id));
      return validExpanded.length > 0 ? validExpanded : [events[0].id];
    });
  }, [events, eventState.isLoadingInitial, eventState.isRefreshing]);

  const loadGuestsForEvent = useCallback(async (eventId: string) => {
    if (!eventId) return;
    const selectedEvent = events.find((event) => event.id === eventId);
    if (selectedEvent?.role === 'guest' && selectedEvent.permissions?.can_view_guest_list === false) return;

    await guestStore.fetchGuests(eventId, { per_page: 100 });
  }, [events]);

  useEffect(() => {
    const firstExpanded = expandedEvents[0];
    if (firstExpanded) void safeRun(() => loadGuestsForEvent(firstExpanded), 'Unable to load guests.', setGuestActionError);
  }, [expandedEvents, loadGuestsForEvent]);

  const allGuests = events.flatMap((event) => event.guests ?? []);

  const totalStats = {
    going: allGuests.filter((guest) => guest.status === 'going').length,
    maybe: allGuests.filter((guest) => guest.status === 'maybe').length,
    pending: allGuests.filter((guest) => guest.status === 'pending').length,
    notGoing: allGuests.filter((guest) => guest.status === 'not-going').length,
  };

  const sortedEvents = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return events.map((event) => {
      const eventGuests = event.guests ?? [];
      const filteredGuests = eventGuests.filter((guest) =>
        guest.name.toLowerCase().includes(query),
      );

      const guests = [...filteredGuests].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'going':
            return Number(b.status === 'going') - Number(a.status === 'going');
          case 'pending':
            return Number(b.status === 'pending') - Number(a.status === 'pending');
          case 'recent':
            return b.id.localeCompare(a.id);
          default:
            return 0;
        }
      });

      return { ...event, guests };
    });
  }, [events, searchQuery, sortBy]);

  const toggleEvent = useCallback((eventId: string) => {
    setExpandedEvents((prev) => {
      const willExpand = !prev.includes(eventId);
      if (willExpand) void safeRun(() => loadGuestsForEvent(eventId), 'Unable to load guests.', setGuestActionError);

      return willExpand ? [...prev, eventId] : prev.filter((id) => id !== eventId);
    });
  }, [loadGuestsForEvent]);

  const hasEvents = events.length > 0;
  const manageableEvents = useMemo(
    () => events.filter((event) => event.role === 'host' && event.permissions?.can_add_guest !== false),
    [events],
  );

  const handleAddGuest = async () => {
    const selectedEvent = events.find((event) => event.id === selectedEventId);
    if (!selectedEvent || selectedEvent.role === 'guest' || selectedEvent.permissions?.can_add_guest === false) {
      setGuestActionError('You can view this event, but you cannot add guests.');
      return;
    }
    if (!selectedEventId) {
      setGuestActionError('Select an event first.');
      return;
    }
    if (!newGuestName.trim()) {
      setGuestActionError('Guest name is required.');
      return;
    }
    if (!contactValue.trim()) {
      setGuestActionError(contactMethod === 'email' ? 'Email is required.' : 'Contact information is required.');
      return;
    }

    setGuestActionError('');
    await guestStore.addGuest(selectedEventId, {
      name: newGuestName.trim(),
      email: contactMethod === 'email' ? contactValue.trim() : undefined,
      phone_number: contactMethod !== 'email' ? contactValue.trim() : undefined,
      contact_method: contactMethod,
      contact_value: contactValue.trim(),
      response_status: selectedStatus === 'not-going' ? 'not_going' : selectedStatus,
      invite_status: 'pending',
    });

    setNewGuestName('');
    setSelectedStatus('pending');
    setContactMethod('email');
    setContactValue('');
    setShowAddModal(false);
  };

  const handleDeleteGuest = async (eventId: string, guestId: string) => {
    const selectedEvent = events.find((event) => event.id === eventId);
    if (selectedEvent?.role === 'guest' || selectedEvent?.permissions?.can_remove_guest === false) {
      setGuestActionError('You can view this guest list, but you cannot remove guests.');
      return;
    }

    setGuestActionError('');
    await guestStore.deleteGuest(eventId, guestId);
  };

  const handleOpenGuestDetails = async (event: EventItem, guest: Guest) => {
    const sourceGuest = guest.source;
    if (!sourceGuest) return;

    setSelectedGuestDetails({ guest: sourceGuest, event: event.source });
    try {
      setGuestDetailsLoading(true);
      const detailed = await guestStore.fetchGuestDetails(event.id, sourceGuest.uuid || sourceGuest.id);
      setSelectedGuestDetails({ guest: detailed, event: event.source });
    } catch (error: any) {
      setGuestActionError(error.message || 'Unable to load guest details.');
    } finally {
      setGuestDetailsLoading(false);
    }
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
              void safeRun(refresh, 'Unable to refresh events.', setGuestActionError);
            }}
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="px-5">
          <View className="mb-6 flex-row items-center gap-3">
            <View>
              <Text className={`text-3xl font-black ${theme.headerText}`}>
                Guest List
              </Text>
              <Text className={`text-sm font-medium ${theme.subText}`}>
                {allGuests.length} total guests
              </Text>
            </View>
          </View>

          <View className="mb-6 flex-row gap-2.5">
            <StatCard label="Going" value={totalStats.going} color="#059669" theme={theme} />
            <StatCard label="Maybe" value={totalStats.maybe} color="#d97706" theme={theme} />
            <StatCard label="Pending" value={totalStats.pending} color="#9333ea" theme={theme} />
            <StatCard label="Can't Go" value={totalStats.notGoing} color="#dc2626" theme={theme} />
          </View>

          <View className="mb-5 flex-row gap-3">
            <View className={`h-12 flex-1 flex-row items-center rounded-2xl border px-4 shadow-sm ${theme.surface}`}>
              <Search color={theme.chevronColor} size={16} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search guests..."
                placeholderTextColor={theme.chevronColor}
                className={`ml-3 flex-1 text-sm ${theme.textOnSurface}`}
              />
            </View>

            <View className="relative">
              <Pressable
                onPress={() => setShowSortMenu(!showSortMenu)}
                className={`h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
              >
                <Filter color={theme.iconColor} size={16} />
              </Pressable>

              {showSortMenu && (
                <View className={`absolute right-0 top-14 z-50 w-44 rounded-2xl border p-2 shadow-xl ${theme.surface}`}>
                  <SortOption label="Name A-Z" active={sortBy === 'name'} onPress={() => { setSortBy('name'); setShowSortMenu(false); }} theme={theme} />
                  <SortOption label="Going First" active={sortBy === 'going'} onPress={() => { setSortBy('going'); setShowSortMenu(false); }} theme={theme} />
                  <SortOption label="Pending First" active={sortBy === 'pending'} onPress={() => { setSortBy('pending'); setShowSortMenu(false); }} theme={theme} />
                  <SortOption label="Recently Added" active={sortBy === 'recent'} onPress={() => { setSortBy('recent'); setShowSortMenu(false); }} theme={theme} />
                </View>
              )}
            </View>
          </View>

          <View className="gap-4">
            {loading && (
              <View className={`items-center rounded-[28px] border p-8 shadow-sm ${theme.surface}`}>
                <ActivityIndicator color="#9333ea" />
                <Text className={`mt-3 text-sm font-semibold ${theme.subText}`}>Loading guests...</Text>
              </View>
            )}

            {!!(error || guestActionError) && (
              <View className={`rounded-[28px] border p-5 shadow-sm ${theme.surface}`}>
                <Text className="text-sm font-semibold text-red-500">{guestActionError || error}</Text>
              </View>
            )}

            {!loading && !refreshing && !hasEvents ? (
              <View className={`items-center rounded-[28px] border p-8 shadow-sm ${theme.surface}`}>
                <View className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${theme.surfaceMuted}`}>
                  <UserPlus color="#9333ea" size={38} />
                </View>

                <Text className={`mb-2 text-xl font-black ${theme.headerText}`}>
                  No events yet
                </Text>

                <Text className={`mb-6 text-center text-sm leading-5 ${theme.subText}`}>
                  Create an event first before adding guests.
                </Text>

                <Pressable
                  onPress={() => router.push('/create-event-categories')}
                  className="overflow-hidden rounded-2xl"
                >
                  <LinearGradient
                    colors={['#9333ea', '#ec4899']}
                    className="px-6 py-3"
                  >
                    <Text className="font-bold text-white">
                      Create Event
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              sortedEvents.map((event, eventIndex) => {
              const isExpanded = expandedEvents.includes(event.id);
              const canViewGuests = event.role === 'host' || event.permissions?.can_view_guest_list !== false;
              const canAddGuests = event.role === 'host' && event.permissions?.can_add_guest !== false;
              const canRemoveGuests = event.role === 'host' && event.permissions?.can_remove_guest !== false;
              const eventStats = {
                going: (event.guests ?? []).filter((guest) => guest.status === 'going').length,
                maybe: (event.guests ?? []).filter((guest) => guest.status === 'maybe').length,
                pending: (event.guests ?? []).filter((guest) => guest.status === 'pending').length,
              };

              return (
                <MotiView
                  key={event.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', delay: eventIndex * 100, duration: 300 }}
                  className={`overflow-hidden rounded-[24px] border shadow-sm ${theme.surface}`}
                >
                  <Pressable onPress={() => toggleEvent(event.id)} className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center gap-3">
                      <LinearGradient colors={event.categoryColor} className="h-12 w-12 items-center justify-center rounded-xl p-2 shadow-md">
                        <UserPlus color="white" size={22} />
                      </LinearGradient>

                      <View>
                        <Text className={`text-base font-black ${theme.textOnSurface}`}>
                          {event.name}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <Text className={`text-xs font-medium ${theme.subText}`}>
                            {canViewGuests ? `${event.guests?.length ?? 0} guests total` : 'Guest list private'}
                          </Text>
                          <View className={`rounded-full px-2 py-0.5 ${event.role === 'guest' ? 'bg-sky-500/15' : 'bg-purple-500/15'}`}>
                            <Text className={`text-[10px] font-black uppercase ${event.role === 'guest' ? 'text-sky-500' : 'text-purple-500'}`}>
                              {event.role === 'guest' ? 'invited' : 'host'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs font-bold text-emerald-500">{eventStats.going}</Text>
                        <Text className={`text-xs ${theme.mutedText}`}>/</Text>
                        <Text className="text-xs font-bold text-amber-500">{eventStats.maybe}</Text>
                        <Text className={`text-xs ${theme.mutedText}`}>/</Text>
                        <Text className="text-xs font-bold text-purple-500">{eventStats.pending}</Text>
                      </View>

                      {isExpanded ? <ChevronUp color={theme.chevronColor} size={20} /> : <ChevronDown color={theme.chevronColor} size={20} />}
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View className={`border-t p-4 ${theme.divider}`}>
                      {!canViewGuests ? (
                        <View className="items-center py-6">
                          <View className={`mb-3 h-14 w-14 items-center justify-center rounded-full ${theme.surfaceMuted}`}>
                            <UserPlus color="#9333ea" size={26} />
                          </View>
                          <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                            Guest list is private
                          </Text>
                          <Text className={`text-center text-sm ${theme.subText}`}>
                            The host has not made the guest list visible for this event.
                          </Text>
                        </View>
                      ) : (event.guests?.length ?? 0) === 0 ? (
                        <View className="items-center py-6">
                          <View className={`mb-3 h-14 w-14 items-center justify-center rounded-full ${theme.surfaceMuted}`}>
                            <UserPlus color="#9333ea" size={26} />
                          </View>
                          {guestState.loadingByEventId[event.id] ? (
                            <>
                              <ActivityIndicator color="#9333ea" />
                              <Text className={`mt-3 text-sm font-semibold ${theme.subText}`}>
                                Loading guests...
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                                No guests yet
                              </Text>
                              <Text className={`mb-4 text-center text-sm ${theme.subText}`}>
                                {canAddGuests ? 'Add guests to this event and track their RSVP.' : 'No guests are visible for this event yet.'}
                              </Text>
                              {canAddGuests && (
                                <Pressable
                                  onPress={() => {
                                    setSelectedEventId(event.id);
                                    setShowAddModal(true);
                                  }}
                                  className="rounded-xl bg-purple-600 px-5 py-2.5"
                                >
                                  <Text className="font-bold text-white">Add Guest</Text>
                                </Pressable>
                              )}
                            </>
                          )}
                        </View>
                      ) : (
                        <View className="gap-3">
                          {(event.guests ?? []).map((guest, guestIndex) => (
                            <GuestRow
                              key={guest.id}
                              guest={guest}
                              index={guestIndex}
                              theme={theme}
                              onDelete={canRemoveGuests ? () =>
                                  void safeRun(
                                    () => handleDeleteGuest(event.id, guest.id),
                                    'Failed to delete guest.',
                                    setGuestActionError,
                                  )
                                : undefined}
                              onPress={() => {
                                void safeRun(
                                  () => handleOpenGuestDetails(event, guest),
                                  'Failed to load guest details.',
                                  setGuestActionError,
                                );
                              }}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </MotiView>
              );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {manageableEvents.length > 0 && (
        <Pressable
          onPress={() => {
            setSelectedEventId((current) =>
              current && manageableEvents.some((event) => event.id === current)
                ? current
                : manageableEvents[0]?.id || '',
            );
            setShowAddModal(true);
          }}
          style={{
            position: 'absolute',
            right: 20,
            bottom: insets.bottom + 100,
            zIndex: 30,
          }}
        >
          <LinearGradient
            colors={['#a855f7', '#9333ea', '#ec4899']}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#9333ea',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            <UserPlus color="white" size={24} strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      )}

      <AddGuestModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        events={manageableEvents}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        newGuestName={newGuestName}
        setNewGuestName={setNewGuestName}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        contactMethod={contactMethod}
        setContactMethod={setContactMethod}
        contactValue={contactValue}
        setContactValue={setContactValue}
        onAddGuest={() => {
          void safeRun(handleAddGuest, 'Failed to add guest.', setGuestActionError);
        }}
      />

      <GuestDetailsModal
        visible={!!selectedGuestDetails}
        guest={selectedGuestDetails?.guest}
        event={selectedGuestDetails?.event}
        loading={guestDetailsLoading}
        canViewPrivate={selectedGuestDetails?.event?.permissions?.can_view_guest_answers !== false}
        onClose={() => setSelectedGuestDetails(null)}
      />
    </LinearGradient>
  );
}

function GuestRow({
  guest,
  index,
  theme,
  onDelete,
  onPress,
}: {
  guest: Guest;
  index: number;
  theme: ReturnType<typeof useScreenTheme>;
  onDelete?: () => void;
  onPress: () => void;
}) {
  const status = statusConfig[guest.status];
  const StatusIcon = status.icon;
  const ContactIcon =
    guest.contactMethod === 'whatsapp'
      ? MessageCircle
      : guest.contactMethod === 'messenger' || guest.contactMethod === 'telegram'
        ? Send
        : Mail;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', delay: index * 30, duration: 200 }}
      className={`rounded-xl p-3 ${theme.surfaceMuted}`}
    >
      <Pressable onPress={onPress} className="flex-row items-center gap-3">
        {guest.profileImage ? (
          <Image source={{ uri: guest.profileImage }} className="h-10 w-10 rounded-lg" />
        ) : (
          <LinearGradient colors={guest.color} className="h-10 w-10 items-center justify-center rounded-lg">
            <Text className="text-xs font-black text-white">{guest.avatar}</Text>
          </LinearGradient>
        )}

        <View className="min-w-0 flex-1">
          <Text className={`mb-1 text-sm font-bold ${theme.textOnSurface}`}>
            {guest.name}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <View
              className="flex-row items-center gap-1 rounded-full border px-2.5 py-0.5"
              style={{ backgroundColor: status.bg, borderColor: status.border }}
            >
              <StatusIcon color={status.text} size={12} />
              <Text style={{ color: status.text }} className="text-xs font-bold">
                {status.label}
              </Text>
            </View>

            {guest.contactValue && (
              <View className={`flex-row items-center gap-1 rounded-full px-2.5 py-0.5 ${theme.surface}`}>
                <ContactIcon color={theme.chevronColor} size={12} />
                <Text className={`text-xs font-medium ${theme.subText}`}>
                  {guest.contactValue.length > 20 ? `${guest.contactValue.substring(0, 20)}...` : guest.contactValue}
                </Text>
              </View>
            )}
          </View>
        </View>

        {onDelete && (
          <Pressable
            onPress={onDelete}
            className={`h-9 w-9 items-center justify-center rounded-lg ${theme.isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}
          >
            <Trash2 color="#dc2626" size={16} />
          </Pressable>
        )}
      </Pressable>
    </MotiView>
  );
}

function StatCard({ label, value, color, theme }: { label: string; value: number; color: string; theme: ReturnType<typeof useScreenTheme> }) {
  return (
    <View className={`flex-1 rounded-2xl border p-3 shadow-sm ${theme.surface}`}>
      <Text style={{ color }} className="text-center text-2xl font-black">
        {value}
      </Text>
      <Text className={`text-center text-[10px] font-bold ${theme.subText}`}>
        {label}
      </Text>
    </View>
  );
}

function SortOption({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useScreenTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-1 rounded-xl px-3 py-2 ${active ? 'bg-purple-600' : ''}`}
    >
      <Text className={`text-sm font-semibold ${active ? 'text-white' : theme.textOnSurface}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function mapEventItem(
  event: Event,
  guests: Guest[] = [],
  role: EventItem['role'] = 'host',
  permissions?: Event['permissions'],
): EventItem {
  const slug = event.category_slug || (typeof event.category === 'string' ? event.category : event.category?.slug) || 'party';

  return {
    id: event.uuid || event.id,
    name: event.title,
    category: (['birthday', 'meeting', 'party'].includes(slug) ? slug : 'party') as EventItem['category'],
    categoryColor: categoryColors(slug),
    guests: Array.isArray(guests) ? guests : [],
    source: event,
    role,
    permissions,
  };
}

function mapGuest(guest: EventGuest): Guest {
  const name = guest.name || 'Guest';
  const normalizedStatus = normalizeGuestStatus(guest.response_status || guest.status);
  const status = normalizedStatus === 'not_going' ? 'not-going' : normalizedStatus;

  return {
    id: guest.uuid || guest.id,
    name,
    status,
    avatar: generateInitials(name),
    color: [['#34d399', '#059669'], ['#60a5fa', '#2563eb'], ['#c084fc', '#9333ea']][Math.floor(Math.random() * 3)] as [string, string],
    contactMethod: guest.email ? 'email' : 'whatsapp',
    contactValue: guest.email || guest.phone_number || '',
    source: guest,
  };
}

function generateInitials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

function categoryColors(category: string): [string, string] {
  const colors: Record<string, [string, string]> = {
    birthday: ['#f472b6', '#db2777'],
    meeting: ['#22d3ee', '#0891b2'],
    party: ['#fb923c', '#ea580c'],
    wedding: ['#c084fc', '#9333ea'],
  };

  return colors[category] || colors.party;
}
