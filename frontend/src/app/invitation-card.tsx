import { Share, ScrollView, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  MapPin,
  PartyPopper,
  Share2,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEvent } from '@/hooks/useEvents';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/dateTime';

const sparklePositions = [
  { left: '8%', top: '14%' },
  { left: '80%', top: '10%' },
  { left: '20%', top: '32%' },
  { left: '72%', top: '40%' },
  { left: '12%', top: '62%' },
  { left: '88%', top: '70%' },
  { left: '46%', top: '18%' },
  { left: '58%', top: '84%' },
];

const starPositions = [
  { left: '15%', top: '22%' },
  { left: '68%', top: '16%' },
  { left: '90%', top: '35%' },
  { left: '24%', top: '76%' },
  { left: '76%', top: '82%' },
  { left: '42%', top: '56%' },
];

export default function InvitationCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const { event } = useEvent(eventId);

  const title = event?.title ?? "Your Event";
  const rawDate = event?.date || event?.start_date || '';
  const rawTime = event?.time || event?.start_time || '';
  const date = formatDateForDisplay(rawDate) || 'Event date';
  const time = formatTimeForDisplay(rawTime) || 'Event time';
  const location = event?.location || event?.venue_address || 'Event location';
  const description = event?.description || 'Join us for an unforgettable celebration filled with fun, laughter, and amazing memories!';

  const handleShare = async () => {
    await Share.share({
      title,
      message: `You're invited to ${title}! ${date} at ${time}, ${location}.`,
    });
  };

  return (
    <LinearGradient
      colors={['#5B2EFF', '#8A2BE2', '#00C2FF']}
      className="flex-1"
    >
      {/* Floating Blobs */}
      <View className="absolute right-0 top-20 h-64 w-64 rounded-full bg-pink-400/30" />
      <View className="absolute bottom-40 left-0 h-56 w-56 rounded-full bg-cyan-400/30" />
      <View className="absolute left-1/2 top-60 h-48 w-48 rounded-full bg-purple-400/20" />

      {/* Sparkles */}
      {sparklePositions.map((item, index) => (
        <MotiView
          key={index}
          from={{ translateY: 0, opacity: 0.3, scale: 1 }}
          animate={{ translateY: -20, opacity: 0.8, scale: 1.2 }}
          transition={{
            type: 'timing',
            duration: 3000 + index * 120,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            position: 'absolute' as const,
            left: item.left as any,
            top: item.top as any,
          }}
        >
          <Sparkles color="rgba(255,255,255,0.4)" size={16} />
        </MotiView>
      ))}

      {/* Stars */}
      {starPositions.map((item, index) => (
        <MotiView
          key={`star-${index}`}
          from={{ rotate: '0deg', opacity: 0.2 }}
          animate={{ rotate: '360deg', opacity: 0.6 }}
          transition={{
            type: 'timing',
            duration: 4000 + index * 150,
            loop: true,
          }}
          style={{
            position: 'absolute',
            left: item.left as any,
            top: item.top as any,
          }}
        >
          <Star color="rgba(253,224,71,0.55)" size={14} fill="rgba(253,224,71,0.55)" />
        </MotiView>
      ))}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View className="px-6">
          {/* Header */}
          <View className="mb-8 flex-row items-center justify-center">
            <Text className="text-xl font-black text-white">
              Your Invitation
            </Text>
            <Sparkles color="#fde047" size={20} className="ml-2" />
          </View>

          {/* Main Invitation Card */}
          <MotiView
            from={{ scale: 0.85, opacity: 0, translateY: 20 }}
            animate={{ scale: 1, opacity: 1, translateY: 0 }}
            transition={{
              type: 'spring',
              duration: 600,
            }}
            className="mb-7"
          >
            <View className="relative">
              {/* Glow */}
              <View className="absolute -inset-4 rounded-[40px] bg-pink-400/25" />

              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{
                  type: 'timing',
                  duration: 4000,
                  loop: true,
                }}
                className="absolute -right-3 -top-6 z-20"
              >
                <Sparkles color="#fde047" size={32} fill="#fde047" />
              </MotiView>

              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '-360deg' }}
                transition={{
                  type: 'timing',
                  duration: 5000,
                  loop: true,
                }}
                className="absolute -bottom-6 -left-3 z-20"
              >
                <Star color="#f9a8d4" size={28} fill="#f9a8d4" />
              </MotiView>

              <MotiView
                from={{ translateY: -10 }}
                animate={{ translateY: 10 }}
                transition={{
                  type: 'timing',
                  duration: 3000,
                  loop: true,
                  repeatReverse: true,
                }}
                className="absolute -right-4 top-1/2 z-20"
              >
                <Zap color="#67e8f9" size={24} fill="#67e8f9" />
              </MotiView>

              {/* Card */}
              <LinearGradient
                colors={['#a855f7', '#ec4899', '#f97316']}
                className="h-[430px] overflow-hidden rounded-[36px] p-6"
              >
                <View className="absolute inset-0 bg-white/10" />
                <View className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-300/30" />
                <View className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-400/30" />

                <View className="z-10 flex-1">
                  {/* Top Icon */}
                  <View className="mb-3 items-center">
                    <MotiView
                      from={{ scale: 1, rotate: '0deg' }}
                      animate={{ scale: 1.1, rotate: '5deg' }}
                      transition={{
                        type: 'timing',
                        duration: 2000,
                        loop: true,
                        repeatReverse: true,
                      }}
                      className="h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/20"
                    >
                      <PartyPopper color="white" size={32} strokeWidth={2.5} />
                    </MotiView>
                  </View>

                  {/* Title */}
                  <View className="mb-3 items-center">
                    <Text className="mb-1 text-xs font-bold tracking-wide text-white/80">
                      YOU&apos;RE INVITED!
                    </Text>

                    <Text className="px-4 text-center text-3xl font-black leading-tight text-white">
                      {title}
                    </Text>
                  </View>

                  {/* Info Card */}
                  <MotiView
                    from={{ translateY: 20, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{
                      type: 'timing',
                      delay: 300,
                      duration: 500,
                    }}
                    className="mx-auto mt-auto mb-6 w-[280px] rounded-[24px] border border-white/40 bg-white/20 px-5 py-4"
                  >
                    <View className="gap-3">
                      <InfoRow
                        icon={Calendar}
                        label={date}
                      />
                      <InfoRow
                        icon={Clock}
                        label={time}
                      />
                      <InfoRow
                        icon={MapPin}
                        label={location}
                      />
                    </View>
                  </MotiView>

                  <View className="mb-4 px-2">
                    <Text className="text-center text-xs font-medium leading-5 text-white/90">
                      {description}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-center gap-2">
                    <Sparkles color="rgba(255,255,255,0.6)" size={16} />
                    <Sparkles color="rgba(255,255,255,0.8)" size={20} />
                    <Sparkles color="rgba(255,255,255,0.6)" size={16} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </MotiView>

          {/* Buttons */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', delay: 500 }}
            className="gap-3"
          >
            <View className="overflow-hidden rounded-[24px]">
              <MotiPressable
                onPress={() =>
                  router.push({
                    pathname: '/event-management',
                    params: { eventId },
                  })
                }
                animate={({ pressed }) => {
                  'worklet';
                  return { scale: pressed ? 0.97 : 1 };
                }}
              >
                <LinearGradient
                  colors={['#facc15', '#f97316']}
                  className="h-[58px] flex-row items-center justify-center gap-2"
                >
                  <Eye color="#111827" size={20} strokeWidth={2.5} />
                  <Text className="text-base font-black text-gray-900">
                    View Event Details
                  </Text>
                </LinearGradient>
              </MotiPressable>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={handleShare}
                className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[20px] border border-white/30 bg-white/15"
              >
                <Share2 color="white" size={16} strokeWidth={2.5} />
                <Text className="font-bold text-white">Share</Text>
              </Pressable>

              <Pressable className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[20px] border border-white/30 bg-white/15">
                <Download color="white" size={16} strokeWidth={2.5} />
                <Text className="font-bold text-white">Save</Text>
              </Pressable>
            </View>

            <MotiPressable
              onPress={() =>
                router.push({
                  pathname: '/qr-invitation',
                  params: { eventId },
                })
              }
              animate={({ pressed }) => {
                'worklet';
                return { scale: pressed ? 0.97 : 1 };
              }}
              style={{ overflow: 'hidden', borderRadius: 24 }}
            >
              <LinearGradient
                colors={['#9333ea', '#ec4899']}
                className="h-12 flex-row items-center justify-center gap-2"
              >
                <Zap color="white" size={16} strokeWidth={2.5} />
                <Text className="font-bold text-white">
                  Generate QR Code
                </Text>
              </LinearGradient>
            </MotiPressable>

            <MotiPressable
              onPress={() => router.replace('/tabs')}
              animate={({ pressed }) => {
                'worklet';
                return { scale: pressed ? 0.97 : 1 };
              }}
              style={{ overflow: 'hidden', borderRadius: 24 }}
            >
              <LinearGradient
                colors={['#10b981', '#16a34a']}
                className="h-[58px] flex-row items-center justify-center gap-2"
              >
                <CheckCircle color="white" size={20} strokeWidth={2.5} />
                <Text className="text-base font-black text-white">
                  Finish & Go to Home
                </Text>
              </LinearGradient>
            </MotiPressable>
          </MotiView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function InfoRow({
  icon: Icon,
  label,
}: {
  icon: any;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/20">
        <Icon color="white" size={16} strokeWidth={2.5} />
      </View>

      <Text className="text-sm font-bold text-white">
        {label}
      </Text>
    </View>
  );
}
