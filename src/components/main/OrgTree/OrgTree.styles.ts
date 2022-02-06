import styled from '@emotion/styled';

interface IHorizontal {
  horizontal: boolean;
}
export const OrgTreeContainer = styled.div<IHorizontal>`
  display: block;
  padding: 15px;
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 30px;

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  &::-webkit-scrollbar-track {
    width: 10px;
    height: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }

`;

export const OrgTree = styled.div<IHorizontal>`
  display: table;
  text-align: center;

  &:before,
  &:after {
    content: '';
    display: table;
  }

  &:after {
    clear: both;
  }
`;
