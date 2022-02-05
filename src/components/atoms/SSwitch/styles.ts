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
    &.Mui-checked {
      transform: translateX(12px);
      color: ${({ theme }) => theme.palette.common.white};
      & + .MuiSwitch-track {
        opacity: 1;
        background-color: ${({ theme }) => theme.palette.primary.main};
      }
    }
  }

  & .MuiSwitch-thumb {
    box-shadow: 0 2px 4px 0 rgb(0 35 11 / 20%);
    width: 12px;
    height: 12px;
    border-radius: 6px;
    transition: width 0.2s;
  }
  & .MuiSwitch-track {
    border-radius: 8px;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.25);
    box-sizing: border-box;
  }
`;
