import { Box } from '@mui/material';
import { SStartAddonIcon } from './SStartAddonIcon';

export interface SStartAddonCircleProps {
  color: string;
}

export const SStartAddonCircle = ({ color }: SStartAddonCircleProps) => {
  return (
    <SStartAddonIcon
      item={
        <Box
          sx={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            border: '3px solid',
            borderColor: color,
          }}
        />
      }
    />
  );
};
