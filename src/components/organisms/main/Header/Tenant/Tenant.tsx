import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';

import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { brandNameConstant } from '../../../../../core/constants/brand.constant';
import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import { useLocation } from './hooks/useTenant';
import { IdsEnum } from 'core/enums/ids.enums';

export const STBox = styled(Box)`
  align-items: center;
  padding: 3px 7px;
  padding-right: 10px;
  -webkit-box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.05);
  background-color: ${(props) => props.theme.palette.background.paper};
  cursor: pointer;

  border-radius: 8px;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.grey[300]};

  &:hover {
    border-color: ${(props) => props.theme.palette.primary.main};
  }
`;

export function Tenant(): JSX.Element {
  const { isTablet } = useSidebarDrawer();
  const { companyName, onDropSelect } = useLocation();
  return (
    <STBox
      ml="auto"
      display={isTablet ? 'none' : 'flex'}
      onClick={() => onDropSelect?.()}
      id={IdsEnum.COMPANY_SELECT_NAVBAR}
    >
      <SArrowUpFilterIcon
        sx={{
          fontSize: '23px',
          mt: 0,
          mr: 1,
          transform: 'rotate(-180deg)',
        }}
      />
      <SText maxWidth={200} minWidth={150} lineNumber={1} fontSize={11}>
        {companyName}
      </SText>
    </STBox>
  );
}
