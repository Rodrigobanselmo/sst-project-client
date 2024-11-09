import { Box } from '@mui/material';

export interface SStartAddonCircleProps {
  color: string;
}

export const SStartAddonCircle = ({ color }: SStartAddonCircleProps) => {
  return (
    <Box
      sx={{
        mr: 4,
        ml: -2,
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '3px solid',
        borderColor: color,
      }}
    />
  );
};
