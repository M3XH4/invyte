import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Copy,
  Download,
  Link,
  Lock,
  QrCode,
  Share2,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTheme } from '@/hooks/use-screen-theme';

export default function EventManagementSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { event } = useLocalSearchParams<{ event?: string }>();

  const selectedEvent = event ? JSON.parse(event) : null;

  const [eventNotifications, setEventNotifications] = useState(true);
  const [rsvpUpdates, setRsvpUpdates] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState('public');
  const [allowGuestInvites, setAllowGuestInvites] = useState(false);
  const [showGuestList, setShowGuestList] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const cyclePrivacy = () => {
    const options = ['public', 'private', 'invite-only'];
    const currentIndex = options.indexOf(privacyLevel);
    setPrivacyLevel(options[(currentIndex + 1) % options.length]);
  };

  const handleShareLink = async () => {
    await Share.share({
      message: 'https://invyte.app/e/abc123',
    });
  };

  const settingsSections = [
    {
      title: 'Event Notifications',
      items: [
        {
          id: 'event-notifications',
          icon: Bell,
          label: 'Event Updates',
          description: 'Get notified about event changes',
          colors: ['#c084fc', '#9333ea'],
          toggle: true,
          value: eventNotifications,
          onChange: setEventNotifications,
        },
        {
          id: 'rsvp-updates',
          icon: Users,
          label: 'RSVP Notifications',
          description: 'New responses and changes',
          colors: ['#60a5fa', '#2563eb'],
          toggle: true,
          value: rsvpUpdates,
          onChange: setRsvpUpdates,
        },
        {
          id: 'reminder-notifications',
          icon: Calendar,
          label: 'Event Reminders',
          description: 'Reminders before event starts',
          colors: ['#f472b6', '#db2777'],
          toggle: true,
          value: reminderNotifications,
          onChange: setReminderNotifications,
        },
      ],
    },
    {
      title: 'Privacy & Sharing',
      items: [
        {
          id: 'privacy-level',
          icon: Lock,
          label: 'Event Privacy',
          description:
            privacyLevel === 'public'
              ? 'Public event'
              : privacyLevel === 'private'
                ? 'Private event'
                : 'Invite-only',
          colors: ['#f87171', '#dc2626'],
          onPress: cyclePrivacy,
        },
        {
          id: 'allow-guest-invites',
          icon: UserPlus,
          label: 'Guest Invitations',
          description: 'Allow guests to invite others',
          colors: ['#22d3ee', '#0891b2'],
          toggle: true,
          value: allowGuestInvites,
          onChange: setAllowGuestInvites,
        },
        {
          id: 'show-guest-list',
          icon: Users,
          label: 'Visible Guest List',
          description: 'Show attendees to other guests',
          colors: ['#818cf8', '#4f46e5'],
          toggle: true,
          value: showGuestList,
          onChange: setShowGuestList,
        },
      ],
    },
    {
      title: 'Sharing Options',
      items: [
        {
          id: 'share-link',
          icon: Link,
          label: 'Copy Invite Link',
          description: 'Share event via link',
          colors: ['#4ade80', '#16a34a'],
          onPress: handleShareLink,
        },
        {
          id: 'share-qr',
          icon: QrCode,
          label: 'QR Code',
          description: 'Generate QR code for event',
          colors: ['#2dd4bf', '#0d9488'],
          onPress: () => {
            router.push({
              pathname: '/qr-invitation',
              params: { event },
            });
          },
        },
        {
          id: 'share-social',
          icon: Share2,
          label: 'Share on Social Media',
          description: 'Post to Facebook, Instagram, etc.',
          colors: ['#fb923c', '#ea580c'],
          onPress: handleShareLink,
        },
      ],
    },
    {
      title: 'Event Management',
      items: [
        {
          id: 'duplicate',
          icon: Copy,
          label: 'Duplicate Event',
          description: 'Create a copy of this event',
          colors: ['#a78bfa', '#7c3aed'],
          onPress: () => Alert.alert('Duplicated', 'Event duplicated successfully.'),
        },
        {
          id: 'archive',
          icon: Archive,
          label: isArchived ? 'Unarchive Event' : 'Archive Event',
          description: isArchived ? 'Restore to active events' : 'Move to archive',
          colors: ['#fbbf24', '#d97706'],
          toggle: true,
          value: isArchived,
          onChange: setIsArchived,
        },
        {
          id: 'export',
          icon: Download,
          label: 'Export Guest List',
          description: 'Download as CSV file',
          colors: ['#34d399', '#059669'],
          onPress: () => Alert.alert('Export', 'Guest list export started.'),
        },
        {
          id: 'delete',
          icon: Trash2,
          label: 'Delete Event',
          description: 'Permanently remove this event',
          colors: ['#fb7185', '#e11d48'],
          onPress: () => setShowDeleteModal(true),
        },
      ],
    },
  ];

  return (
    <View className={`flex-1 ${theme.page}`}>
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-60 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-40 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View className="px-6">
          <View className="mb-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace({
                  pathname: '/event-management',
                  params: {
                    event,
                  },
                })
              }}
                className={`h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${theme.iconButton}`}
            >
                <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>

              <Text className={`text-2xl font-black ${theme.headerText}`}>
              Event Settings
            </Text>

            <View className="h-11 w-11" />
          </View>

          <MotiView
            from={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            className="mb-8 overflow-hidden rounded-[32px]"
          >
            <LinearGradient
              colors={['#a855f7', '#9333ea', '#db2777']}
              className="relative p-5"
            >
              <View className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-400/30" />
              <View className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-400/20" />

              <View className="z-10 flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <Calendar color="white" size={28} strokeWidth={2.5} />
                </View>

                <View className="flex-1">
                  <Text className="mb-0.5 text-xl font-black text-white">
                    {selectedEvent?.title || 'Event Name'}
                  </Text>
                  <Text className="text-sm font-medium text-white/70">
                    Customize event preferences
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </MotiView>

          {settingsSections.map((section, sectionIndex) => (
            <View key={section.title} className="mb-6">
              <Text className={`mb-3 px-1 text-sm font-black uppercase tracking-wide ${theme.subText}`}>
                {section.title}
              </Text>

              <View className="gap-3">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;

                  return (
                    <MotiView
                      key={item.id}
                      from={{ opacity: 0, translateX: -10 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        type: 'timing',
                        delay: sectionIndex * 100 + itemIndex * 50,
                        duration: 300,
                      }}
                    >
                      <Pressable
                        disabled={item.toggle}
                        onPress={item.onPress}
                        className={`rounded-[24px] border p-4 shadow-sm ${theme.surface}`}
                      >
                        <View className="flex-row items-center gap-4">
                          <LinearGradient
                            colors={item.colors as [string, string]}
                            className="h-12 w-12 items-center justify-center"
                            style={{ borderRadius: 12 }}
                          >
                            <Icon color="white" size={24} strokeWidth={2.5} />
                          </LinearGradient>

                          <View className="min-w-0 flex-1">
                            <Text className={`mb-0.5 text-base font-black ${theme.textOnSurface}`}>
                              {item.label}
                            </Text>
                            <Text className={`text-sm font-medium ${theme.subText}`}>
                              {item.description}
                            </Text>
                          </View>

                          {item.toggle ? (
                            <Switch
                              value={item.value}
                              onValueChange={item.onChange}
                              trackColor={{
                                false: theme.isDarkMode ? '#334155' : '#d1d5db',
                                true: '#9333ea',
                              }}
                              thumbColor="#ffffff"
                            />
                          ) : (
                            <ChevronRight
                              color={theme.chevronColor}
                              size={20}
                              strokeWidth={2.5}
                            />
                          )}
                        </View>
                      </Pressable>
                    </MotiView>
                  );
                })}
              </View>
            </View>
          ))}

          <MotiPressable
            onPress={() => router.replace('/event-management')}
            from={{ opacity: 0, translateY: 10 }}
            animate={({ pressed }) => {
              'worklet';
              return {
                opacity: 1,
                translateY: 0,
                scale: pressed ? 0.98 : 1,
              };
            }}
            transition={{ type: 'timing', duration: 300 }}
            style={{ marginTop: 32, borderRadius: 24, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#9333ea', '#ec4899']}
              className="items-center p-4"
            >
              <Text className="text-base font-black text-white">
                Save Changes
              </Text>
            </LinearGradient>
          </MotiPressable>

          <Text className={`mt-6 text-center text-xs font-semibold ${theme.footerText}`}>
            Changes are saved automatically
          </Text>
        </View>
      </ScrollView>

      <DeleteEventModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={() => {
          setShowDeleteModal(false);
          router.replace('/tabs/events');
        }}
      />
    </View>
  );
}

function DeleteEventModal({
  visible,
  onCancel,
  onDelete,
}: {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const theme = useScreenTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full rounded-[32px] p-6 shadow-2xl ${theme.surfaceStrong}`}
        >
          <View className="items-center">
            <LinearGradient
              colors={['#fb7185', '#e11d48']}
              className="mb-4 h-16 w-16 items-center justify-center rounded-full"
            >
              <AlertCircle color="white" size={32} strokeWidth={2.5} />
            </LinearGradient>

            <Text className={`mb-2 text-center text-xl font-black ${theme.headerText}`}>
              Delete Event?
            </Text>

            <Text className={`mb-6 text-center text-sm font-medium ${theme.subText}`}>
              This action cannot be undone. All event data, RSVPs, and guest
              information will be permanently deleted.
            </Text>

            <View className="w-full flex-row gap-3">
              <Pressable
                onPress={onCancel}
                className={`h-12 flex-1 items-center justify-center rounded-2xl ${theme.surfaceMuted}`}
              >
                <Text className={`font-bold ${theme.textOnSurface}`}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={onDelete}
                className="h-12 flex-1 overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={['#f43f5e', '#e11d48']}
                  className="h-full items-center justify-center"
                >
                  <Text className="font-bold text-white">Delete</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}