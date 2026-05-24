import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, CheckCircle, Clock, HelpCircle, MapPin, Minus, Plus, Send, Users, XCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { publicRsvpApi } from '@/api/publicRsvpApi';
import { useAuth } from '@/hooks/useAuth';
import { guestEventStore } from '@/store/guestEventStore';
import { formatDateForDisplay, formatDateTimeForDisplay, formatTimeForDisplay } from '@/utils/dateTime';
import { getEventComputedStatus, isEventRsvpOpen } from '@/utils/eventStatus';
import type { Event } from '@/types/event';
import type { EventGuest } from '@/types/guest';

const fallbackCover = 'https://www.magicjumprentals.com/clients/3/assets/girl_birthday_party.jpg';

const responseOptions = [
  { value: 'going', label: 'Going', subtitle: "I'll be there!", icon: CheckCircle, colors: ['#10b981', '#059669'], color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'maybe', label: 'Maybe', subtitle: 'Not sure yet', icon: HelpCircle, colors: ['#f59e0b', '#d97706'], color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'not_going', label: "Can't Go", subtitle: "Can't make it", icon: XCircle, colors: ['#ef4444', '#dc2626'], color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
] as const;

export default function PublicRsvpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug = '' } = useLocalSearchParams<{ slug?: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRespondedGuest, setAlreadyRespondedGuest] = useState<EventGuest | null>(null);
  const [error, setError] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<'going' | 'maybe' | 'not_going' | null>(null);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [bringingPlusOne, setBringingPlusOne] = useState(false);
  const [plusOnes, setPlusOnes] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.name && !guestName) setGuestName(user.name);
    if (user?.email && !guestEmail) setGuestEmail(user.email);
  }, [guestEmail, guestName, user?.email, user?.name]);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError('');
        if (!slug) throw new Error('Missing RSVP link.');
        const nextEvent = await publicRsvpApi.getEvent(slug);
        setEvent(nextEvent);
        if (user?.email) {
          const myRsvp = await publicRsvpApi.myRsvp(slug);
          if (myRsvp.already_responded && myRsvp.guest) setAlreadyRespondedGuest(myRsvp.guest);
        }
      } catch (error: any) {
        setError(error.message || 'Unable to load RSVP event.');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [slug, user?.email]);

  const eventDate = formatDateForDisplay(event?.date || event?.start_date || '') || 'Event date';
  const eventTime = formatTimeForDisplay(event?.time || event?.start_time || '') || 'Event time';
  const deadline = event?.rsvp_deadline ? formatDateTimeForDisplay(event.rsvp_deadline) : '';
  const publicGuests = Array.isArray(event?.guests) ? event.guests : [];
  const maxCompanions = Math.max(1, Number(event?.max_companions || 1));
  const eventStatus = event ? getEventComputedStatus(event) : 'upcoming';
  const rsvpOpen = event ? isEventRsvpOpen(event) : false;

  const handleSubmit = async () => {
    if (!event || !selectedResponse) return;
    if (!guestName.trim()) {
      setError('Your name is required.');
      return;
    }
    if (!guestEmail.trim()) {
      setError('Your email is required.');
      return;
    }

    const missingRequired = (event.questions || []).find((question) => question.required && !answers[question.id]?.trim());
    if (missingRequired) {
      setError(`Please answer: ${missingRequired.question}`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const existing = await publicRsvpApi.myRsvp(slug, guestEmail.trim());
      if (existing.already_responded && existing.guest) {
        setAlreadyRespondedGuest(existing.guest);
        return;
      }

      const response = await publicRsvpApi.submit(slug, {
        name: guestName.trim(),
        email: guestEmail.trim(),
        response_status: selectedResponse,
        plus_ones: bringingPlusOne ? plusOnes : 0,
        answers: Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer })),
      });

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[public-rsvp] submitted RSVP', {
          slug,
          guestId: response.guest?.uuid || response.guest?.id,
          stats: response.event_stats,
        });
      }

      setSubmitted(true);
      if (response.event) {
        guestEventStore.addGuestEvent({
          ...response,
          event: response.event,
          permissions: {
            role: 'guest',
            can_view_details: true,
            can_view_guest_list: !!response.event.show_guest_list,
            can_edit_event: false,
            can_add_guest: false,
            can_delete_event: false,
            can_manage_attendance: false,
          },
        } as any);
      }
      if (user) guestEventStore.fetchGuestEvents().catch(() => undefined);
    } catch (error: any) {
      if (error?.code === 'ALREADY_RESPONDED' && error?.data?.guest) {
        setAlreadyRespondedGuest(error.data.guest);
        return;
      }
      setError(error.message || 'Unable to submit RSVP.');
      Alert.alert('Unable to submit RSVP', error.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#111027', '#241445', '#120d24']} className="flex-1">
      <View className="absolute right-4 top-20 h-64 w-64 rounded-full bg-purple-500/20" />
      <View className="absolute -left-16 bottom-32 h-72 w-72 rounded-full bg-pink-500/15" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 34 }}
      >
        <View className="px-6">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/tabs');
              }}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10"
            >
              <ArrowLeft color="white" size={20} />
            </Pressable>
            <Text className="text-xl font-black text-white">Guest RSVP</Text>
            <View className="h-11 w-11" />
          </View>

          {loading ? (
            <Panel>
              <ActivityIndicator color="white" />
              <Text className="mt-3 text-center text-sm font-semibold text-white/70">Loading event...</Text>
            </Panel>
          ) : error && !event ? (
            <Panel>
              <Text className="text-center text-base font-black text-red-100">{error}</Text>
            </Panel>
          ) : event ? (
            <>
              <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} className="mb-6 overflow-hidden rounded-[30px]">
                <Image source={{ uri: event.coverImage || event.cover_image || fallbackCover }} className="h-56 w-full" resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} className="absolute inset-0 justify-end p-5">
                  <Text className="text-3xl font-black text-white">{event.title}</Text>
                  <View className="mt-3 gap-2">
                    <Info icon={Calendar} text={eventDate} />
                    <Info icon={Clock} text={eventTime} />
                    <Info icon={MapPin} text={event.location || event.venue_address || 'Event location'} />
                  </View>
                </LinearGradient>
              </MotiView>

              <Panel>
                <Text className="mb-2 text-lg font-black text-white">Event Details</Text>
                {!!event.description && <Text className="mb-3 text-sm font-semibold leading-5 text-white/70">{event.description}</Text>}
                {!!deadline && <Text className="text-xs font-bold text-fuchsia-100">RSVP deadline: {deadline}</Text>}
              </Panel>

              {eventStatus === 'past' ? (
                <Panel>
                  <Text className="mb-2 text-center text-xl font-black text-white">This event has already passed</Text>
                  <Text className="text-center text-sm font-semibold leading-5 text-white/70">
                    RSVP responses are closed for {event.title}.
                  </Text>
                </Panel>
              ) : !rsvpOpen ? (
                <Panel>
                  <Text className="mb-2 text-center text-xl font-black text-white">RSVP Closed</Text>
                  <Text className="text-center text-sm font-semibold leading-5 text-white/70">
                    This RSVP is no longer accepting responses.
                  </Text>
                </Panel>
              ) : submitted ? (
                <Panel>
                  <View className="mx-auto mb-4 h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20">
                    <CheckCircle color="#34d399" size={34} />
                  </View>
                  <Text className="mb-2 text-center text-xl font-black text-white">RSVP Sent</Text>
                  <Text className="text-center text-sm font-semibold leading-5 text-white/70">
                    Thanks, {guestName}. Your response was saved for {event.title}.
                  </Text>
                </Panel>
              ) : (
                <>
                  <Panel>
                    <Text className="mb-4 text-lg font-black text-white">Your Response</Text>
                    <View className="mb-4 gap-3">
                      {responseOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedResponse === option.value;
                        return (
                          <Pressable key={option.value} onPress={() => setSelectedResponse(option.value)} className="overflow-hidden rounded-[20px]">
                            {isSelected ? (
                              <LinearGradient colors={option.colors} className="flex-row items-center gap-3 p-4">
                                <Icon color="white" size={24} />
                                <View className="flex-1">
                                  <Text className="text-base font-black text-white">{option.label}</Text>
                                  <Text className="text-xs font-semibold text-white/80">{option.subtitle}</Text>
                                </View>
                                <CheckCircle color="white" size={20} />
                              </LinearGradient>
                            ) : (
                              <View className="flex-row items-center gap-3 border-2 p-4" style={{ backgroundColor: option.bg, borderColor: option.border }}>
                                <Icon color={option.color} size={24} />
                                <View className="flex-1">
                                  <Text className="text-base font-black text-gray-900">{option.label}</Text>
                                  <Text className="text-xs font-semibold text-gray-500">{option.subtitle}</Text>
                                </View>
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>

                    <Field label="Your Name" value={guestName} onChangeText={setGuestName} placeholder="Enter your name" />
                    <Field label="Email" value={guestEmail} onChangeText={setGuestEmail} placeholder="you@example.com" keyboardType="email-address" />
                    {selectedResponse === 'going' && event.allow_plus_ones && (
                      <PlusOnePicker
                        bringingPlusOne={bringingPlusOne}
                        plusOnes={plusOnes}
                        maxCompanions={maxCompanions}
                        onToggle={(enabled) => {
                          setBringingPlusOne(enabled);
                          setPlusOnes(enabled ? Math.max(1, plusOnes || 1) : 0);
                        }}
                        onChange={setPlusOnes}
                      />
                    )}
                  </Panel>

                  {(event.questions || []).length > 0 && (
                    <Panel>
                      <Text className="mb-4 text-lg font-black text-white">RSVP Questions</Text>
                      {(event.questions || []).map((question) => (
                        <Field
                          key={question.id}
                          label={`${question.question}${question.required ? ' *' : ''}`}
                          value={answers[question.id] || ''}
                          onChangeText={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                          placeholder={question.placeholder || 'Your answer'}
                        />
                      ))}
                    </Panel>
                  )}

                  {!!error && (
                    <View className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/10 p-4">
                      <Text className="text-sm font-bold text-red-100">{error}</Text>
                    </View>
                  )}

                  <MotiPressable
                    disabled={submitting || !selectedResponse}
                    onPress={handleSubmit}
                    animate={({ pressed }) => {
                      'worklet';
                      return { scale: pressed ? 0.97 : 1 };
                    }}
                    style={{ overflow: 'hidden', borderRadius: 24, opacity: selectedResponse ? 1 : 0.55 }}
                  >
                    <LinearGradient colors={['#9333ea', '#ec4899']} className="h-14 flex-row items-center justify-center gap-2">
                      {submitting ? <ActivityIndicator color="white" /> : <Send color="white" size={20} />}
                      <Text className="text-base font-black text-white">Submit RSVP</Text>
                    </LinearGradient>
                  </MotiPressable>
                </>
              )}

              {event.show_guest_list && publicGuests.length > 0 && (
                <Panel>
                  <View className="mb-3 flex-row items-center gap-2">
                    <Users color="#f0abfc" size={18} />
                    <Text className="text-lg font-black text-white">Guest List</Text>
                  </View>
                  {publicGuests.slice(0, 20).map((guest, index) => (
                    <View key={`public-guest-${guest.uuid || guest.id || guest.name}-${index}`} className="mb-2 flex-row items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                      <Text className="font-bold text-white">{guest.name}</Text>
                      <Text className="text-xs font-bold text-white/65">{statusLabel(guest.response_status)}</Text>
                    </View>
                  ))}
                </Panel>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={!!alreadyRespondedGuest} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full rounded-[28px] border border-white/10 bg-[#1f1638] p-6">
            <View className="mx-auto mb-4 h-16 w-16 items-center justify-center rounded-full bg-amber-400/15">
              <CheckCircle color="#facc15" size={34} />
            </View>
            <Text className="mb-2 text-center text-xl font-black text-white">
              You already responded
            </Text>
            <Text className="mb-6 text-center text-sm font-semibold leading-5 text-white/70">
              This RSVP has already been submitted for {alreadyRespondedGuest?.email || alreadyRespondedGuest?.name}.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setAlreadyRespondedGuest(null)}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-white/10"
              >
                <Text className="font-bold text-white">Close</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (user && event) {
                    router.replace({
                      pathname: '/event-management',
                      params: { eventId: event.uuid || event.id },
                    });
                    return;
                  }

                  setAlreadyRespondedGuest(null);
                }}
                className="h-12 flex-1 overflow-hidden rounded-xl"
              >
                <LinearGradient colors={['#9333ea', '#ec4899']} className="h-full items-center justify-center">
                  <Text className="font-bold text-white">View Event</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <View className="mb-5 rounded-[26px] border border-white/10 bg-white/10 p-5">{children}</View>;
}

function Info({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon color="white" size={15} />
      <Text className="flex-1 text-sm font-bold text-white/85">{text}</Text>
    </View>
  );
}

function PlusOnePicker({
  bringingPlusOne,
  plusOnes,
  maxCompanions,
  onToggle,
  onChange,
}: {
  bringingPlusOne: boolean;
  plusOnes: number;
  maxCompanions: number;
  onToggle: (enabled: boolean) => void;
  onChange: (value: number) => void;
}) {
  const nextValue = Math.min(maxCompanions, Math.max(1, plusOnes || 1));

  return (
    <View className="mb-3">
      <Text className="mb-2 text-sm font-bold text-white/75">Will you bring a plus one?</Text>
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => onToggle(false)}
          className={`h-12 flex-1 items-center justify-center rounded-xl border ${
            !bringingPlusOne ? 'border-white/40 bg-white/25' : 'border-white/10 bg-white/10'
          }`}
        >
          <Text className="text-sm font-black text-white">No plus one</Text>
        </Pressable>
        <Pressable
          onPress={() => onToggle(true)}
          className={`h-12 flex-1 items-center justify-center rounded-xl border ${
            bringingPlusOne ? 'border-fuchsia-300/70 bg-fuchsia-400/25' : 'border-white/10 bg-white/10'
          }`}
        >
          <Text className="text-sm font-black text-white">Bringing a plus one</Text>
        </Pressable>
      </View>

      {bringingPlusOne && maxCompanions > 1 && (
        <View className="mt-3 flex-row items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2">
          <Pressable
            onPress={() => onChange(Math.max(1, nextValue - 1))}
            className="h-9 w-9 items-center justify-center rounded-lg bg-white/10"
          >
            <Minus color="white" size={16} />
          </Pressable>
          <Text className="text-base font-black text-white">{nextValue}</Text>
          <Pressable
            onPress={() => onChange(Math.min(maxCompanions, nextValue + 1))}
            className="h-9 w-9 items-center justify-center rounded-lg bg-white/10"
          >
            <Plus color="white" size={16} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View className="mb-3">
      <Text className="mb-2 text-sm font-bold text-white/75">{label}</Text>
      <TextInput
        {...inputProps}
        placeholderTextColor="rgba(255,255,255,0.45)"
        className="h-12 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white"
      />
    </View>
  );
}

function statusLabel(status?: string) {
  if (status === 'going') return 'Going';
  if (status === 'maybe') return 'Maybe';
  if (status === 'not_going' || status === 'not-going') return "Can't Go";
  return 'Pending';
}
