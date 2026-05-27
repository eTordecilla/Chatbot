import { createTheme, alpha } from '@mui/material/styles';
import { esES } from '@mui/x-data-grid/locales';
import { esES as datePickersEsEs } from '@mui/x-date-pickers/locales';
import { esES as coreEsEs } from '@mui/material/locale';
import { red } from '@mui/material/colors';

// Colores corporativos de Yamaha
const yamahaColors = {
  red: '#ff0000',
  redDark: '#cc0000',
  redLight: '#ff3333',
  blueRacing: '#0a2d82',
  blueRacingDark: '#061d54',
  blueRacingLight: '#1a4ab0',
  coolGray4: '#bcbdbc',
  coolGray10: '#616365',
  black: '#1e1e1e',
  white: '#ffffff',
};

export const yamahaTheme = createTheme(
  {
    palette: {
      primary: {
        main: yamahaColors.coolGray4,
        dark: '#9d9e9d',
        light: '#d4d5d4',
        contrastText: yamahaColors.black,
      },
      secondary: {
        main: yamahaColors.red,
        dark: yamahaColors.redDark,
        light: yamahaColors.redLight,
        contrastText: yamahaColors.white,
      },
      yamahaRed: {
        main: yamahaColors.red,
        dark: yamahaColors.redDark,
        light: yamahaColors.redLight,
        contrastText: yamahaColors.white,
      },
      blueRacing: {
        main: yamahaColors.blueRacing,
        dark: yamahaColors.blueRacingDark,
        light: yamahaColors.blueRacingLight,
        contrastText: yamahaColors.white,
      },
      purpleMusical: {
        main: '#54268f',
        dark: '#3d1c68',
        light: '#7a4bb8',
        contrastText: yamahaColors.white,
      },
      brightPink: {
        main: '#ff0080',
        dark: '#cc0066',
        light: '#ff3399',
        contrastText: yamahaColors.white,
      },
      fullOrange: {
        main: '#ff8000',
        dark: '#cc6600',
        light: '#ff9933',
        contrastText: yamahaColors.black,
      },
      digitalYellow: {
        main: '#ffff00',
        dark: '#cccc00',
        light: '#ffff66',
        contrastText: yamahaColors.black,
      },
      fullGreen: {
        main: '#00ff00',
        dark: '#00cc00',
        light: '#66ff66',
        contrastText: yamahaColors.black,
      },
      aqua: {
        main: '#00ffff',
        dark: '#00cccc',
        light: '#66ffff',
        contrastText: yamahaColors.black,
      },
      error: {
        main: red.A400,
        dark: red[700],
        light: red[300],
      },
      success: {
        main: '#2e7d32',
        dark: '#1b5e20',
        light: '#4caf50',
      },
      warning: {
        main: '#ed6c02',
        dark: '#e65100',
        light: '#ff9800',
      },
      info: {
        main: yamahaColors.blueRacing,
        dark: yamahaColors.blueRacingDark,
        light: yamahaColors.blueRacingLight,
      },
      gray: {
        main: '#f2f5f7',
        dark: '#49555c',
        light: '#fafbfc',
      },
      gray4: {
        main: yamahaColors.coolGray4,
        dark: '#9d9e9d',
        darker: '#757475',
        light: '#d4d5d4',
      },
      gray10: {
        main: yamahaColors.coolGray10,
        dark: '#4a4c4e',
        light: '#7a7c7e',
      },
      blackPantone: {
        main: yamahaColors.black,
        light: '#3d3d3d',
      },
      background: {
        default: '#f2f5f7',
        paper: '#ffffff',
      },
      text: {
        primary: yamahaColors.black,
        secondary: yamahaColors.coolGray10,
      },
      divider: alpha(yamahaColors.coolGray10, 0.2),
    },    typography: {
      fontFamily: 'Source Sans Pro, Roboto, Helvetica, Arial, sans-serif',
      h1: {
        fontWeight: 600,
        color: yamahaColors.black,
      },
      h2: {
        fontWeight: 600,
        color: yamahaColors.black,
      },
      h3: {
        fontWeight: 600,
        color: yamahaColors.black,
      },
      h4: {
        fontWeight: 600,
        color: yamahaColors.black,
      },
      h5: {
        fontWeight: 600,
        color: yamahaColors.black,
      },
      h6: {
        fontWeight: 600,
        color: yamahaColors.black,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      // Personalización de botones
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 600,
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: yamahaColors.redDark,
            },
          },
        },
      },
      // Personalización del Chip
      MuiChip: {
        styleOverrides: {
          root: {
            // Estilo por defecto
            borderRadius: 4,
            fontWeight: 500,
          },
        },
      },      // Personalización Data Grid
      MuiDataGrid: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: 'none',
            '&&': {
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: alpha(theme.palette.gray4.main, 0.3),
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: alpha(
                  theme.palette.gray4.darker,
                  theme.palette.action.selectedOpacity
                ),
              },
              '& .MuiDataGrid-row.Mui-selected:hover': {
                backgroundColor: alpha(
                  theme.palette.gray4.darker,
                  theme.palette.action.selectedOpacity +
                    theme.palette.action.hoverOpacity
                ),
              },
              '& .MuiCheckbox-root': {
                color: theme.palette.text.primary,
              },
              '& .MuiCheckbox-root.Mui-checked, & .MuiCheckbox-root.MuiCheckbox-indeterminate':
                {
                  color: theme.palette.secondary.main,
                },
              '& .MuiCheckbox-root:hover': {
                backgroundColor: alpha(
                  theme.palette.gray4.darker,
                  theme.palette.action.hoverOpacity
                ),
              },
              '& .MuiCheckbox-root.Mui-checked:hover, & .MuiCheckbox-root.MuiCheckbox-indeterminate:hover':
                {
                  backgroundColor: alpha(
                    theme.palette.gray4.darker,
                    theme.palette.action.hoverOpacity
                  ),
                },
              '& .MuiCheckbox-root.Mui-disabled': {
                color: theme.palette.action.disabled,
              },
            },
          }),
        },
      },      // Personalización del icono del Step
      MuiStepIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Mui-active': {
              color: theme.palette.secondary.main,
              fontWeight: 700,
            },
            '&.Mui-completed': {
              color: theme.palette.success.main,
            },
            '& .MuiStepIcon-text': {
              fill: '#ffffff',
            },
          }),
        },
      },
      // Personalización del texto del StepLabel
      MuiStepLabel: {
        styleOverrides: {
          label: {
            '&.Mui-active': {
              fontWeight: 700,
            },
          },
        },
      },
      // Personalización de Tabs (contenedor)
      MuiTabs: {
        styleOverrides: {
          indicator: ({ theme }) => ({
            backgroundColor: theme.palette.secondary.main,
            height: 3,
          }),
        },
      },
      // Personalización de Tab (cada pestaña)
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 500,
            color: theme.palette.text.secondary,
            '&.Mui-selected': {
              color: theme.palette.secondary.main,
              fontWeight: 700,
            },
            '&:hover': {
              color: theme.palette.secondary.dark,
              opacity: 1,
            },
          }),
        },
      },
      // Personalización de Paper
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      // Personalización de Card
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      // Personalización de TextField
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.gray4.dark,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.secondary.main,
              },
            },
          }),
        },
      },
      // Personalización de InputLabel
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Mui-focused': {
              color: theme.palette.secondary.main,
            },
          }),
        },
      },
    },
  },
  esES,
  datePickersEsEs,
  coreEsEs
);
