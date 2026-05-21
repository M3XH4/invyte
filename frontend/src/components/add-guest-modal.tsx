import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mail,
  MessageCircle,
  Send,
  X,
  UserPlus,
  CheckCircle,
  HelpCircle,
  Clock,
  XCircle,
} from 'lucide-react-native';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type GuestStatus = 'going' | 'maybe' | 'pending' | 'not-going';
type ContactMethod = 'email' | 'whatsapp' | 'messenger' | 'telegram';

export default function AddGuestModal({
  visible,
  onClose,
  events,
  selectedEventId,
  setSelectedEventId,
  newGuestName,
  setNewGuestName,
  selectedStatus,
  setSelectedStatus,
  contactMethod,
  setContactMethod,
  contactValue,
  setContactValue,
  onAddGuest,
}: any) {
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();

  const statusConfig = {
    going: { label: 'Going', icon: CheckCircle, bg: '#ecfdf5', text: '#059669' },
    maybe: { label: 'Maybe', icon: HelpCircle, bg: '#fffbeb', text: '#d97706' },
    pending: { label: 'Pending', icon: Clock, bg: '#faf5ff', text: '#9333ea' },
    'not-going': { label: 'Not Going', icon: XCircle, bg: '#fef2f2', text: '#dc2626' },
  };

  const contactMethods = [
    { id: 'email', label: 'Email', icon: Mail, color: '#2563eb' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#16a34a' },
    { id: 'messenger', label: 'Messenger', icon: Send, color: '#9333ea' },
    { id: 'telegram', label: 'Telegram', icon: Send, color: '#0891b2' },
  ];

  const disabled = !newGuestName.trim() || !contactValue.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-end bg-black/55">
        <MotiView
          from={{ translateY: 400 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className={`w-full rounded-t-[32px] ${theme.surfaceStrong}`}
          style={{ paddingBottom: insets.bottom + 24, maxHeight: '90%' }}
        >
          <View className="items-center py-3">
            <View className={`h-1.5 w-14 rounded-full ${theme.mutedText}`} />
          </View>

          <View className="mb-6 flex-row items-center justify-between px-5">
            <View>
              <Text className={`text-2xl font-black ${theme.headerText}`}>Add Guest</Text>
              <Text className={`text-sm ${theme.subText}`}>Invite someone to your event</Text>
            </View>

            <Pressable
              onPress={onClose}
              className={`h-10 w-10 items-center justify-center rounded-full ${theme.surfaceMuted}`}
            >
              <X color={theme.iconColor} size={20} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>Select Event</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {events.map((event: any) => {
                const selected = selectedEventId === event.id;

                return (
                  <Pressable
                    key={event.id}
                    onPress={() => setSelectedEventId(event.id)}
                    className={`min-w-[130px] rounded-2xl border p-3 ${
                      selected ? 'border-purple-500 bg-purple-500/10' : theme.surface
                    }`}
                  >
                    <LinearGradient
                      colors={event.categoryColor}
                      className="mb-2 h-10 w-10 items-center justify-center rounded-xl"
                    >
                      <Image source={event.categoryIcon} className="h-6 w-6" resizeMode="contain" />
                    </LinearGradient>

                    <Text numberOfLines={1} className={`text-sm font-bold ${selected ? 'text-fuchsia-300' : theme.textOnSurface}`}>
                      {event.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="mt-5">
              <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>Guest Name</Text>
              <TextInput
                value={newGuestName}
                onChangeText={setNewGuestName}
                placeholder="Enter guest name"
                placeholderTextColor={theme.chevronColor}
                className={`h-12 rounded-xl border px-4 text-sm ${theme.surface} ${theme.textOnSurface}`}
              />
            </View>

            <View className="mt-5">
              <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>Contact Method</Text>

              <View className="flex-row flex-wrap gap-3">
                {contactMethods.map((method) => {
                  const selected = contactMethod === method.id;
                  const Icon = method.icon;

                  return (
                    <Pressable
                      key={method.id}
                      onPress={() => setContactMethod(method.id as ContactMethod)}
                      className={`flex-1 rounded-2xl border p-2 ${
                        selected ? 'border-purple-500 bg-purple-500/10' : theme.surface
                      }`}
                    >
                      <View className="items-center">
                        <View
                          className="mb-2 h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: selected ? method.color : '#334155' }}
                        >
                          <Icon color="white" size={18} />
                        </View>

                        <Text className={`text-xs font-bold ${selected ? 'text-fuchsia-300' : theme.subText}`}>
                          {method.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-5">
              <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>
                {contactMethod === 'email' ? 'Email Address' : 'Contact Information'}
              </Text>

              <TextInput
                value={contactValue}
                onChangeText={setContactValue}
                placeholder={contactMethod === 'email' ? 'example@email.com' : '@username or phone number'}
                placeholderTextColor={theme.chevronColor}
                keyboardType={contactMethod === 'email' ? 'email-address' : 'default'}
                autoCapitalize="none"
                className={`h-12 rounded-xl border px-4 text-sm ${theme.surface} ${theme.textOnSurface}`}
              />
            </View>

            <View className="mt-5">
              <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>RSVP Status</Text>

              <View className="gap-3">
                {Object.entries(statusConfig).map(([key, status]: any) => {
                  const Icon = status.icon;
                  const selected = selectedStatus === key;

                  return (
                    <Pressable
                      key={key}
                      onPress={() => setSelectedStatus(key as GuestStatus)}
                      className={`flex-row items-center rounded-2xl border p-4 ${
                        selected ? 'border-purple-500 bg-purple-500/10' : theme.surface
                      }`}
                    >
                      <View
                        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: status.bg }}
                      >
                        <Icon color={status.text} size={18} />
                      </View>

                      <Text className={`flex-1 font-bold ${selected ? 'text-fuchsia-300' : theme.textOnSurface}`}>
                        {status.label}
                      </Text>

                      <View
                        className={`h-5 w-5 rounded-full border-2 ${
                          selected ? 'border-purple-600 bg-purple-600' : 'border-gray-500'
                        }`}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <MotiPressable
              onPress={onAddGuest}
              disabled={disabled}
              animate={({ pressed }) => {
                'worklet';
                return { scale: pressed ? 0.97 : 1 };
              }}
              style={{ marginTop: 32 }}
            >
              <LinearGradient
                colors={['#9333ea', '#a855f7', '#ec4899']}
                className={`h-14 flex-row items-center justify-center gap-2 ${
                  disabled ? 'opacity-50' : ''
                }`}
                style={{ borderRadius: 28 }}
              >
                <UserPlus color="white" size={20} />
                <Text className="text-base font-bold text-white">Add Guest</Text>
              </LinearGradient>
            </MotiPressable>
          </ScrollView>
        </MotiView>
      </View>
    </Modal>
  );
}