import { Box, styled } from '@mui/material';

export const STSTableHRow = styled(Box)<{ clickable?: boolean }>`
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  line-height: 17px;
  margin: -3px -5px;
  padding: 3px 5px;
  border-radius: 0.25rem;


  ${({ clickable }) => clickable && `
    gap: 0 3px;
    &:hover {
      cursor: pointer;
      background-color: #00000011; 
    }
  `}
`;
