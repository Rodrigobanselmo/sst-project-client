import React, { FC } from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { queryClient } from 'core/services/queryClient';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { SHeaderTagProps } from './types';

export const SHeaderTag: FC<SHeaderTagProps> = ({ title, hideInitial }) => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  const company = companyId
    ? queryClient.getQueryData<ICompany>([QueryEnum.COMPANY, companyId])
    : null;

  const initials = company?.initials;
  const companyName = !initials && company ? getCompanyName(company) : '';

  return (
    <Head>
      <title>
        {!hideInitial && initials ? `(${initials}) ` : ''}
        {title}
        {!hideInitial && companyName ? ` (${companyName})` : ''}
      </title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
  );
};
