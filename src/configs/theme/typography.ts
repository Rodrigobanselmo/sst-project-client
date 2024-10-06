import { TypographyOptions } from '@mui/material/styles/createTypography';

export default {
  fontFamily: 'Poppins',
  h1: {
    fontSize: '22px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '22px',
    },
    color: '#2B323B',
    fontWeight: 700,
  },
  h2: {
    fontSize: '20px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '20px',
    },
    color: '#2B323B',
    fontWeight: 600,
  },
  h3: {
    fontSize: '18px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '18px',
    },
    color: '#2B323B',
    fontWeight: 500,
  },
  h4: {
    fontSize: '16px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '16px',
    },
    color: '#2B323B',
    fontWeight: 700,
  },
  h5: {
    fontSize: '14px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '14px',
    },
    color: '#2B323B',
    fontWeight: 600,
  },
  h6: {
    fontSize: '12px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '12px',
    },
    color: '#2B323B',
    fontWeight: 500,
  },
  body1: {
    fontSize: '14px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '14px',
    },
    color: '#2B323B',
    fontWeight: 400,
  },
  body2: {
    fontSize: '12px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '12px',
    },
    color: '#2B323B',
    fontWeight: 400,
  },
  button: {
    fontSize: '14px',
    lineHeight: '140%',
    '@media (max-width: 960px)': {
      fontSize: '12px',
    },
    color: '#2B323B',
    fontWeight: 500,
  },
  caption: {
    fontSize: '12px',
    lineHeight: '140%',
    color: '#2B323B',
    fontWeight: 400,
  },
  overline: {
    fontSize: '10px',
    lineHeight: '140%',
    color: '#2B323B',
    fontWeight: 400,
  },
} as TypographyOptions;
