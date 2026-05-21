// app/rsvp-preview.tsx

import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  HelpCircle,
  MapPin,
  Send,
  XCircle,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

const fallbackCover =
  'https://www.magicjumprentals.com/clients/3/assets/girl_birthday_party.jpg';

const rsvpQuestions = [
  {
    id: 1,
    question: 'Food preference',
    placeholder: 'Vegetarian, Vegan, No preference',
  },
  {
    id: 2,
    question: 'Song request',
    placeholder: 'What song gets you dancing?',
  },
];

const responseOptions = [
  {
    value: 'going',
    label: 'Going',
    subtitle: "I'll be there!",
    icon: CheckCircle,
    colors: ['#10b981', '#059669'],
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    subtitle: 'Not sure yet',
    icon: HelpCircle,
    colors: ['#f59e0b', '#d97706'],
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    value: 'cant-go',
    label: "Can't Go",
    subtitle: "Can't make it",
    icon: XCircle,
    colors: ['#ef4444', '#dc2626'],
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
];

export default function RSVPPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { event } = useLocalSearchParams<{ event?: string }>();

  const selectedEvent = event ? JSON.parse(event) : null;

  const [selectedResponse, setSelectedResponse] = useState<
    'going' | 'maybe' | 'cant-go' | null
  >(null);
  const [additionalGuests, setAdditionalGuests] = useState('0');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const eventDetails = {
    title: selectedEvent?.title ?? "Aryan's Birthday",
    date: selectedEvent?.date ?? 'May 28, 2026',
    time: selectedEvent?.time ?? '7:00 PM',
    location:
      selectedEvent?.location ??
      selectedEvent?.venue ??
      'The Grove Resort, Davao City',
    description:
      selectedEvent?.description ??
      "Let's celebrate and make awesome memories together! Join us for an unforgettable night filled with fun, laughter, and great vibes.",
    coverImage: selectedEvent?.coverImage ?? fallbackCover,
    organizer: selectedEvent?.organizer ?? 'Argyle',
  };

  const handleSubmit = () => {
    Alert.alert(
      'Preview Mode',
      'This is a preview! Your guests will submit their RSVP responses here.'
    );
  };

  return (
    <View className={`flex-1 ${theme.page}`}>
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />

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
              onPress={() =>
                router.push({
                  pathname: '/event-management',
                  params: { event },
                })
              }
              className={`h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>

            <Text className={`text-xl font-black ${theme.headerText}`}>
              RSVP Preview
            </Text>

            <View className="h-11 w-11" />
          </View>

          <MotiView
            from={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mb-6 rounded-[24px] border p-4 ${theme.surface}`}
          >
            <View className="flex-row items-center gap-3">
              <View className={`h-10 w-10 items-center justify-center rounded-xl ${theme.surfaceMuted}`}>
                <Eye color="#2563eb" size={20} />
              </View>

              <View className="flex-1">
                <Text className={`text-sm font-black ${theme.headerText}`}>
                  Guest Preview Mode
                </Text>
                <Text className={`text-xs font-medium ${theme.subText}`}>
                  This is what your guests will see
                </Text>
              </View>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mb-6 h-48 overflow-hidden rounded-[28px] shadow-lg"
          >
            <Image
              source={{ uri: eventDetails.coverImage }}
              className="h-full w-full"
              resizeMode="cover"
            />

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              className="absolute inset-0"
            />

            <View className="absolute bottom-4 left-4 right-4">
              <Text className="mb-1 text-2xl font-black text-white">
                {eventDetails.title}
              </Text>
              <Text className="text-sm font-medium text-white/80">
                Hosted by {eventDetails.organizer}
              </Text>
            </View>
          </MotiView>

          <Card>
            <Text className={`mb-4 text-lg font-black ${theme.headerText}`}>
              Event Details
            </Text>

            <View className="mb-4 gap-3">
              <InfoRow icon={Calendar} label="Date" value={eventDetails.date} />
              <InfoRow icon={Clock} label="Time" value={eventDetails.time} />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={eventDetails.location}
              />
            </View>

            <View className={`rounded-xl p-4 ${theme.surfaceMuted}`}>
              <Text className={`text-sm font-medium leading-5 ${theme.subText}`}>
                {eventDetails.description}
              </Text>
            </View>
          </Card>

          <Card>
            <Text className="mb-2 text-lg font-black text-gray-900">
              Your Response
            </Text>
            <Text className="mb-4 text-sm font-medium text-gray-500">
              Will you be attending?
            </Text>

            <View className="mb-4 gap-3">
              {responseOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedResponse === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedResponse(option.value as any)}
                    className="overflow-hidden rounded-[20px]"
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={option.colors as [string, string]}
                        className="flex-row items-center gap-3 p-4"
                      >
                        <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                          <Icon color="white" size={24} />
                        </View>

                        <View className="flex-1">
                          <Text className="text-base font-black text-white">
                            {option.label}
                          </Text>
                          <Text className="text-xs font-medium text-white/80">
                            {option.subtitle}
                          </Text>
                        </View>

                        <View className="h-6 w-6 items-center justify-center rounded-full bg-white">
                          <CheckCircle
                            color={option.color}
                            size={20}
                            fill={option.color}
                          />
                        </View>
                      </LinearGradient>
                    ) : (
                      <View
                        className="flex-row items-center gap-3 border-2 p-4"
                        style={{
                          backgroundColor: option.bg,
                          borderColor: option.border,
                        }}
                      >
                        <View className="h-12 w-12 items-center justify-center rounded-xl bg-white">
                          <Icon color={option.color} size={24} />
                        </View>

                        <View className="flex-1">
                          <Text className="text-base font-black text-gray-900">
                            {option.label}
                          </Text>
                          <Text className="text-xs font-medium text-gray-500">
                            {option.subtitle}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {selectedResponse === 'going' && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-bold text-gray-700">
                  Additional Guests
                </Text>
                <Input
                  value={additionalGuests}
                  onChangeText={setAdditionalGuests}
                  keyboardType="numeric"
                  placeholder="Number of additional guests"
                />
              </View>
            )}
          </Card>

          {selectedResponse && selectedResponse !== 'cant-go' && (
            <Card>
              <Text className="mb-4 text-lg font-black text-gray-900">
                Additional Information
              </Text>

              <View className="gap-4">
                {rsvpQuestions.map((question) => (
                  <View key={question.id}>
                    <Text className="mb-2 text-sm font-bold text-gray-700">
                      {question.question}
                    </Text>
                    <Input
                      value={answers[question.id] || ''}
                      onChangeText={(value) =>
                        setAnswers({ ...answers, [question.id]: value })
                      }
                      placeholder={question.placeholder}
                    />
                  </View>
                ))}
              </View>
            </Card>
          )}

          <MotiPressable
            onPress={handleSubmit}
            disabled={!selectedResponse}
            animate={({ pressed }) => {
              'worklet';
              return { scale: pressed ? 0.97 : 1 };
            }}
            style={{
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: 8,
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
              backgroundColor: selectedResponse ? '#9333ea' : '#e5e7eb',
            }}
          >
            <Send
              color={selectedResponse ? 'white' : '#9ca3af'}
              size={20}
              strokeWidth={2.5}
            />
            <Text
              className={`text-base font-black ${
                selectedResponse ? 'text-white' : 'text-gray-400'
              }`}
            >
              Submit RSVP
            </Text>
          </MotiPressable>

          <Text className="mt-4 text-center text-xs font-semibold text-gray-400">
            This is a preview. Guests will see this when they open your
            invitation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mb-6 rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm"
    >
      {children}
    </MotiView>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
        <Icon color="#9333ea" size={20} />
      </View>

      <View className="flex-1">
        <Text className="text-xs font-semibold text-gray-500">{label}</Text>
        <Text className="text-sm font-bold text-gray-900">{value}</Text>
      </View>
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#9ca3af"
      className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900"
    />
  );
}