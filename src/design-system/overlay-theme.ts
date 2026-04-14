export interface OverlayTheme {
  accent: string;
  accentLight: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  drawDefault: string;
}

export const OVERLAY_THEMES: Record<string, OverlayTheme> = {};

export const DEFAULT_OVERLAY_THEME_DARK: OverlayTheme = {
  accent: '#5B6CF7',
  accentLight: 'rgba(91, 108, 247, 0.2)',
  surface: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: 'rgba(148, 163, 184, 0.6)',
  border: 'rgba(148, 163, 184, 0.2)',
  drawDefault: '#000000',
};

export const DEFAULT_OVERLAY_THEME_LIGHT: OverlayTheme = {
  accent: '#5B6CF7',
  accentLight: 'rgba(91, 108, 247, 0.16)',
  surface: '#ffffff',
  textPrimary: '#171717',
  textSecondary: 'rgba(23, 23, 23, 0.58)',
  border: 'rgba(17, 17, 17, 0.14)',
  drawDefault: '#FFFFFF',
};

export const resolveOverlayTheme = (themeId?: string, baseTheme: 'dark' | 'light' = 'dark'): OverlayTheme => {
  if (themeId && themeId !== 'default' && OVERLAY_THEMES[themeId]) {
    return OVERLAY_THEMES[themeId];
  }
  return baseTheme === 'light' ? DEFAULT_OVERLAY_THEME_LIGHT : DEFAULT_OVERLAY_THEME_DARK;
};
