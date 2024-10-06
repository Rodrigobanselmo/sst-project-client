import { ArrowDropDown } from '@mui/icons-material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { IconButton, Paper, TypographyProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

export interface SSelectButtonProps {
  label: string;
  anchorEl: React.RefObject<HTMLDivElement>;
  onClick: () => void;
}

export const SSelectButton = ({
  label,
  onClick,
  anchorEl,
}: SSelectButtonProps) => {
  return (
    <SFlex
      ref={anchorEl}
      m="auto"
      onClick={onClick}
      justify={'space-between'}
      align={'center'}
      px={3}
      width={'fit-content'}
      pr={2}
      sx={{
        borderRadius: '5px',
        borderColor: 'gray.400',
        cursor: 'pointer',
        backgroundColor: 'grey.200',
        borderWidth: '1px',
        position: 'relative',
        userSelect: 'none',
        borderStyle: 'solid',
        ':hover': {
          borderColor: 'gray.500',
          backgroundColor: 'grey.300',
        },
        ':active': {
          borderColor: 'gray.600',
          backgroundColor: 'grey.400',
        },
      }}
    >
      <SText color={'text.medium'} fontSize={12} lineNumber={1}>
        {label}
      </SText>
      <ArrowDropDown
        sx={{
          fontSize: 15,
          color: 'text.medium',
        }}
      />
    </SFlex>
  );
};
