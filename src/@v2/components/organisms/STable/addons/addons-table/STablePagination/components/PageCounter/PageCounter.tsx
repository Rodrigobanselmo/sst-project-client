import { Box, ButtonProps, Typography } from '@mui/material';
import SText from '@v2/components/atoms/SText/SText';

interface IPageCounter extends ButtonProps {
  count: number;
}
export const PageCounter: React.FC<IPageCounter> = ({ count }) => {
  return (
    <Box display="flex" gap="4px">
      <SText fontSize={14}>Total:&nbsp;</SText>
      <SText fontSize={14}>{count}</SText>
    </Box>
  );
};
