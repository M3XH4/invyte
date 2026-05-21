import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Camera, Users, MapPin } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DatePickerField from "@/components/date-picker-field";
import TimePickerField from "@/components/time-picker-field";
import SpinnerField from "@/components/spinner-field";
import * as Location from "expo-location";

import { Platform } from "react-native";

import { useScreenTheme } from '@/hooks/use-screen-theme';

const eventCoverImage = require("@/assets/images/hero-card-image.png");

export default function CreateEvent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useScreenTheme();
  const { category = "birthday" } = useLocalSearchParams<{
    category?: string;
  }>();

  const [eventData, setEventData] = useState({
    coverImage: eventCoverImage,
    date: "",
    time: "",
    location: "",
    description: "",
    guestCount: "",
    rsvpDeadline: "",

    celebrantName: "",
    age: "",
    theme: "",
    foodOption: "",
    dressCode: "",
    specialMessage: "",

    brideName: "",
    groomName: "",
    ceremonyVenue: "",
    receptionVenue: "",
    colorMotif: "",
    plusOneAllowed: true,
    giftRegistryLink: "",

    meetingTitle: "",
    organizer: "",
    agenda: "",
    venueOrLink: "",
    attendeesLimit: "",
    requiredDocuments: "",
    reminderEnabled: true,

    honoringName: "",
    wakeVenue: "",
    memorialMessage: "",

    eventName: "",
    djBandName: "",
    ticketType: "",
    entryFee: "",
    ageRestriction: "",
    startTime: "",
    endTime: "",
  });

  const updateField = (field: string, value: any) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const getCategoryTitle = () => {
    const titles: Record<string, string> = {
      birthday: "Birthday Party",
      wedding: "Wedding",
      party: "Party",
      meeting: "Meeting",
      funeral: "Memorial Service",
      concert: "Concert",
      other: "Event",
    };

    return titles[category] || "Event";
  };

  const pickCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({});

    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (address.length > 0) {
      const place = address[0];

      updateField(
        "location",
        `${place.name || ""} ${place.street || ""}, ${place.city || ""}`,
      );
    }
  };
  const renderFormFields = () => {
    switch (category) {
      case "birthday":
        return (
          <>
            <FormSection title="Celebrant Information">
              <FormField label="Celebrant Name">
                <Input
                  value={eventData.celebrantName}
                  onChangeText={(v) => updateField("celebrantName", v)}
                  placeholder="e.g., Aryan"
                />
              </FormField>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Age Turning">
                    <Input
                      value={eventData.age}
                      onChangeText={(v) => updateField("age", v)}
                      placeholder="7"
                      keyboardType="numeric"
                    />
                  </FormField>
                </View>

                {/* <View className="flex-1">
                  <FormField label="Theme/Motif">
                    <Input
                      value={eventData.theme}
                      onChangeText={(v) => updateField("theme", v)}
                      placeholder="Superhero"
                    />
                  </FormField>
                </View> */}
              </View>
            </FormSection>

            <CommonEventDetails
              eventData={eventData}
              updateField={updateField}
            />

            <FormSection title="Guest Information">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Expected Guests">
                    <Input
                      value={eventData.guestCount}
                      onChangeText={(v) => updateField("guestCount", v)}
                      placeholder="50"
                      keyboardType="numeric"
                    />
                  </FormField>
                </View>

                <View className="flex-1">
                  <FormField label="RSVP Deadline">
                    <DatePickerField
                      value={eventData.rsvpDeadline}
                      onChange={(v) => updateField("rsvpDeadline", v)}
                      placeholder="RSVP Deadline"
                    />
                  </FormField>
                </View>
              </View>

              <FormField label="Special Message">
                <Input
                  value={eventData.specialMessage}
                  onChangeText={(v) => updateField("specialMessage", v)}
                  placeholder="Join us for a magical celebration! 🎉"
                  multiline
                />
              </FormField>
            </FormSection>
          </>
        );

      case "wedding":
        return (
          <>
            <FormSection title="Couple Information">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Bride's Name">
                    <Input
                      value={eventData.brideName}
                      onChangeText={(v) => updateField("brideName", v)}
                      placeholder="Emily"
                    />
                  </FormField>
                </View>

                <View className="flex-1">
                  <FormField label="Groom's Name">
                    <Input
                      value={eventData.groomName}
                      onChangeText={(v) => updateField("groomName", v)}
                      placeholder="Michael"
                    />
                  </FormField>
                </View>
              </View>
            </FormSection>

            <FormSection title="Venues">
              <FormField label="Ceremony Venue">
                <Input
                  value={eventData.ceremonyVenue}
                  onChangeText={(v) => updateField("ceremonyVenue", v)}
                  placeholder="St. Mary's Church"
                />
              </FormField>

              <FormField label="Reception Venue">
                <Input
                  value={eventData.receptionVenue}
                  onChangeText={(v) => updateField("receptionVenue", v)}
                  placeholder="Grand Ballroom"
                />
              </FormField>
            </FormSection>

            <CommonEventDetails
              eventData={eventData}
              updateField={updateField}
            />

            <FormSection title="Wedding Options">
              <ToggleRow
                label="Allow Plus One"
                value={eventData.plusOneAllowed}
                onValueChange={(v) => updateField("plusOneAllowed", v)}
              />

              <FormField label="Gift Registry Link">
                <Input
                  value={eventData.giftRegistryLink}
                  onChangeText={(v) => updateField("giftRegistryLink", v)}
                  placeholder="https://registry.com"
                />
              </FormField>
            </FormSection>
          </>
        );

      case "meeting":
        return (
          <>
            <FormSection title="Meeting Information">
              <FormField label="Meeting Title">
                <Input
                  value={eventData.meetingTitle}
                  onChangeText={(v) => updateField("meetingTitle", v)}
                  placeholder="Q1 Strategy Planning"
                />
              </FormField>

              <FormField label="Organizer">
                <Input
                  value={eventData.organizer}
                  onChangeText={(v) => updateField("organizer", v)}
                  placeholder="John Doe"
                />
              </FormField>

              <FormField label="Agenda">
                <Input
                  value={eventData.agenda}
                  onChangeText={(v) => updateField("agenda", v)}
                  placeholder="1. Review performance..."
                  multiline
                />
              </FormField>
            </FormSection>

            <FormSection title="Schedule & Location">
              <FormField label="Venue or Online Link">
                <Input
                  value={eventData.venueOrLink}
                  onChangeText={(v) => updateField("venueOrLink", v)}
                  placeholder="Conference Room A or Zoom link"
                />
              </FormField>

              <DateTimeFields eventData={eventData} updateField={updateField} />

              <FormField label="Attendees Limit">
                <Input
                  value={eventData.attendeesLimit}
                  onChangeText={(v) => updateField("attendeesLimit", v)}
                  placeholder="20"
                  keyboardType="numeric"
                />
              </FormField>

              <ToggleRow
                label="Send Reminder"
                value={eventData.reminderEnabled}
                onValueChange={(v) => updateField("reminderEnabled", v)}
              />
            </FormSection>
          </>
        );

      case "party":
      case "concert":
        return (
          <>
            <FormSection title="Event Information">
              <FormField label="Event Name">
                <Input
                  value={eventData.eventName}
                  onChangeText={(v) => updateField("eventName", v)}
                  placeholder="Summer Music Festival"
                />
              </FormField>

              <FormField label="DJ / Band Name">
                <Input
                  value={eventData.djBandName}
                  onChangeText={(v) => updateField("djBandName", v)}
                  placeholder="The Groove Masters"
                />
              </FormField>

              <FormField label="Venue">
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Input
                      value={eventData.location}
                      onChangeText={(v) => updateField("location", v)}
                      placeholder="The Grove Resort"
                    />
                  </View>

                  <Pressable
                    onPress={pickCurrentLocation}
                    className="h-12 w-12 items-center justify-center rounded-xl bg-purple-100"
                  >
                    <MapPin color="#9333ea" size={20} />
                  </Pressable>
                </View>
              </FormField>

              <DateTimeFields eventData={eventData} updateField={updateField} />
            </FormSection>

            <FormSection title="Ticketing">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Ticket Type">
                    <Input
                      value={eventData.ticketType}
                      onChangeText={(v) => updateField("ticketType", v)}
                      placeholder="Free / Paid / VIP"
                    />
                  </FormField>
                </View>

                <View className="flex-1">
                  <FormField label="Entry Fee">
                    <Input
                      value={eventData.entryFee}
                      onChangeText={(v) => updateField("entryFee", v)}
                      placeholder="₱500"
                    />
                  </FormField>
                </View>
              </View>
            </FormSection>
          </>
        );

      default:
        return (
          <>
            <FormSection title="Event Details">
              <FormField label="Event Title">
                <Input
                  value={eventData.eventName}
                  onChangeText={(v) => updateField("eventName", v)}
                  placeholder="Enter event name"
                />
              </FormField>

              <FormField label="Location">
                <Input
                  value={eventData.location}
                  onChangeText={(v) => updateField("location", v)}
                  placeholder="Enter venue"
                />
              </FormField>

              <DateTimeFields eventData={eventData} updateField={updateField} />

              <FormField label="Description">
                <Input
                  value={eventData.description}
                  onChangeText={(v) => updateField("description", v)}
                  placeholder="Tell us about your event..."
                  multiline
                />
              </FormField>
            </FormSection>
          </>
        );
    }
  };

  return (
    <View className={`flex-1 ${theme.page}`}>
      <View className={`absolute right-10 top-20 h-64 w-64 rounded-full ${theme.pageGlowOne}`} />
      <View className={`absolute left-5 top-56 h-56 w-56 rounded-full ${theme.pageGlowTwo}`} />
      <View className={`absolute bottom-24 right-8 h-48 w-48 rounded-full ${theme.pageGlowThree}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="px-5">
          {/* Header */}
          <View className="mb-8 flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/create-event-categories');
                }
              }}
              className={`h-10 w-10 items-center justify-center rounded-full shadow-sm ${theme.iconButton}`}
            >
              <ArrowLeft color={theme.iconColor} size={20} />
            </Pressable>
            <Text className={`absolute left-0 right-0 text-center text-base font-bold ${theme.headerText}`}>
              {getCategoryTitle()}
            </Text>
          </View>
          {/* Progress Dots */}
          <View className="mb-6 flex-row items-center justify-center gap-2">
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
            <View className="h-2 w-2 rounded-full bg-purple-600" />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
            <View className={`h-2 w-2 rounded-full ${theme.isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />
          </View>

          {/* Cover Image */}
          <View className={`mb-6 h-[200px] overflow-hidden rounded-3xl shadow-lg ${theme.isDarkMode ? 'border border-white/10' : ''}`}>
            <Image
              source={eventCoverImage}
              className="h-full w-full"
              resizeMode="cover"
            />

            <Pressable className={`absolute bottom-4 self-center rounded-full px-6 py-2.5 ${theme.surfaceStrong}`}>
              <Text className={`text-sm font-bold ${theme.textOnSurface}`}>
                Change Cover
              </Text>
            </Pressable>

            <Pressable className={`absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full ${theme.surfaceStrong}`}>
              <Camera color={theme.iconColor} size={20} />
            </Pressable>
          </View>

          <View className="gap-5">{renderFormFields()}</View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        className={`absolute left-0 right-0 border-t px-5 pt-4 ${theme.divider} ${theme.isDarkMode ? 'bg-[#070812]' : 'bg-white'}`}
        style={{ bottom: 0, paddingBottom: insets.bottom + 16 }}
      >
        <MotiPressable
          onPress={() => router.push(`/create-event-rsvp-settings?category=${category}`)}
          animate={({ pressed }) => {
            "worklet";
            return { scale: pressed ? 0.98 : 1 };
          }}
        >
          <LinearGradient
            colors={["#9333ea", "#a855f7", "#ec4899"]}
            className="h-14 flex-row items-center justify-center gap-2"
            style={{
              borderRadius: 24
            }}
          >
            <Text className="text-base font-bold text-white">Continue</Text>
          </LinearGradient>
        </MotiPressable>
      </View>
    </View>
  );
}

function CommonEventDetails({
  eventData,
  updateField,
}: {
  eventData: any;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <FormSection title="Event Details">
      <FormField label="Venue">
        <Input
          value={eventData.location}
          onChangeText={(v) => updateField("location", v)}
          placeholder="The Grove Resort, Davao City"
        />
      </FormField>

      <DateTimeFields eventData={eventData} updateField={updateField} />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Food/Catering">
            <SpinnerField
              value={eventData.foodOption}
              onChange={(v) => updateField("foodOption", v)}
              items={["Buffet", "Plated Dinner", "Snacks Only", "No Food"]}
            />
          </FormField>
        </View>

        <View className="flex-1">
          <FormField label="Dress Code">
            <SpinnerField
              value={eventData.dressCode}
              onChange={(v) => updateField("dressCode", v)}
              items={[
                "Casual",
                "Formal",
                "Semi-Formal",
                "Cocktail",
                "Black Tie",
              ]}
            />
          </FormField>
        </View>
      </View>
    </FormSection>
  );
}

function DateTimeFields({
  eventData,
  updateField,
}: {
  eventData: any;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <View className="flex-row gap-2">
      <View className="flex-1">
        <DatePickerField
          value={eventData.date}
          onChange={(value) => updateField("date", value)}
        />
      </View>

      <View className="flex-1">
        <TimePickerField
          value={eventData.time}
          onChange={(value) => updateField("time", value)}
        />
      </View>
    </View>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useScreenTheme();

  return (
    <View className={`gap-4 rounded-2xl border p-5 ${theme.surfaceSoft}`}>
      <Text className={`text-base font-black ${theme.headerText}`}>{title}</Text>
      {children}
    </View>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const theme = useScreenTheme();

  return (
    <View>
      <Text className={`mb-2 text-sm font-semibold ${theme.subText}`}>{label}</Text>
      {children}
    </View>
  );
}

function Input({
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput>) {
  const theme = useScreenTheme();

  return (
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={theme.chevronColor}
      className={`rounded-xl border px-4 text-sm ${theme.surface} ${theme.textOnSurface} ${multiline ? "min-h-[100px] py-3" : "h-12"
        }`}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useScreenTheme();

  return (
    <View className={`flex-row items-center justify-between rounded-xl border p-4 ${theme.surfaceSoft}`}>
      <Text className={`text-sm font-semibold ${theme.textOnSurface}`}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#d1d5db", true: "#9333ea" }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
