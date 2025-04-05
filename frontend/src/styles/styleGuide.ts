// Style Guide for Bath-Hack 2025 Vehicle Service Application
// A sleek, modern web app UI inspired by high-end automotive sites

// Color Palette
export const colors = {
  // Primary colors
  primary: {
    main: '#3A86FF', // Vibrant blue for primary actions and highlights
    light: '#61A0FF',
    dark: '#2A66CC',
    contrast: '#FFFFFF'
  },
  // Secondary colors
  secondary: {
    main: '#FF006E', // Vibrant accent for special elements
    light: '#FF4B93',
    dark: '#CC0058',
    contrast: '#FFFFFF'
  },
  // Dark theme base colors
  dark: {
    background: '#121212', // Main background
    surface: '#1E1E1E', // Cards, dialogs
    border: '#2A2A2A',
    divider: '#2F2F2F'
  },
  // Light theme alternatives
  light: {
    background: '#F5F5F7', // Light gray background
    surface: '#FFFFFF',
    border: '#E0E0E0',
    divider: '#EEEEEE'
  },
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    disabled: '#666666',
    hint: '#888888',
    onLight: '#121212',
    onLightSecondary: '#666666'
  },
  // State colors
  state: {
    success: '#00C853',
    warning: '#FFD600',
    error: '#FF3D00',
    info: '#00B0FF'
  },
  // Neutral grays
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
};

// Typography
export const typography = {
  // Font families
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    secondary: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Roboto Mono', Menlo, Monaco, 'Courier New', monospace",
  },
  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  }
};

// Spacing system
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  56: '14rem',     // 224px
  64: '16rem',     // 256px
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // For completely round elements
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(58, 134, 255, 0.5)',
  none: 'none',
  // Dark mode elevated surfaces
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  }
};

// Transitions
export const transitions = {
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Z-index values for consistent layering
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  drawer: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: '0px',      // Mobile first
  sm: '640px',    // Small screens, phones
  md: '768px',    // Medium screens, tablets
  lg: '1024px',   // Large screens, laptops
  xl: '1280px',   // Extra large screens, desktops
  '2xl': '1536px' // Ultra large screens
};

// Layout constraints
export const layout = {
  maxWidth: {
    sm: '640px', 
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    none: 'none',
  },
  container: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    }
  }
};

// Common component styles
export const components = {
  button: {
    // Base styles applied to all buttons
    base: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.none,
      borderRadius: borderRadius.md,
      transition: `all ${transitions.duration.fast} ${transitions.easing.easeInOut}`,
      padding: `${spacing[3]} ${spacing[6]}`,
    },
    // Variants
    variants: {
      primary: {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
        '&:hover': {
          backgroundColor: colors.primary.dark,
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: colors.primary.main,
        border: `1px solid ${colors.primary.main}`,
        '&:hover': {
          backgroundColor: 'rgba(58, 134, 255, 0.05)',
        },
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: colors.text.primary,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    // Sizes
    sizes: {
      small: {
        fontSize: typography.fontSize.sm,
        padding: `${spacing[2]} ${spacing[4]}`,
      },
      medium: {
        fontSize: typography.fontSize.base,
        padding: `${spacing[3]} ${spacing[6]}`,
      },
      large: {
        fontSize: typography.fontSize.lg,
        padding: `${spacing[4]} ${spacing[8]}`,
      },
    },
  },
  card: {
    base: {
      backgroundColor: colors.dark.surface,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
      overflow: 'hidden',
    },
    variants: {
      elevated: {
        boxShadow: shadows.lg,
      },
      outlined: {
        border: `1px solid ${colors.dark.border}`,
        boxShadow: 'none',
      },
      flat: {
        boxShadow: 'none',
      },
    },
  },
  input: {
    base: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      padding: `${spacing[3]} ${spacing[4]}`,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${colors.dark.border}`,
      borderRadius: borderRadius.md,
      color: colors.text.primary,
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary.main,
        boxShadow: shadows.outline,
      },
      '&::placeholder': {
        color: colors.text.hint,
      },
      '&:disabled': {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        color: colors.text.disabled,
        cursor: 'not-allowed',
      },
    },
  },
  // Common section spacing for page layouts
  section: {
    spacing: {
      small: spacing[6],
      medium: spacing[12],
      large: spacing[20],
    },
  },
};

// Motion design principles
export const motion = {
  // For subtle UI element animations
  subtle: {
    duration: transitions.duration.fast,
    easing: transitions.easing.easeOut,
  },
  // For standard UI transitions like modals, drawers
  standard: {
    duration: transitions.duration.normal,
    easing: transitions.easing.easeInOut,
  },
  // For emphasis animations
  emphasis: {
    duration: transitions.duration.slow,
    easing: transitions.easing.easeInOut,
  },
  // For page transitions
  page: {
    duration: transitions.duration.slower,
    easing: transitions.easing.easeInOut,
  },
};

// Reusable mixins
export const mixins = {
  // For debugging layout issues
  debug: {
    border: '1px solid red',
  },
  // Truncate text with ellipsis
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Hide visually but keep accessible to screen readers
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  // Center content both horizontally and vertically
  centerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Flexbox row with items centered
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Flexbox column
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  // Apply glass morphism effect
  glassMorphism: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.dark.border}`,
  },
};

// Default theme
export const defaultTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  layout,
  components,
  mixins,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  layout,
  components,
  motion,
  mixins,
  defaultTheme,
}; 