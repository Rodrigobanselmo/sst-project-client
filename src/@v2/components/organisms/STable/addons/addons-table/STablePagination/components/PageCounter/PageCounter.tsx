import { Box, ButtonProps, Typography } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';

interface IPageCounter extends ButtonProps {
  count: number;
}
export const PageCounter: React.FC<IPageCounter> = ({ count }) => {
  return (
    <Box display="flex" gap="4px">
      <SText fontSize={14} color={'text.secondary'} ml={2}>
        Total:&nbsp;
      </SText>
      <SText fontSize={14} color={'text.secondary'}>
        {count}
      </SText>
    </Box>
  );
};
