import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useScreenTheme } from '@/hooks/use-screen-theme';
import { formatDateForApi, formatDateForDisplay, parseApiDate } from '@/utils/dateTime';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
};

export default function DatePickerField({
  value,
  onChange,
  placeholder = 'Select Date',
  minimumDate,
  maximumDate,
  error,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const theme = useScreenTheme();

  return (
    <View>
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`h-12 justify-center rounded-xl border px-4 ${error ? 'border-red-400' : ''} ${theme.surface}`}
      >
        <Text className={`text-sm ${value ? theme.textOnSurface : theme.mutedText}`}>
          {value ? formatDateForDisplay(value) : placeholder}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={parseApiDate(value) || minimumDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selectedDate) => {
            setShowPicker(false);

            if (selectedDate) {
              onChange(formatDateForApi(selectedDate));
            }
          }}
        />
      )}
      {!!error && <Text className="mt-1 text-xs font-semibold text-red-500">{error}</Text>}
    </View>
  );
}
