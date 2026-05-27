/**
 * yamahaDesignTokens.js
 * ─────────────────────────────────────────────────────────────
 * Tokens de diseño para el chatbot con identidad Yamaha
 * Úsalos en tus componentes: import { tokens } from './yamahaDesignTokens'
 */

export const colors = {
  // Yamaha corporativo
  red:          '#ff0000',
  redDark:      '#cc0000',
  redLight:     '#ff3333',
  redBg:        '#fff5f5',
  redBorder:    'rgba(255,0,0,0.2)',

  blue:         '#0a2d82',
  blueDark:     '#061d54',
  blueLight:    '#1a4ab0',
  blueBg:       '#f0f3fa',
  blueBorder:   'rgba(10,45,130,0.2)',

  // Grises corporativos
  gray4:        '#bcbdbc',
  gray10:       '#616365',
  black:        '#1e1e1e',
  white:        '#ffffff',

  // Superficies UI
  bgPage:       '#f2f5f7',
  bgPanel:      '#ffffff',
  bgCard:       '#ffffff',
  bgInput:      '#f2f5f7',
  bgHover:      '#f5f5f7',
  border:       '#e0e2e4',
  borderFocus:  '#0a2d82',

  // Semánticos
  success:      '#2e7d32',
  successBg:    '#f1f8f1',
  warning:      '#ed6c02',
  error:        '#d32f2f',
};

export const typography = {
  fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
  sizes: {
    xs:   '11px',
    sm:   '12px',
    base: '13.5px',
    md:   '14px',
    lg:   '16px',
    xl:   '18px',
    '2xl':'22px',
    '3xl':'26px',
  },
  weights: {
    normal: 400,
    semibold: 600,
    bold: 700,
  },
};

export const radii = {
  sm:   '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '12px',
  pill: '20px',
  full: '9999px',
};

export const shadows = {
  sm:  '0 1px 4px rgba(0,0,0,0.06)',
  md:  '0 2px 8px rgba(0,0,0,0.08)',
  lg:  '0 4px 24px rgba(0,0,0,0.10)',
};

/** Estilos inline listos para usar en componentes React */
export const componentStyles = {
  /** Panel / carta blanca con borde */
  card: {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.xl,
    boxShadow: shadows.md,
  },

  /** Burbuja del bot */
  bubbleBot: {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    color: colors.black,
    borderRadius: '12px 12px 12px 3px',
    padding: '9px 13px',
    fontSize: typography.sizes.base,
    lineHeight: 1.5,
    fontFamily: typography.fontFamily,
  },

  /** Burbuja del usuario */
  bubbleUser: {
    background: colors.blue,
    color: colors.white,
    borderRadius: '12px 12px 3px 12px',
    padding: '9px 13px',
    fontSize: typography.sizes.base,
    lineHeight: 1.5,
    fontFamily: typography.fontFamily,
  },

  /** Input de texto */
  input: {
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: '8px 12px',
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    color: colors.black,
    background: colors.bgPanel,
    outline: 'none',
  },

  /** Botón de envío */
  sendBtn: {
    background: colors.red,
    border: 'none',
    borderRadius: radii.lg,
    width: 36,
    height: 36,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Chip de sugerencia */
  chip: {
    padding: '5px 12px',
    borderRadius: radii.pill,
    border: `1px solid ${colors.border}`,
    fontSize: typography.sizes.sm,
    color: colors.gray10,
    cursor: 'pointer',
    background: colors.bgPanel,
    fontFamily: typography.fontFamily,
    whiteSpace: 'nowrap',
  },

  /** Nav item activo en sidebar */
  navItemActive: {
    color: colors.red,
    borderLeft: `3px solid ${colors.red}`,
    background: colors.redBg,
    fontWeight: typography.weights.semibold,
  },

  /** Tag en panel derecho */
  kbTag: {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: radii.sm,
    background: colors.bgPage,
    border: `1px solid ${colors.border}`,
    fontSize: typography.sizes.xs,
    color: colors.black,
    cursor: 'pointer',
  },

  /** Tarjeta del clima – fondo azul Yamaha */
  weatherCard: {
    background: colors.blue,
    borderRadius: radii.lg,
    padding: '12px',
    color: colors.white,
  },

  /** Cita del día – borde rojo Yamaha */
  quoteBox: {
    background: colors.redBg,
    borderLeft: `3px solid ${colors.red}`,
    borderRadius: `0 ${radii.md} ${radii.md} 0`,
    padding: '9px 10px',
  },
};

export default { colors, typography, radii, shadows, componentStyles };
