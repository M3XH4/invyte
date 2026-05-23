import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshCw, WifiOff } from 'lucide-react-native';

type Props = {
  message?: string;
  error?: string | null;
  apiUrl?: string;
  onRetry?: () => void;
};

export default function StartupLoadingScreen({
  message = 'Preparing your invitations...',
  error,
  apiUrl,
  onRetry,
}: Props) {
  return (
    <LinearGradient colors={['#000045', '#14146b', '#000045']} className="flex-1">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10">
          {error ? (
            <WifiOff color="#FFD700" size={34} />
          ) : (
            <ActivityIndicator color="#FFD700" size="large" />
          )}
        </View>

        <Text className="mb-2 text-center text-2xl font-black text-white">
          {error ? 'Connection needs a retry' : 'Starting Invyte'}
        </Text>

        <Text className="text-center text-sm leading-5 text-white/70">
          {error || message}
        </Text>

        {!!apiUrl && (
          <Text className="mt-3 text-center text-[11px] text-white/35">
            {apiUrl}
          </Text>
        )}

        {!!error && !!onRetry && (
          <Pressable
            onPress={onRetry}
            className="mt-8 flex-row items-center gap-2 rounded-2xl bg-[#FFD700] px-6 py-3"
          >
            <RefreshCw color="#000045" size={18} />
            <Text className="text-sm font-black text-[#000045]">Try Again</Text>
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}
