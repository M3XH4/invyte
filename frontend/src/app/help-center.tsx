import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, HelpCircle, Mail, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

const faqs = [
  ['How do guests RSVP?', 'Share the QR invitation or public RSVP link from an event. Guests can answer without logging in.'],
  ['Can I edit an event after publishing?', 'Yes. Open My Events, select the event, then edit details, RSVP settings, guests, or attendance.'],
  ['Where are my invitations stored?', 'Events and RSVP data are stored in your Laravel backend and synced through the API.'],
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
        <View className="px-5">
          <Header title="Help Center" onBack={() => router.back()} />

          <View className={`mb-5 rounded-[24px] border p-5 ${theme.surface}`}>
            <HelpCircle color="#9333ea" size={34} />
            <Text className={`mt-3 text-xl font-black ${theme.headerText}`}>How can we help?</Text>
            <Text className={`mt-1 text-sm ${theme.subText}`}>Find quick answers or contact support.</Text>
          </View>

          <View className="mb-5 gap-3">
            {faqs.map(([question, answer]) => (
              <View key={question} className={`rounded-[20px] border p-4 ${theme.surface}`}>
                <Text className={`mb-2 text-base font-black ${theme.textOnSurface}`}>{question}</Text>
                <Text className={`text-sm leading-5 ${theme.subText}`}>{answer}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row gap-3">
            <Pressable onPress={() => Linking.openURL('mailto:support@invyte.app')} className="flex-1 overflow-hidden rounded-2xl">
              <LinearGradient colors={['#9333ea', '#ec4899']} className="h-14 flex-row items-center justify-center gap-2">
                <Mail color="white" size={18} />
                <Text className="font-bold text-white">Email</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('mailto:support@invyte.app?subject=Invyte%20Help%20Request')}
              className={`h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border ${theme.surface}`}
            >
              <MessageCircle color={theme.iconColor} size={18} />
              <Text className={`font-bold ${theme.textOnSurface}`}>Message</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
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
