import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, Vibration, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, ScanLine, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { parseQrValue } from '@/utils/qr';

export default function QrScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [error, setError] = useState('');

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned) return;

    const parsed = parseQrValue(result.data);

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[qr-scanner] scanned QR', {
        raw: result.data,
        type: result.type,
        parsed,
      });
    }

    if (!parsed) {
      setScanned(true);
      setError('Invalid RSVP QR Code');
      setTimeout(() => {
        setScanned(false);
        setError('');
      }, 1500);
      return;
    }

    setScanned(true);
    Vibration.vibrate(70);

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[qr-scanner] navigating to public RSVP', {
        slug: parsed.slug,
        target: `/public-rsvp/${parsed.slug}`,
      });
    }

    router.push({
      pathname: '/public-rsvp/[slug]',
      params: { slug: parsed.slug },
    });
  }, [router, scanned]);

  const permissionGranted = permission?.granted;

  return (
    <LinearGradient colors={['#111027', '#241445', '#120d24']} className="flex-1">
      <View className="absolute right-4 top-20 h-64 w-64 rounded-full bg-purple-500/20" />
      <View className="absolute -left-16 bottom-32 h-72 w-72 rounded-full bg-pink-500/15" />

      <View
        className="flex-1 px-5"
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/tabs');
            }}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10"
          >
            <ArrowLeft color="white" size={20} />
          </Pressable>

          <Text className="text-xl font-black text-white">Scan RSVP QR Code</Text>

          <Pressable
            onPress={() => setTorchEnabled((value) => !value)}
            className={`h-11 w-11 items-center justify-center rounded-2xl border ${
              torchEnabled ? 'border-yellow-300/60 bg-yellow-300/20' : 'border-white/15 bg-white/10'
            }`}
          >
            <Zap color={torchEnabled ? '#fde047' : 'white'} size={19} fill={torchEnabled ? '#fde047' : 'transparent'} />
          </Pressable>
        </View>

        <View className="mb-5 rounded-[28px] border border-white/10 bg-white/10 p-4">
          <Text className="text-center text-sm font-semibold leading-5 text-white/75">
            Point your camera at an Invyte QR invitation. We will open the public RSVP page automatically.
          </Text>
        </View>

        <View className="flex-1 overflow-hidden rounded-[34px] border border-white/15 bg-black/50">
          {!permission ? (
            <CenteredPanel>
              <ActivityIndicator color="white" />
              <Text className="mt-3 text-sm font-bold text-white/75">Checking camera permission...</Text>
            </CenteredPanel>
          ) : !permissionGranted ? (
            <CenteredPanel>
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <ScanLine color="#f0abfc" size={38} />
              </View>
              <Text className="mb-2 text-xl font-black text-white">Camera Access Needed</Text>
              <Text className="mb-6 text-center text-sm font-semibold leading-5 text-white/65">
                Allow camera access so Invyte can scan RSVP QR codes.
              </Text>
              <Pressable onPress={requestPermission} className="overflow-hidden rounded-2xl">
                <LinearGradient colors={['#9333ea', '#ec4899']} className="px-6 py-3">
                  <Text className="font-black text-white">Allow Camera</Text>
                </LinearGradient>
              </Pressable>
            </CenteredPanel>
          ) : (
            <>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                enableTorch={torchEnabled}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />

              <View className="absolute inset-0 items-center justify-center">
                <View className="h-[260px] w-[260px] rounded-[34px] border-2 border-white/80">
                  <View className="absolute -left-1 -top-1 h-12 w-12 rounded-tl-[34px] border-l-4 border-t-4 border-fuchsia-300" />
                  <View className="absolute -right-1 -top-1 h-12 w-12 rounded-tr-[34px] border-r-4 border-t-4 border-fuchsia-300" />
                  <View className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-[34px] border-b-4 border-l-4 border-cyan-300" />
                  <View className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-[34px] border-b-4 border-r-4 border-cyan-300" />

                  <MotiView
                    from={{ translateY: 16, opacity: 0.35 }}
                    animate={{ translateY: 226, opacity: 1 }}
                    transition={{
                      type: 'timing',
                      duration: 1700,
                      loop: true,
                      repeatReverse: true,
                    }}
                    className="absolute left-5 right-5 h-1 rounded-full bg-fuchsia-300"
                  />
                </View>
              </View>

              <View className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/15 bg-black/45 p-4">
                <Text className="text-center text-sm font-bold text-white">
                  {scanned && !error ? 'Opening RSVP...' : 'Align QR code inside the frame'}
                </Text>
                {!!error && (
                  <Text className="mt-2 text-center text-xs font-bold text-red-200">
                    {error}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

function CenteredPanel({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      {children}
    </View>
  );
}
