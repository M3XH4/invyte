import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  ClipboardCheck,
  Clock,
  HelpCircle,
  Plus,
  QrCode,
  Users,
  XCircle,
} from 'lucide-react-native';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DatePickerField from '@/components/date-picker-field';
import TimePickerField from '@/components/time-picker-field';
import { useScreenTheme } from '@/hooks/use-screen-theme';

export default function RSVPSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { category = 'birthday' } = useLocalSearchParams<{ category?: string }>();

  const [settings, setSettings] = useState({
    rsvpEnabled: true,
    responseOptions: ['going', 'maybe', 'cant-go'],
    rsvpDeadlineDate: '',
    rsvpDeadlineTime: '',
    maxGuests: '',
    allowExtraGuests: false,
    allowPlusOnes: true,
    maxCompanions: '1',
    requireApproval: false,
    checkInMethod: 'qr',
    reminders: ['3-days', 'event-day'],
    customQuestions: [] as string[],
  });

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleReminder = (reminder: string) => {
    const reminders = settings.reminders.includes(reminder)
      ? settings.reminders.filter((item) => item !== reminder)
      : [...settings.reminders, reminder];

    updateSetting('reminders', reminders);
  };

  const toggleResponseOption = (option: string) => {
    if (
      settings.responseOptions.length === 1 &&
      settings.responseOptions.includes(option)
    ) {
      return;
    }

    const responseOptions = settings.responseOptions.includes(option)
      ? settings.responseOptions.filter((item) => item !== option)
      : [...settings.responseOptions, option];

    updateSetting('responseOptions', responseOptions);
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-56 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-24 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="px-5">
          {/* Header */}
          <View className="mb-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/create-event-categories');
                }
              }}
              className={`h-10 w-10 items-center justify-center rounded-full shadow-sm ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>
            <Text className={`absolute left-0 right-0 text-center text-base font-bold ${theme.headerText}`}>
              RSVP & Attendance
            </Text>
          </View>

          {/* Progress Dots */}
          <View className="mb-8 flex-row items-center justify-center gap-2">
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
            <View className="h-2 w-2 rounded-full bg-purple-600" />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
          </View>

          <View className="gap-5">
            <SettingsCard>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                    Enable RSVP
                  </Text>
                  <Text className={`text-xs ${theme.subText}`}>
                    Allow guests to confirm if they are attending
                  </Text>
                </View>

                <Switch
                  value={settings.rsvpEnabled}
                  onValueChange={(value) => updateSetting('rsvpEnabled', value)}
                  trackColor={{ false: theme.isDarkMode ? '#334155' : '#d1d5db', true: '#9333ea' }}
                  thumbColor="#ffffff"
                />
              </View>
            </SettingsCard>

            {settings.rsvpEnabled && (
              <>
                <SettingsCard>
                  <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                    Guest Response Choices
                  </Text>
                  <Text className={`mb-3 text-xs ${theme.subText}`}>
                    Tap to enable/disable response options for your guests
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <ResponseChip
                      icon={CheckCircle}
                      label="Going"
                      color="#059669"
                      selected={settings.responseOptions.includes('going')}
                      onPress={() => toggleResponseOption('going')}
                    />
                    <ResponseChip
                      icon={HelpCircle}
                      label="Maybe"
                      color="#d97706"
                      selected={settings.responseOptions.includes('maybe')}
                      onPress={() => toggleResponseOption('maybe')}
                    />
                    <ResponseChip
                      icon={XCircle}
                      label="Can't Go"
                      color="#dc2626"
                      selected={settings.responseOptions.includes('cant-go')}
                      onPress={() => toggleResponseOption('cant-go')}
                    />
                  </View>

                  {settings.responseOptions.length === 1 && (
                    <Text className="mt-3 text-xs font-semibold text-purple-400">
                      At least one response option must be enabled
                    </Text>
                  )}
                </SettingsCard>

                <SettingsCard>
                  <Text className={`mb-3 text-base font-black ${theme.headerText}`}>
                    RSVP Deadline
                  </Text>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className={`mb-2 text-xs font-semibold ${theme.subText}`}>
                        Deadline Date
                      </Text>
                      <DatePickerField
                        value={settings.rsvpDeadlineDate}
                        onChange={(value) =>
                          updateSetting('rsvpDeadlineDate', value)
                        }
                        placeholder="Select date"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className={`mb-2 text-xs font-semibold ${theme.subText}`}>
                        Deadline Time
                      </Text>
                      <TimePickerField
                        value={settings.rsvpDeadlineTime}
                        onChange={(value) =>
                          updateSetting('rsvpDeadlineTime', value)
                        }
                        placeholder="Select time"
                      />
                    </View>
                  </View>
                </SettingsCard>

                <SettingsCard>
                  <Text className={`mb-3 text-base font-black ${theme.headerText}`}>
                    Maximum Guests
                  </Text>

                  <View className="gap-3">
                    <Input
                      value={settings.maxGuests}
                      onChangeText={(value) => updateSetting('maxGuests', value)}
                      placeholder="Enter max number of invited guests"
                      keyboardType="numeric"
                    />

                    <View className="flex-row items-center justify-between">
                      <Text className={`text-sm font-semibold ${theme.textOnSurface}`}>
                        Allow extra guests
                      </Text>

                      <Switch
                        value={settings.allowExtraGuests}
                        onValueChange={(value) =>
                          updateSetting('allowExtraGuests', value)
                        }
                        trackColor={{ false: theme.isDarkMode ? '#334155' : '#d1d5db', true: '#9333ea' }}
                        thumbColor="#ffffff"
                      />
                    </View>
                  </View>
                </SettingsCard>

                <SettingsCard>
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                        Allow Plus Ones
                      </Text>
                      <Text className={`text-xs ${theme.subText}`}>
                        Guests may bring additional companions
                      </Text>
                    </View>

                    <Switch
                      value={settings.allowPlusOnes}
                      onValueChange={(value) =>
                        updateSetting('allowPlusOnes', value)
                      }
                      trackColor={{ false: theme.isDarkMode ? '#334155' : '#d1d5db', true: '#9333ea' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {settings.allowPlusOnes && (
                    <View>
                      <Text className={`mb-2 text-xs font-semibold ${theme.subText}`}>
                        Max companions per guest
                      </Text>
                      <Input
                        value={settings.maxCompanions}
                        onChangeText={(value) =>
                          updateSetting('maxCompanions', value)
                        }
                        placeholder="1"
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </SettingsCard>

                <SettingsCard>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                        Require Organizer Approval
                      </Text>
                      <Text className={`text-xs ${theme.subText}`}>
                        New RSVP responses must be approved before being
                        confirmed
                      </Text>
                    </View>

                    <Switch
                      value={settings.requireApproval}
                      onValueChange={(value) =>
                        updateSetting('requireApproval', value)
                      }
                      trackColor={{ false: theme.isDarkMode ? '#334155' : '#d1d5db', true: '#9333ea' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </SettingsCard>
              </>
            )}

            <SettingsCard>
              <Text className={`mb-3 text-base font-black ${theme.headerText}`}>
                Check-In Method
              </Text>

              <View className="flex-row gap-2">
                <CheckInMethodCard
                  icon={QrCode}
                  label="QR Check-In"
                  selected={settings.checkInMethod === 'qr'}
                  onPress={() => updateSetting('checkInMethod', 'qr')}
                />
                <CheckInMethodCard
                  icon={ClipboardCheck}
                  label="Manual"
                  selected={settings.checkInMethod === 'manual'}
                  onPress={() => updateSetting('checkInMethod', 'manual')}
                />
                <CheckInMethodCard
                  icon={Users}
                  label="Both"
                  selected={settings.checkInMethod === 'both'}
                  onPress={() => updateSetting('checkInMethod', 'both')}
                />
              </View>
            </SettingsCard>

            {settings.rsvpEnabled && (
              <>
                <SettingsCard>
                  <Text className={`mb-1 text-base font-black ${theme.headerText}`}>
                    Custom Guest Questions
                  </Text>
                  <Text className={`mb-3 text-xs ${theme.subText}`}>
                    Ask guests extra questions before they submit their RSVP
                  </Text>

                  <View className="mb-3 gap-2">
                    <QuestionSample
                      label="Food preference"
                      placeholder="Vegetarian, Vegan, No preference"
                    />
                    <QuestionSample
                      label="Allergies"
                      placeholder="Any dietary restrictions?"
                    />
                    <QuestionSample
                      label="Song request"
                      placeholder="What song gets you dancing?"
                    />
                    <QuestionSample
                      label="Notes to organizer"
                      placeholder="Any special requests?"
                    />
                  </View>

                  <Pressable className={`h-11 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed ${theme.isDarkMode ? 'border-purple-400/40 bg-white/5' : 'border-purple-300 bg-purple-50'}`}>
                    <Plus color={theme.isDarkMode ? '#d8b4fe' : '#7e22ce'} size={16} />
                    <Text className={`text-sm font-bold ${theme.isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                      Add Question
                    </Text>
                  </Pressable>
                </SettingsCard>

                <SettingsCard>
                  <Text className={`mb-3 text-base font-black ${theme.headerText}`}>
                    Send RSVP Reminder
                  </Text>

                  <View className="gap-2">
                    <ReminderOption
                      icon={Clock}
                      label="1 day before deadline"
                      selected={settings.reminders.includes('1-day')}
                      onPress={() => toggleReminder('1-day')}
                    />
                    <ReminderOption
                      icon={Clock}
                      label="3 days before event"
                      selected={settings.reminders.includes('3-days')}
                      onPress={() => toggleReminder('3-days')}
                    />
                    <ReminderOption
                      icon={Bell}
                      label="On event day"
                      selected={settings.reminders.includes('event-day')}
                      onPress={() => toggleReminder('event-day')}
                    />
                  </View>
                </SettingsCard>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom buttons */}
      <View
        className={`absolute left-0 right-0 border-t px-5 pt-4 ${theme.divider} ${theme.isDarkMode ? 'bg-[#070812]' : 'bg-white'}`}
        style={{ bottom: 0, paddingBottom: insets.bottom + 16 }}
      >
        <MotiPressable
          onPress={() => router.push(`/create-event-theme-selection?category=${category}`)}
          animate={({ pressed }) => {
            "worklet";
            return { scale: pressed ? 0.98 : 1 };
          }}
        >
          <LinearGradient
            colors={["#9333ea", "#a855f7", "#ec4899"]}
            className="h-14 flex-row items-center justify-center gap-2"
            style={{
              borderRadius: 24
            }}
          >
            <Text className="text-base font-bold text-white">Continue</Text>
          </LinearGradient>
        </MotiPressable>
      </View>
    </LinearGradient>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  const theme = useScreenTheme();

  return (
    <View className={`rounded-2xl border p-5 shadow-sm ${theme.surface}`}>
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
      className={`h-11 rounded-xl border px-4 text-sm ${theme.surface} ${theme.textOnSurface}`}
    />
  );
}

function ResponseChip({
  icon: Icon,
  label,
  color,
  selected,
  onPress,
}: {
  icon: any;
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useScreenTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-xl border-2 px-4 py-2.5 ${theme.isDarkMode ? 'bg-white/5' : ''}`}
      style={{
        borderColor: selected ? color : '#e5e7eb',
        backgroundColor: selected ? `${color}20` : (theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#f9fafb'),
        opacity: selected ? 1 : 0.6,
      }}
    >
      <Icon color={selected ? color : theme.chevronColor} size={16} />
      <Text
        className="text-sm font-bold"
        style={{ color: selected ? color : theme.mutedText }}
      >
        {label}
      </Text>

      {selected && (
        <View
          className="ml-1 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </Pressable>
  );
}

function CheckInMethodCard({
  icon: Icon,
  label,
  selected,
  onPress,
}: {
  icon: any;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useScreenTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 ${theme.isDarkMode ? 'bg-white/5' : ''}`}
      style={{
        borderColor: selected ? '#a855f7' : '#e5e7eb',
        backgroundColor: selected ? 'rgba(168, 85, 247, 0.12)' : (theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff'),
      }}
    >
      <Icon color={selected ? '#d8b4fe' : theme.chevronColor} size={24} />
      <Text
        className="text-center text-xs font-bold"
        style={{ color: selected ? '#e9d5ff' : (theme.isDarkMode ? '#cbd5e1' : '#4b5563') }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function QuestionSample({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  const theme = useScreenTheme();

  return (
    <View className={`rounded-xl border p-3 ${theme.surfaceMuted} ${theme.divider}`}>
      <Text className={`mb-1 text-xs font-semibold ${theme.subText}`}>
        {label}
      </Text>
      <Text className={`text-xs ${theme.mutedText}`}>{placeholder}</Text>
    </View>
  );
}

function ReminderOption({
  icon: Icon,
  label,
  selected,
  onPress,
}: {
  icon: any;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useScreenTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-xl border-2 p-3 ${theme.isDarkMode ? 'bg-white/5' : ''}`}
      style={{
        borderColor: selected ? '#a855f7' : '#e5e7eb',
        backgroundColor: selected ? 'rgba(168, 85, 247, 0.12)' : (theme.isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff'),
      }}
    >
      <View
        className="h-5 w-5 items-center justify-center rounded-md border-2"
        style={{
          backgroundColor: selected ? '#9333ea' : 'transparent',
          borderColor: selected ? '#9333ea' : '#d1d5db',
        }}
      >
        {selected && <CheckCircle color="white" size={14} fill="white" />}
      </View>

      <Icon color={selected ? '#d8b4fe' : theme.chevronColor} size={16} />

      <Text
        className="text-sm font-semibold"
        style={{ color: selected ? '#e9d5ff' : (theme.isDarkMode ? '#cbd5e1' : '#374151') }}
      >
        {label}
      </Text>
    </Pressable>
  );
}