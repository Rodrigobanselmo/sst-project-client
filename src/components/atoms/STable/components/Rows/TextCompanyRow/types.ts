/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { ICompany } from 'core/interfaces/api/ICompany';

import { TextIconRowProps } from '../TextIconRow/types';

export type TextCompanyRowProps = TextIconRowProps & {
  company?: ICompany;
};
