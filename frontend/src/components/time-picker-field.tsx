import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function TimePickerField({
  value,
  onChange,
  placeholder = 'Select Time',
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const theme = useScreenTheme();

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`h-12 justify-center rounded-xl border px-4 ${theme.surface}`}
      >
        <Text className={`text-sm ${value ? theme.textOnSurface : theme.mutedText}`}>
          {value || placeholder}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedTime) => {
            setShowPicker(false);

            if (selectedTime) {
              const formatted = selectedTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              onChange(formatted);
            }
          }}
        />
      )}
    </>
  );
}