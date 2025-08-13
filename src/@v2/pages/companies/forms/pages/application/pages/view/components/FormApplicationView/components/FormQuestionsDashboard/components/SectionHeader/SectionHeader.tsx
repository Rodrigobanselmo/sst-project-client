import { ReactNode } from 'react';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { Box } from '@mui/material';

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
}

export const SectionHeader = ({ icon, title }: SectionHeaderProps) => {
  return (
    <SFlex gap={6} alignItems="center" mb={8}>
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      <SText sx={{ fontWeight: 600, fontSize: 24 }}>{title}</SText>
    </SFlex>
  );
};
