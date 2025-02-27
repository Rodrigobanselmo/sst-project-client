import { FC } from 'react';
import { Badge } from '@mui/material';

interface Props {
  content: number;
  children: React.ReactNode;
}

export const SIconButtonBadgeRow: FC<Props> = ({ children, content }) => (
  <Badge badgeContent={content} color="default">
    {children}
  </Badge>
);
