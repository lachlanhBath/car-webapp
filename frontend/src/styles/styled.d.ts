// styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    maxWidth?: string;
    colors: {
      background: string;
      surface: string;
      border: string;
      divider: string;
    };
    textColors: {
      primary: string;
      secondary: string;
      disabled: string;
      hint: string;
      onLight: string;
      onLightSecondary: string;
    };
    primaryColor: {
      main: string;
      light: string;
      dark: string;
      contrast: string;
    };
    secondaryColor: {
      main: string;
      light: string;
      dark: string;
      contrast: string;
    };
  }
} 