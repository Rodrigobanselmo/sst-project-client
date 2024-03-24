import SDeleteIcon from 'assets/icons/SDeleteIcon';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { createAction, useRegisterActions } from 'kbar';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export const useKBarActions = () => {
  const history = useRouter();
  const initialActions = [
    // {
    //   id: 'employeeAdd',
    //   name: 'Home',
    //   shortcut: [],
    //   keywords: 'adicionar funcionários funcionarios empregados colaboradores',
    //   section: 'Navigation' + companyName,
    //   perform: () => history.push('/'),
    //   icon: <SDeleteIcon />,
    //   subtitle: 'Subtitles can help add more context.',
    // },
    // createAction({
    //   name: 'Github',
    //   keywords: 'sourcecode',
    //   section: 'Navigation',
    //   perform: () => window.open('https://github.com/timc1/kbar', '_blank'),
    // }),
  ];

  return { initialActions: initialActions };
};
