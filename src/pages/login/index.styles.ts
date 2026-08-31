import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const LOGIN_LIGHT_SURFACE = '#F7F8FA';

export const STPage = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: ${({ theme }) =>
    theme.palette.mode === 'light'
      ? LOGIN_LIGHT_SURFACE
      : theme.palette.background.default};
  color: ${({ theme }) => theme.palette.text.main};

  @supports (min-height: 100dvh) {
    min-height: 100dvh;
  }
`;

export const STMain = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;

  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    align-items: stretch;
  }
`;

export const STInstitutional = styled(Box)`
  display: none;
  flex-direction: column;
  order: 2;
  width: 100%;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(6, 8, 8)};

  ${({ theme }) => theme.breakpoints.up('sm')} {
    display: flex;
    padding: ${({ theme }) => theme.spacing(8, 12, 10)};
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    order: 0;
    width: 50%;
    padding: ${({ theme }) => theme.spacing(12, 10, 10, 12)};
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    width: 55%;
    padding: ${({ theme }) => theme.spacing(14, 12, 10, 18)};
  }
`;

export const STAuthColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  order: 1;
  width: 100%;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(8, 6, 6)};

  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: ${({ theme }) => theme.spacing(10, 12, 8)};
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 50%;
    padding: ${({ theme }) => theme.spacing(12, 10, 10)};
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    width: 45%;
    padding: ${({ theme }) => theme.spacing(14, 16, 10, 10)};
  }
`;
