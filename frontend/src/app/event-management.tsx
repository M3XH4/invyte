// app/event-management.tsx
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  MapPin,
  MoreVertical,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import {
  DetailsTab,
  RSVPTab,
  GuestsTab,
  AttendanceTab,
  UpdatesTab,
  DeleteModal,
} from '@/components/event-management-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type TabType = 'details' | 'rsvp' | 'guests' | 'attendance' | 'updates';

type Guest = {
  id: number;
  name: string;
  email: string;
  status: 'going' | 'maybe' | 'pending' | 'not-going';
  attended?: boolean;
  checkedInAt?: string;
};

export default function EventManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { event } = useLocalSearchParams<{ event?: string }>();

  const selectedEvent = event ? JSON.parse(event) : null;
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id?: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [eventDetails, setEventDetails] = useState({
    title: selectedEvent?.title ?? "Untitled Event",
    category: selectedEvent?.category ?? "Event",
    date: selectedEvent?.date ?? "",
    time: selectedEvent?.time ?? "",
    venue: selectedEvent?.location ?? "",
    description:
      selectedEvent?.description ??
      "No description added yet.",
    theme: selectedEvent?.theme ?? "Default Theme",
  });

  const [rsvpSettings, setRsvpSettings] = useState({
    enabled: true,
    deadline: '',
    maxGuests: String(selectedEvent?.totalInvited ?? 0),
    allowPlusOnes: true,
  });

  const [rsvpQuestions, setRsvpQuestions] = useState([
    { id: 1, question: 'Food preference', placeholder: 'Vegetarian, Vegan, No preference' },
    { id: 2, question: 'Song request', placeholder: 'What song gets you dancing?' },
  ]);

  const [guests, setGuests] = useState<Guest[]>([
    { id: 1, name: 'Alex Morgan', email: 'alex@example.com', status: 'going', attended: false },
    { id: 2, name: 'Jordan Lee', email: 'jordan@example.com', status: 'going', attended: true, checkedInAt: '7:15 PM' },
    { id: 3, name: 'Taylor Swift', email: 'taylor@example.com', status: 'maybe', attended: false },
    { id: 4, name: 'Morgan Freeman', email: 'morgan@example.com', status: 'going', attended: false },
    { id: 5, name: 'Riley Cooper', email: 'riley@example.com', status: 'pending', attended: false },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Event details updated', timestamp: 'Just now', type: 'update' },
    { id: 2, action: 'New guest added: Alex Morgan', timestamp: '2 minutes ago', type: 'create' },
    { id: 3, action: 'RSVP deadline changed', timestamp: 'Today, 7:30 PM', type: 'update' },
  ]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'guests', label: 'Guests' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'updates', label: 'Updates' },
  ];

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const addActivityLog = (action: string, type: string) => {
    setActivityLog((prev) => [
      { id: Date.now(), action, timestamp: 'Just now', type },
      ...prev,
    ]);
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = statusFilter === 'all' || guest.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const guestStats = {
    going: guests.filter((g) => g.status === 'going').length,
    maybe: guests.filter((g) => g.status === 'maybe').length,
    pending: guests.filter((g) => g.status === 'pending').length,
    attended: guests.filter((g) => g.attended).length,
  };

  const handleDelete = () => {
    if (deleteTarget?.type === 'event') {
      setShowDeleteModal(false);
      showSuccessToast('Event deleted successfully');
      setTimeout(() => router.replace('/tabs/events'), 1000);
    }

    if (deleteTarget?.type === 'guest' && deleteTarget.id) {
      setGuests((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setShowDeleteModal(false);
      showSuccessToast('Guest removed successfully');
      addActivityLog('Guest removed', 'delete');
    }

    if (deleteTarget?.type === 'rsvp-question' && deleteTarget.id) {
      setRsvpQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setShowDeleteModal(false);
      showSuccessToast('RSVP question deleted');
      addActivityLog('RSVP question deleted', 'delete');
    }
  };

  return (
    <View className={`flex-1 ${theme.page}`}>
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View className="px-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.push('/tabs/events')}
              className={`h-11 w-11 items-center justify-center rounded-2xl border ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>

            <Text className={`text-xl font-black ${theme.headerText}`}>
              Event Management
            </Text>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/event-management-settings',
                  params: {
                    event: JSON.stringify(selectedEvent),
                  },
                })
              }
              className={`h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
            >
              <MoreVertical color={theme.iconColor} size={20} />
            </Pressable>
          </View>

          <LinearGradient
            colors={['#a855f7', '#9333ea', '#ec4899']}
            className="mb-6 p-5"
            style={{
              borderRadius: 28,
            }}
          >
            <Text className="mb-1 text-2xl font-black text-white">
              {eventDetails.title}
            </Text>

            <View className="mb-3 flex-row items-center gap-2">
              <Calendar color="white" size={16} />
              <Text className="text-sm font-medium text-white/80">
                {eventDetails.date}
              </Text>
              <Clock color="white" size={16} />
              <Text className="text-sm font-medium text-white/80">
                {eventDetails.time}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <MapPin color="white" size={16} />
              <Text numberOfLines={1} className="flex-1 text-sm font-medium text-white/80">
                {eventDetails.venue}
              </Text>
            </View>
          </LinearGradient>

          <View className={`mb-6 rounded-[24px] border p-1.5 ${theme.surface}`}>
            <View className="flex-row gap-1">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;

                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className="flex-1 overflow-hidden rounded-[18px]"
                  >
                    {active ? (
                      <LinearGradient
                        colors={['#9333ea', '#ec4899']}
                        className="items-center py-2"
                      >
                        <Text className="text-[10px] font-black text-white">
                          {tab.label}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View className="items-center py-2">
                        <Text className={`text-[10px] font-black ${theme.subText}`}>
                          {tab.label}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {activeTab === 'details' && (
            <DetailsTab
              eventDetails={eventDetails}
              setEventDetails={setEventDetails}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSave={() => {
                setIsEditing(false);
                showSuccessToast('Event details saved successfully');
              }}
              onDelete={() => {
                setDeleteTarget({ type: 'event' });
                setShowDeleteModal(true);
              }}
            />
          )}

          {activeTab === 'rsvp' && (
            <RSVPTab
              event={event}
              rsvpSettings={rsvpSettings}
              setRsvpSettings={setRsvpSettings}
              rsvpQuestions={rsvpQuestions}
              setRsvpQuestions={setRsvpQuestions}
              onDeleteQuestion={(id: number) => {
                setDeleteTarget({ type: 'rsvp-question', id });
                setShowDeleteModal(true);
              }}
              onSave={() => showSuccessToast('RSVP settings saved successfully')}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsTab
              guests={filteredGuests}
              guestStats={guestStats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAddGuest={() => {
                const guest: Guest = {
                  id: Date.now(),
                  name: 'New Guest',
                  email: 'guest@example.com',
                  status: 'pending',
                  attended: false,
                };

                setGuests((prev) => [...prev, guest]);
                showSuccessToast('Guest added successfully');
              }}
              onDeleteGuest={(id: number) => {
                setDeleteTarget({ type: 'guest', id });
                setShowDeleteModal(true);
              }}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab
              guests={guests}
              attendedCount={guestStats.attended}
              onUpdateAttendance={(id: number, attended: boolean) => {
                setGuests((prev) =>
                  prev.map((g) =>
                    g.id === id
                      ? {
                        ...g,
                        attended,
                        checkedInAt: attended
                          ? new Date().toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                          : undefined,
                      }
                      : g
                  )
                );

                showSuccessToast(attended ? 'Guest checked in' : 'Attendance reset');
              }}
            />
          )}

          {activeTab === 'updates' && <UpdatesTab logs={activityLog} />}
        </View>
      </ScrollView>

      <DeleteModal
        visible={showDeleteModal}
        target={deleteTarget}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />

      {showToast && (
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          className={`absolute left-6 right-6 rounded-[20px] px-5 py-4 ${theme.isDarkMode ? 'border border-emerald-400/30 bg-emerald-500/20' : 'bg-emerald-500'}`}
          style={{ top: insets.top + 12 }}
        >
          <View className="flex-row items-center gap-3">
            <Check color="white" size={20} />
            <Text className="text-sm font-bold text-white">
              {toastMessage}
            </Text>
          </View>
        </MotiView>
      )}
    </View>
  );
}