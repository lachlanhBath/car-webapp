import { createGlobalStyle, DefaultTheme } from 'styled-components';
import { colors, typography, spacing } from './styleGuide';

const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  /* Set core body defaults */
  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }
  
  body {
    font-family: ${typography.fontFamily.primary};
    font-size: ${typography.fontSize.base};
    font-weight: ${typography.fontWeight.regular};
    line-height: ${typography.lineHeight.normal};
    color: ${colors.text.primary};
    background-color: ${colors.dark.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${typography.fontFamily.secondary};
    font-weight: ${typography.fontWeight.bold};
    line-height: ${typography.lineHeight.tight};
    margin-bottom: ${spacing[4]};
    letter-spacing: ${typography.letterSpacing.tight};
  }
  
  h1 {
    font-size: ${typography.fontSize['4xl']};
    margin-bottom: ${spacing[6]};
  }
  
  h2 {
    font-size: ${typography.fontSize['3xl']};
    margin-bottom: ${spacing[5]};
  }
  
  h3 {
    font-size: ${typography.fontSize['2xl']};
  }
  
  h4 {
    font-size: ${typography.fontSize.xl};
  }
  
  h5 {
    font-size: ${typography.fontSize.lg};
  }
  
  h6 {
    font-size: ${typography.fontSize.base};
  }
  
  p {
    margin-bottom: ${spacing[4]};
  }
  
  a {
    color: ${colors.primary.main};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${colors.primary.light};
      text-decoration: underline;
    }
  }
  
  /* Lists */
  ul, ol {
    padding-left: ${spacing[6]};
    margin-bottom: ${spacing[4]};
  }
  
  li {
    margin-bottom: ${spacing[2]};
  }
  
  /* Focus styles */
  :focus-visible {
    outline: 3px solid ${colors.primary.main};
    outline-offset: 2px;
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${colors.dark.border};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${colors.gray[600]};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.gray[500]};
  }
  
  /* Selection styling */
  ::selection {
    background-color: ${colors.primary.main};
    color: white;
  }
  
  /* Responsive images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  /* Code blocks */
  code, pre {
    font-family: ${typography.fontFamily.mono};
    font-size: ${typography.fontSize.sm};
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  code {
    padding: ${spacing[1]} ${spacing[2]};
  }
  
  pre {
    padding: ${spacing[4]};
    overflow-x: auto;
    margin-bottom: ${spacing[4]};
  }
  
  /* Form elements */
  input, textarea, select, button {
    font-family: ${typography.fontFamily.primary};
  }
  
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${spacing[6]};
  }
  
  th, td {
    padding: ${spacing[3]} ${spacing[4]};
    text-align: left;
    border-bottom: 1px solid ${colors.dark.border};
  }
  
  th {
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.gray[300]};
  }
  
  /* Section spacing */
  section {
    margin-bottom: ${spacing[12]};
  }
  
  /* Container */
  .container {
    width: 100%;
    max-width: ${(props: { theme: DefaultTheme }) => props.theme.maxWidth || '1280px'};
    margin: 0 auto;
    padding: 0 ${spacing[4]};
    
    @media (min-width: 768px) {
      padding: 0 ${spacing[6]};
    }
  }
  
  /* Helper classes */
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  .uppercase {
    text-transform: uppercase;
  }
  
  .capitalize {
    text-transform: capitalize;
  }
  
  .text-secondary {
    color: ${colors.text.secondary};
  }
  
  .text-primary-color {
    color: ${colors.primary.main};
  }
  
  .text-secondary-color {
    color: ${colors.secondary.main};
  }
  
  .bg-surface {
    background-color: ${colors.dark.surface};
  }
  
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export default GlobalStyles; 