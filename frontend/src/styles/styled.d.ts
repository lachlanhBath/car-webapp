// styled.d.ts
import 'styled-components';
import { colors, typography, spacing, borderRadius, shadows, transitions, zIndex, breakpoints, layout, components } from './styleGuide';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    transitions: typeof transitions;
    zIndex: typeof zIndex;
    breakpoints: typeof breakpoints;
    layout: typeof layout;
    components: typeof components;
  }
} 