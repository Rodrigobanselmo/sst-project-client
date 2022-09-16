/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';

import { TextIconRowProps } from '../TextIconRow/types';

export type TextEmployeeRowProps = TextIconRowProps & {
  employee?: IEmployee;
};
