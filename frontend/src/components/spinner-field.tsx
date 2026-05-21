import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: string[];
};

export default function SpinnerField({
  value,
  onChange,
  items,
}: Props) {
  const theme = useScreenTheme();

  return (
    <View className={`overflow-hidden rounded-xl border ${theme.surface}`}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => onChange(itemValue)}
        style={{ color: theme.isDarkMode ? '#f8fafc' : '#111827' }}
      >
        <Picker.Item label="Select option" value="" color={theme.chevronColor} />

        {items.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
            color={theme.isDarkMode ? '#f8fafc' : '#111827'}
          />
        ))}
      </Picker>
    </View>
  );
}