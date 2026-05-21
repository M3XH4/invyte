import { useAppTheme } from '@/context/theme-context';

export function useScreenTheme() {
  const { isDarkMode } = useAppTheme();

  return {
    isDarkMode,
    page: isDarkMode ? 'bg-[#070812]' : 'bg-[#F7F7FB]',
    pageGradient: isDarkMode
      ? (['#050816', '#0b1120', '#12081c'] as const)
      : (['#faf5ff', '#fdf2f8', '#faf5ff'] as const),
    pageGlowOne: isDarkMode ? 'bg-cyan-400/10' : 'bg-purple-400/10',
    pageGlowTwo: isDarkMode ? 'bg-fuchsia-400/10' : 'bg-pink-400/10',
    pageGlowThree: isDarkMode ? 'bg-sky-400/10' : 'bg-blue-400/10',
    headerText: isDarkMode ? 'text-white' : 'text-gray-900',
    subText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    mutedText: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    sectionLabel: isDarkMode ? 'text-gray-500' : 'text-gray-500',
    surface: isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white',
    surfaceSoft: isDarkMode ? 'border-white/10 bg-white/10' : 'border-gray-100 bg-white',
    surfaceStrong: isDarkMode ? 'border-white/10 bg-[#11131f]' : 'border-gray-100 bg-white',
    surfaceMuted: isDarkMode ? 'bg-white/10' : 'bg-gray-50',
    textOnSurface: isDarkMode ? 'text-white' : 'text-gray-900',
    textOnSurfaceSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    iconButton: isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white',
    iconColor: isDarkMode ? '#e5e7eb' : '#374151',
    chevronColor: isDarkMode ? '#6b7280' : '#9ca3af',
    divider: isDarkMode ? 'border-white/10' : 'border-gray-100',
    footerText: isDarkMode ? 'text-gray-600' : 'text-gray-400',
  };
}