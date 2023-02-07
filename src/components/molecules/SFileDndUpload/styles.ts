import { css } from '@emotion/react';
import { styled } from '@mui/material';

export const STSFileUploaderContainer = styled('div')<{
  is_drag_active: number;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.palette.grey[50]};
  border-radius: 0.5rem;
  padding: 1rem 1rem;
  min-height: 10rem;
  gap: 0;
  flex-direction: column;
  cursor: pointer;

  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    filter: brightness(0.96);
  }
  &:active {
    filter: brightness(0.98);
  }

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
