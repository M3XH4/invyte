import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScanQrCode } from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanQrFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: 20,
        bottom: insets.bottom + 90,
        zIndex: 40,
        elevation: 14,
      }}
    >
      <MotiView
      />

      <MotiPressable
        onPress={() => router.push('/qr-scanner')}
        animate={({ pressed }) => {
          'worklet';
          return { scale: pressed ? 0.94 : 1 };
        }}
      >
        <Pressable pointerEvents="none">
          <LinearGradient
            colors={['#a855f7', '#9333ea', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
              shadowColor: '#9333ea',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 15,
              elevation: 12,
            }}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <ScanQrCode color="white" size={25} strokeWidth={2.6} />
            </View>
          </LinearGradient>
        </Pressable>
      </MotiPressable>
    </View>
  );
}
