import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';

export const GraphEmpty = ({
  text = 'Nenhum dado disponível',
  textProps,
}: {
  text?: string;
  textProps?: STextProps;
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <SText variant="body2" color="text.secondary" {...textProps}>
        {text}
      </SText>
    </Box>
  );
};
