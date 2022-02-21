import { css } from '@emotion/react';
import { styled } from '@mui/material';

export const STSFileUploaderContainer = styled('div')<{
  is_drag_active: number;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px dashed ${(props) => props.theme.palette.background.divider};
  background-color: ${(props) => props.theme.palette.grey[50]};
  border-radius: 0.5rem;
  padding: 1rem 1rem;
  min-height: 12rem;
  gap: 0;
  flex-direction: column;

  p {
    padding: 0rem;
    margin: ${({ theme }) => theme.spacing(2, 0)};
  }

  ${(props) =>
    props.is_drag_active &&
    css`
      border: 3px dashed ${props.theme.palette.info.light};
    `}
`;
