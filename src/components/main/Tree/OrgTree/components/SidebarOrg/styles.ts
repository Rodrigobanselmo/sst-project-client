import { Box, styled } from '@mui/material';
import { SInput } from 'components/atoms/SInput';

export const STBoxContainer = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.paper};
  width: 100%;
  max-height: 100%;
  z-index: ${({ theme }) => theme.mixins.sidebarTree};
  margin: ${(props) => props.theme.spacing(4, 8, 12, 1)};
  box-shadow: 1px 1px 3px 3px rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.spacing(3, 3, 12, 3)};
  position: relative;
  overflow: auto;

  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
  }
`;

export const STSInput = styled(SInput)`
  &&& .MuiInputBase-adornedEnd {
    padding-right: 2.2rem !important;
  }
`;

export const STBoxInput = styled(Box)`
  position: fixed;
  background-color: ${(props) => props.theme.palette.background.paper};
  width: ${(props) => props.theme.spacing(148)};
  z-index: 20;
  padding: ${(props) => props.theme.spacing(5)};
  padding-right: 0;
  border-radius: ${({ theme }) => theme.spacing(8)};
`;

export const STBoxStack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(3)};
  height: 100%;
  padding: ${(props) => props.theme.spacing(0, 5)};
  padding-bottom: ${(props) => props.theme.spacing(10)};
  min-height: ${(props) => props.theme.spacing(100)};
`;

export const STBoxItem = styled(Box)`
  border: 2px solid ${(props) => props.theme.palette.divider};
  background-color: ${(props) => props.theme.palette.background.box};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  padding: ${(props) => props.theme.spacing(2, 4)};
`;
