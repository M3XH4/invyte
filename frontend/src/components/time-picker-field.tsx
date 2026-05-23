import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import {
  combineDateAndTime,
  formatTimeForApi,
  formatTimeForDisplay,
  isToday,
  parseApiTime,
} from '@/utils/dateTime';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  selectedDate?: string;
  preventPastTime?: boolean;
  error?: string;
};

export default function TimePickerField({
  value,
  onChange,
  placeholder = 'Select Time',
  selectedDate,
  preventPastTime = false,
  error,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [localError, setLocalError] = useState('');
  const theme = useScreenTheme();
  const displayError = error || localError;

  return (
    <View>
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`h-12 justify-center rounded-xl border px-4 ${displayError ? 'border-red-400' : ''} ${theme.surface}`}
      >
        <Text className={`text-sm ${value ? theme.textOnSurface : theme.mutedText}`}>
          {value ? formatTimeForDisplay(value) : placeholder}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value ? parseApiTime(value) : new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedTime) => {
            setShowPicker(false);

            if (selectedTime) {
              const formatted = formatTimeForApi(selectedTime);
              const selectedDateTime = combineDateAndTime(selectedDate, formatted);

              if (
                preventPastTime &&
                selectedDate &&
                isToday(selectedDate) &&
                selectedDateTime &&
                selectedDateTime.getTime() <= Date.now()
              ) {
                setLocalError('Choose a future time.');
                return;
              }

              setLocalError('');
              onChange(formatted);
            }
          }}
        />
      )}
      {!!displayError && <Text className="mt-1 text-xs font-semibold text-red-500">{displayError}</Text>}
    </View>
  );
}
