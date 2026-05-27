import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { profileApi } from '@/api/profileApi';
import { useAuth } from '@/hooks/useAuth';
import { useScreenTheme } from '@/hooks/use-screen-theme';
import { authStore } from '@/store/authStore';
import { resolveMediaUrl, withCacheBust } from '@/utils/media';
import { imageUriToFormData } from '@/utils/upload';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [avatar, setAvatar] = useState(resolveMediaUrl(user?.avatar) || '');
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setMessage('Photo library permission is required to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarAsset(result.assets[0]);
      setAvatar(result.assets[0].uri);
      setMessage('');
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage('');
      let updated = await profileApi.update({
        name,
        username: username.replace(/^@/, '').trim() || undefined,
        bio,
        phone_number: phone,
      });

      if (avatarAsset) {
        updated = await profileApi.uploadAvatar(
          imageUriToFormData('avatar', avatarAsset.uri, avatarAsset.fileName || `avatar-${Date.now()}.jpg`, avatarAsset.mimeType || undefined),
        );
      }

      await authStore.setUser(updated);
      setAvatar(withCacheBust(updated.avatar) || avatar);
      setMessage('Profile saved.');
      setAvatarAsset(null);
    } catch (error: any) {
      setMessage(error.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={theme.pageGradient} className="flex-1">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
        <View className="px-5">
          <Header title="Edit Profile" onBack={() => router.back()} />

          <View className={`items-center rounded-[24px] border p-5 ${theme.surface}`}>
            <Image
              source={{ uri: resolveMediaUrl(avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'Invyte') }}
              className="mb-4 h-20 w-20 rounded-full"
            />
            <Pressable onPress={choosePhoto} className={`mb-5 flex-row items-center gap-2 rounded-2xl border px-4 py-3 ${theme.surfaceMuted}`}>
              <Camera color={theme.iconColor} size={18} />
              <Text className={`text-sm font-bold ${theme.textOnSurface}`}>Choose Profile Photo</Text>
            </Pressable>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Bio" value={bio} onChangeText={setBio} multiline />

            {!!message && <Text className={`mt-3 text-sm font-semibold ${message.includes('saved') ? 'text-emerald-500' : 'text-red-500'}`}>{message}</Text>}

            <Pressable onPress={save} disabled={saving} className="mt-5 w-full overflow-hidden rounded-2xl">
              <LinearGradient colors={['#9333ea', '#ec4899']} className="h-14 flex-row items-center justify-center gap-2">
                <Save color="white" size={18} />
                <Text className="font-black text-white">{saving ? 'Saving...' : 'Save Profile'}</Text>
              </LinearGradient>
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

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, multiline, ...inputProps } = props;
  const theme = useScreenTheme();
  return (
    <View className="mb-4 w-full">
      <Text className={`mb-2 text-sm font-bold ${theme.subText}`}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={theme.chevronColor}
        className={`rounded-xl border px-4 text-sm ${theme.surfaceMuted} ${theme.textOnSurface} ${multiline ? 'min-h-[90px] py-3' : 'h-12'}`}
      />
    </View>
  );
}
