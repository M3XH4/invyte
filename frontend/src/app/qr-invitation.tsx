import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {
  ArrowLeft,
  Download,
  PartyPopper,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsApi } from '@/api/eventsApi';
import { useEvent } from '@/hooks/useEvents';
import { useEffect, useState } from 'react';
import type { QRCodePayload } from '@/types/event';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dateTime';
export default function QRInvitationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const { event, loading: eventLoading } = useEvent(eventId);
  const [qr, setQr] = useState<QRCodePayload | null>(null);
  const [loadingQr, setLoadingQr] = useState(!!eventId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) return;

    const loadQr = async () => {
      try {
        setLoadingQr(true);
        setError('');
        setQr(await eventsApi.qr(eventId));
      } catch (error: any) {
        setError(error.message || 'Unable to load QR invitation.');
      } finally {
        setLoadingQr(false);
      }
    };

    loadQr();
  }, [eventId]);

  const qrValue = qr?.public_url || qr?.qr_value || qr?.url || qr?.payload?.url || event?.public_url || event?.qr_value || '';
  const title = event?.title ?? "Event Name";
  const date = formatDateForDisplay(event?.date || event?.start_date || '') || 'Event Date';
  const time = formatTimeForDisplay(event?.time || event?.start_time || '') || 'Event Time';
  const location = event?.location || event?.venue_address || 'Event Location';
  const handleShare = async () => {
    await Share.share({
      message: qrValue,
    });
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#2d1b4e', '#1a1a2e']}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View className="flex-1 px-5">
          {/* Header */}
          <View className="mb-6 flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/event-management');
              }}
              className="h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"
            >
              <ArrowLeft color="white" size={20} />
            </Pressable>

            <Text className="text-2xl font-black text-white">
              QR Invitation
            </Text>
          </View>

          <View className="flex-1 items-center justify-center">
            {/* QR Card */}
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'timing', duration: 500 }}
              className="mb-6 w-full"
            >
              <View className="absolute inset-0 rounded-[32px] bg-purple-500/30" />

              <View className="rounded-3xl border-2 border-white/20 bg-purple-950/40 p-6 shadow-2xl">
                {/* Decorative corners */}
                <View className="absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-yellow-400" />
                <View className="absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-yellow-400" />
                <View className="absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-yellow-400" />
                <View className="absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-yellow-400" />

                {/* Header */}
                <View className="mb-5 items-center">
                  <LinearGradient
                    colors={['#facc15', '#f97316']}
                    className="mb-3 h-12 w-12 items-center justify-center rounded-xl"
                  >
                    <PartyPopper color="white" size={24} />
                  </LinearGradient>

                  <Text className="mb-1 text-center text-xl font-bold text-white">
                    {title}
                  </Text>

                  <Text className="text-xs text-white/60">
                    Scan to RSVP
                  </Text>
                </View>

                {/* QR Code */}
                <View className="mb-5 items-center rounded-2xl bg-white p-5 shadow-xl">
                  {eventLoading || loadingQr ? (
                    <View className="h-[180px] w-[180px] items-center justify-center">
                      <ActivityIndicator color="#1a1a2e" />
                    </View>
                  ) : (
                    <QRCode
                      value={qrValue || 'missing-qr-url'}
                      size={180}
                      ecl="H"
                      color="#1a1a2e"
                      backgroundColor="white"
                    />
                  )}
                </View>

                {/* Footer */}
                <View className="items-center gap-1.5">
                  <Text className="text-sm text-white/80">
                    {date} • {time}
                  </Text>

                  <Text className="text-xs text-white/60">
                    {location}
                  </Text>
                </View>

                {/* Badge */}
                <View className="mt-5 items-center">
                  <View className="flex-row items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/20 px-4 py-2">
                    <Sparkles color="#facc15" size={12} />
                    <Text className="text-xs font-semibold text-yellow-400">
                      Digital Pass
                    </Text>
                  </View>
                </View>
              </View>
            </MotiView>

            {/* Description */}
            <View className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Text className="text-center text-sm leading-5 text-white/80">
                {error || `Share this QR code with your guests so they can easily RSVP at ${qrValue || 'the public invite link'}.`}
              </Text>
            </View>

            {/* Buttons */}
            <View className="w-full gap-3">
              <MotiPressable
                onPress={() => { }}
                animate={({ pressed }) => {
                  'worklet';
                  return { scale: pressed ? 0.97 : 1 };
                }}
                style={{ overflow: 'hidden', borderRadius: 16 }}
              >
                <LinearGradient
                  colors={['#facc15', '#f97316']}
                  className="h-14 flex-row items-center justify-center gap-2"
                >
                  <Download color="white" size={20} />
                  <Text className="text-base font-bold text-white">
                    Download QR Code
                  </Text>
                </LinearGradient>
              </MotiPressable>

              <Pressable
                onPress={handleShare}
                className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10"
              >
                <Share2 color="white" size={16} />
                <Text className="text-sm font-semibold text-white">
                  Share QR Code
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
