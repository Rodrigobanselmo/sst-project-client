import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

export const StyledChip = styled(Chip)`
  transition: opacity 0.3s ease-in-out;

  &:hover {
    opacity: 0.7;
  }

  svg {
    fontsize: '16px !important';
    cursor: pointer;
  }
`;
