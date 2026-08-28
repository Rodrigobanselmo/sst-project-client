import { styled, Switch } from '@mui/material';

export const STSwitch = styled(Switch)`
  width: 28px;
  height: 16px;
  padding: 0;
  display: flex;

  &:active {
    & .MuiSwitch-thumb {
      width: 15px;
    }
    & .MuiSwitch-switchBase.Mui-checked {
      transform: translateX(9px);
    }
  }
  & .MuiSwitch-switchBase {
    padding: 2px;
    color: ${({ theme }) => theme.palette.primary.main};
    &.Mui-checked {
      transform: translateX(12px);
      color: ${({ theme }) => theme.palette.primary.contrastText};
      & + .MuiSwitch-track {
        opacity: 1;
        background-color: ${({ theme }) => theme.palette.primary.main};
        border-color: ${({ theme }) => theme.palette.primary.main};
      }
    }
  }

  & .MuiSwitch-thumb {
    box-shadow: 0 2px 4px 0 rgb(0 35 11 / 20%);
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background-color: currentColor;
    transition: width 0.2s;
  }
  & .MuiSwitch-track {
    border-radius: 8px;
    opacity: 1;
    background-color: ${({ theme }) => theme.palette.background.disabled};
    box-sizing: border-box;
    border: ${({ theme }) =>
      theme.palette.mode === 'light'
        ? `1px solid ${theme.palette.text.main}`
        : '1px solid transparent'};
  }
`;
