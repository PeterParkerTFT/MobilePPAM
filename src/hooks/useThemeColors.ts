import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../constants/theme';

export function useThemeColors() {
  const { isDark } = useTheme();
  return isDark ? colors.dark : colors.light;
}
