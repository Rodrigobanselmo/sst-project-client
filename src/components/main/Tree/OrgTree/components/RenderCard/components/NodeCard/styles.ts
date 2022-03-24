import { styled, Box } from '@mui/material';

import SIconButton from '../../../../../../../atoms/SIconButton';

export const STSBoxButton = styled(Box)`
  height: 22px;
  border: 1px solid ${(props) => props.theme.palette.background.divider};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.palette.gray[100]};
  }
`;

export const STAddSIconButton = styled(SIconButton)`
  max-height: 30px;
  max-width: 30px;
  position: absolute;
  left: 4px;
`;
