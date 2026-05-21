import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function DatePickerField({
  value,
  onChange,
  placeholder = 'Select Date',
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
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowPicker(false);

            if (selectedDate) {
              const formatted = selectedDate.toISOString().split('T')[0];
              onChange(formatted);
            }
          }}
        />
      )}
    </>
  );
}