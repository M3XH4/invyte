import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CalendarDays, Check, Clock3, Globe, Languages } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { getPreference, setPreference } from '@/utils/preferences';

const languages = ['English (US)', 'English (UK)', 'Filipino', 'Spanish', 'Japanese'];
const dateFormats = ['MMM D, YYYY', 'D MMM YYYY', 'YYYY-MM-DD'];
const timeFormats = ['12-hour', '24-hour'];
const weekStarts = ['Sunday', 'Monday'];
const LANGUAGE_KEY = 'invyte_language';
const LANGUAGE_SETTINGS_KEY = 'invyte_language_settings';

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const [selected, setSelected] = useState('English (US)');
  const [dateFormat, setDateFormat] = useState('MMM D, YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');
  const [weekStart, setWeekStart] = useState('Sunday');

  useEffect(() => {
    getPreference(LANGUAGE_KEY).then((stored) => {
      if (stored && languages.includes(stored)) setSelected(stored);
    });

    getPreference(LANGUAGE_SETTINGS_KEY).then((stored) => {
      if (!stored) return;

      try {
        const settings = JSON.parse(stored);
        if (dateFormats.includes(settings.dateFormat)) setDateFormat(settings.dateFormat);
        if (timeFormats.includes(settings.timeFormat)) setTimeFormat(settings.timeFormat);
        if (weekStarts.includes(settings.weekStart)) setWeekStart(settings.weekStart);
      } catch {
        // Keep defaults if local preferences are malformed.
      }
    });
  }, []);

  const persistSettings = (next: Partial<{ language: string; dateFormat: string; timeFormat: string; weekStart: string }>) => {
    const settings = {
      language: next.language ?? selected,
      dateFormat: next.dateFormat ?? dateFormat,
      timeFormat: next.timeFormat ?? timeFormat,
      weekStart: next.weekStart ?? weekStart,
    };

    setSelected(settings.language);
    setDateFormat(settings.dateFormat);
    setTimeFormat(settings.timeFormat);
    setWeekStart(settings.weekStart);
    setPreference(LANGUAGE_KEY, settings.language);
    setPreference(LANGUAGE_SETTINGS_KEY, JSON.stringify(settings));
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
        <View className="px-5">
          <Header title="Language" onBack={() => router.back()} />

          <View className={`mb-5 rounded-[24px] border p-5 ${theme.surface}`}>
            <View className="mb-4 flex-row items-center gap-3">
              <LinearGradient colors={['#4ade80', '#16a34a']} className="h-12 w-12 items-center justify-center rounded-2xl">
                <Languages color="white" size={24} />
              </LinearGradient>
              <View className="flex-1">
                <Text className={`text-lg font-black ${theme.headerText}`}>Regional Preferences</Text>
                <Text className={`text-sm ${theme.subText}`}>Controls app text, dates, times, and calendar layout.</Text>
              </View>
            </View>
            <View className={`rounded-2xl p-4 ${theme.surfaceMuted}`}>
              <Text className={`text-xs font-bold uppercase ${theme.subText}`}>Preview</Text>
              <Text className={`mt-1 text-base font-black ${theme.textOnSurface}`}>
                {selected} · {dateFormat} · {timeFormat} · Week starts {weekStart}
              </Text>
            </View>
          </View>

          <SectionTitle title="App Language" />
          <View className="gap-3">
            {languages.map((language) => {
              const active = selected === language;
              return (
                <Pressable key={language} onPress={() => persistSettings({ language })} className={`rounded-[22px] border p-4 ${active ? 'border-purple-500 bg-purple-500/10' : theme.surface}`}>
                  <View className="flex-row items-center gap-4">
                    <Globe color={active ? '#9333ea' : theme.iconColor} size={22} />
                    <Text className={`flex-1 text-base font-bold ${theme.textOnSurface}`}>{language}</Text>
                    {active && <Check color="#9333ea" size={22} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <SectionTitle title="Date Format" />
          <SegmentedOptions icon={CalendarDays} options={dateFormats} selected={dateFormat} onSelect={(value) => persistSettings({ dateFormat: value })} />

          <SectionTitle title="Time Format" />
          <SegmentedOptions icon={Clock3} options={timeFormats} selected={timeFormat} onSelect={(value) => persistSettings({ timeFormat: value })} />

          <SectionTitle title="Calendar Week Starts" />
          <SegmentedOptions icon={CalendarDays} options={weekStarts} selected={weekStart} onSelect={(value) => persistSettings({ weekStart: value })} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function SectionTitle({ title }: { title: string }) {
  const theme = useScreenTheme();
  return <Text className={`mb-3 mt-6 text-sm font-black uppercase ${theme.subText}`}>{title}</Text>;
}

function SegmentedOptions({
  icon: Icon,
  options,
  selected,
  onSelect,
}: {
  icon: any;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const theme = useScreenTheme();

  return (
    <View className="gap-3">
      {options.map((option) => {
        const active = option === selected;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            className={`rounded-[22px] border p-4 ${active ? 'border-purple-500 bg-purple-500/10' : theme.surface}`}
          >
            <View className="flex-row items-center gap-4">
              <Icon color={active ? '#9333ea' : theme.iconColor} size={22} />
              <Text className={`flex-1 text-base font-bold ${theme.textOnSurface}`}>{option}</Text>
              {active && <Check color="#9333ea" size={22} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  const theme = useScreenTheme();
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <Pressable onPress={onBack} className={`h-11 w-11 items-center justify-center rounded-2xl border ${theme.iconButton}`}>
        <ArrowLeft color={theme.iconColor} size={20} />
      </Pressable>
      <Text className={`text-2xl font-black ${theme.headerText}`}>{title}</Text>
      <View className="h-11 w-11" />
    </View>
  );
}
