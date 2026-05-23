import { useState } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { useScreenTheme } from '@/hooks/use-screen-theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
};

export default function SpinnerField({
  value,
  onChange,
  items,
  placeholder = 'Select option',
}: Props) {
  const theme = useScreenTheme();

  const [open, setOpen] = useState(false);

  const [pickerItems, setPickerItems] = useState(
    items.map((item) => ({
      label: item,
      value: item,
    }))
  );

  return (
    <View
      style={{
        zIndex: open ? 9999 : 1,
      }}
    >
      <DropDownPicker
        open={open}
        value={value}
        items={pickerItems}
        setOpen={setOpen}
        setItems={setPickerItems}
        setValue={(callback) => {
          const newValue = callback(value);
          onChange(newValue);
        }}
        placeholder={placeholder}
        listMode="SCROLLVIEW"
        theme={theme.isDarkMode ? 'DARK' : 'LIGHT'}
        style={{
          minHeight: 48,
          borderRadius: 18,
          borderColor: theme.isDarkMode
            ? '#374151'
            : '#e5e7eb',
          backgroundColor: theme.isDarkMode
            ? '#1f2937'
            : '#ffffff',
          paddingHorizontal: 14,
        }}
        textStyle={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.isDarkMode
            ? '#f8fafc'
            : '#111827',
        }}
        placeholderStyle={{
          color: theme.isDarkMode
            ? '#94a3b8'
            : '#9ca3af',
          fontSize: 13,
          fontWeight: '600',
        }}
        dropDownContainerStyle={{
          borderRadius: 18,
          borderColor: theme.isDarkMode
            ? '#374151'
            : '#e5e7eb',
          backgroundColor: theme.isDarkMode
            ? '#1f2937'
            : '#ffffff',

          marginTop: 6,
          overflow: 'hidden',
        }}
        listItemLabelStyle={{
          fontSize: 13,
          fontWeight: '600',
          color: theme.isDarkMode
            ? '#f8fafc'
            : '#111827',
        }}
        selectedItemLabelStyle={{
          color: '#9333ea',
          fontWeight: '700',
        }}
        arrowIconStyle={{
          tintColor: theme.isDarkMode
            ? '#f8fafc'
            : '#111827',
        } as any}
      />
    </View>
  );
}
