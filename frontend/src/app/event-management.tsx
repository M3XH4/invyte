// app/event-management.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Camera,
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
  MyRsvpTab,
} from '@/components/event-management-tabs';
import AddGuestModal from '@/components/add-guest-modal';
import GuestDetailsModal from '@/components/guest-details-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { eventsApi } from '@/api/eventsApi';
import { rsvpApi } from '@/api/rsvpApi';
import { useEvent } from '@/hooks/useEvents';
import { useGuests } from '@/hooks/useGuests';
import { eventStore } from '@/store/eventStore';
import { guestEventStore } from '@/store/guestEventStore';
import { guestStore } from '@/store/guestStore';
import { activityLogStore, useActivityLogStore } from '@/store/activityLogStore';
import { safeRun } from '@/utils/safeRun';
import {
  combineDateTimeForApi,
  formatDateForDisplay,
  formatTimeForDisplay,
  isBeforeDateTime,
  isFutureDateTime,
  normalizeTime,
  splitApiDateTime,
} from '@/utils/dateTime';
import { imageUriToFormData } from '@/utils/upload';
import { resolveMediaUrl, withCacheBust } from '@/utils/media';
import { normalizeGuestStatus } from '@/utils/rsvpStats';
import type { RSVPQuestion } from '@/types/rsvp';
import type { EventGuest } from '@/types/guest';

type TabType = 'details' | 'rsvp' | 'guests' | 'attendance' | 'updates' | 'my-rsvp';

export default function EventManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const { event, setEvent, loading: eventLoading, error: eventError, reload: reloadEvent } = useEvent(eventId);
  const { guests, loading: guestsLoading, refresh: refreshGuests } = useGuests(eventId);
  const activityState = useActivityLogStore();

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id?: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [screenError, setScreenError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [eventDetails, setEventDetails] = useState({
    title: "Untitled Event",
    category: "Event",
    date: "",
    time: "",
    venue: "",
    description: "No description added yet.",
    theme: "Default Theme",
    coverImage: "",
  });

  const [rsvpSettings, setRsvpSettings] = useState({
    enabled: true,
    deadlineDate: '',
    deadlineTime: '',
    maxGuests: '0',
    allowPlusOnes: true,
  });

  const [rsvpQuestions, setRsvpQuestions] = useState<RSVPQuestion[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activityLog = eventId ? activityState.logsByEventId[eventId] ?? [] : [];
  const activityLoading = eventId ? !!activityState.loadingByEventId[eventId] : false;
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [selectedGuestDetails, setSelectedGuestDetails] = useState<EventGuest | null>(null);
  const [guestDetailsLoading, setGuestDetailsLoading] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [selectedGuestStatus, setSelectedGuestStatus] = useState<'going' | 'maybe' | 'pending' | 'not-going'>('pending');
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | 'messenger' | 'telegram'>('email');
  const [contactValue, setContactValue] = useState('');
  const [myRsvpEditing, setMyRsvpEditing] = useState(false);
  const [myRsvpStatus, setMyRsvpStatus] = useState<'going' | 'maybe' | 'not_going'>('going');
  const [myRsvpPlusOnes, setMyRsvpPlusOnes] = useState(0);
  const [myRsvpAnswers, setMyRsvpAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!event) return;

    setEventDetails({
      title: event.title,
      category: event.category_name || event.category_slug || 'Event',
      date: event.date || event.start_date || '',
      time: normalizeTime(event.time || event.start_time || ''),
      venue: event.location || event.venue_address || '',
      description: event.description || 'No description added yet.',
      theme: typeof event.theme === 'string' ? event.theme : event.theme?.name || 'Default Theme',
      coverImage: resolveMediaUrl(event.coverImage || event.cover_image) || '',
    });

    const deadline = splitApiDateTime(event.rsvp_deadline);
    setRsvpSettings({
      enabled: !!event.rsvp_enabled,
      deadlineDate: deadline.date,
      deadlineTime: deadline.time,
      maxGuests: String(event.max_guests || event.totalInvited || 0),
      allowPlusOnes: !!event.allow_plus_ones,
    });

    setRsvpQuestions(event.questions || []);

    if (event.guest) {
      const status = normalizeGuestStatus(event.guest.response_status || event.guest.status);
      setMyRsvpStatus(status === 'not_going' ? 'not_going' : (status as 'going' | 'maybe'));
      setMyRsvpPlusOnes(Number(event.guest.plus_ones || 0));
      setMyRsvpAnswers(
        (event.guest.answers || []).reduce<Record<string, string>>((answers, answer) => {
          if (!answer.question_id) return answers;
          const value = answer.answer && typeof answer.answer === 'object' && 'value' in answer.answer
            ? (answer.answer as any).value
            : answer.answer;
          answers[answer.question_id] = value ? String(value) : '';
          return answers;
        }, {}),
      );
    }
  }, [event]);

  useEffect(() => {
    if (!eventId) return;

    const loadExtra = async () => {
      try {
        const [questions] = await Promise.allSettled([
          rsvpApi.questions(eventId),
          activityLogStore.fetchActivityLogs(eventId),
        ]);

        if (questions.status === 'fulfilled') setRsvpQuestions(questions.value);
      } catch {
        // Event details and guests are enough for core management; logs are optional.
      }
    };

    loadExtra();
  }, [eventId]);

  const permissions = event?.permissions || {};
  const canManageEvent = permissions.role === 'host' || permissions.role === 'admin' || permissions.can_edit_event === true;
  const canViewGuestList = canManageEvent || permissions.can_view_guest_list !== false;

  const tabs = useMemo(() => {
    const allTabs: { id: TabType; label: string }[] = [
      { id: 'details', label: 'Details' },
      { id: 'rsvp', label: 'RSVP' },
      { id: 'guests', label: 'Guests' },
      { id: 'attendance', label: 'Attendance' },
      { id: 'updates', label: 'Updates' },
      { id: 'my-rsvp', label: 'My RSVP' },
    ];

    return allTabs.filter((tab) => {
      if (tab.id === 'rsvp' || tab.id === 'updates') return canManageEvent;
      if (tab.id === 'attendance') return canManageEvent;
      if (tab.id === 'guests') return canViewGuestList;
      if (tab.id === 'my-rsvp') return !canManageEvent && permissions.can_view_own_rsvp !== false && !!event?.guest;
      return true;
    });
  }, [canManageEvent, canViewGuestList, event?.guest, permissions.can_view_own_rsvp]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('details');
    }
  }, [activeTab, tabs]);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const showActionError = (message: string) => {
    setScreenError(message);
  };

  useEffect(() => {
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[event-management] eventId param', eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (event && (typeof __DEV__ === 'undefined' || __DEV__)) {
      console.log('[event-management] active event', {
        eventId: event.uuid || event.id,
        title: event.title,
      });
    }
  }, [event]);

  const safeGuests = Array.isArray(guests) ? guests : [];

  const filteredGuests = safeGuests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const status = normalizeStatus(guest.status || guest.response_status);
    const matchesFilter = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const guestStats = {
    going: safeGuests.filter((g) => normalizeStatus(g.status || g.response_status) === 'going').length,
    maybe: safeGuests.filter((g) => normalizeStatus(g.status || g.response_status) === 'maybe').length,
    pending: safeGuests.filter((g) => normalizeStatus(g.status || g.response_status) === 'pending').length,
    attended: safeGuests.filter((g) => g.attended).length,
  };

  const handleDelete = async () => {
    if (!eventId) return;

    if (deleteTarget?.type === 'event') {
      const response = await eventStore.archiveEvent(eventId);
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[event-management] archive event response', response);
      }
      setShowDeleteModal(false);
      showSuccessToast('Event moved to archive');
      router.replace('/tabs/events');
      return;
    }

    if (deleteTarget?.type === 'guest' && deleteTarget.id) {
      await guestStore.deleteGuest(eventId, deleteTarget.id);
      setShowDeleteModal(false);
      showSuccessToast('Guest removed successfully');
      return;
    }

    if (deleteTarget?.type === 'rsvp-question' && deleteTarget.id) {
      await rsvpApi.deleteQuestion(eventId, deleteTarget.id);
      setRsvpQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      await activityLogStore.fetchActivityLogs(eventId, { force: true });
      setShowDeleteModal(false);
      showSuccessToast('RSVP question deleted');
    }
  };

  const handleSaveEvent = async () => {
    if (!eventId) return;
    const errors: Record<string, string> = {};
    if (!eventDetails.title.trim()) {
      errors.title = 'Event title is required.';
    }
    if (!eventDetails.date.trim()) {
      errors.start_date = 'Event date is required.';
    }
    if (!eventDetails.time.trim()) {
      errors.start_time = 'Event time is required.';
    }
    if (
      eventDetails.date &&
      eventDetails.time &&
      !isFutureDateTime(eventDetails.date, eventDetails.time)
    ) {
      errors.start_time = 'Event start must be after the current time.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setScreenError('Please fix the highlighted fields.');
      return;
    }

    try {
      setSaving(true);
      setScreenError('');
      setFieldErrors({});
      const payload = {
        title: eventDetails.title,
        description: eventDetails.description,
        start_date: eventDetails.date,
        start_time: normalizeTime(eventDetails.time),
        venue_address: eventDetails.venue,
      };
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[event-management] update payload', { eventId, payload });
      }
      const updated = await eventsApi.update(eventId, payload);
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[event-management] update response', updated);
      }
      setEvent(updated);
      eventStore.updateEvent(updated);
      await activityLogStore.fetchActivityLogs(eventId, { force: true });
      setIsEditing(false);
      showSuccessToast('Event details saved successfully');
    } catch (error: any) {
      setScreenError(error.message || 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRsvp = async () => {
    if (!eventId) return;
    const errors: Record<string, string> = {};

    if (rsvpSettings.enabled) {
      if (!rsvpSettings.deadlineDate) errors.rsvp_deadline = 'RSVP deadline date is required.';
      if (!rsvpSettings.deadlineTime) errors.rsvp_deadline_time = 'RSVP deadline time is required.';
      if (
        rsvpSettings.deadlineDate &&
        rsvpSettings.deadlineTime &&
        !isFutureDateTime(rsvpSettings.deadlineDate, rsvpSettings.deadlineTime)
      ) {
        errors.rsvp_deadline_time = 'RSVP deadline must be in the future.';
      }
      if (
        rsvpSettings.deadlineDate &&
        rsvpSettings.deadlineTime &&
        !isBeforeDateTime(
          rsvpSettings.deadlineDate,
          rsvpSettings.deadlineTime,
          eventDetails.date,
          eventDetails.time,
        )
      ) {
        errors.rsvp_deadline = 'RSVP deadline must be before the event starts.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setScreenError('Please fix the highlighted fields.');
      return;
    }

    try {
      setFieldErrors({});
      const updated = await eventsApi.update(eventId, {
        rsvp_enabled: rsvpSettings.enabled,
        rsvp_deadline: rsvpSettings.enabled
          ? combineDateTimeForApi(rsvpSettings.deadlineDate, rsvpSettings.deadlineTime)
          : undefined,
        max_guests: Number(rsvpSettings.maxGuests) || undefined,
        allow_plus_ones: rsvpSettings.allowPlusOnes,
      });
      setEvent(updated);
      eventStore.updateEvent(updated);
      await activityLogStore.fetchActivityLogs(eventId, { force: true });
      showSuccessToast('RSVP settings saved successfully');
    } catch (error: any) {
      setScreenError(error.message || 'Unable to save RSVP settings.');
    }
  };

  const handleChangeCover = async () => {
    if (!eventId) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setScreenError('Photo library permission is required to change the cover.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      setSaving(true);
      setScreenError('');
      const asset = result.assets[0];
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[event-management] upload cover asset', {
          eventId,
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
        });
      }
      const updated = await eventsApi.uploadCover(
        eventId,
        imageUriToFormData('cover', asset.uri, asset.fileName || undefined, asset.mimeType || undefined),
      );
      setEvent(updated);
      eventStore.updateEvent(updated);
      setEventDetails((prev) => ({ ...prev, coverImage: withCacheBust(updated.coverImage || updated.cover_image) || asset.uri }));
      showSuccessToast('Cover updated successfully');
    } catch (error: any) {
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.warn('[event-management] cover upload failed', {
          message: error?.message,
          status: error?.status,
          errors: error?.errors,
        });
      }
      setScreenError(error.message || 'Unable to update cover.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!eventId) return;

    const question = await rsvpApi.createQuestion(eventId, {
      question: 'New Question',
      question_type: 'text',
      required: false,
    });
    setRsvpQuestions((prev) => [...prev, question]);
    await activityLogStore.fetchActivityLogs(eventId, { force: true });
    showSuccessToast('RSVP question added');
  };

  const handleAddGuest = async () => {
    if (!eventId) {
      setScreenError('Event not found.');
      return;
    }
    if (!newGuestName.trim()) {
      setScreenError('Guest name is required.');
      return;
    }
    if (!contactValue.trim()) {
      setScreenError(contactMethod === 'email' ? 'Email is required.' : 'Contact information is required.');
      return;
    }

    try {
      setScreenError('');
      const payload = {
        name: newGuestName.trim(),
        email: contactMethod === 'email' ? contactValue.trim() : undefined,
        phone_number: contactMethod !== 'email' ? contactValue.trim() : undefined,
        contact_method: contactMethod,
        contact_value: contactValue.trim(),
        response_status: selectedGuestStatus === 'not-going' ? 'not_going' : selectedGuestStatus,
        invite_status: 'pending',
      };
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[event-management] create guest payload', { eventId, payload });
      }
      await guestStore.addGuest(eventId, payload);

      setNewGuestName('');
      setSelectedGuestStatus('pending');
      setContactMethod('email');
      setContactValue('');
      setShowAddGuestModal(false);
      showSuccessToast('Guest added successfully');
    } catch (error: any) {
      setScreenError(error.message || 'Unable to add guest.');
    }
  };

  const handleUpdateOwnRsvp = async () => {
    if (!eventId || !event) return;

    try {
      setScreenError('');
      const response = await guestEventStore.updateOwnRsvp(eventId, {
        response_status: myRsvpStatus,
        plus_ones: myRsvpStatus === 'going' ? myRsvpPlusOnes : 0,
        answers: Object.entries(myRsvpAnswers).map(([question_id, answer]) => ({ question_id, answer })),
      });

      setEvent({
        ...event,
        guest: response.guest,
        permissions: {
          ...event.permissions,
          ...(response.permissions || {}),
        },
      });
      const currentGuests = guestStore.getSnapshot().guestsByEventId[eventId] ?? [];
      if (currentGuests.length > 0) {
        guestStore.hydrateGuests(
          eventId,
          currentGuests.map((guest) =>
            (guest.uuid || guest.id) === (response.guest.uuid || response.guest.id) ? response.guest : guest,
          ),
        );
      }
      setMyRsvpEditing(false);
      showSuccessToast('Your RSVP was updated');
    } catch (error: any) {
      setScreenError(error.message || 'Unable to update your RSVP.');
    }
  };

  const handleOpenGuestDetails = async (guest: EventGuest) => {
    setSelectedGuestDetails(guest);
    if (!eventId) return;

    try {
      setGuestDetailsLoading(true);
      const detailed = await guestStore.fetchGuestDetails(eventId, guest.uuid || guest.id);
      setSelectedGuestDetails(detailed);
    } catch (error: any) {
      setScreenError(error.message || 'Unable to load guest details.');
    } finally {
      setGuestDetailsLoading(false);
    }
  };

  const handleRefresh = () => {
    void safeRun(async () => {
      await Promise.all([
        reloadEvent(),
        refreshGuests(),
        eventId ? activityLogStore.fetchActivityLogs(eventId, { force: true }) : Promise.resolve([]),
      ]);
    }, 'Unable to refresh event.', showActionError);
  };

  if (!eventId) {
    return (
      <View className={`flex-1 items-center justify-center px-6 ${theme.page}`}>
        <Text className={`mb-3 text-xl font-black ${theme.headerText}`}>Missing Event</Text>
        <Text className={`mb-6 text-center text-sm ${theme.subText}`}>Open an event from My Events to manage it.</Text>
        <Pressable onPress={() => router.replace('/tabs/events')} className="rounded-xl bg-purple-600 px-5 py-3">
          <Text className="font-bold text-white">Back to Events</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${theme.page}`}>
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={eventLoading || guestsLoading} onRefresh={handleRefresh} />
        }
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
              {canManageEvent ? 'Event Management' : 'Event Details'}
            </Text>

            {canManageEvent ? (
              <Pressable
                onPress={() => router.push({ pathname: '/event-management-settings', params: { eventId } })}
                className={`h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
              >
                <MoreVertical color={theme.iconColor} size={20} />
              </Pressable>
            ) : (
              <View className="h-11 w-11" />
            )}
          </View>

          {(eventLoading || guestsLoading) && (
            <View className={`mb-4 rounded-[20px] border p-4 ${theme.surface}`}>
              <ActivityIndicator color="#9333ea" />
              <Text className={`mt-2 text-center text-sm font-semibold ${theme.subText}`}>
                Loading event...
              </Text>
            </View>
          )}

          {!!(eventError || screenError) && (
            <View className={`mb-4 rounded-[20px] border p-4 ${theme.surface}`}>
              <Text className="text-sm font-semibold text-red-500">
                {screenError || eventError}
              </Text>
            </View>
          )}

          <View
            className="mb-6 overflow-hidden"
            style={{
              borderRadius: 28,
            }}
          >
            {eventDetails.coverImage ? (
              <Image source={{ uri: eventDetails.coverImage }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
            ) : null}
            <LinearGradient
              colors={eventDetails.coverImage ? ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.78)'] : ['#a855f7', '#9333ea', '#ec4899']}
              className="min-h-[190px] justify-end p-5"
            >
              {canManageEvent && (
                <Pressable
                  onPress={() => {
                    void safeRun(handleChangeCover, 'Unable to update cover.', showActionError);
                  }}
                  disabled={saving}
                  className="absolute right-4 top-4 flex-row items-center gap-2 rounded-full bg-black/35 px-3 py-2"
                >
                  <Camera color="white" size={16} />
                  <Text className="text-xs font-black text-white">Change Cover</Text>
                </Pressable>
              )}

              <Text className="mb-1 text-2xl font-black text-white">
                {eventDetails.title}
              </Text>

              <View className="mb-3 flex-row items-center gap-2">
                <Calendar color="white" size={16} />
                <Text className="text-sm font-medium text-white/80">
                  {formatDateForDisplay(eventDetails.date) || eventDetails.date}
                </Text>
                <Clock color="white" size={16} />
                <Text className="text-sm font-medium text-white/80">
                  {formatTimeForDisplay(eventDetails.time) || eventDetails.time}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <MapPin color="white" size={16} />
                <Text numberOfLines={1} className="flex-1 text-sm font-medium text-white/80">
                  {eventDetails.venue}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {!canManageEvent && event?.guest && activeTab !== 'my-rsvp' && (
            <View className={`mb-6 rounded-[24px] border p-4 ${theme.surface}`}>
              <Text className={`mb-2 text-sm font-black ${theme.textOnSurface}`}>My RSVP</Text>
              <Text className={`text-sm font-semibold ${theme.subText}`}>
                Status: {formatGuestStatus(event.guest.response_status || event.guest.status)}
              </Text>
              <Text className={`mt-1 text-sm font-semibold ${theme.subText}`}>
                Plus ones: {event.guest.plus_ones ?? 0}
              </Text>
            </View>
          )}

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
                if (!saving) void safeRun(handleSaveEvent, 'Failed to update event.', showActionError);
              }}
              fieldErrors={fieldErrors}
              onDelete={() => {
                setDeleteTarget({ type: 'event' });
                setShowDeleteModal(true);
              }}
              canEdit={canManageEvent}
            />
          )}

          {activeTab === 'rsvp' && (
            <RSVPTab
              event={event}
              eventId={eventId}
              rsvpSettings={rsvpSettings}
              setRsvpSettings={setRsvpSettings}
              rsvpQuestions={rsvpQuestions}
              setRsvpQuestions={setRsvpQuestions}
              eventStartDate={eventDetails.date}
              fieldErrors={fieldErrors}
              onDeleteQuestion={(id: number) => {
                setDeleteTarget({ type: 'rsvp-question', id: String(id) });
                setShowDeleteModal(true);
              }}
              onAddQuestion={() => {
                void safeRun(handleAddQuestion, 'Failed to add RSVP question.', showActionError);
              }}
              onSave={() => {
                void safeRun(handleSaveRsvp, 'Failed to save RSVP settings.', showActionError);
              }}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsTab
              guests={filteredGuests}
              loading={guestsLoading}
              loaded={eventId ? !!guestStore.getSnapshot().loadedByEventId[eventId] : false}
              guestStats={guestStats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAddGuest={() => {
                setShowAddGuestModal(true);
              }}
              canAddGuest={canManageEvent && permissions.can_add_guest !== false}
              onDeleteGuest={(id: string) => {
                setDeleteTarget({ type: 'guest', id });
                setShowDeleteModal(true);
              }}
              canRemoveGuest={canManageEvent && permissions.can_remove_guest !== false}
              onOpenGuest={handleOpenGuestDetails}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab
              guests={safeGuests}
              loading={guestsLoading}
              loaded={eventId ? !!guestStore.getSnapshot().loadedByEventId[eventId] : false}
              attendedCount={guestStats.attended}
              onUpdateAttendance={(id: string, attended: boolean) => {
                if (!canManageEvent) return;
                void safeRun(async () => {
                  if (!eventId) throw new Error('Event not found.');
                  await guestStore.updateAttendance(eventId, id, attended);
                  showSuccessToast(attended ? 'Guest checked in' : 'Attendance reset');
                }, 'Failed to update attendance.', showActionError);
              }}
              canManageAttendance={canManageEvent && permissions.can_manage_attendance !== false}
            />
          )}

          {activeTab === 'updates' && <UpdatesTab logs={activityLog} loading={activityLoading} />}

          {activeTab === 'my-rsvp' && event?.guest && (
            <MyRsvpTab
              event={event}
              guest={event.guest}
              questions={rsvpQuestions}
              editing={myRsvpEditing}
              setEditing={setMyRsvpEditing}
              status={myRsvpStatus}
              setStatus={setMyRsvpStatus}
              plusOnes={myRsvpPlusOnes}
              setPlusOnes={setMyRsvpPlusOnes}
              answers={myRsvpAnswers}
              setAnswers={setMyRsvpAnswers}
              canUpdate={!!event.permissions?.can_update_own_rsvp}
              onSave={() => {
                void safeRun(handleUpdateOwnRsvp, 'Unable to update your RSVP.', showActionError);
              }}
            />
          )}
        </View>
      </ScrollView>

      <DeleteModal
        visible={showDeleteModal}
        target={deleteTarget}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={() => {
          void safeRun(handleDelete, 'Failed to delete item.', showActionError);
        }}
      />

      {canManageEvent && (
      <AddGuestModal
        visible={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        events={[{
          id: eventId,
          name: eventDetails.title,
          category: eventDetails.category,
          categoryColor: ['#9333ea', '#ec4899'],
          guests: safeGuests,
        }]}
        selectedEventId={eventId}
        setSelectedEventId={() => {}}
        newGuestName={newGuestName}
        setNewGuestName={setNewGuestName}
        selectedStatus={selectedGuestStatus}
        setSelectedStatus={setSelectedGuestStatus}
        contactMethod={contactMethod}
        setContactMethod={setContactMethod}
        contactValue={contactValue}
        setContactValue={setContactValue}
        onAddGuest={() => {
          void safeRun(handleAddGuest, 'Failed to add guest.', showActionError);
        }}
      />
      )}

      <GuestDetailsModal
        visible={!!selectedGuestDetails}
        guest={selectedGuestDetails}
        event={event}
        loading={guestDetailsLoading}
        canViewPrivate={event?.permissions?.can_view_guest_answers !== false}
        onClose={() => setSelectedGuestDetails(null)}
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

function normalizeStatus(status?: string) {
  const normalized = normalizeGuestStatus(status);
  return normalized === 'not_going' ? 'not-going' : normalized;
}

function formatGuestStatus(status?: string) {
  const normalized = normalizeStatus(status);
  if (normalized === 'going') return 'Going';
  if (normalized === 'maybe') return 'Maybe';
  if (normalized === 'not-going') return "Can't Go";
  return 'Pending';
}
