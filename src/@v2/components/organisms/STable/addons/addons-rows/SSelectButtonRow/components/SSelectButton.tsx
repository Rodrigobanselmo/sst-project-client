import { ArrowDropDown } from '@mui/icons-material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import chroma from 'chroma-js';
import {
  CircularProgress,
  IconButton,
  Paper,
  TypographyProps,
  useTheme,
} from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import theme from 'configs/theme';

export interface SSelectButtonProps {
  label: string;
  anchorEl: React.RefObject<HTMLDivElement>;
  onClick: () => void;
  minWidth?: number | number[] | string | string[];
  loading?: boolean;
  schema?: {
    color: string;
    borderColor: string;
    iconColor: string;
    backgroundColor: string;
  };
}

export const SSelectButton = ({
  label,
  onClick,
  anchorEl,
  minWidth,
  loading,
  schema = {
    color: theme.palette.text.medium,
    borderColor: theme.palette.grey[400],
    iconColor: theme.palette.text.medium,
    backgroundColor: theme.palette.grey[200],
  },
}: SSelectButtonProps) => {
  return (
    <SFlex
      ref={anchorEl}
      m="auto"
      onClick={loading ? undefined : onClick}
      justify={'space-between'}
      align={'center'}
      px={4}
      width={'fit-content'}
      minWidth={minWidth}
      pr={2}
      py={1}
      color={schema.color}
      sx={{
        opacity: loading ? 0.5 : 1,
        borderRadius: '5px',
        borderColor: schema.borderColor,
        cursor: loading ? 'not-allowed' : 'pointer',
        backgroundColor: schema.backgroundColor,
        borderWidth: '1px',
        position: 'relative',
        userSelect: 'none',
        borderStyle: 'solid',
        ':hover': {
          borderColor: chroma(schema.borderColor).darken().hex(),
          backgroundColor: chroma(schema.backgroundColor).darken(0.5).hex(),
        },
        ':active': {
          borderColor: chroma(schema.borderColor).darken(1).hex(),
          backgroundColor: chroma(schema.backgroundColor).darken(0.8).hex(),
        },
      }}
    >
      <SText color={schema.color} fontSize={12} lineNumber={1}>
        {label}
      </SText>
      {!loading ? (
        <ArrowDropDown
          sx={{
            fontSize: 15,
            color: schema.iconColor,
          }}
        />
      ) : (
        <CircularProgress size={10} sx={{ mr: 2 }} color="inherit" />
      )}
    </SFlex>
  );
};
