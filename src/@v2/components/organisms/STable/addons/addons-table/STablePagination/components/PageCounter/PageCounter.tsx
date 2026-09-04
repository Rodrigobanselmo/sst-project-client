import { Box, ButtonProps, Typography } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';

interface IPageCounter extends ButtonProps {
  count: number;
  label?: string;
}
export const PageCounter: React.FC<IPageCounter> = ({ count, label }) => {
  return (
    <Box display="flex" gap="4px">
      <SText fontSize={14} color={'text.secondary'} ml={2}>
        {label ?? (
          <>
            Total:&nbsp;
            {count}
          </>
        )}
      </SText>
    </Box>
  );
};
