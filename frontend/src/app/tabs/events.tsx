import { Image, Pressable, ScrollView, Text, View, TextInput } from "react-native";
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
import { useMemo, useState } from 'react';
import { useScreenTheme } from "@/hooks/use-screen-theme";

type Event = {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  coverImage: string;
  rsvp: {
    going: number;
    maybe: number;
    notGoing: number;
    pending: number;
  };
  totalInvited: number;
  status: "upcoming" | "ongoing" | "past";
};

const userEvents: Event[] = [
  // {
  //   id: 1,
  //   title: "Sarah's Birthday Bash",
  //   category: "birthday",
  //   date: "2026-07-20",
  //   time: "7:00 PM",
  //   location: "123 Party Ave, New York, NY",
  //   coverImage:
  //     "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  //   rsvp: {
  //     going: 45,
  //     maybe: 10,
  //     notGoing: 5,
  //     pending: 20,
  //   },
  //   totalInvited: 80,
  //   status: "upcoming",
  // },
];

export default function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'upcoming' | 'ongoing' | 'past'
  >('all');

  const filteredEvents = useMemo(() => {
    return userEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);
  const calculateResponseRate = (event: Event) => {
    const totalResponses =
      event.rsvp.going + event.rsvp.maybe + event.rsvp.notGoing;

    if (event.totalInvited === 0) return 0;

    return Math.round((totalResponses / event.totalInvited) * 100);
  };

  const calculateDaysUntil = (eventDate: string) => {
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
              value={userEvents.length}
              color="#9333ea"
            />
            <StatsCard
              label="Upcoming"
              value={userEvents.filter((e) => e.status === "upcoming").length}
              color="#059669"
            />
            <StatsCard
              label="Total Going"
              value={userEvents.reduce((sum, e) => sum + e.rsvp.going, 0)}
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
              <View className="flex-row gap-1">
                {['all', 'upcoming', 'ongoing', 'past'].map((status) => {
                  const active = statusFilter === status;

                  return (
                    <Pressable
                      key={status}
                      onPress={() => setStatusFilter(status as any)}
                      className={`flex-1 rounded-xl py-2 ${active ? 'bg-purple-600' : ''
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
            </View>
          )}
          {/* Events List */}
          <View className="gap-4">
            {filteredEvents.map((event, index) => (
              <MotiView
                key={event.id}
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
                        event: JSON.stringify(event),
                      },
                    })
                  }
                  className={`overflow-hidden rounded-2xl border shadow-sm ${theme.surface}`}
                >
                  {/* Event Header */}
                  <View className="relative h-32 overflow-hidden">
                    <Image
                      source={{ uri: event.coverImage }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />

                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.65)"]}
                      className="absolute inset-0"
                    />

                    <View className="absolute left-3 top-3 flex-row items-center gap-2">
                      <Badge
                        label={capitalize(event.status)}
                        bg="#f3e8ff"
                        text="#7e22ce"
                      />
                      <Badge
                        label={capitalize(event.category)}
                        bg={getCategoryBg(event.category)}
                        text={getCategoryText(event.category)}
                      />
                    </View>

                    {event.status === "upcoming" && (
                      <View className="absolute right-3 top-3 rounded-xl border border-white/40 bg-white/20 px-3 py-2">
                        <Text className="text-center text-2xl font-black leading-none text-white">
                          {calculateDaysUntil(event.date)}
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
                          {event.date} • {event.time}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <MapPin color={theme.iconColor} size={16} />
                        <Text
                          numberOfLines={1}
                          className={`flex-1 text-sm font-semibold ${theme.subText}`}
                        >
                          {event.location}
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
                            width: `${(event.rsvp.going / event.totalInvited) * 100}%`,
                          }}
                        />
                        <View
                          className="h-full bg-amber-500"
                          style={{
                            width: `${(event.rsvp.maybe / event.totalInvited) * 100}%`,
                          }}
                        />
                        <View
                          className="h-full bg-red-500"
                          style={{
                            width: `${(event.rsvp.notGoing / event.totalInvited) * 100}%`,
                          }}
                        />
                      </View>

                      <View className="flex-row justify-between">
                        <RsvpCount
                          icon={CheckCircle}
                          color="#059669"
                          value={event.rsvp.going}
                        />
                        <RsvpCount
                          icon={HelpCircle}
                          color="#d97706"
                          value={event.rsvp.maybe}
                        />
                        <RsvpCount
                          icon={XCircle}
                          color="#dc2626"
                          value={event.rsvp.notGoing}
                        />
                        <RsvpCount
                          icon={Clock}
                          color="#9333ea"
                          value={event.rsvp.pending}
                        />
                      </View>
                    </View>

                    <View className={`h-10 flex-row items-center justify-center gap-2 rounded-xl ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}>
                      <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                        View Details
                      </Text>
                      <ChevronRight color={theme.isDarkMode ? '#d8b4fe' : '#7e22ce'} size={16} />
                    </View>
                  </View>
                </Pressable>
              </MotiView>
            ))}
          </View>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <View className="items-center py-12">
              <View className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-100'}`}>
                <Calendar color={theme.isDarkMode ? '#d8b4fe' : '#9333ea'} size={40} />
              </View>

              <Text className={`mb-2 text-lg font-black ${theme.headerText}`}>
                {userEvents.length === 0 ? 'No Events Yet' : 'No Events Found'}
              </Text>

              <Text className={`mb-6 text-sm ${theme.subText}`}>
                {userEvents.length === 0
                  ? 'Create your first event to get started!'
                  : 'Try changing your search or filter.'}
              </Text>

              <Pressable
                onPress={() => router.push("/create-event-categories")}
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
  return value.charAt(0).toUpperCase() + value.slice(1);
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
