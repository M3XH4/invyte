import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState, createContext, useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const STORAGE_KEY = 'invyte-theme-scheme';

type ThemeScheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: ThemeScheme;
  isDarkMode: boolean;
  setScheme: (scheme: ThemeScheme) => void;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useRNColorScheme();
  const [storedScheme, setStoredScheme] = useState<ThemeScheme | null>(null);

  useEffect(() => {
    let isActive = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!isActive) return;

        if (value === 'light' || value === 'dark') {
          setStoredScheme(value);
        }
      })
      .catch(() => {
        // Ignore storage failures and fall back to the device scheme.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const scheme: ThemeScheme =
    storedScheme ?? (deviceScheme === 'dark' ? 'dark' : 'light');

  const setScheme = (nextScheme: ThemeScheme) => {
    setStoredScheme(nextScheme);
    void AsyncStorage.setItem(STORAGE_KEY, nextScheme);
  };

  const value = useMemo(
    () => ({
      scheme,
      isDarkMode: scheme === 'dark',
      setScheme,
      toggleScheme: () => {
        setScheme(scheme === 'dark' ? 'light' : 'dark');
      },
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  const deviceScheme = useRNColorScheme();

  if (context) {
    return context;
  }

  const scheme: ThemeScheme = deviceScheme === 'dark' ? 'dark' : 'light';

  return {
    scheme,
    isDarkMode: scheme === 'dark',
    setScheme: () => {},
    toggleScheme: () => {},
  };
}
