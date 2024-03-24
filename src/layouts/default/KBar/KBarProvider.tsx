import {
  KBarResults,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarSearch,
  useMatches,
  ActionImpl,
  ActionId,
  KBarProvider as KBarProviderImpl,
  createAction,
} from 'kbar';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { CollectionsOutlined } from '@mui/icons-material';
import { useKBarActions } from './hooks/useKBarActions';
import { useCompanyRegisterActions } from './hooks/useCompanyRegisterActions';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { addEllipsisIfNeeded } from 'core/utils/helpers/addEllipsis';
import { KBarResultList } from './KBarResultList';

const searchStyle = {
  padding: '12px 0px',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
  outline: 'none',
  border: 'none',
  background: 'rgb(252 252 252)',
  color: 'rgb(28 28 29)',
};

const animatorStyle = {
  maxWidth: '600px',
  width: '100%',
  background: 'rgb(252 252 252)',
  color: 'rgb(28 28 29)',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0px 6px 20px rgb(0 0 0 / 20%)',
};

export const KBarProvider = ({ children }: { children: ReactNode }) => {
  const { initialActions } = useKBarActions();

  return (
    <KBarProviderImpl actions={initialActions}>
      <KBarContent />
      {children}
    </KBarProviderImpl>
  );
};

export const KBarContent = () => {
  const { data: company } = useQueryCompany();
  const companyName = getCompanyName(company);

  return (
    <KBarPortal>
      <KBarPositioner style={{ zIndex: 100001 }}>
        <KBarAnimator style={animatorStyle}>
          <SFlex px={8} gap={6}>
            <SText m={searchStyle.padding} whiteSpace="nowrap" fontWeight={500}>
              {addEllipsisIfNeeded(companyName, 20)}
            </SText>
            <SText sx={{ p: searchStyle.padding, color: 'grey.400' }}>/</SText>
            <KBarSearch style={searchStyle} placeholder="Pesquisar..." />
          </SFlex>
          <KBarResultList />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

export const KBarRegisterDashboard = () => {
  useCompanyRegisterActions();

  return <></>;
};
