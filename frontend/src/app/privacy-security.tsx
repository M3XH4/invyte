import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BellOff, Download, EyeOff, Lock, LogOut, ShieldCheck, Smartphone, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { getPreference, setPreference } from '@/utils/preferences';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PRIVACY_SETTINGS_KEY = 'invyte_privacy_settings';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { logout } = useAuth();
  const push = usePushNotifications();
  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideGuestList, setHideGuestList] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [appLock, setAppLock] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);

  useEffect(() => {
    getPreference(PRIVACY_SETTINGS_KEY).then((stored) => {
      if (!stored) return;

      try {
        const settings = JSON.parse(stored);
        setPrivateProfile(!!settings.privateProfile);
        setHideGuestList(settings.hideGuestList !== false);
        setLoginAlerts(settings.loginAlerts !== false);
        setAppLock(!!settings.appLock);
        setHideActivity(!!settings.hideActivity);
      } catch {
        // Keep defaults if the stored value is malformed.
      }
    });
  }, []);

  const updateSetting = (key: 'privateProfile' | 'hideGuestList' | 'loginAlerts' | 'appLock' | 'hideActivity', value: boolean) => {
    const next = {
      privateProfile,
      hideGuestList,
      loginAlerts,
      appLock,
      hideActivity,
      [key]: value,
    };

    setPrivateProfile(next.privateProfile);
    setHideGuestList(next.hideGuestList);
    setLoginAlerts(next.loginAlerts);
    setAppLock(next.appLock);
    setHideActivity(next.hideActivity);
    setPreference(PRIVACY_SETTINGS_KEY, JSON.stringify(next));
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
        <View className="px-5">
          <Header title="Privacy & Security" onBack={() => router.back()} />

          <View className={`mb-5 rounded-[24px] border p-5 ${theme.surface}`}>
            <View className="flex-row items-center gap-4">
              <LinearGradient colors={['#22d3ee', '#0891b2']} className="h-14 w-14 items-center justify-center rounded-2xl">
                <ShieldCheck color="white" size={28} />
              </LinearGradient>
              <View className="flex-1">
                <Text className={`text-lg font-black ${theme.headerText}`}>Account Protection</Text>
                <Text className={`text-sm ${theme.subText}`}>Control visibility, alerts, and this device session.</Text>
              </View>
            </View>
          </View>

          <View className="gap-4">
            <SettingRow icon={Lock} label="Private Profile" description="Only invited guests can view your hosted event profile." value={privateProfile} onChange={(value: boolean) => updateSetting('privateProfile', value)} />
            <SettingRow icon={ShieldCheck} label="Hide Guest Lists" description="Guest lists stay private unless you enable them per event." value={hideGuestList} onChange={(value: boolean) => updateSetting('hideGuestList', value)} />
            <SettingRow icon={ShieldCheck} label="Login Alerts" description="Get notified when your account is used on a new device." value={loginAlerts} onChange={(value: boolean) => updateSetting('loginAlerts', value)} />
            <SettingRow icon={Smartphone} label="Device Push Alerts" description={push.statusMessage || 'Allow RSVP updates and reminders on this device.'} value={push.enabled} onChange={push.toggle} />
            <SettingRow icon={Lock} label="App Lock Preference" description="Save your preference for requiring device lock before sensitive screens." value={appLock} onChange={(value: boolean) => updateSetting('appLock', value)} />
            <SettingRow icon={EyeOff} label="Hide Activity Details" description="Show shorter private activity messages in shared spaces." value={hideActivity} onChange={(value: boolean) => updateSetting('hideActivity', value)} />
          </View>

          <Text className={`mb-3 mt-7 text-sm font-black uppercase ${theme.subText}`}>Account Actions</Text>
          <View className="gap-3">
            <ActionRow icon={Download} label="Export Account Data" description="Prepare a copy of profile, events, guests, and RSVP data." onPress={() => Alert.alert('Export requested', 'Your export request is ready to connect to a backend export job.')} />
            <ActionRow icon={BellOff} label="Disable Push On This Device" description="Remove this device token from your account." onPress={push.disable} />
            <ActionRow icon={LogOut} label="Sign Out This Device" description="Log out and clear the local session token." onPress={logout} />
            <ActionRow icon={Trash2} label="Delete Account Request" description="Start an account deletion support request." danger onPress={() => Alert.alert('Delete account', 'For safety, account deletion should be confirmed by a backend endpoint before permanent removal.')} />
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
      <Text className={`text-xl font-black ${theme.headerText}`}>{title}</Text>
      <View className="h-11 w-11" />
    </View>
  );
}

function ActionRow({ icon: Icon, label, description, danger, onPress }: any) {
  const theme = useScreenTheme();

  return (
    <Pressable onPress={onPress} className={`rounded-[24px] border p-4 ${theme.surface}`}>
      <View className="flex-row items-center gap-4">
        <LinearGradient colors={danger ? ['#ef4444', '#e11d48'] : ['#818cf8', '#4f46e5']} className="h-12 w-12 items-center justify-center rounded-2xl">
          <Icon color="white" size={22} />
        </LinearGradient>
        <View className="flex-1">
          <Text className={`text-base font-black ${danger ? 'text-red-500' : theme.textOnSurface}`}>{label}</Text>
          <Text className={`text-sm ${theme.subText}`}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function SettingRow({ icon: Icon, label, description, value, onChange }: any) {
  const theme = useScreenTheme();
  return (
    <View className={`rounded-[24px] border p-4 ${theme.surface}`}>
      <View className="flex-row items-center gap-4">
        <LinearGradient colors={['#22d3ee', '#0891b2']} className="h-12 w-12 items-center justify-center rounded-2xl">
          <Icon color="white" size={22} />
        </LinearGradient>
        <View className="flex-1">
          <Text className={`text-base font-black ${theme.textOnSurface}`}>{label}</Text>
          <Text className={`text-sm ${theme.subText}`}>{description}</Text>
        </View>
        <Switch value={value} onValueChange={onChange} trackColor={{ false: '#d1d5db', true: '#9333ea' }} />
      </View>
    </View>
  );
}
