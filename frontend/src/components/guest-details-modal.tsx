import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle, Clock, Mail, User, Users, X } from 'lucide-react-native';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { formatCheckedInAt, formatDateTimeForDisplay } from '@/utils/dateTime';
import type { Event } from '@/types/event';
import type { EventGuest } from '@/types/guest';

type Props = {
  visible: boolean;
  guest?: EventGuest | null;
  event?: Event | null;
  loading?: boolean;
  canViewPrivate?: boolean;
  onClose: () => void;
};

export default function GuestDetailsModal({ visible, guest, event, loading, canViewPrivate = true, onClose }: Props) {
  const theme = useScreenTheme();
  const answers = Array.isArray(guest?.answers) ? guest.answers : [];
  const relatedEvent = event || guest?.event;
  const eventDateTime = formatDateTimeForDisplay(
    relatedEvent?.date || relatedEvent?.start_date || '',
    relatedEvent?.time || relatedEvent?.start_time || '',
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/55">
        <View className={`max-h-[88%] rounded-t-[34px] border px-5 pb-6 pt-4 ${theme.surfaceStrong}`}>
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <LinearGradient colors={['#9333ea', '#ec4899']} className="h-11 w-11 items-center justify-center rounded-2xl">
                <User color="white" size={20} />
              </LinearGradient>
              <View>
                <Text className={`text-xl font-black ${theme.headerText}`}>Guest Details</Text>
                <Text className={`text-xs font-semibold ${theme.subText}`}>
                  {loading ? 'Loading latest details...' : relatedEvent?.title || 'RSVP guest'}
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} className={`h-10 w-10 items-center justify-center rounded-2xl ${theme.surfaceMuted}`}>
              <X color={theme.iconColor} size={18} />
            </Pressable>
          </View>

          {!guest ? (
            <View className="items-center py-10">
              <Text className={`text-sm font-semibold ${theme.subText}`}>
                {loading ? 'Loading guest...' : 'No guest selected.'}
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View className={`rounded-[24px] border p-4 ${theme.surface}`}>
                  <Text className={`mb-1 text-2xl font-black ${theme.textOnSurface}`}>{guest.name}</Text>
                  {canViewPrivate && !!guest.email && (
                    <View className="mt-2 flex-row items-center gap-2">
                      <Mail color={theme.chevronColor} size={15} />
                      <Text className={`text-sm font-semibold ${theme.subText}`}>{guest.email}</Text>
                    </View>
                  )}
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    <Badge label={statusLabel(guest.response_status || guest.status)} color={statusColor(guest.response_status || guest.status)} />
                    <Badge label={`${guest.plus_ones ?? 0} plus ones`} color="#9333ea" />
                    <Badge label={guest.attended ? 'Checked in' : 'Not checked in'} color={guest.attended ? '#059669' : '#6b7280'} />
                  </View>
                </View>

                {!!relatedEvent?.title && (
                  <View className={`rounded-[24px] border p-4 ${theme.surface}`}>
                    <Text className={`mb-3 text-base font-black ${theme.textOnSurface}`}>Related Event</Text>
                    <Info icon={Calendar} label="Event" value={relatedEvent.title} />
                    {!!eventDateTime && <Info icon={Clock} label="Date & time" value={eventDateTime} />}
                  </View>
                )}

                {canViewPrivate && (
                  <>
                    <View className={`rounded-[24px] border p-4 ${theme.surface}`}>
                      <Text className={`mb-3 text-base font-black ${theme.textOnSurface}`}>Timeline</Text>
                      <Info icon={Clock} label="Invited" value={formatDateTimeForDisplay(guest.invited_at || '') || 'Not sent'} />
                      <Info icon={CheckCircle} label="Responded" value={formatDateTimeForDisplay(guest.responded_at || '') || 'No response yet'} />
                      <Info icon={Users} label="Attendance" value={guest.checked_in_at ? formatCheckedInAt(guest.checked_in_at) : 'Not checked in'} />
                    </View>

                    <View className={`rounded-[24px] border p-4 ${theme.surface}`}>
                      <Text className={`mb-3 text-base font-black ${theme.textOnSurface}`}>RSVP Answers</Text>
                      {answers.length === 0 ? (
                        <Text className={`text-sm font-semibold ${theme.subText}`}>No custom answers yet.</Text>
                      ) : (
                        answers.map((answer, index) => (
                          <View key={answer.id || `${answer.question_id}-${index}`} className={`mb-3 rounded-2xl p-3 ${theme.surfaceMuted}`}>
                            <Text className={`mb-1 text-xs font-black uppercase ${theme.subText}`}>
                              {answer.question || 'Question'}
                            </Text>
                            <Text className={`text-sm font-bold ${theme.textOnSurface}`}>{answerValue(answer.answer)}</Text>
                          </View>
                        ))
                      )}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${color}20` }}>
      <Text className="text-xs font-black" style={{ color }}>{label}</Text>
    </View>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  const theme = useScreenTheme();
  return (
    <View className="mb-3 flex-row items-start gap-3">
      <Icon color={theme.chevronColor} size={16} />
      <View className="flex-1">
        <Text className={`text-xs font-semibold ${theme.subText}`}>{label}</Text>
        <Text className={`text-sm font-bold ${theme.textOnSurface}`}>{value}</Text>
      </View>
    </View>
  );
}

function statusLabel(status?: string) {
  if (status === 'going') return 'Going';
  if (status === 'maybe') return 'Maybe';
  if (status === 'not_going' || status === 'not-going') return "Can't Go";
  return 'Pending';
}

function statusColor(status?: string) {
  if (status === 'going') return '#059669';
  if (status === 'maybe') return '#d97706';
  if (status === 'not_going' || status === 'not-going') return '#dc2626';
  return '#9333ea';
}

function answerValue(answer: unknown) {
  if (answer && typeof answer === 'object' && 'value' in answer) {
    return String((answer as any).value ?? 'No answer');
  }
  if (answer === null || answer === undefined || answer === '') return 'No answer';
  return typeof answer === 'string' ? answer : JSON.stringify(answer);
}
