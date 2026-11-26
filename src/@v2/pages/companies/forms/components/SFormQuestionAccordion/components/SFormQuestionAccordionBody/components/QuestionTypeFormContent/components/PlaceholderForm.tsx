import { Box, Typography } from '@mui/material';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';

interface PlaceholderFormProps {
  sectionIndex: number;
  questionIndex: number;
  structureFrozen?: boolean;
}

export const PlaceholderForm = ({
  sectionIndex,
  questionIndex,
}: PlaceholderFormProps) => {
  return (
    <Box>
      <Typography variant="body1" color="text.secondary">Campo Automático</Typography>
    </Box>
  );
};
