import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  HelpCircle,
  Plus,
  QrCode,
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import DatePickerField from '@/components/date-picker-field';
import TimePickerField from '@/components/time-picker-field';
import { formatCheckedInAt, formatDateForDisplay, formatDateTimeForDisplay, formatTimeForDisplay } from '@/utils/dateTime';
export function DetailsTab({
  eventDetails,
  setEventDetails,
  isEditing,
  setIsEditing,
  onSave,
  onDelete,
  fieldErrors = {},
}: any) {
  const theme = useScreenTheme();

  return (
    <View className="gap-4">
      <Card>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className={`text-lg font-black ${theme.headerText}`}>Event Details</Text>

          {!isEditing ? (
            <Pressable
              onPress={() => setIsEditing(true)}
              className={`flex-row items-center gap-2 rounded-xl px-4 py-2 ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}
            >
              <Edit3 color={theme.isDarkMode ? '#d8b4fe' : '#7e22ce'} size={16} />
              <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Edit</Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setIsEditing(false)}
                className={`flex-row items-center gap-2 rounded-xl px-3 py-2 ${theme.surfaceMuted}`}
              >
                <X color={theme.iconColor} size={16} />
                <Text className={`text-sm font-bold ${theme.textOnSurface}`}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={onSave}
                className="flex-row items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2"
              >
                <Save color="white" size={16} />
                <Text className="text-sm font-bold text-white">Save</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="gap-4">
          <Field label="Event Title">
            <Input
              value={eventDetails.title}
              editable={isEditing}
              onChangeText={(value) =>
                setEventDetails({ ...eventDetails, title: value })
              }
            />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Date">
                {isEditing ? (
                  <DatePickerField
                    value={eventDetails.date}
                    onChange={(value) => setEventDetails({ ...eventDetails, date: value })}
                    minimumDate={new Date()}
                    error={fieldErrors.start_date}
                  />
                ) : (
                  <ReadOnlyValue value={eventDetails.date} type="date" />
                )}
              </Field>
            </View>

            <View className="flex-1">
              <Field label="Time">
                {isEditing ? (
                  <TimePickerField
                    value={eventDetails.time}
                    onChange={(value) => setEventDetails({ ...eventDetails, time: value })}
                    selectedDate={eventDetails.date}
                    preventPastTime
                    error={fieldErrors.start_time}
                  />
                ) : (
                  <ReadOnlyValue value={eventDetails.time} type="time" />
                )}
              </Field>
            </View>
          </View>

          <Field label="Venue Address">
            <Input
              value={eventDetails.venue}
              editable={isEditing}
              onChangeText={(value) =>
                setEventDetails({ ...eventDetails, venue: value })
              }
            />
          </Field>

          <Field label="Description">
            <Input
              value={eventDetails.description}
              editable={isEditing}
              multiline
              onChangeText={(value) =>
                setEventDetails({ ...eventDetails, description: value })
              }
            />
          </Field>

          <Field label="Theme">
            <View className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 ${theme.isDarkMode ? 'border-white/10 bg-white/5' : 'border-purple-200 bg-purple-50'}`}>
              <LinearGradient
                colors={['#9333ea', '#ec4899']}
                className="h-10 w-10 rounded-lg"
              />
              <Text className={`text-sm font-bold ${theme.textOnSurface}`}>
                {eventDetails.theme}
              </Text>
            </View>
          </Field>
        </View>
      </Card>

      <Pressable
        onPress={onDelete}
        className={`flex-row items-center justify-center gap-2 rounded-[20px] border-2 px-5 py-4 ${theme.isDarkMode ? 'border-red-400/30 bg-red-500/10' : 'border-red-200 bg-red-50'}`}
      >
        <Trash2 color="#dc2626" size={20} />
        <Text className={`text-sm font-black ${theme.isDarkMode ? 'text-red-200' : 'text-red-700'}`}>Move to Archive</Text>
      </Pressable>
    </View>
  );
}

export function RSVPTab({
  event,
  eventId,
  rsvpSettings,
  setRsvpSettings,
  rsvpQuestions,
  setRsvpQuestions,
  eventStartDate,
  fieldErrors = {},
  onDeleteQuestion,
  onAddQuestion,
  onSave,
}: any) {
  const theme = useScreenTheme();
  const safeQuestions = Array.isArray(rsvpQuestions) ? rsvpQuestions : [];

  const addQuestion = () => {
    if (onAddQuestion) {
      onAddQuestion();
      return;
    }

    setRsvpQuestions([
      ...safeQuestions,
      {
        id: Date.now(),
        question: 'New Question',
        placeholder: 'Enter your answer',
      },
    ]);
  };

  return (
    <View className="gap-4">
      <Card>
        <Text className={`mb-4 text-lg font-black ${theme.headerText}`}>
          RSVP Settings
        </Text>

        <View className="gap-4">
          <View className={`flex-row items-center justify-between rounded-xl p-3 ${theme.surfaceMuted}`}>
            <Text className={`text-sm font-bold ${theme.textOnSurface}`}>RSVP Enabled</Text>
            <Switch
              value={rsvpSettings.enabled}
              onValueChange={(value) =>
                setRsvpSettings({ ...rsvpSettings, enabled: value })
              }
              trackColor={{ false: theme.isDarkMode ? '#334155' : '#d1d5db', true: '#9333ea' }}
              thumbColor="#ffffff"
            />
          </View>

          <Field label="RSVP Deadline">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <DatePickerField
                  value={rsvpSettings.deadlineDate}
                  onChange={(value) => setRsvpSettings({ ...rsvpSettings, deadlineDate: value })}
                  minimumDate={new Date()}
                  maximumDate={eventStartDate ? new Date(`${eventStartDate}T00:00:00`) : undefined}
                  error={fieldErrors.rsvp_deadline}
                />
              </View>
              <View className="flex-1">
                <TimePickerField
                  value={rsvpSettings.deadlineTime}
                  onChange={(value) => setRsvpSettings({ ...rsvpSettings, deadlineTime: value })}
                  selectedDate={rsvpSettings.deadlineDate}
                  preventPastTime
                  error={fieldErrors.rsvp_deadline_time}
                />
              </View>
            </View>
            {!!rsvpSettings.deadlineDate && !!rsvpSettings.deadlineTime && (
              <Text className={`mt-2 text-xs font-semibold ${theme.subText}`}>
                RSVP deadline: {formatDateTimeForDisplay(rsvpSettings.deadlineDate, rsvpSettings.deadlineTime)}
              </Text>
            )}
          </Field>

          <Field label="Maximum Guests">
            <Input
              value={String(rsvpSettings.maxGuests)}
              keyboardType="numeric"
              onChangeText={(value) =>
                setRsvpSettings({ ...rsvpSettings, maxGuests: value })
              }
            />
          </Field>

          <View className={`flex-row items-center justify-between rounded-xl p-3 ${theme.surfaceMuted}`}>
            <Text className={`text-sm font-bold ${theme.textOnSurface}`}>
              Allow Plus Ones
            </Text>
            <Switch
              value={rsvpSettings.allowPlusOnes}
              onValueChange={(value) =>
                setRsvpSettings({ ...rsvpSettings, allowPlusOnes: value })
              }
              trackColor={{ false: theme.isDarkMode ? '#334155' : '#d1d5db', true: '#9333ea' }}
              thumbColor="#ffffff"
            />
          </View>

          <Pressable
            onPress={onSave}
            className="overflow-hidden rounded-[20px]"
          >
            <LinearGradient
              colors={['#9333ea', '#ec4899']}
              className="flex-row items-center justify-center gap-2 px-5 py-4"
            >
              <Save color="white" size={20} />
              <Text className="text-sm font-black text-white">
                Save RSVP Settings
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Card>

      <Card>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className={`text-lg font-black ${theme.headerText}`}>
            Custom RSVP Questions
          </Text>

          <Pressable
            onPress={addQuestion}
            className={`flex-row items-center gap-2 rounded-xl px-4 py-2 ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}
          >
            <Plus color={theme.isDarkMode ? '#d8b4fe' : '#7e22ce'} size={16} />
            <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Add</Text>
          </Pressable>
        </View>

        <View className="gap-3">
          {safeQuestions.map((question: any) => (
            <View
              key={question.id}
              className={`flex-row items-center gap-3 rounded-xl border p-4 ${theme.surfaceSoft}`}
            >
              <View className="flex-1">
                <Text className={`mb-1 text-sm font-bold ${theme.textOnSurface}`}>
                  {question.question}
                </Text>
                <Text className={`text-xs ${theme.subText}`}>
                  {question.placeholder}
                </Text>
              </View>

              <Pressable
                onPress={() => onDeleteQuestion(question.id)}
                className={`h-9 w-9 items-center justify-center rounded-lg ${theme.isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}
              >
                <Trash2 color="#dc2626" size={16} />
              </Pressable>
            </View>
          ))}
        </View>
      </Card>

      <Pressable
        onPress={() =>
          router.push({
            pathname: '/event-rsvp-preview',
            params: { eventId },
          })
        }
        className="overflow-hidden rounded-[20px]">
        <LinearGradient
          colors={['#06b6d4', '#2563eb']}
          className="flex-row items-center justify-center gap-2 px-5 py-4"
        >
          <Eye color="white" size={20} />
          <Text className="text-sm font-black text-white">
            Preview Guest RSVP View
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

export function GuestsTab({
  guests = [],
  loading,
  loaded,
  guestStats,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onAddGuest,
  onDeleteGuest,
  onOpenGuest,
}: any) {
  const theme = useScreenTheme();
  const safeGuests = Array.isArray(guests) ? guests : [];
  const stats = guestStats ?? {};

  return (
    <View className="gap-4">
      <View className="flex-row gap-2.5">
        <StatCard label="Going" value={stats.going ?? 0} color="#059669" />
        <StatCard label="Maybe" value={stats.maybe ?? 0} color="#d97706" />
        <StatCard label="Pending" value={stats.pending ?? 0} color="#9333ea" />
        <StatCard label="Total" value={safeGuests.length} color="#4b5563" />
      </View>

      <View className="flex-row gap-3">
        <View className={`h-12 flex-1 flex-row items-center rounded-2xl border px-4 ${theme.surface}`}>
          <Search color={theme.chevronColor} size={16} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search guests..."
            placeholderTextColor={theme.chevronColor}
            className={`ml-3 flex-1 text-sm ${theme.textOnSurface}`}
          />
        </View>

        <Pressable
          onPress={onAddGuest}
          className="overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={['#9333ea', '#ec4899']}
            className="h-12 w-12 items-center justify-center"
          >
            <UserPlus color="white" size={20} />
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pb-2">
          {['all', 'going', 'maybe', 'pending', 'not-going'].map((status) => {
            const active = statusFilter === status;

            return (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 ${active ? 'bg-purple-600' : `border ${theme.divider} ${theme.surface}`
                  }`}
              >
                <Text
                  className={`text-xs font-bold ${active ? 'text-white' : theme.textOnSurfaceSecondary
                    }`}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'not-going'
                      ? "Can't Go"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="gap-3">
        {loading && !loaded ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#9333ea" />
            <Text className={`mt-3 font-medium ${theme.subText}`}>Loading guests...</Text>
          </View>
        ) : safeGuests.length === 0 ? (
          <View className="items-center py-12">
            <Users color={theme.chevronColor} size={48} />
            <Text className={`mt-3 font-medium ${theme.subText}`}>
              No guests yet
            </Text>
          </View>
        ) : (
          safeGuests.map((guest: any) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onPress={() => onOpenGuest?.(guest)}
              onDelete={() => onDeleteGuest(guest.id)}
            />
          ))
        )}
      </View>
    </View>
  );
}

export function AttendanceTab({
  guests = [],
  loading,
  loaded,
  attendedCount,
  onUpdateAttendance,
}: any) {
  const theme = useScreenTheme();
  const safeGuests = Array.isArray(guests) ? guests : [];

  return (
    <Card>
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className={`text-lg font-black ${theme.headerText}`}>
            Check-In Status
          </Text>
          <Text className={`text-sm font-medium ${theme.subText}`}>
            {attendedCount ?? 0} of {safeGuests.length} checked in
          </Text>
        </View>

        <Pressable className={`flex-row items-center gap-2 rounded-xl px-4 py-2 ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}>
          <QrCode color={theme.isDarkMode ? '#d8b4fe' : '#7e22ce'} size={16} />
          <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Scan QR</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {loading && !loaded ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#9333ea" />
            <Text className={`mt-3 font-medium ${theme.subText}`}>Loading attendance...</Text>
          </View>
        ) : safeGuests.length === 0 ? (
          <View className="items-center py-12">
            <Users color={theme.chevronColor} size={48} />
            <Text className={`mt-3 font-medium ${theme.subText}`}>
              No guests to check in yet
            </Text>
          </View>
        ) : safeGuests.map((guest: any) => (
          <View
            key={guest.id}
            className={`flex-row items-center justify-between rounded-xl border p-4 ${theme.surfaceSoft}`}
          >
            <View className="flex-1">
              <Text className={`mb-1 text-base font-bold ${theme.textOnSurface}`}>
                {guest.name}
              </Text>

              {guest.attended && (guest.checkedInAt || guest.checked_in_at) && (
                <Text className="text-xs font-semibold text-emerald-600">
                  {formatCheckedInAt(guest.checkedInAt || guest.checked_in_at)}
                </Text>
              )}
            </View>

            {guest.attended ? (
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-1.5">
                  <Check color="#059669" size={16} />
                  <Text className="text-xs font-bold text-emerald-700">
                    Present
                  </Text>
                </View>

                <Pressable
                  onPress={() => onUpdateAttendance(guest.id, false)}
                  className={`h-9 w-9 items-center justify-center rounded-lg ${theme.isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}
                >
                  <X color="#dc2626" size={16} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => onUpdateAttendance(guest.id, true)}
                className={`rounded-lg px-4 py-2 ${theme.isDarkMode ? 'bg-white/5' : 'bg-purple-50'}`}
              >
                <Text className={`text-xs font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                  Check In
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

export function UpdatesTab({ logs, loading }: any) {
  const theme = useScreenTheme();
  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <Card>
      <Text className={`mb-4 text-lg font-black ${theme.headerText}`}>
        Latest Updates
      </Text>

      <View className="gap-3">
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#9333ea" />
            <Text className={`mt-3 font-medium ${theme.subText}`}>Loading updates...</Text>
          </View>
        ) : safeLogs.length === 0 ? (
          <View className="items-center py-12">
            <Clock color={theme.chevronColor} size={48} />
            <Text className={`mt-3 font-medium ${theme.subText}`}>
              No updates yet
            </Text>
          </View>
        ) : safeLogs.map((log: any) => {
          const config =
            log.type === 'guest_added' || log.type === 'event_created' || log.type === 'create'
              ? { icon: Plus, color: '#059669', bg: '#ecfdf5' }
              : log.type === 'guest_removed' || log.type === 'delete'
                ? { icon: Trash2, color: '#dc2626', bg: '#fef2f2' }
                : { icon: Edit3, color: '#2563eb', bg: '#eff6ff' };

          const Icon = config.icon;

          return (
            <View
              key={log.id}
              className={`flex-row items-start gap-3 rounded-xl border p-4 ${theme.surfaceSoft}`}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: config.bg }}
              >
                <Icon color={config.color} size={20} />
              </View>

              <View className="flex-1">
                <Text className={`mb-1 text-sm font-bold ${theme.textOnSurface}`}>
                  {log.action}
                </Text>
                {!!log.description && (
                  <Text className={`mb-1 text-xs font-medium ${theme.subText}`}>
                    {log.description}
                  </Text>
                )}
                <Text className={`text-xs font-medium ${theme.subText}`}>
                  {log.timestamp}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export function DeleteModal({ visible, target, onCancel, onDelete }: any) {
  const theme = useScreenTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className={`w-full rounded-[28px] p-6 shadow-2xl ${theme.surfaceStrong}`}>
          <View className="mx-auto mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle color="#dc2626" size={32} />
          </View>

          <Text className={`mb-2 text-center text-xl font-black ${theme.headerText}`}>
            Confirm Delete
          </Text>

          <Text className={`mb-6 text-center text-sm ${theme.subText}`}>
            {target?.type === 'event' &&
              'This event will be moved to archive. You can restore it later.'}
            {target?.type === 'rsvp-question' &&
              'Are you sure you want to delete this RSVP question?'}
            {target?.type === 'guest' &&
              'Are you sure you want to remove this guest?'}
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className={`h-12 flex-1 items-center justify-center rounded-xl ${theme.surfaceMuted}`}
            >
              <Text className={`text-sm font-bold ${theme.textOnSurface}`}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onDelete}
              className="h-12 flex-1 overflow-hidden rounded-xl"
            >
              <LinearGradient
                colors={['#dc2626', '#e11d48']}
                className="h-full items-center justify-center"
              >
                <Text className="text-sm font-bold text-white">
                  {target?.type === 'event' ? 'Archive' : 'Delete'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GuestCard({ guest, onDelete, onPress }: any) {
  const theme = useScreenTheme();
  const config = getStatusConfig(guest.status || guest.response_status);
  const StatusIcon = config.icon;

  return (
    <View className={`rounded-2xl border p-4 shadow-sm ${theme.surface}`}>
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onPress} className="flex-1">
          <Text className={`mb-1 text-base font-bold ${theme.textOnSurface}`}>
            {guest.name}
          </Text>
          <Text className={`mb-2 text-sm font-medium ${theme.subText}`}>
            {guest.email}
          </Text>

          <View
            className="self-start flex-row items-center gap-1.5 rounded-full border px-3 py-1"
            style={{
              backgroundColor: config.bg,
              borderColor: config.border,
            }}
          >
            <StatusIcon color={config.color} size={14} />
            <Text style={{ color: config.color }} className="text-xs font-bold">
              {config.label}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onDelete}
          className={`h-9 w-9 items-center justify-center rounded-lg ${theme.isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}
        >
          <Trash2 color="#dc2626" size={16} />
        </Pressable>
      </View>
    </View>
  );
}

function StatCard({ label, value, color }: any) {
  const theme = useScreenTheme();

  return (
    <View className={`flex-1 rounded-2xl border p-3 shadow-sm ${theme.surface}`}>
      <Text style={{ color }} className="text-center text-xl font-black">
        {value}
      </Text>
      <Text className={`text-center text-[10px] font-bold ${theme.subText}`}>
        {label}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const theme = useScreenTheme();

  return (
    <View className={`rounded-[24px] border p-5 shadow-sm ${theme.surface}`}>
      {children}
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const theme = useScreenTheme();

  return (
    <View>
      <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const theme = useScreenTheme();

  return (
    <TextInput
      {...props}
      placeholderTextColor={theme.chevronColor}
      textAlignVertical={props.multiline ? 'top' : 'center'}
      className={`rounded-xl border px-4 text-sm font-medium ${theme.textOnSurface} ${props.editable === false
          ? `${theme.divider} ${theme.surfaceMuted}`
          : theme.surface
        } ${props.multiline ? 'min-h-[110px] py-3' : 'h-12'}`}
    />
  );
}

function ReadOnlyValue({ value, type }: { value: string; type: 'date' | 'time' }) {
  const theme = useScreenTheme();
  const displayValue = type === 'date' ? formatDateForDisplay(value) : formatTimeForDisplay(value);

  return (
    <View className={`h-12 justify-center rounded-xl border px-4 ${theme.divider} ${theme.surfaceMuted}`}>
      <Text className={`text-sm font-medium ${theme.textOnSurface}`}>
        {displayValue || value || 'Not set'}
      </Text>
    </View>
  );
}

function getStatusConfig(status: string) {
  const normalized = status === 'not_going' || status === 'cant_go' ? 'not-going' : status;
  const configs: Record<string, any> = {
    going: {
      label: 'Going',
      icon: CheckCircle,
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    },
    maybe: {
      label: 'Maybe',
      icon: HelpCircle,
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      color: '#9333ea',
      bg: '#faf5ff',
      border: '#e9d5ff',
    },
    'not-going': {
      label: "Can't Go",
      icon: XCircle,
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
    },
  };

  return configs[normalized] || configs.pending;
}
