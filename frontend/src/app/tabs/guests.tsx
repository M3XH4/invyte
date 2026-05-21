import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  XCircle,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddGuestModal from '@/components/add-guest-modal';
import { useScreenTheme } from '@/hooks/use-screen-theme';

type GuestStatus = 'going' | 'maybe' | 'pending' | 'not-going';
type ContactMethod = 'email' | 'whatsapp' | 'messenger' | 'telegram';

type Guest = {
  id: number;
  name: string;
  status: GuestStatus;
  avatar: string;
  color: [string, string];
  profileImage?: string;
  contactMethod?: ContactMethod;
  contactValue?: string;
};

type EventItem = {
  id: number;
  name: string;
  category: 'birthday' | 'meeting' | 'party';
  categoryColor: [string, string];
  guests: Guest[];
};

const initialEvents: EventItem[] = [
//   {
//     id: 1,
//     name: "Aryan's Birthday",
//     category: 'birthday',
//     categoryColor: ['#f472b6', '#db2777'],
//     guests: [
//       {
//         id: 1,
//         name: 'Alex Morgan',
//         status: 'going',
//         avatar: 'AM',
//         color: ['#34d399', '#059669'],
//         contactMethod: 'email',
//         contactValue: 'alex@example.com',
//       },
//       {
//         id: 2,
//         name: 'Jordan Lee',
//         status: 'maybe',
//         avatar: 'JL',
//         color: ['#60a5fa', '#2563eb'],
//         contactMethod: 'whatsapp',
//         contactValue: '+1 (555) 234-8888',
//       },
//       {
//         id: 3,
//         name: 'Taylor Swift',
//         status: 'pending',
//         avatar: 'TS',
//         color: ['#c084fc', '#9333ea'],
//         contactMethod: 'messenger',
//         contactValue: 'Taylor Swift',
//       },
//       {
//         id: 4,
//         name: 'Morgan Freeman',
//         status: 'not-going',
//         avatar: 'MF',
//         color: ['#f87171', '#dc2626'],
//         contactMethod: 'email',
//         contactValue: 'morgan@example.com',
//       },
//     ],
//   },
];

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

  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [expandedEvents, setExpandedEvents] = useState<number[]>([1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'going' | 'pending' | 'recent'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [newGuestName, setNewGuestName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<GuestStatus>('pending');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [contactValue, setContactValue] = useState('');

  const allGuests = events.flatMap((event) => event.guests);

  const totalStats = {
    going: allGuests.filter((guest) => guest.status === 'going').length,
    maybe: allGuests.filter((guest) => guest.status === 'maybe').length,
    pending: allGuests.filter((guest) => guest.status === 'pending').length,
    notGoing: allGuests.filter((guest) => guest.status === 'not-going').length,
  };

  const sortedEvents = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return events.map((event) => {
      const filteredGuests = event.guests.filter((guest) =>
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
            return b.id - a.id;
          default:
            return 0;
        }
      });

      return { ...event, guests };
    });
  }, [events, searchQuery, sortBy]);

  const toggleEvent = (eventId: number) => {
    setExpandedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId],
    );
  };

  const hasEvents = events.length > 0;

  const generateAvatar = (name: string) => {
    const parts = name.trim().split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  const getRandomColor = (): [string, string] => {
    const colors: [string, string][] = [
      ['#34d399', '#059669'],
      ['#60a5fa', '#2563eb'],
      ['#c084fc', '#9333ea'],
      ['#fb923c', '#ea580c'],
      ['#f472b6', '#db2777'],
      ['#f87171', '#dc2626'],
      ['#818cf8', '#4f46e5'],
      ['#2dd4bf', '#0d9488'],
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddGuest = () => {
    if (!newGuestName.trim() || !contactValue.trim()) return;

    const newGuest: Guest = {
      id: Date.now(),
      name: newGuestName.trim(),
      status: selectedStatus,
      avatar: generateAvatar(newGuestName),
      color: getRandomColor(),
      contactMethod,
      contactValue: contactValue.trim(),
    };

    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEventId
          ? { ...event, guests: [...event.guests, newGuest] }
          : event,
      ),
    );

    setNewGuestName('');
    setSelectedStatus('pending');
    setContactMethod('email');
    setContactValue('');
    setShowAddModal(false);
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
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
            {!hasEvents ? (
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
              const eventStats = {
                going: event.guests.filter((guest) => guest.status === 'going').length,
                maybe: event.guests.filter((guest) => guest.status === 'maybe').length,
                pending: event.guests.filter((guest) => guest.status === 'pending').length,
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
                        <Text className={`text-xs font-medium ${theme.subText}`}>
                          {event.guests.length} guests total
                        </Text>
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
                      {event.guests.length === 0 ? (
                        <View className="items-center py-6">
                          <View className={`mb-3 h-14 w-14 items-center justify-center rounded-full ${theme.surfaceMuted}`}>
                            <UserPlus color="#9333ea" size={26} />
                          </View>
                          <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                            No guests yet
                          </Text>
                          <Text className={`mb-4 text-center text-sm ${theme.subText}`}>
                            Add guests to this event and track their RSVP.
                          </Text>
                          <Pressable
                            onPress={() => {
                              setSelectedEventId(event.id);
                              setShowAddModal(true);
                            }}
                            className="rounded-xl bg-purple-600 px-5 py-2.5"
                          >
                            <Text className="font-bold text-white">Add Guest</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View className="gap-3">
                          {event.guests.map((guest, guestIndex) => (
                            <GuestRow key={guest.id} guest={guest} index={guestIndex} theme={theme} />
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

      <Pressable
        onPress={() => {
          if (hasEvents) setShowAddModal(true);
          else router.push('/create-event-categories');
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

      <AddGuestModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        events={events}
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
        onAddGuest={handleAddGuest}
      />
    </LinearGradient>
  );
}

function GuestRow({ guest, index, theme }: { guest: Guest; index: number; theme: ReturnType<typeof useScreenTheme> }) {
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
      <View className="flex-row items-center gap-3">
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
      </View>
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