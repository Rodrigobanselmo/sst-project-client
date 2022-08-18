import { useMemo } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

export const STCalendarContainerBox = styled(Box)`
  * {
    &::-webkit-scrollbar {
      border-radius: 24px;
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.palette.grey[500]};
      border-radius: 24px;
    }
  }
  display: flex;
  flex-direction: column;
  flex: 1;
  max-height: 100%;
`;

export const STCalendarHeaderFlex = styled(SFlex)<{ today?: number }>`
  position: relative;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.gray[50]};
  border: 1px solid ${({ theme }) => theme.palette.gray[400]};
  border-radius: 10px 10px 0 0;
  ${(props) =>
    props.today &&
    css`
      background-color: ${props.theme.palette.secondary.light};

      .calendar_header_text {
        color: ${props.theme.palette.secondary.contrastText};
      }
    `};
`;

export const STCalendarTimesFlex = styled(SFlex)`
  border: 1px solid ${({ theme }) => theme.palette.grey[400]};
  border-top: none;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.grey[50]};
`;
